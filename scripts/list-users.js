const { sequelize, User } = require('../src/models');

const listUsers = async () => {
  try {
    console.log('🔍 Checking users in database...');

    // Check if database is connected
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Get all users
    const users = await User.findAll({
      attributes: ['user_id', 'name', 'email', 'role', 'verified', 'is_active', 'created_at'],
      order: [['createdAt', 'DESC']]
    });

    console.log(`📊 Found ${users.length} users in database:`);
    
    if (users.length === 0) {
      console.log('❌ No users found in database!');
    } else {
      console.log('\n👥 Users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. ${user.name} (${user.email})`);
        console.log(`   ID: ${user.user_id}`);
        console.log(`   Role: ${user.role}`);
        console.log(`   Verified: ${user.verified}`);
        console.log(`   Active: ${user.is_active}`);
        console.log(`   Created: ${user.created_at}`);
        console.log('');
      });
    }
    
  } catch (error) {
    console.error('❌ Error listing users:', error);
    throw error;
  } finally {
    await sequelize.close();
  }
};

// Run if called directly
if (require.main === module) {
  listUsers()
    .then(() => {
      console.log('✅ User listing completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ User listing failed:', error);
      process.exit(1);
    });
}

module.exports = listUsers;
