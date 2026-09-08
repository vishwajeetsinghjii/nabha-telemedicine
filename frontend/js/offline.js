/**
 * Connectivity Manager - Nabha Telemedicine Platform
 * Monitors network online status, backend health checks, ping latency, and connection quality
 */

class ConnectivityManager {
  constructor() {
    this.status = navigator.onLine ? 'ONLINE' : 'OFFLINE';
    this.networkQuality = navigator.onLine ? 'GOOD' : 'OFFLINE';
    this.checkInterval = 15000; // 15 seconds
    this.timer = null;
    this.init();
  }

  init() {
    window.addEventListener('online', () => this.handleNetworkChange(true));
    window.addEventListener('offline', () => this.handleNetworkChange(false));
    this.startHealthCheck();
  }

  async handleNetworkChange(isOnline) {
    if (!isOnline) {
      this.status = 'OFFLINE';
      this.networkQuality = 'OFFLINE';
      this.notifyListeners();
      return;
    }

    // Double check with ping
    await this.checkBackendHealth();
  }

  async checkBackendHealth() {
    if (!navigator.onLine) {
      this.status = 'OFFLINE';
      this.networkQuality = 'OFFLINE';
      this.notifyListeners();
      return false;
    }

    const startTime = performance.now();
    try {
      // If mock API is enabled, simulate fast local health check
      if (CONFIG.USE_MOCK_API) {
        this.status = 'ONLINE';
        this.networkQuality = 'GOOD';
        this.notifyListeners();
        return true;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);

      const response = await fetch(`/health`, {
        method: 'GET',
        signal: controller.signal
      });
      clearTimeout(timeoutId);

      const duration = performance.now() - startTime;

      if (response.ok) {
        this.status = 'ONLINE';
        this.networkQuality = duration < 800 ? 'GOOD' : 'LIMITED';
      } else {
        this.status = 'DEGRADED';
        this.networkQuality = 'POOR';
      }
    } catch (err) {
      // Server timed out or unreachable
      console.warn('[Connectivity] Health check ping failed or timed out:', err);
      this.status = 'DEGRADED';
      this.networkQuality = 'POOR';
    }

    this.notifyListeners();
    return this.status === 'ONLINE';
  }

  startHealthCheck() {
    if (this.timer) clearInterval(this.timer);
    this.timer = setInterval(() => this.checkBackendHealth(), this.checkInterval);
  }

  notifyListeners() {
    ui.updateConnectivityStatus(this.status);
    window.dispatchEvent(new CustomEvent('connectivityChanged', {
      detail: { status: this.status, quality: this.networkQuality }
    }));
  }

  getStatus() { return this.status; }
  isOnline() { return this.status === 'ONLINE'; }
  isOffline() { return this.status === 'OFFLINE'; }
  getNetworkQuality() { return this.networkQuality; }
}

const offline = new ConnectivityManager();
