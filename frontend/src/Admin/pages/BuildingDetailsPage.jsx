import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuildingById } from '../../lib/buildingService';
import { updateComplaintStatus, deleteComplaint } from '../../lib/complaintService';
import toast from 'react-hot-toast';
import { LoaderCircle, User, Hash, Clock, ShieldAlert, Users, Trash2, ChevronRight, AlertTriangle } from 'lucide-react';
import ConfirmationModal from '../components/ConfirmationModal';

// Memoized ComplaintCard component to prevent unnecessary re-renders
const ComplaintCard = React.memo(({
  complaint,
  isHovered,
  onMouseEnter,
  onMouseLeave,
  onStatusChange,
  onDelete
}) => {
  const isEmergency = complaint.category === 'Emergency';

  const statusStyles = useMemo(() => {
    switch (complaint.status) {
      case 'Pending':
        return 'bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-300';
      case 'In Progress':
        return 'bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-300';
      case 'Resolved':
        return 'bg-gradient-to-r from-emerald-500/20 to-green-500/20 border border-emerald-500/30 text-emerald-300';
      default:
        return 'bg-gray-500/20 border border-gray-500/30 text-gray-300';
    }
  }, [complaint.status]);

  const formattedDate = useMemo(() =>
    new Date(complaint.createdAt).toLocaleDateString('en-GB'),
    [complaint.createdAt]
  );

  const handleStatusChange = useCallback((e) => {
    onStatusChange(complaint._id, e.target.value);
  }, [complaint._id, onStatusChange]);

  const handleDelete = useCallback(() => {
    onDelete(complaint);
  }, [complaint, onDelete]);

  return (
    <div
      className={`group backdrop-blur-lg border transition-all duration-300 rounded-xl sm:rounded-2xl overflow-hidden cursor-default ${isEmergency
        ? 'bg-gradient-to-r from-red-500/10 to-pink-500/10 border-red-500/30 hover:border-red-500/50 hover:shadow-lg hover:shadow-red-500/20'
        : 'bg-white/5 border-white/10 hover:border-cyan-500/30 hover:bg-white/[0.08] hover:shadow-lg hover:shadow-cyan-500/10'
        }`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{ willChange: isHovered ? 'transform' : 'auto' }}
    >
      <div className="p-3 xs:p-4 sm:p-5 md:p-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 xs:gap-4 sm:gap-5 md:gap-6 items-start lg:items-center">
          {/* Title & Description */}
          <div className="lg:col-span-3">
            <div className="flex items-start gap-2 xs:gap-3">
              {isEmergency && (
                <div className="mt-0.5 p-1 xs:p-1.5 rounded-lg bg-red-500/20 border border-red-500/30 flex-shrink-0">
                  <AlertTriangle className="w-3 h-3 xs:w-4 xs:h-4 text-red-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <h3 className="font-bold text-white text-xs xs:text-sm sm:text-base truncate">
                  {complaint.title}
                </h3>
                <p className="text-white/50 text-xs line-clamp-2 mt-1">
                  {complaint.description}
                </p>
              </div>
            </div>
          </div>

          {/* User */}
          <div className="lg:col-span-2">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">User</div>
            <div className="flex items-center gap-2 text-white/80 text-xs xs:text-sm truncate">
              <User className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-cyan-400 flex-shrink-0" />
              <span className="truncate">{complaint.user?.fullName || 'N/A'}</span>
            </div>
          </div>

          {/* Flat No. */}
          <div className="lg:col-span-1">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Flat</div>
            <div className="flex items-center gap-2 text-white/80 text-xs xs:text-sm">
              <Hash className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-blue-400 flex-shrink-0" />
              <span>{complaint.user?.flatNumber || 'N/A'}</span>
            </div>
          </div>

          {/* Date */}
          <div className="lg:col-span-2">
            <div className="text-xs text-white/40 uppercase tracking-wider mb-1">Submitted</div>
            <div className="flex items-center gap-2 text-white/80 text-xs xs:text-sm">
              <Clock className="w-3.5 h-3.5 xs:w-4 xs:h-4 text-purple-400 flex-shrink-0" />
              <span>{formattedDate}</span>
            </div>
          </div>

          {/* Status & Action */}
          <div className="lg:col-span-4 flex flex-col xs:flex-row gap-2 xs:gap-3 items-stretch xs:items-center w-full">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-white/40 uppercase tracking-wider mb-1 hidden xs:block">Status</div>
              <select
                className={`w-full px-2.5 xs:px-3 py-2 rounded-lg font-semibold text-xs xs:text-sm transition-all duration-300 backdrop-blur-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 ${statusStyles}`}
                value={complaint.status}
                onChange={handleStatusChange}
              >
                <option value="Pending">Pending</option>
                <option value="In Progress">In Progress</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>

            {complaint.status === 'Resolved' && (
              <button
                className="p-2 xs:p-2.5 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 hover:bg-red-500/20 hover:border-red-500/50 transition-all duration-300 hover:shadow-lg hover:shadow-red-500/20 flex-shrink-0"
                onClick={handleDelete}
                title="Delete complaint"
              >
                <Trash2 className="w-4 h-4 xs:w-4.5 xs:h-4.5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
});

ComplaintCard.displayName = 'ComplaintCard';

const BuildingDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [hoveredComplaint, setHoveredComplaint] = useState(null);

  const fetchBuildingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBuildingById(id);
      setBuilding(response.building);
      setComplaints(response.building.complaints || []);
    } catch (error) {
      toast.error('Failed to fetch building details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBuildingDetails();
  }, [fetchBuildingDetails]);

  const handleStatusChange = useCallback(async (complaintId, newStatus) => {
    try {
      await updateComplaintStatus(complaintId, newStatus);
      toast.success('Complaint status updated');
      fetchBuildingDetails();
    } catch (error) {
      toast.error('Failed to update status');
    }
  }, [fetchBuildingDetails]);

  const openDeleteModal = useCallback((complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setComplaintToDelete(null);
    setIsDeleteModalOpen(false);
  }, []);

  const handleDeleteComplaint = useCallback(async () => {
    if (!complaintToDelete) return;
    try {
      await deleteComplaint(complaintToDelete._id);
      toast.success('Complaint deleted successfully');
      fetchBuildingDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to delete complaint');
    } finally {
      closeDeleteModal();
    }
  }, [complaintToDelete, fetchBuildingDetails, closeDeleteModal]);

  const handleMouseEnter = useCallback((complaintId) => {
    setHoveredComplaint(complaintId);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setHoveredComplaint(null);
  }, []);

  const navigateToResidents = useCallback(() => {
    navigate(`/admin/building/${id}/residents`);
  }, [navigate, id]);

  const navigateToComplaints = useCallback(() => {
    navigate(`/admin/building/${id}/complaints`);
  }, [navigate, id]);

  // Memoized statistics calculations
  const stats = useMemo(() => {
    const complaintCount = complaints.length;
    const resolvedCount = complaints.filter(c => c.status === 'Resolved').length;
    const pendingCount = complaints.filter(c => c.status === 'Pending').length;
    const inProgressCount = complaints.filter(c => c.status === 'In Progress').length;
    const emergencyCount = complaints.filter(c => c.category === 'Emergency').length;

    return { complaintCount, resolvedCount, pendingCount, inProgressCount, emergencyCount };
  }, [complaints]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <LoaderCircle className="w-12 h-12 animate-spin text-cyan-400 relative" />
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl p-6 text-white text-center">
          <p className="text-base sm:text-lg font-medium">Building not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-black overflow-hidden relative min-h-screen p-3 sm:p-4 md:p-8 pt-20 sm:pt-24 md:pt-32">
      {/* Animated background elements - GPU accelerated */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 xs:w-80 sm:w-96 h-64 xs:h-80 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-blob" style={{ willChange: 'transform' }}></div>
        <div className="absolute top-1/3 right-1/4 w-64 xs:w-80 sm:w-96 h-64 xs:h-80 sm:h-96 bg-blue-500/10 rounded-full blur-3xl animate-blob animation-delay-2000" style={{ willChange: 'transform' }}></div>
        <div className="absolute bottom-0 right-1/3 w-64 xs:w-80 sm:w-96 h-64 xs:h-80 sm:h-96 bg-purple-500/10 rounded-full blur-3xl animate-blob animation-delay-4000" style={{ willChange: 'transform' }}></div>
      </div>

      <div className="relative z-10 p-3 xs:p-4 sm:p-6 md:p-8">
        <div className="max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 animate-fade-in">
            <div className="group backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 hover:border-cyan-500/30 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 md:p-10 transition-all duration-500 shadow-2xl hover:shadow-cyan-500/20">
              <div className="flex flex-col gap-6 sm:gap-8">
                <div className="flex flex-col gap-4">
                  <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl font-black bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent leading-tight">
                    {building.buildingName}
                  </h1>
                  <p className="text-white/60 text-sm xs:text-base font-light">Detailed view of the building and its complaints</p>
                </div>

                {/* Stats Row */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 xs:gap-3 sm:gap-4">
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 hover:bg-white/10 transition-all">
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-cyan-300">{stats.complaintCount}</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider mt-1 line-clamp-1">Total</div>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 hover:bg-white/10 transition-all">
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-emerald-300">{stats.resolvedCount}</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider mt-1 line-clamp-1">Resolved</div>
                  </div>
                  <div className="backdrop-blur-lg bg-white/5 border border-white/10 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 hover:bg-white/10 transition-all">
                    <div className="text-lg xs:text-xl sm:text-2xl font-bold text-amber-300">{stats.pendingCount}</div>
                    <div className="text-xs text-white/50 uppercase tracking-wider mt-1 line-clamp-1">Pending</div>
                  </div>
                  {stats.emergencyCount > 0 && (
                    <div className="backdrop-blur-lg bg-red-500/10 border border-red-500/30 rounded-lg xs:rounded-xl px-3 xs:px-4 py-2.5 xs:py-3 hover:bg-red-500/20 transition-all col-span-2 sm:col-span-1">
                      <div className="text-lg xs:text-xl sm:text-2xl font-bold text-red-300">{stats.emergencyCount}</div>
                      <div className="text-xs text-red-200/50 uppercase tracking-wider mt-1 line-clamp-1">Emergency</div>
                    </div>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-4">
                  <button
                    onClick={navigateToResidents}
                    className="group/btn relative px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-cyan-500/30 w-full sm:w-auto text-sm xs:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-600 via-blue-600 to-purple-600 opacity-100 group-hover/btn:opacity-0 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center xs:justify-start gap-2">
                      <Users className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span>All Residents</span>
                      <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </button>

                  <button
                    onClick={navigateToComplaints}
                    className="group/btn relative px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 rounded-lg xs:rounded-xl font-semibold text-white overflow-hidden transition-all duration-300 hover:shadow-lg hover:shadow-red-500/30 w-full sm:w-auto text-sm xs:text-base"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 opacity-0 group-hover/btn:opacity-100 transition-opacity duration-300"></div>
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 opacity-100 group-hover/btn:opacity-0 transition-opacity duration-300"></div>
                    <div className="relative flex items-center justify-center xs:justify-start gap-2">
                      <ShieldAlert className="w-4 h-4 xs:w-5 xs:h-5" />
                      <span>All Complaints</span>
                      <ChevronRight className="w-3 h-3 xs:w-4 xs:h-4 group-hover/btn:translate-x-1 transition-transform" />
                    </div>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Complaints Section */}
          <div className="animate-fade-in animation-delay-200">
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/5 to-white/[0.02] border border-white/10 rounded-2xl sm:rounded-3xl p-4 xs:p-6 sm:p-8 md:p-10 shadow-2xl">
              <div className="flex flex-col xs:flex-row xs:items-start gap-3 xs:gap-4 mb-6 sm:mb-8">
                <div className="p-2 xs:p-3 rounded-lg xs:rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30 flex-shrink-0">
                  <ShieldAlert className="w-5 h-5 xs:w-6 xs:h-6 text-cyan-300" />
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white">Complaint Management</h2>
                  <p className="text-white/50 text-xs xs:text-sm">Manage and track all building complaints</p>
                </div>
              </div>

              {complaints.length === 0 ? (
                <div className="text-center py-12 sm:py-16">
                  <div className="inline-block p-3 xs:p-4 rounded-full bg-white/5 border border-white/10 mb-4">
                    <ShieldAlert className="w-8 h-8 text-white/30" />
                  </div>
                  <p className="text-white/60 text-base sm:text-lg">No complaints recorded</p>
                </div>
              ) : (
                <div className="space-y-2 xs:space-y-3">
                  {complaints.map((complaint) => (
                    <ComplaintCard
                      key={complaint._id}
                      complaint={complaint}
                      isHovered={hoveredComplaint === complaint._id}
                      onMouseEnter={() => handleMouseEnter(complaint._id)}
                      onMouseLeave={handleMouseLeave}
                      onStatusChange={handleStatusChange}
                      onDelete={openDeleteModal}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteComplaint}
        title="Confirm Complaint Deletion"
      >
        <p>Are you sure you want to permanently delete this complaint?</p>
        <p className="font-semibold mt-2">"{complaintToDelete?.title}"</p>
        <p className="text-sm text-red-400 mt-2">This action cannot be undone.</p>
      </ConfirmationModal>

      <style jsx>{`
        @keyframes fade-in {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes blob {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -50px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        .animate-fade-in {
          animation: fade-in 0.6s ease-out forwards;
          opacity: 0;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-4000 {
          animation-delay: 4s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .animate-blob {
          animation: blob 7s infinite;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .line-clamp-1 {
          display: -webkit-box;
          -webkit-line-clamp: 1;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }
      `}</style>
    </div>
  );
};

export default BuildingDetailsPage;