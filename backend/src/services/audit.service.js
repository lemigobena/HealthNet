
const { prisma } = require('../config/db');
const { v4: uuidv4 } = require('uuid');

// Log an action to the AuditLog table

async function logAction({ userId, actionType, entityType, entityId, oldValues, newValues, description, req }) {
    try {
        await prisma.auditLog.create({
            data: {
                user_id: userId,
                action_type: actionType,
                entity_type: entityType,
                entity_id: entityId,
                old_values: oldValues ? JSON.stringify(oldValues) : null,
                new_values: newValues ? JSON.stringify(newValues) : null,
                description: description,
                ip_address: req ? (req.ip || req.connection.remoteAddress) : null,
                user_agent: req ? req.headers['user-agent'] : null
            }
        });
    } catch (error) {
        console.error('Audit Log Error:', error);
    }
}

module.exports = {
    logAction
};
