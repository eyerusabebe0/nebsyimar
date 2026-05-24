const { User, Memorial, Vendor, Order, WalletTransaction, GiftTransaction, Report } = require('../models');
const { asyncHandler } = require('../middleware/errorMiddleware');
const { sequelize } = require('../config/database');
const { Op } = require('sequelize');

// @desc    Get comprehensive analytics dashboard
// @route   GET /api/v1/analytics/dashboard
// @access  Private (Admin)
const getDashboardAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  // Calculate date range
  const now = new Date();
  let startDate;
  
  switch (period) {
    case '7d':
      startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      break;
    case '30d':
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      break;
    case '90d':
      startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      break;
    case '1y':
      startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
      break;
    default:
      startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  }

  try {
    // Get overall statistics
    const [
      totalUsers,
      newUsers,
      totalMemorials,
      newMemorials,
      totalTransactionVolume,
      totalGifts,
      totalOrders,
      activeVendors,
      activeUsers,
      activeUsersPeriod,
    ] = await Promise.all([
      // Total users
      User.count(),
      
      // New users in period
      User.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // Total memorials
      Memorial.count({
        where: { paid_status: true, is_active: true }
      }),
      
      // New memorials in period
      Memorial.count({
        where: {
          paid_status: true,
          is_active: true,
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // Total transaction volume
      WalletTransaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_volume'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'total_count']
        ],
        where: {
          status: 'COMPLETED',
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // Total gifts
      GiftTransaction.count({
        where: {
          status: 'COMPLETED',
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // Total orders
      Order.count({
        where: {
          created_at: { [Op.gte]: startDate }
        }
      }),
      
      // Active vendors
      Vendor.count({
        where: {
          verification_status: 'VERIFIED',
          is_active: true
        }
      }),

      // Active users (overall)
      User.count({
        where: { is_active: true },
      }),

      // Active users in the selected period (by last_login)
      User.count({
        where: {
          last_login: { [Op.gte]: startDate },
        },
      }),
    ]);

    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      donationsTodayRow,
      donationsWeekRow,
      donationsMonthRow,
      donationsTotalRow,
    ] = await Promise.all([
      GiftTransaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'count'],
        ],
        where: {
          status: 'COMPLETED',
          created_at: { [Op.gte]: oneDayAgo },
        },
      }),
      GiftTransaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'count'],
        ],
        where: {
          status: 'COMPLETED',
          created_at: { [Op.gte]: sevenDaysAgo },
        },
      }),
      GiftTransaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'count'],
        ],
        where: {
          status: 'COMPLETED',
          created_at: { [Op.gte]: thirtyDaysAgo },
        },
      }),
      GiftTransaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'total'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'count'],
        ],
        where: {
          status: 'COMPLETED',
        },
      }),
    ]);

    const donationsSummary = {
      today_amount: parseFloat(donationsTodayRow?.dataValues?.total || 0),
      today_count: parseInt(donationsTodayRow?.dataValues?.count || 0),
      week_amount: parseFloat(donationsWeekRow?.dataValues?.total || 0),
      week_count: parseInt(donationsWeekRow?.dataValues?.count || 0),
      month_amount: parseFloat(donationsMonthRow?.dataValues?.total || 0),
      month_count: parseInt(donationsMonthRow?.dataValues?.count || 0),
      total_amount: parseFloat(donationsTotalRow?.dataValues?.total || 0),
      total_count: parseInt(donationsTotalRow?.dataValues?.count || 0),
    };

    // Get daily transaction trends
    const dailyTrends = await WalletTransaction.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('SUM', sequelize.col('amount')), 'daily_volume'],
        [sequelize.fn('COUNT', sequelize.col('txn_id')), 'daily_count']
      ],
      where: {
        status: 'COMPLETED',
        created_at: { [Op.gte]: startDate }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // Get daily entity trends (memorials, orders, gifts)
    const [dailyMemorials, dailyOrders, dailyGifts] = await Promise.all([
      Memorial.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('memorial_id')), 'count']
        ],
        where: {
          paid_status: true,
          is_active: true,
          created_at: { [Op.gte]: startDate }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      }),
      Order.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('order_id')), 'count']
        ],
        where: {
          created_at: { [Op.gte]: startDate }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      }),
      GiftTransaction.findAll({
        attributes: [
          [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'count']
        ],
        where: {
          status: 'COMPLETED',
          created_at: { [Op.gte]: startDate }
        },
        group: [sequelize.fn('DATE', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
      })
    ]);

    // Get top memorial creators (raw query to avoid complex subquery issues)
    const topCreators = await sequelize.query(
      `
        SELECT 
          u.user_id,
          u.name,
          u.email,
          COUNT(m.memorial_id) AS memorial_count
        FROM memorials m
        JOIN users u ON u.user_id = m.user_id
        WHERE 
          m.paid_status = TRUE
          AND m.is_active = TRUE
          AND m.created_at >= :startDate
        GROUP BY u.user_id, u.name, u.email
        ORDER BY memorial_count DESC
        LIMIT 10
      `,
      {
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT,
      }
    );

    // Get top memorials, vendors, and donors (outliers)
    const [topMemorials, topVendors, topDonors] = await Promise.all([
      Memorial.findAll({
        where: {
          paid_status: true,
          is_active: true
        },
        attributes: [
          'memorial_id',
          'deceased_name',
          'memorial_url',
          'total_gifts_value',
          'gift_count',
          'view_count'
        ],
        include: [
          {
            model: User,
            as: 'creator',
            attributes: ['user_id', 'name', 'email']
          }
        ],
        order: [
          ['total_gifts_value', 'DESC'],
          ['gift_count', 'DESC'],
          ['view_count', 'DESC']
        ],
        limit: 5
      }),
      Vendor.findAll({
        where: {
          verification_status: 'VERIFIED',
          is_active: true
        },
        attributes: [
          'vendor_id',
          'business_name',
          'service_type',
          'city',
          'rating',
          'total_orders',
          'total_revenue'
        ],
        order: [
          ['total_revenue', 'DESC'],
          ['total_orders', 'DESC']
        ],
        limit: 5
      }),
      GiftTransaction.findAll({
        attributes: [
          'sender_id',
          [sequelize.fn('SUM', sequelize.col('amount')), 'total_value'],
          [sequelize.fn('COUNT', sequelize.col('txn_id')), 'gift_count']
        ],
        where: {
          status: 'COMPLETED',
          created_at: { [Op.gte]: startDate }
        },
        include: [
          {
            model: User,
            as: 'sender',
            attributes: ['user_id', 'name', 'email']
          }
        ],
        group: ['GiftTransaction.sender_id', 'sender.user_id'],
        order: [[sequelize.fn('SUM', sequelize.col('amount')), 'DESC']],
        limit: 5
      })
    ]);

    // Get platform revenue breakdown
    const memorialRevenueWhere = {
      status: 'COMPLETED',
      created_at: { [Op.gte]: startDate }
    };

    // Pick a valid enum value for memorial-related wallet transactions
    const typeValues = WalletTransaction.rawAttributes?.type?.values || [];
    if (typeValues.includes('MEMORIAL_CREATION')) {
      memorialRevenueWhere.type = 'MEMORIAL_CREATION';
    } else if (typeValues.includes('MEMORIAL_PAYMENT')) {
      // Fallback for older schema names, if present
      memorialRevenueWhere.type = 'MEMORIAL_PAYMENT';
    }

    const revenueBreakdown = await Promise.all([
      // Memorial creation fees
      WalletTransaction.findOne({
        attributes: [
          [sequelize.fn('SUM', sequelize.col('amount')), 'memorial_revenue']
        ],
        where: memorialRevenueWhere
      }),
      
      // Gift platform fees
      sequelize.query(`
        SELECT SUM(amount * 0.025) as gift_fees
        FROM gift_transactions 
        WHERE status = 'COMPLETED' 
        AND created_at >= :startDate
      `, {
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT
      }),
      
      // Marketplace commissions
      sequelize.query(`
        SELECT SUM(total_amount * 0.05) as marketplace_commission
        FROM orders 
        WHERE status = 'DELIVERED' 
        AND created_at >= :startDate
      `, {
        replacements: { startDate },
        type: sequelize.QueryTypes.SELECT
      })
    ]);

    // Trust & safety metrics
    const [
      reportsTotal,
      reportsInPeriod,
      openReports,
      reportsByWeekRaw,
      reportsByCategoryRaw,
      reportsBySeverityRaw,
      avgResolutionRow,
      bannedUsers,
      mostReportedMemorialsRaw,
      mostReportedUsersRaw,
    ] = await Promise.all([
      // All-time reports count
      Report.count(),

      // Reports created in this period
      Report.count({
        where: { created_at: { [Op.gte]: startDate } },
      }),

      // Open reports (backlog)
      Report.count({
        where: { status: { [Op.in]: ['OPEN', 'IN_REVIEW'] } },
      }),

      // Reports per week (for the selected period)
      Report.findAll({
        attributes: [
          [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('created_at')), 'week_start'],
          [sequelize.fn('COUNT', sequelize.col('report_id')), 'count'],
        ],
        where: { created_at: { [Op.gte]: startDate } },
        group: [sequelize.fn('DATE_TRUNC', 'week', sequelize.col('created_at'))],
        order: [[sequelize.fn('DATE_TRUNC', 'week', sequelize.col('created_at')), 'ASC']],
      }),

      // Reports by category
      Report.findAll({
        attributes: ['category', [sequelize.fn('COUNT', sequelize.col('report_id')), 'count']],
        where: { created_at: { [Op.gte]: startDate } },
        group: ['category'],
      }),

      // Reports by severity
      Report.findAll({
        attributes: ['severity', [sequelize.fn('COUNT', sequelize.col('report_id')), 'count']],
        where: { created_at: { [Op.gte]: startDate } },
        group: ['severity'],
      }),

      // Average resolution time for resolved/rejected reports in period
      sequelize.query(
        `
          SELECT AVG(EXTRACT(EPOCH FROM (resolved_at - created_at))) AS avg_seconds
          FROM reports
          WHERE resolved_at IS NOT NULL
          AND status IN ('RESOLVED', 'REJECTED')
          AND created_at >= :startDate
        `,
        {
          replacements: { startDate },
          type: sequelize.QueryTypes.SELECT,
        },
      ),

      // Banned users (current)
      User.count({ where: { is_banned: true } }),

      // Most reported memorials in this period
      Report.findAll({
        attributes: [
          'memorial_id',
          [sequelize.fn('COUNT', sequelize.col('report_id')), 'report_count'],
        ],
        where: {
          memorial_id: { [Op.ne]: null },
          created_at: { [Op.gte]: startDate },
        },
        group: ['memorial_id'],
        order: [[sequelize.fn('COUNT', sequelize.col('report_id')), 'DESC']],
        limit: 5,
      }),

      // Most reported users in this period
      Report.findAll({
        attributes: [
          'reported_user_id',
          [sequelize.fn('COUNT', sequelize.col('report_id')), 'report_count'],
        ],
        where: {
          reported_user_id: { [Op.ne]: null },
          created_at: { [Op.gte]: startDate },
        },
        group: ['reported_user_id'],
        order: [[sequelize.fn('COUNT', sequelize.col('report_id')), 'DESC']],
        limit: 5,
      }),
    ]);

    // Enrich most-reported memorials & users with basic details
    const memorialIds = mostReportedMemorialsRaw.map((row) => row.memorial_id);
    const userIds = mostReportedUsersRaw.map((row) => row.reported_user_id);

    const [memorialDetails, userDetails] = await Promise.all([
      memorialIds.length
        ? Memorial.findAll({
            where: { memorial_id: { [Op.in]: memorialIds } },
            attributes: ['memorial_id', 'deceased_name', 'memorial_url'],
          })
        : [],
      userIds.length
        ? User.findAll({
            where: { user_id: { [Op.in]: userIds } },
            attributes: ['user_id', 'name', 'email'],
          })
        : [],
    ]);

    const memorialMap = new Map();
    memorialDetails.forEach((m) => {
      memorialMap.set(m.memorial_id, m);
    });

    const userMap = new Map();
    userDetails.forEach((u) => {
      userMap.set(u.user_id, u);
    });

    const avgSecondsRaw =
      avgResolutionRow &&
      Array.isArray(avgResolutionRow) &&
      avgResolutionRow[0] &&
      (avgResolutionRow[0].avg_seconds ?? avgResolutionRow[0].avg_seconds === 0
        ? avgResolutionRow[0].avg_seconds
        : avgResolutionRow[0].avg_seconds);
    const avgResolutionHours =
      avgSecondsRaw !== null && avgSecondsRaw !== undefined
        ? parseFloat(avgSecondsRaw) / 3600
        : null;

    res.json({
      success: true,
      data: {
        overview: {
          total_users: totalUsers,
          new_users: newUsers,
          active_users: activeUsers,
          active_users_in_period: activeUsersPeriod,
          total_memorials: totalMemorials,
          new_memorials: newMemorials,
          total_transaction_volume: parseFloat(totalTransactionVolume?.dataValues?.total_volume || 0),
          total_transactions: parseInt(totalTransactionVolume?.dataValues?.total_count || 0),
          total_gifts: totalGifts,
          total_orders: totalOrders,
          active_vendors: activeVendors,
        },
        trends: {
          daily_transactions: dailyTrends.map((trend) => ({
            date: trend.dataValues.date,
            volume: parseFloat(trend.dataValues.daily_volume || 0),
            count: parseInt(trend.dataValues.daily_count || 0),
          })),
          memorials: dailyMemorials.map((item) => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count || 0),
          })),
          orders: dailyOrders.map((item) => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count || 0),
          })),
          gifts: dailyGifts.map((item) => ({
            date: item.dataValues.date,
            count: parseInt(item.dataValues.count || 0),
          })),
        },
        top_creators: topCreators.map((creator) => ({
          user_id: creator.user_id,
          name: creator.name,
          email: creator.email,
          memorial_count: parseInt(creator.memorial_count || 0),
        })),
        top_memorials: topMemorials.map((memorial) => ({
          memorial_id: memorial.memorial_id,
          deceased_name: memorial.deceased_name,
          memorial_url: memorial.memorial_url,
          total_gifts_value: parseFloat(memorial.total_gifts_value || 0),
          gift_count: memorial.gift_count,
          view_count: memorial.view_count,
          creator: memorial.creator
            ? {
                user_id: memorial.creator.user_id,
                name: memorial.creator.name,
                email: memorial.creator.email,
              }
            : null,
        })),
        top_vendors: topVendors.map((vendor) => ({
          vendor_id: vendor.vendor_id,
          business_name: vendor.business_name,
          service_type: vendor.service_type,
          city: vendor.city,
          rating: parseFloat(vendor.rating || 0),
          total_orders: vendor.total_orders,
          total_revenue: parseFloat(vendor.total_revenue || 0),
        })),
        top_donors: topDonors.map((donor) => ({
          user_id: donor.sender_id,
          name: donor.sender?.name || 'Unknown',
          email: donor.sender?.email || null,
          total_value: parseFloat(donor.dataValues.total_value || 0),
          gift_count: parseInt(donor.dataValues.gift_count || 0),
        })),
        revenue: {
          memorial_fees: parseFloat(revenueBreakdown[0]?.dataValues?.memorial_revenue || 0),
          gift_fees: parseFloat(revenueBreakdown[1][0]?.gift_fees || 0),
          marketplace_commission: parseFloat(revenueBreakdown[2][0]?.marketplace_commission || 0),
        },
        donations: donationsSummary,
        trust_safety: {
          reports_total: reportsTotal,
          reports_in_period: reportsInPeriod,
          open_reports: openReports,
          banned_users: bannedUsers,
          avg_resolution_hours: avgResolutionHours,
          reports_by_week: reportsByWeekRaw.map((row) => ({
            week_start: row.dataValues.week_start,
            count: parseInt(row.dataValues.count || 0),
          })),
          reports_by_category: reportsByCategoryRaw.map((row) => ({
            category: row.category,
            count: parseInt(row.dataValues.count || 0),
          })),
          reports_by_severity: reportsBySeverityRaw.map((row) => ({
            severity: row.severity,
            count: parseInt(row.dataValues.count || 0),
          })),
          most_reported_memorials: mostReportedMemorialsRaw.map((row) => {
            const details = memorialMap.get(row.memorial_id);
            const reportCount =
              parseInt(row.get('report_count') || row.dataValues.report_count || 0);
            return {
              memorial_id: row.memorial_id,
              deceased_name: details ? details.deceased_name : null,
              memorial_url: details ? details.memorial_url : null,
              report_count: reportCount,
            };
          }),
          most_reported_users: mostReportedUsersRaw.map((row) => {
            const details = userMap.get(row.reported_user_id);
            const reportCount =
              parseInt(row.get('report_count') || row.dataValues.report_count || 0);
            return {
              user_id: row.reported_user_id,
              name: details ? details.name : null,
              email: details ? details.email : null,
              report_count: reportCount,
            };
          }),
        },
        period,
        generated_at: new Date().toISOString(),
      },
    });
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate analytics',
      error: error.message
    });
  }
});

