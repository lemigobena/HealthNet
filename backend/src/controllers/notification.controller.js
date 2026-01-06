
const notificationService = require('../services/notification.service');
const { successResponse } = require('../utils/response');

async function getMyNotifications(req, res, next) {
    try {
        const notifications = await notificationService.getNotifications(req.user.user_id);
        return successResponse(res, notifications, 'Notifications retrieved successfully');
    } catch (error) {
        next(error);
    }
}

async function markNotificationRead(req, res, next) {
    try {
        const { id } = req.params;
        await notificationService.markAsRead(id, req.user.user_id);
        return successResponse(res, null, 'Notification marked as read');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyNotifications,
    markNotificationRead
};
