
const { prisma } = require('../config/db');
const { generateDiagnosisId, generateLabId, generateAppointmentId } = require('../utils/idGenerator');
const { DOCTOR_TYPES, DIAGNOSIS_STATUS } = require('../utils/constants');
const notificationService = require('./notification.service');

// Check if doctor is assigned to patient

async function checkAssignment(doctorId, patientId) {
    const assignment = await prisma.assignment.findFirst({
        where: {
            doctor_id: doctorId,
            patient_id: patientId,
            end_date: null // Active assignment
        }
    });

    if (!assignment) {
        const error = new Error('You are not assigned to this patient');
        error.statusCode = 403;
        throw error;
    }

    return assignment;
}

// Get assigned patients for a doctor

async function getAssignedPatients(doctorId) {
    const assignments = await prisma.assignment.findMany({
        where: {
            doctor_id: doctorId,
            end_date: null
        },
        include: {
            patient: {
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
                            address: true
                        }
                    },
                    _count: {
                        select: {
                            diagnoses: true
                        }
                    }
                }
            }
        }
    });

    return assignments.map(a => ({
        ...a.patient,
        caseCount: a.patient._count.diagnoses,
        assigned_at: a.assigned_at
    }));
}

// Get patient records (diagnoses and lab results) - only for assigned patients

async function getPatientRecords(doctorId, patientId) {
    // Check assignment
    await checkAssignment(doctorId, patientId);

    const [diagnoses, labResults] = await Promise.all([
        prisma.diagnosis.findMany({
            where: { patient_id: patientId },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                user_id: true
                            }
                        }
                    }
                },
                facility: true,
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
            orderBy: { created_at: 'desc' }
        }),
        prisma.labResult.findMany({
            where: { patient_id: patientId },
            include: {
                doctor: {
                    include: {
                        user: {
                            select: {
                                name: true,
                                user_id: true
                            }
                        }
                    }
                },
                facility: true
            },
            orderBy: { created_at: 'desc' }
        })
    ]);

    return { diagnoses, labResults };
}

// Get diagnoses for a specific patient

