
const { prisma } = require('../config/db');

// Get all facilities
async function getAllFacilities() {
    const facilities = await prisma.facility.findMany({
        select: {
            id: true,
            hospital_id: true,
            name: true,
            type: true,
            city_town: true,
            phone: true,
            email: true,
            address: true
        },
        orderBy: {
            name: 'asc'
        }
    });

    return facilities;
}

module.exports = {
    getAllFacilities
};
