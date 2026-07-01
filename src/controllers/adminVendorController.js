const asyncHandler = require('express-async-handler');
const bcrypt = require('bcryptjs');
const { User, VendorAccount, Vendor } = require('../models');
const { ValidationError, NotFoundError, ConflictError } = require('../utils/errors');
const { uploadFiles } = require('../utils/fileUpload');

/**
 * @desc    Create vendor account (Admin only)
 * @route   POST /api/v1/admin/vendors/create
 * @access  Private (Administrator only)
 */
const createVendorAccount = asyncHandler(async (req, res) => {
  const {
    vendor_name,
    service_type,
    contact_person,
    phone_number,
    address,
    description,
    business_license_no,
    logo_url,
    working_hours,
    delivery_areas,
    city,
    username,
    password,
    permissions
  } = req.body;

  // Handle file uploads (logo from admin panel)
  let uploadedFiles = {};
  if (req.files && Object.keys(req.files).length > 0) {
    uploadedFiles = await uploadFiles(req.files, 'vendors');
  }

  // Validate required fields
  if (!vendor_name || !service_type || !contact_person || !phone_number || !address || !username || !password) {
    throw new ValidationError('All required fields must be provided');
  }

  // Check if username already exists
  const existingUser = await User.findOne({ where: { username } });
  if (existingUser) {
    throw new ConflictError('Username already exists');
  }

  // Hash password

  // Create user account
  const user = await User.create({
    name: contact_person,
    username,
    password,
    phone: phone_number,
    role: 'Vendor',
    verified: true,
    is_active: true
  });

  // Decide final logo URL (prefer uploaded file over plain URL)
  const finalLogoUrl = (uploadedFiles.logo && uploadedFiles.logo[0]) || logo_url || null;

  // Create vendor account
  const vendorAccount = await VendorAccount.create({
    user_id: user.user_id,
    vendor_name,
    service_type,
    contact_person,
    phone_number,
    address,
    description,
    business_license_no,
    logo_url: finalLogoUrl,
    working_hours: working_hours || undefined,
    delivery_areas: delivery_areas || [],
    created_by: req.user.user_id,
    // Permissions
    can_add_products: permissions?.can_add_products ?? true,
    can_edit_products: permissions?.can_edit_products ?? true,
    can_manage_orders: permissions?.can_manage_orders ?? true,
    can_update_stock: permissions?.can_update_stock ?? true,
    can_edit_profile: permissions?.can_edit_profile ?? false
  });

  // Create corresponding Vendor record for marketplace display
  const vendor = await Vendor.create({
    user_id: user.user_id,
    business_name: vendor_name,
    business_description: description,
    service_type,
    business_license: business_license_no,
    business_address: address,
    city: city || 'Addis Ababa', // Default city, can be overridden from admin panel
    region: 'Addis Ababa', // Default region, can be made configurable
    phone: phone_number,
    logo_url: finalLogoUrl,
    operating_hours: working_hours || {},
    delivery_areas: delivery_areas || [],
    verification_documents: uploadedFiles.documents || [],
    verification_status: 'VERIFIED', // Admin-created vendors are auto-verified
    verified_at: new Date(),
    verified_by: req.user.user_id,
    is_active: true
  });

  res.status(201).json({
    success: true,
    message: 'Vendor account created successfully and added to marketplace',
    data: {
      user: {
        user_id: user.user_id,
        name: user.name,
        username: user.username,
        role: user.role
      },
      vendor_account: vendorAccount,
      marketplace_vendor: vendor
    }
  });
});

/**
 * @desc    Get all vendor accounts
 * @route   GET /api/v1/admin/vendors/accounts
 * @access  Private (Administrator only)
 */
const getVendorAccounts = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, service_type, is_active } = req.query;
  const offset = (page - 1) * limit;

  const where = {};
  if (service_type) where.service_type = service_type;
  if (is_active !== undefined) where.is_active = is_active === 'true';

  const { count, rows: vendorAccounts } = await VendorAccount.findAndCountAll({
    where,
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'username', 'phone', 'last_login', 'is_active']
      }
    ],
    order: [['createdAt', 'DESC']],
    limit: parseInt(limit),
    offset: parseInt(offset)
  });

  res.json({
    success: true,
    data: {
      vendor_accounts: vendorAccounts,
      pagination: {
        current_page: parseInt(page),
        total_pages: Math.ceil(count / limit),
        total_records: count,
        per_page: parseInt(limit)
      }
    }
  });
});

