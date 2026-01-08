
const authService = require('../services/auth.service');
const { successResponse, errorResponse } = require('../utils/response');

// Login 
async function login(req, res, next) {
    try {
        const { user_id, email, password } = req.body;

        // Support both user_id and email for login
        const identifier = user_id || email;

        if (!identifier || !password) {
            return errorResponse(res, 'User ID/Email and password are required', 400);
        }

        const result = await authService.login(identifier, password);

        return successResponse(res, result, 'Login successful', 200);
    } catch (error) {
        if (error.message === 'Invalid credentials') {
            return errorResponse(res, 'Invalid user ID/email or password', 401);
        }
        next(error);
    }
}

// Logout

async function logout(req, res, next) {
    try {
        // Invalidate token server-side if user is authenticated
        if (req.user) {
            await authService.logout(req.user.id);
        }

        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.COOKIE_SECURE === 'true',
            sameSite: 'strict'
        });
        return successResponse(res, null, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
}

// Get me

async function getCurrentUser(req, res, next) {
    try {
        const user = await authService.getCurrentUser(req.user.id);
        return successResponse(res, user, 'User profile retrieved', 200);
    } catch (error) {
        next(error);
    }
}

// Update password
async function updatePassword(req, res, next) {
    try {
        const { password } = req.body;
        if (!password) {
            return errorResponse(res, 'Password is required', 400);
        }
        await authService.updatePassword(req.user.user_id, password);
        return successResponse(res, null, 'Password updated successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    login,
    logout,
    getCurrentUser,
    updatePassword
};
