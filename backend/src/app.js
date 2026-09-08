/**
 * Express Application Setup - Nabha Telemedicine Backend
 * Configures middleware, security, routes, health diagnostic, and error handlers
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');

const env = require('./config/env');
const db = require('./config/database');
const logger = require('./utils/logger');
const { successResponse, errorResponse } = require('./utils/response');

const requestIdMiddleware = require('./middleware/requestId.middleware');
const { globalLimiter } = require('./middleware/rateLimit.middleware');
const { errorHandler, notFoundHandler } = require('./middleware/error.middleware');

// Route Imports
const authRoutes = require('./routes/auth.routes');
const patientRoutes = require('./routes/patient.routes');
const appointmentRoutes = require('./routes/appointment.routes');
const consultationRoutes = require('./routes/consultation.routes');
const prescriptionRoutes = require('./routes/prescription.routes');
const syncRoutes = require('./routes/sync.routes');
const aiRoutes = require('./routes/ai.routes');
const videoRoutes = require('./routes/video.routes');
const ivrRoutes = require('./routes/ivr.routes');
const adminRoutes = require('./routes/admin.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const notificationRoutes = require('./routes/notification.routes');
const specialistRoutes = require('./routes/specialist.routes');
const consultationRequestRoutes = require('./routes/consultationRequest.routes');

const openapiSpec = require('./docs/openapi.json');

const app = express();
// Nginx is the single trusted reverse proxy in the production container stack.
app.set('trust proxy', 1);

// Security Headers & CORS
app.use(helmet());
app.use(cors({
  origin: env.CORS_ORIGIN,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS']
}));

// Body Parsers & Request Context
app.use(express.json({ limit: '20mb' }));
app.use(express.urlencoded({ extended: true, limit: '2mb' }));
app.use(requestIdMiddleware);
app.use(globalLimiter);

// Diagnostic Health Endpoint (Outside /api/v1/)
app.get('/health', async (req, res) => {
  try {
    await db.checkHealth();
    return res.status(200).json({ success:true, status:'healthy', database:'connected', environment:env.NODE_ENV, timestamp:new Date().toISOString() });
  } catch (error) {
    return res.status(503).json({ success:false, status:'unhealthy', database:'disconnected', environment:env.NODE_ENV, timestamp:new Date().toISOString() });
  }
});

app.get('/ready', async (req,res)=>{try{await db.checkHealth();return res.status(200).json({success:true,ready:true})}catch(e){return res.status(503).json({success:false,ready:false})}});

// Interactive API Documentation Route (/api-docs)
app.get('/api-docs', (req, res) => {
  return res.json(openapiSpec);
});

// Versioned API Routes (/api/v1/)
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/patients', patientRoutes);
app.use('/api/v1/appointments', appointmentRoutes);
app.use('/api/v1/consultations', consultationRoutes);
app.use('/api/v1/prescriptions', prescriptionRoutes);
app.use('/api/v1/sync', syncRoutes);
app.use('/api/v1/ai', aiRoutes);
app.use('/api/v1/video', videoRoutes);
app.use('/api/v1/ivr', ivrRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/notifications', notificationRoutes);
app.use('/api/v1/specialists', specialistRoutes);
app.use('/api/v1/consultation-requests', consultationRequestRoutes);

// Root Versioned API Welcome
app.get('/api/v1', (req, res) => {
  return successResponse(res, {
    message: 'SIH25018 Nabha Telemedicine API v1 Active',
    endpoints: [
      '/api/v1/auth',
      '/api/v1/patients',
      '/api/v1/appointments',
      '/api/v1/consultations',
      '/api/v1/prescriptions',
      '/api/v1/sync',
      '/api/v1/ai',
      '/api/v1/video',
      '/api/v1/ivr',
      '/api/v1/admin'
    ],
    docs: '/api-docs'
  });
});

// 404 & Central Error Handling
app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
