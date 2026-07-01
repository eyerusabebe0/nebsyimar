import axios from 'axios';

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:5000/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  // Let Axios infer the appropriate Content-Type:
  // - application/json for plain objects
  // - multipart/form-data for FormData (file uploads)
  withCredentials: true,
});

// Add request interceptor to include auth token
api.interceptors.request.use(
  (config) => {
    // Prefer impersonation token if present (Super Admin "view as" mode),
    // otherwise fall back to normal auth token.
    const impersonationToken =
      typeof window !== 'undefined' ? localStorage.getItem('nefsyimar_impersonation_token') : null;
    const token =
      impersonationToken || (typeof window !== 'undefined' ? localStorage.getItem('nefsyimar_token') : null);

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Handle unauthorized access (e.g., redirect to login)
      if (typeof window !== 'undefined') {
        localStorage.removeItem('nefsyimar_token');
        window.location.href = '/signin';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API methods
export const authApi = {
  login: (email: string, password: string) => 
    api.post('/auth/login', { identifier: email, password }),
    
  register: (userData: any) => 
    api.post('/auth/register', userData),
    
  getProfile: () => 
    api.get('/auth/me'),
    
  updateProfile: (userData: any) => 
    api.put('/auth/profile', userData),
    
  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/change-password', { currentPassword, newPassword }),
    
  requestPasswordReset: (identifier: string) =>
    api.post('/auth/forgot-password', { identifier }),
    
  resetPassword: (token: string, newPassword: string) =>
    api.post('/auth/reset-password', { token, newPassword }),
    
  logout: () => 
    api.post('/auth/logout'),
    
  getAuthStatus: () =>
    api.get('/auth/status')
};

// Memorial API methods
export const memorialApi = {
  getMemorial: (memorialId: string) =>
    api.get(`/memorials/${memorialId}`),

  updateMemorial: (memorialId: string, data: any) =>
    api.put(`/memorials/${memorialId}`, data),

  getComments: (memorialId: string, page: number = 1, limit: number = 20) =>
    api.get(`/memorials/${memorialId}/comments`, {
      params: { page, limit },
    }),

  addComment: (memorialId: string, message: string) =>
    api.post(`/memorials/${memorialId}/comments`, { message }),

  deleteComment: (memorialId: string, commentId: string) =>
    api.delete(`/memorials/${memorialId}/comments/${commentId}`),
  
  toggleLike: (memorialId: string, commentId: string) =>
    api.post(`/memorials/${memorialId}/comments/${commentId}/like`),
};

// User Dashboard API methods
export const userDashboardApi = {
  getDashboardData: () =>
    api.get('/user/dashboard'),

  getUserMemorials: (page: number = 1, limit: number = 10, status: string = 'all') =>
    api.get('/user/memorials', {
      params: { page, limit, status },
    }),

  deleteMemorial: (memorialId: string) =>
    api.delete(`/memorials/${memorialId}`),

  updateMemorialSettings: (memorialId: string, settings: any) =>
    api.put(`/user/memorials/${memorialId}/settings`, { memorial_settings: settings }),

  getPendingComments: (page: number = 1, limit: number = 20) =>
    api.get('/user/memorials/pending-comments', {
      params: { page, limit },
    }),

  moderateComment: (memorialId: string, commentId: string, action: 'approve' | 'reject') =>
    api.post(`/user/memorials/${memorialId}/comments/${commentId}/moderate`, { action }),

  deleteComment: (memorialId: string, commentId: string) =>
    api.delete(`/user/memorials/${memorialId}/comments/${commentId}`),

  deleteRepatriationSubmission: (submissionId: string) =>
    api.delete(`/user/repatriation-submissions/${submissionId}`),

  blockUser: (memorialId: string, userIdToBlock: string, action: 'block' | 'unblock') =>
    api.post(`/user/memorials/${memorialId}/block-user`, { 
      user_id_to_block: userIdToBlock, 
      action 
    }),
};

// Appeals API methods (User-facing)
export const appealsApi = {
  submitAppeal: (payload: {
    target_type: 'MEMORIAL' | 'COMMENT' | 'USER' | 'DISPUTE' | 'ORDER' | 'OTHER';
    target_id: string;
    reason?: string;
    related_report_id?: string;
    related_dispute_id?: string;
  }) => api.post('/appeals', payload),

  getMyAppeals: (page: number = 1, limit: number = 20) =>
    api.get('/appeals/my', {
      params: { page, limit },
    }),
};

export const repatriationApi = {
  submitRequest: (formData: FormData) => api.post('/repatriation', formData),
  getRequest: (submissionId: string) => api.get(`/user/repatriation-submissions/${submissionId}`),
  updateRequest: (submissionId: string, formData: FormData) => api.put(`/user/repatriation-submissions/${submissionId}`, formData),
};

// Admin API methods
export const adminApi = {
  getOverviewStats: () =>
    api.get('/admin/stats/overview'),

  getUsers: (page: number = 1, limit: number = 20, role?: string, status?: string) =>
    api.get('/admin/users', {
      params: {
        page,
        limit,
        ...(role ? { role } : {}),
        ...(status ? { status } : {}),
      },
    }),

  getUser: (userId: string) =>
    api.get(`/admin/users/${userId}`),

  getTransactions: (page: number = 1, limit: number = 20) =>
    api.get('/admin/transactions', {
      params: { page, limit },
    }),

  getOrders: (
    page: number = 1,
    limit: number = 20,
    status?: string,
    vendorId?: string
  ) =>
    api.get('/admin/orders', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(vendorId ? { vendor_id: vendorId } : {}),
      },
    }),

  getMemorials: (
    page: number = 1,
    limit: number = 20,
    status?: string,
    search?: string,
    options: {
      ownerId?: string;
      createdFrom?: string;
      createdTo?: string;
      sort?: 'newest' | 'oldest' | 'high_traffic';
      visibility?: 'PUBLIC' | 'PRIVATE' | 'FAMILY_ONLY';
    } = {},
  ) =>
    api.get('/admin/memorials', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
        ...(options.ownerId ? { owner_id: options.ownerId } : {}),
        ...(options.createdFrom ? { created_from: options.createdFrom } : {}),
        ...(options.createdTo ? { created_to: options.createdTo } : {}),
        ...(options.visibility ? { visibility: options.visibility } : {}),
        ...(options.sort ? { sort: options.sort } : {}),
      },
    }),

  getMemorialDetail: (memorialId: string) =>
    api.get(`/admin/memorials/${memorialId}`),

  moderateMemorial: (
    memorialId: string,
    payload: {
      comments_locked?: boolean;
      admin_visibility?: 'NONE' | 'FORCE_PUBLIC' | 'FORCE_PRIVATE' | 'FORCE_FAMILY_ONLY';
      is_hidden_by_admin?: boolean;
      is_featured?: boolean;
      sensitivity_level?: 'NORMAL' | 'SENSITIVE';
      admin_notes?: string;
    },
  ) => api.post(`/admin/memorials/${memorialId}/moderate`, payload),

  getPendingVendors: (page: number = 1, limit: number = 20) =>
    api.get('/admin/vendors/pending', {
      params: { page, limit },
    }),

  verifyVendor: (vendorId: string) =>
    api.post(`/admin/vendors/${vendorId}/verify`),

  getRepatriationSubmissions: (page: number = 1, limit: number = 20) =>
    api.get('/admin/repatriation-submissions', {
      params: { page, limit },
    }),

  rejectVendor: (vendorId: string, reason: string) =>
    api.post(`/admin/vendors/${vendorId}/reject`, { reason }),

  updateVendorLimits: (
    vendorId: string,
    payload: { allowedCategories?: string[]; allowedCountries?: string[] },
  ) =>
    api.post(`/admin/vendors/${vendorId}/limits`, {
      ...(payload.allowedCategories ? { allowed_categories: payload.allowedCategories } : {}),
      ...(payload.allowedCountries ? { allowed_countries: payload.allowedCountries } : {}),
    }),

  // Product moderation
  getProductsForModeration: (
    page: number = 1,
    limit: number = 20,
    options: {
      queue?: 'PENDING_REVIEW' | 'LIVE' | 'HIDDEN';
      vendorId?: string;
      category?: string;
      status?: 'active' | 'inactive';
      search?: string;
    } = {},
  ) =>
    api.get('/admin/products', {
      params: {
        page,
        limit,
        ...(options.queue ? { queue: options.queue } : {}),
        ...(options.vendorId ? { vendor_id: options.vendorId } : {}),
        ...(options.category ? { category: options.category } : {}),
        ...(options.status ? { status: options.status } : {}),
        ...(options.search ? { search: options.search } : {}),
      },
    }),

  approveProduct: (productId: string) =>
    api.post(`/admin/products/${productId}/approve`),

  hideProduct: (productId: string, reason?: string) =>
    api.post(`/admin/products/${productId}/hide`, { reason }),

  featureProduct: (productId: string, isFeatured: boolean) =>
    api.post(`/admin/products/${productId}/feature`, { is_featured: isFeatured }),

  recommendProduct: (productId: string, recommended: boolean) =>
    api.post(`/admin/products/${productId}/recommend`, { recommended }),

  deleteMemorial: (memorialId: string) =>
    api.delete(`/memorials/${memorialId}`),

  // User status management
  deactivateUser: (userId: string, reason?: string, note?: string) =>
    api.post(`/admin/users/${userId}/deactivate`, { reason, note }),

  reactivateUser: (userId: string, reason?: string, note?: string) =>
    api.post(`/admin/users/${userId}/reactivate`, { reason, note }),

  banUser: (userId: string, reason?: string, note?: string) =>
    api.post(`/admin/users/${userId}/ban`, { reason, note }),

  unbanUser: (userId: string, reason?: string, note?: string) =>
    api.post(`/admin/users/${userId}/unban`, { reason, note }),

  updateUserRestrictions: (
    userId: string,
    payload: { canCreateMemorials?: boolean; canComment?: boolean },
  ) =>
    api.post(`/admin/users/${userId}/restrictions`, {
      ...(payload.canCreateMemorials !== undefined
        ? { can_create_memorials: payload.canCreateMemorials }
        : {}),
      ...(payload.canComment !== undefined ? { can_comment: payload.canComment } : {}),
    }),

  getUserStatusHistory: (userId: string, page: number = 1, limit: number = 20) =>
    api.get(`/admin/users/${userId}/status-history`, {
      params: { page, limit },
    }),

  getUserMemorials: (userId: string, page: number = 1, limit: number = 20) =>
    api.get(`/admin/users/${userId}/memorials`, {
      params: { page, limit },
    }),

  getUserComments: (userId: string, page: number = 1, limit: number = 20) =>
    api.get(`/admin/users/${userId}/comments`, {
      params: { page, limit },
    }),

  impersonateUser: (userId: string) =>
    api.post(`/admin/users/${userId}/impersonate`),

  getCommentsQueue: (options: {
    page?: number;
    limit?: number;
    queue?: 'PENDING' | 'REJECTED' | 'REPORTED' | 'RECENT';
    memorialId?: string;
    userId?: string;
    status?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 20,
      queue = 'RECENT',
      memorialId,
      userId,
      status,
    } = options;

    return api.get('/admin/comments', {
      params: {
        page,
        limit,
        queue,
        ...(memorialId ? { memorial_id: memorialId } : {}),
        ...(userId ? { user_id: userId } : {}),
        ...(status ? { status } : {}),
      },
    });
  },

  bulkModerateComments: (payload: {
    commentIds: string[];
    action: 'APPROVE' | 'REJECT' | 'DELETE' | 'BAN_USER_AND_DELETE_RECENT';
    reason?: string;
    days?: number;
  }) =>
    api.post('/admin/comments/bulk', {
      comment_ids: payload.commentIds,
      action: payload.action,
      reason: payload.reason,
      days: payload.days,
    }),

  // Dispute management
  getDisputes: (options: {
    page?: number;
    limit?: number;
    status?: string;
    againstParty?: 'VENDOR' | 'BUYER' | 'PLATFORM';
    category?: 'QUALITY' | 'LATE_DELIVERY' | 'NON_DELIVERY' | 'WRONG_ITEM' | 'OTHER';
    assignedTo?: string;
    orderId?: string;
    raisedBy?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 20,
      status,
      againstParty,
      category,
      assignedTo,
      orderId,
      raisedBy,
    } = options;

    return api.get('/admin/disputes', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(againstParty ? { against_party: againstParty } : {}),
        ...(category ? { category } : {}),
        ...(assignedTo ? { assigned_to: assignedTo } : {}),
        ...(orderId ? { order_id: orderId } : {}),
        ...(raisedBy ? { raised_by: raisedBy } : {}),
      },
    });
  },

  getDispute: (disputeId: string) =>
    api.get(`/admin/disputes/${disputeId}`),

  assignDispute: (disputeId: string, assignedTo?: string) =>
    api.post(`/admin/disputes/${disputeId}/assign`, {
      assigned_to: assignedTo,
    }),

  resolveDispute: (
    disputeId: string,
    payload: {
      resolution: 'NO_REFUND' | 'PARTIAL_REFUND' | 'FULL_REFUND' | 'NON_MONETARY' | 'OTHER';
      approvedRefundAmount?: number;
      status?: 'RESOLVED' | 'REJECTED';
      adminNotes?: string;
    },
  ) =>
    api.post(`/admin/disputes/${disputeId}/resolve`, {
      resolution: payload.resolution,
      ...(payload.approvedRefundAmount !== undefined
        ? { approved_refund_amount: payload.approvedRefundAmount }
        : {}),
      ...(payload.status ? { status: payload.status } : {}),
      ...(payload.adminNotes !== undefined ? { admin_notes: payload.adminNotes } : {}),
    }),

  // Appeals management
  getAppeals: (options: {
    page?: number;
    limit?: number;
    status?: string;
    targetType?: 'MEMORIAL' | 'COMMENT' | 'USER' | 'DISPUTE' | 'ORDER' | 'OTHER';
    userId?: string;
    assignedTo?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 20,
      status,
      targetType,
      userId,
      assignedTo,
    } = options;

    return api.get('/admin/appeals', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
        ...(targetType ? { target_type: targetType } : {}),
        ...(userId ? { user_id: userId } : {}),
        ...(assignedTo ? { assigned_to: assignedTo } : {}),
      },
    });
  },

  getAppeal: (appealId: string) =>
    api.get(`/admin/appeals/${appealId}`),

  assignAppeal: (appealId: string, assignedTo?: string) =>
    api.post(`/admin/appeals/${appealId}/assign`, {
      assigned_to: assignedTo,
    }),

  decideAppeal: (
    appealId: string,
    payload: {
      status: 'APPROVED' | 'REJECTED' | 'CANCELLED';
      decision: 'UPHELD' | 'OVERTURNED' | 'PARTIALLY_OVERTURNED' | 'OTHER';
      resolutionNotes?: string;
      autoApply?: boolean;
    },
  ) =>
    api.post(`/admin/appeals/${appealId}/decision`, {
      status: payload.status,
      decision: payload.decision,
      ...(payload.resolutionNotes !== undefined
        ? { resolution_notes: payload.resolutionNotes }
        : {}),
      ...(payload.autoApply !== undefined ? { auto_apply: payload.autoApply } : {}),
    }),

  getAuditLogs: (options: {
    page?: number;
    limit?: number;
    adminId?: string;
    action?: string;
    targetType?: string;
    dateFrom?: string;
    dateTo?: string;
  } = {}) => {
    const {
      page = 1,
      limit = 20,
      adminId,
      action,
      targetType,
      dateFrom,
      dateTo,
    } = options;

    return api.get('/admin/audit-logs', {
      params: {
        page,
        limit,
        ...(adminId ? { admin_id: adminId } : {}),
        ...(action ? { action } : {}),
        ...(targetType ? { target_type: targetType } : {}),
        ...(dateFrom ? { date_from: dateFrom } : {}),
        ...(dateTo ? { date_to: dateTo } : {}),
      },
    });
  },

  // Export user data for compliance/GDPR
  exportUserData: (userId: string, reason?: string) =>
    api.post(`/admin/users/${userId}/export`, { reason }),

  // Anonymize user data for GDPR compliance
  anonymizeUser: (userId: string, options?: { reason?: string; legalNote?: string }) =>
    api.post(`/admin/users/${userId}/anonymize`, options),
};