async function getDiagnosesByPatient(doctorId, patientId) {
    await checkAssignment(doctorId, patientId);
    return prisma.diagnosis.findMany({
        where: { patient_id: patientId },
        include: {
            doctor: { include: { user: { select: { name: true, user_id: true } } } },
            facility: true,
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
        orderBy: { created_at: 'desc' }
    });
}

// Get lab results for a specific patient

async function getLabResultsByPatient(doctorId, patientId) {
    await checkAssignment(doctorId, patientId);
    return prisma.labResult.findMany({
        where: { patient_id: patientId },
        include: {
            doctor: { include: { user: { select: { name: true, user_id: true } } } },
            facility: true
        },
        orderBy: { created_at: 'desc' }
    });
}

// Create diagnosis (Medical Doctor only)

async function createDiagnosis(doctorProfile, patientId, diagnosisData) {
    // Check if doctor is medical doctor
    if (doctorProfile.type !== DOCTOR_TYPES.MEDICAL_DOCTOR) {
        throw new Error('Only Medical Doctors can create diagnoses');
    }

    // Check assignment
    await checkAssignment(doctorProfile.doctor_id, patientId);

    const diagnosisId = generateDiagnosisId();

    const diagnosis = await prisma.diagnosis.create({
        data: {
            diagnosis_id: diagnosisId,
            patient_id: patientId,
            doctor_id: doctorProfile.doctor_id,
            facility_id: doctorProfile.facility_id,
            symptoms: diagnosisData.symptoms,
            diagnosed_disease: diagnosisData.diagnosed_disease,
            disease_name: diagnosisData.disease_name || diagnosisData.diagnosed_disease,
            medications: diagnosisData.medications,
            suggestions: diagnosisData.suggestions,
            conclusion: diagnosisData.conclusion,
            status: diagnosisData.status || DIAGNOSIS_STATUS.PENDING
        },
        include: {
            patient: {
                include: {
                    user: true
                }
            },
            doctor: {
                include: {
                    user: true
                }
            },
            facility: true
        }
    });

    // Notify Lab Technicians assigned to this patient about the new diagnosis
    await notificationService.notifyAssignedDoctors(
        patientId,
        'DIAGNOSIS',
        'New Diagnosis Created',
        `A new diagnosis (${diagnosis.disease_name}) has been created for patient ${diagnosis.patient.user.name}.`,
        DOCTOR_TYPES.LAB_TECHNICIAN
    );

    // Notify the patient about the new diagnosis
    await notificationService.createNotification(
        diagnosis.patient.user_id,
        'DIAGNOSIS',
        'New Clinical Diagnosis',
        `A new diagnosis has been recorded in your medical profile by ${diagnosis.doctor.user.name}.`
    );

    return diagnosis;
}

// Update diagnosis (Medical Doctor only, only if PENDING)

async function updateDiagnosis(doctorProfile, diagnosisId, updateData) {
    // Check if doctor is medical doctor
    if (doctorProfile.type !== DOCTOR_TYPES.MEDICAL_DOCTOR) {
        throw new Error('Only Medical Doctors can update diagnoses');
    }

    const diagnosis = await prisma.diagnosis.findUnique({
        where: { diagnosis_id: diagnosisId }
    });

    if (!diagnosis) {
        throw new Error('Diagnosis not found');
    }

    // Can only edit if PENDING
    if (diagnosis.status !== DIAGNOSIS_STATUS.PENDING) {
        throw new Error('Can only edit diagnoses with PENDING status');
    }

    // Check if doctor is assigned to patient
    await checkAssignment(doctorProfile.doctor_id, diagnosis.patient_id);

    const updated = await prisma.diagnosis.update({
        where: { diagnosis_id: diagnosisId },
        data: {
            symptoms: updateData.symptoms,
            diagnosed_disease: updateData.diagnosed_disease,
            disease_name: updateData.disease_name || updateData.diagnosed_disease,
            medications: updateData.medications,
            suggestions: updateData.suggestions,
            conclusion: updateData.conclusion,
            status: updateData.status,
            completed_at: updateData.status === DIAGNOSIS_STATUS.COMPLETED ? new Date() : null
        },
        include: {
            patient: {
                include: {
                    user: true
                }
            },
            doctor: {
                include: {
                    user: true
                }
            },
            facility: true
        }
    });

    return updated;
}

// Complete diagnosis (Medical Doctor only)
async function completeDiagnosis(doctorProfile, diagnosisId) {
    if (doctorProfile.type !== DOCTOR_TYPES.MEDICAL_DOCTOR) {
        throw new Error('Only Medical Doctors can complete diagnoses');
    }

    const diagnosis = await prisma.diagnosis.findUnique({
        where: { diagnosis_id: diagnosisId }
    });

    if (!diagnosis) {
        throw new Error('Diagnosis not found');
    }

    if (diagnosis.status === DIAGNOSIS_STATUS.COMPLETED) {
        throw new Error('Diagnosis is already completed');
    }

    // Check if doctor is assigned to patient
    await checkAssignment(doctorProfile.doctor_id, diagnosis.patient_id);

    const updated = await prisma.diagnosis.update({
        where: { diagnosis_id: diagnosisId },
        data: {
            status: DIAGNOSIS_STATUS.COMPLETED,
            completed_at: new Date()
        },
        include: {
            patient: { include: { user: true } },
            doctor: { include: { user: true } },
            facility: true
        }
    });

    return updated;
}

// Create lab result (Lab Technician only)

async function createLabResult(doctorProfile, patientId, labData) {
    // Check if doctor is lab technician
    if (doctorProfile.type !== DOCTOR_TYPES.LAB_TECHNICIAN) {
        throw new Error('Only Lab Technicians can create lab results');
    }

    // Check assignment
    await checkAssignment(doctorProfile.doctor_id, patientId);

    const labId = generateLabId();

    const labResult = await prisma.labResult.create({
        data: {
            lab_id: labId,
            patient_id: patientId,
            doctor_id: doctorProfile.doctor_id,
            facility_id: doctorProfile.facility_id,
            type: labData.type,
            file_name: labData.file_name,
            file_path: labData.file_path,
            file_url: labData.file_url,
            file_size: labData.file_size,
            mime_type: labData.mime_type,
            result_summary: labData.result_value || labData.result_summary,
            findings: labData.findings,
            notes: labData.notes,
            is_abnormal: labData.status === 'ABNORMAL',
            test_date: labData.test_date ? new Date(labData.test_date) : new Date()
        },
        include: {
            patient: {
                include: {
                    user: true
                }
            },
            doctor: {
                include: {
                    user: true
                }
            },
            facility: true
        }
    });

    // Notify Medical Doctors assigned to this patient about the new lab result
    await notificationService.notifyAssignedDoctors(
        patientId,
        'LAB_RESULT',
        'New Lab Result Uploaded',
        `New lab results (${labResult.test_name || labResult.type}) are available for patient ${labResult.patient.user.name}.`,
        DOCTOR_TYPES.MEDICAL_DOCTOR
    );

    // Notify the patient about the new lab result
    await notificationService.createNotification(
        labResult.patient.user_id,
        'LAB_RESULT',
        'New Lab Results Available',
        `New lab results (${labResult.type}) have been uploaded by ${labResult.doctor.user.name}.`
    );

    return labResult;
}

// Create appointment

async function createAppointment(doctorId, appointmentData) {
    const appointmentId = generateAppointmentId();

    // Check assignment
    await checkAssignment(doctorId, appointmentData.patient_id);

    const appointment = await prisma.appointment.create({
        data: {
            appointment_id: appointmentId,
            doctor_id: doctorId,
            patient_id: appointmentData.patient_id,
            facility_id: appointmentData.facility_id,
            when: new Date(appointmentData.when),
            duration: appointmentData.duration || 30,
            reason: appointmentData.reason,
            notes: appointmentData.notes,
            status: 'SCHEDULED'
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
            },
            facility: true
        }
    });

    // Notify the patient about the new appointment
    await notificationService.createNotification(
        appointment.patient.user_id,
        'APPOINTMENT',
        'New Appointment Scheduled',
        `An appointment has been scheduled with ${appointment.doctor.user.name} for ${new Date(appointment.when).toLocaleString()}.`
    );

    return appointment;
}

