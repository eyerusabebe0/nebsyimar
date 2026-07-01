const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const Memorial = sequelize.define('Memorial', {
  memorial_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  user_id: {
    type: DataTypes.UUID,
    allowNull: false,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  deceased_name: {
    type: DataTypes.STRING(200),
    allowNull: false,
    validate: {
      notEmpty: true,
      len: [2, 200]
    }
  },
  deceased_name_amharic: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  bio: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  bio_amharic: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  date_of_birth: {
    type: DataTypes.DATEONLY,
    allowNull: true
  },
  date_of_death: {
    type: DataTypes.DATEONLY,
    allowNull: true,
    validate: {
      isAfterBirth(value) {
        if (value && this.date_of_birth && new Date(value) <= new Date(this.date_of_birth)) {
          throw new Error('Date of death must be after date of birth');
        }
      }
    }
  },
  place_of_birth: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  place_of_death: {
    type: DataTypes.STRING(200),
    allowNull: true
  },
  cause_of_death: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  profile_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  cover_image: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  gallery_images: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    defaultValue: [],
    allowNull: true
  },
  visibility: {
    type: DataTypes.ENUM('PUBLIC', 'PRIVATE', 'FAMILY_ONLY'),
    defaultValue: 'PUBLIC',
    allowNull: false
  },
  paid_status: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false
  },
  payment_txn_id: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'wallet_transactions',
      key: 'txn_id'
    }
  },
  cultural_template: {
    type: DataTypes.ENUM('ORTHODOX', 'PROTESTANT', 'MUSLIM', 'TRADITIONAL', 'MODERN', 'CUSTOM'),
    defaultValue: 'MODERN',
    allowNull: false
  },
  memorial_url: {
    type: DataTypes.STRING(255),
    allowNull: true,
    unique: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  featured_until: {
    type: DataTypes.DATE,
    allowNull: true
  },
  view_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  gift_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  total_gifts_value: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  review_status: {
    type: DataTypes.ENUM('NORMAL', 'NEEDS_REVIEW', 'SENSITIVE', 'HIDDEN'),
    defaultValue: 'NORMAL',
    allowNull: false,
  },
  is_hidden_by_admin: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
  },
  sensitivity_level: {
    type: DataTypes.ENUM('NORMAL', 'SENSITIVE'),
    defaultValue: 'NORMAL',
    allowNull: false,
  },
  admin_notes: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  archived_at: {
    type: DataTypes.DATE,
    allowNull: true
  },
  archived_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  memorial_settings: {
    type: DataTypes.JSONB,
    defaultValue: {
      allow_gifts: true,
      allow_comments: true,
      allow_stories: true,
      show_gift_amounts: true,
      notification_preferences: {
        new_gifts: true,
        new_comments: true,
        new_stories: true
      }
    }
  },
  comments_locked: {
    type: DataTypes.BOOLEAN,
    defaultValue: false,
    allowNull: false,
  },
  admin_visibility: {
    type: DataTypes.ENUM('NONE', 'FORCE_PUBLIC', 'FORCE_PRIVATE', 'FORCE_FAMILY_ONLY'),
    defaultValue: 'NONE',
    allowNull: false,
  },
  last_activity_at: {
    type: DataTypes.DATE,
    allowNull: true,
  },
  seo_title: {
    type: DataTypes.STRING(255),
    allowNull: true
  },
  seo_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  seo_keywords: {
    type: DataTypes.ARRAY(DataTypes.STRING),
    allowNull: true
  }
}, {
  tableName: 'memorials',
  indexes: [
    { fields: ['user_id'] },
    { fields: ['visibility'] },
    { fields: ['paid_status'] },
    { fields: ['is_active'] },
    { fields: ['is_featured'] },
    { fields: ['review_status'] },
    { fields: ['sensitivity_level'] },
    { fields: ['view_count'] },
    { fields: ['gift_count'] },
    { fields: ['total_gifts_value'] },
    { fields: ['last_activity_at'] },
    {
      unique: true,
      fields: ['memorial_url'],
      where: {
        memorial_url: {
          [sequelize.Sequelize.Op.ne]: null
        }
      }
    },
    { fields: ['createdAt'] }, // FIXED: real column is camelCase, not 'created_at'
    { fields: ['deceased_name'] }
  ]
});

