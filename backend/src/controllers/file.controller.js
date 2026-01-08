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

        // Find the lab result - handle both numeric ID and the LAB- format
        let labResult;
        try {
            const isBusinessId = typeof labId === 'string' && labId.startsWith('LAB-');

            labResult = await prisma.labResult.findFirst({
                where: isBusinessId ? { lab_id: labId } : { id: parseInt(labId) || 0 },
                include: {
                    patient: true,
                    doctor: true
                }
            });
        } catch (dbErr) {
            console.error('[DEBUG Proxy] Database lookup failed:', dbErr);
            throw dbErr;
        }

        if (!labResult) {
            console.log(`[DEBUG Proxy] Lab result ${labId} not found`);
            return errorResponse(res, 'Lab result not found', 404);
        }

        console.log(`[DEBUG Proxy] Lab Result found. Patient: ${labResult.patient_id}, Doctor: ${labResult.doctor_id}`);

        // Authorization check
        let isAuthorized = false;
        if (userRole === 'DOCTOR') {
            if (labResult.doctor_id === req.user.doctor_profile?.doctor_id) {
                isAuthorized = true;
            } else {
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

        if (!labResult.file_url) {
            console.log('[DEBUG Proxy] No file_url found for record');
            return errorResponse(res, 'No file attached to this lab result', 404);
        }

        // If it's already an absolute URL but not Cloudinary
        if (!labResult.file_url.includes('cloudinary.com')) {
            const fullUrl = labResult.file_url.startsWith('http')
                ? labResult.file_url
                : `${process.env.BACKEND_URL || 'https://backend-jgdk.onrender.com'}${labResult.file_url}`;
            return successResponse(res, { download_url: fullUrl }, 'Direct download URL generated');
        }

        // Extracting Public ID
        let publicId, format;
        try {
            const urlParts = labResult.file_url.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex === -1) throw new Error('Invalid Cloudinary URL');

            let publicIdWithExt;
            if (urlParts[uploadIndex + 1].startsWith('v')) {
                publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
            } else {
                publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
            }

            publicId = publicIdWithExt.split('.')[0];
            format = publicIdWithExt.split('.').pop();
            console.log(`[DEBUG Proxy] Extracted Public ID: ${publicId}, Format: ${format}`);
        } catch (extractErr) {
            console.error('[DEBUG Proxy] ID extraction failed:', extractErr);
            throw extractErr;
        }

        // Signing URL
        try {
            const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
                resource_type: 'image',
                type: 'upload',
                attachment: true,
                expires_at: Math.floor(Date.now() / 1000) + 3600
            });
            console.log('[DEBUG Proxy] Signed URL generated successfully');
            return successResponse(res, { download_url: signedUrl }, 'Signed download URL generated successfully');
        } catch (signErr) {
            console.error('[DEBUG Proxy] Cloudinary signing failed:', signErr);
            throw signErr;
        }

    } catch (error) {
        console.error('Error in getLabResultDownloadUrl:', error);
        return errorResponse(res, `Internal server error: ${error.message}`, 500);
    }
};

module.exports = {
    getLabResultDownloadUrl
};
