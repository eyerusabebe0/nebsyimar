const { sequelize, User } = require('../src/models');
const bcrypt = require('bcryptjs');

const fixTestUserPassword = async () => {
  try {
    console.log('🔧 Fixing test user password...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Find the test user
    const user = await User.findOne({
      where: { email: 'test@example.com' }
    });

    if (!user) {
      console.log('❌ Test user not found');
      return;
    }

    console.log('✅ Test user found');

    // Hash the password manually (bypassing the beforeSave hook)
    const plainPassword = 'password123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('🔐 Original password:', plainPassword);
    console.log('🔐 New hash:', hashedPassword);
    
    // Test the hash immediately
    const testResult = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('🔐 Hash test result:', testResult);

    if (!testResult) {
      console.log('❌ Hash test failed - something is wrong with bcrypt');
      return;
    }

    // Update the user's password directly in the database
    await User.update(
      { password: hashedPassword },
      { 
        where: { email: 'test@example.com' },
        individualHooks: false // Skip the beforeSave hook to avoid double hashing
      }
    );

    console.log('✅ Password updated successfully');

    // Verify the update worked
    const updatedUser = await User.findOne({
      where: { email: 'test@example.com' }
    });

    const finalTest = await bcrypt.compare(plainPassword, updatedUser.password);
    console.log('🔐 Final verification:', finalTest);

    if (finalTest) {
      console.log('🎉 Password fix successful!');
    } else {
      console.log('❌ Password fix failed');
    }

  } catch (error) {
    console.error('❌ Error fixing password:', error);
  }
};

// Run the fix
fixTestUserPassword()
  .then(() => {
    console.log('✅ Password fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Password fix failed:', error);
    process.exit(1);
  });