// Hooks
Memorial.beforeCreate(async (memorial, options) => {
  if (!memorial.memorial_url) {
    const baseUrl = memorial.deceased_name
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '');

    let url = baseUrl;
    let counter = 1;

    while (await Memorial.findOne({ where: { memorial_url: url } })) {
      url = `${baseUrl}-${counter}`;
      counter++;
    }

    memorial.memorial_url = url;
  }
});

// Instance methods
Memorial.prototype.incrementViewCount = async function() {
  this.view_count += 1;
  this.last_activity_at = new Date();
  await this.save({ fields: ['view_count', 'last_activity_at'] });
  return this;
};

Memorial.prototype.addGift = async function(giftValue) {
  this.gift_count += 1;
  this.total_gifts_value = parseFloat(this.total_gifts_value) + parseFloat(giftValue);
  this.last_activity_at = new Date();
  await this.save({ fields: ['gift_count', 'total_gifts_value', 'last_activity_at'] });
  return this;
};

Memorial.prototype.archive = async function(archivedBy) {
  this.is_active = false;
  this.archived_at = new Date();
  this.archived_by = archivedBy;
  await this.save();
  return this;
};

Memorial.prototype.restore = async function() {
  this.is_active = true;
  this.archived_at = null;
  this.archived_by = null;
  await this.save();
  return this;
};

Memorial.prototype.markAsPaid = async function(transactionId) {
  this.paid_status = true;
  this.payment_txn_id = transactionId;
  await this.save();
  return this;
};

// Static methods
Memorial.getPublicMemorials = async function(limit = 20, offset = 0, filters = {}) {
  const where = {
    paid_status: true,
    is_active: true,
    is_hidden_by_admin: false,
    review_status: {
      [sequelize.Sequelize.Op.ne]: 'HIDDEN',
    },
    [sequelize.Sequelize.Op.and]: [
      {
        [sequelize.Sequelize.Op.or]: [
          { admin_visibility: 'FORCE_PUBLIC' },
          {
            admin_visibility: 'NONE',
            visibility: 'PUBLIC',
          },
        ],
      },
    ],
  };

  if (filters.search) {
    where[sequelize.Sequelize.Op.or] = [
      { deceased_name: { [sequelize.Sequelize.Op.iLike]: `%${filters.search}%` } },
      { deceased_name_amharic: { [sequelize.Sequelize.Op.iLike]: `%${filters.search}%` } }
    ];
  }

  if (filters.cultural_template) {
    where.cultural_template = filters.cultural_template;
  }

  return this.findAll({
    where,
    order: [
      ['is_featured', 'DESC'],
      ['createdAt', 'DESC'] // FIXED
    ],
    limit,
    offset,
    include: [
      {
        model: sequelize.models.User,
        as: 'creator',
        attributes: ['user_id', 'name']
      }
    ]
  });
};

Memorial.getFeaturedMemorials = async function(limit = 10) {
  return this.findAll({
    where: {
      is_featured: true,
      paid_status: true,
      is_active: true,
      is_hidden_by_admin: false,
      review_status: {
        [sequelize.Sequelize.Op.ne]: 'HIDDEN',
      },
      [sequelize.Sequelize.Op.and]: [
        {
          [sequelize.Sequelize.Op.or]: [
            { admin_visibility: 'FORCE_PUBLIC' },
            {
              admin_visibility: 'NONE',
              visibility: 'PUBLIC',
            },
          ],
        },
      ],
      featured_until: {
        [sequelize.Sequelize.Op.gt]: new Date()
      }
    },
    order: [['createdAt', 'DESC']], // FIXED
    limit
  });
};

module.exports = Memorial;