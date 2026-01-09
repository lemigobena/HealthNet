
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../utils/constants');

router.use(authenticate, requireRole(USER_ROLES.ADMIN));

// Patient management
router.post('/patients', adminController.createPatient);
router.get('/patients', adminController.getAllPatients);

// Doctor management
router.post('/doctors', adminController.createDoctor);
router.get('/doctors', adminController.getAllDoctors);

// Single User Retrieval & Updates
router.get('/patients/:id', adminController.getPatientById);
router.patch('/patients/:id', adminController.updatePatient);
router.patch('/patients/:id/status', adminController.updatePatientStatus);
router.patch('/patients/:id/password', adminController.updatePatientPassword);

router.get('/doctors/:id', adminController.getDoctorById);
router.patch('/doctors/:id', adminController.updateDoctor);
router.patch('/doctors/:id/status', adminController.updateDoctorStatus);
router.patch('/doctors/:id/password', adminController.updateDoctorPassword);
router.patch('/doctors/:id/facility', adminController.updateDoctorFacility);

// User profile updates(I dont know why I added it but it might be of use.)
router.patch('/users/:userId', adminController.updateUserProfile);
router.patch('/users/:userId/status', adminController.updateUserStatus);

// Assignment management
router.post('/assignments', adminController.createAssignment);
router.get('/assignments', adminController.getAllAssignments);
router.delete('/assignments/:assignmentId', adminController.deleteAssignment);

module.exports = router;
