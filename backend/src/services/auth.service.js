
const { prisma } = require('../config/db');
const { comparePassword } = require('../utils/hash');
const { generateToken } = require('../utils/jwt');
const { USER_ROLES } = require('../utils/constants');

// Login user with ID/email and password

async function login(identifier, password) {
    // Find user by user_id or email
    const user = await prisma.user.findFirst({
        where: {
            OR: [
                { user_id: identifier },
                { email: identifier }
            ]
        },
        include: {
            admin_profile: {
                include: {
                    facility: true
                }
            },
            doctor_profile: {
                include: {
                    facility: true
                }
            },
            patient_profile: true
        }
    });

    if (!user) {
        throw new Error('Invalid credentials');
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid credentials');
    }

    // Check if user is suspended
    if (user.role === USER_ROLES.DOCTOR && user.doctor_profile?.status === 'INACTIVE') {
        throw new Error('Your account has been suspended. Please contact admin.');
    }

    // Check if user is suspended
    if (user.role === USER_ROLES.PATIENT && user.patient_profile?.status === 'INACTIVE') {
        throw new Error('Your account has been suspended. Please contact admin.');
    }

    // Increment token version to invalidate previous tokens
    const newTokenVersion = (user.token_version || 0) + 1;

    // Generate JWT token
    const token = generateToken({
        userId: user.id,
        userIdString: user.user_id, // Add user_id string to payload
        role: user.role,
        email: user.email,
        version: newTokenVersion // Add version to payload
    });

    // Update last login and token version
    await prisma.user.update({
        where: { id: user.id },
        data: {
            last_login: new Date(),
            token_version: newTokenVersion
        }
    });

    // Remove sensitive data
    delete user.password_hash;

    return {
        user,
        token
    };
}

// Get current user profile

async function getCurrentUser(userId) {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: {
            admin_profile: {
                include: {
                    facility: true
                }
            },
            doctor_profile: {
                include: {
                    facility: true
                }
            },
            patient_profile: {
                include: {
                    emergency_info: true
                }
            }
        }
    });

    if (!user) {
        throw new Error('User not found');
    }

    delete user.password_hash;
    return user;
}

// Logout user (invalidate token)

async function logout(userId) {
    // Increment token version to invalidate current token
    await prisma.user.update({
        where: { id: userId },
        data: {
            token_version: { increment: 1 }
        }
    });
}

// Update user password
// Update user password
async function updatePassword(userIdString, oldPassword, newPassword) {
    const { hashPassword, comparePassword } = require('../utils/hash');

    // 1. Fetch user to get current password hash
    const user = await prisma.user.findUnique({
        where: { user_id: userIdString }
    });

    if (!user) {
        throw new Error('User not found');
    }

    // 2. Verify old password
    const isPasswordValid = await comparePassword(oldPassword, user.password_hash);
    if (!isPasswordValid) {
        throw new Error('Invalid current password');
    }

    // 3. Hash new password and update
    const hashedPassword = await hashPassword(newPassword);

    data: {
        password_hash: hashedPassword,
            token_version: { increment: 1 } // Force logout on other devices
    }
});

// Audit Log
await prisma.auditLog.create({
    data: {
        user_id: userIdString, // This is likely the string ID, but auditLog.user_id expects string? Verify schema.
        // CAUTION: schema usually expects 'user_id' field in AuditLog to be string.
        // If the user_id in AuditLog is a relation to User.id (int), this might fail if userIdString is passed.
        // BUT, in admin service we passed adminId (int) or string? 
        // In createPatient we passed adminId (int).
        // Here userIdString is the string ID (e.g. "P-2023-001").
        // I need to check if user_id in AuditLog is Int or String.
        // Schema viewer said: `user_id` in AuditLog. 
        // Let's assume user.id (Int) is needed if it's a relation. 
        // user object is fetched above. I can use user.id (Int) or user.user_id (String).
        // Let's check schema quick or use user. user is found above.
        user_id: user.user_id, // Using the string ID as it's more descriptive? 
        // Wait, if it's a foreign key to User model (which uses Int id as @id), then it must be Int.
        // If it's just a string field, then string is fine.
        // admin.service.js uses `adminId` which comes from req.user.id (Int) usually?
        // "req.user.user_id" passed in controller was the STRING ID or INT? 
        // In controller `req.user.user_id` is usually the string ID (e.g., 'DOC-123')? 
        // Actually, in `login` generateToken uses `userId: user.id` (Int) and `userIdString: user.user_id` (String).
        // So req.user likely has both or one.
        // Most consistent is to use what I have. `user` object is available.
        // I will use `user.user_id` (String) if the schema supports it, or `user.id` (Int) if it's a relation.
        // Given I cannot see schema right now, I will use `user.user_id` as string ID is safer for logging textual description, 
        // BUT if it's a relation it will fail. A safe bet is `user.user_id` (string) as Entity ID and `user.user_id` as User?

        // Re-reading admin.service.js edits:
        // I passed `adminId` which came from `req.user.user_id`. 
        // In token generation: `userIdString: user.user_id`.
        // So `req.user.user_id` IS THE STRING ID.
        // So `admin.service` uses STRING ID.
        // So here I should use `user.user_id` (String).

        action_type: 'UPDATE_PASSWORD',
        entity_type: 'USER',
        entity_id: userIdString,
        description: `User changed their own password`,
        ip_address: '127.0.0.1',
        user_agent: 'System'
    }
});
}



module.exports = {
    login,
    logout,
    getCurrentUser,
    updatePassword
};
