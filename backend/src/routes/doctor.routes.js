
const express = require('express');
const router = express.Router();
const doctorController = require('../controllers/doctor.controller');
const { authenticate, requireRole, requireMedicalDoctor, requireLabTechnician } = require('../middleware/auth.middleware');
const { upload } = require('../middleware/upload.middleware');
const { USER_ROLES } = require('../utils/constants');


router.use(authenticate, requireRole(USER_ROLES.DOCTOR));

// Patient management
router.get('/patients', doctorController.getAssignedPatients);
router.get('/patients/:patientId', doctorController.getPatientById);
router.get('/patients/:patientId/records', doctorController.getPatientRecords);
router.get('/patients/:patientId/appointments', doctorController.getPatientAppointments);
router.post('/patients/:patientId/allergies', doctorController.addAllergy);
router.get('/patients/:patientId/allergies', doctorController.getPatientAllergies);
router.patch('/patients/:patientId/medical-info', requireMedicalDoctor, doctorController.updatePatientMedicalInfo);

// Diagnosis
router.get('/diagnoses', doctorController.getAllDiagnoses);
router.get('/patients/:patientId/diagnoses', doctorController.getDiagnosesByPatient);
router.post('/patients/:patientId/diagnoses', requireMedicalDoctor, doctorController.createDiagnosis);
router.get('/diagnoses/:diagnosisId', doctorController.getDiagnosisById);
router.patch('/diagnoses/:diagnosisId', requireMedicalDoctor, doctorController.updateDiagnosis);
router.patch('/diagnoses/:diagnosisId/complete', requireMedicalDoctor, doctorController.completeDiagnosis);

// Lab results 
router.get('/lab-results', doctorController.getAllLabResults);
router.get('/patients/:patientId/lab-results', doctorController.getLabResultsByPatient);
router.post('/patients/:patientId/lab-results', upload.single('file'), doctorController.createLabResult);
router.get('/lab-results/:labId', doctorController.getLabResultById);

// Appointments
router.get('/appointments', doctorController.getMyAppointments);
router.get('/appointments/:appointmentId', doctorController.getAppointmentById);
router.post('/appointments', doctorController.createAppointment);
router.patch('/appointments/:appointmentId/reschedule', doctorController.rescheduleAppointment);
router.patch('/appointments/:appointmentId/complete', doctorController.completeAppointment);

module.exports = router;
