const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUrls() {
    try {
        const results = await prisma.labResult.findMany({
            orderBy: { id: 'desc' },
            take: 10,
            select: {
                id: true,
                file_name: true,
                file_url: true,
                type: true
            }
        });

        console.log('Recent Lab Results:');
        results.forEach(r => {
            console.log(`ID: ${r.id}, Name: ${r.file_name}, URL: ${r.file_url}`);
        });
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

checkUrls();
