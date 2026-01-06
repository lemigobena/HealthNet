

require('dotenv').config();
const app = require('./app');
const { prisma } = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
    try {
        // Test database connection
        await prisma.$queryRaw`SELECT 1`;
        console.log('Database connected successfully (Prisma 6)');

        // Start server
        app.listen(PORT, () => {
            console.log(`HealthNet Backend running on port ${PORT}`);
            console.log(`Health check: http://localhost:${PORT}/health`);
            console.log(`API base: http://localhost:${PORT}/api`);
        });
    } catch (error) {
        console.error(' Failed to start server:', error);
        process.exit(1);
    }
}

// Handle shutdown gracefully
process.on('SIGINT', async () => {
    console.log('\n Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    console.log('\n Shutting down gracefully...');
    await prisma.$disconnect();
    process.exit(0);
});

startServer();
