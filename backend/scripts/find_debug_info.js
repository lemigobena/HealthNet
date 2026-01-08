const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findDoctor() {
    try {
        const doctor = await prisma.user.findFirst({
            where: { role: 'DOCTOR' },
            include: { doctor_profile: true }
        });
        console.log('DOCTOR_USER:', JSON.stringify(doctor, null, 2));

        if (doctor) {
            const assignment = await prisma.assignment.findFirst({
                where: { doctor_id: doctor.doctor_profile.doctor_id, end_date: null },
                include: { patient: true }
            });
            console.log('ASSIGNMENT:', JSON.stringify(assignment, null, 2));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findDoctor();
