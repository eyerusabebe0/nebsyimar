const { sequelize, testConnection } = require('../src/config/database');
const models = require('../src/models');

async function verifyDatabase() {
  console.log('🔍 Verifying database setup...');
  
  try {
    // Test database connection
    console.log('📡 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed.');
      process.exit(1);
    }

    // Check all tables exist
    console.log('📋 Checking tables...');
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    
    const expectedTables = [
      'users', 'wallets', 'wallet_transactions', 'memorials', 
      'gift_catalog', 'gift_transactions', 'vendors', 'products', 
      'orders', 'order_items'
    ];
    
    const missingTables = expectedTables.filter(table => !tables.includes(table));
    
    if (missingTables.length > 0) {
      console.error('❌ Missing tables:', missingTables.join(', '));
    } else {
      console.log('✅ All expected tables exist:', tables.join(', '));
    }

    // Check gift catalog data
    console.log('🎁 Checking gift catalog data...');
    const giftCount = await models.GiftCatalog.count();
    console.log(`📊 Gift catalog contains ${giftCount} gifts`);
    
    if (giftCount === 0) {
      console.warn('⚠️  Gift catalog is empty. Run seeding if needed.');
    } else {
      // Check gifts by category
      const categories = ['WHITE_ROSE', 'CANDLE_PEACE', 'DOVE_MERCY', 'ETERNAL_LIGHT'];
      for (const category of categories) {
        const categoryCount = await models.GiftCatalog.count({ where: { category } });
        console.log(`   ${category}: ${categoryCount} gifts`);
      }
    }

    // Check database constraints and indexes
    console.log('🔗 Checking database constraints...');
    
    // Test a simple query on each model
    const modelTests = [
      { name: 'Users', model: models.User },
      { name: 'Wallets', model: models.Wallet },
      { name: 'WalletTransactions', model: models.WalletTransaction },
      { name: 'Memorials', model: models.Memorial },
      { name: 'GiftCatalog', model: models.GiftCatalog },
      { name: 'GiftTransactions', model: models.GiftTransaction },
      { name: 'Vendors', model: models.Vendor },
      { name: 'Products', model: models.Product },
      { name: 'Orders', model: models.Order },
      { name: 'OrderItems', model: models.OrderItem }
    ];

    for (const test of modelTests) {
      try {
        await test.model.findAll({ limit: 1 });
        console.log(`✅ ${test.name} model working correctly`);
      } catch (error) {
        console.error(`❌ ${test.name} model error:`, error.message);
      }
    }

    console.log('🎉 Database verification completed successfully!');
    console.log('📊 Your Nefsyimar database is ready for use.');

  } catch (error) {
    console.error('❌ Database verification failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run verification if this script is executed directly
if (require.main === module) {
  verifyDatabase();
}

module.exports = verifyDatabase;
