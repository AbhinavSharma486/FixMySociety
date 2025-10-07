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
  // Removed 'Building' as Building2 is used consistently.
  DoorOpen,
  ClipboardList,
} from 'lucide-react';
// Removed imports: getAllBuildingsAdmin, getAllComplaintsAdmin from service files as data will come from props
import toast from 'react-hot-toast';

const AnalyticsDashboard = ({ analytics }) => {
  // Removed local state for buildings, complaints, loading
  const [timeFilter, setTimeFilter] = useState('month');

  // Removed useEffect and fetchData function, data is now from props

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
    const allBuildings = analytics?.buildingPerformance || []; // Assuming analytics provides this directly
    if (!allBuildings || allBuildings.length === 0) {
      return [];
    }
    return allBuildings.map(building => ({
      name: building.buildingName,
      totalFlats: building.totalFlats,
      occupiedFlats: building.filledFlats, // Assuming `filledFlats` from backend analytics
      occupancyRate: building.occupancyRate, // Assuming `occupancyRate` from backend analytics
      complaints: building.complaints // Assuming `complaints` count from backend analytics
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
      // Use analytics prop directly here
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

  // Removed loading check here, parent handles it.

  const statusStats = getStatusStats();
  const categoryStats = getCategoryStats();
  const buildingStats = getBuildingStats();
  const trendData = getTrendData();

  // Total complaints for percentage calculation
  const totalComplaintsInFilter = getTimeFilteredComplaints().length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Analytics Dashboard</h2>
        <div className="flex gap-3">
          <select
            className="select select-bordered select-sm"
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
            className="btn btn-outline btn-sm gap-2"
          >
            <Download className="w-4 h-4" />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <Building2 className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Buildings</div>
          <div className="stat-value text-primary">{analytics?.overview.totalBuildings || 0}</div>
          <div className="stat-desc">Active properties</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <Home className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Flats</div>
          <div className="stat-value text-info">
            {analytics?.overview.totalFlats || 0}
          </div>
          <div className="stat-desc">Available flats</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-accent">
            <DoorOpen className="w-8 h-8" />
          </div>
          <div className="stat-title">Empty Flats</div>
          <div className="stat-value text-accent">
            {analytics?.overview.emptyFlats || 0}
          </div>
          <div className="stat-desc">Ready for occupancy</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-secondary">
            <UsersRound className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Residents</div>
          <div className="stat-value text-secondary">
            {analytics?.overview.totalUsers || 0}
          </div>
          <div className="stat-desc">Occupied flats</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg col-span-1 md:col-span-2 lg:col-span-2">
          <div className="stat-figure text-warning"><Siren className="w-8 h-8" /></div>
          <div className="stat-title">Pending Complaints</div>
          <div className="stat-value text-warning">{analytics?.overview.pendingComplaints || 0}</div>
          <div className="stat-desc">Awaiting action</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info"><ClipboardList className="w-8 h-8" /></div>
          <div className="stat-title">In Progress Complaints</div>
          <div className="stat-value text-info">{analytics?.overview.inProgressComplaints || 0}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success"><CheckCircle className="w-8 h-8" /></div>
          <div className="stat-title">Resolved Complaints</div>
          <div className="stat-value text-success">{analytics?.overview.resolvedComplaints || 0}</div>
        </div>

      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Distribution */}
        <div className="bg-base-100 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <PieChart className="w-5 h-5" />
            Complaint Status Distribution
          </h3>
          <div className="space-y-3">
            {Object.entries(statusStats).map(([status, count]) => (
              <div key={status} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-4 h-4 rounded-full ${status === 'Pending' ? 'bg-warning' :
                    status === 'In Progress' ? 'bg-info' :
                      'bg-success'
                    }`}></div>
                  <span className="font-medium">{status}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{count}</span>
                  <span className="text-sm text-base-content/60">
                    ({((count / (analytics?.overview?.totalComplaints || 1)) * 100).toFixed(1)}%)
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Category Distribution */}
        <div className="bg-base-100 p-6 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5" />
            Top Complaint Categories
          </h3>
          <div className="space-y-3">
            {Object.entries(categoryStats)
              .sort(([, a], [, b]) => b - a)
              .slice(0, 5)
              .map(([category, count]) => (
                <div key={category} className="flex items-center justify-between">
                  <span className="font-medium truncate">{category}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg font-bold">{count}</span>
                    <div className="w-20 bg-base-200 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full"
                        style={{ width: `${(count / (analytics?.overview?.totalComplaints || 1)) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      </div>

      {/* Building Performance */}
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4">Building Performance Overview</h3>
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr>
                <th>Building Name</th>
                <th>Total Flats</th>
                <th>Occupied</th>
                <th>Occupancy Rate</th>
                <th>Complaints</th>
                <th>Performance</th>
              </tr>
            </thead>
            <tbody>
              {analytics?.buildingPerformance &&
                analytics.buildingPerformance.map((building) => (
                  <tr key={building.buildingName}>
                    <td>{building.buildingName}</td>
                    <td>{building.totalFlats || 0}</td>
                    <td>{building.filledFlats || 0}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        <progress
                          className={`progress ${Math.round(building.occupancyRate) > 80
                            ? "progress-success"
                            : Math.round(building.occupancyRate) > 50
                              ? "progress-warning"
                              : "progress-error"
                            }`}
                          value={Math.round(building.occupancyRate) || 0}
                          max="100"
                        ></progress>
                        <span>{Math.round(building.occupancyRate) || 0}%</span>
                      </div>
                    </td>
                    <td>{building.complaintsCount || 0}</td>
                    <td>
                      <div className="flex items-center gap-2">
                        {building.complaintsCount === 0 ? (
                          <span className="text-success">Excellent</span>
                        ) : building.complaintsCount <= 5 ? (
                          <span className="text-warning">Good</span>
                        ) : (
                          <span className="text-error">Needs Attention</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Trend Analysis */}
      <div className="bg-base-100 p-6 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Complaint Trends ({timeFilter === 'week' ? 'Last Week' :
            timeFilter === 'month' ? 'Last Month' :
              timeFilter === 'quarter' ? 'Last Quarter' : 'Last Year'})
        </h3>
        {trendData.length > 0 ? (
          <div className="space-y-2">
            {trendData.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-base-200 rounded-lg">
                <span className="font-medium">{item.date}</span>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-bold">{item.count}</span>
                  <span className="text-sm text-base-content/60">complaints</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-base-content/50">
            No complaint data for the selected time period
          </div>
        )}
      </div>
    </div>
  );
};

export default AnalyticsDashboard;
