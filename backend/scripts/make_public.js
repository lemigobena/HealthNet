const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: 'dmsfng4gw',
    api_key: '918912557465365',
    api_secret: 'kHLd6sxdsqjqQr9zdxuuNlyROKk'
});

async function makePublic() {
    const publicId = 'healthnet/lab-results/gb8zpzaak9t1dfmuheno';
    try {
        console.log(`Updating resource: ${publicId}...`);
        const result = await cloudinary.api.update(publicId, {
            access_mode: 'public',
            resource_type: 'image'
        });
        console.log('Update Result:', result);
    } catch (e) {
        console.log('Error:', e);
    }
}

makePublic();
