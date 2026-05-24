'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/src/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Users, Plus, Shield, Settings, BarChart3, UserCheck, FileSearch } from 'lucide-react';
import Link from 'next/link';
import { adminApi } from '@/lib/api';

interface AdminStats {
  totalUsers: number;
  totalAdmins: number;
  totalVendors: number;
  totalMemorials: number;
}

export default function AdminDashboard() {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalAdmins: 0,
    totalVendors: 0,
    totalMemorials: 0
  });

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Administrator')) {
      router.push('/signin');
      return;
    }

    // Fetch admin stats
    fetchStats();
  }, [user, isLoading, router]);

  const fetchStats = async () => {
    try {
      const response = await adminApi.getOverviewStats();
      const overview = response.data?.data?.overview;

      if (overview) {
        setStats({
          totalUsers: overview.total_users ?? 0,
          totalAdmins: overview.total_admins ?? 0,
          totalVendors: overview.verified_vendors ?? 0,
          totalMemorials: overview.total_memorials ?? 0,
        });
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Header */}
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div>
              <h1 className="text-3xl font-bold text-white">
                {isSuperAdmin ? 'Super Admin Dashboard' : 'Admin Dashboard'}
              </h1>
              <p className="text-gray-300 mt-1">
                Welcome back, {user.name}
              </p>
            </div>
            <div className="flex items-center space-x-4">
              {isSuperAdmin && (
                <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-black px-3 py-1 rounded-full text-sm font-medium">
                  Super Admin
                </span>
              )}
              <div className="text-right">
                <p className="text-white font-medium">{user.name}</p>
                <p className="text-gray-400 text-sm">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Users className="h-8 w-8 text-blue-400" />
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Total Users</p>
                <p className="text-2xl font-bold text-white">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-purple-400" />
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Total Admins</p>
                <p className="text-2xl font-bold text-white">{stats.totalAdmins}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <UserCheck className="h-8 w-8 text-green-400" />
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Total Vendors</p>
                <p className="text-2xl font-bold text-white">{stats.totalVendors}</p>
              </div>
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20">
            <div className="flex items-center">
              <BarChart3 className="h-8 w-8 text-orange-400" />
              <div className="ml-4">
                <p className="text-gray-300 text-sm">Total Memorials</p>
                <p className="text-2xl font-bold text-white">{stats.totalMemorials}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Super Admin Only - Create New Admin */}
          {isSuperAdmin && (
            <Link href="/admin/create-admin">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl p-6 hover:from-purple-700 hover:to-blue-700 transition-all duration-300 cursor-pointer group">
                <div className="flex items-center">
                  <Plus className="h-8 w-8 text-white group-hover:scale-110 transition-transform" />
                  <div className="ml-4">
                    <h3 className="text-xl font-bold text-white">Create New Admin</h3>
                    <p className="text-purple-100 mt-1">Add a new administrator to the system</p>
                  </div>
                </div>
              </div>
            </Link>
          )}

          {/* User Management */}
          <Link href="/admin/users">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-400 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Manage Users</h3>
                  <p className="text-gray-300 mt-1">View and manage all users</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Vendor Management */}
          <Link href="/admin/vendors">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <UserCheck className="h-8 w-8 text-green-400 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Manage Vendors</h3>
                  <p className="text-gray-300 mt-1">Approve and manage vendors</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Memorial Management */}
          <Link href="/admin/memorials">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-orange-400 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Manage Memorials</h3>
                  <p className="text-gray-300 mt-1">Oversee memorial content</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Analytics */}
          <Link href="/admin/analytics">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-yellow-400 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Analytics</h3>
                  <p className="text-gray-300 mt-1">View platform statistics</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/admin/settings">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <Settings className="h-8 w-8 text-gray-400 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Settings</h3>
                  <p className="text-gray-300 mt-1">Configure system settings</p>
                </div>
              </div>
            </div>
          </Link>

          {/* Audit Logs */}
          <Link href="/admin/audit-logs">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 border border-white/20 hover:bg-white/20 transition-all duration-300 cursor-pointer group">
              <div className="flex items-center">
                <FileSearch className="h-8 w-8 text-purple-400 group-hover:scale-110 transition-transform" />
                <div className="ml-4">
                  <h3 className="text-xl font-bold text-white">Audit Logs</h3>
                  <p className="text-gray-300 mt-1">Review admin security & compliance actions</p>
                </div>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
