
const express = require('express');
const router = express.Router();
const patientController = require('../controllers/patient.controller');
const { authenticate, requireRole } = require('../middleware/auth.middleware');
const { USER_ROLES } = require('../utils/constants');


router.use(authenticate, requireRole(USER_ROLES.PATIENT));

// Diagnoses
router.get('/diagnoses', patientController.getMyDiagnoses);
router.get('/diagnoses/:diagnosisId', patientController.getDiagnosisById);

// Lab results
router.get('/lab-results', patientController.getMyLabResults);
router.get('/lab-results/:labId', patientController.getLabResultById);

// Emergency info
router.get('/emergency-info', patientController.getEmergencyInfo);
router.put('/emergency-info', patientController.updateEmergencyInfo);
router.post('/emergency-info', patientController.updateEmergencyInfo); // Allow POST for "adding" new info

// Assigned doctors
router.get('/doctors', patientController.getAssignedDoctors);
router.get('/doctors/:id', patientController.getAssignedDoctorById);

// Appointments
router.get('/appointments', patientController.getMyAppointments);
router.get('/appointments/:appointmentId', patientController.getAppointmentById);

// Visibility and management
router.patch('/diagnoses/:diagnosisId/visibility', patientController.toggleDiagnosisVisibility);
router.patch('/lab-results/:labId/visibility', patientController.toggleLabResultVisibility);
router.patch('/medical-info/visibility', patientController.toggleMedicalInfoVisibility);

// Allergies management
router.post('/allergies', patientController.addAllergy);
router.patch('/allergies/:allergyId/visibility', patientController.toggleAllergyVisibility);
router.delete('/allergies/:allergyId', patientController.deleteAllergy);

// Profile
router.patch('/profile', patientController.updateProfile);

module.exports = router;
