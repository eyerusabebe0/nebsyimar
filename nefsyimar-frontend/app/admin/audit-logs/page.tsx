'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Shield, Filter, Calendar, User as UserIcon, FileSearch } from 'lucide-react';

import { useAuth } from '@/src/contexts/AuthContext';
import { adminApi } from '@/lib/api';

interface AdminSummary {
  user_id: string;
  name: string;
  email: string;
}

interface AdminActionLogRecord {
  log_id: string;
  admin_id: string;
  action: string;
  target_type: string;
  target_id: string | null;
  target_label: string | null;
  reason: string | null;
  metadata: any;
  ip_address: string | null;
  user_agent: string | null;
  created_at: string;
  admin?: AdminSummary;
}

interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_records: number;
  per_page: number;
}

interface AuditLogResponse {
  logs: AdminActionLogRecord[];
  pagination: PaginationMeta;
}

const ACTION_OPTIONS = [
  { value: '', label: 'All actions' },
  { value: 'WALLET_FREEZE', label: 'Wallet freeze' },
  { value: 'WALLET_UNFREEZE', label: 'Wallet unfreeze' },
  { value: 'VENDOR_VERIFY', label: 'Vendor verify' },
  { value: 'VENDOR_REJECT', label: 'Vendor reject' },
  { value: 'ORDER_CANCEL', label: 'Order cancel' },
  { value: 'SETTINGS_UPDATE', label: 'Settings update' },
  { value: 'USER_DEACTIVATE', label: 'User deactivate' },
  { value: 'USER_REACTIVATE', label: 'User reactivate' },
  { value: 'USER_BAN', label: 'User ban' },
  { value: 'USER_UNBAN', label: 'User unban' },
  { value: 'USER_DATA_EXPORT', label: 'User data export' },
  { value: 'USER_ANONYMIZE', label: 'User anonymize' },
  { value: 'USER_IMPERSONATE', label: 'User impersonate' },
];

const TARGET_TYPE_OPTIONS = [
  { value: '', label: 'All target types' },
  { value: 'USER', label: 'User' },
  { value: 'VENDOR', label: 'Vendor' },
  { value: 'ORDER', label: 'Order' },
  { value: 'WALLET', label: 'Wallet' },
  { value: 'SYSTEM', label: 'System' },
  { value: 'OTHER', label: 'Other' },
];

