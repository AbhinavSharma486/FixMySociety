import React, { useState, useEffect, useCallback, useRef, useMemo, memo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { Home, Building2, AlertTriangle, BarChart3, Users, MessageSquare, LoaderCircle, Radio, DoorOpen, Eye, Edit, Trash2, Menu, X } from 'lucide-react';
import toast from 'react-hot-toast';

import { useSocketContext } from '../../context/SocketContext';
import ComplaintManagement from "../components/ComplaintManagement.jsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard.jsx";
import BuildingModal from "../components/BuildingModal.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import BroadcastHistory from "../components/BroadcastHistory.jsx";
import { logoutAdmin } from '../../redux/admin/adminSlice';
import { createBuilding, updateBuilding, deleteBuilding } from '../../lib/buildingService';
import {
  getAdminAnalytics,
  getAllComplaintsAdmin,
  getAllBuildingsAdmin,
  broadcastAlert,
  getBuildingOptions,
  getAllBroadcasts,
  deleteBroadcastById,
} from '../../lib/adminService';

// Memoized StatCard component with enhanced mobile responsiveness
const StatCard = memo(({ icon: Icon, title, value, subtitle, gradient, delay = 0 }) => (
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
));
StatCard.displayName = 'StatCard';

// Memoized BuildingTableRow with improved mobile layout
const BuildingTableRow = memo(({ building, idx, buildings, navigate, openBuildingModal, openDeleteModal }) => {
  const findFull = useCallback(() => {
    if (!buildings || buildings.length === 0) return null;
    return buildings.find(b =>
      (b._id && b._id === building._id) ||
      (b.buildingName && b.buildingName === (building.buildingName || building.name)) ||
      (b.name && b.name === (building.buildingName || building.name))
    ) || null;
  }, [buildings, building._id, building.buildingName, building.name]);

  const full = useMemo(() => findFull(), [findFull]);
  const id = full?._id;

  return (
    <tr
      key={building._id || building.buildingName}
      className="border-b border-white/5 hover:bg-white/5 transition-colors"
      style={{ animation: `fadeInUp 0.5s ease-out ${idx * 0.1}s both` }}
    >
      <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
        <div className="font-medium text-white text-[11px] xs:text-xs sm:text-sm md:text-base break-words">{building.buildingName || building.name}</div>
      </td>
      <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-gray-300 text-[11px] xs:text-xs sm:text-sm md:text-base">{building.numberOfFlats || (building.totalFlats || 'N/A')}</td>
      <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
        <span className="px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-3 rounded-full text-[10px] xs:text-xs font-semibold bg-green-500/20 text-green-400 border border-green-500/30 whitespace-nowrap">
          {building.filledFlats || 0}
        </span>
      </td>
      <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
        <span className="px-1.5 py-0.5 xs:px-2 xs:py-1 sm:px-3 rounded-full text-[10px] xs:text-xs font-semibold bg-gray-500/20 text-gray-400 border border-gray-500/30 whitespace-nowrap">
          {building.emptyFlats || 0}
        </span>
      </td>
      <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
        <div className="flex flex-wrap gap-0.5 xs:gap-1">
          {typeof building.pendingCount === 'number' ? (
            <>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-red-500/20 text-red-400 whitespace-nowrap">{building.emergencyCount || 0} Em.</span>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-yellow-500/20 text-yellow-400 whitespace-nowrap">{building.pendingCount || 0} Pn.</span>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-blue-500/20 text-blue-400 whitespace-nowrap">{building.inProgressCount || 0} Pr.</span>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-green-500/20 text-green-400 whitespace-nowrap">{building.resolvedCount || 0} Rs.</span>
            </>
          ) : (building.complaints && building.complaints.length > 0 ? (
            <>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-red-500/20 text-red-400 whitespace-nowrap">{building.complaints.filter(c => c && c.category === 'Emergency').length} Em.</span>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-yellow-500/20 text-yellow-400 whitespace-nowrap">{building.complaints.filter(c => c && c.status === 'Pending').length} Pn.</span>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-blue-500/20 text-blue-400 whitespace-nowrap">{building.complaints.filter(c => c && c.status === 'In Progress').length} Pr.</span>
              <span className="px-1 py-0.5 xs:px-1.5 xs:py-0.5 sm:px-2 sm:py-1 rounded-md xs:rounded-lg text-[9px] xs:text-xs font-semibold bg-green-500/20 text-green-400 whitespace-nowrap">{building.complaints.filter(c => c && c.status === 'Resolved').length} Rs.</span>
            </>
          ) : (
            <span className="text-gray-500 text-[10px] xs:text-xs sm:text-sm">No complaints</span>
          ))}
        </div>
      </td>
      <td className="py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4">
        <div className="flex gap-0.5 xs:gap-1 sm:gap-2">
          <button
            className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => id ? navigate(`/admin/building/${id}/complaints`) : null}
            disabled={!id}
            title="View Complaints"
          >
            <Eye className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-blue-400" />
          </button>
          <button
            className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => id ? navigate(`/admin/building/${id}/residents`) : null}
            disabled={!id}
            title="View Residents"
          >
            <Users className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-green-400" />
          </button>
          <button
            className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => full ? openBuildingModal(full) : null}
            disabled={!full}
            title="Edit Building"
          >
            <Edit className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-yellow-400" />
          </button>
          <button
            className="p-1 xs:p-1.5 sm:p-2 rounded-md xs:rounded-lg hover:bg-white/10 transition-colors"
            onClick={() => full ? openDeleteModal(full) : null}
            disabled={!full}
            title="Delete Building"
          >
            <Trash2 className="w-3 h-3 xs:w-3.5 xs:h-3.5 sm:w-4 sm:h-4 text-red-400" />
          </button>
        </div>
      </td>
    </tr>
  );
});
BuildingTableRow.displayName = 'BuildingTableRow';

