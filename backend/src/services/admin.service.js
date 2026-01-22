
const { prisma } = require('../config/db');
const { hashPassword } = require('../utils/hash');
const { generatePatientId, generateDoctorId, generateAssignmentId } = require('../utils/idGenerator');
const notificationService = require('./notification.service');


// Create a new patient (Admin only)
async function createPatient(adminId, patientData) {
    const { name, email, phone, password, gender, dob, blood_type, disability, insurance_status, address, nationality, place_of_birth, facility_id } = patientData;

    const hashedPassword = await hashPassword(password);
    const patientId = generatePatientId();

    const patient = await prisma.$transaction(async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
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
                place_of_birth
            }
        });

        // 2. Create Patient Profile
        await tx.patient.create({
            data: {
                patient_id: patientId,
                user_id: patientId,
                blood_type,
                disability,
                insurance_status: insurance_status || 'UNINSURED',
                facility_id,
                created_by_id: adminId,
                status: 'ACTIVE'
            }
        });

        // Audit Log
        await tx.auditLog.create({
            data: {
                user_id: adminId,
                action_type: 'CREATE_PATIENT',
                entity_type: 'PATIENT',
                entity_id: patientId,
                description: `Admin created patient ${name}`,
                ip_address: '127.0.0.1', // Placeholder or passed from controller context if available
                user_agent: 'System'
            }
        });

        return user;
    });

    // 3. Fetch full patient profile
    const fullPatient = await prisma.user.findUnique({
        where: { user_id: patientId },
        include: {
            patient_profile: {
                include: {
                    facility: true
                }
            }
        }
    });

    delete fullPatient.password_hash;
    return fullPatient;
}


// Create a new doctor (Admin only)

async function createDoctor(adminId, doctorData) {
    const { name, email, phone, password, gender, dob, license_number, type, specialization, facility_id, address, nationality, place_of_birth } = doctorData;

    const hashedPassword = await hashPassword(password);
    const doctorId = generateDoctorId();

    const doctor = await prisma.$transaction(async (tx) => {
        // 1. Create User
        const user = await tx.user.create({
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
                place_of_birth
            }
        });

        // 2. Create Doctor Profile
        await tx.doctor.create({
            data: {
                doctor_id: doctorId,
                user_id: doctorId,
                license_number,
                type,
                specialization,
                facility_id,
                created_by_id: adminId,
                status: 'ACTIVE'
            }
        });

        // Audit Log
        await tx.auditLog.create({
            data: {
                user_id: adminId,
                action_type: 'CREATE_DOCTOR',
                entity_type: 'DOCTOR',
                entity_id: doctorId,
                description: `Admin created doctor ${name}`,
                ip_address: '127.0.0.1',
                user_agent: 'System'
            }
        });

        return user;
    });

    // 3. Fetch full doctor profile with inclusion
    const fullDoctor = await prisma.user.findUnique({
        where: { user_id: doctorId },
        include: {
            doctor_profile: {
                include: {
                    facility: true
                }
            }
        }
    });

    delete fullDoctor.password_hash;
    return fullDoctor;
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

    // If user is a Patient and blood_type or disability is provided, update Patient profile
    if (user.role === 'PATIENT' && (updateData.blood_type || updateData.disability)) {
        await prisma.patient.update({
            where: { patient_id: user.patient_profile.patient_id },
            data: {
                blood_type: updateData.blood_type,
                disability: updateData.disability
            }
        });

        // Refresh the updated object's patient_profile
        updated.patient_profile = await prisma.patient.findUnique({
            where: { patient_id: user.patient_profile.patient_id }
        });
    }

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

// Create new assignment
async function createAssignment(adminProfileId, adminUserId, doctorId, patientId, notes) {
    // Check if duplicate assignment exists
    const existingAssignment = await prisma.assignment.findFirst({
        where: {
            doctor_id: doctorId,
            patient_id: patientId,
            end_date: null // Active assignments have no end date
        }
    });

    if (existingAssignment) {
        throw new Error('This patient is already assigned to this doctor');
    }

    const assignmentId = generateAssignmentId();

    const assignment = await prisma.assignment.create({
        data: {
            assignment_id: assignmentId,
            doctor_id: doctorId,
            patient_id: patientId,
            assigned_by: adminProfileId,
            notes
        },
        include: {
            doctor: {
                include: { user: true }
            },
            patient: {
                include: { user: true }
            }
        }
    });

    // Audit Log
    await prisma.auditLog.create({
        data: {
            user_id: adminUserId, // Uses User ID
            action_type: 'CLINICAL_ASSIGNMENT',
            entity_type: 'ASSIGNMENT',
            entity_id: assignment.assignment_id.toString(),
            description: `Admin assigned Patient ${patientId} to Doctor ${doctorId}`,
            ip_address: '127.0.0.1',
            user_agent: 'System'
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
async function updateDoctorFacility(doctorId, facilityId, adminId) {
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

    if (adminId) {
        await prisma.auditLog.create({
            data: {
                user_id: adminId,
                action_type: 'UPDATE_FACILITY',
                entity_type: 'DOCTOR',
                entity_id: doctorId,
                description: `Admin updated facility to ${facility.name} for doctor ${doctorId}`,
                ip_address: '127.0.0.1',
                user_agent: 'System'
            }
        });
    }

    return updatedDoctor;
}


// Update patient insurance status
async function updatePatientInsurance(patientId, status, adminId) {
    const patient = await prisma.patient.findUnique({
        where: { patient_id: patientId },
        include: { user: true } // Include user to get ID for audit log? Wait, we need ADMIN ID here.
    });

    if (!patient) {
        throw new Error('Patient profile not found');
    }

    // We need the admin ID who performed this action. 
    // Since the service signature is (patientId, status), we might need to update it or accept a context object.
    // For now, let's assume valid access and maybe we can pass the actor ID.
    // Actually best practice is to pass the actor to the service function.
    // But to minimize refactor risk, I will query the audit log in the controller instead? 
    // NO, the prompt says "store all the things the admin does".
    // I should update the service signature to accept 'adminId' or 'actorId'.

    // Let's stick to the plan: Modify service logic. I'll stick minimal changes first. 
    // Use the previous pattern: perform action, then log. 
    // But I don't have adminId here! 
    // I will refactor the call site in controller to pass adminId.

    // Changing signature: async function updatePatientInsurance(patientId, status, adminId)

    const updated = await prisma.patient.update({
        where: { patient_id: patientId },
        data: { insurance_status: status },
        include: {
            user: true,
            facility: true
        }
    });

    // Audit Log
    if (adminId) {
        await prisma.auditLog.create({
            data: {
                user_id: adminId,
                action_type: 'UPDATE_INSURANCE',
                entity_type: 'PATIENT',
                entity_id: patientId,
                description: `Admin updated insurance to ${status} for patient ${patientId}`,
                ip_address: '127.0.0.1',
                user_agent: 'System'
            }
        });
    }

    return updated;
}

// Get system audit logs (Admin only)
async function getSystemAuditLogs() {
    return prisma.auditLog.findMany({
        where: {
            user: {
                role: 'ADMIN' // Filter by role using the relation
            }
        },
        include: {
            user: {
                select: {
                    name: true,
                    role: true
                }
            }
        },
        orderBy: {
            created_at: 'desc'
        },
        take: 50
    });
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
    updateDoctorFacility,
    updatePatientInsurance,
    getSystemAuditLogs
};
