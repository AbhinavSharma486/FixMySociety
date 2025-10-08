import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux'; // Add useDispatch
import { useNavigate, Link } from 'react-router-dom'; // Add Link
import { Home, Building2, AlertTriangle, BarChart3, Users, MessageSquare, LoaderCircle, Radio, DoorOpen, Eye, Edit, Trash2, User, LogOut } from 'lucide-react'; // Add User, LogOut icons
import {
  getAdminAnalytics,
  getAllComplaintsAdmin,
  getAllBuildingsAdmin,
  broadcastAlert,
  getBuildingOptions,
  getAllBroadcasts,
  deleteBroadcastById,
} from '../../lib/adminService';
import toast from 'react-hot-toast';
import { useSocketContext } from '../../context/SocketContext';
import BuildingInfoCard from "../components/BuildingInfoCard.jsx";
import ComplaintManagement from "../components/ComplaintManagement.jsx";
import AnalyticsDashboard from "../components/AnalyticsDashboard.jsx";
import BuildingModal from "../components/BuildingModal.jsx";
import ConfirmationModal from "../components/ConfirmationModal.jsx";
import BroadcastHistory from "../components/BroadcastHistory.jsx";
import { createBuilding, updateBuilding, deleteBuilding } from '../../lib/buildingService';
import { logoutAdmin } from '../../redux/admin/adminSlice'; // Corrected import path

