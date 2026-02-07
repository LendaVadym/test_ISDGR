/**
 * Notification Service
 * Handles system notifications and alerts
 */

class NotificationService {
  constructor() {
    this.notifications = [];
    this.listeners = [];
  }

  notify(message, type = 'info', priority = 'normal') {
    const notification = {
      id: this.generateId(),
      message,
      type, // 'info', 'warning', 'error', 'success'
      priority, // 'low', 'normal', 'high', 'critical'
      timestamp: Date.now(),
      read: false,
    };

    this.notifications.push(notification);
    this.broadcast(notification);
    return notification;
  }

  generateId() {
    return `notif_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  getNotifications(filter = {}) {
    return this.notifications.filter(n => {
      if (filter.type && n.type !== filter.type) return false;
      if (filter.priority && n.priority !== filter.priority) return false;
      if (filter.read !== undefined && n.read !== filter.read) return false;
      return true;
    });
  }

  markAsRead(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (notif) notif.read = true;
  }

  subscribe(listener) {
    this.listeners.push(listener);
  }

  broadcast(notification) {
    this.listeners.forEach(listener => listener(notification));
  }

  clear() {
    this.notifications = [];
  }
}

module.exports = NotificationService;