const AdminDashboard = () => {
  const { admin } = useSelector(state => state.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { socket } = useSocketContext();

  const [analytics, setAnalytics] = useState(null);
  const [complaints, setComplaints] = useState([]);
  const [buildings, setBuildings] = useState([]);
  const [broadcasts, setBroadcasts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [alertMessage, setAlertMessage] = useState('');
  const [alertSeverity, setAlertSeverity] = useState('info');
  const [targetBuilding, setTargetBuilding] = useState('');
  const [buildingOptions, setBuildingOptions] = useState([]);
  const [activeTab, setActiveTab] = useState('overview');
  const [showBuildingModal, setShowBuildingModal] = useState(false);
  const [editingBuilding, setEditingBuilding] = useState(null);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [buildingToDelete, setBuildingToDelete] = useState(null);
  const [isBroadcasting, setIsBroadcasting] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const listenersInitialized = useRef(false);
  const processedBroadcastsRef = useRef(new Set());
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  const handleClickOutside = useCallback((event) => {
    if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
      setShowDropdown(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [handleClickOutside]);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      const [analyticsData, complaintsData, buildingsData, buildingOptionsData, broadcastsData] = await Promise.all([
        getAdminAnalytics(),
        getAllComplaintsAdmin(),
        getAllBuildingsAdmin(),
        getBuildingOptions(),
        getAllBroadcasts(),
      ]);
      setAnalytics(analyticsData.stats);
      setComplaints(complaintsData.complaints);
      setBuildings(buildingsData.buildings);
      setBuildingOptions(buildingOptionsData.buildings);
      setBroadcasts(broadcastsData.broadcasts);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!admin) {
      navigate('/admin-login');
    } else {
      fetchDashboardData();
    }
  }, [admin, navigate, fetchDashboardData]);

  useEffect(() => {
    if (socket && !listenersInitialized.current) {
      listenersInitialized.current = true;

      const handleBroadcastCreated = (newBroadcast) => {
        if (!newBroadcast || !newBroadcast._id) return;
        if (processedBroadcastsRef.current.has(newBroadcast._id)) return;
        processedBroadcastsRef.current.add(newBroadcast._id);
        import('../../lib/toastManager').then(({ default: tm }) => tm.showSuccess(`broadcast:${newBroadcast._id}`, 'Broadcast created'));
        setBroadcasts(prev => [newBroadcast, ...prev]);
      };
      socket.on("broadcast:created", handleBroadcastCreated);

      const deletedBroadcasts = new Set();
      const handleBroadcastDeleted = ({ broadcastId }) => {
        if (!broadcastId) return;
        if (deletedBroadcasts.has(broadcastId)) return;
        deletedBroadcasts.add(broadcastId);
        processedBroadcastsRef.current.delete(broadcastId);
        import('../../lib/toastManager').then(({ default: tm }) => tm.showError(`broadcastDeleted:${broadcastId}`, 'Broadcast deleted'));
        setBroadcasts(prev => prev.filter(b => b._id !== broadcastId));
      };
      socket.on("broadcast:deleted", handleBroadcastDeleted);

      const handleNewComplaint = (newComplaint) => {
        if (!newComplaint || !newComplaint._id) return;
        setComplaints(prevComplaints => prevComplaints.some(c => c._id === newComplaint._id) ? prevComplaints : [newComplaint, ...prevComplaints]);
        import('../../lib/toastManager').then(({ default: tm }) => tm.showInfo(`complaint:${newComplaint._id}`, `New complaint registered — ${newComplaint.buildingName?.buildingName || newComplaint.buildingName}`));
      };
      socket.on("complaint:created", handleNewComplaint);

      const handleComplaintUpdate = ({ complaint: updatedComplaint }) => {
        toast.info(`Complaint "${updatedComplaint.title}" has been updated.`);
        setComplaints(prevComplaints =>
          prevComplaints.map(c => c._id === updatedComplaint._id ? updatedComplaint : c)
        );
        fetchDashboardData();
      };
      socket.on("complaint:updated", handleComplaintUpdate);

      const handleComplaintDelete = (payload) => {
        const complaintId = payload?.complaintId || payload?.complaintId?.complaintId || payload;
        setComplaints(prevComplaints => prevComplaints.filter(c => c._id !== complaintId));
        import('../../lib/toastManager').then(({ default: tm }) => tm.showInfo(`complaint_deleted:${complaintId}`, 'A complaint has been deleted'));
      };
      socket.on("complaint:deleted", handleComplaintDelete);

      const handleStatusUpdate = (updatedComplaint) => {
        toast.info(`Complaint "${updatedComplaint.title}" is now ${updatedComplaint.newStatus}`);
        setComplaints(prevComplaints =>
          prevComplaints.map(c =>
            c._id === updatedComplaint.complaintId ? { ...c, status: updatedComplaint.newStatus } : c
          )
        );
        fetchDashboardData();
      };
      socket.on("complaint:statusUpdated", handleStatusUpdate);

      const handleComplaintLikeUpdate = ({ complaintId, likes }) => {
        setComplaints(prevComplaints =>
          prevComplaints.map(c =>
            c._id === complaintId ? { ...c, likes: likes } : c
          )
        );
      };
      socket.on("like:toggled", handleComplaintLikeUpdate);

      const handleDashboardStatsUpdate = (updatedStats) => {
        setAnalytics(updatedStats);
        if (updatedStats && updatedStats.buildingPerformance && Array.isArray(updatedStats.buildingPerformance)) {
          setBuildings(prevBuildings => {
            const perfMap = new Map(updatedStats.buildingPerformance.map(b => [b._id, b]));
            if (!prevBuildings || prevBuildings.length === 0) {
              return updatedStats.buildingPerformance.map(perf => ({
                ...perf,
                _id: perf._id,
                buildingName: perf.buildingName,
                numberOfFlats: perf.totalFlats || 0,
                emptyFlats: Math.max(0, (perf.totalFlats || 0) - (perf.filledFlats || 0)),
                complaints: Array.from({ length: perf.complaintsCount || 0 }),
                residents: [],
              }));
            }
            return prevBuildings.map(b => {
              const perf = perfMap.get(b._id);
              if (perf) {
                return {
                  ...b,
                  buildingName: perf.buildingName,
                  numberOfFlats: perf.totalFlats,
                  filledFlats: perf.filledFlats,
                  emptyFlats: Math.max(0, perf.totalFlats - perf.filledFlats),
                  complaints: Array.from({ length: perf.complaintsCount || 0 }),
                  pendingCount: perf.pendingCount,
                  inProgressCount: perf.inProgressCount,
                  resolvedCount: perf.resolvedCount,
                  emergencyCount: perf.emergencyCount,
                };
              }
              return b;
            });
          });
        }
        import('../../lib/toastManager').then(({ default: tm }) => tm.showInfo('stats:update', 'Dashboard stats updated'));
      };
      socket.on("stats:updated", handleDashboardStatsUpdate);

      const handleReconnect = () => {
        toast.info("Real-time service reconnected. Refreshing Admin Dashboard data...");
        fetchDashboardData();
      };
      socket.on("reconnect", handleReconnect);

      const handleBuildingCreated = (newBuilding) => {
        import('../../lib/toastManager').then(({ default: tm }) => tm.showSuccess(`building:created:${newBuilding._id}`, `Building "${newBuilding.buildingName}" created successfully.`));
        setBuildings(prevBuildings => [newBuilding, ...prevBuildings]);
        fetchDashboardData();
      };
      socket.on("building:created", handleBuildingCreated);

      const handleBuildingUpdated = ({ building: updatedBuilding }) => {
        toast.info(`Building "${updatedBuilding.buildingName}" has been updated.`);
        setBuildings(prevBuildings =>
          prevBuildings.map(b => b._id === updatedBuilding._id ? updatedBuilding : b)
        );
        if (editingBuilding && editingBuilding._id === updatedBuilding._id) {
          setEditingBuilding(updatedBuilding);
        }
      };
      socket.on("building:updated", handleBuildingUpdated);

      const handleBuildingDeleted = ({ buildingId }) => {
        import('../../lib/toastManager').then(({ default: tm }) => tm.showError(`building:deleted:${buildingId}`, "A building has been deleted."));
        setBuildings(prevBuildings => prevBuildings.filter(b => b._id !== buildingId));
        fetchDashboardData();
      };
      socket.on("building:deleted", handleBuildingDeleted);

      return () => {
        socket.off("complaint:created", handleNewComplaint);
        socket.off("complaint:updated", handleComplaintUpdate);
        socket.off("complaint:deleted", handleComplaintDelete);
        socket.off("complaint:statusUpdated", handleStatusUpdate);
        socket.off("like:toggled", handleComplaintLikeUpdate);
        socket.off("stats:updated", handleDashboardStatsUpdate);
        socket.off("reconnect", handleReconnect);
        socket.off("building:created", handleBuildingCreated);
        socket.off("building:updated", handleBuildingUpdated);
        socket.off("building:deleted", handleBuildingDeleted);
        socket.off("broadcast:created", handleBroadcastCreated);
        socket.off("broadcast:deleted", handleBroadcastDeleted);
        listenersInitialized.current = false;
      };
    }
  }, [socket, fetchDashboardData, editingBuilding]);

  const handleBroadcastAlert = useCallback(async () => {
    if (isBroadcasting) return;

    if (!alertMessage.trim()) {
      return toast.error("Alert message cannot be empty.");
    }

    let buildingTarget = targetBuilding;
    if (targetBuilding === null || targetBuilding === undefined || targetBuilding === '') {
      buildingTarget = "all";
    }

    setIsBroadcasting(true);
    try {
      const res = await broadcastAlert(alertMessage, alertSeverity, buildingTarget);
      if (res && res.broadcast) {
        const newBroadcast = res.broadcast;
        if (!processedBroadcastsRef.current.has(newBroadcast._id)) {
          processedBroadcastsRef.current.add(newBroadcast._id);
          setBroadcasts(prev => [newBroadcast, ...prev]);
        }
      }
      setAlertMessage('');
      setAlertSeverity('info');
      setTargetBuilding('');
    } catch (error) {
      import('../../lib/toastManager').then(({ default: tm }) => tm.showError('broadcast:create:failed', 'Failed to broadcast alert.'));
      console.error("Error broadcasting alert:", error);
    } finally {
      setIsBroadcasting(false);
    }
  }, [isBroadcasting, alertMessage, targetBuilding, alertSeverity]);

  const handleDeleteBroadcast = useCallback(async (id) => {
    try {
      const res = await deleteBroadcastById(id);
      setBroadcasts(prev => prev.filter(b => b._id !== id));
      processedBroadcastsRef.current.delete(id);
      return res;
    } catch (error) {
      throw error;
    }
  }, []);

  const handleCreateBuilding = useCallback(async (buildingData) => {
    try {
      await createBuilding(buildingData);
      closeBuildingModal();
    } catch (error) {
      toast.error(error.message || 'Failed to create building');
    }
  }, []);

  const handleEditBuilding = useCallback(async (buildingData) => {
    try {
      await updateBuilding(editingBuilding._id, buildingData);
      toast.success('Building updated successfully');
      setEditingBuilding(null);
      closeBuildingModal();
    } catch (error) {
      toast.error(error.message || 'Failed to update building');
    }
  }, [editingBuilding]);

  const openBuildingModal = useCallback((building = null) => {
    setEditingBuilding(building);
    setShowBuildingModal(true);
  }, []);

  const closeBuildingModal = useCallback(() => {
    setShowBuildingModal(false);
    setEditingBuilding(null);
  }, []);

  const openDeleteModal = useCallback((building = null) => {
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
      setBuildings(prev => prev.filter(b => (b._id || b.buildingName) !== (buildingToDelete._id || buildingToDelete.buildingName)));
      fetchDashboardData();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete building');
    } finally {
      closeDeleteModal();
    }
  }, [buildingToDelete, closeDeleteModal, fetchDashboardData]);

  const tabs = useMemo(() => [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'buildings', label: 'Buildings', icon: Building2 },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ], []);

  const sourceBuildings = useMemo(() => {
    if (activeTab !== 'buildings') return [];

    return (analytics && analytics.buildingPerformance && analytics.buildingPerformance.length > 0)
      ? analytics.buildingPerformance.map(b => ({
        _id: b._id || b.buildingId || null,
        buildingName: b.buildingName,
        numberOfFlats: b.totalFlats || b.totalFlats || 0,
        filledFlats: b.filledFlats || 0,
        emptyFlats: Math.max(0, (b.totalFlats || 0) - (b.filledFlats || 0)),
        complaintsCount: b.complaintsCount || b.complaints || 0,
        complaints: Array.from({ length: b.complaintsCount || b.complaints || 0 }),
        pendingCount: b.pendingCount || 0,
        inProgressCount: b.inProgressCount || 0,
        resolvedCount: b.resolvedCount || 0,
        emergencyCount: b.emergencyCount || 0,
      }))
      : buildings;
  }, [activeTab, analytics, buildings]);

  const renderTabContent = useCallback(() => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
              <StatCard
                icon={MessageSquare}
                title="Total Complaints"
                value={analytics?.overview.totalComplaints || 0}
                subtitle={`${analytics?.overview.pendingComplaints || 0} Pending, ${analytics?.overview.inProgressComplaints || 0} In Progress`}
                gradient={['#60A5FA', '#3B82F6']}
                delay={0}
              />
              <StatCard
                icon={Building2}
                title="Total Buildings"
                value={analytics?.overview.totalBuildings || 0}
                subtitle="Managing all societies"
                gradient={['#34D399', '#10B981']}
                delay={0.1}
              />
              <StatCard
                icon={Users}
                title="Total Residents"
                value={analytics?.overview.totalUsers || 0}
                subtitle="Across all buildings"
                gradient={['#F472B6', '#EC4899']}
                delay={0.2}
              />
            </div>

            <div
              className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl transition-all duration-500"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.3s both',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="absolute inset-0 opacity-20">
                <div className="absolute top-0 left-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-blue-500 rounded-full blur-3xl animate-pulse" style={{ willChange: 'opacity' }} />
                <div className="absolute bottom-0 right-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-purple-500 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', willChange: 'opacity' }} />
              </div>

              <div className="relative p-3 xs:p-4 sm:p-6 md:p-8">
                <div className="flex items-center gap-2 xs:gap-2 sm:gap-3 mb-3 xs:mb-4 sm:mb-6">
                  <div className="p-1.5 xs:p-2 sm:p-3 rounded-lg xs:rounded-xl sm:rounded-2xl bg-gradient-to-br from-blue-500/20 to-purple-500/20 border border-blue-500/30">
                    <Radio className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-blue-400" />
                  </div>
                  <h2 className="text-base xs:text-lg sm:text-xl md:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Broadcast Global Alert
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 xs:gap-4 sm:gap-5 md:gap-6 mb-3 xs:mb-4 sm:mb-6">
                  <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                    <label className="block text-xs xs:text-xs sm:text-sm font-medium text-gray-300">Message</label>
                    <textarea
                      className="w-full px-2.5 py-2 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-lg xs:rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white text-xs xs:text-sm sm:text-base placeholder-gray-500 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                      rows="3"
                      value={alertMessage}
                      onChange={(e) => setAlertMessage(e.target.value)}
                      placeholder="Enter your alert message here..."
                    />
                  </div>

                  <div className="space-y-2 xs:space-y-3 sm:space-y-4">
                    <label className="block text-xs xs:text-xs sm:text-sm font-medium text-gray-300">Severity</label>
                    <select
                      className="w-full px-2.5 py-2 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-lg xs:rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white text-xs xs:text-sm sm:text-base focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={alertSeverity}
                      onChange={(e) => setAlertSeverity(e.target.value)}
                    >
                      <option value="info" className="bg-gray-900">Info</option>
                      <option value="warning" className="bg-gray-900">Warning</option>
                      <option value="emergency" className="bg-gray-900">Emergency</option>
                    </select>

                    <label className="block text-xs xs:text-xs sm:text-sm font-medium text-gray-300 mt-2 xs:mt-3 sm:mt-4">Target Building</label>
                    <select
                      className="w-full px-2.5 py-2 xs:px-3 xs:py-2 sm:px-4 sm:py-3 rounded-lg xs:rounded-xl sm:rounded-2xl bg-white/5 border border-white/10 text-white text-xs xs:text-sm sm:text-base focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all"
                      value={targetBuilding}
                      onChange={(e) => setTargetBuilding(e.target.value)}
                    >
                      <option value="" className="bg-gray-900">All Buildings</option>
                      {buildingOptions.map(b => (
                        <option key={b._id} value={b.name} className="bg-gray-900">
                          {b.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  onClick={handleBroadcastAlert}
                  disabled={isBroadcasting}
                  className="group relative w-full px-4 py-2.5 xs:px-5 xs:py-3 sm:px-8 sm:py-4 rounded-lg xs:rounded-xl sm:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed"
                  style={{
                    background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                    boxShadow: '0 10px 40px rgba(59, 130, 246, 0.3)',
                    willChange: 'transform'
                  }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" style={{ willChange: 'opacity' }} />
                  <div className="relative flex items-center gap-2 xs:gap-2 sm:gap-3 justify-center">
                    {isBroadcasting ? (
                      <>
                        <LoaderCircle className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 animate-spin" />
                        <span className="font-semibold text-xs xs:text-sm sm:text-base">Broadcasting...</span>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5" />
                        <span className="font-semibold text-xs xs:text-sm sm:text-base">Broadcast Alert</span>
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>

            <div className="lg:col-span-3">
              <BroadcastHistory broadcasts={broadcasts} deleteBroadcast={handleDeleteBroadcast} />
            </div>
          </div>
        );

      case 'buildings':
        return (
          <div className="space-y-4 xs:space-y-5 sm:space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
              <StatCard
                icon={Building2}
                title="Total Buildings"
                value={analytics?.overview.totalBuildings || (sourceBuildings ? sourceBuildings.length : 0)}
                subtitle="Active properties"
                gradient={['#3B82F6', '#1D4ED8']}
                delay={0}
              />
              <StatCard
                icon={Users}
                title="Total Residents"
                value={analytics?.overview.totalUsers || 0}
                subtitle="Registered users"
                gradient={['#10B981', '#059669']}
                delay={0.1}
              />
              <StatCard
                icon={DoorOpen}
                title="Empty Flats"
                value={analytics?.overview.totalFlats ? Math.max(0, analytics.overview.totalFlats - analytics.overview.totalUsers) : 0}
                subtitle="Available units"
                gradient={['#F59E0B', '#D97706']}
                delay={0.2}
              />
            </div>

            <div
              className="relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
              style={{
                animation: 'fadeInUp 0.8s ease-out 0.3s both',
                background: 'rgba(255, 255, 255, 0.03)',
                backdropFilter: 'blur(20px)',
                border: '1px solid rgba(255, 255, 255, 0.08)'
              }}
            >
              <div className="p-3 xs:p-4 sm:p-5 md:p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 xs:gap-3 sm:gap-4 mb-3 xs:mb-4 sm:mb-6">
                  <h2 className="text-lg xs:text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                    Building Management
                  </h2>
                  <button
                    onClick={() => openBuildingModal()}
                    className="group relative w-full sm:w-auto px-4 py-2 xs:px-5 xs:py-2.5 sm:px-6 sm:py-3 rounded-lg xs:rounded-lg sm:rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02]"
                    style={{
                      background: 'linear-gradient(135deg, #3B82F6, #8B5CF6)',
                      boxShadow: '0 5px 20px rgba(59, 130, 246, 0.3)',
                      willChange: 'transform'
                    }}
                  >
                    <span className="relative font-semibold text-white text-xs xs:text-sm sm:text-base">Add Building</span>
                  </button>
                </div>

                {(!sourceBuildings || sourceBuildings.length === 0) ? (
                  <div className="text-center py-8 xs:py-12 sm:py-16">
                    <Building2 className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 mx-auto text-gray-600 mb-2 xs:mb-3 sm:mb-4" />
                    <p className="text-sm xs:text-base sm:text-lg text-gray-400">No buildings found</p>
                    <p className="text-xs xs:text-sm sm:text-base text-gray-500">Add your first building to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto -mx-3 xs:-mx-4 sm:mx-0">
                    <div className="inline-block min-w-full align-middle px-3 xs:px-4 sm:px-0">
                      <div className="overflow-hidden">
                        <table className="min-w-full">
                          <thead>
                            <tr className="border-b border-white/10">
                              <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Building</th>
                              <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Flats</th>
                              <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Occupied</th>
                              <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Vacant</th>
                              <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Complaints</th>
                              <th className="text-left py-2 px-1.5 xs:py-3 xs:px-2 sm:py-4 sm:px-3 md:px-4 text-[10px] xs:text-xs sm:text-sm font-semibold text-gray-400 whitespace-nowrap">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            {sourceBuildings.map((building, idx) => (
                              <BuildingTableRow
                                key={building._id || building.buildingName}
                                building={building}
                                idx={idx}
                                buildings={buildings}
                                navigate={navigate}
                                openBuildingModal={openBuildingModal}
                                openDeleteModal={openDeleteModal}
                              />
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 'complaints':
        return <ComplaintManagement complaints={complaints} buildings={buildings} analytics={analytics} onStatusChange={fetchDashboardData} />;
      case 'analytics':
        return <AnalyticsDashboard analytics={analytics} />;
      default:
        return null;
    }
  }, [activeTab, analytics, alertMessage, alertSeverity, targetBuilding, buildingOptions, isBroadcasting, broadcasts, handleBroadcastAlert, handleDeleteBroadcast, sourceBuildings, openBuildingModal, buildings, navigate, openDeleteModal, complaints, fetchDashboardData]);

  const handleLogout = useCallback(() => {
    dispatch(logoutAdmin());
    navigate('/admin-login');
  }, [dispatch, navigate]);

  const tabButtons = useMemo(() => tabs.map((tab, idx) => {
    const Icon = tab.icon;
    const isActive = activeTab === tab.id;
    return (
      <button
        key={tab.id}
        onClick={() => {
          setActiveTab(tab.id);
          setIsMobileMenuOpen(false);
        }}
        className={`relative flex items-center gap-1.5 xs:gap-2 sm:gap-3 px-3 py-2 xs:px-4 xs:py-3 sm:px-6 sm:py-4 rounded-lg xs:rounded-xl sm:rounded-2xl font-medium transition-all duration-300 whitespace-nowrap text-xs xs:text-sm sm:text-base ${isActive ? 'text-white' : 'text-gray-400 hover:text-white'
          }`}
        style={{
          animation: `fadeIn 0.5s ease-out ${idx * 0.1}s both`
        }}
      >
        {isActive && (
          <div
            className="absolute inset-0 rounded-lg xs:rounded-xl sm:rounded-2xl"
            style={{
              background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(139, 92, 246, 0.3))',
              boxShadow: '0 8px 32px rgba(59, 130, 246, 0.3)',
              willChange: 'opacity'
            }}
          />
        )}
        <Icon className={`w-3.5 h-3.5 xs:w-4 xs:h-4 sm:w-5 sm:h-5 relative z-10 flex-shrink-0 ${isActive ? 'animate-pulse' : ''}`} />
        <span className="relative z-10">{tab.label}</span>
      </button>
    );
  }), [tabs, activeTab]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 px-3 xs:px-4">
        <LoaderCircle className="animate-spin w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 text-blue-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 px-3 xs:px-4">
        <div className="text-center text-red-400 p-4 xs:p-6 sm:p-8 rounded-xl xs:rounded-2xl sm:rounded-3xl bg-white/5 backdrop-blur-xl border border-white/10 max-w-md w-full mx-3">
          <AlertTriangle className="w-10 h-10 xs:w-12 xs:h-12 sm:w-16 sm:h-16 mx-auto mb-2 xs:mb-3 sm:mb-4" />
          <p className="text-base xs:text-lg sm:text-xl break-words">Error: {error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-purple-900 p-2 xs:p-3 sm:p-4 md:p-6 lg:p-8 relative overflow-hidden pt-14 xs:pt-16 sm:pt-18 lg:pt-20 xl:pt-24">
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-pulse" style={{ willChange: 'opacity' }} />
        <div className="absolute bottom-1/4 right-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', willChange: 'opacity' }} />
        <div className="absolute top-1/2 left-1/2 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', willChange: 'opacity' }} />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto">
        <div className="mb-4 xs:mb-5 sm:mb-6 md:mb-8" style={{ animation: 'fadeInDown 0.6s ease-out' }}>
          <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-1 xs:mb-2">
            <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              Admin Dashboard
            </span>
          </h1>
          <p className="text-gray-400 text-xs xs:text-sm sm:text-base md:text-lg">Next-generation management system</p>
        </div>

        {/* Mobile Menu Toggle */}
        <div className="lg:hidden mb-4 xs:mb-5 sm:mb-6">
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg xs:rounded-xl bg-white/5 backdrop-blur-xl border border-white/10 text-white"
            style={{ animation: 'fadeInUp 0.6s ease-out 0.2s both' }}
          >
            <span className="text-sm xs:text-base font-medium">
              {tabs.find(t => t.id === activeTab)?.label || 'Menu'}
            </span>
            {isMobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Desktop Tab Navigation */}
        <div
          className="hidden lg:block mb-6 sm:mb-8 relative overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl"
          style={{
            animation: 'fadeInUp 0.6s ease-out 0.2s both',
            background: 'rgba(255, 255, 255, 0.05)',
            backdropFilter: 'blur(20px)',
            border: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div className="flex overflow-x-auto p-1.5 xs:p-2 gap-1.5 xs:gap-2 scrollbar-hide">
            {tabButtons}
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {isMobileMenuOpen && (
          <div
            className="lg:hidden mb-4 xs:mb-5 sm:mb-6 relative overflow-hidden rounded-lg xs:rounded-xl sm:rounded-2xl"
            style={{
              animation: 'fadeInUp 0.3s ease-out',
              background: 'rgba(255, 255, 255, 0.05)',
              backdropFilter: 'blur(20px)',
              border: '1px solid rgba(255, 255, 255, 0.1)'
            }}
          >
            <div className="flex flex-col p-2 gap-2">
              {tabButtons}
            </div>
          </div>
        )}

        {renderTabContent()}
      </div>

      {showBuildingModal && (
        <BuildingModal
          isOpen={showBuildingModal}
          onClose={closeBuildingModal}
          building={editingBuilding}
          mode={editingBuilding ? 'edit' : 'create'}
          onSubmit={editingBuilding ? handleEditBuilding : handleCreateBuilding}
        />
      )}

      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteBuilding}
          title={`Confirm Deletion`}
          message={`Are you sure you want to delete the building "${buildingToDelete?.buildingName || buildingToDelete?.name}"? This action cannot be undone.`}
        />
      )}

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

        @keyframes fadeInDown {
          from {
            opacity: 0;
            transform: translateY(-30px) translateZ(0);
          }
          to {
            opacity: 1;
            transform: translateY(0) translateZ(0);
          }
        }

        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }

        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .line-clamp-2 {
          display: -webkit-box;
          -webkit-line-clamp: 2;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        @media (min-width: 320px) {
          .xs\:text-xs { font-size: 0.75rem; line-height: 1rem; }
          .xs\:text-sm { font-size: 0.875rem; line-height: 1.25rem; }
          .xs\:text-base { font-size: 1rem; line-height: 1.5rem; }
          .xs\:text-lg { font-size: 1.125rem; line-height: 1.75rem; }
          .xs\:text-xl { font-size: 1.25rem; line-height: 1.75rem; }
          .xs\:text-2xl { font-size: 1.5rem; line-height: 2rem; }
          .xs\:text-3xl { font-size: 1.875rem; line-height: 2.25rem; }
        }
      `}</style>
    </div>
  );
};

export default AdminDashboard;