/**
 * @desc    Get single vendor account
 * @route   GET /api/v1/admin/vendors/accounts/:vendorId
 * @access  Private (Administrator only)
 */
const getVendorAccount = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendorAccount = await VendorAccount.findByPk(vendorId, {
    include: [
      {
        model: User,
        as: 'user',
        attributes: ['user_id', 'name', 'username', 'phone', 'email', 'last_login', 'is_active']
      }
    ]
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  res.json({
    success: true,
    data: { vendor_account: vendorAccount }
  });
});

/**
 * @desc    Update vendor account
 * @route   PUT /api/v1/admin/vendors/accounts/:vendorId
 * @access  Private (Administrator only)
 */
const updateVendorAccount = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const updateData = req.body;

  const vendorAccount = await VendorAccount.findByPk(vendorId, {
    include: [{ model: User, as: 'user' }]
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  // Update vendor account fields
  const allowedFields = [
    'vendor_name', 'service_type', 'contact_person', 'phone_number',
    'address', 'description', 'business_license_no', 'logo_url',
    'working_hours', 'delivery_areas', 'can_add_products', 'can_edit_products',
    'can_manage_orders', 'can_update_stock', 'can_edit_profile'
  ];

  allowedFields.forEach(field => {
    if (updateData[field] !== undefined) {
      vendorAccount[field] = updateData[field];
    }
  });

  await vendorAccount.save();

  // Update corresponding Vendor record
  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });
  if (vendor) {
    const vendorUpdateData = {};
    if (updateData.vendor_name) vendorUpdateData.business_name = updateData.vendor_name;
    if (updateData.description) vendorUpdateData.business_description = updateData.description;
    if (updateData.service_type) vendorUpdateData.service_type = updateData.service_type;
    if (updateData.business_license_no) vendorUpdateData.business_license = updateData.business_license_no;
    if (updateData.address) vendorUpdateData.business_address = updateData.address;
    if (updateData.phone_number) vendorUpdateData.phone = updateData.phone_number;
    if (updateData.logo_url) vendorUpdateData.logo_url = updateData.logo_url;
    if (updateData.working_hours) vendorUpdateData.operating_hours = updateData.working_hours;
    if (updateData.delivery_areas) vendorUpdateData.delivery_areas = updateData.delivery_areas;

    if (Object.keys(vendorUpdateData).length > 0) {
      await vendor.update(vendorUpdateData);
    }
  }

  // Update user fields if provided
  if (updateData.username || updateData.contact_person) {
    const user = vendorAccount.user;
    if (updateData.username) user.username = updateData.username;
    if (updateData.contact_person) user.name = updateData.contact_person;
    await user.save();
  }

  res.json({
    success: true,
    message: 'Vendor account updated successfully',
    data: { vendor_account: vendorAccount }
  });
});

/**
 * @desc    Reset vendor password
 * @route   POST /api/v1/admin/vendors/accounts/:vendorId/reset-password
 * @access  Private (Administrator only)
 */
const resetVendorPassword = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { new_password } = req.body;

  if (!new_password) {
    throw new ValidationError('New password is required');
  }

  const vendorAccount = await VendorAccount.findByPk(vendorId, {
    include: [{ model: User, as: 'user' }]
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  // Hash new password

  // Update user password
  vendorAccount.user.password = new_password;
  await vendorAccount.user.save();

  res.json({
    success: true,
    message: 'Vendor password reset successfully'
  });
});

/**
 * @desc    Toggle vendor account status
 * @route   POST /api/v1/admin/vendors/accounts/:vendorId/toggle-status
 * @access  Private (Administrator only)
 */
const toggleVendorStatus = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendorAccount = await VendorAccount.findByPk(vendorId, {
    include: [{ model: User, as: 'user' }]
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  // Toggle both vendor account and user status
  vendorAccount.is_active = !vendorAccount.is_active;
  vendorAccount.user.is_active = vendorAccount.is_active;

  await vendorAccount.save();
  await vendorAccount.user.save();

  // Update corresponding Vendor record status
  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });
  if (vendor) {
    vendor.is_active = vendorAccount.is_active;
    await vendor.save();
  }

  res.json({
    success: true,
    message: `Vendor account ${vendorAccount.is_active ? 'activated' : 'deactivated'} successfully`,
    data: { is_active: vendorAccount.is_active }
  });
});

