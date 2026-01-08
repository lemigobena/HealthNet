const cloudinary = require('cloudinary').v2;
const { prisma } = require('../config/db');
const { errorResponse, successResponse } = require('../utils/response');

// Configure Cloudinary from existing middleware/env logic
// We use the same credentials as in upload.middleware.js
cloudinary.config({
    cloud_name: 'dmsfng4gw',
    api_key: '918912557465365',
    api_secret: 'kHLd6sxdsqjqQr9zdxuuNlyROKk'
});

/**
 * Generate a signed Cloudinary download URL for a lab result
 */
const getLabResultDownloadUrl = async (req, res) => {
    try {
        const { labId } = req.params;
        const userId = req.user.id;
        const userRole = req.user.role;

        console.log(`[DEBUG Proxy] Download request for Lab ID: ${labId} by User: ${userId} (${userRole})`);

        // Find the lab result
        const labResult = await prisma.labResult.findUnique({
            where: { id: parseInt(labId) },
            include: {
                patient: true,
                doctor: true
            }
        });

        if (!labResult) {
            console.log(`[DEBUG Proxy] Lab result ${labId} not found`);
            return errorResponse(res, 'Lab result not found', 404);
        }

        console.log(`[DEBUG Proxy] Lab Result found. Patient: ${labResult.patient_id}, Doctor: ${labResult.doctor_id}`);
        console.log(`[DEBUG Proxy] User Doctor ID: ${req.user.doctor_profile?.doctor_id}, User Patient ID: ${req.user.patient_profile?.patient_id}`);

        // Authorization check
        // Doctors can download if they are the owner or have the patient assigned
        // Patients can download if it's their own result
        let isAuthorized = false;

        if (userRole === 'DOCTOR') {
            if (labResult.doctor_id === req.user.doctor_profile?.doctor_id) {
                isAuthorized = true;
            } else {
                // Check if patient is assigned to this doctor
                const assignment = await prisma.patientDoctor.findFirst({
                    where: {
                        patient_id: labResult.patient_id,
                        doctor_id: req.user.doctor_profile?.doctor_id
                    }
                });
                if (assignment) isAuthorized = true;
            }
        } else if (userRole === 'PATIENT') {
            if (labResult.patient_id === req.user.patient_profile?.patient_id) {
                isAuthorized = true;
            }
        } else if (userRole === 'ADMIN') {
            isAuthorized = true;
        }

        if (!isAuthorized) {
            console.log(`[DEBUG Proxy] Unauthorized access attempt by ${userId} for lab ${labId}`);
            return errorResponse(res, 'Unauthorized to access this file', 403);
        }

        console.log(`[DEBUG Proxy] Authorized. File URL: ${labResult.file_url}`);

        if (!labResult.file_url) {
            return errorResponse(res, 'No file attached to this lab result', 404);
        }

        // If it's already an absolute URL but not Cloudinary, just return it
        // If it's a relative URL, prepend backend base
        if (!labResult.file_url.includes('cloudinary.com')) {
            const fullUrl = labResult.file_url.startsWith('http')
                ? labResult.file_url
                : `${process.env.BACKEND_URL || 'https://backend-jgdk.onrender.com'}${labResult.file_url}`;
            return successResponse(res, { download_url: fullUrl }, 'Direct download URL generated');
        }

        // It's a Cloudinary URL, we need to generate a signed private download URL
        // Extract public_id from the URL
        // Format: .../upload/v123456/folder/subfolder/file.pdf
        const urlParts = labResult.file_url.split('/');
        const uploadIndex = urlParts.indexOf('upload');
        if (uploadIndex === -1) {
            return errorResponse(res, 'Invalid Cloudinary URL structure', 500);
        }

        // The public_id starts after the version (v...) or directly after upload if no version
        let publicIdWithExt;
        if (urlParts[uploadIndex + 1].startsWith('v')) {
            publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
        } else {
            publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
        }

        // Remove extension
        const publicId = publicIdWithExt.split('.')[0];
        const format = publicIdWithExt.split('.').pop();

        // Generate private download URL
        // We use resource_type: 'image' because that's how they were uploaded (pdf as image)
        // We try 'image' first, if it fails we can't easily check 'raw' here without extra API calls,
        // but based on our debugging, 'image' is the type.
        const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
            resource_type: 'image',
            type: 'upload',
            attachment: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600 // 1 hour
        });

        return successResponse(res, { download_url: signedUrl }, 'Signed download URL generated successfully');

    } catch (error) {
        console.error('Error in getLabResultDownloadUrl:', error);
        return errorResponse(res, 'Internal server error while generating download URL', 500);
    }
};

module.exports = {
    getLabResultDownloadUrl
};
