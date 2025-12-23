// Seed script for Blanc email service
// Creates test users and aliases
// Run from monorepo root: npm run seed --filter=@blanc/mail-server

// Load environment variables from root .env file
require('dotenv').config({ path: require('path').resolve(__dirname, '../../../.env') });

const { db, users, aliases, eq } = require('@blanc/database');

async function main() {
    console.log('🌱 Starting seed for Blanc email service...');

    // Create FREE user (upsert pattern)
    const existingFreeUser = await db.query.users.findFirst({
        where: eq(users.email, 'test@blanc.is')
    });

    const freeUser = existingFreeUser || (await db.insert(users).values({
        email: 'test@blanc.is',
        planType: 'FREE',
        quotaBytes: BigInt(2 * 1024 * 1024 * 1024), // 2GB
        usedBytes: BigInt(0),
        active: true
    }).returning())[0];

    console.log('✓ Created FREE user:', freeUser.email);

    // Create PREMIUM user (upsert pattern)
    const existingPremiumUser = await db.query.users.findFirst({
        where: eq(users.email, 'premium@blanc.is')
    });

    const premiumUser = existingPremiumUser || (await db.insert(users).values({
        email: 'premium@blanc.is',
        planType: 'PREMIUM',
        quotaBytes: BigInt(20 * 1024 * 1024 * 1024), // 20GB
        usedBytes: BigInt(0),
        active: true
    }).returning())[0];

    console.log('✓ Created PREMIUM user:', premiumUser.email);

    // Create testuser (FREE user with upsert pattern)
    const existingTestUser = await db.query.users.findFirst({
        where: eq(users.email, 'testuser@blanc.is')
    });

    const testUser = existingTestUser || (await db.insert(users).values({
        email: 'testuser@blanc.is',
        planType: 'FREE',
        quotaBytes: BigInt(2 * 1024 * 1024 * 1024), // 2GB
        usedBytes: BigInt(0),
        active: true
    }).returning())[0];

    console.log('✓ Created FREE user:', testUser.email);

    // Create aliases for test user
    const existingAlias1 = await db.query.aliases.findFirst({
        where: eq(aliases.aliasAddress, 'hello@blanc.is')
    });

    const alias1 = existingAlias1 || (await db.insert(aliases).values({
        aliasAddress: 'hello@blanc.is',
        targetUserId: freeUser.id,
        active: true
    }).returning())[0];

    console.log('✓ Created alias:', alias1.aliasAddress, '→', freeUser.email);

    const existingAlias2 = await db.query.aliases.findFirst({
        where: eq(aliases.aliasAddress, 'info@blanc.is')
    });

    const alias2 = existingAlias2 || (await db.insert(aliases).values({
        aliasAddress: 'info@blanc.is',
        targetUserId: freeUser.id,
        active: true
    }).returning())[0];

    console.log('✓ Created alias:', alias2.aliasAddress, '→', freeUser.email);

    const existingAlias3 = await db.query.aliases.findFirst({
        where: eq(aliases.aliasAddress, 'support@blanc.is')
    });

    const alias3 = existingAlias3 || (await db.insert(aliases).values({
        aliasAddress: 'support@blanc.is',
        targetUserId: premiumUser.id,
        active: true
    }).returning())[0];

    console.log('✓ Created alias:', alias3.aliasAddress, '→', premiumUser.email);

    console.log('\n✅ Seed completed successfully!');
    console.log('\n📧 Test accounts:');
    console.log('  - test@blanc.is (FREE - 2GB quota)');
    console.log('  - testuser@blanc.is (FREE - 2GB quota)');
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
        // Drizzle doesn't require explicit disconnect
        process.exit(0);
    });
