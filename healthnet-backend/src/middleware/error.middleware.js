

const { errorResponse } = require('../utils/response');


function errorHandler(err, req, res, next) {
    console.error('Error:', err);

    // JSON parsing errors
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        return errorResponse(res, `Invalid JSON formatting: ${err.message}`, 400);
    }

    // Prisma errors
    if (err.code && err.code.startsWith('P')) {
        if (err.code === 'P2002') {
            return errorResponse(res, 'A record with this value already exists', 409);
        }
        if (err.code === 'P2025') {
            return errorResponse(res, 'Record not found', 404);
        }
        return errorResponse(res, 'Database error', 500);
    }

    // Validation errors
    if (err.name === 'ValidationError') {
        return errorResponse(res, 'Validation failed', 400, err.errors);
    }

    // JWT errors
    if (err.name === 'JsonWebTokenError') {
        return errorResponse(res, 'Invalid token', 401);
    }

    if (err.name === 'TokenExpiredError') {
        return errorResponse(res, 'Token expired', 401);
    }

    // Default error
    const statusCode = err.statusCode || 500;
    const message = err.message || 'Internal server error';

    return errorResponse(res, message, statusCode);
}

// 404 Not Found handler

function notFoundHandler(req, res) {
    console.log(`!!! 404 triggered for: ${req.method} ${req.originalUrl}`);
    return errorResponse(res, 'Route not found', 404);
}

module.exports = {
    errorHandler,
    notFoundHandler
};