/**
 * @desc    Delete vendor account
 * @route   DELETE /api/v1/admin/vendors/accounts/:vendorId
 * @access  Private (Administrator only)
 */
const deleteVendorAccount = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;

  const vendorAccount = await VendorAccount.findByPk(vendorId, {
    include: [{ model: User, as: 'user' }]
  });

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  // Delete corresponding Vendor record first
  const vendor = await Vendor.findOne({ where: { user_id: vendorAccount.user_id } });
  if (vendor) {
    await vendor.destroy();
  }

  // Delete vendor account and user
  await vendorAccount.user.destroy();
  await vendorAccount.destroy();

  res.json({
    success: true,
    message: 'Vendor account deleted successfully'
  });
});

/**
 * @desc    Update vendor permissions
 * @route   PUT /api/v1/admin/vendors/accounts/:vendorId/permissions
 * @access  Private (Administrator only)
 */
const updateVendorPermissions = asyncHandler(async (req, res) => {
  const { vendorId } = req.params;
  const { permissions } = req.body;

  const vendorAccount = await VendorAccount.findByPk(vendorId);

  if (!vendorAccount) {
    throw new NotFoundError('Vendor account not found');
  }

  // Update permissions
  const allowedPermissions = [
    'can_add_products', 'can_edit_products', 'can_manage_orders',
    'can_update_stock', 'can_edit_profile'
  ];

  allowedPermissions.forEach(permission => {
    if (permissions[permission] !== undefined) {
      vendorAccount[permission] = permissions[permission];
    }
  });

  await vendorAccount.save();

  res.json({
    success: true,
    message: 'Vendor permissions updated successfully',
    data: { vendor_account: vendorAccount }
  });
});

/**
 * @desc    Sync existing vendor accounts to marketplace
 * @route   POST /api/v1/admin/vendors/sync-marketplace
 * @access  Private (Administrator only)
 */
const syncVendorAccountsToMarketplace = asyncHandler(async (req, res) => {
  // Find all VendorAccounts that don't have corresponding Vendor records
  const vendorAccounts = await VendorAccount.findAll({
    include: [{ model: User, as: 'user' }]
  });

  let syncedCount = 0;
  let skippedCount = 0;

  for (const vendorAccount of vendorAccounts) {
    // Check if Vendor record already exists
    const existingVendor = await Vendor.findOne({ 
      where: { user_id: vendorAccount.user_id } 
    });

    if (!existingVendor) {
      // Create Vendor record
      await Vendor.create({
        user_id: vendorAccount.user_id,
        business_name: vendorAccount.vendor_name,
        business_description: vendorAccount.description,
        service_type: vendorAccount.service_type,
        business_license: vendorAccount.business_license_no,
        business_address: vendorAccount.address,
        city: 'Addis Ababa', // Default city, can be made configurable
        region: 'Addis Ababa', // Default region, can be made configurable
        phone: vendorAccount.phone_number,
        logo_url: vendorAccount.logo_url,
        operating_hours: vendorAccount.working_hours || {},
        delivery_areas: vendorAccount.delivery_areas || [],
        verification_status: 'VERIFIED', // Admin-created vendors are auto-verified
        verified_at: new Date(),
        verified_by: req.user.user_id,
        is_active: vendorAccount.is_active
      });
      syncedCount++;
    } else {
      skippedCount++;
    }
  }

  res.json({
    success: true,
    message: `Marketplace sync completed. ${syncedCount} vendors synced, ${skippedCount} already existed.`,
    data: {
      synced_count: syncedCount,
      skipped_count: skippedCount,
      total_processed: vendorAccounts.length
    }
  });
});

module.exports = {
  createVendorAccount,
  getVendorAccounts,
  getVendorAccount,
  updateVendorAccount,
  resetVendorPassword,
  toggleVendorStatus,
  deleteVendorAccount,
  updateVendorPermissions,
  syncVendorAccountsToMarketplace
};
