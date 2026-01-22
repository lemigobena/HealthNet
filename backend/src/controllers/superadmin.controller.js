const superAdminService = require('../services/superadmin.service');
const { successResponse, errorResponse } = require('../utils/response');

// Create Facility
async function createFacility(req, res, next) {
    try {
        const facility = await superAdminService.createFacility(req.body);
        return successResponse(res, facility, 'Facility created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Create Hospital Admin
async function createHospitalAdmin(req, res, next) {
    try {
        // req.user is the Super Admin
        const admin = await superAdminService.createHospitalAdmin(req.body, req.user.user_id);
        return successResponse(res, admin, 'Hospital Admin created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Get All Facilities
async function getAllFacilities(req, res, next) {
    try {
        const facilities = await superAdminService.getAllFacilities();
        return successResponse(res, facilities, 'Facilities retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get Facility Details
async function getFacilityById(req, res, next) {
    try {
        const { id } = req.params;
        const facility = await superAdminService.getFacilityById(id);
        if (!facility) return errorResponse(res, 'Facility not found', 404);
        return successResponse(res, facility, 'Facility details retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get All Users
async function getAllUsers(req, res, next) {
    try {
        const users = await superAdminService.getAllUsers(req.query);
        return successResponse(res, users, 'Users retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get Single User
async function getUserById(req, res, next) {
    try {
        const { userId } = req.params;
        const user = await superAdminService.getUserById(userId);
        return successResponse(res, user, 'User retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Suspend User
async function suspendUser(req, res, next) {
    try {
        const { userId } = req.params;
        const { status } = req.body; // 'ACTIVE' or 'INACTIVE'
        const result = await superAdminService.suspendUser(userId, status, req.user.user_id);
        return successResponse(res, result, 'User status updated successfully');
    } catch (error) {
        next(error);
    }
}

// Dashboard Stats
async function getDashboardStats(req, res, next) {
    try {
        const stats = await superAdminService.getDashboardStats();
        return successResponse(res, stats, 'Dashboard stats retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get Audit Logs
async function getSystemAuditLogs(req, res, next) {
    try {
        const logs = await superAdminService.getSystemAuditLogs(req.query);
        return successResponse(res, logs, 'Audit logs retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get Facility Doctors
async function getFacilityDoctors(req, res, next) {
    try {
        const { id } = req.params;
        const doctors = await superAdminService.getFacilityDoctors(id);
        return successResponse(res, doctors, 'Doctors retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get Facility Diagnoses
async function getFacilityDiagnoses(req, res, next) {
    try {
        const { id } = req.params;
        const diagnoses = await superAdminService.getFacilityDiagnoses(id);
        return successResponse(res, diagnoses, 'Diagnoses retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get Facility Lab Results
async function getFacilityLabResults(req, res, next) {
    try {
        const { id } = req.params;
        const results = await superAdminService.getFacilityLabResults(id);
        return successResponse(res, results, 'Lab results retrieved successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createFacility,
    createHospitalAdmin,
    getAllFacilities,
    getFacilityById,
    getAllUsers,
    suspendUser,
    getDashboardStats,
    getFacilityDoctors,
    getFacilityDiagnoses,
    getFacilityLabResults
};
