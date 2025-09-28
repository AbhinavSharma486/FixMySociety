import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { PlusCircle, AlertTriangle, Activity, Users, Clock, ChevronDown, Plus, LoaderCircle, Sparkles, TrendingUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import ComplaintCard from '../components/ComplaintCard';
import { getAllComplaints, likeComplaint, addComment, deleteComplaint } from '../lib/complaintService';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSocketContext } from '../context/SocketContext';

const MainPage = () => {
  const { currentUser } = useSelector(state => state.user);
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showAllComplaints, setShowAllComplaints] = useState(false);
  const [isMobileOrTablet, setIsMobileOrTablet] = useState(false);
  const { socket } = useSocketContext();

  const navigate = useNavigate();

  const fetchComplaints = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getAllComplaints(currentUser?.buildingName);
      setComplaints(data.complaints || []);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser?.buildingName]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  // Socket.IO Listeners
  useEffect(() => {
    if (socket) {
      const handleNewIssueReported = (newComplaint) => {
        toast.success(`New complaint reported in ${newComplaint.buildingName}: ${newComplaint.title}`);
        if (!currentUser || newComplaint.buildingName === currentUser.buildingName) {
          setComplaints(prevComplaints => [newComplaint, ...prevComplaints]);
        }
      };
      socket.on("newIssueReported", handleNewIssueReported);

      const handleComplaintStatusUpdate = (updatedComplaint) => {
        toast.info(`Complaint "${updatedComplaint.title}" is now ${updatedComplaint.newStatus}`);
        setComplaints(prevComplaints =>
          prevComplaints.map(c =>
            c._id === updatedComplaint.complaintId ? { ...c, status: updatedComplaint.newStatus } : c
          )
        );
      };
      socket.on("complaintStatusUpdate", handleComplaintStatusUpdate);

      const handleComplaintLikeUpdate = ({ complaintId, likes, isLiked, userId }) => {
        if (isLiked) {
          toast(`${currentUser?.fullName || 'A user'} liked a complaint.`);
        } else {
          toast(`${currentUser?.fullName || 'A user'} unliked a complaint.`);
        }
        setComplaints(prevComplaints =>
          prevComplaints.map(c =>
            c._id === complaintId ? { ...c, likes: likes } : c
          )
        );
      };
      socket.on("complaintLikeUpdate", handleComplaintLikeUpdate);

      const handleComplaintUpdated = ({ complaint: updatedComplaint }) => {
        toast.success(`Complaint "${updatedComplaint.title}" has been updated.`);
        setComplaints(prevComplaints =>
          prevComplaints.map(c =>
            c._id === updatedComplaint._id ? updatedComplaint : c
          )
        );
      };
      socket.on("complaintUpdated", handleComplaintUpdated);

      const handleComplaintDeleted = ({ complaintId }) => {
        console.log("Received complaintDeleted event for ID:", complaintId);
        toast.error("A complaint has been deleted.");
        setComplaints(prevComplaints =>
          prevComplaints.filter(c => c._id !== complaintId)
        );
      };
      socket.on("complaintDeleted", handleComplaintDeleted);

      const handleReconnect = () => {
        toast.info("Real-time service reconnected. Refreshing data...");
        fetchComplaints();
      };
      socket.on("reconnect", handleReconnect);

      return () => {
        socket.off("newIssueReported", handleNewIssueReported);
        socket.off("complaintStatusUpdate", handleComplaintStatusUpdate);
        socket.off("complaintLikeUpdate", handleComplaintLikeUpdate);
        socket.off("complaintUpdated", handleComplaintUpdated);
        socket.off("complaintDeleted", handleComplaintDeleted);
        socket.off("reconnect", handleReconnect);
      };
    }
  }, [socket, currentUser, setComplaints, fetchComplaints]);

  const handleLike = async (id) => {
    try {
      const data = await likeComplaint(id);
    } catch (error) {
      toast.error("Failed to update like status.");
    }
  };

  const handleAddComment = async (id, text) => {
    try {
      toast.success("Comment functionality is handled via real-time service.");
    } catch (error) {
      toast.error("Failed to add comment.");
    }
  };

  const handleCreateComplaint = async (complaintData) => {
    try {
      toast.success('Complaint creation initiated...');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to create complaint.');
    }
  };

  const handleUpdateComplaint = async (updatedComplaint) => {
    try {
      console.log("Attempting to update complaint with data:", updatedComplaint);
      toast.success('Complaint update initiated...');
    } catch (error) {
      toast.error(error.message || 'Failed to update complaint.');
    }
  };

  const handleDeleteComplaint = async (complaintId) => {
    const originalComplaints = [...complaints];
    setComplaints(prevComplaints => prevComplaints.filter(c => c._id !== complaintId));
    toast.success('Complaint deleted successfully');

    try {
      await deleteComplaint(complaintId);
    } catch (error) {
      setComplaints(originalComplaints);
      toast.error(error.message || 'Failed to delete complaint. Please try again.');
    }
  };

  const sortedComplaints = useMemo(() =>
    [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [complaints]
  );

  const emergencyComplaints = sortedComplaints.filter(c => c.category === "Emergency");
  const regularComplaints = sortedComplaints.filter(c => c.category !== "Emergency");

  const primaryEmergencyComplaint = emergencyComplaints.length > 0 ? emergencyComplaints[0] : null;
  const otherEmergencyComplaints = emergencyComplaints.slice(1);
  const allRegularComplaints = [...otherEmergencyComplaints, ...regularComplaints];

  const displayedComplaints = allRegularComplaints;

  const totalComplaints = complaints.length;
  const urgentComplaintsCount = emergencyComplaints.length;
  const resolvedComplaintsCount = complaints.filter(c => c.status === 'Resolved').length;

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.6,
        ease: [0.215, 0.610, 0.355, 1.000]
      }
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 via-gray-50 to-zinc-50">
      {/* Ultra-modern background with layered gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-1/2 -right-1/2 w-full h-full bg-gradient-to-bl from-blue-100/20 via-indigo-50/10 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute -bottom-1/2 -left-1/2 w-full h-full bg-gradient-to-tr from-violet-100/20 via-purple-50/10 to-transparent rotate-12 transform-gpu"></div>
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-gradient-radial from-cyan-200/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 left-1/4 w-96 h-96 bg-gradient-radial from-emerald-200/30 to-transparent rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      {/* Subtle grid pattern overlay */}
      <div className="fixed inset-0 opacity-[0.02] pointer-events-none">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgb(0 0 0) 1px, transparent 0)`,
          backgroundSize: '24px 24px'
        }}></div>
      </div>

      <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-8xl mx-auto"
        >
          {/* Hero Section with Premium Design */}
          <motion.div
            variants={itemVariants}
            className="relative mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="relative bg-white/60 backdrop-blur-2xl border border-white/20 rounded-3xl sm:rounded-[2rem] lg:rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-[0_8px_40px_rgb(0_0_0_0.12)] overflow-hidden">
              {/* Floating geometric shapes */}
              <div className="absolute top-8 right-8 w-20 h-20 bg-gradient-to-br from-blue-400/20 to-indigo-500/20 rounded-2xl rotate-12 blur-sm"></div>
              <div className="absolute bottom-8 left-8 w-16 h-16 bg-gradient-to-br from-emerald-400/20 to-teal-500/20 rounded-xl rotate-45 blur-sm"></div>

              <div className="relative">
                {/* Header with enhanced typography */}
                <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
                  <div className="space-y-4">
                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.3 }}
                    >
                      <div className="inline-flex items-center gap-3 px-4 py-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200/50 rounded-2xl mb-4">
                        <Sparkles className="w-4 h-4 text-blue-600" />
                        <span className="text-sm font-semibold text-blue-700">Community Dashboard</span>
                      </div>
                      <h1 className="text-3xl sm:text-4xl lg:text-6xl xl:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-r from-gray-900 via-gray-800 to-gray-700 tracking-tight leading-[0.9] mb-2">
                        Community Feed
                      </h1>
                      <div className="flex items-center gap-4 mt-4">
                        <div className="w-1.5 h-12 bg-gradient-to-b from-blue-500 via-indigo-500 to-purple-500 rounded-full shadow-lg"></div>
                        <div>
                          <span className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-800">{currentUser.buildingName}</span>
                          <p className="text-sm text-gray-500 font-medium mt-1">Residential Community</p>
                        </div>
                      </div>
                    </motion.div>

                    <motion.div
                      initial={{ opacity: 0, x: -30 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="max-w-2xl"
                    >
                      <p className="text-lg sm:text-xl text-gray-600 leading-relaxed font-medium">
                        Welcome back, <span className="font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">{currentUser.fullName}</span>
                      </p>
                      <p className="text-base text-gray-500 mt-2 leading-relaxed">
                        Stay connected with your community and help make it better together.
                      </p>
                    </motion.div>
                  </div>

                  {/* Quick stats preview */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.6, delay: 0.5 }}
                    className="flex items-center gap-6 p-6 bg-gradient-to-r from-white/80 to-white/60 backdrop-blur-xl border border-white/30 rounded-2xl shadow-lg"
                  >
                    <div className="text-center">
                      <div className="text-2xl font-black text-blue-600">{totalComplaints}</div>
                      <div className="text-xs text-gray-500 font-medium">Total</div>
                    </div>
                    <div className="w-px h-8 bg-gray-200"></div>
                    <div className="text-center">
                      <div className="text-2xl font-black text-emerald-600">{resolvedComplaintsCount}</div>
                      <div className="text-xs text-gray-500 font-medium">Resolved</div>
                    </div>
                  </motion.div>
                </div>

                {/* Premium Statistics Grid */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
                >
                  {/* Total Issues Card */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-blue-50/80 to-blue-100/60 backdrop-blur-xl border border-blue-200/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-5">
                      <div className="flex-shrink-0 p-4 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg group-hover:shadow-blue-500/25 transition-all duration-300">
                        <Activity className="w-7 h-7 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.6 }}
                          className="text-3xl sm:text-4xl font-black text-blue-700 mb-1"
                        >
                          {totalComplaints}
                        </motion.div>
                        <div className="text-sm font-bold text-blue-600/80 uppercase tracking-wide">Total Issues</div>
                        <div className="flex items-center gap-1 mt-2">
                          <TrendingUp className="w-3 h-3 text-blue-500" />
                          <span className="text-xs text-blue-500 font-medium">Active monitoring</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Emergency Card */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-red-50/80 to-red-100/60 backdrop-blur-xl border border-red-200/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-5">
                      <div className="flex-shrink-0 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg group-hover:shadow-red-500/25 transition-all duration-300">
                        <AlertTriangle className="w-7 h-7 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.7 }}
                          className="text-3xl sm:text-4xl font-black text-red-700 mb-1"
                        >
                          {urgentComplaintsCount}
                        </motion.div>
                        <div className="text-sm font-bold text-red-600/80 uppercase tracking-wide">Emergency</div>
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                          <span className="text-xs text-red-500 font-medium">High priority</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Resolved Card */}
                  <motion.div
                    whileHover={{ y: -4, scale: 1.02 }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                    className="group relative overflow-hidden bg-gradient-to-br from-emerald-50/80 to-emerald-100/60 backdrop-blur-xl border border-emerald-200/40 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-lg hover:shadow-2xl transition-all duration-500"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative flex items-center gap-5">
                      <div className="flex-shrink-0 p-4 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-2xl shadow-lg group-hover:shadow-emerald-500/25 transition-all duration-300">
                        <Clock className="w-7 h-7 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <motion.div
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ type: "spring", delay: 0.8 }}
                          className="text-3xl sm:text-4xl font-black text-emerald-700 mb-1"
                        >
                          {resolvedComplaintsCount}
                        </motion.div>
                        <div className="text-sm font-bold text-emerald-600/80 uppercase tracking-wide">Resolved</div>
                        <div className="flex items-center gap-1 mt-2">
                          <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                          <span className="text-xs text-emerald-500 font-medium">Completed</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Action Section with Enhanced Design */}
                <motion.div
                  variants={itemVariants}
                  className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12"
                >
                  {/* Create New Issue Button - Premium Design */}
                  <div className="col-span-1">
                    <motion.div
                      whileHover={{ y: -8, scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      transition={{ type: "spring", stiffness: 400, damping: 25 }}
                      className="h-full min-h-[200px] sm:min-h-[240px]"
                    >
                      <button
                        onClick={() => navigate('/create-complaint')}
                        className="group relative w-full h-full overflow-hidden bg-gradient-to-br from-blue-600 via-blue-700 to-indigo-800 rounded-2xl sm:rounded-3xl p-8 shadow-2xl hover:shadow-blue-500/25 transition-all duration-500 border border-blue-500/20"
                      >
                        {/* Animated background patterns */}
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-indigo-600/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>

                        <div className="relative flex flex-col items-center justify-center gap-6 text-white h-full">
                          <motion.div
                            whileHover={{ rotate: 90, scale: 1.2 }}
                            transition={{ type: "spring", stiffness: 400 }}
                            className="p-5 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg group-hover:bg-white/30 transition-all duration-300"
                          >
                            <PlusCircle className="w-10 h-10 sm:w-12 sm:h-12" />
                          </motion.div>
                          <div className="text-center">
                            <h3 className="text-xl sm:text-2xl font-black mb-2">Report New Issue</h3>
                            <p className="text-blue-100 text-sm font-medium leading-relaxed">
                              Help improve our community together
                            </p>
                          </div>
                        </div>
                      </button>
                    </motion.div>
                  </div>

                  {/* Emergency Alert Section */}
                  {primaryEmergencyComplaint && (
                    <div className="col-span-1 lg:col-span-2">
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="relative h-full min-h-[200px] sm:min-h-[240px] bg-gradient-to-br from-red-50/90 via-orange-50/80 to-red-50/90 backdrop-blur-xl border-2 border-red-200/60 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden"
                      >
                        {/* Animated alert patterns */}
                        <div className="absolute top-0 right-0 w-24 h-24 bg-red-500/10 rounded-full -translate-y-12 translate-x-12 animate-pulse"></div>
                        <div className="absolute bottom-0 left-0 w-32 h-32 bg-orange-500/10 rounded-full translate-y-16 -translate-x-16 animate-pulse delay-1000"></div>

                        <motion.div
                          initial={{ opacity: 0, x: -30 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.6, delay: 0.6 }}
                          className="relative flex items-center gap-4 mb-6"
                        >
                          <motion.div
                            animate={{
                              scale: [1, 1.1, 1],
                              rotate: [0, 5, -5, 0]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="flex-shrink-0 p-4 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg"
                          >
                            <AlertTriangle className="w-8 h-8 text-white" />
                          </motion.div>
                          <div>
                            <h2 className="text-2xl sm:text-3xl font-black text-red-700 tracking-tight">
                              Emergency Alert
                            </h2>
                            <p className="text-red-600/80 font-medium text-sm">
                              Requires immediate attention
                            </p>
                          </div>
                        </motion.div>

                        <div className="relative">
                          <ComplaintCard
                            complaint={primaryEmergencyComplaint}
                            onLike={handleLike}
                            onView={(c) => navigate(`/complaints/${c._id}`)}
                            onEdit={(c) => navigate(`/edit-complaint/${c._id}`)}
                            onDelete={handleDeleteComplaint}
                            currentUser={currentUser}
                            isEmergency
                          />
                        </div>
                      </motion.div>
                    </div>
                  )}
                </motion.div>
              </div>
            </div>
          </motion.div>

          {/* Recent Issues Section with Premium Layout */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="bg-white/60 backdrop-blur-2xl border border-white/20 rounded-3xl sm:rounded-[2rem] p-8 sm:p-12 shadow-[0_8px_40px_rgb(0_0_0_0.12)] overflow-hidden">
              {/* Section Header */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                <div className="flex items-center gap-4">
                  <div className="w-1.5 h-10 bg-gradient-to-b from-gray-800 to-gray-600 rounded-full shadow-sm"></div>
                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
                      Recent Issues
                    </h2>
                    <p className="text-gray-500 text-sm font-medium mt-1">
                      Community reports and updates
                    </p>
                  </div>
                </div>

                <motion.div
                  whileHover={{ scale: 1.05 }}
                  className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-gray-50 to-gray-100 border border-gray-200/60 rounded-2xl shadow-sm backdrop-blur-sm"
                >
                  <Users className="w-5 h-5 text-gray-600" />
                  <span className="font-bold text-gray-800">{allRegularComplaints.length}</span>
                  <span className="text-gray-600 font-medium">issues</span>
                </motion.div>
              </div>

              {/* Content */}
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center py-20 sm:py-24"
                >
                  <div className="relative mb-6">
                    <div className="w-16 h-16 border-4 border-blue-200 rounded-full animate-spin border-t-blue-600"></div>
                    <div className="absolute inset-0 w-16 h-16 border-4 border-transparent rounded-full animate-ping border-t-blue-400"></div>
                  </div>
                  <p className="text-gray-500 font-medium">Loading community updates...</p>
                </motion.div>
              ) : error ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-20 sm:py-24 bg-gradient-to-br from-red-50 to-red-100/60 rounded-2xl border border-red-200/50 shadow-lg"
                >
                  <div className="p-4 bg-red-500 rounded-2xl w-fit mx-auto mb-6">
                    <AlertTriangle className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-red-700 mb-2">Unable to Load</h3>
                  <p className="text-red-600 font-medium">Could not load complaints. Please try again later.</p>
                </motion.div>
              ) : displayedComplaints.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                  <AnimatePresence>
                    {displayedComplaints.map((complaint, index) => (
                      <motion.div
                        key={complaint._id}
                        layout
                        initial={{ opacity: 0, y: 40, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.3 } }}
                        transition={{
                          duration: 0.7,
                          delay: 0.1 * Math.min(index, 12),
                          ease: [0.215, 0.610, 0.355, 1.000]
                        }}
                        whileHover={{
                          y: -12,
                          scale: 1.03,
                          transition: { type: "spring", stiffness: 400, damping: 25 }
                        }}
                        className="group transform-gpu"
                      >
                        <div className="relative h-full overflow-hidden bg-white/80 backdrop-blur-xl border border-white/40 rounded-2xl sm:rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 group-hover:border-white/60">
                          {/* Subtle hover glow effect */}
                          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          <ComplaintCard
                            complaint={complaint}
                            onLike={handleLike}
                            onView={(c) => navigate(`/complaints/${c._id}`)}
                            onEdit={(c) => navigate(`/edit-complaint/${c._id}`)}
                            onDelete={handleDeleteComplaint}
                            currentUser={currentUser}
                            isEmergency={complaint.category === "Emergency"}
                          />
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.8, delay: 0.3 }}
                  className="text-center py-16 sm:py-20 lg:py-24"
                >
                  <div className="relative inline-block mb-8">
                    <motion.div
                      animate={{
                        scale: [1, 1.05, 1],
                        rotate: [0, 2, -2, 0]
                      }}
                      transition={{
                        duration: 4,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-24 h-24 sm:w-28 sm:h-28 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center shadow-lg"
                    >
                      <Activity className="w-12 h-12 sm:w-14 sm:h-14 text-gray-400" />
                    </motion.div>

                    {/* Floating decorative elements */}
                    <div className="absolute -top-2 -right-2 w-6 h-6 bg-blue-200 rounded-full animate-bounce delay-300"></div>
                    <div className="absolute -bottom-2 -left-2 w-4 h-4 bg-emerald-200 rounded-full animate-bounce delay-700"></div>
                  </div>

                  <div className="max-w-md mx-auto">
                    <h3 className="text-2xl sm:text-3xl font-black text-gray-800 mb-4">
                      No Issues Yet
                    </h3>
                    <p className="text-gray-600 text-lg leading-relaxed font-medium mb-8">
                      Be the first to report an issue and help improve our community together.
                    </p>

                    <motion.button
                      whileHover={{ scale: 1.05, y: -2 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => navigate('/create-complaint')}
                      className="group inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-bold text-lg rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300"
                    >
                      <PlusCircle className="w-5 h-5 group-hover:rotate-90 transition-transform duration-300" />
                      <span>Report First Issue</span>
                    </motion.button>
                  </div>
                </motion.div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MainPage;