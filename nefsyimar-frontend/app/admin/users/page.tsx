"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";

interface AdminUserRow {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
  role: string;
  is_active: boolean;
  is_banned?: boolean;
  ban_reason?: string | null;
  gender?: string | null;
  wallet?: {
    wallet_id: string;
    balance: string;
    is_frozen: boolean;
    frozen_reason?: string | null;
  };
  total_donations_sent?: number;
  total_donations_received?: number;
  can_create_memorials?: boolean;
  can_comment?: boolean;
}

interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_records: number;
  per_page: number;
}

export default function AdminUsersPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [roleFilter, setRoleFilter] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async (targetPage: number = 1) => {
    try {
      setIsDataLoading(true);
      setError(null);

      const res = await adminApi.getUsers(targetPage, 20, roleFilter || undefined, statusFilter || undefined);
      const data = res.data?.data;

      let rows: AdminUserRow[] = data?.users || [];

      if (search.trim().length > 0) {
        const q = search.trim().toLowerCase();
        rows = rows.filter((u) => {
          const haystack = `${u.name || ""} ${u.email || ""} ${u.phone || ""} ${u.role || ""}`.toLowerCase();
          return haystack.includes(q);
        });
      }

      setUsers(rows);
      setPagination(data?.pagination || null);
      setPage(targetPage);
    } catch (err: any) {
      console.error("Failed to load users", err);
      setError(err?.response?.data?.message || "Failed to load users");
    } finally {
      setIsDataLoading(false);
    }
  };

  useEffect(() => {
    if (isLoading) return;

    const role = user?.role;

    if (!user) {
      router.replace("/signin");
      return;
    }

    if (role !== "Administrator") {
      router.replace("/dashboard");
      return;
    }

    loadUsers(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, router]);

  const role = user?.role;
  if (isLoading || !user || role !== "Administrator") {
    return null;
  }

  const handlePageChange = (target: number) => {
    if (!pagination) return;
    if (target < 1 || target > pagination.total_pages) return;
    loadUsers(target);
  };

  const applyFilters = () => {
    loadUsers(1);
  };

  const resetFilters = () => {
    setRoleFilter("");
    setStatusFilter("");
    setSearch("");
    loadUsers(1);
  };

  const handleViewDetail = (userId: string) => {
    router.push(`/admin/users/${userId}`);
  };

  const formatAmount = (value?: number) => {
    if (value === undefined || value === null) return "0.00";
    return value.toFixed(2);
  };

  const visibleUsers = users.filter((u) => u.role !== "Administrator");

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-6xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold mb-2">Users Administration</h1>
          <p className="text-accent-300">
            Search, filter, and manage user accounts, permissions, and status.
          </p>
        </header>

        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4 space-y-4">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div className="flex-1 flex flex-col md:flex-row md:items-center gap-3">
              <div className="w-full md:w-48">
                <label className="block text-sm text-accent-300 mb-1">Role</label>
                <select
                  value={roleFilter}
                  onChange={(e) => setRoleFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Any</option>
                  <option value="Public User">Public User</option>
                  <option value="Family Account">Family Account</option>
                  <option value="Vendor">Vendor</option>
                  <option value="Finance Officer">Finance Officer</option>
                  <option value="Administrator">Administrator</option>
                </select>
              </div>

              <div className="w-full md:w-40">
                <label className="block text-sm text-accent-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Any</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>

              <div className="flex-1">
                <label className="block text-sm text-accent-300 mb-1">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Name, email, phone, role..."
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-2">
              <button
                onClick={applyFilters}
                className="px-4 py-2 rounded-lg bg-accent-600 hover:bg-accent-500 text-sm font-semibold"
              >
                Apply
              </button>
              <button
                onClick={resetFilters}
                className="px-4 py-2 rounded-lg bg-primary-700 hover:bg-primary-600 text-sm"
              >
                Reset
              </button>
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {isDataLoading && visibleUsers.length === 0 ? (
            <p className="text-sm text-accent-300">Loading users...</p>
          ) : visibleUsers.length === 0 ? (
            <p className="text-sm text-accent-300">No users found for this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">User</th>
                    <th className="py-2 pr-4">Role</th>
                    <th className="py-2 pr-4">Wallet</th>
                    <th className="py-2 pr-4">Donations</th>
                    <th className="py-2 pr-4">Account</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleUsers.map((u) => (
                    <tr key={u.user_id} className="border-b border-primary-700/60">
                      <td className="py-2 pr-4">
                        <div className="font-medium">{u.name}</div>
                        {u.email && (
                          <div className="text-xs text-accent-300">{u.email}</div>
                        )}
                        {u.phone && (
                          <div className="text-xs text-accent-400">{u.phone}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs">{u.role}</td>
                      <td className="py-2 pr-4 text-xs">
                        {u.wallet ? (
                          <>
                            <div>{u.wallet.balance} ETB</div>
                            <div className="text-[11px]">
                              {u.wallet.is_frozen ? (
                                <span className="text-red-300">Frozen</span>
                              ) : (
                                <span className="text-emerald-300">Active</span>
                              )}
                            </div>
                          </>
                        ) : (
                          <span className="text-accent-400">No wallet</span>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        <div>
                          Sent: {formatAmount(u.total_donations_sent)} ETB
                        </div>
                        <div>
                          Received: {formatAmount(u.total_donations_received)} ETB
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {u.is_banned ? (
                          <span className="text-red-300">Banned</span>
                        ) : u.is_active ? (
                          <span className="text-emerald-300">Active</span>
                        ) : (
                          <span className="text-yellow-300">Deactivated</span>
                        )}
                      </td>
                      <td className="py-2">
                        <button
                          onClick={() => handleViewDetail(u.user_id)}
                          className="text-[11px] px-3 py-1 rounded bg-primary-700 hover:bg-primary-600"
                        >
                          View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {pagination && pagination.total_pages > 1 && (
            <div className="flex items-center justify-between pt-3 text-xs text-accent-300">
              <div>
                Page {pagination.current_page} of {pagination.total_pages} • {pagination.total_records} records
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => handlePageChange(pagination.current_page - 1)}
                  disabled={pagination.current_page === 1}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(pagination.current_page + 1)}
                  disabled={pagination.current_page === pagination.total_pages}
                  className="px-3 py-1 rounded bg-primary-700 disabled:bg-primary-900 disabled:text-accent-500"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
