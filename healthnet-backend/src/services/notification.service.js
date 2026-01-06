
const { prisma } = require('../config/db');

/**
 * Create a notification for a user
 */
async function createNotification(userId, type, title, message) {
    return prisma.notification.create({
        data: {
            user_id: userId,
            type,
            title,
            message
        }
    });
}

/**
 * Get notifications for a user
 */
async function getNotifications(userId) {
    return prisma.notification.findMany({
        where: { user_id: userId },
        orderBy: { created_at: 'desc' },
        take: 50
    });
}

/**
 * Mark notification as read
 */
async function markAsRead(notificationId, userId) {
    return prisma.notification.updateMany({
        where: {
            id: parseInt(notificationId),
            user_id: userId
        },
        data: { is_read: true }
    });
}

/**
 * Notify all assigned doctors of a patient about a new event
 * Filtered by doctor type if needed
 */
async function notifyAssignedDoctors(patientId, type, title, message, doctorTypeFilter = null) {
    const assignments = await prisma.assignment.findMany({
        where: {
            patient_id: patientId,
            end_date: null
        },
        include: {
            doctor: true
        }
    });

    const notifications = [];
    for (const assignment of assignments) {
        if (!doctorTypeFilter || assignment.doctor.type === doctorTypeFilter) {
            notifications.push(
                createNotification(assignment.doctor.user_id, type, title, message)
            );
        }
    }

    return Promise.all(notifications);
}

module.exports = {
    createNotification,
    getNotifications,
    markAsRead,
    notifyAssignedDoctors
};
