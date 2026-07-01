const { sequelize, User, Wallet } = require('../src/models');
const bcrypt = require('bcryptjs');

// Test user credentials
const TEST_USER = {
  name: 'Test User',
  email: 'test@example.com',
  password: 'password123', // Plain text password
  role: 'Public User',
  verified: true
};

const resetTestUser = async () => {
  try {
    console.log('🔄 Resetting test user...');

    // Check if database is connected
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models
    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    // Delete existing test user and wallet
    const existingUser = await User.findOne({
      where: { email: TEST_USER.email }
    });

    if (existingUser) {
      // Delete wallet first (foreign key constraint)
      await Wallet.destroy({
        where: { user_id: existingUser.user_id }
      });
      console.log('🗑️  Deleted existing wallet');

      // Delete user
      await User.destroy({
        where: { email: TEST_USER.email }
      });
      console.log('🗑️  Deleted existing user');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(TEST_USER.password, saltRounds);
    console.log('🔐 Password hashed with salt rounds:', saltRounds);

    // Create new test user
    const user = await User.create({
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: hashedPassword,
      role: TEST_USER.role,
      verified: TEST_USER.verified,
      is_active: true
    });

    // Create wallet for the test user
    await Wallet.create({
      user_id: user.user_id,
      balance: 100.00 // Give test user some starting balance
    });

    console.log('✅ Test user recreated successfully!');
    console.log('📧 Email:', TEST_USER.email);
    console.log('🔑 Password:', TEST_USER.password);
    console.log('👤 Role:', TEST_USER.role);
    console.log('💰 Starting balance: 100.00 ETB');
    console.log('🔐 Password properly hashed');

  } catch (error) {
    console.error('❌ Error resetting test user:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  resetTestUser()
    .then(() => {
      console.log('✅ Test user reset completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test user reset failed:', error);
      process.exit(1);
    });
}

module.exports = {
  resetTestUser,
  TEST_USER
};
