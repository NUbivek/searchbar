export class NetworkMonitor {
  static requests = new Map();

  static startRequest(url, options) {
    const requestId = Math.random().toString(36).substring(7);
    this.requests.set(requestId, {
      url,
      options,
      startTime: Date.now(),
      status: 'pending'
    });
    return requestId;
  }

  static endRequest(requestId, response) {
    const request = this.requests.get(requestId);
    if (request) {
      request.endTime = Date.now();
      request.duration = request.endTime - request.startTime;
      request.status = response.status;
      request.ok = response.ok;
      if (!response.ok) {
        request.error = `HTTP ${response.status}`;
      }
    }
  }

  static getStats() {
    return Array.from(this.requests.values());
  }
} 