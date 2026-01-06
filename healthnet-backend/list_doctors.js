
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const doctors = await prisma.user.findMany({
        where: { role: 'DOCTOR' },
        include: { doctor_profile: true }
    });
    console.log(JSON.stringify(doctors, null, 2));
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
