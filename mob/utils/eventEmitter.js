// Simple event emitter for app-wide events
class EventEmitter {
  constructor() {
    this.events = {};
  }

  on(event, listener) {
    if (!this.events[event]) {
      this.events[event] = [];
    }
    this.events[event].push(listener);
    
    // Return unsubscribe function
    return () => {
      this.events[event] = this.events[event].filter(l => l !== listener);
    };
  }

  emit(event, data) {
    if (!this.events[event]) return;
    this.events[event].forEach(listener => listener(data));
  }

  removeAllListeners(event) {
    if (event) {
      delete this.events[event];
    } else {
      this.events = {};
    }
  }
}

export const appEvents = new EventEmitter();

// Event constants
export const AUTH_EVENTS = {
  TOKEN_EXPIRED: 'auth:token_expired',
  LOGIN_REQUIRED: 'auth:login_required',
  TOKEN_REFRESHED: 'auth:token_refreshed'
};