
const express = require('express');
const router = express.Router();
const qrController = require('../controllers/qr.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../utils/constants');

// Generate QR code
router.post('/generate', authenticate, requireRole(USER_ROLES.PATIENT), qrController.generateQRCode);

// Get my QR codes
router.get('/my-codes', authenticate, requireRole(USER_ROLES.PATIENT), qrController.getMyQRCodes);

// Get scan history
router.get('/scan-history', authenticate, requireRole(USER_ROLES.PATIENT), qrController.getScanHistory);

// Scan QR code
router.get('/scan/:token', qrController.scanQRCode);

// Public Emergency Search
router.get('/emergency-search/:patientId', qrController.emergencySearch);

// Public Redirect (for QR codes)
router.get('/v/:patientId', qrController.qrRedirect);

module.exports = router;
