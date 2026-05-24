const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

const FeeConfig = sequelize.define('FeeConfig', {
  config_id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true
  },
  type: {
    type: DataTypes.ENUM('ORDER_COMMISSION', 'GIFT_FEE'),
    allowNull: false
  },
  scope: {
    type: DataTypes.ENUM('GLOBAL', 'SERVICE_TYPE'),
    defaultValue: 'GLOBAL',
    allowNull: false
  },
  service_type: {
    type: DataTypes.STRING(50),
    allowNull: true,
    comment: 'Optional: applies to specific vendor service_type when scope=SERVICE_TYPE'
  },
  percentage: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: false
  },
  effective_from: {
    type: DataTypes.DATE,
    allowNull: false
  },
  effective_to: {
    type: DataTypes.DATE,
    allowNull: true
  },
  created_by: {
    type: DataTypes.UUID,
    allowNull: true,
    references: {
      model: 'users',
      key: 'user_id'
    }
  },
  notes: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  metadata: {
    type: DataTypes.JSONB,
    defaultValue: {},
    allowNull: true
  }
}, {
  tableName: 'fee_configs',
  indexes: [
    { fields: ['type'] },
    { fields: ['scope'] },
    { fields: ['service_type'] },
    { fields: ['effective_from'] }
  ]
});

// Static helpers
FeeConfig.getEffectivePercentage = async function(type, serviceType = null, at = new Date()) {
  const Op = sequelize.Sequelize.Op;

  const baseWhere = {
    type,
    effective_from: { [Op.lte]: at },
    [Op.or]: [
      { effective_to: null },
      { effective_to: { [Op.gt]: at } }
    ]
  };

  // Prefer service-specific config when serviceType is provided
  if (serviceType) {
    const serviceConfig = await FeeConfig.findOne({
      where: {
        ...baseWhere,
        scope: 'SERVICE_TYPE',
        service_type: serviceType
      },
      order: [['effective_from', 'DESC']]
    });

    if (serviceConfig) {
      return parseFloat(serviceConfig.percentage);
    }
  }

  // Fallback to global config
  const globalConfig = await FeeConfig.findOne({
    where: {
      ...baseWhere,
      scope: 'GLOBAL'
    },
    order: [['effective_from', 'DESC']]
  });

  if (!globalConfig) {
    return null;
  }

  return parseFloat(globalConfig.percentage);
};

module.exports = FeeConfig;
