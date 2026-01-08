const cloudinary = require('cloudinary').v2;
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

cloudinary.config({
    cloud_name: 'dmsfng4gw',
    api_key: '918912557465365',
    api_secret: 'kHLd6sxdsqjqQr9zdxuuNlyROKk'
});

async function testProxy() {
    const labId = 9;
    try {
        const labResult = await prisma.labResult.findUnique({
            where: { id: labId }
        });

        if (!labResult) {
            console.log('Lab result not found');
            return;
        }

        console.log('File URL:', labResult.file_url);

        const urlParts = labResult.file_url.split('/');
        const uploadIndex = urlParts.indexOf('upload');

        let publicIdWithExt;
        if (urlParts[uploadIndex + 1].startsWith('v')) {
            publicIdWithExt = urlParts.slice(uploadIndex + 2).join('/');
        } else {
            publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
        }

        const publicId = publicIdWithExt.split('.')[0];
        const format = publicIdWithExt.split('.').pop();

        console.log('Extracted PublicID:', publicId);
        console.log('Extracted Format:', format);

        const signedUrl = cloudinary.utils.private_download_url(publicId, format, {
            resource_type: 'image',
            type: 'upload',
            attachment: true,
            expires_at: Math.floor(Date.now() / 1000) + 3600
        });

        console.log('Generated Signed URL:', signedUrl);

        // Test with curl
        const { execSync } = require('child_process');
        try {
            const output = execSync(`curl -I "${signedUrl}"`).toString();
            console.log('\n--- Curl Response ---');
            console.log(output);
        } catch (curlErr) {
            console.log('Curl failed:', curlErr.message);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

testProxy();
