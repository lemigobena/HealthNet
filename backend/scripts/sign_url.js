const cloudinary = require('cloudinary').v2;
require('dotenv').config();

cloudinary.config({
    cloud_name: 'dmsfng4gw',
    api_key: '918912557465365',
    api_secret: 'kHLd6sxdsqjqQr9zdxuuNlyROKk'
});

const publicId = 'healthnet/lab-results/gb8zpzaak9t1dfmuheno';

const url = cloudinary.url(publicId, {
    resource_type: 'image',
    format: 'pdf',
    sign_url: true,
    // Add fl_attachment to force download which might be what we want ultimately
    // But for "rescuing", just getting the file is enough.
    transformation: [{ flags: "attachment" }],
    version: '1767896188',
    type: 'upload'
});

console.log('Signed URL:', url);
