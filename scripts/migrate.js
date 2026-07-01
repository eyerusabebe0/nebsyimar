const { sequelize, testConnection } = require('../src/config/database');
const models = require('../src/models');

async function migrate() {
  console.log('🚀 Starting database migration...');
  
  try {
    // Test database connection first
    console.log('📡 Testing database connection...');
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('❌ Database connection failed. Please check your database configuration.');
      process.exit(1);
    }

    // Sync all models (create tables)
    console.log('📋 Creating database tables...');
    console.log('⚠️  WARNING: This will drop and recreate all tables, deleting existing data!');
    await sequelize.sync({ 
      force: true,  // Drop and recreate all tables (WARNING: This will delete all data)
      alter: false  // Don't alter existing tables to avoid conflicts
    });

    console.log('✅ Database migration completed successfully!');
    console.log('📊 All tables have been created/updated according to model definitions.');
    
    // List all created tables
    const queryInterface = sequelize.getQueryInterface();
    const tables = await queryInterface.showAllTables();
    console.log('📋 Created tables:', tables.join(', '));

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await sequelize.close();
    console.log('🔌 Database connection closed.');
  }
}

// Run migration if this script is executed directly
if (require.main === module) {
  migrate();
}

module.exports = migrate;
