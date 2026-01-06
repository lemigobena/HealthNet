
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

// Register a file in the FileStorage table

async function registerFile({ fileName, filePath, fileUrl, fileSize, mimeType, entityType, entityId, uploadedBy, isPublic = false }) {
    try {
        const fileId = `FILE-${uuidv4().split('-')[0].toUpperCase()}-${Date.now().toString().slice(-4)}`;

        const storedFile = await prisma.fileStorage.create({
            data: {
                file_id: fileId,
                file_name: fileName,
                file_path: filePath,
                file_url: fileUrl,
                file_size: fileSize,
                mime_type: mimeType,
                entity_type: entityType,
                entity_id: entityId,
                uploaded_by: uploadedBy,
                is_public: isPublic
            }
        });

        return storedFile;
    } catch (error) {
        console.error('File Storage Error:', error);
        throw error;
    }
}

module.exports = {
    logAction,
    registerFile
};
