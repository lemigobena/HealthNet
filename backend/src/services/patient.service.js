
const { prisma } = require('../config/db');
const { hashPassword } = require('../utils/hash');

// Get patient's own diagnoses

async function getMyDiagnoses(patientId) {
    const diagnoses = await prisma.diagnosis.findMany({
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
    });

    return diagnoses;
}

// Get single diagnosis by ID

async function getDiagnosisById(patientId, diagnosisId) {
    const diagnosis = await prisma.diagnosis.findFirst({
        where: {
            diagnosis_id: diagnosisId,
            patient_id: patientId
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
            facility: true
        }
    });

    if (!diagnosis) {
        throw new Error('Diagnosis not found');
    }

    return diagnosis;
}

// Get patient's own lab results

async function getMyLabResults(patientId) {
    const labResults = await prisma.labResult.findMany({
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
    });

    return labResults;
}

// Get single lab result by ID

async function getLabResultById(patientId, labId) {
    const labResult = await prisma.labResult.findFirst({
        where: {
            lab_id: labId,
            patient_id: patientId
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
            facility: true
        }
    });

    if (!labResult) {
        throw new Error('Lab result not found');
    }

    return labResult;
}

// Get or create emergency info

async function getEmergencyInfo(patientId) {
    const patient = await prisma.patient.findUnique({
        where: { patient_id: patientId },
        select: { blood_type: true, disability: true, blood_type_visible: true, disability_visible: true, allergies_visible: true }
    });

    let emergencyInfo = await prisma.emergencyInfo.findUnique({
        where: { patient_id: patientId }
    });

    if (!emergencyInfo) {
        emergencyInfo = await prisma.emergencyInfo.create({
            data: {
                patient_id: patientId,
                blood_type: patient?.blood_type,
                disability_info: patient?.disability
            }
        });
    } else {
        // Sync if missing in emergency info but present in patient record
        if (!emergencyInfo.blood_type && patient?.blood_type) {
            emergencyInfo = await prisma.emergencyInfo.update({
                where: { patient_id: patientId },
                data: { blood_type: patient.blood_type }
            });
        }
        if (!emergencyInfo.disability_info && patient?.disability) {
            emergencyInfo = await prisma.emergencyInfo.update({
                where: { patient_id: patientId },
                data: { disability_info: patient.disability }
            });
        }
    }

    // 3. Migration: Check if we have legacy string allergies but no relational allergies
    let relationalAllergies = await prisma.allergy.findMany({
        where: { patient_id: patientId }
    });

    if (relationalAllergies.length === 0 && emergencyInfo?.known_allergies) {
        const legacyList = emergencyInfo.known_allergies.split(',').filter(a => a.trim() !== "");
        if (legacyList.length > 0) {
            console.log(`Migrating ${legacyList.length} allergies for patient ${patientId}`);
            for (const item of legacyList) {
                await prisma.allergy.create({
                    data: {
                        patient_id: patientId,
                        allergies: item.trim(),
                        severity: 'MILD', // Default
                        emergency_visible: true
                    }
                });
            }
            // Refresh list
            relationalAllergies = await prisma.allergy.findMany({
                where: { patient_id: patientId }
            });
        }
    }

    // Merge visibility flags from patient table into the response
    return {
        ...emergencyInfo,
        blood_type_visible: patient?.blood_type_visible || false,
        disability_visible: patient?.disability_visible || false,
        allergies_visible: patient?.allergies_visible || false,
        allergies: relationalAllergies
    };
}

// Update emergency info (patient only, all fields optional)

async function updateEmergencyInfo(patientId, emergencyData) {
    // 1. Update the EmergencyInfo record
    const emergencyInfo = await prisma.emergencyInfo.upsert({
        where: { patient_id: patientId },
        update: {
            patient_name: emergencyData.patient_name,
            patient_dob: emergencyData.patient_dob ? new Date(emergencyData.patient_dob) : null,
            blood_type: emergencyData.blood_type,
            known_allergies: emergencyData.known_allergies,
            chronic_conditions: emergencyData.chronic_conditions,
            current_medications: emergencyData.current_medications,
            disability_info: emergencyData.disability_info,
            emergency_contact_name: emergencyData.emergency_contact_name,
            emergency_contact_phone: emergencyData.emergency_contact_phone,
            emergency_contact_relationship: emergencyData.emergency_contact_relationship,
            insurance_status: emergencyData.insurance_status,
            last_updated: new Date()
        },
        create: {
            patient_id: patientId,
            patient_name: emergencyData.patient_name,
            patient_dob: emergencyData.patient_dob ? new Date(emergencyData.patient_dob) : null,
            blood_type: emergencyData.blood_type,
            known_allergies: emergencyData.known_allergies,
            chronic_conditions: emergencyData.chronic_conditions,
            current_medications: emergencyData.current_medications,
            disability_info: emergencyData.disability_info,
            emergency_contact_name: emergencyData.emergency_contact_name,
            emergency_contact_phone: emergencyData.emergency_contact_phone,
            emergency_contact_relationship: emergencyData.emergency_contact_relationship,
            insurance_status: emergencyData.insurance_status
        }
    });

    // 2. Synchronize blood_type and disability with the core Patient record
    // 3. Update password if provided
    const patientUpdateData = {
        blood_type: emergencyData.blood_type || undefined,
        disability: emergencyData.disability_info || undefined
    };

    if (emergencyData.password) {
        const hashedPassword = await hashPassword(emergencyData.password);
        await prisma.user.update({
            where: { user_id: patientId },
            data: { password_hash: hashedPassword }
        });
    }

    if (Object.values(patientUpdateData).some(v => v !== undefined)) {
        await prisma.patient.update({
            where: { patient_id: patientId },
            data: patientUpdateData
        });
    }

    return emergencyInfo;
}

