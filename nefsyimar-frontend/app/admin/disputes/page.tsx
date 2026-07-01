"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { adminApi } from "@/lib/api";
import { getSocket } from "@/lib/socket";

interface DisputeUser {
  user_id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface DisputeVendor {
  vendor_id: string;
  business_name: string;
}

interface DisputeOrderSummary {
  order_id: string;
  order_number: string;
  status: string;
  total_amount: string;
  currency: string;
  vendor_amount: string;
  vendor?: DisputeVendor;
  buyer?: DisputeUser;
}

interface DisputeSummary {
  dispute_id: string;
  order_id: string;
  raised_by: string;
  against_party: "VENDOR" | "BUYER" | "PLATFORM";
  category: "QUALITY" | "LATE_DELIVERY" | "NON_DELIVERY" | "WRONG_ITEM" | "OTHER";
  reason?: string;
  status: "OPEN" | "IN_REVIEW" | "RESOLVED" | "REJECTED" | "CANCELLED";
  resolution?: "NO_REFUND" | "PARTIAL_REFUND" | "FULL_REFUND" | "NON_MONETARY" | "OTHER" | null;
  requested_refund_amount?: string | null;
  approved_refund_amount?: string | null;
  currency: string;
  assigned_to?: string | null;
  closed_by?: string | null;
  closed_at?: string | null;
  admin_notes?: string | null;
  created_at: string;
  order?: DisputeOrderSummary;
  raised_by_user?: DisputeUser;
  assignee?: DisputeUser;
  closed_by_user?: DisputeUser;
}

interface PaginationMeta {
  current_page: number;
  total_pages: number;
  total_records: number;
  per_page: number;
}

export default function AdminDisputesPage() {
  const router = useRouter();
  const { user, isLoading } = useAuth();

  const [disputes, setDisputes] = useState<DisputeSummary[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState<string>("OPEN");
  const [againstFilter, setAgainstFilter] = useState<string>("");
  const [categoryFilter, setCategoryFilter] = useState<string>("");
  const [assignedFilter, setAssignedFilter] = useState<string>("");
  const [search, setSearch] = useState<string>("");
  const [isDataLoading, setIsDataLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [justUpdated, setJustUpdated] = useState(false);

  const loadDisputes = async (targetPage: number = 1) => {
    try {
      setIsDataLoading(true);
      setError(null);

      const res = await adminApi.getDisputes({
        page: targetPage,
        limit: 20,
        status: statusFilter || undefined,
        againstParty: againstFilter as any || undefined,
        category: categoryFilter as any || undefined,
        assignedTo: assignedFilter || undefined,
      });

      const data = res.data?.data;
      let rows: DisputeSummary[] = data?.disputes || [];

      if (search.trim().length > 0) {
        const q = search.trim().toLowerCase();
        rows = rows.filter((d) => {
          const buyer = d.order?.buyer?.name || "";
          const vendor = d.order?.vendor?.business_name || "";
          const orderNo = d.order?.order_number || "";
          const haystack = `${buyer} ${vendor} ${orderNo} ${d.reason || ""}`.toLowerCase();
          return haystack.includes(q);
        });
      }

      setDisputes(rows);
      setPagination(data?.pagination || null);
      setPage(targetPage);
    } catch (err: any) {
      console.error("Failed to load disputes", err);
      setError(err?.response?.data?.message || "Failed to load disputes");
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

    loadDisputes(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, isLoading, router]);

  useEffect(() => {
    if (isLoading || !user || user.role !== "Administrator") return;

    const socket = getSocket();
    if (!socket) return;

    const handleDisputesUpdated = () => {
      loadDisputes(page);
      setJustUpdated(true);
      setTimeout(() => setJustUpdated(false), 3000);
    };

    socket.emit("disputes:admin-subscribe");
    socket.on("disputes:updated", handleDisputesUpdated);

    return () => {
      socket.off("disputes:updated", handleDisputesUpdated);
    };
  }, [user, isLoading, page]);

  const role = user?.role;
  if (isLoading || !user || role !== "Administrator") {
    return null;
  }

  const handlePageChange = (target: number) => {
    if (!pagination) return;
    if (target < 1 || target > pagination.total_pages) return;
    loadDisputes(target);
  };

  const applyFilters = () => {
    loadDisputes(1);
  };

  const resetFilters = () => {
    setStatusFilter("OPEN");
    setAgainstFilter("");
    setCategoryFilter("");
    setAssignedFilter("");
    setSearch("");
    loadDisputes(1);
  };

  const handleView = (disputeId: string) => {
    router.push(`/admin/disputes/${disputeId}`);
  };

  const handleAssignToMe = async (disputeId: string) => {
    if (!user) return;
    try {
      await adminApi.assignDispute(disputeId, (user as any).user_id);
      await loadDisputes(page);
    } catch (err) {
      console.error("Failed to assign dispute", err);
      typeof window !== "undefined" && window.alert("Failed to assign dispute");
    }
  };

  const visibleDisputes = disputes;

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 via-primary-800 to-accent-900 p-6 text-white">
      <div className="max-w-7xl mx-auto space-y-6">
        <header>
          <h1 className="text-3xl font-bold mb-2">Disputes & Refunds</h1>
          <p className="text-accent-300">
            Review and resolve disputes between buyers, vendors, and the platform, including issuing refunds where
            appropriate.
          </p>
        </header>

        {justUpdated && (
          <div className="bg-emerald-900/40 border border-emerald-600/70 text-emerald-100 text-xs px-3 py-2 rounded-lg">
            Disputes list updated just now.
          </div>
        )}

        <section className="bg-primary-800/70 border border-primary-700 rounded-xl p-4 space-y-4">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              <div>
                <label className="block text-sm text-accent-300 mb-1">Status</label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Any</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_REVIEW">In review</option>
                  <option value="RESOLVED">Resolved</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-accent-300 mb-1">Against</label>
                <select
                  value={againstFilter}
                  onChange={(e) => setAgainstFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Any</option>
                  <option value="VENDOR">Vendor</option>
                  <option value="BUYER">Buyer</option>
                  <option value="PLATFORM">Platform</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-accent-300 mb-1">Category</label>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                >
                  <option value="">Any</option>
                  <option value="QUALITY">Quality</option>
                  <option value="LATE_DELIVERY">Late delivery</option>
                  <option value="NON_DELIVERY">Non-delivery</option>
                  <option value="WRONG_ITEM">Wrong item</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="block text-sm text-accent-300 mb-1">Assigned to (admin id)</label>
                <input
                  type="text"
                  value={assignedFilter}
                  onChange={(e) => setAssignedFilter(e.target.value)}
                  placeholder="Optional admin user_id"
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <div className="flex-1">
                <label className="block text-sm text-accent-300 mb-1">Search</label>
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Buyer, vendor, order number, reason..."
                  className="w-full px-3 py-2 rounded-lg bg-primary-700/60 border border-primary-600 text-sm focus:outline-none focus:ring-2 focus:ring-accent-500"
                />
              </div>
              <div className="flex md:flex-col gap-2 md:justify-end pt-1 md:pt-0">
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
          </div>

          {error && (
            <div className="text-sm text-red-300 bg-red-900/30 border border-red-700 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {isDataLoading && visibleDisputes.length === 0 ? (
            <p className="text-sm text-accent-300">Loading disputes...</p>
          ) : visibleDisputes.length === 0 ? (
            <p className="text-sm text-accent-300">No disputes found for this filter.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead className="text-left text-accent-300 border-b border-primary-700">
                  <tr>
                    <th className="py-2 pr-4">Dispute</th>
                    <th className="py-2 pr-4">Order</th>
                    <th className="py-2 pr-4">Parties</th>
                    <th className="py-2 pr-4">Status</th>
                    <th className="py-2">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {visibleDisputes.map((d) => (
                    <tr key={d.dispute_id} className="border-b border-primary-700/60 align-top">
                      <td className="py-2 pr-4 max-w-xs text-xs">
                        <div className="font-medium">
                          {d.category.replace(/_/g, " ").toLowerCase().replace(/\b\w/g, (l) => l.toUpperCase())}
                        </div>
                        <div className="text-[11px] text-accent-300 mt-1">
                          Against: {d.against_party.toLowerCase()}
                        </div>
                        {d.reason && (
                          <div className="text-[11px] text-accent-200 mt-1 whitespace-pre-wrap break-words">
                            {d.reason}
                          </div>
                        )}
                        <div className="text-[11px] text-accent-400 mt-1">
                          Created: {new Date(d.created_at).toLocaleString()}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        {d.order ? (
                          <>
                            <div>#{d.order.order_number}</div>
                            <div className="text-[11px] text-accent-300 mt-1">
                              {d.order.total_amount} {d.order.currency}
                            </div>
                            <div className="text-[11px] text-accent-400 mt-1">
                              Status: {d.order.status}
                            </div>
                          </>
                        ) : (
                          <div className="text-[11px] text-accent-300">order_id: {d.order_id}</div>
                        )}
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        <div>
                          <div className="text-[11px] text-accent-300">Buyer</div>
                          <div>{d.order?.buyer?.name || "—"}</div>
                          {d.order?.buyer?.email && (
                            <div className="text-[11px] text-accent-400">{d.order.buyer.email}</div>
                          )}
                        </div>
                        <div className="mt-2">
                          <div className="text-[11px] text-accent-300">Vendor</div>
                          <div>{d.order?.vendor?.business_name || "—"}</div>
                        </div>
                        <div className="mt-2 text-[11px] text-accent-400">
                          Raised by: {d.raised_by_user?.name || d.raised_by}
                        </div>
                      </td>
                      <td className="py-2 pr-4 text-xs">
                        <div>
                          <span className="inline-block px-2 py-0.5 rounded-full bg-primary-700 text-accent-200 text-[11px]">
                            {d.status}
                          </span>
                        </div>
                        {d.resolution && (
                          <div className="text-[11px] text-accent-300 mt-1">
                            Resolution: {d.resolution}
                          </div>
                        )}
                        {d.approved_refund_amount && (
                          <div className="text-[11px] text-emerald-300 mt-1">
                            Refund: {d.approved_refund_amount} {d.currency}
                          </div>
                        )}
                        <div className="text-[11px] text-accent-300 mt-1">
                          Assigned:{" "}
                          {d.assignee ? d.assignee.name : d.assigned_to ? d.assigned_to : "Unassigned"}
                        </div>
                      </td>
                      <td className="py-2 text-xs">
                        <div className="flex flex-col gap-1">
                          <button
                            onClick={() => handleView(d.dispute_id)}
                            className="text-[11px] px-3 py-1 rounded bg-primary-700 hover:bg-primary-600"
                          >
                            View
                          </button>
                          <button
                            onClick={() => handleAssignToMe(d.dispute_id)}
                            className="text-[11px] px-3 py-1 rounded bg-primary-700 hover:bg-primary-600"
                          >
                            Assign to me
                          </button>
                        </div>
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
