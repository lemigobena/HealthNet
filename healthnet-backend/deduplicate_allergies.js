
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function deduplicateAllergies() {
    try {
        console.log("Starting deduplication...");
        const allergies = await prisma.allergy.findMany({
            orderBy: { id: 'asc' }
        });

        const seen = new Set();
        const duplicates = [];

        for (const allergy of allergies) {
            const key = `${allergy.patient_id}-${allergy.allergies.toLowerCase().trim()}`;
            if (seen.has(key)) {
                duplicates.push(allergy.id);
            } else {
                seen.add(key);
            }
        }

        console.log(`Found ${duplicates.length} duplicates.`);

        if (duplicates.length > 0) {
            await prisma.allergy.deleteMany({
                where: {
                    id: { in: duplicates }
                }
            });
            console.log("Duplicates deleted.");
        } else {
            console.log("No duplicates found.");
        }

    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

deduplicateAllergies();
