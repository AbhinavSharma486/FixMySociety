import React, { useState, useEffect, useMemo, useCallback, memo } from "react";
import { Heart, MessageSquare, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import toast from "react-hot-toast";

import { statusConfig } from "../constants/statusConfig.js";
import { useSelector } from "react-redux";
import ThreeDotMenu from "./ThreeDotMenu.jsx";
import ConfirmationModal from "../Admin/components/ConfirmationModal";

// Memoize static animation variants to prevent recreation on every render
const cardVariants = {
  initial: { opacity: 0, y: 40, scale: 0.94, rotateX: -15 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    rotateX: 0,
    transition: {
      duration: 0.5,
      ease: [0.25, 0.1, 0.25, 1]
    }
  },
  exit: {
    opacity: 0,
    y: -40,
    scale: 0.94,
    rotateX: 15,
    transition: {
      duration: 0.3
    }
  },
  tap: {
    scale: 0.97,
    transition: { duration: 0.1 }
  }
};

const titleVariants = {
  initial: { opacity: 0, x: -20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.1, duration: 0.3 }
  }
};

const descriptionVariants = {
  initial: { opacity: 0 },
  animate: {
    opacity: 1,
    transition: { delay: 0.2, duration: 0.3 }
  }
};

const statusBadgeVariants = {
  initial: { opacity: 0, x: 20 },
  animate: {
    opacity: 1,
    x: 0,
    transition: { delay: 0.3, duration: 0.3 }
  }
};

const metaHoverVariants = {
  scale: 1.05,
  transition: { type: "spring", stiffness: 400, damping: 20 }
};

const buttonHoverVariants = {
  scale: 1.1,
  transition: { type: "spring", stiffness: 400, damping: 20 }
};

const buttonTapVariants = {
  scale: 0.95,
  transition: { duration: 0.1 }
};

const statusGradientVariants = {
  animate: {
    x: ["-100%", "100%"],
    transition: {
      duration: 3,
      repeat: Infinity,
      ease: "linear"
    }
  }
};

// Memoized status config calculator - moved outside component for better caching
const STATUS_CONFIG_CACHE = new Map();

const getStatusConfig = (status) => {
  if (STATUS_CONFIG_CACHE.has(status)) {
    return STATUS_CONFIG_CACHE.get(status);
  }

  const config = statusConfig[status];
  const defaultConfig = {
    gradient: "from-gray-500/20 via-gray-400/10 to-transparent",
    glow: "shadow-gray-500/20",
    border: "border-gray-400/30",
    text: "text-gray-300"
  };

  if (!config) {
    STATUS_CONFIG_CACHE.set(status, defaultConfig);
    return defaultConfig;
  }

  const colorMap = {
    "badge-error": {
      gradient: "from-red-500/20 via-red-400/10 to-transparent",
      glow: "shadow-red-500/30",
      border: "border-red-400/40",
      text: "text-red-400"
    },
    "badge-warning": {
      gradient: "from-yellow-500/20 via-yellow-400/10 to-transparent",
      glow: "shadow-yellow-500/30",
      border: "border-yellow-400/40",
      text: "text-yellow-400"
    },
    "badge-success": {
      gradient: "from-green-500/20 via-green-400/10 to-transparent",
      glow: "shadow-green-500/30",
      border: "border-green-400/40",
      text: "text-green-400"
    },
    "badge-info": {
      gradient: "from-blue-500/20 via-blue-400/10 to-transparent",
      glow: "shadow-blue-500/30",
      border: "border-blue-400/40",
      text: "text-blue-400"
    }
  };

  const result = colorMap[config.color] || colorMap["badge-info"];
  STATUS_CONFIG_CACHE.set(status, result);
  return result;
};

// Memoized date formatter
const formatDate = (dateString) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
};