const AdminDashboard = () => {
  const { admin } = useSelector(state => state.admin);
  const navigate = useNavigate();
  const dispatch = useDispatch(); // Initialize useDispatch
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
  const listenersInitialized = React.useRef(false);
  const processedBroadcastsRef = useRef(new Set());
  const [showDropdown, setShowDropdown] = useState(false); // New state for dropdown
  const dropdownRef = useRef(null); // New ref for dropdown

  // Handle click outside dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [dropdownRef]);

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
  }, [setComplaints, setAnalytics, setBuildings, setBuildingOptions, setBroadcasts]);

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
        // Use centralized toast manager to dedupe (consistent message)
        import('../../lib/toastManager').then(({ default: tm }) => tm.showSuccess(`broadcast:${newBroadcast._id}`, 'Broadcast created'));
        setBroadcasts(prev => [newBroadcast, ...prev]);
      };
      socket.on("broadcast:created", handleBroadcastCreated);

      // Deduplicate broadcast deleted events
      const deletedBroadcasts = new Set();
      const handleBroadcastDeleted = ({ broadcastId }) => {
        if (!broadcastId) return;
        if (deletedBroadcasts.has(broadcastId)) return;
        deletedBroadcasts.add(broadcastId);
        // remove from processed set as well
        processedBroadcastsRef.current.delete(broadcastId);
        import('../../lib/toastManager').then(({ default: tm }) => tm.showError(`broadcastDeleted:${broadcastId}`, 'Broadcast deleted'));
        setBroadcasts(prev => prev.filter(b => b._id !== broadcastId));
      };
      socket.on("broadcast:deleted", handleBroadcastDeleted);

      const handleNewComplaint = (newComplaint) => {
        if (!newComplaint || !newComplaint._id) return;
        setComplaints(prevComplaints => prevComplaints.some(c => c._id === newComplaint._id) ? prevComplaints : [newComplaint, ...prevComplaints]);
        // Minimal toast per requirement
        import('../../lib/toastManager').then(({ default: tm }) => tm.showInfo(`complaint:${newComplaint._id}`, `New complaint registered — ${newComplaint.buildingName?.buildingName || newComplaint.buildingName}`));
        // stats:updated event will refresh analytics, making a full refetch redundant.
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
        // Update complaints list and rely on stats:updated to refresh analytics and building aggregates
        setComplaints(prevComplaints => prevComplaints.filter(c => c._id !== complaintId));
        // Avoid noisy toast; show minimal info if desired
        import('../../lib/toastManager').then(({ default: tm }) => tm.showInfo(`complaint_deleted:${complaintId}`, 'A complaint has been deleted'));
        // stats:updated event will refresh analytics, making a full refetch redundant.
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

      // Listen for complaint likes/unlikes
      const handleComplaintLikeUpdate = ({ complaintId, likes }) => {
        // Admin view only needs to update the likes count
        setComplaints(prevComplaints =>
          prevComplaints.map(c =>
            c._id === complaintId ? { ...c, likes: likes } : c
          )
        );
        // No need to fetchDashboardData for just a like count, as analytics don't track total likes
      };
      socket.on("like:toggled", handleComplaintLikeUpdate);

      const handleDashboardStatsUpdate = (updatedStats) => {
        // Update analytics immediately from pushed stats
        setAnalytics(updatedStats);
        // Merge buildingPerformance into local buildings state so BuildingInfoCard updates counts in real-time
        if (updatedStats && updatedStats.buildingPerformance && Array.isArray(updatedStats.buildingPerformance)) {
          setBuildings(prevBuildings => {
            const perfMap = new Map(updatedStats.buildingPerformance.map(b => [b._id, b]));
            // If we have no previous buildings, create a buildings list from perf data
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
                // Return a fully updated building object from performance data
                return {
                  ...b, // retain fields not in perf data like residents
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

      // Listen for socket reconnection to trigger a full data re-fetch
      const handleReconnect = () => {
        toast.info("Real-time service reconnected. Refreshing Admin Dashboard data...");
        fetchDashboardData();
      };
      socket.on("reconnect", handleReconnect);

      // Listen for building events
      const handleBuildingCreated = (newBuilding) => {
        // Use toast manager for deduplicated, consistent toast message
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
        // Also update the building if it is currently being edited
        if (editingBuilding && editingBuilding._id === updatedBuilding._id) {
          setEditingBuilding(updatedBuilding);
        }
      };
      socket.on("building:updated", handleBuildingUpdated);

      const handleBuildingDeleted = ({ buildingId }) => {
        // Use toast manager for deduplicated, consistent toast message
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
        listenersInitialized.current = false; // Reset on cleanup
      };
    }
  }, [socket, fetchDashboardData]);

  const handleBroadcastAlert = async () => {
    if (isBroadcasting) return;

    if (!alertMessage.trim()) {
      return toast.error("Alert message cannot be empty.");
    }

    let buildingTarget = targetBuilding;
    if (targetBuilding === null || targetBuilding === undefined || targetBuilding === '') {
      buildingTarget = "all"; // Send "all" to backend if targetBuilding is empty or not set
    }

    setIsBroadcasting(true);
    try {
      const res = await broadcastAlert(alertMessage, alertSeverity, buildingTarget); // REST API call to trigger server-side broadcast
      // If server returned populated broadcast, add immediately to UI (no refresh)
      if (res && res.broadcast) {
        const newBroadcast = res.broadcast;
        // prevent duplicate handling if socket also emits
        if (!processedBroadcastsRef.current.has(newBroadcast._id)) {
          processedBroadcastsRef.current.add(newBroadcast._id);
          setBroadcasts(prev => [newBroadcast, ...prev]);
        }
      }
      setAlertMessage('');
      setAlertSeverity('info'); // Reset severity to default
      setTargetBuilding(''); // Reset target building to default (or 'all' if that's the intended default display)
    } catch (error) {
      import('../../lib/toastManager').then(({ default: tm }) => tm.showError('broadcast:create:failed', 'Failed to broadcast alert.'));
      console.error("Error broadcasting alert:", error);
    } finally {
      setIsBroadcasting(false);
    }
  };

  // Handle delete called from BroadcastHistory; perform API delete and update local state immediately
  const handleDeleteBroadcast = async (id) => {
    try {
      const res = await deleteBroadcastById(id);
      // Immediately remove from local state so admin sees real-time update
      setBroadcasts(prev => prev.filter(b => b._id !== id));
      // Also remove from processed set to keep dedupe consistent
      processedBroadcastsRef.current.delete(id);
      return res;
    } catch (error) {
      // rethrow so caller (BroadcastHistory) can show toast
      throw error;
    }
  };

  // Building Modal Handlers - Re-added
  const handleCreateBuilding = async (buildingData) => {
    try {
      await createBuilding(buildingData);
      // Toast is now handled by the socket event handler to prevent duplicates
      closeBuildingModal();
    } catch (error) {
      toast.error(error.message || 'Failed to create building');
    }
  };

  const handleEditBuilding = async (buildingData) => {
    try {
      await updateBuilding(editingBuilding._id, buildingData);
      toast.success('Building updated successfully');
      setEditingBuilding(null);
      closeBuildingModal();
    } catch (error) {
      toast.error(error.message || 'Failed to update building');
    }
  };

  const openBuildingModal = (building = null) => {
    setEditingBuilding(building);
    setShowBuildingModal(true);
  };

  const closeBuildingModal = () => {
    setShowBuildingModal(false);
    setEditingBuilding(null);
  };

  const openDeleteModal = (building = null) => {
    setBuildingToDelete(building);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setBuildingToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteBuilding = async () => {
    if (!buildingToDelete) return;
    try {
      await deleteBuilding(buildingToDelete._id);
      // Toast is now handled by the socket event handler to prevent duplicates
      // Update local state immediately
      setBuildings(prev => prev.filter(b => (b._id || b.buildingName) !== (buildingToDelete._id || buildingToDelete.buildingName)));
      // Also refresh analytics/data
      fetchDashboardData();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete building');
    } finally {
      closeDeleteModal();
    }
  };

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Home },
    { id: 'buildings', label: 'Buildings', icon: Building2 },
    { id: 'complaints', label: 'Complaints', icon: AlertTriangle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'overview':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {/* Analytics Overview Cards */}
            <div className="stat bg-base-100 shadow-lg rounded-lg">
              <div className="stat-figure text-primary">
                <MessageSquare className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Complaints</div>
              <div className="stat-value text-primary">{analytics?.overview.totalComplaints || 0}</div>
              <div className="stat-desc">
                {analytics?.overview.pendingComplaints || 0} Pending, {analytics?.overview.inProgressComplaints || 0} In Progress
              </div>
            </div>

            <div className="stat bg-base-100 shadow-lg rounded-lg">
              <div className="stat-figure text-info">
                <Building2 className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Buildings</div>
              <div className="stat-value text-info">{analytics?.overview.totalBuildings || 0}</div>
              <div className="stat-desc">Managing all societies</div>
            </div>

            <div className="stat bg-base-100 shadow-lg rounded-lg">
              <div className="stat-figure text-secondary">
                <Users className="w-8 h-8" />
              </div>
              <div className="stat-title">Total Residents</div>
              <div className="stat-value text-secondary">{analytics?.overview.totalUsers || 0}</div>
              <div className="stat-desc">Across all buildings</div>
            </div>

            {/* Global Alert Broadcast Section */}
            <div className="lg:col-span-3 bg-base-100 shadow-lg rounded-lg p-6">
              <h2 className="text-2xl font-bold mb-4">Broadcast Global Alert</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label htmlFor="alertMessage" className="label">
                    <span className="label-text">Message</span>
                  </label>
                  <textarea
                    id="alertMessage"
                    className="textarea textarea-bordered w-full"
                    rows="3"
                    value={alertMessage}
                    onChange={(e) => setAlertMessage(e.target.value)}
                    placeholder="Enter your alert message here..."
                    required
                  ></textarea>
                </div>
                <div>
                  <label htmlFor="alertSeverity" className="label">
                    <span className="label-text">Severity</span>
                  </label>
                  <select
                    id="alertSeverity"
                    className="select select-bordered w-full"
                    value={alertSeverity}
                    onChange={(e) => setAlertSeverity(e.target.value)}
                  >
                    <option value="info">Info</option>
                    <option value="warning">Warning</option>
                    <option value="emergency">Emergency</option>
                  </select>
                  <label htmlFor="targetBuilding" className="label mt-4">
                    <span className="label-text">Target Building</span>
                  </label>
                  <select
                    id="targetBuilding"
                    className="select select-bordered w-full"
                    value={targetBuilding}
                    onChange={(e) => setTargetBuilding(e.target.value)}
                  >
                    <option value="">All Buildings</option> {/* Value is empty string for "All Buildings" */}
                    {buildingOptions.map(b => (
                      <option key={b._id} value={b.name}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <button
                onClick={handleBroadcastAlert}
                className="btn btn-primary gap-2"
                disabled={isBroadcasting}
              >
                <AlertTriangle className="w-5 h-5" />
                {isBroadcasting ? "Broadcasting..." : "Broadcast Alert"}
              </button>
            </div>

            {/* Broadcast History Section */}
            <div className="lg:col-span-3">
              <BroadcastHistory broadcasts={broadcasts} deleteBroadcast={handleDeleteBroadcast} />
            </div>
          </div>
        );
      case 'buildings':
        {
          // Prefer server-calculated buildingPerformance from analytics for real-time aggregates
          const sourceBuildings = (analytics && analytics.buildingPerformance && analytics.buildingPerformance.length > 0)
            ? analytics.buildingPerformance.map(b => ({
              _id: b._id || b.buildingId || null,
              buildingName: b.buildingName,
              numberOfFlats: b.totalFlats || b.totalFlats || 0,
              filledFlats: b.filledFlats || 0,
              emptyFlats: Math.max(0, (b.totalFlats || 0) - (b.filledFlats || 0)),
              // support both names: complaintsCount or complaints
              complaintsCount: b.complaintsCount || b.complaints || 0,
              complaints: Array.from({ length: b.complaintsCount || b.complaints || 0 }),
              pendingCount: b.pendingCount || 0,
              inProgressCount: b.inProgressCount || 0,
              resolvedCount: b.resolvedCount || 0,
              emergencyCount: b.emergencyCount || 0,
            }))
            : buildings;

          return (
            <div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                  <div className="stat-figure text-primary">
                    <Building2 className="w-8 h-8" />
                  </div>
                  <div className="stat-title">Total Buildings</div>
                  <div className="stat-value text-primary">{analytics?.overview.totalBuildings || (sourceBuildings ? sourceBuildings.length : 0)}</div>
                </div>
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                  <div className="stat-figure text-info">
                    <Users className="w-8 h-8" />
                  </div>
                  <div className="stat-title">Total Residents</div>
                  <div className="stat-value text-info">{analytics?.overview.totalUsers || 0}</div>
                </div>
                <div className="stat bg-base-100 shadow-lg rounded-lg">
                  <div className="stat-figure text-accent">
                    <DoorOpen className="w-8 h-8" />
                  </div>
                  <div className="stat-title">Total Empty Flats</div>
                  <div className="stat-value text-accent">{analytics?.overview.totalFlats ? Math.max(0, analytics.overview.totalFlats - analytics.overview.totalUsers) : 0}</div>
                </div>
              </div>

              <div className="bg-base-100 rounded-lg shadow-lg p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-2xl font-bold">Building Management</h2>
                  <button className="btn btn-primary" onClick={() => openBuildingModal()}>
                    Add Building
                  </button>
                </div>
                {(!sourceBuildings || sourceBuildings.length === 0) ? (
                  <div className="text-center py-12">
                    <Building2 className="w-16 h-16 mx-auto text-base-content/30 mb-4" />
                    <p className="text-lg text-base-content/70">No buildings found</p>
                    <p className="text-base-content/50">Add your first building to get started</p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="table table-zebra w-full">
                      <thead>
                        <tr>
                          <th>Building Name</th>
                          <th>Total Flats</th>
                          <th>Occupied</th>
                          <th>Vacant</th>
                          <th>Complaints</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sourceBuildings.map((building) => (
                          <tr key={building._id || building.buildingName}>
                            <td>
                              <div className="font-medium">{building.buildingName || building.name}</div>
                            </td>
                            <td>{building.numberOfFlats || (building.totalFlats || 'N/A')}</td>
                            <td><span className="badge badge-success badge-sm">{building.filledFlats || 0}</span></td>
                            <td><span className="badge badge-neutral badge-sm">{building.emptyFlats || 0}</span></td>
                            <td>
                              <div className="flex gap-1">
                                {typeof building.pendingCount === 'number' ? (
                                  <>
                                    <span className="badge badge-error badge-sm">{building.emergencyCount || 0} Emergency</span>
                                    <span className="badge badge-warning badge-sm">{building.pendingCount || 0} Pending</span>
                                    <span className="badge badge-info badge-sm">{building.inProgressCount || 0} In Progress</span>
                                    <span className="badge badge-success badge-sm">{building.resolvedCount || 0} Resolved</span>
                                  </>
                                ) : (building.complaints && building.complaints.length > 0 ? (
                                  <>
                                    <span className="badge badge-error badge-sm">{building.complaints.filter(c => c && c.category === 'Emergency').length} Emergency</span>
                                    <span className="badge badge-warning badge-sm">{building.complaints.filter(c => c && c.status === 'Pending').length} Pending</span>
                                    <span className="badge badge-info badge-sm">{building.complaints.filter(c => c && c.status === 'In Progress').length} In Progress</span>
                                    <span className="badge badge-success badge-sm">{building.complaints.filter(c => c && c.status === 'Resolved').length} Resolved</span>
                                  </>
                                ) : (
                                  <span className="text-base-content/50 text-sm">No complaints</span>
                                ))}
                              </div>
                            </td>
                            <td>
                              <div className="flex gap-2">
                                {(() => {
                                  const findFull = () => {
                                    if (!buildings || buildings.length === 0) return null;
                                    return buildings.find(b => (b._id && b._id === building._id) || (b.buildingName && b.buildingName === (building.buildingName || building.name)) || (b.name && b.name === (building.buildingName || building.name))) || null;
                                  };
                                  const full = findFull();
                                  const id = full?._id;
                                  return (
                                    <>
                                      <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => id ? navigate(`/admin/building/${id}/complaints`) : null}
                                        disabled={!id}
                                        title="View Complaints"
                                      >
                                        <Eye className="w-4 h-4" />
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => id ? navigate(`/admin/building/${id}/residents`) : null}
                                        disabled={!id}
                                        title="View Residents"
                                      >
                                        <Users className="w-4 h-4" />
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-xs"
                                        onClick={() => full ? openBuildingModal(full) : null}
                                        disabled={!full}
                                        title="Edit Building"
                                      >
                                        <Edit className="w-4 h-4" />
                                      </button>
                                      <button
                                        className="btn btn-ghost btn-xs text-error"
                                        onClick={() => full ? openDeleteModal(full) : null}
                                        disabled={!full}
                                        title="Delete Building"
                                      >
                                        <Trash2 className="w-4 h-4" />
                                      </button>
                                    </>
                                  );
                                })()}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          );
        }
      case 'complaints':
        return <ComplaintManagement complaints={complaints} buildings={buildings} analytics={analytics} onStatusChange={fetchDashboardData} />;
      case 'analytics':
        return <AnalyticsDashboard analytics={analytics} />;
      default:
        return null;
    }
  };

  const handleLogout = () => {
    dispatch(logoutAdmin());
    navigate('/admin-login');
  };

  if (loading) return <div className="flex justify-center items-center h-screen dark:bg-zinc-900"><LoaderCircle className="animate-spin w-10 h-10 text-blue-500" /></div>;
  if (error) return <div className="text-center text-red-500 p-4 dark:bg-zinc-900">Error: {error}</div>;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8 pt-30">
      <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-8">Admin Dashboard</h1>
      {/* Navigation Tabs */}
      <div className="bg-white dark:bg-zinc-800 shadow-lg rounded-lg mb-8">
        <div className="flex space-x-1 overflow-x-auto p-4">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-colors ${activeTab === tab.id
                  ? 'bg-blue-500 text-white shadow-md'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-zinc-700'
                  }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Content based on active tab */}
      <div className="pb-8">
        {renderTabContent()}
      </div>

      {/* Building Modal */}
      {showBuildingModal && (
        <BuildingModal
          isOpen={showBuildingModal}
          onClose={closeBuildingModal}
          building={editingBuilding}
          mode={editingBuilding ? 'edit' : 'create'}
          onSubmit={editingBuilding ? handleEditBuilding : handleCreateBuilding}
        />
      )}

      {/* Confirmation Modal for Deleting Buildings */}
      {isDeleteModalOpen && (
        <ConfirmationModal
          isOpen={isDeleteModalOpen}
          onClose={closeDeleteModal}
          onConfirm={handleDeleteBuilding}
          title={`Confirm Deletion`}
          message={`Are you sure you want to delete the building "${buildingToDelete?.buildingName || buildingToDelete?.name}"? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default AdminDashboard;