export default function AdminAuditLogsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [logs, setLogs] = useState<AdminActionLogRecord[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [adminFilter, setAdminFilter] = useState('');
  const [actionFilter, setActionFilter] = useState('');
  const [targetTypeFilter, setTargetTypeFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const [isFetching, setIsFetching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoading && (!user || user.role !== 'Administrator')) {
      router.push('/signin');
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    if (user && user.role === 'Administrator') {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  const fetchLogs = async () => {
    try {
      setIsFetching(true);
      setError(null);

      const response = await adminApi.getAuditLogs({
        page,
        limit,
        adminId: adminFilter || undefined,
        action: actionFilter || undefined,
        targetType: targetTypeFilter || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
      });

      const data: AuditLogResponse | undefined = response.data?.data;

      if (data) {
        setLogs(data.logs || []);
        setPagination(data.pagination || null);
      }
    } catch (err: any) {
      setError(err?.response?.data?.message || 'Failed to fetch audit logs');
    } finally {
      setIsFetching(false);
    }
  };

  const handleApplyFilters = () => {
    setPage(1);
    fetchLogs();
  };

  const handleResetFilters = () => {
    setAdminFilter('');
    setActionFilter('');
    setTargetTypeFilter('');
    setDateFrom('');
    setDateTo('');
    setPage(1);
    fetchLogs();
  };

  const formatDateTime = (value: string) => {
    try {
      const d = new Date(value);
      if (Number.isNaN(d.getTime())) {
        return value;
      }
      return d.toLocaleString();
    } catch {
      return value;
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="bg-black/20 backdrop-blur-sm border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-purple-500/20 flex items-center justify-center">
                <Shield className="h-6 w-6 text-purple-300" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Admin Audit Logs</h1>
                <p className="text-gray-300 text-sm">
                  Track sensitive administrative actions for security and compliance.
                </p>
              </div>
            </div>
            <div className="text-sm text-gray-300 hidden sm:block">
              <p className="font-medium">Logged in as</p>
              <p>{user.name}</p>
              <p className="text-gray-400">{user.email}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl p-4 sm:p-6">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="h-5 w-5 text-purple-300" />
            <h2 className="text-lg font-semibold text-white">Filters</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                <UserIcon className="h-3 w-3" />
                Admin ID
              </label>
              <input
                value={adminFilter}
                onChange={(e) => setAdminFilter(e.target.value)}
                placeholder="Filter by admin ID"
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <p className="mt-1 text-[11px] text-gray-400">
                Paste the admin UUID if you need to focus on a specific administrator.
              </p>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Action</label>
              <select
                value={actionFilter}
                onChange={(e) => setActionFilter(e.target.value)}
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {ACTION_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-gray-300 mb-1">Target type</label>
              <select
                value={targetTypeFilter}
                onChange={(e) => setTargetTypeFilter(e.target.value)}
                className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {TARGET_TYPE_OPTIONS.map((option) => (
                  <option key={option.value || 'all'} value={option.value} className="bg-slate-900">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="block text-xs font-medium text-gray-300 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                Date range
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <span className="text-gray-400 text-xs">to</span>
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="w-full rounded-md bg-black/40 border border-white/10 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3 justify-end">
            <button
              type="button"
              onClick={handleResetFilters}
              disabled={isFetching}
              className="px-4 py-2 rounded-md text-sm font-medium border border-gray-500 text-gray-200 hover:bg-white/10 disabled:opacity-60"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={handleApplyFilters}
              disabled={isFetching}
              className="px-4 py-2 rounded-md text-sm font-medium bg-purple-600 text-white hover:bg-purple-700 disabled:opacity-60"
            >
              {isFetching ? 'Applying...' : 'Apply filters'}
            </button>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-sm border border-white/10 rounded-xl">
          <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-white/10">
            <div className="flex items-center gap-2">
              <FileSearch className="h-5 w-5 text-purple-300" />
              <h2 className="text-lg font-semibold text-white">Logs</h2>
              {pagination && (
                <span className="text-xs text-gray-400">
                  {pagination.total_records} records
                </span>
              )}
            </div>
            <div className="text-xs text-gray-400 hidden sm:block">
              Use filters above to zoom in on specific actions, admins, or time ranges.
            </div>
          </div>

          {error && (
            <div className="px-4 sm:px-6 py-3 text-sm text-red-300 bg-red-900/30 border-b border-red-500/40">
              {error}
            </div>
          )}

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-sm">
              <thead className="bg-black/30">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Time</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Admin</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Target</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Reason</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">IP</th>
                </tr>
              </thead>
              <tbody className="bg-black/20 divide-y divide-white/5">
                {logs.length === 0 && !isFetching && (
                  <tr>
                    <td colSpan={6} className="px-4 py-8 text-center text-gray-400 text-sm">
                      No audit logs found for the selected filters.
                    </td>
                  </tr>
                )}

                {isFetching && (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-gray-300 text-sm">
                      Loading logs...
                    </td>
                  </tr>
                )}

                {!isFetching &&
                  logs.map((log) => {
                    const adminLabel = log.admin
                      ? `${log.admin.name || 'Admin'} (${log.admin.email || 'no email'})`
                      : log.admin_id;

                    const targetLabel = log.target_label || log.target_id || '-';

                    return (
                      <tr key={log.log_id} className="hover:bg-white/5">
                        <td className="px-4 py-3 text-gray-200 whitespace-nowrap">
                          {formatDateTime(log.created_at)}
                        </td>
                        <td className="px-4 py-3 text-gray-200 whitespace-nowrap">
                          {adminLabel}
                        </td>
                        <td className="px-4 py-3 text-gray-200 whitespace-nowrap">
                          <span className="inline-flex items-center rounded-full bg-purple-500/20 px-2 py-0.5 text-xs font-medium text-purple-200 border border-purple-500/60">
                            {log.action}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-gray-200 whitespace-nowrap">
                          <div className="flex flex-col">
                            <span className="text-xs text-gray-300">{log.target_type}</span>
                            <span className="text-sm">{targetLabel}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-200 max-w-xs">
                          <div className="text-xs text-gray-100 truncate" title={log.reason || undefined}>
                            {log.reason || '-'}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-300 whitespace-nowrap text-xs">
                          {log.ip_address || '-'}
                        </td>
                      </tr>
                    );
                  })}
              </tbody>
            </table>
          </div>

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between px-4 sm:px-6 py-4 border-t border-white/10 text-xs text-gray-300">
              <div>
                Page {pagination.current_page} of {pagination.total_pages}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  disabled={page <= 1 || isFetching}
                  onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                  className="px-3 py-1 rounded-md border border-white/20 text-gray-200 hover:bg-white/10 disabled:opacity-40"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page >= pagination.total_pages || isFetching}
                  onClick={() => setPage((prev) => prev + 1)}
                  className="px-3 py-1 rounded-md border border-white/20 text-gray-200 hover:bg-white/10 disabled:opacity-40"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="text-xs text-gray-500 flex flex-wrap items-center gap-2">
          <span>Need deeper investigations?</span>
          <span>
            Export data directly from your database or connect this endpoint to your SIEM / logging stack for long-term
            retention.
          </span>
        </div>

        <div className="text-xs text-gray-500">
          <Link href="/admin" className="text-purple-300 hover:text-purple-200">
            Back to admin dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
