import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Eye, AlertTriangle, RefreshCw, Users, Trash2, ChevronDown } from 'lucide-react';
import toast from 'react-hot-toast';

import ConfirmationModal from '../components/ConfirmationModal';
import { getAllComplaintsAdmin, getBuildingByIdAdmin, updateComplaintStatusAdmin, deleteComplaintAdmin } from '../../lib/adminService';

// Memoized stat card component
const StatCard = memo(({ stat, idx }) => (
  <div
    className="relative group bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl p-4 sm:p-6 hover:bg-white/10 transition-all duration-300 overflow-hidden will-change-transform"
    style={{ animationDelay: `${idx * 100}ms` }}
  >
    <div className={`absolute inset-0 bg-gradient-to-br ${stat.color} opacity-0 group-hover:opacity-10 transition-opacity duration-300 pointer-events-none`}></div>
    <div className="relative">
      <div className="flex items-center justify-between mb-2">
        <span className="text-gray-400 text-xs sm:text-sm font-medium">{stat.label}</span>
        <span className="text-xl sm:text-2xl flex-shrink-0">{stat.icon}</span>
      </div>
      <p className="text-2xl sm:text-3xl font-bold text-white">{stat.count}</p>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized table row component
const ComplaintTableRow = memo(({ complaint, idx, onStatusChange, onView, onDelete }) => (
  <tr
    key={complaint._id}
    className="border-b border-white/5 hover:bg-white/5 transition-colors duration-300 group will-change-auto"
    style={{ animationDelay: `${idx * 50}ms` }}
  >
    <td className="p-3 xl:p-4">
      <div className="max-w-[200px] xl:max-w-xs">
        <div className="font-semibold text-white text-sm xl:text-base mb-1 line-clamp-1">{complaint.title}</div>
        <div className="text-xs xl:text-sm text-gray-400 line-clamp-2">{complaint.description}</div>
      </div>
    </td>
    <td className="p-3 xl:p-4">
      <div className="flex items-center gap-2 xl:gap-3">
        <div className="w-8 h-8 xl:w-10 xl:h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs xl:text-sm flex-shrink-0">
          {complaint.user?.fullName?.[0] || 'U'}
        </div>
        <div className="min-w-0">
          <div className="font-medium text-white text-xs xl:text-sm truncate">{complaint.user?.fullName || 'Unknown'}</div>
          <div className="text-xs text-gray-400">Flat {complaint.flatNumber}</div>
        </div>
      </div>
    </td>
    <td className="p-3 xl:p-4">
      <span className="inline-flex items-center px-2 xl:px-3 py-1 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 text-xs font-medium text-white">
        {complaint.category}
      </span>
    </td>
    <td className="p-3 xl:p-4">
      <div className="relative min-w-[120px]">
        <select
          className="w-full appearance-none bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-2 xl:px-3 py-1.5 xl:py-2 pr-7 xl:pr-8 text-white text-xs xl:text-sm font-medium cursor-pointer hover:bg-white/20 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          value={complaint.status}
          onChange={(e) => onStatusChange(complaint._id, e.target.value)}
        >
          <option value="Pending" className="bg-slate-800">Pending</option>
          <option value="In Progress" className="bg-slate-800">In Progress</option>
          <option value="Resolved" className="bg-slate-800">Resolved</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 xl:w-4 xl:h-4 text-gray-400 pointer-events-none flex-shrink-0" />
      </div>
    </td>
    <td className="p-3 xl:p-4">
      <div className="text-xs xl:text-sm text-gray-400 whitespace-nowrap">
        {format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
      </div>
    </td>
    <td className="p-3 xl:p-4">
      <div className="flex items-center justify-center gap-2">
        <button
          onClick={() => onView(complaint._id)}
          className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/30 transition-colors duration-300 group flex-shrink-0 cursor-pointer"
        >
          <Eye className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-gray-400 group-hover:text-purple-400" />
        </button>
        {complaint.status === "Resolved" && (
          <button
            onClick={() => onDelete(complaint)}
            className="w-7 h-7 xl:w-8 xl:h-8 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-colors duration-300 group flex-shrink-0"
          >
            <Trash2 className="w-3.5 h-3.5 xl:w-4 xl:h-4 text-gray-400 group-hover:text-red-400" />
          </button>
        )}
      </div>
    </td>
  </tr>
));

ComplaintTableRow.displayName = 'ComplaintTableRow';

// Memoized mobile card component
const ComplaintCard = memo(({ complaint, idx, onStatusChange, onView, onDelete }) => (
  <div
    className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-3 sm:p-4 space-y-3 hover:bg-white/10 transition-colors duration-300 will-change-auto"
    style={{ animationDelay: `${idx * 50}ms` }}
  >
    <div className="flex items-start justify-between gap-2 sm:gap-3">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-white text-sm sm:text-base mb-1 break-words">{complaint.title}</h3>
        <p className="text-xs sm:text-sm text-gray-400 line-clamp-2 break-words">{complaint.description}</p>
      </div>
      <span className="inline-flex items-center px-2 py-1 rounded-lg bg-white/10 text-xs font-medium text-white whitespace-nowrap flex-shrink-0">
        {complaint.category}
      </span>
    </div>

    <div className="flex items-center gap-2 sm:gap-3 pt-2 border-t border-white/10">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-white font-semibold text-xs flex-shrink-0">
        {complaint.user?.fullName?.[0] || 'U'}
      </div>
      <div className="flex-1 min-w-0">
        <div className="font-medium text-white text-xs sm:text-sm truncate">{complaint.user?.fullName || 'Unknown'}</div>
        <div className="text-xs text-gray-400">Flat {complaint.flatNumber}</div>
      </div>
      <div className="text-xs text-gray-400 flex-shrink-0">
        {format(new Date(complaint.createdAt), 'dd/MM/yy')}
      </div>
    </div>

    <div className="flex items-center gap-2 pt-2">
      <div className="flex-1 relative min-w-0">
        <select
          className="w-full appearance-none bg-white/10 backdrop-blur-sm border border-white/10 rounded-lg px-2 sm:px-3 py-2 pr-7 sm:pr-8 text-white text-xs sm:text-sm font-medium cursor-pointer hover:bg-white/20 transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-purple-500/50"
          value={complaint.status}
          onChange={(e) => onStatusChange(complaint._id, e.target.value)}
        >
          <option value="Pending" className="bg-slate-800">Pending</option>
          <option value="In Progress" className="bg-slate-800">In Progress</option>
          <option value="Resolved" className="bg-slate-800">Resolved</option>
        </select>
        <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-3 h-3 sm:w-4 sm:h-4 text-gray-400 pointer-events-none flex-shrink-0" />
      </div>
      <button
        onClick={() => onView(complaint._id)}
        className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-purple-500/20 hover:border-purple-500/30 transition-colors duration-300 flex-shrink-0 cursor-pointer"
      >
        <Eye className="w-4 h-4 text-gray-400" />
      </button>
      {complaint.status === "Resolved" && (
        <button
          onClick={() => onDelete(complaint)}
          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-white/10 backdrop-blur-sm border border-white/10 flex items-center justify-center hover:bg-red-500/20 hover:border-red-500/30 transition-colors duration-300 flex-shrink-0"
        >
          <Trash2 className="w-4 h-4 text-gray-400" />
        </button>
      )}
    </div>
  </div>
));

ComplaintCard.displayName = 'ComplaintCard';

// Empty state component
const EmptyState = memo(() => (
  <div className="text-center py-12 sm:py-16 px-4">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-white/5 flex items-center justify-center flex-shrink-0">
        <AlertTriangle className="w-6 h-6 sm:w-8 sm:h-8 text-gray-500" />
      </div>
      <p className="text-gray-500 text-sm sm:text-lg">No complaints found for this building</p>
    </div>
  </div>
));

EmptyState.displayName = 'EmptyState';

const AdminBuildingComplaintsPage = () => {
  const { buildingId } = useParams();
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [buildingName, setBuildingName] = useState('');
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);

  useEffect(() => {
    if (buildingId) {
      fetchBuildingComplaints();
    }
  }, [buildingId]);

  const fetchBuildingComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getAllComplaintsAdmin();
      const allComplaints = response.complaints;
      const filtered = allComplaints.filter(c => c.buildingName?._id === buildingId);

      if (filtered.length > 0) {
        setBuildingName(filtered[0].buildingName?.buildingName);
      } else {
        try {
          const buildingResponse = await getBuildingByIdAdmin(buildingId);
          setBuildingName(buildingResponse.building.buildingName);
        } catch (nameError) {
          console.error("Failed to fetch building name:", nameError);
          setBuildingName('Unknown Building');
        }
      }
      setComplaints(filtered);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaints for building.');
      toast.error(err.message || 'Failed to fetch complaints.');
    } finally {
      setLoading(false);
    }
  }, [buildingId]);

  const handleDeleteClick = useCallback((complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      if (complaintToDelete) {
        await deleteComplaintAdmin(complaintToDelete._id);
        toast.success('Complaint deleted successfully!');
        setIsDeleteModalOpen(false);
        setComplaintToDelete(null);
        await fetchBuildingComplaints();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete complaint.');
    }
  }, [complaintToDelete, fetchBuildingComplaints]);

  const handleStatusChange = useCallback(async (complaintId, newStatus) => {
    try {
      await updateComplaintStatusAdmin(complaintId, newStatus);
      toast.success('Complaint status updated successfully!');
      await fetchBuildingComplaints();
    } catch (error) {
      toast.error(error.message || 'Failed to update complaint status.');
    }
  }, [fetchBuildingComplaints]);

  const handleViewComplaint = useCallback((complaintId) => {
    navigate(`/admin/complaints/${complaintId}`);
  }, [navigate]);

  const handleViewResidents = useCallback(() => {
    navigate(`/admin/building/${buildingId}/residents`);
  }, [navigate, buildingId]);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Memoized stats to prevent recalculation
  const stats = useMemo(() => [
    { label: 'Total', count: complaints.length, color: 'from-purple-500 to-pink-500', icon: '📋' },
    { label: 'Pending', count: complaints.filter(c => c.status === 'Pending').length, color: 'from-amber-500 to-orange-500', icon: '⏳' },
    { label: 'Resolved', count: complaints.filter(c => c.status === 'Resolved').length, color: 'from-emerald-500 to-green-500', icon: '✅' }
  ], [complaints]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="relative will-change-transform mx-auto w-16 h-16 sm:w-20 sm:h-20">
            <div className="w-16 h-16 sm:w-20 sm:h-20 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-16 h-16 sm:w-20 sm:h-20 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg font-medium bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent animate-pulse">
            Loading complaints...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center max-w-md w-full">
          <AlertTriangle className="w-12 h-12 sm:w-16 sm:h-16 text-red-400 mx-auto mb-4 flex-shrink-0" />
          <p className="text-red-400 text-sm sm:text-lg break-words">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 md:p-8 pt-20 sm:pt-24 md:pt-32">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse will-change-transform"></div>
        <div className="absolute bottom-1/4 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDelay: '1s' }}></div>
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="mb-6 sm:mb-8 animate-fade-in">
          <div className="flex flex-col gap-4 mb-6">
            <div>
              <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent break-words">
                {buildingName || 'Selected Building'}
              </h1>
              <p className="text-gray-400 text-xs sm:text-sm md:text-base">Manage and monitor all complaints</p>
            </div>

            <div className="flex flex-col gap-2 sm:gap-3">
              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end sm:gap-3">
                <button
                  onClick={handleGoBack}
                  className="group relative px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors duration-300 overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-gray-500/20 to-slate-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-400 group-hover:text-white flex-shrink-0"><path d="m12 19-7-7 7-7"/><path d="M19 12H5"/></svg>
                    <span className="text-white text-xs sm:text-sm font-medium">Back</span>
                  </div>
                </button>
                <button
                  onClick={fetchBuildingComplaints}
                  className="group relative px-3 sm:px-4 py-2 sm:py-2.5 bg-white/5 backdrop-blur-xl border border-white/10 rounded-lg sm:rounded-xl hover:bg-white/10 transition-colors duration-300 overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-blue-500/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <RefreshCw className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-purple-400 group-hover:rotate-180 transition-transform duration-500 flex-shrink-0" />
                    <span className="text-white text-xs sm:text-sm font-medium">Refresh</span>
                  </div>
                </button>

                <button
                  onClick={handleViewResidents}
                  className="group relative px-3 sm:px-4 py-2 sm:py-2.5 bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg sm:rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-shadow duration-300 overflow-hidden flex-shrink-0 cursor-pointer"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
                  <div className="relative flex items-center justify-center gap-2">
                    <Users className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white flex-shrink-0" />
                    <span className="text-white text-xs sm:text-sm font-medium">All Residents</span>
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 xs:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 mb-6 sm:mb-8">
          {stats.map((stat, idx) => (
            <StatCard key={stat.label} stat={stat} idx={idx} />
          ))}
        </div>

        {/* Complaints Table/Cards */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl">
          {/* Desktop Table View */}
          <div className="hidden lg:block overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left p-3 xl:p-4 text-gray-400 font-semibold text-xs xl:text-sm">Complaint</th>
                  <th className="text-left p-3 xl:p-4 text-gray-400 font-semibold text-xs xl:text-sm">User</th>
                  <th className="text-left p-3 xl:p-4 text-gray-400 font-semibold text-xs xl:text-sm">Category</th>
                  <th className="text-left p-3 xl:p-4 text-gray-400 font-semibold text-xs xl:text-sm">Status</th>
                  <th className="text-left p-3 xl:p-4 text-gray-400 font-semibold text-xs xl:text-sm">Date</th>
                  <th className="text-center p-3 xl:p-4 text-gray-400 font-semibold text-xs xl:text-sm">Actions</th>
                </tr>
              </thead>
              <tbody>
                {complaints.length === 0 ? (
                  <tr>
                    <td colSpan="6" className="text-center py-16">
                      <EmptyState />
                    </td>
                  </tr>
                ) : (
                  complaints.map((complaint, idx) => (
                    <ComplaintTableRow
                      key={complaint._id}
                      complaint={complaint}
                      idx={idx}
                      onStatusChange={handleStatusChange}
                      onView={handleViewComplaint}
                      onDelete={handleDeleteClick}
                    />
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile Card View */}
          <div className="lg:hidden p-3 sm:p-4 space-y-3 sm:space-y-4">
            {complaints.length === 0 ? (
              <EmptyState />
            ) : (
              complaints.map((complaint, idx) => (
                <ComplaintCard
                  key={complaint._id}
                  complaint={complaint}
                  idx={idx}
                  onStatusChange={handleStatusChange}
                  onView={handleViewComplaint}
                  onDelete={handleDeleteClick}
                />
              ))
            )}
          </div>
        </div>
      </div>

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Complaint Deletion"
        message={`Are you sure you want to delete complaint "${complaintToDelete?.title}"? This action cannot be undone.`}
      />

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (min-width: 475px) {
          .xs\:flex-row {
            flex-direction: row;
          }
          .xs\:grid-cols-2 {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
        }
      `}</style>
    </div>
  );
};

export default AdminBuildingComplaintsPage;