// Analytics API methods (Admin)
export const analyticsApi = {
  getDashboard: (period: string = '30d') =>
    api.get('/analytics/dashboard', {
      params: { period },
    }),

  getUserAnalytics: (period: string = '30d') =>
    api.get('/analytics/users', {
      params: { period },
    }),
};

// System settings API methods (Admin)
export const settingsApi = {
  getAdminSettings: () => api.get('/admin/settings'),
  updateAdminSettings: (payload: any) => api.put('/admin/settings', payload),
};

// Vendor management API methods (Admin)
export const vendorManagementApi = {
  createVendorAccount: (vendorData: any) =>
    api.post('/admin/vendor-management/create', vendorData),

  getVendorAccounts: (page: number = 1, limit: number = 20, serviceType?: string, isActive?: boolean) =>
    api.get('/admin/vendor-management/accounts', {
      params: {
        page,
        limit,
        ...(serviceType ? { service_type: serviceType } : {}),
        ...(isActive !== undefined ? { is_active: isActive } : {}),
      },
    }),

  getVendorAccount: (vendorId: string) =>
    api.get(`/admin/vendor-management/accounts/${vendorId}`),

  updateVendorAccount: (vendorId: string, updateData: any) =>
    api.put(`/admin/vendor-management/accounts/${vendorId}`, updateData),

  resetVendorPassword: (vendorId: string, newPassword: string) =>
    api.post(`/admin/vendor-management/accounts/${vendorId}/reset-password`, { new_password: newPassword }),

  toggleVendorStatus: (vendorId: string) =>
    api.post(`/admin/vendor-management/accounts/${vendorId}/toggle-status`),

  deleteVendorAccount: (vendorId: string) =>
    api.delete(`/admin/vendor-management/accounts/${vendorId}`),

  updateVendorPermissions: (vendorId: string, permissions: any) =>
    api.put(`/admin/vendor-management/accounts/${vendorId}/permissions`, { permissions }),
};

