const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// Fallback to hardcoded if env missing (just in case)
if (!process.env.CLOUDINARY_CLOUD_NAME) {
    cloudinary.config({
        cloud_name: 'dmsfng4gw',
        api_key: '918912557465365',
        api_secret: 'kHLd6sxdsqjqQr9zdxuuNlyROKk'
    });
} else {
    cloudinary.config({
        cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
        api_key: process.env.CLOUDINARY_API_KEY,
        api_secret: process.env.CLOUDINARY_API_SECRET
    });
}

async function checkResource() {
    try {
        console.log('Listing resources in folder...');
        const list = await cloudinary.api.resources({
            type: 'upload',
            prefix: 'healthnet/lab-results',
            max_results: 10
        });
        console.log('Found resources:', list.resources.map(r => ({
            public_id: r.public_id,
            type: r.resource_type,
            format: r.format,
            access_mode: r.access_mode
        })));

        const publicId = 'healthnet/lab-results/gb8zpzaak9t1dfmuheno';
        console.log(`\nChecking specific resource: ${publicId}...`);
        const result = await cloudinary.api.resource(publicId);
        console.log('--- Resource Details ---');
        console.log('Access Mode:', result.access_mode);
        console.log('Format:', result.format);
        console.log('Type:', result.type);
        console.log('URL:', result.secure_url);

        const privateUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
            resource_type: 'image',
            type: 'upload',
            expires_at: Math.floor(Date.now() / 1000) + 3600
        });
        console.log('\n--- Private Download URL ---');
        console.log(privateUrl);

    } catch (e) {
        console.log('Error:', e);
    }
}

checkResource();
