const notificationService = require('../services/notificationService');
const ApiResponse = require('../utils/apiResponse');

class NotificationController {
  async listNotifications(req, res, next) {
    try {
      const { limit = 20 } = req.query;
      const notifications = await notificationService.getUserNotifications(req.user.id, parseInt(limit, 10));
      const unreadCount = await notificationService.getUnreadCount(req.user.id);
      return ApiResponse.success(res, { notifications, unreadCount }, 'Notifications retrieved');
    } catch (err) {
      next(err);
    }
  }

  async markAsRead(req, res, next) {
    try {
      const notification = await notificationService.markAsRead(req.params.id, req.user.id);
      return ApiResponse.success(res, notification, 'Notification marked as read');
    } catch (err) {
      next(err);
    }
  }

  async markAllAsRead(req, res, next) {
    try {
      await notificationService.markAllAsRead(req.user.id);
      return ApiResponse.success(res, null, 'All notifications marked as read');
    } catch (err) {
      next(err);
    }
  }
}

module.exports = new NotificationController();