// Vendor dashboard API methods
export const vendorApi = {
  getDashboard: () =>
    api.get('/vendor/dashboard'),

  getOrders: (page: number = 1, limit: number = 20, status?: string) =>
    api.get('/vendor/orders', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
      },
    }),

  updateOrderStatus: (orderId: string, status: string, notes?: string) =>
    api.put(`/vendor/orders/${orderId}/status`, { status, notes }),

  getProducts: (page: number = 1, limit: number = 20, category?: string, inStock?: boolean) =>
    api.get('/vendor/products', {
      params: {
        page,
        limit,
        ...(category ? { category } : {}),
        ...(inStock !== undefined ? { in_stock: inStock } : {}),
      },
    }),

  createProduct: (productData: any) =>
    api.post('/vendor/products', productData),

  updateProduct: (productId: string, productData: any) =>
    api.put(`/vendor/products/${productId}`, productData),

  updateProductStock: (productId: string, stockQuantity: number, inStock: boolean) =>
    api.put(`/vendor/products/${productId}/stock`, { stock_quantity: stockQuantity, in_stock: inStock }),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/vendor/change-password', { current_password: currentPassword, new_password: newPassword }),

  updateProfile: (profileData: any) =>
    api.put('/vendor/profile', profileData),

  getStats: (period: string = '30d') =>
    api.get('/vendors/stats/dashboard', {
      params: { period },
    }),
};

