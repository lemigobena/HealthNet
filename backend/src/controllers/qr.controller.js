
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

// Public Redirect (for QR codes)
async function qrRedirect(req, res, next) {
    try {
        const { patientId } = req.params;
        const frontendUrl = process.env.FRONTEND_URL || 'https://health-net-seven.vercel.app';
        console.log(`Redirecting patient ${patientId} to: ${frontendUrl}`);
        return res.redirect(`${frontendUrl}/emergency/${patientId}`);
    } catch (error) {
        next(error);
    }
}

// Public Token Redirect (Secure)
async function qrTokenRedirect(req, res, next) {
    try {
        const { token } = req.params;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const userAgent = req.headers['user-agent'];

        // Validate token and log scan via service
        // We pass null for userId since this is a public scan redirect
        const result = await qrService.scanQRCode(token, null, ipAddress, userAgent);

        const frontendUrl = process.env.FRONTEND_URL || 'https://health-net-seven.vercel.app';
        console.log(`Valid token. Redirecting to: ${frontendUrl}/emergency/${result.patient.patient_id}`);
        return res.redirect(`${frontendUrl}/emergency/${result.patient.patient_id}`);
    } catch (error) {
        // If token is invalid/expired, service throws error. We catch it here.
        // Redirect to a frontend error page or just show JSON error if preferred.
        // For better UX, maybe redirect with usage query param?
        // next(error) will show JSON error. Let's stick to that for now or redirect to 404.
        next(error);
    }
}

module.exports = {
    generateQRCode,
    scanQRCode,
    getMyQRCodes,
    getScanHistory,
    emergencySearch,
    qrRedirect,
    qrTokenRedirect
};