// Reschedule appointment

async function rescheduleAppointment(doctorId, appointmentId, newDateTime) {
    const appointment = await prisma.appointment.findUnique({
        where: { appointment_id: appointmentId }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    if (appointment.doctor_id !== doctorId) {
        throw new Error('You can only reschedule your own appointments');
    }

    // Check if appointment is in the past
    if (new Date(appointment.when) < new Date()) {
        throw new Error('Cannot reschedule past appointments');
    }

    const updated = await prisma.appointment.update({
        where: { appointment_id: appointmentId },
        data: {
            when: new Date(newDateTime),
            status: 'RESCHEDULED'
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
            },
            facility: true
        }
    });

    // Notify the patient about the rescheduled appointment
    await notificationService.createNotification(
        updated.patient.user_id,
        'APPOINTMENT',
        'Appointment Rescheduled',
        `Your appointment with ${updated.doctor.user.name} has been moved to ${new Date(updated.when).toLocaleString()}.`
    );

    return updated;
}

// Complete appointment
async function completeAppointment(doctorId, appointmentId) {
    const appointment = await prisma.appointment.findUnique({
        where: { appointment_id: appointmentId }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    if (appointment.doctor_id !== doctorId) {
        throw new Error('You can only complete your own appointments');
    }

    // Check if appointment date has passed
    if (new Date(appointment.when) > new Date()) {
        throw new Error('Cannot complete an appointment before its date/time');
    }

    return prisma.appointment.update({
        where: { appointment_id: appointmentId },
        data: {
            status: 'COMPLETED',
            completed_at: new Date()
        }
    });
}

// Allergy management
async function addAllergy(doctorId, patientId, allergyData) {
    await checkAssignment(doctorId, patientId);

    // Check if allergy already exists for this patient (case-insensitive)
    const existing = await prisma.allergy.findFirst({
        where: {
            patient_id: patientId,
            allergies: {
                equals: allergyData.allergies,
                mode: 'insensitive'
            }
        }
    });

    let allergy;
    if (existing) {
        // Update existing allergy severity
        allergy = await prisma.allergy.update({
            where: { id: existing.id },
            data: {
                severity: allergyData.severity,
                created_at: new Date() // recorded_at in schema is mapped to created_at in some places? wait.
            }
        });
    } else {
        // Create new allergy record
        allergy = await prisma.allergy.create({
            data: {
                patient_id: patientId,
                allergies: allergyData.allergies,
                severity: allergyData.severity
            }
        });
    }

    // Also update emergency info if it exists
    const emergencyInfo = await prisma.emergencyInfo.findUnique({
        where: { patient_id: patientId }
    });

    if (emergencyInfo) {
        const currentAllergies = emergencyInfo.known_allergies ? emergencyInfo.known_allergies.split(', ') : [];
        // Case-insensitive check for emergency info too
        if (!currentAllergies.some(a => a.toLowerCase() === allergyData.allergies.toLowerCase())) {
            currentAllergies.push(allergyData.allergies);
            await prisma.emergencyInfo.update({
                where: { patient_id: patientId },
                data: {
                    known_allergies: currentAllergies.join(', ')
                }
            });
        }
    }

    return allergy;
}

async function getPatientAllergies(doctorId, patientId) {
    await checkAssignment(doctorId, patientId);

    return prisma.allergy.findMany({
        where: { patient_id: patientId },
        orderBy: { created_at: 'desc' }
    });
}

// Get doctor's own appointments

async function getMyAppointments(doctorId) {
    const appointments = await prisma.appointment.findMany({
        where: {
            doctor_id: doctorId,
            patient: {
                assignments: {
                    some: {
                        doctor_id: doctorId,
                        end_date: null
                    }
                }
            }
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            user_id: true,
                            name: true,
                            phone: true,
                            email: true
                        }
                    }
                }
            },
            facility: true
        },
        orderBy: { when: 'asc' }
    });

    return appointments;
}

