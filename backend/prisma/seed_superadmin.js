const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const superAdminEmail = 'mekdes.daba@healthnet.com';

    const superAdminPassword = 'SuperPassword123!';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);


    const targetEmail = 'mekdes.daba@healthnet.com';

    const existingUser = await prisma.user.findUnique({
        where: { email: targetEmail }
    });

    if (existingUser) {
        console.log('Dr. Mekdes Daba already exists.');
    } else {
        const userId = 'SA-' + Math.random().toString(36).substr(2, 9).toUpperCase();

        await prisma.user.create({
            data: {
                user_id: userId,
                name: 'Dr. Mekdes Daba',
                email: targetEmail,
                phone: '+251911234567', // Dummy phone
                password_hash: hashedPassword,
                role: 'SUPER_ADMIN',
                gender: 'FEMALE',
                // Fill other info?
                address: 'Addis Ababa, Ethiopia',
                nationality: 'Ethiopian',
                dob: new Date('1985-05-15')
            },
        });
        console.log('Created Super Admin: Dr. Mekdes Daba');
    }

}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
