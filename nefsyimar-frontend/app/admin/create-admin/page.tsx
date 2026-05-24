'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { Shield, ArrowLeft, Eye, EyeOff, User, Mail, Lock, Phone, Calendar, MapPin } from 'lucide-react';
import Link from 'next/link';

interface CreateAdminForm {
  name: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  date_of_birth: string;
  gender: string;
  city: string;
  region: string;
}

export default function CreateAdminPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState<CreateAdminForm>({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    date_of_birth: '',
    gender: '',
    city: '',
    region: ''
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Administrator')) {
      router.push('/signin');
      return;
    }

    const isSuperAdmin = !!(user?.is_super_admin || (user as any)?.isSuperAdmin);
    if (!isLoading && user && !isSuperAdmin) {
      router.push('/admin/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = (): string | null => {
    if (!formData.name.trim()) return 'Name is required';
    if (!formData.email.trim()) return 'Email is required';
    if (!formData.password) return 'Password is required';
    if (formData.password.length < 8) return 'Password must be at least 8 characters';
    if (formData.password !== formData.confirmPassword) return 'Passwords do not match';
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) return 'Please enter a valid email address';

    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validationError = validateForm();
    if (validationError) {
      setMessage({ type: 'error', text: validationError });
      return;
    }

    setIsSubmitting(true);
    setMessage(null);

    try {
      const response = await api.post('/admin/users/admins', {
        name: formData.name.trim(),
        email: formData.email.trim().toLowerCase(),
        phone: formData.phone.trim() || null,
        password: formData.password,
        date_of_birth: formData.date_of_birth || null,
        gender: formData.gender || null,
        city: formData.city.trim() || null,
        region: formData.region.trim() || null,
      });

      const data = response.data;

      if (response.status >= 200 && response.status < 300 && data?.success !== false) {
        setMessage({ 
          type: 'success', 
          text: `Administrator "${formData.name}" created successfully! They can now log in with their email and password.` 
        });
        
        // Reset form
        setFormData({
          name: '',
          email: '',
          phone: '',
          password: '',
          confirmPassword: '',
          date_of_birth: '',
          gender: '',
          city: '',
          region: ''
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: data?.message || 'Failed to create administrator' 
        });
      }
    } catch (error) {
      console.error('Error creating admin:', error);
      setMessage({ 
        type: 'error', 
        text: 'Network error. Please check your connection and try again.' 
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  if (!user || user.role !== 'Administrator') {
    return null;
  }

  const isSuperAdmin = !!(user.is_super_admin || (user as any).isSuperAdmin);
  
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center py-6">
            <Link href="/admin/dashboard" className="mr-4">
              <ArrowLeft className="h-6 w-6 text-white hover:text-purple-300 transition-colors" />
            </Link>
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-400 mr-3" />
              <div>
                <h1 className="text-3xl font-bold text-white">Create New Administrator</h1>
                <p className="text-gray-300 mt-1">Add a new administrator to the system</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 border border-white/20">
          {/* Message */}
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              message.type === 'success' 
                ? 'bg-green-500/20 border border-green-500/30 text-green-100' 
                : 'bg-red-500/20 border border-red-500/30 text-red-100'
            }`}>
              {message.text}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Basic Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter administrator's full name"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="admin@nefsyimar.com"
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Phone Number
                  </label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      value={formData.phone}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="+251912345678"
                    />
                  </div>
                </div>

                {/* Gender */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Gender
                  </label>
                  <select
                    name="gender"
                    value={formData.gender}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    style={{ color: 'white' }}
                  >
                    <option value="" style={{ backgroundColor: '#1f2937', color: 'white' }}>Select gender</option>
                    <option value="male" style={{ backgroundColor: '#1f2937', color: 'white' }}>Male</option>
                    <option value="female" style={{ backgroundColor: '#1f2937', color: 'white' }}>Female</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Security Information */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <Lock className="h-5 w-5 mr-2" />
                Security Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Minimum 8 characters"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                    >
                      {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>

                {/* Confirm Password */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      name="confirmPassword"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 pr-12 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Confirm password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
                    >
                      {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Additional Information */}
            <div>
              <h3 className="text-xl font-semibold text-white mb-4 flex items-center">
                <MapPin className="h-5 w-5 mr-2" />
                Additional Information
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Date of Birth
                  </label>
                  <div className="relative">
                    <Calendar className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="date_of_birth"
                      value={formData.date_of_birth}
                      onChange={handleInputChange}
                      className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City
                  </label>
                  <input
                    type="text"
                    name="city"
                    value={formData.city}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter city"
                  />
                </div>

                {/* Region */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Region
                  </label>
                  <input
                    type="text"
                    name="region"
                    value={formData.region}
                    onChange={handleInputChange}
                    className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    placeholder="Enter region"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <div className="flex justify-end space-x-4 pt-6">
              <Link href="/admin/dashboard">
                <button
                  type="button"
                  className="px-6 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </Link>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-8 py-3 bg-gradient-to-r from-purple-600 to-blue-600 text-white rounded-lg hover:from-purple-700 hover:to-blue-700 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating...
                  </>
                ) : (
                  <>
                    <Shield className="h-5 w-5 mr-2" />
                    Create Administrator
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
