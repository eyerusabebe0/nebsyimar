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

const createTestUser = async () => {
  try {
    console.log('🌱 Creating test user...');

    // Check if database is connected
    await sequelize.authenticate();
    console.log('✅ Database connection established.');

    // Sync models
    await sequelize.sync();
    console.log('✅ Database models synchronized.');

    // Check if test user already exists
    const existingUser = await User.findOne({
      where: { email: TEST_USER.email }
    });

    if (existingUser) {
      console.log('⚠️  Test user already exists!');
      console.log(`📧 Email: ${TEST_USER.email}`);
      console.log(`🔑 Password: ${TEST_USER.password}`);
      return;
    }

    // Hash password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(TEST_USER.password, saltRounds);

    // Create test user
    const user = await User.create({
      name: TEST_USER.name,
      email: TEST_USER.email,
      password: hashedPassword,
      role: TEST_USER.role,
      verified: TEST_USER.verified
    });

    // Create wallet for the test user
    await Wallet.create({
      user_id: user.user_id,
      balance: 100.00 // Give test user some starting balance
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email:', TEST_USER.email);
    console.log('🔑 Password:', TEST_USER.password);
    console.log('👤 Role:', TEST_USER.role);
    console.log('💰 Starting balance: 100.00 ETB');
    
  } catch (error) {
    console.error('❌ Error creating test user:', error);
    throw error;
  }
};

// Run if called directly
if (require.main === module) {
  createTestUser()
    .then(() => {
      console.log('✅ Test user creation completed. Exiting...');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Test user creation failed:', error);
      process.exit(1);
    });
}

module.exports = {
  createTestUser,
  TEST_USER
};
