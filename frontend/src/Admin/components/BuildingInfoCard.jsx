import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import {
  Building2,
  Users,
  AlertTriangle,
  CheckCircle,
  Clock,
  Plus,
  Edit,
  Trash2,
  Eye,
  DoorOpen,
  Siren,
  ClipboardList,
  Flame,
  TrendingUp,
  Activity
} from "lucide-react";
import { getAllBuildingsAdmin, deleteBuilding } from "../../lib/buildingService";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import ConfirmationModal from "./ConfirmationModal";

// Memoized StatCard component to prevent unnecessary re-renders
const StatCard = memo(({ icon: Icon, label, value, colorFrom, colorTo, delay }) => (
  <div
    className="group relative overflow-hidden rounded-2xl transition-all duration-500 hover:scale-105 cursor-pointer animate-fadeIn"
    style={{ animationDelay: `${delay}ms`, animationFillMode: 'backwards', willChange: 'transform' }}
  >
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 to-slate-800/80 backdrop-blur-xl"></div>
    <div className={`absolute inset-0 bg-gradient-to-br ${colorFrom} ${colorTo} opacity-0 group-hover:opacity-10 transition-opacity duration-500`}></div>
    <div className="absolute inset-0 border border-white/5 rounded-2xl group-hover:border-white/20 transition-all duration-500"></div>

    <div className="relative p-6">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${colorFrom} ${colorTo} shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500`} style={{ willChange: 'transform' }}>
          <Icon className="w-6 h-6 text-white" />
        </div>
        <div className="flex items-center gap-1 text-green-400 text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <TrendingUp className="w-4 h-4" />
          <span className="font-medium">Live</span>
        </div>
      </div>

      <div className="space-y-1">
        <p className="text-gray-400 text-sm font-medium">{label}</p>
        <p className="text-4xl font-bold text-white tracking-tight">{value}</p>
      </div>

      <div className="mt-4 h-1 bg-white/5 rounded-full overflow-hidden">
        <div className={`h-full bg-gradient-to-r ${colorFrom} ${colorTo} transform origin-left transition-transform duration-1000 group-hover:scale-x-100 scale-x-75`} style={{ willChange: 'transform' }}></div>
      </div>
    </div>
  </div>
));

StatCard.displayName = 'StatCard';

// Memoized BuildingRow component to prevent re-rendering all rows when one changes
const BuildingRow = memo(({ building, onNavigateComplaints, onNavigateResidents, onEdit, onDelete }) => {
  const emergencyCount = useMemo(() =>
    building.complaints.filter(c => c.category === 'Emergency').length, [building.complaints]
  );
  const pendingCount = useMemo(() =>
    building.complaints.filter(c => c.status === 'Pending').length, [building.complaints]
  );
  const inProgressCount = useMemo(() =>
    building.complaints.filter(c => c.status === 'In Progress').length, [building.complaints]
  );
  const resolvedCount = useMemo(() =>
    building.complaints.filter(c => c.status === 'Resolved').length, [building.complaints]
  );

  return (
    <tr className="group border-b border-white/5 hover:bg-white/5 transition-all duration-300">
      <td className="py-5 px-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 group-hover:scale-110 transition-transform duration-300" style={{ willChange: 'transform' }}>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <span className="font-semibold text-white">{building.buildingName}</span>
        </div>
      </td>
      <td className="py-5 px-4">
        <span className="text-gray-300 font-medium">{building.numberOfFlats}</span>
      </td>
      <td className="py-5 px-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-sm font-semibold">
          {building.filledFlats}
        </span>
      </td>
      <td className="py-5 px-4">
        <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-sm font-semibold">
          {building.emptyFlats}
        </span>
      </td>
      <td className="py-5 px-4">
        <div className="flex flex-wrap gap-1.5">
          {building.complaints.length > 0 ? (
            <>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-red-500/20 to-rose-500/20 border border-red-500/30 text-red-400 text-xs font-semibold">
                {emergencyCount} Emergency
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-amber-500/20 to-orange-500/20 border border-amber-500/30 text-amber-400 text-xs font-semibold">
                {pendingCount} Pending
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-blue-500/20 to-cyan-500/20 border border-blue-500/30 text-blue-400 text-xs font-semibold">
                {inProgressCount} In Progress
              </span>
              <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 text-green-400 text-xs font-semibold">
                {resolvedCount} Resolved
              </span>
            </>
          ) : (
            <span className="text-gray-500 text-sm">No complaints</span>
          )}
        </div>
      </td>
      <td className="py-5 px-4">
        <div className="flex gap-2">
          <button
            className="p-2 rounded-lg bg-white/5 hover:bg-purple-500/20 border border-white/10 hover:border-purple-500/30 text-gray-400 hover:text-purple-400 transition-all duration-300 hover:scale-110"
            onClick={onNavigateComplaints}
            title="View Complaints"
            style={{ willChange: 'transform' }}
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-white/5 hover:bg-blue-500/20 border border-white/10 hover:border-blue-500/30 text-gray-400 hover:text-blue-400 transition-all duration-300 hover:scale-110"
            onClick={onNavigateResidents}
            title="View Residents"
            style={{ willChange: 'transform' }}
          >
            <Users className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-white/5 hover:bg-green-500/20 border border-white/10 hover:border-green-500/30 text-gray-400 hover:text-green-400 transition-all duration-300 hover:scale-110"
            onClick={onEdit}
            title="Edit Building"
            style={{ willChange: 'transform' }}
          >
            <Edit className="w-4 h-4" />
          </button>
          <button
            className="p-2 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 text-gray-400 hover:text-red-400 transition-all duration-300 hover:scale-110"
            onClick={onDelete}
            title="Delete Building"
            style={{ willChange: 'transform' }}
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </td>
    </tr>
  );
});

BuildingRow.displayName = 'BuildingRow';

const BuildingInfoCard = ({ onEditBuilding }) => {
  const [buildings, setBuildings] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState(null);

  useEffect(() => {
    fetchBuildings();
  }, []);

  const fetchBuildings = async () => {
    try {
      setLoading(true);
      const response = await getAllBuildingsAdmin();
      setBuildings(response.buildings);
    } catch (error) {
      toast.error(error.message || 'Failed to fetch buildings');
    } finally {
      setLoading(false);
    }
  };

  const openDeleteModal = useCallback((building) => {
    setBuildingToDelete(building);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setBuildingToDelete(null);
    setIsDeleteModalOpen(false);
  }, []);

  const handleDeleteBuilding = useCallback(async () => {
    if (!buildingToDelete) return;
    try {
      await deleteBuilding(buildingToDelete._id);
      toast.success(`Building "${buildingToDelete.buildingName}" deleted successfully`);
      fetchBuildings();
    } catch (error) {
      toast.error(error.message || 'Failed to delete building');
    } finally {
      closeDeleteModal();
    }
  }, [buildingToDelete, closeDeleteModal]);

  // Memoized statistics to prevent recalculation on every render
  const stats = useMemo(() => ({
    totalBuildings: buildings.length,
    totalResidents: buildings.reduce((sum, building) => sum + building.filledFlats, 0),
    totalEmptyFlats: buildings.reduce((sum, building) => sum + building.emptyFlats, 0),
    pendingComplaints: buildings.reduce((sum, building) =>
      sum + building.complaints.filter(c => c.status === 'Pending').length, 0
    ),
    inProgressComplaints: buildings.reduce((sum, building) =>
      sum + building.complaints.filter(c => c.status === 'In Progress').length, 0
    ),
    emergencyComplaints: buildings.reduce((sum, building) =>
      sum + building.complaints.filter(c => c.category === 'Emergency').length, 0
    ),
    resolvedComplaints: buildings.reduce((sum, building) =>
      sum + building.complaints.filter(c => c.status === 'Resolved').length, 0
    )
  }), [buildings]);

  // Memoized callbacks for navigation
  const createNavigateToComplaints = useCallback((buildingId) => () => {
    navigate(`/admin/building/${buildingId}/complaints`);
  }, [navigate]);

  const createNavigateToResidents = useCallback((buildingId) => () => {
    navigate(`/admin/building/${buildingId}/residents`);
  }, [navigate]);

  const createEditHandler = useCallback((building) => () => {
    onEditBuilding && onEditBuilding(building);
  }, [onEditBuilding]);

  const createDeleteHandler = useCallback((building) => () => {
    openDeleteModal(building);
  }, [openDeleteModal]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 flex items-center justify-center">
        <div className="text-center">
          <div className="relative inline-block">
            <div className="w-20 h-20 border-4 border-purple-500/20 border-t-purple-500 rounded-full animate-spin"></div>
            <div className="absolute inset-0 w-20 h-20 border-4 border-pink-500/20 border-t-pink-500 rounded-full animate-spin" style={{ animationDirection: 'reverse', animationDuration: '1.5s' }}></div>
          </div>
          <p className="mt-6 text-xl text-white font-medium">Loading buildings...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes blob {
          0%, 100% { transform: translate(0, 0) scale(1); }
          33% { transform: translate(30px, -50px) scale(1.1); }
          66% { transform: translate(-20px, 20px) scale(0.9); }
        }
        
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
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
        
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }
      `}</style>

      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-purple-950 to-slate-950 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob"></div>
          <div className="absolute top-0 -right-4 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-20 w-96 h-96 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-blob animation-delay-4000"></div>
        </div>

        <div className="relative max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
          {/* Header */}
          <div className="mb-8 sm:mb-12 animate-fadeIn">
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="space-y-2">
                <div className="flex items-center gap-3 mb-2">
                  <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30">
                    <Activity className="w-6 h-6 text-purple-400" />
                  </div>
                  <h1 className="text-4xl sm:text-5xl font-bold text-white tracking-tight">
                    Admin Dashboard
                  </h1>
                </div>
                <p className="text-gray-400 text-lg ml-14">
                  Manage buildings and monitor complaints
                </p>
              </div>

              <button
                className="group relative px-8 py-4 rounded-2xl bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold shadow-2xl shadow-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-purple-500/50 overflow-hidden"
                onClick={() => onEditBuilding && onEditBuilding(null)}
                style={{ willChange: 'transform' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" style={{ willChange: 'transform' }}></div>
                <div className="relative flex items-center gap-2">
                  <Plus className="w-5 h-5" />
                  <span>Add Building</span>
                </div>
              </button>
            </div>
          </div>

          {/* Stats Grid - Row 1 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6">
            <StatCard
              icon={Building2}
              label="Total Buildings"
              value={stats.totalBuildings}
              colorFrom="from-purple-500"
              colorTo="to-purple-600"
              delay={0}
            />
            <StatCard
              icon={Users}
              label="Total Residents"
              value={stats.totalResidents}
              colorFrom="from-blue-500"
              colorTo="to-cyan-500"
              delay={100}
            />
            <StatCard
              icon={DoorOpen}
              label="Total Empty Flats"
              value={stats.totalEmptyFlats}
              colorFrom="from-amber-500"
              colorTo="to-orange-500"
              delay={200}
            />
            <StatCard
              icon={Siren}
              label="Pending Complaints"
              value={stats.pendingComplaints}
              colorFrom="from-red-500"
              colorTo="to-pink-500"
              delay={300}
            />
          </div>

          {/* Stats Grid - Row 2 */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
            <StatCard
              icon={ClipboardList}
              label="In Progress Complaints"
              value={stats.inProgressComplaints}
              colorFrom="from-blue-500"
              colorTo="to-indigo-500"
              delay={400}
            />
            <StatCard
              icon={Flame}
              label="Emergency Complaints"
              value={stats.emergencyComplaints}
              colorFrom="from-red-600"
              colorTo="to-rose-600"
              delay={500}
            />
            <StatCard
              icon={CheckCircle}
              label="Resolved Complaints"
              value={stats.resolvedComplaints}
              colorFrom="from-green-500"
              colorTo="to-emerald-500"
              delay={600}
            />
          </div>

          {/* Buildings Table */}
          <div className="relative overflow-hidden rounded-3xl animate-fadeIn" style={{ animationDelay: '700ms', animationFillMode: 'backwards' }}>
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 to-slate-800/90 backdrop-blur-xl"></div>
            <div className="absolute inset-0 border border-white/10 rounded-3xl"></div>

            <div className="relative p-6 sm:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-3">
                  <div className="w-1 h-8 bg-gradient-to-b from-purple-500 to-pink-500 rounded-full"></div>
                  Building Management
                </h2>
              </div>

              {buildings.length === 0 ? (
                <div className="text-center py-16 sm:py-24">
                  <div className="inline-block p-6 rounded-2xl bg-gradient-to-br from-purple-500/10 to-pink-500/10 border border-purple-500/20 mb-6">
                    <Building2 className="w-16 h-16 text-purple-400" />
                  </div>
                  <p className="text-xl text-white font-medium mb-2">No buildings found</p>
                  <p className="text-gray-400">Add your first building to get started</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10">
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Building Name</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Total Flats</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Occupied</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Vacant</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Complaints</th>
                        <th className="text-left py-4 px-4 text-sm font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {buildings.map((building) => (
                        <BuildingRow
                          key={building._id}
                          building={building}
                          onNavigateComplaints={createNavigateToComplaints(building._id)}
                          onNavigateResidents={createNavigateToResidents(building._id)}
                          onEdit={createEditHandler(building)}
                          onDelete={createDeleteHandler(building)}
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>

        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteBuilding}
          title="Confirm Deletion"
        >
          <p>Are you sure you want to delete the building "{buildingToDelete?.buildingName}"?</p>
          <p className="text-sm text-error mt-2">This action cannot be undone.</p>
        </ConfirmationModal>
      </div>
    </>
  );
};

export default BuildingInfoCard;