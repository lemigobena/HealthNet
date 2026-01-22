const express = require('express');
const router = express.Router();
const superAdminController = require('../controllers/superadmin.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../utils/constants');

// Define SUPER_ADMIN constant if not yet in constants
const SUPER_ADMIN_ROLE = 'SUPER_ADMIN';

router.use(authenticate, requireRole(SUPER_ADMIN_ROLE));

// Dashboard
router.get('/dashboard/stats', superAdminController.getDashboardStats);

// Facilities
router.post('/facilities', superAdminController.createFacility);
router.get('/facilities', superAdminController.getAllFacilities);
router.get('/facilities/:id', superAdminController.getFacilityById);

// Admins
router.post('/admins', superAdminController.createHospitalAdmin);

// Users (Global)
router.get('/users', superAdminController.getAllUsers);
router.patch('/users/:userId/status', superAdminController.suspendUser);

module.exports = router;
