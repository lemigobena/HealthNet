const { prisma } = require('./src/config/db');
const doctorService = require('./src/services/doctor.service');

async function debug() {
    const doctorId = 'DL-S05JW5Y8V9';
    const patientId = 'PT-I2C9OSCDXU';

    console.log(`Testing for Doctor: ${doctorId}, Patient: ${patientId}`);

    try {
        console.log('Testing getPatientById...');
        const patient = await doctorService.getPatientById(doctorId, patientId);
        console.log('getPatientById success');
    } catch (e) {
        console.error('getPatientById failed:', e.message);
    }

    try {
        console.log('Testing getDiagnosesByPatient...');
        const diagnoses = await doctorService.getDiagnosesByPatient(doctorId, patientId);
        console.log('getDiagnosesByPatient success');
    } catch (e) {
        console.error('getDiagnosesByPatient failed:', e.message);
    }

    try {
        console.log('Testing getLabResultsByPatient...');
        const labs = await doctorService.getLabResultsByPatient(doctorId, patientId);
        console.log('getLabResultsByPatient success');
    } catch (e) {
        console.error('getLabResultsByPatient failed:', e.message);
    }

    try {
        console.log('Testing getPatientAppointments...');
        const appointments = await doctorService.getPatientAppointments(doctorId, patientId);
        console.log('getPatientAppointments success');
    } catch (e) {
        console.error('getPatientAppointments failed:', e.message);
    }

    process.exit(0);
}

debug();
