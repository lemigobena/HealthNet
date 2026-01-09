
const { prisma } = require('../config/db');
const { hashPassword } = require('../utils/hash');
const { generatePatientId, generateDoctorId, generateAssignmentId } = require('../utils/idGenerator');
const notificationService = require('./notification.service');


// Create a new patient (Admin only)
async function createPatient(adminId, patientData) {
    const { name, email, phone, password, gender, dob, blood_type, disability, insurance_status, address, nationality, place_of_birth, facility_id } = patientData;

    const hashedPassword = await hashPassword(password);
    const patientId = generatePatientId();

    const patient = await prisma.user.create({
        data: {
            user_id: patientId,
            name,
            email,
            phone,
            password_hash: hashedPassword,
            role: 'PATIENT',
            gender,
            dob: dob ? new Date(dob) : null,
            address,
            nationality,
            place_of_birth,
            patient_profile: {
                create: {
                    patient_id: patientId,
                    blood_type,
                    disability,
                    national_id: patientData.national_id,
                    insurance_status: insurance_status || 'UNINSURED',
                    facility_id,
                    created_by_id: adminId,
                    status: 'ACTIVE'
                }
            }
        },
        include: {
            patient_profile: true
        }
    });

    delete patient.password_hash;
    return patient;
}


// Create a new doctor (Admin only)

async function createDoctor(adminId, doctorData) {
    const { name, email, phone, password, gender, dob, license_number, type, specialization, facility_id, address, nationality, place_of_birth } = doctorData;

    const hashedPassword = await hashPassword(password);
    const doctorId = generateDoctorId();

    const doctor = await prisma.user.create({
        data: {
            user_id: doctorId,
            name,
            email,
            phone,
            password_hash: hashedPassword,
            role: 'DOCTOR',
            gender,
            dob: dob ? new Date(dob) : null,
            address,
            nationality,
            place_of_birth,
            doctor_profile: {
                create: {
                    doctor_id: doctorId,
                    license_number,
                    type,
                    specialization,
                    national_id: doctorData.national_id,
                    facility_id,
                    created_by_id: adminId,
                    status: 'ACTIVE'
                }
            }
        },
        include: {
            doctor_profile: {
                include: {
                    facility: true
                }
            }
        }
    });

    delete doctor.password_hash;
    return doctor;
}


// Update user profile (doctor or patient)

async function updateUserProfile(userId, updateData) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            doctor_profile: true,
            patient_profile: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    const updated = await prisma.user.update({
        where: { id: userId },
        data: {
            name: updateData.name,
            email: updateData.email,
            phone: updateData.phone,
            gender: updateData.gender,
            dob: updateData.dob ? new Date(updateData.dob) : undefined,
            address: updateData.address,
            nationality: updateData.nationality,
            place_of_birth: updateData.place_of_birth
        },
        include: {
            doctor_profile: {
                include: {
                    facility: true
                }
            },
            patient_profile: true
        }
    });

    delete updated.password_hash;
    return updated;
}

// Update user password
async function updateUserPassword(userId, password) {
    const hashedPassword = await hashPassword(password);
    await prisma.user.update({
        where: { id: userId },
        data: { password_hash: hashedPassword }
    });
    return { message: 'Password updated successfully' };
}

// Suspend or activate user (doctor or patient)

async function updateUserStatus(userId, status) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            doctor_profile: true,
            patient_profile: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    if (user.role === 'DOCTOR') {
        await prisma.doctor.update({
            where: { doctor_id: user.doctor_profile.doctor_id },
            data: { status }
        });
    } else if (user.role === 'PATIENT') {
        await prisma.patient.update({
            where: { patient_id: user.patient_profile.patient_id },
            data: { status }
        });
    }

    return { message: `User ${status === 'ACTIVE' ? 'activated' : 'suspended'} successfully` };
}

// Create doctor-patient assignment

async function createAssignment(adminId, doctorId, patientId, notes) {
    const assignmentId = generateAssignmentId();

    const assignment = await prisma.assignment.create({
        data: {
            assignment_id: assignmentId,
            assigned_by: adminId,
            doctor_id: doctorId,
            patient_id: patientId,
            notes
        },
        include: {
            doctor: {
                include: {
                    user: true
                }
            },
            patient: {
                include: {
                    user: true
                }
            }
        }
    });

    // Notify the doctor about the new assignment
    await notificationService.createNotification(
        assignment.doctor.user_id,
        'ASSIGNMENT',
        'New Patient Assigned',
        `You have been assigned to patient ${assignment.patient.user.name} (${patientId}).`
    );

    // Notify the patient about the new assignment
    await notificationService.createNotification(
        assignment.patient.user_id,
        'ASSIGNMENT',
        'New Doctor Assigned',
        `Practitioner ${assignment.doctor.user.name} has been assigned to your clinical care.`
    );

    return assignment;
}

// Delete assignment

async function deleteAssignment(assignmentId) {
    await prisma.assignment.delete({
        where: { assignment_id: assignmentId }
    });

    return { message: 'Assignment deleted successfully' };
}

// Get all patients