// Get assigned doctors for a patient
async function getAssignedDoctors(patientId) {
    const assignments = await prisma.assignment.findMany({
        where: {
            patient_id: patientId,
            end_date: null
        },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            user_id: true,
                            name: true,
                            email: true,
                            phone: true,
                            gender: true
                        }
                    },
                    facility: true
                }
            }
        }
    });

    return assignments.map(a => ({
        ...a.doctor.user,
        specialization: a.doctor.specialization,
        doctor_id: a.doctor.doctor_id,
        facility: a.doctor.facility
    }));
}

// Get specific assigned doctor profile

async function getAssignedDoctorById(patientId, doctorId) {
    const assignment = await prisma.assignment.findFirst({
        where: {
            patient_id: patientId,
            doctor_id: doctorId,
            end_date: null
        },
        include: {
            doctor: {
                include: {
                    user: {
                        select: {
                            user_id: true,
                            name: true,
                            email: true,
                            phone: true,
                            gender: true,
                            dob: true
                        }
                    },
                    facility: true
                }
            }
        }
    });

    if (!assignment) {
        throw new Error('This doctor is not assigned to you');
    }

    return {
        ...assignment.doctor.user,
        specialization: assignment.doctor.specialization,
        doctor_id: assignment.doctor.doctor_id,
        facility: assignment.doctor.facility
    };
}

// Get patient's own appointments
async function getMyAppointments(patientId) {
    const appointments = await prisma.appointment.findMany({
        where: {
            patient_id: patientId,
            doctor: {
                assigned_patients: {
                    some: {
                        patient_id: patientId,
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

// Get single appointment by ID

async function getAppointmentById(patientId, appointmentId) {
    const appointment = await prisma.appointment.findFirst({
        where: {
            appointment_id: appointmentId,
            patient_id: patientId
        },
        include: {
            doctor: {
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

    // Ensure the doctor is still assigned to this patient
    const assignment = await prisma.assignment.findFirst({
        where: {
            doctor_id: appointment.doctor_id,
            patient_id: patientId,
            end_date: null
        }
    });

    if (!assignment) {
        throw new Error('You are no longer assigned to this doctor');
    }

    return appointment;
}

// Toggle visibility for diagnoses
async function toggleDiagnosisVisibility(patientId, diagnosisId, visible) {
    return prisma.diagnosis.update({
        where: { diagnosis_id: diagnosisId, patient_id: patientId },
        data: { emergency_visible: visible }
    });
}

// Toggle visibility for lab results
async function toggleLabResultVisibility(patientId, labId, visible) {
    return prisma.labResult.update({
        where: { lab_id: labId, patient_id: patientId },
        data: { emergency_visible: visible }
    });
}

// Toggle visibility for allergies
async function toggleAllergyVisibility(patientId, allergyId, visible) {
    return prisma.allergy.update({
        where: { id: parseInt(allergyId), patient_id: patientId },
        data: { emergency_visible: visible }
    });
}

// Add new allergy
async function addAllergy(patientId, allergyName) {
    return prisma.allergy.create({
        data: {
            patient_id: patientId,
            allergies: allergyName,
            severity: 'MILD', // Default
            emergency_visible: true
        }
    });
}

// Delete allergy (Patient management)
async function deleteAllergy(patientId, allergyId) {
    return prisma.allergy.delete({
        where: { id: parseInt(allergyId), patient_id: patientId }
    });
}

// Toggle medical info visibility (blood type, disability)
async function toggleMedicalInfoVisibility(patientId, field, visible) {
    const data = {};
    if (field === 'blood_type') data.blood_type_visible = visible;
    if (field === 'blood_type') data.blood_type_visible = visible;
    else if (field === 'disability') data.disability_visible = visible;
    else if (field === 'allergies') data.allergies_visible = visible;
    else throw new Error('Invalid medical info field');

    return prisma.patient.update({
        where: { patient_id: patientId },
        data: data
    });
}

// Update patient profile info
async function updateProfile(userId, profileData) {
    return prisma.user.update({
        where: { user_id: userId },
        data: {
            email: profileData.email,
            phone: profileData.phone,
            address: profileData.address
        }
    });
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
    addAllergy,
    toggleDiagnosisVisibility,
    toggleLabResultVisibility,
    toggleAllergyVisibility,
    toggleMedicalInfoVisibility,
    deleteAllergy,
    updateProfile
};