// @desc    Get user analytics
// @route   GET /api/v1/analytics/users
// @access  Private (Admin)
const getUserAnalytics = asyncHandler(async (req, res) => {
  const { period = '30d' } = req.query;
  
  const now = new Date();
  let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    // User registration trends
    const registrationTrends = await User.findAll({
      attributes: [
        [sequelize.fn('DATE', sequelize.col('created_at')), 'date'],
        [sequelize.fn('COUNT', sequelize.col('user_id')), 'registrations']
      ],
      where: {
        created_at: { [Op.gte]: startDate }
      },
      group: [sequelize.fn('DATE', sequelize.col('created_at'))],
      order: [[sequelize.fn('DATE', sequelize.col('created_at')), 'ASC']]
    });

    // User activity analysis & segmentation
    const [
      activityMemorialCreators,
      activityGiftSenders,
      activityOrderMakers,
      roleBreakdown,
      cityBreakdown
    ] = await Promise.all([
      // Users who created memorials
      User.count({
        include: [{
          model: Memorial,
          as: 'memorials',
          where: {
            paid_status: true,
            created_at: { [Op.gte]: startDate }
          }
        }]
      }),
      
      // Users who sent gifts
      User.count({
        include: [{
          model: GiftTransaction,
          as: 'sent_gifts',
          where: {
            status: 'COMPLETED',
            created_at: { [Op.gte]: startDate }
          }
        }]
      }),
      
      // Users who made orders
      User.count({
        include: [{
          model: Order,
          as: 'orders',
          where: {
            created_at: { [Op.gte]: startDate }
          }
        }]
      }),

      // Breakdown by role
      User.findAll({
        attributes: [
          'role',
          [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
        ],
        group: ['role']
      }),

      // Breakdown by city (top 10)
      User.findAll({
        attributes: [
          'city',
          [sequelize.fn('COUNT', sequelize.col('user_id')), 'count']
        ],
        where: {
          city: { [Op.ne]: null }
        },
        group: ['city'],
        order: [[sequelize.fn('COUNT', sequelize.col('user_id')), 'DESC']],
        limit: 10
      })
    ]);

    res.json({
      success: true,
      data: {
        registration_trends: registrationTrends.map(trend => ({
          date: trend.dataValues.date,
          registrations: parseInt(trend.dataValues.registrations)
        })),
        activity: {
          memorial_creators: activityMemorialCreators,
          gift_senders: activityGiftSenders,
          order_makers: activityOrderMakers
        },
        segments: {
          by_role: roleBreakdown.map(row => ({
            role: row.role,
            count: parseInt(row.dataValues.count)
          })),
          by_city: cityBreakdown.map(row => ({
            city: row.city,
            count: parseInt(row.dataValues.count)
          }))
        },
        period,
        generated_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('User analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate user analytics',
      error: error.message
    });
  }
});

// @desc    Export analytics report as CSV
// @route   GET /api/v1/analytics/export
// @access  Private (Admin)
const exportAnalyticsReport = asyncHandler(async (req, res) => {
  const { type = 'transactions', period = '30d', format = 'csv' } = req.query;
  
  const now = new Date();
  let startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

  try {
    let data = [];
    let filename = '';
    let headers = [];

    switch (type) {
      case 'transactions':
        const transactions = await WalletTransaction.findAll({
          include: [{
            model: User,
            as: 'user',
            attributes: ['name', 'email']
          }],
          where: {
            created_at: { [Op.gte]: startDate }
          },
          order: [['created_at', 'DESC']]
        });

        headers = ['Transaction ID', 'User Name', 'User Email', 'Type', 'Amount', 'Status', 'Date'];
        data = transactions.map(txn => [
          txn.txn_id,
          txn.user?.name || 'N/A',
          txn.user?.email || 'N/A',
          txn.type,
          txn.amount,
          txn.status,
          txn.created_at ? txn.created_at.toISOString() : ''
        ]);
        filename = `transactions_${period}_${Date.now()}.csv`;
        break;

      case 'memorials':
        const memorials = await Memorial.findAll({
          include: [{
            model: User,
            as: 'creator',
            attributes: ['name', 'email']
          }],
          where: {
            created_at: { [Op.gte]: startDate }
          },
          order: [['created_at', 'DESC']]
        });

        headers = ['Memorial ID', 'Deceased Name', 'Creator Name', 'Creator Email', 'Visibility', 'Paid Status', 'Date Created'];
        data = memorials.map(memorial => [
          memorial.memorial_id,
          memorial.deceased_name,
          memorial.creator?.name || 'N/A',
          memorial.creator?.email || 'N/A',
          memorial.visibility,
          memorial.paid_status ? 'Paid' : 'Unpaid',
          memorial.created_at ? memorial.created_at.toISOString() : ''
        ]);
        filename = `memorials_${period}_${Date.now()}.csv`;
        break;

      case 'reports': {
        const reports = await Report.findAll({
          where: {
            created_at: { [Op.gte]: startDate },
          },
          order: [['created_at', 'DESC']],
        });

        headers = [
          'Report ID',
          'Target Type',
          'Target ID',
          'Category',
          'Severity',
          'Status',
          'Resolution',
          'Created At',
          'Resolved At',
        ];

        data = reports.map((report) => [
          report.report_id,
          report.target_type,
          report.target_id || '',
          report.category,
          report.severity,
          report.status,
          report.resolution || '',
          report.created_at ? report.created_at.toISOString() : '',
          report.resolved_at ? report.resolved_at.toISOString() : '',
        ]);

        filename = `reports_${period}_${Date.now()}.csv`;
        break;
      }

      default:
        return res.status(400).json({
          success: false,
          message: 'Invalid export type'
        });
    }

    // Generate CSV content
    const csvContent = [
      headers.join(','),
      ...data.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csvContent);

  } catch (error) {
    console.error('Export error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to export report',
      error: error.message
    });
  }
});

module.exports = {
  getDashboardAnalytics,
  getUserAnalytics,
  exportAnalyticsReport
};
