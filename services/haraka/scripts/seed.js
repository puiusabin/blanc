// Seed script for Blanc email service
// Creates test users and aliases
// Run from monorepo root: npm run seed --filter=@blanc/mail-server

const { PrismaClient } = require('@blanc/database/generated/prisma');
const { withAccelerate } = require('@prisma/extension-accelerate');

// Initialize Prisma client with Accelerate extension
const prisma = new PrismaClient().$extends(withAccelerate());

async function main() {
    console.log('🌱 Starting seed for Blanc email service...');

    // Create FREE user
    const freeUser = await prisma.user.upsert({
        where: { email: 'test@blanc.is' },
        update: {},
        create: {
            email: 'test@blanc.is',
            planType: 'FREE',
            quotaBytes: BigInt(2 * 1024 * 1024 * 1024), // 2GB
            usedBytes: BigInt(0),
            active: true
        }
    });
    console.log('✓ Created FREE user:', freeUser.email);

    // Create PREMIUM user
    const premiumUser = await prisma.user.upsert({
        where: { email: 'premium@blanc.is' },
        update: {},
        create: {
            email: 'premium@blanc.is',
            planType: 'PREMIUM',
            quotaBytes: BigInt(20 * 1024 * 1024 * 1024), // 20GB
            usedBytes: BigInt(0),
            active: true
        }
    });
    console.log('✓ Created PREMIUM user:', premiumUser.email);

    // Create aliases for test user
    const alias1 = await prisma.alias.upsert({
        where: { aliasAddress: 'hello@blanc.is' },
        update: {},
        create: {
            aliasAddress: 'hello@blanc.is',
            targetUserId: freeUser.id,
            active: true
        }
    });
    console.log('✓ Created alias:', alias1.aliasAddress, '→', freeUser.email);

    const alias2 = await prisma.alias.upsert({
        where: { aliasAddress: 'info@blanc.is' },
        update: {},
        create: {
            aliasAddress: 'info@blanc.is',
            targetUserId: freeUser.id,
            active: true
        }
    });
    console.log('✓ Created alias:', alias2.aliasAddress, '→', freeUser.email);

    const alias3 = await prisma.alias.upsert({
        where: { aliasAddress: 'support@blanc.is' },
        update: {},
        create: {
            aliasAddress: 'support@blanc.is',
            targetUserId: premiumUser.id,
            active: true
        }
    });
    console.log('✓ Created alias:', alias3.aliasAddress, '→', premiumUser.email);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📧 Test accounts:');
    console.log('  - test@blanc.is (FREE - 2GB quota)');
    console.log('  - premium@blanc.is (PREMIUM - 20GB quota)');
    console.log('\n🔀 Aliases:');
    console.log('  - hello@blanc.is → test@blanc.is');
    console.log('  - info@blanc.is → test@blanc.is');
    console.log('  - support@blanc.is → premium@blanc.is');
}

main()
    .catch((e) => {
        console.error('❌ Error seeding database:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
