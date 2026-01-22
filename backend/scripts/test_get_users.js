
const { PrismaClient } = require('@prisma/client');
const superAdminService = require('../src/services/superadmin.service');
const prisma = new PrismaClient();

async function testGetAllUsers() {
    console.log("Starting getAllUsers Test...");

    try {
        // 1. Test without filters
        console.log("--- Test 1: No Filters ---");
        const users1 = await superAdminService.getAllUsers({});
        console.log(`Found ${users1.length} users.`);
        if (users1.length > 0) {
            console.log("Sample User:", users1[0].name, users1[0].role);
        }

        // 2. Test with Search
        console.log("\n--- Test 2: Search 'Mekdes' ---");
        const users2 = await superAdminService.getAllUsers({ search: 'Mekdes' });
        console.log(`Found ${users2.length} users matching 'Mekdes'.`);

        // 3. Test with Role
        console.log("\n--- Test 3: Role 'SUPER_ADMIN' ---");
        const users3 = await superAdminService.getAllUsers({ role: 'SUPER_ADMIN' });
        console.log(`Found ${users3.length} SUPER_ADMIN users.`);

        // 4. Test with lowercase Role (potential bug?)
        console.log("\n--- Test 4: Role 'super_admin' (lowercase) ---");
        try {
            const users4 = await superAdminService.getAllUsers({ role: 'super_admin' });
            console.log(`Found ${users4.length} users.`);
        } catch (e) {
            console.log("Error querying with lowercase role:", e.message);
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

testGetAllUsers();
