const videoState = {
  socket: null,
  peer: null,
  localStream: null,
  roomId: null,
  started: false
};

function getSocketUrl() {
  const base = (window.CONFIG?.API_BASE_URL || '/api/v1').replace(/\/api\/v1$/, '').replace(/\/+$/, '');
  return base || window.location.origin;
}

function getAccessToken() {
  return sessionStorage.getItem(window.CONFIG?.STORAGE_KEYS?.AUTH_TOKEN || 'nabha_access_token') || '';
}

async function startVideoCall(consultationId) {
  if (!consultationId) return;
  if (!('RTCPeerConnection' in window) || !navigator.mediaDevices?.getUserMedia) {
    const status = document.getElementById('video-provider-status');
    if (status) {
      status.innerHTML = '<strong>WebRTC is not supported in this browser.</strong><div class="small-muted">Use a modern browser with camera access enabled.</div>';
    }
    return;
  }

  if (videoState.started && videoState.roomId === String(consultationId)) {
    return;
  }

  const localVideo = document.getElementById('localVideo');
  const remoteVideo = document.getElementById('remoteVideo');
  const callContainer = document.getElementById('video-call-container');
  if (!localVideo || !remoteVideo || !callContainer) return;

  const roomId = String(consultationId);
  const socket = io(getSocketUrl(), {
    transports: ['websocket'],
    auth: { token: getAccessToken() }
  });

  videoState.socket = socket;
  videoState.roomId = roomId;

  const peer = new RTCPeerConnection({
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  });
  videoState.peer = peer;

  const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
  videoState.localStream = stream;
  localVideo.srcObject = stream;
  stream.getTracks().forEach((track) => peer.addTrack(track, stream));

  peer.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  peer.onicecandidate = ({ candidate }) => {
    if (candidate) {
      socket.emit('ice-candidate', { consultationId: roomId, candidate });
    }
  };

  socket.on('connect', () => {
    socket.emit('join-room', { consultationId: roomId });
  });

  socket.on('room-state', ({ count }) => {
    const status = document.getElementById('video-provider-status');
    if (status) {
      status.innerHTML = `<strong>Secure call room active.</strong><div class="small-muted">${count >= 2 ? 'Both participants are connected.' : 'Waiting for the other participant to join...'}</div>`;
    }
  });

  socket.on('user-joined', async ({ socketId }) => {
    if (socketId === socket.id) return;
    const offer = await peer.createOffer();
    await peer.setLocalDescription(offer);
    socket.emit('offer', { consultationId: roomId, offer });
  });

  socket.on('offer', async ({ from, offer }) => {
    if (from === socket.id) return;
    await peer.setRemoteDescription(new RTCSessionDescription(offer));
    const answer = await peer.createAnswer();
    await peer.setLocalDescription(answer);
    socket.emit('answer', { consultationId: roomId, answer });
  });

  socket.on('answer', async ({ from, answer }) => {
    if (from === socket.id) return;
    await peer.setRemoteDescription(new RTCSessionDescription(answer));
  });

  socket.on('ice-candidate', async ({ from, candidate }) => {
    if (from === socket.id) return;
    try {
      await peer.addIceCandidate(new RTCIceCandidate(candidate));
    } catch (error) {
      console.warn('ICE candidate ignored', error);
    }
  });

  socket.on('connect_error', (error) => {
    const status = document.getElementById('video-provider-status');
    if (status) {
      status.innerHTML = '<strong>Video call connection failed.</strong><div class="small-muted">Please refresh and log in again.</div>';
    }
    console.error('Socket connection failed', error);
  });

  callContainer.classList.remove('hidden');
  document.getElementById('start-video-call').addEventListener('click', async () => {
    if (!videoState.started) {
      await startVideoCall(roomId);
    }
  }, { once: true });

  document.getElementById('leave-video-call').addEventListener('click', () => {
    socket.emit('leave-room', { consultationId: roomId });
    videoState.socket?.disconnect();
    videoState.peer?.close();
    if (videoState.localStream) {
      videoState.localStream.getTracks().forEach((track) => track.stop());
    }
    callContainer.classList.add('hidden');
    videoState.started = false;
  }, { once: true });

  videoState.started = true;
}

window.startVideoCall = startVideoCall;

if (document.readyState !== 'loading') {
  const startButton = document.getElementById('start-video-call');
  if (startButton) {
    startButton.addEventListener('click', async () => {
      const consultationId = document.getElementById('workspace-status')?.dataset?.consultationId;
      if (consultationId) await startVideoCall(consultationId);
    }, { once: true });
  }
}