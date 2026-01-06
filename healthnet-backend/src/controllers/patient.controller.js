

const patientService = require('../services/patient.service');
const { successResponse } = require('../utils/response');

// Get my diagnoses
async function getMyDiagnoses(req, res, next) {
    try {
        const diagnoses = await patientService.getMyDiagnoses(req.user.patient_profile.patient_id);
        return successResponse(res, diagnoses, 'Diagnoses retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single diagnosis
async function getDiagnosisById(req, res, next) {
    try {
        const { diagnosisId } = req.params;
        const diagnosis = await patientService.getDiagnosisById(req.user.patient_profile.patient_id, diagnosisId);
        return successResponse(res, diagnosis, 'Diagnosis retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get my lab results
async function getMyLabResults(req, res, next) {
    try {
        const labResults = await patientService.getMyLabResults(req.user.patient_profile.patient_id);
        return successResponse(res, labResults, 'Lab results retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single lab result
async function getLabResultById(req, res, next) {
    try {
        const { labId } = req.params;
        const labResult = await patientService.getLabResultById(req.user.patient_profile.patient_id, labId);
        return successResponse(res, labResult, 'Lab result retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get emergency info
async function getEmergencyInfo(req, res, next) {
    try {
        const emergencyInfo = await patientService.getEmergencyInfo(req.user.patient_profile.patient_id);
        return successResponse(res, emergencyInfo, 'Emergency info retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Update emergency info
async function updateEmergencyInfo(req, res, next) {
    try {
        const { emergency_contact_name, emergency_contact_phone, emergency_contact_relationship } = req.body;
        if (!emergency_contact_name || !emergency_contact_phone || !emergency_contact_relationship) {
            return res.status(400).json({ status: 'error', message: 'emergency_contact_name, emergency_contact_phone, and emergency_contact_relationship are required' });
        }
        const emergencyInfo = await patientService.updateEmergencyInfo(req.user.patient_profile.patient_id, req.body);
        return successResponse(res, emergencyInfo, 'Emergency info updated successfully');
    } catch (error) {
        next(error);
    }
}

// Get assigned doctors
async function getAssignedDoctors(req, res, next) {
    try {
        const doctors = await patientService.getAssignedDoctors(req.user.patient_profile.patient_id);
        return successResponse(res, doctors, 'Assigned doctors retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get specific assigned doctor
async function getAssignedDoctorById(req, res, next) {
    try {
        const { id } = req.params;
        const doctor = await patientService.getAssignedDoctorById(req.user.patient_profile.patient_id, id);
        return successResponse(res, doctor, 'Doctor profile retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get my appointments
async function getMyAppointments(req, res, next) {
    try {
        const appointments = await patientService.getMyAppointments(req.user.patient_profile.patient_id);
        return successResponse(res, appointments, 'Appointments retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single appointment
async function getAppointmentById(req, res, next) {
    try {
        const { appointmentId } = req.params;
        const appointment = await patientService.getAppointmentById(req.user.patient_profile.patient_id, appointmentId);
        return successResponse(res, appointment, 'Appointment retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Toggle diagnosis visibility
async function toggleDiagnosisVisibility(req, res, next) {
    try {
        const { diagnosisId } = req.params;
        const { visible } = req.body;
        const result = await patientService.toggleDiagnosisVisibility(req.user.patient_profile.patient_id, diagnosisId, visible);
        return successResponse(res, result, `Diagnosis visibility ${visible ? 'enabled' : 'disabled'}`);
    } catch (error) {
        next(error);
    }
}

// Toggle lab result visibility
async function toggleLabResultVisibility(req, res, next) {
    try {
        const { labId } = req.params;
        const { visible } = req.body;
        const result = await patientService.toggleLabResultVisibility(req.user.patient_profile.patient_id, labId, visible);
        return successResponse(res, result, `Lab result visibility ${visible ? 'enabled' : 'disabled'}`);
    } catch (error) {
        next(error);
    }
}

// Toggle allergy visibility
async function toggleAllergyVisibility(req, res, next) {
    try {
        const { allergyId } = req.params;
        const { visible } = req.body;
        const result = await patientService.toggleAllergyVisibility(req.user.patient_profile.patient_id, allergyId, visible);
        return successResponse(res, result, `Allergy visibility ${visible ? 'enabled' : 'disabled'}`);
    } catch (error) {
        next(error);
    }
}

// Toggle medical info visibility
async function toggleMedicalInfoVisibility(req, res, next) {
    try {
        const { field, visible } = req.body;
        const result = await patientService.toggleMedicalInfoVisibility(req.user.patient_profile.patient_id, field, visible);
        return successResponse(res, result, `Medical info ${field} visibility ${visible ? 'enabled' : 'disabled'}`);
    } catch (error) {
        next(error);
    }
}

// Add allergy
async function addAllergy(req, res, next) {
    try {
        const { allergy } = req.body;
        if (!allergy) {
            return res.status(400).json({ status: 'error', message: 'Allergy name is required' });
        }
        const newAllergy = await patientService.addAllergy(req.user.patient_profile.patient_id, allergy);
        return successResponse(res, newAllergy, 'Allergy added successfully');
    } catch (error) {
        next(error);
    }
}

// Delete allergy
async function deleteAllergy(req, res, next) {
    try {
        const { allergyId } = req.params;
        await patientService.deleteAllergy(req.user.patient_profile.patient_id, allergyId);
        return successResponse(res, null, 'Allergy deleted successfully');
    } catch (error) {
        next(error);
    }
}

// Update profile
async function updateProfile(req, res, next) {
    try {
        const result = await patientService.updateProfile(req.user.user_id, req.body);
        return successResponse(res, result, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getMyDiagnoses,
    getDiagnosisById,
    getMyLabResults,
    getLabResultById,
    getEmergencyInfo,
    updateEmergencyInfo,
    getAssignedDoctors,
    getAssignedDoctorById,
    getMyAppointments,
    getAppointmentById,
    toggleDiagnosisVisibility,
    toggleLabResultVisibility,
    toggleAllergyVisibility,
    toggleMedicalInfoVisibility,
    addAllergy,
    deleteAllergy,
    updateProfile
};
