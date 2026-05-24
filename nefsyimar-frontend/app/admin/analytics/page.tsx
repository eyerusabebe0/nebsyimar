'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { analyticsApi, API_BASE_URL } from '@/lib/api';
import { BarChart3, TrendingUp, Download, Users, Gift, ShoppingBag } from 'lucide-react';

type PeriodOption = '7d' | '30d' | '90d' | '1y';

interface DashboardResponse {
  overview: {
    total_users: number;
    new_users?: number;
    active_users?: number;
    active_users_in_period?: number;
    total_memorials: number;
    new_memorials?: number;
    total_transaction_volume: number;
    total_transactions: number;
    total_gifts: number;
    total_orders: number;
    active_vendors: number;
  };
  trends: {
    daily_transactions: { date: string; volume: number; count: number }[];
    memorials?: { date: string; count: number }[];
    orders?: { date: string; count: number }[];
    gifts?: { date: string; count: number }[];
  };
  top_creators: {
    user_id: string;
    name: string;
    email: string;
    memorial_count: number;
  }[];
  top_memorials?: {
    memorial_id: string;
    deceased_name: string;
    memorial_url: string | null;
    total_gifts_value: number;
    gift_count: number;
    view_count: number;
    creator: {
      user_id: string;
      name: string;
      email: string;
    } | null;
  }[];
  top_vendors?: {
    vendor_id: string;
    business_name: string;
    service_type: string;
    city: string;
    rating: number;
    total_orders: number;
    total_revenue: number;
  }[];
  top_donors?: {
    user_id: string;
    name: string;
    email: string | null;
    total_value: number;
    gift_count: number;
  }[];
  revenue: {
    memorial_fees: number;
    gift_fees: number;
    marketplace_commission: number;
  };
  donations?: {
    today_amount: number;
    today_count: number;
    week_amount: number;
    week_count: number;
    month_amount: number;
    month_count: number;
    total_amount: number;
    total_count: number;
  };
  trust_safety?: {
    reports_total: number;
    reports_in_period: number;
    open_reports: number;
    banned_users: number;
    avg_resolution_hours: number | null;
    reports_by_week: { week_start: string; count: number }[];
    reports_by_category: { category: string; count: number }[];
    reports_by_severity: { severity: string; count: number }[];
    most_reported_memorials: {
      memorial_id: string;
      deceased_name: string | null;
      memorial_url: string | null;
      report_count: number;
    }[];
    most_reported_users: {
      user_id: string;
      name: string | null;
      email: string | null;
      report_count: number;
    }[];
  };
  period: string;
  generated_at: string;
}

interface UserAnalyticsResponse {
  registration_trends: { date: string; registrations: number }[];
  activity: {
    memorial_creators: number;
    gift_senders: number;
    order_makers: number;
  };
  period: string;
  generated_at: string;
}

