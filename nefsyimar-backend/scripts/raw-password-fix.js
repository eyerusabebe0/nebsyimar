const { sequelize } = require('../src/models');
const bcrypt = require('bcryptjs');

const rawPasswordFix = async () => {
  try {
    console.log('🔧 Fixing password with raw SQL...');

    // Connect to database
    await sequelize.authenticate();
    console.log('✅ Database connected');

    // Hash the password
    const plainPassword = 'password123';
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);
    
    console.log('🔐 Plain password:', plainPassword);
    console.log('🔐 Hashed password:', hashedPassword);
    
    // Test the hash
    const testResult = await bcrypt.compare(plainPassword, hashedPassword);
    console.log('🔐 Hash test result:', testResult);

    if (!testResult) {
      console.log('❌ Hash test failed');
      return;
    }

    // Update password using raw SQL
    const [results, metadata] = await sequelize.query(
      'UPDATE users SET password = $1 WHERE email = $2',
      {
        bind: [hashedPassword, 'test@example.com']
      }
    );

    console.log('✅ Password updated via raw SQL');

    // Verify the update
    const [user] = await sequelize.query(
      'SELECT email, password FROM users WHERE email = $1',
      {
        bind: ['test@example.com']
      }
    );

    if (user && user.length > 0) {
      const storedHash = user[0].password;
      console.log('🔐 Stored hash:', storedHash);
      
      const finalTest = await bcrypt.compare(plainPassword, storedHash);
      console.log('🔐 Final verification:', finalTest);

      if (finalTest) {
        console.log('🎉 Password fix successful!');
        console.log('📧 Email: test@example.com');
        console.log('🔑 Password: password123');
      } else {
        console.log('❌ Password fix failed');
      }
    }

  } catch (error) {
    console.error('❌ Error:', error);
  }
};

rawPasswordFix()
  .then(() => {
    console.log('✅ Raw password fix completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Raw password fix failed:', error);
    process.exit(1);
  });
