const { SystemSetting, FeeConfig } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { logAdminAction } = require('../utils/adminAudit');

const getSettingValue = async (key, defaultValue = null) => {
  const setting = await SystemSetting.findOne({ where: { key } });
  if (!setting) return defaultValue;
  return setting.value ?? defaultValue;
};

const upsertSetting = async (key, category, value, userId) => {
  const [setting] = await SystemSetting.findOrCreate({
    where: { key },
    defaults: {
      category,
      value,
      updated_by: userId,
    },
  });

  setting.category = category;
  setting.value = value;
  setting.updated_by = userId;
  await setting.save();
  return setting;
};

// @desc    Get consolidated admin system settings
// @route   GET /api/v1/admin/settings
// @access  Private (Admin)
const getAdminSettings = asyncHandler(async (req, res) => {
  const now = new Date();

  const buildDefaultSettings = () => ({
    fees: {
      gift_platform_fee_percentage: null,
      marketplace_commission_percentage: null,
    },
    features: {
      marketplace_enabled: true,
      enhanced_memorial_wizard_enabled: true,
      ethiopian_markers_demo_enabled: false,
    },
    payments: {
      methods: [
        { key: 'WALLET', label: 'Wallet payments', enabled: true, maintenance: false },
        { key: 'BANK_TRANSFER', label: 'Bank transfer', enabled: true, maintenance: false },
        { key: 'CARD', label: 'Card / PSP', enabled: true, maintenance: false },
      ],
    },
    support: {
      email: null,
      phone_primary: null,
      phone_secondary: null,
      whatsapp: null,
      crisis_hotline: null,
      support_url: null,
    },
    generated_at: new Date().toISOString(),
  });

  try {
    const [
      giftFee,
      orderCommission,
      marketplaceFeature,
      memorialWizardFeature,
      ethiopianMarkersFeature,
      walletPayment,
      bankTransferPayment,
      cardPayment,
      supportContacts,
    ] = await Promise.all([
      FeeConfig.getEffectivePercentage('GIFT_FEE', null, now),
      FeeConfig.getEffectivePercentage('ORDER_COMMISSION', null, now),
      getSettingValue('feature.marketplace_enabled', { enabled: true }),
      getSettingValue('feature.enhanced_memorial_wizard', { enabled: true }),
      getSettingValue('feature.ethiopian_markers_demo', { enabled: false }),
      getSettingValue('payment.wallet', { enabled: true, maintenance: false }),
      getSettingValue('payment.bank_transfer', { enabled: true, maintenance: false }),
      getSettingValue('payment.card', { enabled: true, maintenance: false }),
      getSettingValue('support.contacts', {
        email: null,
        phone_primary: null,
        phone_secondary: null,
        whatsapp: null,
        crisis_hotline: null,
        support_url: null,
      }),
    ]);

    res.json({
      success: true,
      data: {
        fees: {
          gift_platform_fee_percentage: giftFee,
          marketplace_commission_percentage: orderCommission,
        },
        features: {
          marketplace_enabled: !!marketplaceFeature?.enabled,
          enhanced_memorial_wizard_enabled: !!memorialWizardFeature?.enabled,
          ethiopian_markers_demo_enabled: !!ethiopianMarkersFeature?.enabled,
        },
        payments: {
          methods: [
            { key: 'WALLET', label: 'Wallet payments', ...walletPayment },
            { key: 'BANK_TRANSFER', label: 'Bank transfer', ...bankTransferPayment },
            { key: 'CARD', label: 'Card / PSP', ...cardPayment },
          ],
        },
        support: supportContacts,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Admin settings retrieval failed, falling back to defaults:', error.message);

    const defaults = buildDefaultSettings();

    res.status(200).json({
      success: true,
      data: defaults,
    });
  }
});

// Helper to close existing global fee configs and create a new one
const setGlobalFeeConfig = async (type, percentage, userId) => {
  const now = new Date();

  // Close current active global configs
  await FeeConfig.update(
    { effective_to: now },
    {
      where: {
        type,
        scope: 'GLOBAL',
        effective_to: null,
      },
    }
  );

  // Create new config
  await FeeConfig.create({
    type,
    scope: 'GLOBAL',
    service_type: null,
    percentage,
    effective_from: now,
    effective_to: null,
    created_by: userId,
  });
};

// @desc    Update admin system settings
// @route   PUT /api/v1/admin/settings
// @access  Private (Admin)
const updateAdminSettings = asyncHandler(async (req, res) => {
  const { fees, features, payments, support } = req.body || {};
  const userId = req.user.user_id;

  // Fees & limits (backed by FeeConfig)
  if (fees) {
    const { gift_platform_fee_percentage, marketplace_commission_percentage } = fees;

    if (typeof gift_platform_fee_percentage === 'number' && !Number.isNaN(gift_platform_fee_percentage)) {
      await setGlobalFeeConfig('GIFT_FEE', gift_platform_fee_percentage, userId);
    }

    if (
      typeof marketplace_commission_percentage === 'number' &&
      !Number.isNaN(marketplace_commission_percentage)
    ) {
      await setGlobalFeeConfig('ORDER_COMMISSION', marketplace_commission_percentage, userId);
    }
  }

  // Feature toggles
  if (features) {
    const {
      marketplace_enabled,
      enhanced_memorial_wizard_enabled,
      ethiopian_markers_demo_enabled,
    } = features;

    if (typeof marketplace_enabled === 'boolean') {
      await upsertSetting(
        'feature.marketplace_enabled',
        'FEATURE_FLAG',
        { enabled: marketplace_enabled },
        userId
      );
    }

    if (typeof enhanced_memorial_wizard_enabled === 'boolean') {
      await upsertSetting(
        'feature.enhanced_memorial_wizard',
        'FEATURE_FLAG',
        { enabled: enhanced_memorial_wizard_enabled },
        userId
      );
    }

    if (typeof ethiopian_markers_demo_enabled === 'boolean') {
      await upsertSetting(
        'feature.ethiopian_markers_demo',
        'FEATURE_FLAG',
        { enabled: ethiopian_markers_demo_enabled },
        userId
      );
    }
  }

  // Payment methods
  if (payments && Array.isArray(payments.methods)) {
    for (const method of payments.methods) {
      if (!method || !method.key) continue;
      const key = String(method.key).toUpperCase();

      if (!['WALLET', 'BANK_TRANSFER', 'CARD'].includes(key)) continue;

      const settingKey =
        key === 'WALLET'
          ? 'payment.wallet'
          : key === 'BANK_TRANSFER'
          ? 'payment.bank_transfer'
          : 'payment.card';

      const value = {
        enabled: typeof method.enabled === 'boolean' ? method.enabled : true,
        maintenance: typeof method.maintenance === 'boolean' ? method.maintenance : false,
      };

      await upsertSetting(settingKey, 'PAYMENT', value, userId);
    }
  }

  // Support contacts
  if (support) {
    const current = await getSettingValue('support.contacts', {});
    const nextValue = {
      ...current,
      ...support,
    };

    await upsertSetting('support.contacts', 'SUPPORT', nextValue, userId);
  }

  await logAdminAction(req, {
    action: 'SETTINGS_UPDATE',
    targetType: 'SYSTEM',
    targetId: null,
    targetLabel: null,
    metadata: {
      updated_sections: {
        fees: !!fees,
        features: !!features,
        payments: !!payments,
        support: !!support,
      },
    },
  });

  // Return the refreshed settings snapshot
  return getAdminSettings(req, res);
});

module.exports = {
  getAdminSettings,
  updateAdminSettings,
};
