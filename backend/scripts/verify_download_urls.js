const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function verifyUrls() {
    try {
        const results = await prisma.labResult.findMany({
            orderBy: { id: 'desc' },
            take: 20
        });

        console.log('Simulating Frontend URL Construction:');
        results.forEach(r => {
            const fileUrl = r.file_url;
            let fullUrl = "N/A";

            if (fileUrl) {
                fullUrl = fileUrl.startsWith('http') ? fileUrl : `https://backend-jgdk.onrender.com${fileUrl}`;
            }

            console.log(`ID: ${r.id}`);
            console.log(`Original: ${fileUrl}`);
            console.log(`Result:   ${fullUrl}`);
            console.log('---');
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

verifyUrls();