// User orders API methods
export const ordersApi = {
  getMyOrders: (
    page: number = 1,
    limit: number = 20,
    status?: string,
  ) =>
    api.get('/orders', {
      params: {
        page,
        limit,
        ...(status ? { status } : {}),
      },
    }),

  getOrder: (orderId: string) =>
    api.get(`/orders/${orderId}`),

  cancelOrder: (orderId: string, reason?: string) =>
    api.post(`/orders/${orderId}/cancel`, { reason }),

  addReview: (orderId: string, rating: number, review?: string) =>
    api.post(`/orders/${orderId}/review`, { rating, review }),
};

// Wallet API methods (user + admin)
export const walletApi = {
  // User-facing wallet endpoints
  getWallet: () => api.get('/wallet'),

  getBalance: () => api.get('/wallet/balance'),

  getTransactions: (
    page: number = 1,
    limit: number = 20,
    type?: string,
    status?: string,
  ) =>
    api.get('/wallet/transactions', {
      params: {
        page,
        limit,
        ...(type ? { type } : {}),
        ...(status ? { status } : {}),
      },
    }),

  getTransaction: (txnId: string) =>
    api.get(`/wallet/transactions/${txnId}`),

  getWalletStats: (period: string = '30d') =>
    api.get('/wallet/stats', {
      params: { period },
    }),

  // Admin-only helpers
  freezeWallet: (userId: string, reason: string) =>
    api.post(`/wallet/${userId}/freeze`, { reason }),

  unfreezeWallet: (userId: string) =>
    api.post(`/wallet/${userId}/unfreeze`),
};

export default api;
