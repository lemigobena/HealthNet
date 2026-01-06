

const { prisma } = require('../config/db');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { generateQrId } = require('../utils/idGenerator');

// Generate QR code for patient

async function generateQRCode(patientId) {
    // Deactivate all previous QR codes for this patient
    await prisma.qRCode.updateMany({
        where: { patient_id: patientId, is_active: true },
        data: { is_active: false }
    });

    // Generate unique token
    const token = crypto.randomBytes(32).toString('hex');
    const qrId = generateQrId();

    // Create QR code record
    const qrCode = await prisma.qRCode.create({
        data: {
            qr_id: qrId,
            patient_id: patientId,
            token,
            expire_time: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year validity
            max_scans: 999999,
            accessible_fields: JSON.stringify(['emergency_info']),
            is_active: true
        }
    });

    // For deployment, we use a stable redirect link on the backend
    // This allows us to change the frontend URL in one place (.env)
    const backendUrl = process.env.BACKEND_URL || 'https://backend-jgdk.onrender.com';
    // Use token-based URL for secure rotation
    const qrContent = `${backendUrl}/api/qr/v/t/${token}`;

    const qrDataUrl = await QRCode.toDataURL(qrContent);

    await prisma.qRCode.update({
        where: { qr_id: qrId },
        data: { qr_code_url: qrDataUrl }
    });

    return {
        qr_id: qrId,
        token,
        qr_code_url: qrDataUrl,
        expire_time: qrCode.expire_time
    };
}

// Scan QR code

async function scanQRCode(token, scannedByUserId, ipAddress, userAgent) {

    const qrCode = await prisma.qRCode.findUnique({
        where: { token },
        include: {
            patient: {
                include: {
                    user: {
                        select: {
                            id: true,
                            user_id: true,
                            name: true,
                            phone: true,
                            gender: true,
                            dob: true,
                            address: true
                        }
                    },
                    emergency_info: true
                }
            }
        }
    });

    if (!qrCode) {
        throw new Error('Invalid QR code');
    }

    if (!qrCode.is_active) {
        throw new Error('QR code is inactive');
    }

    if (new Date() > qrCode.expire_time) {
        throw new Error('QR code has expired');
    }

    // Log scan in FirstResponder table
    await prisma.firstResponder.create({
        data: {
            qr_id: qrCode.qr_id,
            scanned_by_id: scannedByUserId,
            patient_scanned_id: qrCode.patient_id,
            ip_address: ipAddress,
            user_agent: userAgent,
            token_used: token,
            accessed_data: JSON.stringify(['emergency_info'])
        }
    });

    // Update scan count and last used
    await prisma.qRCode.update({
        where: { qr_id: qrCode.qr_id },
        data: {
            scan_count: { increment: 1 },
            last_used: new Date()
        }
    });

    // Return emergency info
    return {
        token: qrCode.token,
        patient_id: qrCode.patient_id,
        patient: qrCode.patient.user,
        emergency_info: qrCode.patient.emergency_info
    };
}

// Get patient's QR codes

async function getMyQRCodes(patientId) {
    const qrCode = await prisma.qRCode.findFirst({
        where: { patient_id: patientId },
        orderBy: { created_at: 'desc' }
    });

    return qrCode ? [qrCode] : [];
}

// Get scan history for a patient

async function getScanHistory(patientId) {
    const scans = await prisma.firstResponder.findMany({
        where: { patient_scanned_id: patientId },
        include: {
            scanned_by: {
                select: {
                    user_id: true,
                    name: true,
                    role: true
                }
            }
        },
        orderBy: { scanned_at: 'desc' }
    });

    return scans;
}

// Public Emergency Search (Subsets only)
async function searchEmergencyData(patientId) {
    const patient = await prisma.patient.findUnique({
        where: { patient_id: patientId },
        include: {
            user: {
                select: {
                    name: true,
                    gender: true,
                    dob: true
                }
            },
            emergency_info: true,
            diagnoses: {
                where: { emergency_visible: true },
                select: {
                    disease_name: true,
                    created_at: true,
                    status: true
                }
            },
            lab_results: {
                where: { emergency_visible: true },
                select: {
                    type: true,
                    test_date: true,
                    is_abnormal: true
                }
            }
        }
    });

    if (!patient) {
        throw new Error('Patient registry ID not found');
    }

    if (patient.status === 'INACTIVE') {
        throw new Error('Patient record is currently restricted');
    }

    return {
        patient: patient.user,
        emergency_info: patient.emergency_info,
        blood_type: patient.blood_type_visible ? patient.blood_type : "Restricted",
        disability: patient.disability_visible ? patient.disability : "Restricted",
        diagnoses: patient.diagnoses,
        lab_results: patient.lab_results
    };
}

module.exports = {
    generateQRCode,
    scanQRCode,
    getMyQRCodes,
    getScanHistory,
    searchEmergencyData
};
