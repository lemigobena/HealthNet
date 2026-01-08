const { PrismaClient } = require('@prisma/client');
const cloudinary = require('cloudinary').v2;
const fs = require('fs');
const path = require('path');

const prisma = new PrismaClient();

// Configure Cloudinary with HARDCODED credentials from upload.middleware.js
cloudinary.config({
    cloud_name: 'dmsfng4gw',
    api_key: '918912557465365',
    api_secret: 'kHLd6sxdsqjqQr9zdxuuNlyROKk'
});

async function migrateUploads() {
    console.log('Starting migration...');
    console.log('Credentials loaded (Hardcoded).');

    try {
        const allResults = await prisma.labResult.findMany();

        // Filter for results that need migration
        const resultsToMigrate = allResults.filter(result =>
            result.file_url &&
            !result.file_url.startsWith('http')
        );

        console.log(`Found ${resultsToMigrate.length} files to migrate.`);

        for (const result of resultsToMigrate) {
            // Extract just the basename 
            const storedBasename = path.basename(result.file_path);

            const potentialPath = path.join(__dirname, '../uploads/lab-results', storedBasename);
            let localFilePath;

            if (fs.existsSync(potentialPath)) {
                localFilePath = potentialPath;
            } else {
                const rootUploadPath = path.join(__dirname, '../uploads', storedBasename);
                if (fs.existsSync(rootUploadPath)) {
                    localFilePath = rootUploadPath;
                } else {
                    console.warn(`Skipping ${result.id} (File not found)`);
                    continue;
                }
            }

            console.log(`Uploading ${localFilePath}...`);

            try {
                // Upload to Cloudinary
                const uploadResponse = await cloudinary.uploader.upload(localFilePath, {
                    folder: 'healthnet/lab-results',
                    resource_type: 'auto',
                    public_id: path.parse(storedBasename).name
                });

                const newUrl = uploadResponse.secure_url;
                console.log(`✅ Uploaded to Cloudinary: ${newUrl}`);

                // Update Database
                await prisma.labResult.update({
                    where: { id: result.id },
                    data: {
                        file_url: newUrl,
                    }
                });

            } catch (uploadError) {
                console.error(`❌ Failed to upload ${result.id}`);
                if (uploadError.message) console.error(uploadError.message);
                else console.error(uploadError);
            }
        }

        console.log('Migration completed.');

    } catch (error) {
        console.error('Migration failed:', error);
    } finally {
        await prisma.$disconnect();
    }
}

migrateUploads();
