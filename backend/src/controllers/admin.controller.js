
const adminService = require('../services/admin.service');
const { successResponse, errorResponse } = require('../utils/response');

// Create patient
async function createPatient(req, res, next) {
    try {
        const { name, email, phone, password } = req.body;
        if (!name || !email || !phone || !password) {
            return errorResponse(res, 'Name, email, phone, and password are required', 400);
        }
        const patient = await adminService.createPatient(req.user.user_id, req.body);
        return successResponse(res, patient, 'Patient created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Create doctor
async function createDoctor(req, res, next) {
    try {
        const { name, email, phone, password, license_number, type, facility_id } = req.body;
        if (!name || !email || !phone || !password || !license_number || !type || !facility_id) {
            return errorResponse(res, 'Name, email, phone, password, license_number, type, and facility_id are required', 400);
        }
        const doctor = await adminService.createDoctor(req.user.user_id, req.body);
        return successResponse(res, doctor, 'Doctor created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Update user profile
async function updateUserProfile(req, res, next) {
    try {
        const { userId } = req.params;
        const user = await adminService.getUserById(!isNaN(userId) ? parseInt(userId) : userId);
        const updated = await adminService.updateUserProfile(user.id, req.body);
        return successResponse(res, updated, 'Profile updated successfully');
    } catch (error) {
        next(error);
    }
}

// Suspend/activate user
async function updateUserStatus(req, res, next) {
    try {
        const { userId } = req.params;
        const { status } = req.body;
        const user = await adminService.getUserById(!isNaN(userId) ? parseInt(userId) : userId);
        const result = await adminService.updateUserStatus(user.id, status);
        return successResponse(res, result, 'User status updated successfully');
    } catch (error) {
        next(error);
    }
}

// Create assignment
async function createAssignment(req, res, next) {
    try {
        const { doctor_id, patient_id, notes } = req.body;
        if (!doctor_id || !patient_id) {
            return errorResponse(res, 'doctor_id and patient_id are required', 400);
        }

        const doctor = await adminService.getDoctorById(!isNaN(doctor_id) ? parseInt(doctor_id) : doctor_id);
        const patient = await adminService.getPatientById(!isNaN(patient_id) ? parseInt(patient_id) : patient_id);

        const assignment = await adminService.createAssignment(
            req.user.admin_profile.admin_id,
            doctor.doctor_id,
            patient.patient_id,
            notes
        );
        return successResponse(res, assignment, 'Assignment created successfully', 201);
    } catch (error) {
        next(error);
    }
}

// Delete assignment
async function deleteAssignment(req, res, next) {
    try {
        const { assignmentId } = req.params;
        const assignment = await adminService.getAssignmentById(!isNaN(assignmentId) ? parseInt(assignmentId) : assignmentId);
        const result = await adminService.deleteAssignment(assignment.assignment_id);
        return successResponse(res, result, 'Assignment deleted successfully');
    } catch (error) {
        next(error);
    }
}

// Get all patients
async function getAllPatients(req, res, next) {
    try {
        const patients = await adminService.getAllPatients({}, req.user);
        return successResponse(res, patients, 'Patients retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get all doctors
async function getAllDoctors(req, res, next) {
    try {
        const doctors = await adminService.getAllDoctors({}, req.user);
        return successResponse(res, doctors, 'Doctors retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single patient
async function getPatientById(req, res, next) {
    try {
        const { id } = req.params;
        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const patient = await adminService.getPatientById(parsedId);
        return successResponse(res, patient, 'Patient retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Get single doctor
async function getDoctorById(req, res, next) {
    try {
        const { id } = req.params;
        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const doctor = await adminService.getDoctorById(parsedId);
        return successResponse(res, doctor, 'Doctor retrieved successfully');
    } catch (error) {
        next(error);
    }
}

// Update patient
async function updatePatient(req, res, next) {
    try {
        const { id } = req.params;

        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const patient = await adminService.getPatientById(parsedId);

        const updated = await adminService.updateUserProfile(patient.user.id, req.body);
        return successResponse(res, updated, 'Patient profile updated successfully');
    } catch (error) {
        next(error);
    }
}

// Update doctor
async function updateDoctor(req, res, next) {
    try {
        const { id } = req.params;
        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const doctor = await adminService.getDoctorById(parsedId);
        const updated = await adminService.updateUserProfile(doctor.user.id, req.body);
        return successResponse(res, updated, 'Doctor profile updated successfully');
    } catch (error) {
        next(error);
    }
}

// Update patient status
async function updatePatientStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const patient = await adminService.getPatientById(parsedId);
        const result = await adminService.updateUserStatus(patient.user.id, status);
        return successResponse(res, result, 'Patient status updated successfully');
    } catch (error) {
        next(error);
    }
}

// Update doctor status
async function updateDoctorStatus(req, res, next) {
    try {
        const { id } = req.params;
        const { status } = req.body;
        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const doctor = await adminService.getDoctorById(parsedId);
        const result = await adminService.updateUserStatus(doctor.user.id, status);
        return successResponse(res, result, 'Doctor status updated successfully');
    } catch (error) {
        next(error);
    }
}

// Update patient password
async function updatePatientPassword(req, res, next) {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const patient = await adminService.getPatientById(parsedId);
        const result = await adminService.updateUserPassword(patient.user.id, password);
        return successResponse(res, result, 'Patient password updated successfully');
    } catch (error) {
        next(error);
    }
}

// Update doctor password
async function updateDoctorPassword(req, res, next) {
    try {
        const { id } = req.params;
        const { password } = req.body;
        const parsedId = !isNaN(id) ? parseInt(id) : id;
        const doctor = await adminService.getDoctorById(parsedId);
        const result = await adminService.updateUserPassword(doctor.user.id, password);
        return successResponse(res, result, 'Doctor password updated successfully');
    } catch (error) {
        next(error);
    }
}

// Get all assignments
async function getAllAssignments(req, res, next) {
    try {
        const assignments = await adminService.getAllAssignments(req.user);
        return successResponse(res, assignments, 'Assignments retrieved successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    createPatient,
    createDoctor,
    updateUserProfile,
    updateUserStatus,
    createAssignment,
    deleteAssignment,
    getAllPatients,
    getAllDoctors,
    getPatientById,
    getDoctorById,
    updatePatient,
    updateDoctor,
    updatePatientStatus,
    updateDoctorStatus,
    updatePatientPassword,
    updateDoctorPassword,
    getAllAssignments
};
