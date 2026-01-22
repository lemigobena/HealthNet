
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const authService = require('../src/services/auth.service');
const prisma = new PrismaClient();

async function testLogin() {
    console.log("Starting Login Test...");

    try {
        // 1. Fetch the user directly
        const email = 'mekdes.daba@healthnet.com';
        const rawPassword = 'SuperPassword123!';

        console.log(`Searching for user: ${email}`);
        const user = await prisma.user.findUnique({
            where: { email }
        });

        if (!user) {
            console.error("User NOT FOUND in database!");
            return;
        }
        console.log("User found:", user.user_id, user.name, user.role);
        console.log("Stored Hash:", user.password_hash);

        // 2. Test bcrypt directly
        console.log("Testing password with bcrypt...");
        const isMatch = await bcrypt.compare(rawPassword, user.password_hash);
        console.log(`Bcrypt compare result: ${isMatch}`);

        if (!isMatch) {
            console.error("BCRYPT MISMATCH: The password does not match the hash.");
            // Re-hash to see what it should look like
            const newHash = await bcrypt.hash(rawPassword, 10);
            console.log("Expected hash for this password would look like:", newHash);
        } else {
            console.log("Password matches hash.");
        }

        // 3. Test Service
        console.log("Testing authService.login...");
        try {
            const loginResult = await authService.login(email, rawPassword);
            console.log("Login Service Success! Token:", loginResult.token.substring(0, 20) + "...");
        } catch (error) {
            console.error("Login Service Failed:", error.message);
        }

    } catch (err) {
        console.error("Unexpected error:", err);
    } finally {
        await prisma.$disconnect();
    }
}

testLogin();
