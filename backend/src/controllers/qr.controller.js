
const qrService = require('../services/qr.service');
const { successResponse } = require('../utils/response');

// Generate QR code
async function generateQRCode(req, res, next) {
    try {
        const qrCode = await qrService.generateQRCode(req.user.patient_profile.patient_id);
        return successResponse(res, qrCode, 'QR code generated successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Scan QR code 
async function scanQRCode(req, res, next) {
    try {
        const { token } = req.params;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];
        const userId = req.user ? req.user.user_id : null;

        const emergencyData = await qrService.scanQRCode(token, userId, ipAddress, userAgent);
        return successResponse(res, emergencyData, 'QR code scanned successfully');
    } catch (error) {
        next(error);
    }
}

// Get my QR codes 
async function getMyQRCodes(req, res, next) {
    try {
        const qrCodes = await qrService.getMyQRCodes(req.user.patient_profile.patient_id);
        return successResponse(res, qrCodes, 'QR codes retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get scan history
async function getScanHistory(req, res, next) {
    try {
        const scans = await qrService.getScanHistory(req.user.patient_profile.patient_id);
        return successResponse(res, scans, 'Scan history retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Public Emergency Search
async function emergencySearch(req, res, next) {
    try {
        const { patientId } = req.params;
        const emergencyData = await qrService.searchEmergencyData(patientId);
        return successResponse(res, emergencyData, 'Emergency data retrieved successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    generateQRCode,
    scanQRCode,
    getMyQRCodes,
    getScanHistory,
    emergencySearch
};
