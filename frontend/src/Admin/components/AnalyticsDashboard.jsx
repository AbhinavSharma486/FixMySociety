import React, { useState, useEffect } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Users,
  Building2,
  AlertTriangle,
  CheckCircle,
  Calendar,
  BarChart3,
  PieChart,
  Download,
  UsersRound,
  Home,
  Siren,
  CheckCheck,
  DoorOpen,
  ClipboardList,
} from 'lucide-react';
import toast from 'react-hot-toast';

const AnalyticsDashboard = ({ analytics }) => {
  const [timeFilter, setTimeFilter] = useState('month');

  const getTimeFilteredComplaints = () => {
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
  };

  const getCategoryStats = () => {
    const allComplaints = analytics?.complaints || [];
    const categoryCounts = {};
    allComplaints.forEach(complaint => {
      categoryCounts[complaint.category] = (categoryCounts[complaint.category] || 0) + 1;
    });
    return categoryCounts;
  };

  const getStatusStats = () => {
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
  };

  const getBuildingStats = () => {
    const allBuildings = analytics?.buildingPerformance || [];
    if (!allBuildings || allBuildings.length === 0) {
      return [];
    }
    return allBuildings.map(building => ({
      name: building.buildingName,
      totalFlats: building.totalFlats,
      occupiedFlats: building.filledFlats,
      occupancyRate: building.occupancyRate,
      complaints: building.complaints
    }));
  };

  const getTrendData = () => {
    const filteredComplaints = getTimeFilteredComplaints();
    const dailyCounts = {};

    filteredComplaints.forEach(complaint => {
      const date = new Date(complaint.createdAt).toLocaleDateString();
      dailyCounts[date] = (dailyCounts[date] || 0) + 1;
    });

    return Object.entries(dailyCounts).map(([date, count]) => ({
      date,
      count
    })).sort((a, b) => new Date(a.date) - new Date(b.date));
  };

  const exportReport = () => {
    const data = {
      buildings: analytics?.overview?.totalBuildings,
      totalComplaints: analytics?.overview?.totalComplaints,
      statusBreakdown: getStatusStats(),
      categoryBreakdown: getCategoryStats(),
      buildingDetails: getBuildingStats(),
      generatedAt: new Date().toISOString()
    };

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `society-analytics-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);

    toast.success('Analytics report downloaded successfully');
  };

  const statusStats = getStatusStats();
  const categoryStats = getCategoryStats();
  const buildingStats = getBuildingStats();
  const trendData = getTrendData();

  const totalComplaintsInFilter = getTimeFilteredComplaints().length;

  const StatCard = ({ icon: Icon, title, value, subtitle, gradient, delay = 0 }) => (
    <div
      className="group relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl transition-all duration-500 hover:scale-[1.02]"
      style={{
        animation: `fadeInUp 0.8s ease-out ${delay}s both`,
        background: 'rgba(255, 255, 255, 0.03)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        willChange: 'transform'
      }}
    >
      <div
        className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500"
        style={{
          background: `linear-gradient(135deg, ${gradient[0]}, ${gradient[1]})`,
          filter: 'blur(40px)',
          transform: 'scale(0.8) translateZ(0)',
          willChange: 'opacity'
        }}
      />

      <div className="relative p-3 xs:p-4 sm:p-5 md:p-6 backdrop-blur-xl">
        <div className="flex items-start justify-between mb-2 xs:mb-3 sm:mb-4">
          <div
            className="p-1.5 xs:p-2 sm:p-2.5 md:p-3 rounded-lg xs:rounded-xl sm:rounded-2xl relative overflow-hidden"
            style={{
              background: `linear-gradient(135deg, ${gradient[0]}22, ${gradient[1]}22)`,
              border: `1px solid ${gradient[0]}44`
            }}
          >
            <Icon className="w-4 h-4 xs:w-5 xs:h-5 sm:w-5 sm:h-5 md:w-6 md:h-6" style={{ color: gradient[0] }} />
          </div>
          <div className="text-right">
            <div className="text-xl xs:text-2xl sm:text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
              {value}
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-xs xs:text-xs sm:text-sm font-medium text-gray-400 mb-0.5 xs:mb-1">{title}</h3>
          <p className="text-[10px] xs:text-xs text-gray-500 break-words line-clamp-2">{subtitle}</p>
        </div>

        <div
          className="absolute bottom-0 left-0 h-0.5 xs:h-1 w-0 group-hover:w-full transition-all duration-500"
          style={{
            background: `linear-gradient(90deg, ${gradient[0]}, ${gradient[1]})`,
            willChange: 'width'
          }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ willChange: 'opacity' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', willChange: 'opacity' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', willChange: 'opacity' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
        {/* Header Section */}
        <div
          className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
          style={{
            animation: 'fadeInUp 0.8s ease-out 0.1s both',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="p-3 xs:p-4 sm:p-5 md:p-6">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-3 xs:gap-4">
              <div>
                <h2 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-bold mb-1 xs:mb-2">
                  <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                    Analytics Command Center
                  </span>
                </h2>
                <p className="text-gray-400 text-xs xs:text-sm sm:text-base">Real-time insights and performance metrics</p>
              </div>
              <div className="flex flex-wrap gap-2 xs:gap-3 w-full lg:w-auto">
                <div className="relative flex-1 lg:flex-initial min-w-[140px]">
                  <select
                    className="w-full px-3 py-2 xs:px-4 xs:py-2.5 sm:px-6 sm:py-3 rounded-lg xs:rounded-xl text-xs xs:text-sm sm:text-base bg-white/5 border border-white/10 text-white font-semibold backdrop-blur-xl focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all cursor-pointer appearance-none pr-8 xs:pr-10"
                    value={timeFilter}
                    onChange={(e) => setTimeFilter(e.target.value)}
                  >
                    <option value="week" className="bg-gray-900">Last Week</option>
                    <option value="month" className="bg-gray-900">Last Month</option>
                    <option value="quarter" className="bg-gray-900">Last Quarter</option>
                    <option value="year" className="bg-gray-900">Last Year</option>
                  </select>
                  <Calendar className="absolute right-2 xs:right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 text-blue-400 pointer-events-none" />
                </div>
                <button
                  onClick={exportReport}
                  className="group relative flex-1 lg:flex-initial px-3 py-2 xs:px-4 xs:py-2.5 sm:px-6 sm:py-3 rounded-lg xs:rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] min-w-[120px]"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
                    willChange: 'transform'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative flex items-center justify-center gap-1.5 xs:gap-2">
                    <Download className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                    <span className="font-semibold text-xs xs:text-sm sm:text-base">Export</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Key Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
          <StatCard
            icon={Building2}
            title="Total Buildings"
            value={analytics?.overview.totalBuildings || 0}
            subtitle="Active properties"
            gradient={['#A855F7', '#9333EA']}
            delay={0.2}
          />
          <StatCard
            icon={Home}
            title="Total Flats"
            value={analytics?.overview.totalFlats || 0}
            subtitle="Available flats"
            gradient={['#3B82F6', '#1D4ED8']}
            delay={0.3}
          />
          <StatCard
            icon={DoorOpen}
            title="Empty Flats"
            value={analytics?.overview.emptyFlats || 0}
            subtitle="Ready for occupancy"
            gradient={['#06B6D4', '#0891B2']}
            delay={0.4}
          />
          <StatCard
            icon={UsersRound}
            title="Total Residents"
            value={analytics?.overview.totalUsers || 0}
            subtitle="Occupied flats"
            gradient={['#EC4899', '#DB2777']}
            delay={0.5}
          />
        </div>

        {/* Complaint Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
          <StatCard
            icon={Siren}
            title="Pending Complaints"
            value={analytics?.overview.pendingComplaints || 0}
            subtitle="Awaiting action"
            gradient={['#F59E0B', '#D97706']}
            delay={0.6}
          />
          <StatCard
            icon={ClipboardList}
            title="In Progress"
            value={analytics?.overview.inProgressComplaints || 0}
            subtitle="Being addressed"
            gradient={['#3B82F6', '#2563EB']}
            delay={0.7}
          />
          <StatCard
            icon={CheckCircle}
            title="Resolved"
            value={analytics?.overview.resolvedComplaints || 0}
            subtitle="Successfully closed"
            gradient={['#10B981', '#059669']}
            delay={0.8}
          />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 xs:gap-5 sm:gap-6">
          {/* Status Distribution */}
          <div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
            style={{
              animation: 'fadeInUp 0.8s ease-out 0.9s both',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="p-3 xs:p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
                <div className="p-1.5 xs:p-2 rounded-lg xs:rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30">
                  <PieChart className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-purple-400" />
                </div>
                <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Status Distribution
                </h3>
              </div>
              <div className="space-y-3 xs:space-y-4">
                {Object.entries(statusStats).map(([status, count], idx) => (
                  <div key={status} className="p-2.5 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2 xs:gap-3">
                        <div className={`w-2 h-2 xs:w-3 xs:h-3 rounded-full ${status === 'Pending' ? 'bg-yellow-400 shadow-lg shadow-yellow-400/50' :
                          status === 'In Progress' ? 'bg-blue-400 shadow-lg shadow-blue-400/50' :
                            'bg-green-400 shadow-lg shadow-green-400/50'
                          }`}></div>
                        <span className="font-semibold text-white text-xs xs:text-sm sm:text-base">{status}</span>
                      </div>
                      <div className="flex items-center gap-2 xs:gap-3">
                        <span className="text-lg xs:text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-400">
                          {count}
                        </span>
                        <span className="text-[10px] xs:text-xs sm:text-sm text-gray-500 font-medium">
                          {((count / (analytics?.overview?.totalComplaints || 1)) * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                    <div className="w-full h-1.5 xs:h-2 bg-gray-800 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-1000 ease-out ${status === 'Pending' ? 'bg-gradient-to-r from-yellow-400 to-orange-500' :
                          status === 'In Progress' ? 'bg-gradient-to-r from-blue-400 to-indigo-500' :
                            'bg-gradient-to-r from-green-400 to-emerald-500'
                          }`}
                        style={{
                          width: `${(count / (analytics?.overview?.totalComplaints || 1)) * 100}%`,
                          transitionDelay: `${idx * 0.1}s`
                        }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Category Distribution */}
          <div
            className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
            style={{
              animation: 'fadeInUp 0.8s ease-out 1s both',
              background: 'rgba(255, 255, 255, 0.03)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}
          >
            <div className="p-3 xs:p-4 sm:p-6 md:p-8">
              <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
                <div className="p-1.5 xs:p-2 rounded-lg xs:rounded-xl bg-gradient-to-br from-blue-500/20 to-blue-700/20 border border-blue-500/30">
                  <BarChart3 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-blue-400" />
                </div>
                <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
                  Top Categories
                </h3>
              </div>
              <div className="space-y-3 xs:space-y-4">
                {Object.entries(categoryStats)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([category, count], idx) => (
                    <div key={category} className="p-2.5 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between mb-2 xs:mb-3">
                        <span className="font-semibold text-white truncate flex-1 text-xs xs:text-sm sm:text-base">{category}</span>
                        <span className="text-lg xs:text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400 ml-2">
                          {count}
                        </span>
                      </div>
                      <div className="w-full h-1.5 xs:h-2 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 transition-all duration-1000 ease-out"
                          style={{
                            width: `${(count / (analytics?.overview?.totalComplaints || 1)) * 100}%`,
                            transitionDelay: `${idx * 0.1}s`
                          }}
                        ></div>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>

        {/* Building Performance */}
        <div
          className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
          style={{
            animation: 'fadeInUp 0.8s ease-out 1.1s both',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="p-3 xs:p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
              <div className="p-1.5 xs:p-2 rounded-lg xs:rounded-xl bg-gradient-to-br from-purple-500/20 to-purple-700/20 border border-purple-500/30">
                <Building2 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Building Performance
              </h3>
            </div>
            <div className="overflow-x-auto -mx-3 xs:-mx-4 sm:mx-0">
              <div className="inline-block min-w-full align-middle px-3 xs:px-4 sm:px-0">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-white/10">
                      <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Building</th>
                      <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Flats</th>
                      <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Occupied</th>
                      <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Rate</th>
                      <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Issues</th>
                      <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics?.buildingPerformance &&
                      analytics.buildingPerformance.map((building, idx) => (
                        <tr key={building.buildingName} className="border-b border-white/5 hover:bg-white/5 transition-colors" style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both` }}>
                          <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 font-medium text-white text-[11px] xs:text-xs sm:text-sm md:text-base break-words">{building.buildingName}</td>
                          <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-gray-300 text-[11px] xs:text-xs sm:text-sm md:text-base">{building.totalFlats || 0}</td>
                          <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-gray-300 text-[11px] xs:text-xs sm:text-sm md:text-base">{building.filledFlats || 0}</td>
                          <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
                            <div className="flex items-center gap-2 xs:gap-3">
                              <div className="flex-1 h-1.5 xs:h-2 bg-gray-800 rounded-full overflow-hidden min-w-[60px] xs:min-w-[80px] sm:min-w-[100px]">
                                <div
                                  className={`h-full transition-all duration-1000 ease-out ${Math.round(building.occupancyRate) > 80
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600"
                                    : Math.round(building.occupancyRate) > 50
                                      ? "bg-gradient-to-r from-yellow-500 to-orange-600"
                                      : "bg-gradient-to-r from-red-500 to-pink-600"
                                    }`}
                                  style={{
                                    width: `${Math.round(building.occupancyRate) || 0}%`,
                                    transitionDelay: `${idx * 0.1}s`
                                  }}
                                ></div>
                              </div>
                              <span className="text-[10px] xs:text-xs sm:text-sm font-bold text-gray-300 min-w-[30px] xs:min-w-[35px] sm:min-w-[45px]">
                                {Math.round(building.occupancyRate) || 0}%
                              </span>
                            </div>
                          </td>
                          <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
                            <span className="inline-flex items-center justify-center w-6 h-6 xs:w-7 xs:h-7 sm:w-8 sm:h-8 rounded-lg bg-gray-800 text-gray-200 font-bold text-[10px] xs:text-xs sm:text-sm">
                              {building.complaintsCount || 0}
                            </span>
                          </td>
                          <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
                            <span className={`inline-flex px-2 py-0.5 xs:px-2.5 xs:py-1 sm:px-3 rounded-full text-[9px] xs:text-[10px] sm:text-xs font-bold ${building.complaintsCount === 0
                              ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                              : building.complaintsCount <= 5
                                ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                                : 'bg-red-500/20 text-red-400 border border-red-500/30'
                              }`}>
                              {building.complaintsCount === 0 ? 'Excellent' : building.complaintsCount <= 5 ? 'Good' : 'Needs Attention'}
                            </span>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        {/* Trend Analysis */}
        <div
          className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
          style={{
            animation: 'fadeInUp 0.8s ease-out 1.2s both',
            background: 'rgba(255, 255, 255, 0.03)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.08)'
          }}
        >
          <div className="p-3 xs:p-4 sm:p-6 md:p-8">
            <div className="flex items-center gap-2 xs:gap-3 mb-4 xs:mb-5 sm:mb-6">
              <div className="p-1.5 xs:p-2 rounded-lg xs:rounded-xl bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                <TrendingUp className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-purple-400" />
              </div>
              <h3 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
                Complaint Trends
                <span className="text-xs xs:text-sm font-normal text-gray-400 ml-2">
                  ({timeFilter === 'week' ? 'Last Week' :
                    timeFilter === 'month' ? 'Last Month' :
                      timeFilter === 'quarter' ? 'Last Quarter' : 'Last Year'})
                </span>
              </h3>
            </div>

            {trendData.length > 0 ? (
              <div className="space-y-2 xs:space-y-3">
                {trendData.map((item, index) => {
                  const maxCount = Math.max(...trendData.map(d => d.count));
                  const percentage = (item.count / maxCount) * 100;

                  return (
                    <div key={index} className="p-2.5 xs:p-3 sm:p-4 rounded-lg xs:rounded-xl bg-white/5 border border-white/10 hover:border-purple-500/30 hover:bg-white/10 transition-all">
                      <div className="flex items-center justify-between mb-2 xs:mb-3">
                        <span className="font-semibold text-gray-300 text-[10px] xs:text-xs sm:text-sm">{item.date}</span>
                        <div className="flex items-center gap-2 xs:gap-3">
                          <span className="text-lg xs:text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                            {item.count}
                          </span>
                          <span className="text-[9px] xs:text-[10px] sm:text-xs text-gray-500 font-medium uppercase tracking-wider">
                            complaints
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full h-2 xs:h-2.5 sm:h-3 bg-gray-800 rounded-full overflow-hidden">
                        <div
                          className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 transition-all duration-1000 ease-out"
                          style={{
                            width: `${percentage}%`,
                            transitionDelay: `${index * 0.05}s`
                          }}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" style={{
                            backgroundSize: '200% 100%',
                            animation: 'shimmer 2s infinite'
                          }}></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 xs:py-16 px-4">
                <div className="p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl bg-white/5 border border-white/10 mb-3 xs:mb-4">
                  <BarChart3 className="w-12 h-12 xs:w-14 xs:h-14 sm:w-16 sm:h-16 text-gray-600" />
                </div>
                <p className="text-gray-500 text-center text-sm xs:text-base sm:text-lg font-medium">
                  No complaint data available
                </p>
                <p className="text-gray-600 text-center text-xs xs:text-sm mt-1 xs:mt-2">
                  for the selected time period
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Footer Accent */}
        <div className="text-center py-6 xs:py-8" style={{ animation: 'fadeIn 0.8s ease-out 1.3s both' }}>
          <div className="inline-flex items-center gap-2 px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 rounded-full bg-gradient-to-r from-purple-900/30 to-blue-900/30 border border-purple-500/20">
            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-purple-400 animate-pulse"></div>
            <span className="text-[10px] xs:text-xs sm:text-sm text-gray-400 font-medium">Live Analytics Dashboard</span>
            <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 rounded-full bg-blue-400 animate-pulse" style={{ animationDelay: '0.5s' }}></div>
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px) translateZ(0);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateZ(0);
          }
        }

        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (min-width: 320px) {
          .xs\\:text-xs { font-size: 0.75rem; line-height: 1rem; }
          .xs\\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .xs\\:text-base { font-size: 1rem; line-height: 1.5rem; }
          .xs\\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .xs\\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .xs\\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .xs\\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
};

export default AnalyticsDashboard;