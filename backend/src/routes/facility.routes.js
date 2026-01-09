
const express = require('express');
const router = express.Router();
const facilityController = require('../controllers/facility.controller');
const { authenticate } = require('../middleware/auth.middleware');

// Protected routes - require authentication
router.get('/', authenticate, facilityController.getAllFacilities);

module.exports = router;
