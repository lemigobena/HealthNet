
const doctorService = require('../services/doctor.service');
const auditService = require('../services/audit.service');
const { successResponse, errorResponse } = require('../utils/response');

// Get assigned patients
async function getAssignedPatients(req, res, next) {
    try {
        const patients = await doctorService.getAssignedPatients(req.user.doctor_profile.doctor_id);
        return successResponse(res, patients, 'Assigned patients retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get patient records
async function getPatientRecords(req, res, next) {
    try {
        const { patientId } = req.params;
        const records = await doctorService.getPatientRecords(req.user.doctor_profile.doctor_id, patientId);
        return successResponse(res, records, 'Patient records retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Create diagnosis
async function createDiagnosis(req, res, next) {
    try {
        const { patientId } = req.params;
        const { disease_name, symptoms } = req.body;
        if (!disease_name || !symptoms) {
            return errorResponse(res, 'disease_name and symptoms are required', 400);
        }
        const diagnosis = await doctorService.createDiagnosis(req.user.doctor_profile, patientId, req.body);
        return successResponse(res, diagnosis, 'Diagnosis created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Update diagnosis
async function updateDiagnosis(req, res, next) {
    try {
        const { diagnosisId } = req.params;
        const diagnosis = await doctorService.updateDiagnosis(req.user.doctor_profile, diagnosisId, req.body);
        return successResponse(res, diagnosis, 'Diagnosis record updated successfully');
    } catch (error) {
        next(error);
    }
}

// Complete diagnosis
async function completeDiagnosis(req, res, next) {
    try {
        const { diagnosisId } = req.params;
        const diagnosis = await doctorService.completeDiagnosis(req.user.doctor_profile, diagnosisId);
        return successResponse(res, diagnosis, 'Diagnosis record marked as completed');
    } catch (error) {
        next(error);
    }
}

// Create lab result
async function createLabResult(req, res, next) {
    try {
        const { patientId } = req.params;

        const sanitize = (val) => typeof val === 'string' ? val.replace(/^["'](.+)["']$/, '$1') : val;

        const test_name = sanitize(req.body.test_name);
        const result_value = sanitize(req.body.result_value);
        const status = sanitize(req.body.status);
        const type = sanitize(req.body.type);

        if (!test_name || !result_value || !status || !type) {
            return errorResponse(res, 'test_name, result_value, status, and type are required', 400);
        }

        const labData = {
            ...req.body,
            test_name,
            result_value,
            status,
            type
        };

        if (req.file) {
            labData.file_name = req.file.originalname;
            labData.file_path = req.file.path;
            labData.file_size = req.file.size;
            labData.mime_type = req.file.mimetype;

            labData.file_url = `/uploads/lab-results/${req.file.filename}`;
        }

        const labResult = await doctorService.createLabResult(req.user.doctor_profile, patientId, labData);

        // 1. Register File in FileStorage table
        if (req.file) {
            await auditService.registerFile({
                fileName: req.file.originalname,
                filePath: req.file.path,
                fileUrl: labData.file_url,
                fileSize: req.file.size,
                mimeType: req.file.mimetype,
                entityType: 'LabResult',
                entityId: labResult.lab_id,
                uploadedBy: req.user.user_id
            });
        }

        // 2. Log Action in AuditLog table
        await auditService.logAction({
            userId: req.user.user_id,
            actionType: 'CREATE',
            entityType: 'LabResult',
            entityId: labResult.lab_id,
            newValues: labResult,
            description: `Lab result created for patient ${patientId}`,
            req: req
        });

        return successResponse(res, labResult, 'Lab result created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Create appointment
async function createAppointment(req, res, next) {
    try {
        const { patient_id, appointment_date, type, notes, duration } = req.body;
        if (!patient_id || !appointment_date || !type) {
            return errorResponse(res, 'patient_id, appointment_date, and type are required', 400);
        }

        const appointmentData = {
            patient_id,
            facility_id: req.user.doctor_profile.facility_id,
            when: appointment_date,
            reason: type,
            notes,
            duration: duration || 30
        };

        const appointment = await doctorService.createAppointment(req.user.doctor_profile.doctor_id, appointmentData);
        return successResponse(res, appointment, 'Appointment created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Reschedule appointment
async function rescheduleAppointment(req, res, next) {
    try {
        const { appointmentId } = req.params;
        const { newDateTime } = req.body;
        if (!newDateTime) {
            return errorResponse(res, 'newDateTime is required', 400);
        }
        const appointment = await doctorService.rescheduleAppointment(req.user.doctor_profile.doctor_id, appointmentId, newDateTime);
        return successResponse(res, appointment, 'Appointment rescheduled successfully');
    } catch (error) {
        next(error);
    }
}


// Get my appointments
async function getMyAppointments(req, res, next) {
    try {
        const appointments = await doctorService.getMyAppointments(req.user.doctor_profile.doctor_id);
        return successResponse(res, appointments, 'Appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single assigned patient
async function getPatientById(req, res, next) {
    try {
        const { patientId } = req.params;
        const patient = await doctorService.getPatientById(req.user.doctor_profile.doctor_id, patientId);
        return successResponse(res, patient, 'Patient retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single diagnosis
async function getDiagnosisById(req, res, next) {
    try {
        const { diagnosisId } = req.params;
        const diagnosis = await doctorService.getDiagnosisById(req.user.doctor_profile.doctor_id, diagnosisId);
        return successResponse(res, diagnosis, 'Diagnosis retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single lab result
async function getLabResultById(req, res, next) {
    try {
        const { labId } = req.params;
        const labResult = await doctorService.getLabResultById(req.user.doctor_profile.doctor_id, labId);
        return successResponse(res, labResult, 'Lab result retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single appointment
async function getAppointmentById(req, res, next) {
    try {
        const { appointmentId } = req.params;
        const appointment = await doctorService.getAppointmentById(req.user.doctor_profile.doctor_id, appointmentId);
        return successResponse(res, appointment, 'Appointment retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get diagnoses for specific patient
async function getDiagnosesByPatient(req, res, next) {
    try {
        const { patientId } = req.params;
        const diagnoses = await doctorService.getDiagnosesByPatient(req.user.doctor_profile.doctor_id, patientId);
        return successResponse(res, diagnoses, 'Patient diagnoses retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get lab results for specific patient
async function getLabResultsByPatient(req, res, next) {
    try {
        const { patientId } = req.params;
        const labResults = await doctorService.getLabResultsByPatient(req.user.doctor_profile.doctor_id, patientId);
        return successResponse(res, labResults, 'Patient lab results retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get all diagnoses
async function getAllDiagnoses(req, res, next) {
    try {
        const diagnoses = await doctorService.getAllDiagnoses(req.user.doctor_profile.doctor_id);
        return successResponse(res, diagnoses, 'All diagnoses retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get all lab results
async function getAllLabResults(req, res, next) {
    try {
        const labResults = await doctorService.getAllLabResults(req.user.doctor_profile.doctor_id);
        return successResponse(res, labResults, 'All lab results retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get appointments for specific patient
async function getPatientAppointments(req, res, next) {
    try {
        const { patientId } = req.params;
        const appointments = await doctorService.getPatientAppointments(req.user.doctor_profile.doctor_id, patientId);
        return successResponse(res, appointments, 'Patient appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Complete appointment
async function completeAppointment(req, res, next) {
    try {
        const { appointmentId } = req.params;
        const appointment = await doctorService.completeAppointment(req.user.doctor_profile.doctor_id, appointmentId);
        return successResponse(res, appointment, 'Appointment completed successfully');
    } catch (error) {
        next(error);
    }
}

// Allergy management
async function addAllergy(req, res, next) {
    try {
        const { patientId } = req.params;
        const allergy = await doctorService.addAllergy(req.user.doctor_profile.doctor_id, patientId, req.body);
        return successResponse(res, allergy, 'Allergy added successfully', 201);
    } catch (error) {
        next(error);
    }
}

async function getPatientAllergies(req, res, next) {
    try {
        const { patientId } = req.params;
        const allergies = await doctorService.getPatientAllergies(req.user.doctor_profile.doctor_id, patientId);
        return successResponse(res, allergies, 'Patient allergies retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Update patient medical info
async function updatePatientMedicalInfo(req, res, next) {
    try {
        const { patientId } = req.params;
        const patient = await doctorService.updatePatientMedicalInfo(req.user.doctor_profile, patientId, req.body);
        return successResponse(res, patient, 'Patient medical information updated successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAssignedPatients,
    getPatientById,
    getPatientRecords,
    getDiagnosisById,
    getLabResultById,
    getAllDiagnoses,
    getAllLabResults,
    createDiagnosis,
    updateDiagnosis,
    completeDiagnosis,
    createLabResult,
    createAppointment,
    rescheduleAppointment,
    getMyAppointments,
    getAppointmentById,
    getDiagnosesByPatient,
    getLabResultsByPatient,
    getPatientAppointments,
    completeAppointment,
    addAllergy,
    getPatientAllergies,
    updatePatientMedicalInfo
};
