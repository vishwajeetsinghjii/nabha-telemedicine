require('dotenv').config();
/**
 * Server Entry Point - Nabha Telemedicine Backend
 * Launches HTTP listener with graceful shutdown handling for SIGTERM/SIGINT
 */

const { Server } = require('socket.io');
const app = require('./app');
const env = require('./config/env');
const db = require('./config/database');
const logger = require('./utils/logger');
const { verifyAccessToken } = require('./utils/jwt');
const consultationRepository = require('./repositories/consultation.repository');
const patientRepository = require('./repositories/patient.repository');

const server = app.listen(env.PORT, env.HOST, () => {
  logger.info(`[Nabha Backend] Server running on http://${env.HOST}:${env.PORT} in ${env.NODE_ENV} mode.`);
});

const io = new Server(server, {
  cors: {
    origin: env.CORS_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST']
  }
});
app.locals.io = io;

io.use((socket, next) => {
  const authHeader = socket.handshake.headers.authorization || '';
  const token = socket.handshake.auth?.token || (authHeader.startsWith('Bearer ') ? authHeader.slice(7) : '');
  if (!token) return next(new Error('AUTH_REQUIRED'));
  try {
    const payload = verifyAccessToken(token);
    socket.data.user = { id: payload.sub, role: payload.role };
    return next();
  } catch (error) {
    return next(new Error('INVALID_TOKEN'));
  }
});

io.on('connection', (socket) => {
  socket.on('join-room', async ({ consultationId }) => {
    if (!consultationId) return socket.emit('video-error', { code: 'CONSULTATION_REQUIRED', message: 'Consultation ID is required.' });
    try {
      const consultation = await consultationRepository.findById(consultationId);
      if (!consultation) return socket.emit('video-error', { code: 'CONSULTATION_NOT_FOUND', message: 'Consultation not found.' });
      const userId = socket.data.user?.id;
      const accepted =
        socket.data.user?.role === 'ADMIN' ||
        (socket.data.user?.role === 'DOCTOR' && consultation.doctorId === userId) ||
        (socket.data.user?.role === 'ASHA' && consultation.ashaId === userId) ||
        (socket.data.user?.role === 'PATIENT' && (await patientRepository.findByUserId(userId))?.id === consultation.patientId);
      if (!accepted) return socket.emit('video-error', { code: 'VIDEO_ACCESS_DENIED', message: 'You are not authorized to join this consultation room.' });
      const room = `consultation:${consultationId}`;
      socket.join(room);
      const members = io.sockets.adapter.rooms.get(room)?.size || 0;
      socket.emit('room-state', { room, count: members });
      socket.to(room).emit('user-joined', { socketId: socket.id, count: members });
    } catch (error) {
      logger.error('[Socket] join-room failed', { error: error.message });
      socket.emit('video-error', { code: 'VIDEO_ROOM_ERROR', message: 'Unable to join the consultation room.' });
    }
  });

  socket.on('offer', ({ consultationId, offer }) => {
    if (!consultationId || !offer) return;
    socket.to(`consultation:${consultationId}`).emit('offer', { from: socket.id, offer });
  });

  socket.on('answer', ({ consultationId, answer }) => {
    if (!consultationId || !answer) return;
    socket.to(`consultation:${consultationId}`).emit('answer', { from: socket.id, answer });
  });

  socket.on('ice-candidate', ({ consultationId, candidate }) => {
    if (!consultationId || !candidate) return;
    socket.to(`consultation:${consultationId}`).emit('ice-candidate', { from: socket.id, candidate });
  });

  socket.on('leave-room', ({ consultationId }) => {
    if (!consultationId) return;
    socket.leave(`consultation:${consultationId}`);
  });

  socket.on('disconnect', () => {
    logger.info(`[Socket] Client disconnected: ${socket.id}`);
  });
});

// Graceful Shutdown Manager
let isShuttingDown = false;

async function shutdown(signal) {
  if (isShuttingDown) return;
  isShuttingDown = true;

  logger.info(`[Shutdown] Received ${signal}. Starting graceful shutdown...`);

  // Force exit after 10 seconds if shutdown hangs
  const forceExitTimeout = setTimeout(() => {
    logger.error('[Shutdown] Forced exit due to timeout.');
    process.exit(1);
  }, 10000);

  server.close(async () => {
    logger.info('[Shutdown] HTTP server closed.');
    await db.close();
    clearTimeout(forceExitTimeout);
    logger.info('[Shutdown] Graceful shutdown completed cleanly.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));

process.on('unhandledRejection', (reason) => {
  logger.error('[Unhandled Rejection]', { reason });
});

process.on('uncaughtException', (error) => {
  logger.error('[Uncaught Exception]', { error: error.message, stack: error.stack });
  shutdown('UNCAUGHT_EXCEPTION');
});