export default function AdminAnalyticsPage() {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  const [period, setPeriod] = useState<PeriodOption>('30d');
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);
  const [userAnalytics, setUserAnalytics] = useState<UserAnalyticsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isLoading) return;

    if (!user) {
      router.replace('/signin');
      return;
    }

    if ((user as any).role !== 'Administrator') {
      router.replace('/dashboard');
      return;
    }
  }, [user, isLoading, router]);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!user || (user as any).role !== 'Administrator') return;

      try {
        setLoading(true);
        setError(null);

        const [dashboardRes, userRes] = await Promise.all([
          analyticsApi.getDashboard(period),
          analyticsApi.getUserAnalytics(period),
        ]);

        const dashData = dashboardRes.data?.data as DashboardResponse;
        const userData = userRes.data?.data as UserAnalyticsResponse;

        setDashboard(dashData || null);
        setUserAnalytics(userData || null);
      } catch (err: any) {
        console.error('Failed to load analytics', err);
        setError(err?.response?.data?.message || 'Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [user, period]);

  if (isLoading || !user || (user as any).role !== 'Administrator') {
    return null;
  }

  const handleExport = (type: 'transactions' | 'memorials' | 'reports') => {
    const url = `${API_BASE_URL}/analytics/export?type=${type}&period=${period}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
    }
  };

  const periodLabel = (p: PeriodOption) => {
    switch (p) {
      case '7d':
        return 'Last 7 days';
      case '30d':
        return 'Last 30 days';
      case '90d':
        return 'Last 90 days';
      case '1y':
        return 'Last 12 months';
      default:
        return p;
    }
  };

  const renderMiniBarChart = (points: { date: string; count: number }[], color: string) => {
    if (!points || points.length === 0) {
      return <p className="text-xs text-accent-300">No data for this period.</p>;
    }

    const max = Math.max(...points.map((p) => p.count));

    return (
      <div className="mt-2 h-28 flex items-end gap-1">
        {points.map((p) => {
          const height = max > 0 ? Math.round((p.count / max) * 100) : 0;
          return (
            <div key={p.date} className="flex-1 flex flex-col items-center">
              <div
                className={`w-full rounded-t-sm ${color}`}
                style={{ height: `${height}%`, minHeight: height > 0 ? '4px' : '0px' }}
                title={`${p.count} on ${new Date(p.date).toLocaleDateString()}`}
              />
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold flex items-center gap-2">
              <BarChart3 className="h-8 w-8 text-yellow-400" />
              <span>Analytics &amp; Insights</span>
            </h1>
            <p className="text-accent-200 mt-1 text-sm md:text-base">
              Platform-wide analytics for users, memorials, gifts, and marketplace performance.
            </p>
          </div>

          {/* Period selector */}
          <div className="flex items-center gap-2 bg-black/30 border border-white/10 rounded-full px-2 py-1">
            {(['7d', '30d', '90d', '1y'] as PeriodOption[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1 text-xs md:text-sm rounded-full transition-colors ${
                  period === p
                    ? 'bg-purple-500 text-white shadow-lg shadow-purple-500/40'
                    : 'text-gray-300 hover:bg-white/10'
                }`}
              >
                {p.toUpperCase()}
              </button>
            ))}
          </div>
        </header>

        {error && (
          <div className="bg-red-500/20 border border-red-500/50 rounded-lg p-3 text-sm text-red-100">
            {error}
          </div>
        )}

        {/* Overview cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-accent-200">Total Users</p>
                <p className="text-2xl font-semibold">
                  {dashboard?.overview.total_users ?? '—'}
                </p>
                <p className="text-[11px] text-accent-300">
                  +{dashboard?.overview.new_users ?? 0} new ·{' '}
                  {dashboard?.overview.active_users_in_period ?? 0} active in {periodLabel(period)}
                </p>
                <p className="text-[11px] text-accent-300">
                  Active overall: {dashboard?.overview.active_users ?? 0}
                </p>
              </div>
              <Users className="h-6 w-6 text-blue-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-accent-200">Paid Memorials</p>
                <p className="text-2xl font-semibold">
                  {dashboard?.overview.total_memorials ?? '—'}
                </p>
                <p className="text-[11px] text-accent-300">
                  +{dashboard?.overview.new_memorials ?? 0} in {periodLabel(period)}
                </p>
              </div>
              <BarChart3 className="h-6 w-6 text-orange-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-accent-200">Orders &amp; Vendors</p>
                <p className="text-2xl font-semibold">
                  {dashboard?.overview.total_orders ?? '—'} orders
                </p>
                <p className="text-[11px] text-accent-300">
                  {dashboard?.overview.active_vendors ?? 0} active vendors
                </p>
              </div>
              <ShoppingBag className="h-6 w-6 text-green-300" />
            </div>
          </div>

          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-accent-200">Transactions Volume</p>
                <p className="text-2xl font-semibold">
                  {dashboard
                    ? dashboard.overview.total_transaction_volume.toFixed(2)
                    : '—'}{' '}
                  ETB
                </p>
                <p className="text-[11px] text-accent-300">
                  {dashboard?.overview.total_transactions ?? 0} transactions
                </p>
              </div>
              <TrendingUp className="h-6 w-6 text-yellow-300" />
            </div>
          </div>
        </section>

        {/* Donations KPIs */}
        {dashboard?.donations && (
          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-accent-200">Donations Today</p>
              <p className="text-2xl font-semibold">
                {dashboard.donations.today_amount.toFixed(2)} ETB
              </p>
              <p className="text-[11px] text-accent-300">
                {dashboard.donations.today_count} gifts
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-accent-200">Last 7 days</p>
              <p className="text-2xl font-semibold">
                {dashboard.donations.week_amount.toFixed(2)} ETB
              </p>
              <p className="text-[11px] text-accent-300">
                {dashboard.donations.week_count} gifts
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-accent-200">Last 30 days</p>
              <p className="text-2xl font-semibold">
                {dashboard.donations.month_amount.toFixed(2)} ETB
              </p>
              <p className="text-[11px] text-accent-300">
                {dashboard.donations.month_count} gifts
              </p>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/10">
              <p className="text-xs text-accent-200">All-time Donations</p>
              <p className="text-2xl font-semibold">
                {dashboard.donations.total_amount.toFixed(2)} ETB
              </p>
              <p className="text-[11px] text-accent-300">
                {dashboard.donations.total_count} gifts
              </p>
            </div>
          </section>
        )}

        {/* Trust & Safety metrics */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-red-300" />
              Trust &amp; Safety Overview
            </h2>
            <div className="text-xs text-accent-200 space-y-1">
              <div className="flex justify-between">
                <span>Reports (all time)</span>
                <span>{dashboard?.trust_safety?.reports_total ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Reports in {periodLabel(period)}</span>
                <span>{dashboard?.trust_safety?.reports_in_period ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Open reports</span>
                <span>{dashboard?.trust_safety?.open_reports ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Banned users</span>
                <span>{dashboard?.trust_safety?.banned_users ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Avg resolution time</span>
                <span>
                  {dashboard?.trust_safety?.avg_resolution_hours != null
                    ? `${dashboard.trust_safety.avg_resolution_hours.toFixed(1)} h`
                    : '—'}
                </span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">Reports per Week</h2>
            {renderMiniBarChart(
              (dashboard?.trust_safety?.reports_by_week || []).map((r) => ({
                date: r.week_start,
                count: r.count,
              })),
              'bg-red-400',
            )}
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4 text-xs text-accent-200 space-y-3">
            <h2 className="text-sm font-semibold mb-1">Spam / Abuse Patterns</h2>
            <div>
              <h3 className="text-[11px] font-semibold mb-1">By category</h3>
              {(dashboard?.trust_safety?.reports_by_category || []).length === 0 ? (
                <p className="text-[11px] text-accent-300">No reports for this period.</p>
              ) : (
                <ul className="space-y-1">
                  {dashboard?.trust_safety?.reports_by_category.map((c) => (
                    <li key={c.category} className="flex justify-between">
                      <span>{c.category}</span>
                      <span>{c.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div>
              <h3 className="text-[11px] font-semibold mb-1">By severity</h3>
              {(dashboard?.trust_safety?.reports_by_severity || []).length === 0 ? (
                <p className="text-[11px] text-accent-300">No reports for this period.</p>
              ) : (
                <ul className="space-y-1">
                  {dashboard?.trust_safety?.reports_by_severity.map((s) => (
                    <li key={s.severity} className="flex justify-between">
                      <span>{s.severity}</span>
                      <span>{s.count}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </section>

        {/* Time-series section */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <Gift className="h-4 w-4 text-pink-300" />
                <h2 className="text-sm font-semibold">Daily Gifts</h2>
              </div>
              <span className="text-[11px] text-accent-300">Count / day</span>
            </div>
            {renderMiniBarChart(
              (dashboard?.trends.gifts || []).map((g) => ({ date: g.date, count: g.count })),
              'bg-pink-400'
            )}
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-orange-300" />
                <h2 className="text-sm font-semibold">Daily Memorials</h2>
              </div>
              <span className="text-[11px] text-accent-300">Count / day</span>
            </div>
            {renderMiniBarChart(
              (dashboard?.trends.memorials || []).map((m) => ({ date: m.date, count: m.count })),
              'bg-orange-400'
            )}
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <ShoppingBag className="h-4 w-4 text-green-300" />
                <h2 className="text-sm font-semibold">Daily Orders</h2>
              </div>
              <span className="text-[11px] text-accent-300">Count / day</span>
            </div>
            {renderMiniBarChart(
              (dashboard?.trends.orders || []).map((o) => ({ date: o.date, count: o.count })),
              'bg-green-400'
            )}
          </div>
        </section>

        {/* Most reported content / users */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">Most Reported Memorials</h2>
            {dashboard?.trust_safety?.most_reported_memorials &&
            dashboard.trust_safety.most_reported_memorials.length > 0 ? (
              <ul className="space-y-2 text-xs text-accent-200">
                {dashboard.trust_safety.most_reported_memorials.map((m) => (
                  <li
                    key={m.memorial_id}
                    className="flex justify-between gap-2 border-b border-white/5 pb-1"
                  >
                    <div>
                      <div className="font-medium text-white text-sm">
                        {m.deceased_name || 'Unknown memorial'}
                      </div>
                      {m.memorial_url && (
                        <div className="text-[11px] text-accent-300 break-all">
                          {m.memorial_url}
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-accent-200">
                      <div>{m.report_count} reports</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-accent-300">No reported memorials for this period.</p>
            )}
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">Most Reported Users</h2>
            {dashboard?.trust_safety?.most_reported_users &&
            dashboard.trust_safety.most_reported_users.length > 0 ? (
              <ul className="space-y-2 text-xs text-accent-200">
                {dashboard.trust_safety.most_reported_users.map((u) => (
                  <li key={u.user_id} className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <div>
                      <div className="font-medium text-white text-sm">{u.name || 'Unknown user'}</div>
                      {u.email && (
                        <div className="text-[11px] text-accent-300">{u.email}</div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-accent-200">
                      <div>{u.report_count} reports</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-accent-300">No reported users for this period.</p>
            )}
          </div>
        </section>

        {/* Revenue & activity */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4 space-y-2">
            <h2 className="text-sm font-semibold flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-yellow-300" />
              Revenue Breakdown
            </h2>
            <div className="text-xs text-accent-200 space-y-1">
              <div className="flex justify-between">
                <span>Memorial fees</span>
                <span className="font-mono">
                  {dashboard?.revenue.memorial_fees.toFixed(2) ?? '0.00'} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Gift fees</span>
                <span className="font-mono">
                  {dashboard?.revenue.gift_fees.toFixed(2) ?? '0.00'} ETB
                </span>
              </div>
              <div className="flex justify-between">
                <span>Marketplace commission</span>
                <span className="font-mono">
                  {dashboard?.revenue.marketplace_commission.toFixed(2) ?? '0.00'} ETB
                </span>
              </div>
            </div>
            <div className="mt-3 flex gap-2 text-[11px] flex-wrap">
              <button
                onClick={() => handleExport('transactions')}
                className="flex items-center gap-1 px-3 py-1 rounded bg-purple-600 hover:bg-purple-500 transition-colors"
              >
                <Download className="h-3 w-3" />
                Export transactions CSV
              </button>
              <button
                onClick={() => handleExport('memorials')}
                className="flex items-center gap-1 px-3 py-1 rounded bg-primary-700 hover:bg-primary-600 transition-colors"
              >
                <Download className="h-3 w-3" />
                Export memorials CSV
              </button>
              <button
                onClick={() => handleExport('reports')}
                className="flex items-center gap-1 px-3 py-1 rounded bg-red-700 hover:bg-red-600 transition-colors"
              >
                <Download className="h-3 w-3" />
                Export reports CSV
              </button>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-300" />
              User Activity
            </h2>
            <div className="text-xs text-accent-200 space-y-1">
              <div className="flex justify-between">
                <span>Users who created memorials</span>
                <span>{userAnalytics?.activity.memorial_creators ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Users who sent gifts</span>
                <span>{userAnalytics?.activity.gift_senders ?? 0}</span>
              </div>
              <div className="flex justify-between">
                <span>Users who made orders</span>
                <span>{userAnalytics?.activity.order_makers ?? 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2 flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-purple-300" />
              Registrations Over Time
            </h2>
            {renderMiniBarChart(
              (userAnalytics?.registration_trends || []).map((r) => ({ date: r.date, count: r.registrations })),
              'bg-purple-400'
            )}
          </div>
        </section>

        {/* Top entities */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">Top Memorials</h2>
            {dashboard?.top_memorials && dashboard.top_memorials.length > 0 ? (
              <ul className="space-y-2 text-xs text-accent-200">
                {dashboard.top_memorials.map((m) => (
                  <li key={m.memorial_id} className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <div>
                      <div className="font-medium text-white text-sm">{m.deceased_name}</div>
                      {m.creator && (
                        <div className="text-[11px] text-accent-300">
                          by {m.creator.name} ({m.creator.email})
                        </div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-accent-200">
                      <div>{m.gift_count} gifts</div>
                      <div>{m.total_gifts_value.toFixed(2)} ETB</div>
                      <div>{m.view_count} views</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-accent-300">No memorials for this period.</p>
            )}
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">Top Vendors</h2>
            {dashboard?.top_vendors && dashboard.top_vendors.length > 0 ? (
              <ul className="space-y-2 text-xs text-accent-200">
                {dashboard.top_vendors.map((v) => (
                  <li key={v.vendor_id} className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <div>
                      <div className="font-medium text-white text-sm">{v.business_name}</div>
                      <div className="text-[11px] text-accent-300">
                        {v.service_type} • {v.city}
                      </div>
                    </div>
                    <div className="text-right text-[11px] text-accent-200">
                      <div>{v.total_orders} orders</div>
                      <div>{v.total_revenue.toFixed(2)} ETB</div>
                      <div>⭐ {v.rating.toFixed(2)}</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-accent-300">No vendor data for this period.</p>
            )}
          </div>

          <div className="bg-black/30 border border-white/10 rounded-xl p-4">
            <h2 className="text-sm font-semibold mb-2">Top Donors</h2>
            {dashboard?.top_donors && dashboard.top_donors.length > 0 ? (
              <ul className="space-y-2 text-xs text-accent-200">
                {dashboard.top_donors.map((d) => (
                  <li key={d.user_id} className="flex justify-between gap-2 border-b border-white/5 pb-1">
                    <div>
                      <div className="font-medium text-white text-sm">{d.name}</div>
                      {d.email && (
                        <div className="text-[11px] text-accent-300">{d.email}</div>
                      )}
                    </div>
                    <div className="text-right text-[11px] text-accent-200">
                      <div>{d.gift_count} gifts</div>
                      <div>{d.total_value.toFixed(2)} ETB</div>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-xs text-accent-300">No donor data for this period.</p>
            )}
          </div>
        </section>

        {loading && (
          <div className="text-xs text-accent-300">Refreshing analytics hellip;</div>
        )}
      </div>
    </div>
  );
}
