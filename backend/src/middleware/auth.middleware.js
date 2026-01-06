

const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const { prisma } = require('../config/db');
const { USER_ROLES, DOCTOR_TYPES } = require('../utils/constants');

// Verify JWT token

async function authenticate(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (!token) {
            return errorResponse(res, 'No token provided', 401);
        }

        const decoded = verifyToken(token);

        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            include: {
                admin_profile: true,
                doctor_profile: true,
                patient_profile: true
            }
        });

        if (!user) {
            return errorResponse(res, 'User not found', 401);
        }

        if (decoded.version !== user.token_version) {
            return errorResponse(res, 'Session expired. Please login again.', 401);
        }

        if (user.role === USER_ROLES.DOCTOR && user.doctor_profile?.status === 'INACTIVE') {
            return errorResponse(res, 'Your account has been suspended', 403);
        }

        if (user.role === USER_ROLES.PATIENT && user.patient_profile?.status === 'INACTIVE') {
            return errorResponse(res, 'Your account has been suspended', 403);
        }

        req.user = user;
        next();
    } catch (error) {
        return errorResponse(res, 'Invalid or expired token', 401);
    }
}

// Require specific roles

function requireRole(...roles) {
    return (req, res, next) => {
        if (!req.user) {
            return errorResponse(res, 'Unauthorized', 401);
        }

        if (!roles.includes(req.user.role)) {
            return errorResponse(res, 'Access denied. Insufficient permissions.', 403);
        }

        next();
    };
}

// Require MEDICAL_DOCTOR 

function requireMedicalDoctor(req, res, next) {
    if (!req.user || req.user.role !== USER_ROLES.DOCTOR) {
        return errorResponse(res, 'Only doctors can access this resource', 403);
    }

    if (req.user.doctor_profile?.type !== DOCTOR_TYPES.MEDICAL_DOCTOR) {
        return errorResponse(res, 'Only Medical Doctors can perform this action', 403);
    }

    next();
}

// Require LAB_TECHNICIAN 

function requireLabTechnician(req, res, next) {
    if (!req.user || req.user.role !== USER_ROLES.DOCTOR) {
        return errorResponse(res, 'Only doctors can access this resource', 403);
    }

    if (req.user.doctor_profile?.type !== DOCTOR_TYPES.LAB_TECHNICIAN) {
        return errorResponse(res, 'Only Lab Technicians can perform this action', 403);
    }

    next();
}


async function optionalAuth(req, res, next) {
    try {
        const token = req.headers.authorization?.replace('Bearer ', '');

        if (token) {
            const decoded = verifyToken(token);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                include: {
                    admin_profile: true,
                    doctor_profile: true,
                    patient_profile: true
                }
            });

            if (user) {
                req.user = user;
            }
        }

        next();
    } catch (error) {
        next();
    }
}

module.exports = {
    authenticate,
    requireRole,
    requireMedicalDoctor,
    requireLabTechnician,
    optionalAuth
};
