const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configure Cloudinary
cloudinary.config({
    cloud_name: 'dmsfng4gw',
    api_key: '918912557465365',
    api_secret: 'kHLd6sxdsqjqQr9zdxuuNlyROKk'
});

// Configure Cloudinary Storage
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: {
        folder: 'healthnet/lab-results',
        resource_type: 'auto', // Auto-detect image or video
        allowed_formats: ['jpg', 'png', 'jpeg', 'pdf', 'mp4', 'mkv', 'webm', 'avi'],
    },
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 20 * 1024 * 1024 }, // Increased to 20MB for videos/cloud
    // CloudinaryStorage handles validation, but we can keep basic checks if needed. 
    // Usually 'allowed_formats' in params is enough.
});

module.exports = {
    upload
};
