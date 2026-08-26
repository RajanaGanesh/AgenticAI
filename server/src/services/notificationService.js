const mongoose = require('mongoose');
const Notification = require('../models/Notification');
const { emitNotification } = require('../config/socket');
const memoryStore = require('../utils/memoryStore');

class NotificationService {
  isMongooseActive() {
    return mongoose.connection.readyState === 1;
  }

  async createNotification({ owner, workflowId = null, executionId = null, type = 'info', title, message, link = '' }) {
    let notification;
    if (this.isMongooseActive()) {
      notification = await Notification.create({
        owner,
        workflowId,
        executionId,
        type,
        title,
        message,
        link,
      });
    } else {
      notification = await memoryStore.createNotification({
        owner,
        workflowId,
        executionId,
        type,
        title,
        message,
        link,
      });
    }

    emitNotification(owner ? owner.toString() : 'demo', notification);
    return notification;
  }

  async getUserNotifications(userId, limit = 20) {
    if (this.isMongooseActive()) {
      return Notification.find({ owner: userId }).sort({ createdAt: -1 }).limit(limit);
    } else {
      return memoryStore.getNotifications(userId, limit);
    }
  }

  async markAsRead(notificationId, userId) {
    if (this.isMongooseActive()) {
      return Notification.findOneAndUpdate({ _id: notificationId, owner: userId }, { isRead: true }, { new: true });
    } else {
      return memoryStore.markNotificationRead(notificationId, userId);
    }
  }

  async markAllAsRead(userId) {
    if (this.isMongooseActive()) {
      return Notification.updateMany({ owner: userId, isRead: false }, { isRead: true });
    } else {
      return memoryStore.markAllNotificationsRead(userId);
    }
  }

  async getUnreadCount(userId) {
    if (this.isMongooseActive()) {
      return Notification.countDocuments({ owner: userId, isRead: false });
    } else {
      return memoryStore.getUnreadNotificationCount(userId);
    }
  }
}

module.exports = new NotificationService();
