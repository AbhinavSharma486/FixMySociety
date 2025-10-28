import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getBuildingByIdAdmin, updateUserByAdmin, addResidentByAdmin, deleteUserByAdmin } from '../../lib/adminService';
import toast from 'react-hot-toast';
import { LoaderCircle, User, Mail, Edit, ArrowLeft, PlusCircle, Trash2, Building2, Grid3X3, Users } from 'lucide-react';
import EditResidentModal from '../components/EditResidentModal';
import ConfirmationModal from '../components/ConfirmationModal';
import AddResidentModal from '../components/AddResidentModal';

// Memoized resident row component to prevent unnecessary re-renders
const ResidentRow = React.memo(({ resident, buildingName, onEdit, onDelete }) => (
  <tr className="row-shimmer group">
    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center gap-2 sm:gap-3">
        <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500/20 to-purple-500/20 flex-shrink-0">
          <User className="w-3 h-3 sm:w-4 sm:h-4 text-cyan-400" />
        </div>
        <span className="text-white font-medium text-xs sm:text-sm md:text-base truncate">{resident.fullName}</span>
      </div>
    </td>
    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex items-center gap-2">
        <Mail className="w-3 h-3 sm:w-4 sm:h-4 text-purple-400 flex-shrink-0 hidden sm:block" />
        <span className="text-slate-300 text-xs sm:text-sm md:text-base truncate">{resident.email}</span>
      </div>
    </td>
    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 hidden sm:table-cell">
      <span className="text-slate-300 text-xs sm:text-sm md:text-base truncate">{buildingName}</span>
    </td>
    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="inline-block px-2 sm:px-3 py-1 rounded-lg bg-blue-500/20 border border-blue-400/30">
        <span className="text-blue-300 font-semibold text-xs sm:text-sm">{resident.flatNumber}</span>
      </div>
    </td>
    <td className="px-3 sm:px-4 md:px-6 py-3 sm:py-4">
      <div className="flex gap-1.5 sm:gap-2 opacity-100 md:group-hover:opacity-100 md:opacity-0 transition-opacity">
        <button
          onClick={onEdit}
          className="p-2 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 hover:text-cyan-300 transition-all border border-cyan-400/30 hover:border-cyan-400/50"
          title="Edit resident"
        >
          <Edit className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-400 hover:text-red-300 transition-all border border-red-400/30 hover:border-red-400/50"
          title="Delete resident"
        >
          <Trash2 className="w-3 h-3 sm:w-4 sm:h-4" />
        </button>
      </div>
    </td>
  </tr>
));

ResidentRow.displayName = 'ResidentRow';

// Memoized stats card component
const StatsCard = React.memo(({ icon: Icon, label, value, colorClass, bgClass }) => (
  <div className={`glass-panel rounded-xl sm:rounded-2xl p-3 sm:p-4 border ${colorClass}`}>
    <div className="flex items-center gap-2 sm:gap-3">
      <div className={`p-2 rounded-lg ${bgClass} flex-shrink-0`}>
        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
      </div>
      <div className="min-w-0">
        <p className="text-slate-400 text-xs sm:text-sm">{label}</p>
        <p className="text-lg sm:text-2xl font-bold text-white truncate">{value}</p>
      </div>
    </div>
  </div>
));

StatsCard.displayName = 'StatsCard';

