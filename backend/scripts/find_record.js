const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function findRecord() {
    const urlSegment = 'gb8zpzaak9t1dfmuheno';
    try {
        const record = await prisma.labResult.findFirst({
            where: {
                file_url: {
                    contains: urlSegment
                }
            }
        });
        console.log('Found Record:', record);

        if (record) {
            const fs = require('fs');
            const path = require('path');
            // Try to locate the local file
            const localPath = path.join(__dirname, '../uploads/lab-results', record.file_path);
            console.log('Checking local file path:', localPath);
            if (fs.existsSync(localPath)) {
                console.log('LOCAL FILE EXISTS!');
            } else {
                console.log('Local file MISSING.');
            }
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

findRecord();
