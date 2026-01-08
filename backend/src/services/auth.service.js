
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

    if (user.role === USER_ROLES.PATIENT && user.patient_profile?.status === 'INACTIVE') {
        throw new Error('Your account has been suspended. Please contact admin.');
    }

    // Increment token version to invalidate previous tokens
    const newTokenVersion = (user.token_version || 0) + 1;

    // Generate JWT token
    const token = generateToken({
        userId: user.id,
        userIdString: user.user_id,
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
async function updatePassword(userIdString, newPassword) {
    const { hashPassword } = require('../utils/hash');
    const hashedPassword = await hashPassword(newPassword);

    await prisma.user.update({
        where: { user_id: userIdString },
        data: {
            password_hash: hashedPassword,
            token_version: { increment: 1 } // Optional: Force logout on other devices
        }
    });
}

module.exports = {
    login,
    logout,
    getCurrentUser,
    updatePassword
};