const ComplaintCard = memo(({
  complaint,
  onLike,
  onView,
  onEdit,
  onDelete,
  currentUser,
  isEmergency = false,
}) => {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [optimisticLikes, setOptimisticLikes] = useState(() => complaint.likes || []);
  const [isOptimisticallyLiked, setIsOptimisticallyLiked] = useState(
    () => complaint.likes?.includes(currentUser?._id) || false
  );

  // Get admin state once
  const { admin } = useSelector((state) => state.admin);
  const isAdmin = useMemo(() => !!admin, [admin]);

  // Memoize expensive computations with proper dependencies
  const isAuthor = useMemo(
    () => complaint.user?._id === currentUser?._id,
    [complaint.user?._id, currentUser?._id]
  );

  const statusStyle = useMemo(
    () => getStatusConfig(complaint.status),
    [complaint.status]
  );

  const formattedDate = useMemo(
    () => formatDate(complaint.createdAt || complaint.date),
    [complaint.createdAt, complaint.date]
  );

  const authorName = useMemo(
    () => complaint.user?.fullName || complaint.author || "Unknown",
    [complaint.user?.fullName, complaint.author]
  );

  const commentsCount = useMemo(
    () => complaint.comments?.length || 0,
    [complaint.comments?.length]
  );

  const statusLabel = useMemo(
    () => statusConfig[complaint.status]?.label || complaint.status,
    [complaint.status]
  );

  // Memoize gradient backgrounds to prevent recalculation
  const overlayGradient = useMemo(
    () => isEmergency
      ? "radial-gradient(circle at 50% 0%, rgba(239, 68, 68, 0.15), transparent 70%)"
      : "radial-gradient(circle at 50% 0%, rgba(6, 182, 212, 0.15), transparent 70%)",
    [isEmergency]
  );

  const cardClasses = useMemo(
    () => `group relative overflow-hidden rounded-[32px] h-full
      backdrop-blur-3xl backdrop-saturate-150
      transition-all duration-700 ease-out
      ${isEmergency
        ? "bg-gradient-to-br from-red-950/40 via-gray-900/60 to-red-950/30 border-red-500/30"
        : "bg-gradient-to-br from-gray-900/70 via-gray-800/50 to-gray-900/70 border-gray-700/30"
      }
      border-2 hover:border-cyan-400/50
      shadow-[0_8px_32px_rgba(0,0,0,0.4),0_0_80px_rgba(6,182,212,0.1),inset_0_1px_0_rgba(255,255,255,0.1)]
      hover:shadow-[0_20px_60px_rgba(0,0,0,0.5),0_0_120px_rgba(6,182,212,0.25),inset_0_1px_0_rgba(255,255,255,0.15)]
      before:absolute before:inset-0 before:rounded-[32px] before:p-[2px] 
      before:bg-gradient-to-br before:from-cyan-500/20 before:via-transparent before:to-purple-500/20
      before:-z-10 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-700`,
    [isEmergency]
  );

  // Optimized effect - only update when complaint.likes reference changes
  useEffect(() => {
    const likes = complaint.likes || [];
    setOptimisticLikes(likes);
    setIsOptimisticallyLiked(likes.includes(currentUser?._id));
  }, [complaint.likes, currentUser?._id]);

  // Memoized callbacks to prevent child re-renders
  const openDeleteModal = useCallback((complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  }, []);

  const closeDeleteModal = useCallback(() => {
    setComplaintToDelete(null);
    setIsDeleteModalOpen(false);
  }, []);

  const handleDeleteConfirm = useCallback(() => {
    if (complaintToDelete && onDelete) {
      onDelete(complaintToDelete._id);
      closeDeleteModal();
    }
  }, [complaintToDelete, onDelete, closeDeleteModal]);

  const handleLikeClick = useCallback(() => {
    if (!currentUser) {
      return toast.error("You must be logged in to like a complaint.");
    }

    const currentUserId = currentUser._id;
    const newOptimisticLikes = isOptimisticallyLiked
      ? optimisticLikes.filter((id) => id !== currentUserId)
      : [...optimisticLikes, currentUserId];

    setOptimisticLikes(newOptimisticLikes);
    setIsOptimisticallyLiked(!isOptimisticallyLiked);

    onLike(complaint._id || complaint.id);
  }, [currentUser, isOptimisticallyLiked, optimisticLikes, onLike, complaint._id, complaint.id]);

  const handleViewClick = useCallback(() => {
    onView(complaint);
  }, [onView, complaint]);

  const handleEditClick = useCallback(() => {
    onEdit(complaint);
  }, [onEdit, complaint]);

  const handleDeleteClick = useCallback(() => {
    openDeleteModal(complaint);
  }, [openDeleteModal, complaint]);

  // Memoize heart animation to prevent recreation
  const heartAnimation = useMemo(
    () => isOptimisticallyLiked ? {
      scale: [1, 1.4, 1],
      rotate: [0, 15, -15, 0],
      transition: { duration: 0.5 }
    } : {},
    [isOptimisticallyLiked]
  );

  return (
    <div className="w-full h-full min-h-[260px] md:min-h-[280px] lg:min-h-[300px]">
      <motion.div
        variants={cardVariants}
        initial="initial"
        animate="animate"
        exit="exit"
        whileTap="tap"
        style={{
          perspective: "1000px",
          transformStyle: "preserve-3d",
          willChange: "transform"
        }}
        className={cardClasses}
      >
        {/* Animated gradient overlay */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"
          style={{
            background: overlayGradient,
            willChange: "opacity"
          }}
        />

        {/* Scan line effect */}
        <motion.div
          className="absolute inset-0 opacity-0 group-hover:opacity-100 pointer-events-none"
          style={{ willChange: "opacity" }}
        />

        {/* Corner accents - using GPU-accelerated properties only */}
        <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-cyan-400/30 rounded-tl-[32px] group-hover:border-cyan-400/60 transition-colors duration-500" />
        <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-purple-400/30 rounded-br-[32px] group-hover:border-purple-400/60 transition-colors duration-500" />

        {/* Content container */}
        <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col h-full">
          {/* Header */}
          <div className="flex justify-between items-start gap-3 mb-4 md:mb-5">
            <div className="flex-1 min-w-0 pr-2">
              <motion.h3
                className="text-base sm:text-lg md:text-xl font-bold bg-gradient-to-r from-white via-cyan-100 to-white bg-clip-text text-transparent line-clamp-2 leading-snug break-words drop-shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                variants={titleVariants}
                initial="initial"
                animate="animate"
              >
                {complaint.title}
              </motion.h3>
            </div>
            <motion.div
              transition={{ type: "spring", stiffness: 400 }}
              style={{ transformStyle: 'flat' }}
            >
              <ThreeDotMenu
                onView={handleViewClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
                isAuthor={isAuthor}
                isAdmin={isAdmin}
              />
            </motion.div>
          </div>

          {/* Meta info */}
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm mb-4 md:mb-5 w-full gap-y-2">
            <motion.div
              className="flex items-center gap-1.5 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl px-3 py-1.5 border border-gray-700/50 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300"
              whileHover={metaHoverVariants}
              style={{ willChange: "transform" }}
            >
              <User className="w-3.5 h-3.5 text-cyan-400" />
              <span className="truncate font-semibold text-gray-200 max-w-[120px] sm:max-w-none">
                {authorName}
              </span>
            </motion.div>
            <motion.div
              className="flex items-center gap-1.5 bg-gradient-to-r from-gray-800/80 to-gray-900/80 backdrop-blur-xl rounded-2xl px-3 py-1.5 border border-gray-700/50 shadow-[0_0_20px_rgba(6,182,212,0.1)] hover:shadow-[0_0_30px_rgba(6,182,212,0.2)] transition-all duration-300"
              whileHover={metaHoverVariants}
              style={{ willChange: "transform" }}
            >
              <Calendar className="w-3.5 h-3.5 text-purple-400" />
              <span className="font-semibold text-gray-200 whitespace-nowrap">
                {formattedDate}
              </span>
            </motion.div>
          </div>

          {/* Description */}
          <div className="flex-grow mb-4 md:mb-6">
            <motion.p
              className="text-sm md:text-base text-gray-300 line-clamp-3 leading-relaxed break-words font-light"
              variants={descriptionVariants}
              initial="initial"
              animate="animate"
            >
              {complaint.description}
            </motion.p>
          </div>

          {/* Footer */}
          <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 md:pt-4 border-t border-gray-700/50 w-full relative">
            {/* Glowing line */}
            <motion.div
              className="absolute top-0 left-0 h-[2px] bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"
              style={{ willChange: "opacity" }}
            />

            {/* Like + Comment */}
            <div className="flex items-center gap-2">
              {/* Like button */}
              <motion.button
                onClick={handleLikeClick}
                className="group/like relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-xs md:text-sm bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 hover:border-red-500/50 transition-all duration-300 overflow-hidden"
                whileHover={buttonHoverVariants}
                whileTap={buttonTapVariants}
                aria-label="Like complaint"
                style={{ willChange: "transform" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-red-500/20 to-pink-500/20 opacity-0 group-hover/like:opacity-100 transition-opacity duration-300"
                  style={{ willChange: "opacity" }}
                />
                <motion.div
                  animate={heartAnimation}
                  style={{ willChange: "transform" }}
                >
                  <Heart
                    className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10 transition-all duration-300"
                    fill={isOptimisticallyLiked ? "#ef4444" : "none"}
                    stroke={isOptimisticallyLiked ? "#ef4444" : "#d1d5db"}
                  />
                </motion.div>
                <span className={`relative z-10 transition-colors duration-300 ${isOptimisticallyLiked ? "text-red-400" : "text-gray-300"}`}>
                  {optimisticLikes.length || 0}
                </span>
              </motion.button>

              {/* Comments button */}
              <motion.button
                onClick={handleViewClick}
                className="group/comment relative flex items-center gap-1.5 px-3 py-1.5 rounded-2xl font-bold text-xs md:text-sm bg-gradient-to-r from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 hover:border-cyan-500/50 text-gray-300 hover:text-cyan-400 transition-all duration-300 overflow-hidden"
                whileHover={buttonHoverVariants}
                whileTap={buttonTapVariants}
                aria-label="View comments"
                style={{ willChange: "transform" }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 opacity-0 group-hover/comment:opacity-100 transition-opacity duration-300"
                  style={{ willChange: "opacity" }}
                />
                <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4 relative z-10" />
                <span className="relative z-10">{commentsCount}</span>
              </motion.button>
            </div>

            {/* Status Badge */}
            <motion.span
              className={`relative px-3 py-1.5 rounded-2xl text-xs md:text-sm font-bold border backdrop-blur-xl ${statusStyle.border} ${statusStyle.text} overflow-hidden`}
              whileHover={{ scale: 1.05 }}
              variants={statusBadgeVariants}
              initial="initial"
              animate="animate"
              style={{ willChange: "transform" }}
            >
              <motion.div
                className={`absolute inset-0 bg-gradient-to-r ${statusStyle.gradient}`}
                variants={statusGradientVariants}
                animate="animate"
                style={{ willChange: "transform" }}
              />
              <span className="relative z-10 drop-shadow-[0_0_8px_currentColor]">
                {statusLabel}
              </span>
            </motion.span>
          </div>
        </div>
      </motion.div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Confirm Complaint Deletion"
        message={`Are you sure you want to delete complaint "${complaintToDelete?.title}"? This action cannot be undone.`}
      />
    </div>
  );
}, (prevProps, nextProps) => {
  // Custom comparison function for memo - optimized for strict equality checks
  return (
    prevProps.complaint._id === nextProps.complaint._id &&
    prevProps.complaint.likes?.length === nextProps.complaint.likes?.length &&
    prevProps.complaint.comments?.length === nextProps.complaint.comments?.length &&
    prevProps.complaint.status === nextProps.complaint.status &&
    prevProps.currentUser?._id === nextProps.currentUser?._id &&
    prevProps.isEmergency === nextProps.isEmergency
  );
});

ComplaintCard.displayName = "ComplaintCard";

export default ComplaintCard;