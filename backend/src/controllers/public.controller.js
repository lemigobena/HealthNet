const { prisma } = require('../config/db');
const { successResponse } = require('../utils/response');

/**
 * Get public stats for landing page
 */
const getLandingStats = async (req, res, next) => {
    try {
        const [patientCount, facilityCount] = await Promise.all([
            prisma.patient.count(),
            prisma.facility.count()
        ]);

        return successResponse(res, {
            patients: patientCount,
            facilities: facilityCount,
            security: 100 // Hardcoded proof of principle for marketing
        }, 'Public stats retrieved successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = {
    getLandingStats
};
