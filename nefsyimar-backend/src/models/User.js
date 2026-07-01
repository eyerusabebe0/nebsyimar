const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  user_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 100]
    }
  },
  username: {
    type: DataTypes.STRING(50),
    allowNull: true,
    unique: true,
    validate: {
      len: [3, 50]
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true,
    validate: {
      isEmail: true
    }
  },
  phone: {
    type: DataTypes.STRING(20),
    allowNull: true,
    unique: true,
    validate: {
      is: /^[\+]?[1-9][\d]{0,15}$/
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true, // Allow null for Google OAuth users
    validate: {
      len: [1, 255]
    }
  },
  google_id: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  role: {
    type: DataTypes.ENUM('Administrator', 'Family Account', 'Public User', 'Vendor', 'Finance Officer'),
    defaultValue: 'Public User',
    allowNull: false
  },
  verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  email_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  phone_verified: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  verification_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_password_token: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  reset_password_expires: {
    type: DataTypes.DATE,
    allowNull: true
  },
  last_login: {
    type: DataTypes.DATE,
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  is_banned: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  can_create_memorials: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  can_comment: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  ban_reason: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  banned_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  banned_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  gender: {
    type: DataTypes.STRING(20),
    allowNull: true
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  city: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  country: {
    type: DataTypes.STRING(100),
    defaultValue: 'Ethiopia'
  }
}, {
  tableName: 'users',
  indexes: [
    {
      unique: true,
      fields: ['email'],
      where: {
        email: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    {
      unique: true,
      fields: ['phone'],
      where: {
        phone: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    }
  ],
  validate: {
    emailOrPhone() {
      if (!this.email && !this.phone) {
        throw new Error('Either email or phone number is required');
      }
    },
    passwordOrGoogle() {
      if (!this.password && !this.google_id) {
        throw new Error('Either password or Google ID is required');
      }
    }
  }
});

// Hash password before saving
User.beforeSave(async (user, options) => {
  if (user.changed('password') && user.password) {
    const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
    user.password = await bcrypt.hash(user.password, saltRounds);
  }
});

// Instance methods
User.prototype.comparePassword = async function(candidatePassword) {
  console.log('🔐 Comparing password...');
  console.log('🔐 Candidate password:', candidatePassword);
  console.log('🔐 Stored hash length:', this.password ? this.password.length : 'null');
  console.log('🔐 Hash starts with:', this.password ? this.password.substring(0, 10) : 'null');
  
  const result = await bcrypt.compare(candidatePassword, this.password);
  console.log('🔐 bcrypt.compare result:', result);
  return result;
};

User.prototype.toJSON = function() {
  const values = Object.assign({}, this.get());
  delete values.password;
  delete values.verification_token;
  delete values.reset_password_token;
  delete values.reset_password_expires;
  return values;
};

module.exports = User;
