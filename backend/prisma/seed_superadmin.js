const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs'); // Ensure bcryptjs is in dependencies

const prisma = new PrismaClient();

async function main() {
    const superAdminEmail = 'superadmin@healthnet.com';
    const superAdminPassword = 'SuperPassword123!';

    const existingSuperAdmin = await prisma.user.findUnique({
        where: { email: superAdminEmail },
    });

    if (existingSuperAdmin) {
        console.log('Super Admin already exists.');
        return;
    }

    const hashedPassword = await bcrypt.hash(superAdminPassword, 10);

    // Generate a random ID for user_id (13 chars)
    const userId = 'SA-' + Math.random().toString(36).substr(2, 9).toUpperCase();

    const user = await prisma.user.create({
        data: {
            user_id: userId,
            name: 'Super Administrator',
            email: superAdminEmail,
            phone: '0000000000',
            password_hash: hashedPassword,
            role: 'SUPER_ADMIN',
            // Other optional fields can remain null
        },
    });

    console.log('Super Admin created:', user);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
