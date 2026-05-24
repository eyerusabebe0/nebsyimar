const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const GiftCatalog = sequelize.define('GiftCatalog', {
  gift_id: {
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
  name_amharic: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  description_amharic: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symbolism: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  symbolism_amharic: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  category: {
    type: DataTypes.ENUM('WHITE_ROSE', 'CANDLE_PEACE', 'DOVE_MERCY', 'ETERNAL_LIGHT'),
    allowNull: false
  },
  value: {
    type: DataTypes.DECIMAL(8, 2),
    allowNull: false,
    validate: {
      min: 0.01,
      isDecimal: true
    }
  },
  currency: {
    type: DataTypes.STRING(3),
    defaultValue: 'ETB',
    allowNull: false
  },
  animation_type: {
    type: DataTypes.STRING(50),
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  animation_duration: {
    type: DataTypes.INTEGER,
    defaultValue: 3000,
    allowNull: false,
    comment: 'Animation duration in milliseconds'
  },
  icon_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  animation_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  sound_url: {
    type: DataTypes.STRING(500),
    allowNull: true
  },
  is_active: {
    type: DataTypes.BOOLEAN,
    defaultValue: true
  },
  sort_order: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  usage_count: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    allowNull: false
  },
  total_revenue: {
    type: DataTypes.DECIMAL(12, 2),
    defaultValue: 0.00,
    allowNull: false
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true,
    comment: 'Additional gift metadata like colors, themes, etc.'
  }
}, {
  tableName: 'gift_catalog',
  indexes: [
    {
      fields: ['category']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['is_featured']
    },
    {
      fields: ['sort_order']
    },
    {
      fields: ['value']
    }
  ]
});

// Instance methods
GiftCatalog.prototype.incrementUsage = async function(amount) {
  this.usage_count += 1;
  this.total_revenue = parseFloat(this.total_revenue) + parseFloat(amount);
  await this.save({ fields: ['usage_count', 'total_revenue'] });
  return this;
};

// Static methods
GiftCatalog.getByCategory = async function(category, activeOnly = true) {
  const where = { category };
  if (activeOnly) {
    where.is_active = true;
  }

  return this.findAll({
    where,
    order: [['sort_order', 'ASC'], ['value', 'ASC']]
  });
};

GiftCatalog.getFeaturedGifts = async function(limit = 10) {
  return this.findAll({
    where: {
      is_featured: true,
      is_active: true
    },
    order: [['sort_order', 'ASC']],
    limit
  });
};

GiftCatalog.getPopularGifts = async function(limit = 10) {
  return this.findAll({
    where: {
      is_active: true
    },
    order: [['usage_count', 'DESC']],
    limit
  });
};

GiftCatalog.getPriceRange = async function(category = null) {
  const where = { is_active: true };
  if (category) {
    where.category = category;
  }

  const result = await this.findOne({
    where,
    attributes: [
      [sequelize.fn('MIN', sequelize.col('value')), 'min_price'],
      [sequelize.fn('MAX', sequelize.col('value')), 'max_price'],
      [sequelize.fn('AVG', sequelize.col('value')), 'avg_price']
    ]
  });

  return {
    min_price: parseFloat(result?.dataValues?.min_price || 0),
    max_price: parseFloat(result?.dataValues?.max_price || 0),
    avg_price: parseFloat(result?.dataValues?.avg_price || 0)
  };
};

module.exports = GiftCatalog;
