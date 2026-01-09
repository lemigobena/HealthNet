
const facilityService = require('../services/facility.service');
const { successResponse, errorResponse } = require('../utils/response');

// Get all facilities
async function getAllFacilities(req, res, next) {
    try {
        const facilities = await facilityService.getAllFacilities();
        return successResponse(res, facilities, 'Facilities retrieved successfully');
    } catch (error) {
        next(error);
    }
}

module.exports = {
    getAllFacilities
};
