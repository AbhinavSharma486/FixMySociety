import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { PlusCircle, AlertTriangle, Activity, Users, Clock, Sparkles, Zap, Shield } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import ComplaintCard from '../components/ComplaintCard';
import { useSocketContext } from '../context/SocketContext';
import { getAllComplaints, likeComplaint, addComment, deleteComplaint } from '../lib/complaintService';

// Memoized background animation component - OPTIMIZED with GPU acceleration
const AnimatedBackground = memo(() => (
  <div className="fixed inset-0 overflow-hidden pointer-events-none">
    {/* Animated Grid */}
    <div className="absolute inset-0 opacity-20">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `
            linear-gradient(to right, rgb(99 102 241 / 0.1) 1px, transparent 1px),
            linear-gradient(to bottom, rgb(99 102 241 / 0.1) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px'
        }}
      ></div>
    </div>

    {/* Radial Glows - OPTIMIZED with translate3d for GPU acceleration */}
    <motion.div
      animate={{
        scale: [1, 1.2, 1],
        opacity: [0.3, 0.5, 0.3],
      }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "easeInOut"
      }}
      className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-gradient-radial from-blue-500/30 via-indigo-500/20 to-transparent rounded-full blur-3xl"
      style={{ transform: 'translate3d(0,0,0)' }}
    ></motion.div>

    <motion.div
      animate={{
        scale: [1.2, 1, 1.2],
        opacity: [0.4, 0.6, 0.4],
      }}
      transition={{
        duration: 10,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 2
      }}
      className="absolute bottom-0 right-1/4 w-[700px] h-[700px] bg-gradient-radial from-violet-500/30 via-purple-500/20 to-transparent rounded-full blur-3xl"
      style={{ transform: 'translate3d(0,0,0)' }}
    ></motion.div>

    <motion.div
      animate={{
        scale: [1, 1.3, 1],
        opacity: [0.2, 0.4, 0.2],
      }}
      transition={{
        duration: 12,
        repeat: Infinity,
        ease: "easeInOut",
        delay: 4
      }}
      className="absolute top-1/2 right-1/3 w-[500px] h-[500px] bg-gradient-radial from-cyan-500/20 via-teal-500/10 to-transparent rounded-full blur-3xl"
      style={{ transform: 'translate3d(0,0,0)' }}
    ></motion.div>

    {/* Floating Particles - OPTIMIZED: Reduced from 20 to 12 for better performance */}
    {[...Array(12)].map((_, i) => (
      <motion.div
        key={i}
        className="absolute w-1 h-1 bg-blue-400 rounded-full"
        style={{
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          transform: 'translate3d(0,0,0)'
        }}
        animate={{
          y: [0, -30, 0],
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 3 + Math.random() * 2,
          repeat: Infinity,
          delay: Math.random() * 5,
          ease: "easeInOut"
        }}
      />
    ))}
  </div>
));
AnimatedBackground.displayName = 'AnimatedBackground';

// Memoized scan lines component - OPTIMIZED with GPU acceleration
const ScanLines = memo(() => (
  <div className="fixed inset-0 opacity-5 pointer-events-none">
    <motion.div
      animate={{ y: ["0%", "100%"] }}
      transition={{
        duration: 8,
        repeat: Infinity,
        ease: "linear"
      }}
      className="w-full h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent"
      style={{ transform: 'translate3d(0,0,0)' }}
    ></motion.div>
  </div>
));
ScanLines.displayName = 'ScanLines';

// Memoized stats card component - OPTIMIZED with useMemo for color configs
const StatsCard = memo(({ icon: Icon, value, label, color, delay }) => {
  // OPTIMIZATION: Memoize color configuration to prevent object recreation
  const colorConfig = useMemo(() => {
    const configs = {
      blue: {
        classes: 'from-blue-500/10 to-blue-600/5 border-blue-400/30 text-blue-400',
        gradient: 'linear-gradient(to bottom right, rgb(59, 130, 246), rgb(37, 99, 235))',
        shadow: '0 0 40px rgba(59, 130, 246, 0.6)',
        lightText: 'rgb(147, 197, 253)',
        smallText: 'rgb(96, 165, 250, 0.8)',
        status: 'Live tracking',
        StatusIcon: Zap
      },
      red: {
        classes: 'from-red-500/10 to-red-600/5 border-red-400/30 text-red-400',
        gradient: 'linear-gradient(to bottom right, rgb(239, 68, 68), rgb(220, 38, 38))',
        shadow: '0 0 40px rgba(239, 68, 68, 0.6)',
        lightText: 'rgb(252, 165, 165)',
        smallText: 'rgb(248, 113, 113, 0.8)',
        status: 'Critical alerts',
        StatusIcon: null
      },
      emerald: {
        classes: 'from-emerald-500/10 to-emerald-600/5 border-emerald-400/30 text-emerald-400',
        gradient: 'linear-gradient(to bottom right, rgb(16, 185, 129), rgb(5, 150, 105))',
        shadow: '0 0 40px rgba(16, 185, 129, 0.6)',
        lightText: 'rgb(110, 231, 183)',
        smallText: 'rgb(52, 211, 153, 0.8)',
        status: 'Completed',
        StatusIcon: Shield
      }
    };
    return configs[color] || configs.blue;
  }, [color]);

  const { classes, gradient, shadow, lightText, smallText, status, StatusIcon } = colorConfig;

  return (
    <motion.div
      whileHover={{
        y: -8,
        scale: 1.02,
        boxShadow: shadow
      }}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
      className={`group relative overflow-hidden bg-gradient-to-br ${classes} backdrop-blur-xl border rounded-3xl p-8 shadow-2xl`}
      style={{ transform: 'translate3d(0,0,0)' }}
    >
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
          scale: [1, 1.2, 1],
        }}
        transition={{
          duration: color === 'red' ? 2 : 3,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent"
      ></motion.div>

      <div className="relative flex items-center gap-5">
        <motion.div
          whileHover={{
            rotate: color === 'emerald' ? -180 : 180,
            scale: 1.1
          }}
          transition={{ type: "spring", stiffness: 200 }}
          className="flex-shrink-0 p-5 bg-gradient-to-br rounded-2xl shadow-lg relative overflow-hidden"
          style={{
            backgroundImage: gradient,
            transform: 'translate3d(0,0,0)'
          }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
          <Icon className="w-8 h-8 text-white relative z-10" />
        </motion.div>
        <div className="min-w-0 flex-1">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", delay: 0.6 + delay }}
            className="text-4xl sm:text-5xl font-black mb-1"
            style={{
              filter: `drop-shadow(0 0 10px ${lightText})`
            }}
          >
            {value}
          </motion.div>
          <div className="text-sm font-bold uppercase tracking-widest" style={{ color: lightText }}>
            {label}
          </div>
          <div className="flex items-center gap-2 mt-2">
            {color === 'red' ? (
              <motion.div
                animate={{ scale: [1, 1.3, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
                className="w-2 h-2 bg-red-400 rounded-full"
              ></motion.div>
            ) : StatusIcon ? (
              <StatusIcon className="w-3 h-3" style={{ color: lightText }} />
            ) : null}
            <span className="text-xs font-medium" style={{ color: smallText }}>
              {status}
            </span>
          </div>
        </div>
      </div>
    </motion.div>
  );
});
StatsCard.displayName = 'StatsCard';

// Memoized complaint card wrapper - OPTIMIZED animation timing
const ComplaintCardWrapper = memo(({ complaint, onLike, onView, onEdit, onDelete, currentUser, isEmergency, index }) => (
  <motion.div
    key={complaint._id}
    layout
    initial={{ opacity: 0, y: 30, scale: 0.95 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
    transition={{
      duration: 0.5,
      delay: 0.03 * Math.min(index, 12),
      ease: [0.22, 1, 0.36, 1]
    }}
    className="group"
    style={{ transform: 'translate3d(0,0,0)' }}
  >
    <div className="relative h-full overflow-hidden rounded-3xl">
      <motion.div
        animate={{
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: index * 0.1
        }}
        className="absolute -inset-[1px] bg-gradient-to-br from-blue-500 via-purple-500 to-cyan-500 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"
      ></motion.div>

      <div className="relative h-full bg-gradient-to-br from-slate-800/80 to-slate-900/80 backdrop-blur-xl border border-white/10 rounded-3xl shadow-xl overflow-hidden">
        <motion.div
          animate={{
            opacity: [0, 0.1, 0],
            scale: [0.8, 1.2, 0.8],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
            delay: index * 0.2
          }}
          className="absolute inset-0 bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-transparent pointer-events-none"
        ></motion.div>

        <ComplaintCard
          complaint={complaint}
          onLike={onLike}
          onView={onView}
          onEdit={onEdit}
          onDelete={onDelete}
          currentUser={currentUser}
          isEmergency={isEmergency}
        />
      </div>
    </div>
  </motion.div>
));
ComplaintCardWrapper.displayName = 'ComplaintCardWrapper';

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

  useEffect(() => {
    if (!socket) return;

    const handleNewIssueReported = (newComplaint) => {
      toast.success(`New complaint reported in ${newComplaint.buildingName}: ${newComplaint.title}`);
      if (!currentUser || newComplaint.buildingName === currentUser.buildingName) {
        setComplaints(prevComplaints => [newComplaint, ...prevComplaints]);
      }
    };

    const handleComplaintStatusUpdate = (updatedComplaint) => {
      toast.info(`Complaint "${updatedComplaint.title}" is now ${updatedComplaint.newStatus}`);
      setComplaints(prevComplaints =>
        prevComplaints.map(c =>
          c._id === updatedComplaint.complaintId ? { ...c, status: updatedComplaint.newStatus } : c
        )
      );
    };

    const handleComplaintLikeUpdate = ({ complaintId, likes, isLiked, userId }) => {
      toast(isLiked
        ? `${currentUser?.fullName || 'A user'} liked a complaint.`
        : `${currentUser?.fullName || 'A user'} unliked a complaint.`
      );
      setComplaints(prevComplaints =>
        prevComplaints.map(c =>
          c._id === complaintId ? { ...c, likes: likes } : c
        )
      );
    };

    const handleComplaintUpdated = ({ complaint: updatedComplaint }) => {
      toast.success(`Complaint "${updatedComplaint.title}" has been updated.`);
      setComplaints(prevComplaints =>
        prevComplaints.map(c =>
          c._id === updatedComplaint._id ? updatedComplaint : c
        )
      );
    };

    const handleComplaintDeleted = ({ complaintId }) => {
      console.log("Received complaintDeleted event for ID:", complaintId);
      toast.error("A complaint has been deleted.");
      setComplaints(prevComplaints =>
        prevComplaints.filter(c => c._id !== complaintId)
      );
    };

    const handleReconnect = () => {
      toast.info("Real-time service reconnected. Refreshing data...");
      fetchComplaints();
    };

    socket.on("newIssueReported", handleNewIssueReported);
    socket.on("complaintStatusUpdate", handleComplaintStatusUpdate);
    socket.on("complaintLikeUpdate", handleComplaintLikeUpdate);
    socket.on("complaintUpdated", handleComplaintUpdated);
    socket.on("complaintDeleted", handleComplaintDeleted);
    socket.on("reconnect", handleReconnect);

    return () => {
      socket.off("newIssueReported", handleNewIssueReported);
      socket.off("complaintStatusUpdate", handleComplaintStatusUpdate);
      socket.off("complaintLikeUpdate", handleComplaintLikeUpdate);
      socket.off("complaintUpdated", handleComplaintUpdated);
      socket.off("complaintDeleted", handleComplaintDeleted);
      socket.off("reconnect", handleReconnect);
    };
  }, [socket, currentUser, fetchComplaints]);

  const handleLike = useCallback(async (id) => {
    try {
      await likeComplaint(id);
    } catch (error) {
      toast.error("Failed to update like status.");
    }
  }, []);

  const handleAddComment = useCallback(async (id, text) => {
    try {
      toast.success("Comment functionality is handled via real-time service.");
    } catch (error) {
      toast.error("Failed to add comment.");
    }
  }, []);

  const handleCreateComplaint = useCallback(async (complaintData) => {
    try {
      toast.success('Complaint creation initiated...');
      navigate('/');
    } catch (error) {
      toast.error(error.message || 'Failed to create complaint.');
    }
  }, [navigate]);

  const handleUpdateComplaint = useCallback(async (updatedComplaint) => {
    try {
      console.log("Attempting to update complaint with data:", updatedComplaint);
      toast.success('Complaint update initiated...');
    } catch (error) {
      toast.error(error.message || 'Failed to update complaint.');
    }
  }, []);

  const handleDeleteComplaint = useCallback(async (complaintId) => {
    const originalComplaints = [...complaints];
    setComplaints(prevComplaints => prevComplaints.filter(c => c._id !== complaintId));
    toast.success('Complaint deleted successfully');

    try {
      await deleteComplaint(complaintId);
    } catch (error) {
      setComplaints(originalComplaints);
      toast.error(error.message || 'Failed to delete complaint. Please try again.');
    }
  }, [complaints]);

  // OPTIMIZATION: Memoize sorted complaints to prevent unnecessary re-sorting
  const sortedComplaints = useMemo(() =>
    [...complaints].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
    [complaints]
  );

  // OPTIMIZATION: Combine all complaint filtering logic into single useMemo
  const { emergencyComplaints, regularComplaints, primaryEmergencyComplaint, allRegularComplaints, stats } = useMemo(() => {
    const emergencies = sortedComplaints.filter(c => c.category === "Emergency");
    const regular = sortedComplaints.filter(c => c.category !== "Emergency");
    const primary = emergencies.length > 0 ? emergencies[0] : null;
    const others = emergencies.slice(1);
    return {
      emergencyComplaints: emergencies,
      regularComplaints: regular,
      primaryEmergencyComplaint: primary,
      allRegularComplaints: [...others, ...regular],
      stats: {
        totalComplaints: complaints.length,
        urgentComplaintsCount: emergencies.length,
        resolvedComplaintsCount: complaints.filter(c => c.status === 'Resolved').length
      }
    };
  }, [sortedComplaints, complaints.length]);

  // OPTIMIZATION: Memoize animation variants to prevent recreation
  const containerVariants = useMemo(() => ({
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.06,
        delayChildren: 0.12
      }
    }
  }), []);

  const itemVariants = useMemo(() => ({
    hidden: { opacity: 0, y: 20, scale: 0.97 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: [0.22, 1, 0.36, 1]
      }
    }
  }), []);

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950">
      <AnimatedBackground />
      <ScanLines />

      <div className="relative z-10 min-h-screen px-4 sm:px-6 lg:px-8 pt-20 sm:pt-24 lg:pt-28 pb-12">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="max-w-8xl mx-auto"
        >
          {/* Hero Section */}
          <motion.div
            variants={itemVariants}
            className="relative mb-12 sm:mb-16 lg:mb-20"
          >
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 rounded-[2.5rem] opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-500"></div>

              <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-indigo-900/90 backdrop-blur-xl rounded-[2.5rem] p-8 sm:p-12 lg:p-16 shadow-2xl overflow-hidden border border-white/10">
                {/* Corner Accents - OPTIMIZED with GPU acceleration */}
                <motion.div
                  animate={{
                    rotate: [0, 90, 180, 270, 360],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute top-8 right-8 w-32 h-32 border-t-2 border-r-2 border-cyan-400/30 rounded-tr-3xl"
                  style={{ transform: 'translate3d(0,0,0)' }}
                ></motion.div>

                <motion.div
                  animate={{
                    rotate: [360, 270, 180, 90, 0],
                    scale: [1, 1.1, 1],
                  }}
                  transition={{
                    duration: 20,
                    repeat: Infinity,
                    ease: "linear"
                  }}
                  className="absolute bottom-8 left-8 w-32 h-32 border-b-2 border-l-2 border-purple-400/30 rounded-bl-3xl"
                  style={{ transform: 'translate3d(0,0,0)' }}
                ></motion.div>

                <div className="relative">
                  <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-8 mb-12">
                    <div className="space-y-4">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      >
                        <motion.div
                          whileHover={{ scale: 1.05 }}
                          className="inline-flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30 rounded-2xl mb-6 backdrop-blur-sm"
                        >
                          <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            style={{ transform: 'translate3d(0,0,0)' }}
                          >
                            <Sparkles className="w-5 h-5 text-cyan-400" />
                          </motion.div>
                          <span className="text-sm font-bold text-cyan-300 tracking-wider uppercase">Nexus Dashboard</span>
                          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                        </motion.div>

                        <motion.h1
                          className="text-4xl sm:text-5xl lg:text-7xl xl:text-8xl font-black tracking-tight leading-[0.9] mb-4"
                          style={{
                            background: 'linear-gradient(135deg, #fff 0%, #60a5fa 50%, #a78bfa 100%)',
                            WebkitBackgroundClip: 'text',
                            WebkitTextFillColor: 'transparent',
                            backgroundClip: 'text',
                          }}
                        >
                          Community Feed
                        </motion.h1>

                        <div className="flex items-center gap-4 mt-6">
                          <motion.div
                            animate={{
                              boxShadow: [
                                '0 0 20px rgba(34, 211, 238, 0.5)',
                                '0 0 40px rgba(34, 211, 238, 0.8)',
                                '0 0 20px rgba(34, 211, 238, 0.5)',
                              ]
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="w-2 h-16 bg-gradient-to-b from-cyan-400 via-blue-500 to-purple-600 rounded-full"
                          ></motion.div>
                          <div>
                            <span className="text-3xl sm:text-4xl lg:text-5xl font-black text-white drop-shadow-[0_0_10px_rgba(255,255,255,0.5)]">
                              {currentUser.buildingName}
                            </span>
                            <p className="text-sm text-cyan-300/80 font-semibold mt-1 tracking-wide uppercase">Residential Nexus</p>
                          </div>
                        </div>
                      </motion.div>

                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.8, delay: 0.4 }}
                        className="max-w-2xl"
                      >
                        <p className="text-xl sm:text-2xl text-white/90 leading-relaxed font-medium">
                          Welcome back,{' '}
                          <span
                            className="font-black"
                            style={{
                              background: 'linear-gradient(135deg, #22d3ee 0%, #3b82f6 100%)',
                              WebkitBackgroundClip: 'text',
                              WebkitTextFillColor: 'transparent',
                              backgroundClip: 'text',
                            }}
                          >
                            {currentUser.fullName}
                          </span>
                        </p>
                        <p className="text-base text-blue-200/70 mt-3 leading-relaxed font-medium">
                          Synchronized real-time with your community network.
                        </p>
                      </motion.div>
                    </div>

                    {/* Stats Preview */}
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.6, delay: 0.5 }}
                      className="relative"
                    >
                      <motion.div
                        animate={{
                          boxShadow: [
                            '0 0 30px rgba(59, 130, 246, 0.3)',
                            '0 0 50px rgba(59, 130, 246, 0.5)',
                            '0 0 30px rgba(59, 130, 246, 0.3)',
                          ]
                        }}
                        transition={{
                          duration: 3,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="flex items-center gap-6 p-6 bg-gradient-to-br from-blue-500/10 to-purple-500/10 backdrop-blur-2xl border border-blue-400/20 rounded-2xl"
                      >
                        <div className="text-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity }}
                            className="text-3xl font-black text-cyan-400"
                          >
                            {stats.totalComplaints}
                          </motion.div>
                          <div className="text-xs text-cyan-300/70 font-bold uppercase tracking-wider">Total</div>
                        </div>
                        <div className="w-px h-10 bg-gradient-to-b from-transparent via-blue-400/50 to-transparent"></div>
                        <div className="text-center">
                          <motion.div
                            animate={{ scale: [1, 1.1, 1] }}
                            transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
                            className="text-3xl font-black text-emerald-400"
                          >
                            {stats.resolvedComplaintsCount}
                          </motion.div>
                          <div className="text-xs text-emerald-300/70 font-bold uppercase tracking-wider">Resolved</div>
                        </div>
                      </motion.div>
                    </motion.div>
                  </div>

                  {/* Statistics Grid */}
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-12"
                  >
                    <StatsCard icon={Activity} value={stats.totalComplaints} label="Total Issues" color="blue" delay={0.6} />
                    <StatsCard icon={AlertTriangle} value={stats.urgentComplaintsCount} label="Emergency" color="red" delay={0.7} />
                    <StatsCard icon={Clock} value={stats.resolvedComplaintsCount} label="Resolved" color="emerald" delay={0.8} />
                  </motion.div>

                  {/* Action Section */}
                  <motion.div
                    variants={itemVariants}
                    className="grid grid-cols-1 lg:grid-cols-3 gap-8"
                  >
                    {/* Create New Issue Button */}
                    <div className="col-span-1">
                      <motion.div
                        whileHover={{
                          y: -10,
                          scale: 1.02,
                        }}
                        whileTap={{ scale: 0.98 }}
                        transition={{ type: "spring", stiffness: 400, damping: 25 }}
                        className="h-full min-h-[240px]"
                      >
                        <button
                          onClick={() => navigate('/create-complaint')}
                          className="group relative w-full h-full overflow-hidden rounded-3xl shadow-2xl"
                        >
                          <motion.div
                            animate={{
                              background: [
                                'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                                'linear-gradient(135deg, #2563eb 0%, #1d4ed8 50%, #1e40af 100%)',
                                'linear-gradient(135deg, #3b82f6 0%, #2563eb 50%, #1d4ed8 100%)',
                              ]
                            }}
                            transition={{
                              duration: 5,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0"
                          ></motion.div>

                          <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                          <motion.div
                            animate={{
                              scale: [1, 1.5, 1],
                              opacity: [0.5, 0, 0.5],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeOut"
                            }}
                            className="absolute inset-0 border-2 border-white/30 rounded-3xl"
                          ></motion.div>

                          <div className="relative flex flex-col items-center justify-center gap-6 text-white h-full p-8">
                            <motion.div
                              whileHover={{
                                rotate: 180,
                                scale: 1.3,
                              }}
                              transition={{ type: "spring", stiffness: 300 }}
                              className="relative"
                              style={{ transform: 'translate3d(0,0,0)' }}
                            >
                              <div className="absolute inset-0 bg-white/30 rounded-2xl blur-xl"></div>
                              <div className="relative p-6 bg-white/20 backdrop-blur-sm rounded-2xl shadow-lg">
                                <PlusCircle className="w-12 h-12" />
                              </div>
                            </motion.div>
                            <div className="text-center">
                              <h3 className="text-2xl sm:text-3xl font-black mb-2 drop-shadow-lg">Report New Issue</h3>
                              <p className="text-blue-100 text-sm font-semibold leading-relaxed">
                                Initialize community improvement protocol
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
                          className="relative h-full min-h-[240px] overflow-hidden rounded-3xl shadow-2xl"
                        >
                          <motion.div
                            animate={{
                              background: [
                                'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                                'linear-gradient(135deg, rgba(220, 38, 38, 0.2) 0%, rgba(239, 68, 68, 0.15) 100%)',
                                'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)',
                              ]
                            }}
                            transition={{
                              duration: 3,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute inset-0 backdrop-blur-xl"
                          ></motion.div>

                          <div className="absolute inset-0 border-2 border-red-400/30 rounded-3xl"></div>

                          <motion.div
                            animate={{
                              opacity: [0.5, 1, 0.5],
                              scale: [1, 1.2, 1],
                            }}
                            transition={{
                              duration: 2,
                              repeat: Infinity,
                              ease: "easeInOut"
                            }}
                            className="absolute top-4 right-4 w-4 h-4 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
                          ></motion.div>

                          <div className="relative p-8 h-full flex flex-col">
                            <motion.div
                              initial={{ opacity: 0, x: -30 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.6, delay: 0.6 }}
                              className="flex items-center gap-4 mb-6"
                            >
                              <motion.div
                                animate={{
                                  rotate: [0, 5, -5, 0],
                                  scale: [1, 1.1, 1],
                                }}
                                transition={{
                                  duration: 2,
                                  repeat: Infinity,
                                  ease: "easeInOut"
                                }}
                                className="flex-shrink-0 p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg relative overflow-hidden"
                                style={{ transform: 'translate3d(0,0,0)' }}
                              >
                                <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent"></div>
                                <AlertTriangle className="w-10 h-10 text-white relative z-10" />
                              </motion.div>
                              <div>
                                <h2 className="text-3xl sm:text-4xl font-black text-red-400 tracking-tight drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">
                                  Emergency Alert
                                </h2>
                                <p className="text-red-300/80 font-semibold text-sm uppercase tracking-wider">
                                  Priority Response Required
                                </p>
                              </div>
                            </motion.div>

                            <div className="flex-1">
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
                          </div>
                        </motion.div>
                      </div>
                    )}
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Recent Issues Section */}
          <motion.div
            variants={itemVariants}
            className="relative"
          >
            <div className="relative group">
              <div className="absolute -inset-[1px] bg-gradient-to-r from-purple-500 via-blue-500 to-cyan-500 rounded-[2rem] opacity-50 blur-sm group-hover:opacity-75 transition-opacity duration-500"></div>

              <div className="relative bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-indigo-900/90 backdrop-blur-xl rounded-[2rem] p-8 sm:p-12 shadow-2xl overflow-hidden border border-white/10">
                {/* Section Header */}
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-10">
                  <div className="flex items-center gap-4">
                    <motion.div
                      animate={{
                        boxShadow: [
                          '0 0 20px rgba(168, 85, 247, 0.5)',
                          '0 0 40px rgba(168, 85, 247, 0.8)',
                          '0 0 20px rgba(168, 85, 247, 0.5)',
                        ]
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="w-2 h-12 bg-gradient-to-b from-purple-400 via-blue-500 to-cyan-400 rounded-full"
                    ></motion.div>
                    <div>
                      <h2
                        className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight"
                        style={{
                          background: 'linear-gradient(135deg, #fff 0%, #a78bfa 50%, #60a5fa 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Recent Issues
                      </h2>
                      <p className="text-purple-300/70 text-sm font-semibold mt-1 uppercase tracking-wider">
                        Network Activity Stream
                      </p>
                    </div>
                  </div>

                  <motion.div
                    whileHover={{ scale: 1.05 }}
                    className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-400/30 rounded-2xl shadow-lg backdrop-blur-sm"
                  >
                    <Users className="w-5 h-5 text-purple-400" />
                    <span className="font-black text-purple-300 text-lg">{allRegularComplaints.length}</span>
                    <span className="text-purple-300/70 font-semibold uppercase tracking-wide text-sm">Active</span>
                  </motion.div>
                </div>

                {/* Content */}
                {loading ? (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col items-center justify-center py-24"
                  >
                    <div className="relative mb-8">
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                        className="w-20 h-20 border-4 border-blue-500/30 rounded-full border-t-blue-500"
                        style={{ transform: 'translate3d(0,0,0)' }}
                      ></motion.div>
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0 w-20 h-20 border-4 border-purple-500/20 rounded-full border-b-purple-500"
                        style={{ transform: 'translate3d(0,0,0)' }}
                      ></motion.div>
                    </div>
                    <p className="text-blue-300 font-semibold text-lg">Synchronizing network data...</p>
                    <p className="text-blue-400/60 text-sm mt-2">Establishing secure connection</p>
                  </motion.div>
                ) : error ? (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="text-center py-24 bg-gradient-to-br from-red-500/10 to-red-600/5 rounded-2xl border border-red-400/30 shadow-lg"
                  >
                    <motion.div
                      animate={{
                        rotate: [0, 10, -10, 0],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        ease: "easeInOut"
                      }}
                      className="p-5 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl w-fit mx-auto mb-6 shadow-lg"
                      style={{ transform: 'translate3d(0,0,0)' }}
                    >
                      <AlertTriangle className="w-10 h-10 text-white" />
                    </motion.div>
                    <h3 className="text-2xl font-black text-red-400 mb-2 drop-shadow-[0_0_10px_rgba(239,68,68,0.8)]">Connection Failed</h3>
                    <p className="text-red-300/80 font-semibold">Unable to sync with network. Retry protocol initiated.</p>
                  </motion.div>
                ) : allRegularComplaints.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6 sm:gap-8">
                    <AnimatePresence mode="popLayout">
                      {allRegularComplaints.map((complaint, index) => (
                        <ComplaintCardWrapper
                          key={complaint._id}
                          complaint={complaint}
                          onLike={handleLike}
                          onView={(c) => navigate(`/complaints/${c._id}`)}
                          onEdit={(c) => navigate(`/edit-complaint/${c._id}`)}
                          onDelete={handleDeleteComplaint}
                          currentUser={currentUser}
                          isEmergency={complaint.category === "Emergency"}
                          index={index}
                        />
                      ))}
                    </AnimatePresence>
                  </div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8, delay: 0.3 }}
                    className="text-center py-24"
                  >
                    <div className="relative inline-block mb-10">
                      <motion.div
                        animate={{
                          rotateY: [0, 180, 360],
                        }}
                        transition={{
                          duration: 4,
                          repeat: Infinity,
                          ease: "easeInOut"
                        }}
                        className="w-28 h-28 bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-sm border border-blue-400/30"
                        style={{ transform: 'translate3d(0,0,0)' }}
                      >
                        <Activity className="w-14 h-14 text-blue-400/60" />
                      </motion.div>

                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                        style={{ transform: 'translate3d(0,0,0)' }}
                      >
                        <div className="absolute -top-2 left-1/2 w-3 h-3 bg-cyan-400 rounded-full shadow-lg shadow-cyan-400/50"></div>
                      </motion.div>
                      <motion.div
                        animate={{ rotate: -360 }}
                        transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
                        className="absolute inset-0"
                        style={{ transform: 'translate3d(0,0,0)' }}
                      >
                        <div className="absolute top-1/2 -right-2 w-2 h-2 bg-purple-400 rounded-full shadow-lg shadow-purple-400/50"></div>
                      </motion.div>
                    </div>

                    <div className="max-w-md mx-auto">
                      <h3
                        className="text-3xl sm:text-4xl font-black mb-4"
                        style={{
                          background: 'linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)',
                          WebkitBackgroundClip: 'text',
                          WebkitTextFillColor: 'transparent',
                          backgroundClip: 'text',
                        }}
                      >
                        Network Clear
                      </h3>
                      <p className="text-blue-200/70 text-lg leading-relaxed font-semibold mb-10">
                        Initialize first report and activate community enhancement protocol.
                      </p>

                      <motion.button
                        whileHover={{
                          scale: 1.05,
                          y: -4,
                          boxShadow: '0 0 40px rgba(59, 130, 246, 0.6)'
                        }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => navigate('/create-complaint')}
                        className="group inline-flex items-center gap-3 px-10 py-5 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-lg rounded-2xl shadow-2xl transition-all duration-300 relative overflow-hidden"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>
                        <motion.div
                          whileHover={{ rotate: 90 }}
                          transition={{ type: "spring", stiffness: 300 }}
                          style={{ transform: 'translate3d(0,0,0)' }}
                        >
                          <PlusCircle className="w-6 h-6" />
                        </motion.div>
                        <span className="relative">Initialize First Report</span>
                      </motion.button>
                    </div>
                  </motion.div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
};

export default MainPage;