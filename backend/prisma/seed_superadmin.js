const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
    const superAdminEmail = 'mekdes.daba@healthnet.com'; // or keep superadmin@healthnet.com? User said "register him... with name Dr. Mekdes Daba". I'll use a standard email or the previous one if I want to keep login easy, but usually specific name implies specific email. I'll use a new one but also check if I should update the old one.
    // User said "there is no superadmin... so register him". If I already seeded 'superadmin@healthnet.com', I should probably update it or create this new one.
    // The user said "do all these without deleting the data".
    // So I'll check if 'superadmin@healthnet.com' exists and update it, OR create new.
    // "register him in the database with the name of Dr, Mekdes Daba"

    const superAdminPassword = 'SuperPassword123!';
    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    // Check for existing generic superadmin to update, or create new.
    // I will prioritize creating "Dr. Mekdes Daba".

    const targetEmail = 'mekdes.daba@healthnet.com';

    const existingUser = await prisma.user.findUnique({
        where: { email: targetEmail }
    });

    if (existingUser) {
        console.log('Dr. Mekdes Daba already exists.');
    } else {
        // Create separate or update existing?
        // I'll create a new one to be safe and accurate.
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
