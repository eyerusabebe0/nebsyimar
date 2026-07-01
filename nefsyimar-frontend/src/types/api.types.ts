export interface User {
  // Backend primary key
  user_id: string;

  // Legacy alias used in some parts of the frontend
  id?: string;

  name: string;
  email: string | null;
  phone?: string | null;
  role: 'Administrator' | 'Family Account' | 'Public User' | 'Vendor' | 'Finance Officer';

  // Account metadata / flags
  username?: string | null;
  is_active?: boolean;
  is_banned?: boolean;
  ban_reason?: string | null;
  last_login?: string | null;
  can_create_memorials?: boolean;
  can_comment?: boolean;

  // Super admin flag (computed on backend)
  is_super_admin?: boolean;
  isSuperAdmin?: boolean;

  // Verification flags (backend + legacy aliases)
  verified?: boolean;
  email_verified?: boolean;
  phone_verified?: boolean;
  isEmailVerified?: boolean;
  isPhoneVerified?: boolean;

  // Profile fields (backend + aliases)
  date_of_birth?: string;
  dateOfBirth?: string;
  gender?: string;
  city?: string;
  region?: string;
  address?: string;
  country?: string;
  profile_image?: string;
  profileImage?: string;
  bio?: string;

  // Timestamps (snake_case from backend plus camelCase aliases)
  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;

  // Optional embedded wallet when returned from some endpoints
  wallet?: Wallet;
}

export interface Wallet {
  // Backend primary key
  wallet_id: string;

  // Legacy alias
  id?: string;

  // Foreign key to user
  user_id: string;
  userId?: string;

  // Monetary fields are decimal strings in API, but allow number for convenience
  balance: string | number;
  currency: string;

  is_frozen?: boolean;
  isFrozen?: boolean;
  is_active?: boolean;
  isActive?: boolean;
  frozen_reason?: string | null;
  frozen_at?: string | null;
  frozen_by?: string | null;
  total_deposited?: string | number;
  total_spent?: string | number;
  last_transaction_at?: string | null;

  created_at?: string;
  updated_at?: string;
  createdAt?: string;
  updatedAt?: string;
}

export interface LoginResponse {
  user: User;
  token: string;
  expiresIn: number;
}

export interface RegisterResponse {
  user: User;
  message: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  errors?: Record<string, string[]>;
}