// Get all patients
async function getAllPatients(filters = {}, adminUser = null) {
    let where = { ...filters };

    // If caller is an Admin, we no longer restrict to creator/assigner to allow database-wide search
    // This allows admins to find any patient by ID as requested.
    // However, we might want to keep some facility-based isolation if the system grows,
    // but for now the requirement is to search the entire database.

    const patients = await prisma.patient.findMany({
        where: where,
        include: {
            user: {
                select: {
                    id: true,
                    user_id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    dob: true,
                    address: true,
                    created_at: true
                }
            },
            assignments: {
                include: {
                    doctor: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    return patients;
}

// Get all doctors

// Get all doctors
async function getAllDoctors(filters = {}, adminUser = null) {
    let where = { ...filters };

    // If caller is an Admin, restrict to doctors in their facility
    if (adminUser && adminUser.role === 'ADMIN') {
        where.facility_id = adminUser.admin_profile.facility_id;
    }

    const doctors = await prisma.doctor.findMany({
        where: where,
        include: {
            user: {
                select: {
                    id: true,
                    user_id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    dob: true,
                    address: true,
                    created_at: true
                }
            },
            facility: true,
            assigned_patients: {
                include: {
                    patient: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    return doctors;
}

// Get patient by ID

async function getPatientById(id) {
    let where = {};
    if (typeof id === 'number') {
        where = { id };
    } else {
        // Handle potential leading colon from user error (e.g. :PT-123)
        const cleanId = id.toString().startsWith(':') ? id.toString().slice(1) : id.toString();
        where = { patient_id: cleanId };
    }

    let patient = await prisma.patient.findFirst({
        where: where,
        include: {
            user: {
                select: {
                    id: true,
                    user_id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    dob: true,
                    address: true,
                    created_at: true
                }
            },
            assignments: {
                include: {
                    doctor: {
                        include: {
                            user: true
                        }
                    }
                }
            },
            diagnoses: true,
            lab_results: true,
            emergency_info: true
        }
    });

    if (!patient) {
        throw new Error('Patient not found');
    }

    return patient;
}

// Get doctor by ID

async function getDoctorById(id) {
    let where = {};
    if (typeof id === 'number') {
        where = { id };
    } else {
        const cleanId = id.toString().startsWith(':') ? id.toString().slice(1) : id.toString();
        where = { doctor_id: cleanId };
    }

    let doctor = await prisma.doctor.findFirst({
        where: where,
        include: {
            user: {
                select: {
                    id: true,
                    user_id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    dob: true,
                    address: true,
                    created_at: true
                }
            },
            facility: true,
            assigned_patients: {
                include: {
                    patient: {
                        include: {
                            user: true
                        }
                    }
                }
            }
        }
    });

    if (!doctor) {
        throw new Error('Doctor not found');
    }

    return doctor;
}

// Get generic User by ID

async function getUserById(id) {
    let where = {};
    if (typeof id === 'number') {
        where = { id };
    } else {
        const cleanId = id.toString().startsWith(':') ? id.toString().slice(1) : id.toString();
        where = { user_id: cleanId };
    }

    const user = await prisma.user.findFirst({
        where: where,
        include: {
            doctor_profile: true,
            patient_profile: true,
            admin_profile: true
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    return user;
}

// Get all assignments
async function getAllAssignments(adminUser = null) {
    let where = {};

    // If caller is an Admin, restrict to assignments created by them
    if (adminUser && adminUser.role === 'ADMIN') {
        where.assigned_by = adminUser.admin_profile.admin_id;
    }

    const assignments = await prisma.assignment.findMany({
        where: where,
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            email: true
                        }
                    }
                }
            },
            patient: {
                include: {
                    user: {
                        select: {
                            name: true,
                            user_id: true
                        }
                    }
                }
            }
        },
        orderBy: {
            assigned_at: 'desc'
        }
    });

    return assignments;
}

// Get assignment by ID
async function getAssignmentById(id) {
    let where = {};
    if (typeof id === 'number') {
        where = { id };
    } else {
        where = { assignment_id: id };
    }

    const assignment = await prisma.assignment.findFirst({
        where: where,
        include: {
            doctor: {
                include: {
                    user: true
                }
            },
            patient: {
                include: {
                    user: true
                }
            }
        }
    });

    if (!assignment) {
        throw new Error('Assignment not found');
    }

    return assignment;
}

// Update doctor's facility
async function updateDoctorFacility(doctorId, facilityId) {
    // Verify the facility exists
    const facility = await prisma.facility.findUnique({
        where: { hospital_id: facilityId }
    });

    if (!facility) {
        throw new Error('Facility not found');
    }

    // Update the doctor's facility
    const updatedDoctor = await prisma.doctor.update({
        where: { doctor_id: doctorId },
        data: { facility_id: facilityId },
        include: {
            user: {
                select: {
                    id: true,
                    user_id: true,
                    name: true,
                    email: true,
                    phone: true,
                    gender: true,
                    dob: true,
                    address: true,
                    created_at: true
                }
            },
            facility: true
        }
    });

    return updatedDoctor;
}


module.exports = {
    createPatient,
    createDoctor,
    updateUserProfile,
    updateUserStatus,
    updateUserPassword,
    createAssignment,
    deleteAssignment,
    getAllPatients,
    getAllDoctors,
    getPatientById,
    getDoctorById,
    getUserById,
    getAssignmentById,
    getAllAssignments,
    updateDoctorFacility
};