// Extracted static styles to prevent recreation
const ANIMATION_STYLES = `
  @keyframes blob {
    0%, 100% { transform: translate3d(0, 0, 0) scale(1); }
    33% { transform: translate3d(30px, -50px, 0) scale(1.1); }
    66% { transform: translate3d(-20px, 20px, 0) scale(0.9); }
  }
  .animate-blob {
    animation: blob 7s infinite;
    will-change: transform;
  }
  .animation-delay-2000 {
    animation-delay: 2s;
  }
  .animation-delay-4000 {
    animation-delay: 4s;
  }
  .glass-panel {
    background: rgba(255, 255, 255, 0.05);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
  .glass-panel-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: background, border-color, box-shadow;
  }
  .glass-panel-hover:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  }
  .gradient-btn {
    background: linear-gradient(135deg, #06b6d4 0%, #8b5cf6 100%);
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    will-change: box-shadow, transform;
  }
  .gradient-btn:hover {
    box-shadow: 0 0 20px rgba(6, 182, 212, 0.5), 0 0 40px rgba(139, 92, 246, 0.3);
    transform: translateY(-2px);
  }
  .gradient-btn:active {
    transform: translateY(0);
  }
  .icon-glow {
    filter: drop-shadow(0 0 4px rgba(6, 182, 212, 0.5));
  }
  .row-shimmer {
    transition: all 0.2s ease;
    will-change: background, transform;
  }
  .row-shimmer:hover {
    background: rgba(6, 182, 212, 0.05);
    transform: translate3d(4px, 0, 0);
  }
  
  @media (max-width: 640px) {
    .gradient-btn {
      padding: 0.75rem 1rem;
      font-size: 0.875rem;
    }
  }
`;

const BuildingResidentsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [building, setBuilding] = useState(null);
  const [loading, setLoading] = useState(true);
  const [residents, setResidents] = useState([]);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState(null);
  const [residentToDelete, setResidentToDelete] = useState(null);

  // Memoize fetch function to prevent recreation
  const fetchBuildingDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getBuildingByIdAdmin(id);
      setBuilding(response.building);
      setResidents(response.building.residents || []);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch building details');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchBuildingDetails();
  }, [fetchBuildingDetails]);

  // Memoize callbacks to prevent child component re-renders
  const handleAddResident = useCallback(async (newResidentData) => {
    try {
      const response = await addResidentByAdmin(id, newResidentData);
      toast.success(response.message);
      setIsAddModalOpen(false);
      fetchBuildingDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to add resident');
    }
  }, [id, fetchBuildingDetails]);

  const handleEditResident = useCallback((resident) => {
    setSelectedResident(resident);
    setIsEditModalOpen(true);
  }, []);

  const handleUpdateResident = useCallback(async (residentId, updatedData) => {
    try {
      await updateUserByAdmin(residentId, updatedData);
      toast.success('Resident details updated successfully');
      setIsEditModalOpen(false);
      setSelectedResident(null);
      fetchBuildingDetails();
    } catch (error) {
      toast.error(error.message || 'Failed to update resident');
    }
  }, [fetchBuildingDetails]);

  const handleDeleteClick = useCallback((resident) => {
    setResidentToDelete(resident);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteResident = useCallback(async () => {
    try {
      if (residentToDelete) {
        await deleteUserByAdmin(residentToDelete._id);
        toast.success('Resident deleted successfully');
        setIsDeleteModalOpen(false);
        setResidentToDelete(null);
        fetchBuildingDetails();
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete resident');
    }
  }, [residentToDelete, fetchBuildingDetails]);

  // Memoize navigation handlers
  const handleAddClick = useCallback(() => setIsAddModalOpen(true), []);
  const handleBackClick = useCallback(() => navigate(`/admin/building/${id}`), [navigate, id]);
  const handleEditModalClose = useCallback(() => setIsEditModalOpen(false), []);
  const handleAddModalClose = useCallback(() => setIsAddModalOpen(false), []);
  const handleDeleteModalClose = useCallback(() => setIsDeleteModalOpen(false), []);

  // Memoize computed values
  const residentsCount = useMemo(() => residents.length, [residents.length]);
  const buildingName = useMemo(() => building?.buildingName || '', [building?.buildingName]);
  const deleteConfirmationMessage = useMemo(
    () => `Are you sure you want to delete resident ${residentToDelete?.fullName}? This action cannot be undone.`,
    [residentToDelete?.fullName]
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-purple-500 rounded-full blur-3xl opacity-20 animate-pulse"></div>
          <LoaderCircle className="w-12 h-12 sm:w-16 sm:h-16 animate-spin text-cyan-400 relative" />
        </div>
      </div>
    );
  }

  if (!building) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 flex items-center justify-center p-4">
        <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center max-w-sm">
          <p className="text-white text-base sm:text-lg">Building not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-900 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-blob"></div>
        <div className="absolute -bottom-8 right-1/4 w-64 h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 right-0 w-64 h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-blob animation-delay-4000"></div>
      </div>

      <style>{ANIMATION_STYLES}</style>

      <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 pt-6 sm:pt-8">
        <div className="w-full max-w-7xl mx-auto">
          {/* Header Section */}
          <div className="mb-6 sm:mb-8 space-y-4 sm:space-y-6">
            <div className="glass-panel rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 glass-panel-hover">
              <div className="flex flex-col gap-4 sm:gap-6">
                <div className="flex-1">
                  <div className="flex items-start gap-2 sm:gap-3 mb-2 sm:mb-3">
                    <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500/20 to-purple-500/20 border border-cyan-400/30 flex-shrink-0 mt-0.5 sm:mt-0">
                      <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-400 icon-glow" />
                    </div>
                    <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent break-words">
                      {buildingName}
                    </h1>
                  </div>
                  <p className="text-slate-400 text-xs sm:text-sm md:text-base flex items-center gap-2 mt-2 sm:mt-3">
                    <Users className="w-3 h-3 sm:w-4 sm:h-4 flex-shrink-0" />
                    Manage residents for this building
                  </p>
                </div>

                <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 w-full">
                  <button
                    onClick={handleAddClick}
                    className="gradient-btn text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 hover:shadow-lg transition-all text-sm sm:text-base order-first"
                  >
                    <PlusCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">Add Resident</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                  <button
                    onClick={handleBackClick}
                    className="glass-panel text-slate-300 hover:text-white font-semibold py-2.5 sm:py-3 px-4 sm:px-6 rounded-lg sm:rounded-xl flex items-center justify-center gap-2 border border-slate-600/50 hover:border-cyan-400/50 transition-all text-sm sm:text-base"
                  >
                    <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                    <span className="hidden sm:inline">Back</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Stats Bar */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              <StatsCard
                icon={Users}
                label="Total Residents"
                value={residentsCount}
                colorClass="border-cyan-400/20"
                bgClass="bg-cyan-500/10 text-cyan-400"
              />
              <StatsCard
                icon={Building2}
                label="Building"
                value={buildingName}
                colorClass="border-purple-400/20"
                bgClass="bg-purple-500/10 text-purple-400"
              />
              <StatsCard
                icon={Grid3X3}
                label="Status"
                value="Active"
                colorClass="border-blue-400/20"
                bgClass="bg-blue-500/10 text-blue-400"
              />
            </div>
          </div>

          {/* Residents Table/Grid */}
          <div className="glass-panel rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-white/10 bg-white/5">
                  <tr>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-cyan-400">Name</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-cyan-400">Email</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-cyan-400 hidden sm:table-cell">Building</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-cyan-400">Flat No.</th>
                    <th className="px-3 sm:px-4 md:px-6 py-3 sm:py-4 text-left text-xs sm:text-sm font-semibold text-cyan-400">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {residents.map((resident) => (
                    <ResidentRow
                      key={resident._id}
                      resident={resident}
                      buildingName={buildingName}
                      onEdit={() => handleEditResident(resident)}
                      onDelete={() => handleDeleteClick(resident)}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {residentsCount === 0 && (
              <div className="flex flex-col items-center justify-center py-12 sm:py-16 px-4">
                <div className="p-3 sm:p-4 rounded-xl sm:rounded-2xl bg-slate-800/50 mb-3 sm:mb-4">
                  <Users className="w-6 h-6 sm:w-8 sm:h-8 text-slate-400" />
                </div>
                <p className="text-slate-400 text-center text-sm sm:text-base">No residents yet. Add your first resident to get started.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <EditResidentModal
        isOpen={isEditModalOpen}
        onClose={handleEditModalClose}
        resident={selectedResident}
        onSubmit={handleUpdateResident}
      />

      <AddResidentModal
        isOpen={isAddModalOpen}
        onClose={handleAddModalClose}
        buildingId={id}
        onSubmit={handleAddResident}
      />

      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={handleDeleteModalClose}
        onConfirm={handleDeleteResident}
        title="Confirm Deletion"
        message={deleteConfirmationMessage}
      />
    </div>
  );
};

export default BuildingResidentsPage;