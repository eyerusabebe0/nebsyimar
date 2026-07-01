const { sequelize } = require('./models'); // ⚠️ Make sure this points to wherever your models are imported!
// If your Sequelize instance is configured elsewhere, use that path instead. For example:
// const sequelize = require('./config/db'); 

async function sync() {
  try {
    console.log('Connecting to PostgreSQL and creating tables...');
    // force: true will drop and recreate all tables
    await sequelize.sync({ force: true }); 
    console.log('SUCCESS: All database tables synced perfectly!');
    process.exit(0);
  } catch (error) {
    console.error('ERROR syncing database:', error);
    process.exit(1);
  }
}

sync();