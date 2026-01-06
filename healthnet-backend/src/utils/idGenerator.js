
function generateRandomChars(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
}

// Function to generate unique ID with prefix
function generateId(prefix) {
    return `${prefix}-${generateRandomChars(10)}`;
}

// Specific ID generators
function generateHospitalId() {
    return generateId('HO');
}

function generatePatientId() {
    return generateId('PT');
}

function generateDoctorId() {
    return generateId('DL');
}

function generateAdminId() {
    return generateId('AM');
}

function generateDiagnosisId() {
    return generateId('DIAG');
}

function generateLabId() {
    return generateId('LAB');
}

function generateAssignmentId() {
    return generateId('ASG');
}

function generateAppointmentId() {
    return generateId('APT');
}

function generateQrId() {
    return generateId('QR');
}

function generateUserId(role) {
    switch (role) {
        case 'ADMIN':
            return generateAdminId();
        case 'DOCTOR':
            return generateDoctorId();
        case 'PATIENT':
            return generatePatientId();
        default:
            throw new Error(`Unknown role: ${role}`);
    }
}

// Function to validate ID format
function isValidId(id, expectedPrefix) {
    const pattern = new RegExp(`^${expectedPrefix}-[A-Z0-9]{10}$`);
    return pattern.test(id);
}

module.exports = {
    generateRandomChars,
    generateId,
    generateHospitalId,
    generatePatientId,
    generateDoctorId,
    generateAdminId,
    generateDiagnosisId,
    generateLabId,
    generateAssignmentId,
    generateAppointmentId,
    generateQrId,
    generateUserId,
    isValidId
};