// Get single assigned patient by ID

async function getPatientById(doctorId, patientId) {
    const assignment = await prisma.assignment.findFirst({
        where: {
            doctor_id: doctorId,
            patient_id: patientId,
            end_date: null
        },
        include: {
            patient: {
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
                            address: true
                        }
                    }
                }
            }
        }
    });

    if (!assignment) {
        throw new Error('Patient not assigned to you');
    }

    return assignment.patient;
}

// Get single diagnosis by ID

async function getDiagnosisById(doctorId, diagnosisId) {
    const diagnosis = await prisma.diagnosis.findUnique({
        where: { diagnosis_id: diagnosisId },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            user_id: true
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
            },
            facility: true
        }
    });

    if (!diagnosis) {
        throw new Error('Diagnosis not found');
    }

    // Check assignment
    await checkAssignment(doctorId, diagnosis.patient_id);

    return diagnosis;
}

// Get single lab result by ID

async function getLabResultById(doctorId, labId) {
    const labResult = await prisma.labResult.findUnique({
        where: { lab_id: labId },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            user_id: true
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
            },
            facility: true
        }
    });

    if (!labResult) {
        throw new Error('Lab result not found');
    }

    // Check assignment
    await checkAssignment(doctorId, labResult.patient_id);

    return labResult;
}

// Get single appointment by ID

async function getAppointmentById(doctorId, appointmentId) {
    const appointment = await prisma.appointment.findFirst({
        where: {
            appointment_id: appointmentId,
            doctor_id: doctorId
        },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            user_id: true,
                            name: true,
                            phone: true,
                            email: true
                        }
                    }
                }
            },
            facility: true
        }
    });

    if (!appointment) {
        throw new Error('Appointment not found');
    }

    // Check assignment
    await checkAssignment(doctorId, appointment.patient_id);

    return appointment;
}

// Get all diagnoses (for doctors to view all diagnoses in the system)

async function getAllDiagnoses(doctorId) {
    const diagnoses = await prisma.diagnosis.findMany({
        where: {
            patient: {
                assignments: {
                    some: {
                        doctor_id: doctorId,
                        end_date: null
                    }
                }
            }
        },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            user_id: true
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
            },
            facility: true
        },
        orderBy: { created_at: 'desc' }
    });

    return diagnoses;
}

// Get all lab results (for doctors to view all lab results in the system)

async function getAllLabResults(doctorId) {
    const labResults = await prisma.labResult.findMany({
        where: {
            patient: {
                assignments: {
                    some: {
                        doctor_id: doctorId,
                        end_date: null
                    }
                }
            }
        },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            name: true,
                            user_id: true
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
            },
            facility: true
        },
        orderBy: { created_at: 'desc' }
    });

    return labResults;
}

// Get all appointments for a specific patient
async function getPatientAppointments(doctorId, patientId) {
    // Check if doctor is assigned to patient
    await checkAssignment(doctorId, patientId);

    const appointments = await prisma.appointment.findMany({
        where: {
            patient_id: patientId
        },
        include: {
            doctor: {
                select: {
                    doctor_id: true,
                    specialization: true,
                    user: {
                        select: {
                            name: true,
                            user_id: true
                        }
                    }
                }
            },
            facility: true
        },
        orderBy: { when: 'desc' }
    });

    return appointments;
}

// Update patient medical info (Medical Doctor only)
async function updatePatientMedicalInfo(doctorProfile, patientId, medicalData) {
    if (doctorProfile.type !== DOCTOR_TYPES.MEDICAL_DOCTOR) {
        throw new Error('Only Medical Doctors can update medical information');
    }

    await checkAssignment(doctorProfile.doctor_id, patientId);

    const updatedPatient = await prisma.patient.update({
        where: { patient_id: patientId },
        data: {
            blood_type: medicalData.blood_type,
            disability: medicalData.disability
        },
        include: {
            user: true
        }
    });

    return updatedPatient;
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
    createLabResult,
    createAppointment,
    rescheduleAppointment,
    getMyAppointments,
    getAppointmentById,
    getDiagnosesByPatient,
    getLabResultsByPatient,
    getPatientAppointments,
    completeAppointment,
    completeDiagnosis,
    addAllergy,
    getPatientAllergies,
    updatePatientMedicalInfo
};
