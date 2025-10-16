import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import {
  TrendingUp,
  Building2,
  AlertTriangle,
  CheckCircle,
  BarChart3,
  PieChart,
  Download,
  UsersRound,
  Home,
  Siren,
  DoorOpen,
  ClipboardList,
  Sparkles,
  Activity,
} from 'lucide-react';

// Memoized stat card component for better re-render performance
const StatCard = memo(({ icon: Icon, label, value, subtitle, gradientFrom, gradientTo, iconColor, badgeLabel }) => (
  <div className="glass-card rounded-2xl p-6 gradient-border">
    <div className="flex items-start justify-between mb-4">
      <div className={`p-3 bg-gradient-to-br ${gradientFrom} ${gradientTo} rounded-xl`}>
        <Icon className={`w-8 h-8 ${iconColor} stat-icon`} />
      </div>
      {badgeLabel ? (
        <div className={`px-3 py-1 ${badgeLabel.bg} rounded-full ${badgeLabel.text} text-xs font-bold`}>
          {badgeLabel.label}
        </div>
      ) : (
        <Sparkles className={`w-5 h-5 ${iconColor} opacity-50`} />
      )}
    </div>
    <div className="text-gray-400 text-sm mb-2">{label}</div>
    <div className="text-4xl font-bold text-white mb-2">{value}</div>
    <div className={`${iconColor} text-xs`}>{subtitle}</div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized progress bar component
const ProgressBar = memo(({ percentage, gradient }) => (
  <div className="w-full bg-slate-700/50 rounded-full h-2 progress-bar overflow-hidden">
    <div
      className={`h-2 rounded-full transition-all duration-1000 ${gradient}`}
      style={{ width: `${percentage}%`, willChange: 'width' }}
    ></div>
  </div>
));

ProgressBar.displayName = 'ProgressBar';

// Memoized status row component
const StatusRow = memo(({ status, count, totalComplaints, dotColor, gradient }) => (
  <div className="data-row p-4 rounded-xl bg-slate-800/30">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className={`w-3 h-3 rounded-full ${dotColor}`}></div>
        <span className="font-medium text-gray-300">{status}</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-2xl font-bold text-white">{count}</span>
        <span className="text-sm text-gray-500">
          ({((count / totalComplaints) * 100).toFixed(1)}%)
        </span>
      </div>
    </div>
    <ProgressBar percentage={(count / totalComplaints) * 100} gradient={gradient} />
  </div>
));

StatusRow.displayName = 'StatusRow';

// Memoized category row component
const CategoryRow = memo(({ category, count, index, totalComplaints }) => (
  <div className="data-row p-4 rounded-xl bg-slate-800/30">
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center">
          <span className="text-cyan-400 font-bold text-sm">{index + 1}</span>
        </div>
        <span className="font-medium text-gray-300 truncate">{category}</span>
      </div>
      <span className="text-2xl font-bold text-white">{count}</span>
    </div>
    <ProgressBar
      percentage={(count / totalComplaints) * 100}
      gradient="bg-gradient-to-r from-cyan-500 to-blue-500"
    />
  </div>
));

CategoryRow.displayName = 'CategoryRow';

// Memoized building row component
const BuildingRow = memo(({ building }) => {
  const occupancyRate = Math.round(building.occupancyRate) || 0;
  const complaintsCount = building.complaintsCount || 0;

  const progressGradient = useMemo(() => {
    if (occupancyRate > 80) return 'bg-gradient-to-r from-green-500 to-emerald-500';
    if (occupancyRate > 50) return 'bg-gradient-to-r from-yellow-500 to-orange-500';
    return 'bg-gradient-to-r from-red-500 to-pink-500';
  }, [occupancyRate]);

  const statusBadge = useMemo(() => {
    if (complaintsCount === 0) return { bg: 'bg-green-500/20', text: 'text-green-400', label: 'Excellent' };
    if (complaintsCount <= 5) return { bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'Good' };
    return { bg: 'bg-red-500/20', text: 'text-red-400', label: 'Attention' };
  }, [complaintsCount]);

  return (
    <tr className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
      <td className="py-4 px-4">
        <span className="font-medium text-white">{building.buildingName}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-gray-300">{building.totalFlats || 0}</span>
      </td>
      <td className="py-4 px-4">
        <span className="text-gray-300">{building.filledFlats || 0}</span>
      </td>
      <td className="py-4 px-4">
        <div className="flex items-center gap-3">
          <div className="w-24 bg-slate-700/50 rounded-full h-2 progress-bar overflow-hidden">
            <div
              className={`h-2 rounded-full transition-all duration-1000 ${progressGradient}`}
              style={{ width: `${occupancyRate}%`, willChange: 'width' }}
            ></div>
          </div>
          <span className="text-sm font-medium text-gray-300">{occupancyRate}%</span>
        </div>
      </td>
      <td className="py-4 px-4">
        <span className="text-gray-300">{complaintsCount}</span>
      </td>
      <td className="py-4 px-4">
        <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusBadge.bg} ${statusBadge.text}`}>
          {statusBadge.label}
        </span>
      </td>
    </tr>
  );
});

BuildingRow.displayName = 'BuildingRow';

// Memoized trend card component
const TrendCard = memo(({ date, count }) => (
  <div className="data-row p-4 rounded-xl bg-slate-800/30 border border-slate-700/50">
    <div className="flex items-center justify-between">
      <div>
        <div className="text-sm text-gray-400 mb-1">{date}</div>
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-bold text-white">{count}</span>
          <span className="text-xs text-gray-500">complaints</span>
        </div>
      </div>
      <Activity className="w-8 h-8 text-green-400 opacity-50" />
    </div>
  </div>
));

TrendCard.displayName = 'TrendCard';

const AnalyticsDashboard = ({ analytics }) => {
  const [timeFilter, setTimeFilter] = useState('month');
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Use requestAnimationFrame for smooth initial render
    requestAnimationFrame(() => {
      setIsVisible(true);
    });
  }, []);

  // Memoize filtered complaints to avoid recalculation on every render
  const filteredComplaints = useMemo(() => {
    const allComplaints = analytics?.complaints || [];
    const now = new Date();
    let filterDate;

    switch (timeFilter) {
      case 'week':
        filterDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        filterDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        break;
      case 'quarter':
        filterDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
        break;
      case 'year':
        filterDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
        break;
      default:
        filterDate = new Date(0);
    }

    return allComplaints.filter(complaint => new Date(complaint.createdAt) >= filterDate);
  }, [analytics?.complaints, timeFilter]);

  // Memoize category statistics
  const categoryStats = useMemo(() => {
    const allComplaints = analytics?.complaints || [];
    const categoryCounts = {};
    allComplaints.forEach(complaint => {
      categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
    });
    return categoryCounts;
  }, [analytics?.complaints]);

  // Memoize status statistics
  const statusStats = useMemo(() => {
    const allComplaints = analytics?.complaints || [];
    const statusCounts = {
      Pending: 0,
      'In Progress': 0,
      Resolved: 0
    };

    allComplaints.forEach(complaint => {
      if (statusCounts[complaint.status] !== undefined) {
        statusCounts[complaint.status]++;
      }
    });

    return statusCounts;
  }, [analytics?.complaints]);

  // Memoize building stats
  const buildingStats = useMemo(() => {
    const allBuildings = analytics?.buildingPerformance || [];
    if (!allBuildings || allBuildings.length === 0) {
      return [];
    }
    return allBuildings;
  }, [analytics?.buildingPerformance]);

  // Memoize trend data
  const trendData = useMemo(() => {
    const dailyCounts = {};

    filteredComplaints.forEach(complaint => {
      const date = new Date(complaint.createdAt).toLocaleDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts)
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [filteredComplaints]);

  // Memoize top categories
  const topCategories = useMemo(() => {
    return Object.entries(categoryStats)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5);
  }, [categoryStats]);

  // Memoized export function
  const exportReport = useCallback(() => {
    const data = {
      buildings: analytics?.overview?.totalBuildings,
      totalComplaints: analytics?.overview?.totalComplaints,
      statusBreakdown: statusStats,
      categoryBreakdown: categoryStats,
      buildingDetails: buildingStats,
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `society-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [analytics?.overview, statusStats, categoryStats, buildingStats]);

  const totalComplaints = analytics?.overview?.totalComplaints || 1;
  const timeFilterLabel = useMemo(() => {
    switch (timeFilter) {
      case 'week': return 'Last Week';
      case 'month': return 'Last Month';
      case 'quarter': return 'Last Quarter';
      case 'year': return 'Last Year';
      default: return 'All Time';
    }
  }, [timeFilter]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-4 md:p-6 lg:p-8">
      <style>{`
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
        }

        @keyframes shimmer {
          0% {
            background-position: -1000px 0;
          }
          100% {
            background-position: 1000px 0;
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-fade-in-up {
          animation: fadeInUp 0.6s ease-out forwards;
        }

        .animate-pulse-slow {
          animation: pulse 3s ease-in-out infinite;
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }

        .glass-card {
          background: rgba(15, 23, 42, 0.6);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .glass-card:hover {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.5);
          transform: translateY(-4px) scale(1.02);
          box-shadow: 0 20px 60px rgba(59, 130, 246, 0.3);
        }

        .neon-text {
          text-shadow: 0 0 10px rgba(59, 130, 246, 0.8),
                       0 0 20px rgba(59, 130, 246, 0.6),
                       0 0 30px rgba(59, 130, 246, 0.4);
        }

        .gradient-border {
          position: relative;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          border: 2px solid transparent;
          background-clip: padding-box;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          border-radius: inherit;
          padding: 2px;
          background: linear-gradient(135deg, #3b82f6, #9333ea, #3b82f6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          animation: shimmer 3s linear infinite;
          background-size: 200% 100%;
        }

        .stat-icon {
          transition: transform 0.3s ease;
          will-change: transform;
        }

        .glass-card:hover .stat-icon {
          transform: scale(1.1) rotate(5deg);
        }

        .progress-bar {
          position: relative;
          overflow: hidden;
        }

        .progress-bar::after {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
          animation: shimmer 2s infinite;
        }

        .cyber-button {
          position: relative;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2));
          border: 1px solid rgba(59, 130, 246, 0.5);
          transition: all 0.3s ease;
          will-change: transform;
        }

        .cyber-button:hover {
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.4), rgba(147, 51, 234, 0.4));
          box-shadow: 0 0 30px rgba(59, 130, 246, 0.5);
          transform: translateY(-2px);
        }

        .cyber-select {
          background: rgba(15, 23, 42, 0.8);
          border: 1px solid rgba(59, 130, 246, 0.3);
          transition: all 0.3s ease;
        }

        .cyber-select:focus {
          border-color: rgba(59, 130, 246, 0.8);
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          outline: none;
        }

        .data-row {
          transition: all 0.3s ease;
          will-change: transform;
        }

        .data-row:hover {
          background: rgba(59, 130, 246, 0.1);
          transform: translateX(4px);
        }
      `}</style>

      <div className={`max-w-7xl mx-auto space-y-8 ${isVisible ? 'animate-fade-in-up' : 'opacity-0'}`}>
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-blue-500 blur-xl opacity-50 animate-pulse-slow"></div>
              <Activity className="w-12 h-12 text-blue-400 relative animate-float" />
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white neon-text">
                Analytics Command Center
              </h2>
              <p className="text-blue-300 text-sm md:text-base mt-1">Real-time Performance Insights</p>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <select
              className="cyber-select px-4 py-2 rounded-lg text-white font-medium cursor-pointer"
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
            >
              <option value="week">Last Week</option>
              <option value="month">Last Month</option>
              <option value="quarter">Last Quarter</option>
              <option value="year">Last Year</option>
            </select>
            <button
              onClick={exportReport}
              className="cyber-button px-4 py-2 rounded-lg text-white font-medium flex items-center gap-2"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">Export Report</span>
            </button>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          <StatCard
            icon={Building2}
            label="Total Buildings"
            value={analytics?.overview?.totalBuildings || 0}
            subtitle="Active properties"
            gradientFrom="from-blue-500/20"
            gradientTo="to-cyan-500/20"
            iconColor="text-blue-400"
          />
          <StatCard
            icon={Home}
            label="Total Flats"
            value={analytics?.overview?.totalFlats || 0}
            subtitle="Available units"
            gradientFrom="from-cyan-500/20"
            gradientTo="to-teal-500/20"
            iconColor="text-cyan-400"
          />
          <StatCard
            icon={DoorOpen}
            label="Empty Flats"
            value={analytics?.overview?.emptyFlats || 0}
            subtitle="Ready for occupancy"
            gradientFrom="from-purple-500/20"
            gradientTo="to-pink-500/20"
            iconColor="text-purple-400"
          />
          <StatCard
            icon={UsersRound}
            label="Total Residents"
            value={analytics?.overview?.totalUsers || 0}
            subtitle="Occupied flats"
            gradientFrom="from-pink-500/20"
            gradientTo="to-rose-500/20"
            iconColor="text-pink-400"
          />
        </div>

        {/* Complaint Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <StatCard
            icon={Siren}
            label="Pending Complaints"
            value={analytics?.overview?.pendingComplaints || 0}
            subtitle="Awaiting action"
            gradientFrom="from-yellow-500/20"
            gradientTo="to-orange-500/20"
            iconColor="text-yellow-400"
            badgeLabel={{ bg: 'bg-yellow-500/20', text: 'text-yellow-400', label: 'ALERT' }}
          />
          <StatCard
            icon={ClipboardList}
            label="In Progress"
            value={analytics?.overview?.inProgressComplaints || 0}
            subtitle="Being processed"
            gradientFrom="from-blue-500/20"
            gradientTo="to-indigo-500/20"
            iconColor="text-blue-400"
            badgeLabel={{ bg: 'bg-blue-500/20', text: 'text-blue-400', label: 'ACTIVE' }}
          />
          <StatCard
            icon={CheckCircle}
            label="Resolved"
            value={analytics?.overview?.resolvedComplaints || 0}
            subtitle="Successfully closed"
            gradientFrom="from-green-500/20"
            gradientTo="to-emerald-500/20"
            iconColor="text-green-400"
            badgeLabel={{ bg: 'bg-green-500/20', text: 'text-green-400', label: 'DONE' }}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Status Distribution */}
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-lg">
                <PieChart className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Status Distribution</h3>
            </div>
            <div className="space-y-4">
              <StatusRow
                status="Pending"
                count={statusStats.Pending}
                totalComplaints={totalComplaints}
                dotColor="bg-yellow-400 shadow-lg shadow-yellow-400/50"
                gradient="bg-gradient-to-r from-yellow-500 to-orange-500"
              />
              <StatusRow
                status="In Progress"
                count={statusStats['In Progress']}
                totalComplaints={totalComplaints}
                dotColor="bg-blue-400 shadow-lg shadow-blue-400/50"
                gradient="bg-gradient-to-r from-blue-500 to-indigo-500"
              />
              <StatusRow
                status="Resolved"
                count={statusStats.Resolved}
                totalComplaints={totalComplaints}
                dotColor="bg-green-400 shadow-lg shadow-green-400/50"
                gradient="bg-gradient-to-r from-green-500 to-emerald-500"
              />
            </div>
          </div>

          {/* Category Distribution */}
          <div className="glass-card rounded-2xl p-6 gradient-border">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-lg">
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-xl font-bold text-white">Top Categories</h3>
            </div>
            <div className="space-y-4">
              {topCategories.map(([category, count], index) => (
                <CategoryRow
                  key={category}
                  category={category}
                  count={count}
                  index={index}
                  totalComplaints={totalComplaints}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Building Performance */}
        <div className="glass-card rounded-2xl p-6 gradient-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-400" />
            </div>
            <h3 className="text-xl font-bold text-white">Building Performance Matrix</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-700">
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Building</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Flats</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Occupied</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Occupancy</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Complaints</th>
                  <th className="text-left py-4 px-4 text-gray-400 font-semibold text-sm">Status</th>
                </tr>
              </thead>
              <tbody>
                {buildingStats.map((building) => (
                  <BuildingRow key={building.buildingName} building={building} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Trend Analysis */}
        <div className="glass-card rounded-2xl p-6 gradient-border">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-gradient-to-br from-green-500/20 to-teal-500/20 rounded-lg">
              <TrendingUp className="w-6 h-6 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white">
              Complaint Trends - {timeFilterLabel}
            </h3>
          </div>
          {trendData.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {trendData.map((item, index) => (
                <TrendCard key={index} date={item.date} count={item.count} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-block p-4 bg-slate-800/50 rounded-full mb-4">
                <AlertTriangle className="w-12 h-12 text-gray-500" />
              </div>
              <p className="text-gray-400 text-lg">No complaint data for the selected time period</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AnalyticsDashboard;