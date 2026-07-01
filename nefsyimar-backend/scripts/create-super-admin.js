const { sequelize, User, Wallet } = require('../src/models');
const bcrypt = require('bcryptjs');
const readline = require('readline');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt user for input
const prompt = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

// Function to prompt for password (hidden input)
const promptPassword = (question) => {
  return new Promise((resolve) => {
    process.stdout.write(question);
    process.stdin.setRawMode(true);
    process.stdin.resume();
    process.stdin.setEncoding('utf8');
    
    let password = '';
    process.stdin.on('data', function(char) {
      char = char + '';
      
      switch(char) {
        case '\n':
        case '\r':
        case '\u0004':
          process.stdin.setRawMode(false);
          process.stdin.pause();
          process.stdout.write('\n');
          resolve(password);
          break;
        case '\u0003':
          process.exit();
          break;
        case '\u007f': // Backspace
          if (password.length > 0) {
            password = password.slice(0, -1);
            process.stdout.write('\b \b');
          }
          break;
        default:
          password += char;
          process.stdout.write('*');
          break;
      }
    });
  });
};

const createSuperAdmin = async () => {
  try {
    console.log('🔧 Super Admin Setup Script');
    console.log('============================\n');

    // Check if database is connected
    await sequelize.authenticate();
    console.log('✅ Database connection established.\n');

    // Sync models
    await sequelize.sync();
    console.log('✅ Database models synchronized.\n');

    // Get Super Admin email from environment
    const superAdminEmail = process.env.SUPER_ADMIN_EMAIL;
    const superAdminPassword = process.env.SUPER_ADMIN_PASSWORD;

    if (!superAdminEmail) {
      console.log('❌ SUPER_ADMIN_EMAIL environment variable is not set!');
      console.log('Please add SUPER_ADMIN_EMAIL=your-email@domain.com to your .env file');
      process.exit(1);
    }

    if (!superAdminPassword) {
      console.log('❌ SUPER_ADMIN_PASSWORD environment variable is not set!');
      console.log('Please add SUPER_ADMIN_PASSWORD=your-secure-password to your .env file');
      process.exit(1);
    }

    if (superAdminPassword.length < 8) {
      console.log('❌ SUPER_ADMIN_PASSWORD must be at least 8 characters long.');
      process.exit(1);
    }

    console.log(`📧 Super Admin Email: ${superAdminEmail}`);

    // Check if Super Admin already exists
    const existingAdmin = await User.findOne({
      where: { 
        email: superAdminEmail.toLowerCase(),
        role: 'Administrator'
      }
    });

    if (existingAdmin) {
      console.log('⚠️  Super Admin already exists. Ensuring credentials are up to date...');
      
      await existingAdmin.update({
        password: superAdminPassword,
        role: 'Administrator',
        verified: true,
        email_verified: true,
        is_active: true
      });

      console.log('\n✅ Super Admin updated successfully!');
      console.log(`📧 Email: ${existingAdmin.email}`);
      console.log(`👤 Name: ${existingAdmin.name}`);
      console.log(`🆔 User ID: ${existingAdmin.user_id}`);
      console.log(`✅ Active: ${existingAdmin.is_active}`);

      // Ensure wallet exists
      let wallet = await Wallet.findOne({
        where: { user_id: existingAdmin.user_id }
      });

      if (!wallet) {
        console.log('💰 Creating wallet for existing Super Admin...');
        wallet = await Wallet.create({
          user_id: existingAdmin.user_id,
          balance: 0.00,
          currency: 'ETB',
          is_frozen: false
        });
      }

      console.log(`💰 Wallet ID: ${wallet.wallet_id}`);
      console.log('🔑 Password: [Updated from SUPER_ADMIN_PASSWORD env]');
      return;
    }

    console.log('\n📝 Creating new Super Admin account...\n');

    const name = 'Super Admin';
    const phone = null;

    // Create Super Admin user (User model will handle password hashing)
    console.log('👤 Creating Super Admin user...');
    const superAdmin = await User.create({
      name,
      email: superAdminEmail.toLowerCase(),
      phone,
      password: superAdminPassword,
      role: 'Administrator',
      verified: true,
      email_verified: true,
      phone_verified: false,
      is_active: true
    });

    // Create wallet for Super Admin
    console.log('💰 Creating wallet...');
    const wallet = await Wallet.create({
      user_id: superAdmin.user_id,
      balance: 0.00,
      currency: 'ETB',
      is_frozen: false
    });

    console.log('\n🎉 Super Admin created successfully!');
    console.log('=====================================');
    console.log(`📧 Email: ${superAdminEmail}`);
    console.log(`👤 Name: ${name}`);
    console.log(`📱 Phone: ${phone || 'Not provided'}`);
    console.log(`🆔 User ID: ${superAdmin.user_id}`);
    console.log(`💰 Wallet ID: ${wallet.wallet_id}`);
    console.log('🔑 Password: [Taken from SUPER_ADMIN_PASSWORD env]');
    console.log('\n✅ You can now login with these credentials!');
    console.log('✅ This user can create other Administrators via the admin panel.');

  } catch (error) {
    console.error('❌ Error creating Super Admin:', error.message);
    if (error.name === 'SequelizeUniqueConstraintError') {
      console.log('💡 A user with this email already exists. Use a different email or delete the existing user first.');
    }
  } finally {
    rl.close();
    process.exit(0);
  }
};

// Run if called directly
if (require.main === module) {
  createSuperAdmin();
}

module.exports = {
  createSuperAdmin
};
