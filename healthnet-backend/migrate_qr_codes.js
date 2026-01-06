
const { PrismaClient } = require('@prisma/client');
const QRCode = require('qrcode');
const prisma = new PrismaClient();

async function migrateQRCodes() {
    try {
        console.log("Starting QR code migration...");
        const qrCodes = await prisma.qRCode.findMany(); // Use correct model name

        console.log(`Found ${qrCodes.length} QR codes to process.`);

        for (const code of qrCodes) {
            // New content format: URL
            const qrContent = `http://localhost:5173/emergency/${code.patient_id}`;

            // Generate new data URL (image) with this content
            const newQrImage = await QRCode.toDataURL(qrContent);

            // Update DB
            await prisma.qRCode.update({
                where: { qr_id: code.qr_id },
                data: { qr_code_url: newQrImage }
            });
            console.log(`Updated QR code for patient ${code.patient_id}`);
        }

        console.log("Migration complete.");

    } catch (e) {
        console.error("Migration failed:", e);
    } finally {
        await prisma.$disconnect();
    }
}

migrateQRCodes();
