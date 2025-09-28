import React, { useState, useEffect } from "react";
import { Heart, MessageSquare, Calendar, User } from "lucide-react";
import { motion } from "framer-motion";
import ThreeDotMenu from "./ThreeDotMenu.jsx";
import { statusConfig } from "../constants/statusConfig.js";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import ConfirmationModal from "../Admin/components/ConfirmationModal";

const ComplaintCard = ({
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
  const [optimisticLikes, setOptimisticLikes] = useState(complaint.likes || []);
  const [isOptimisticallyLiked, setIsOptimisticallyLiked] = useState(
    complaint.likes?.includes(currentUser?._id) || false
  );

  const isAuthor = complaint.user?._id === currentUser?._id;
  const { admin } = useSelector((state) => state.admin);
  const isAdmin = !!admin;

  useEffect(() => {
    setOptimisticLikes(complaint.likes || []);
    setIsOptimisticallyLiked(
      complaint.likes?.includes(currentUser?._id) || false
    );
  }, [complaint.likes, currentUser?._id]);

  const openDeleteModal = (complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setComplaintToDelete(null);
    setIsDeleteModalOpen(false);
  };

  const handleDeleteConfirm = () => {
    if (complaintToDelete && onDelete) {
      onDelete(complaintToDelete._id);
      closeDeleteModal();
    }
  };

  const handleLikeClick = () => {
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
  };

  const getStatusColor = (status) => {
    const config = statusConfig[status];
    if (!config)
      return "bg-gray-50 text-gray-700 border-gray-200 shadow-gray-200/30";

    switch (config.color) {
      case "badge-error":
        return "bg-red-50 text-red-700 border-red-200 shadow-red-200/30";
      case "badge-warning":
        return "bg-yellow-50 text-yellow-700 border-yellow-200 shadow-yellow-200/30";
      case "badge-success":
        return "bg-green-50 text-green-700 border-green-200 shadow-green-200/30";
      case "badge-info":
        return "bg-blue-50 text-blue-700 border-blue-200 shadow-blue-200/30";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200 shadow-gray-200/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 32, scale: 0.96 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -32, scale: 0.96 }}
      whileHover={{
        y: -8,
        scale: 1.02,
        transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] },
      }}
      whileTap={{
        scale: 0.98,
        transition: { duration: 0.15 },
      }}
      className={`group relative overflow-hidden rounded-3xl bg-white/[0.97] backdrop-blur-2xl
        shadow-[0_8px_32px_-8px_rgba(0,0,0,0.12),0_2px_8px_-4px_rgba(0,0,0,0.08)] 
        hover:shadow-[0_24px_80px_-12px_rgba(0,0,0,0.25),0_8px_32px_-8px_rgba(0,0,0,0.12)]
        transition-all duration-700 ease-out border border-white/30 hover:border-white/50
        ${isEmergency
          ? "bg-gradient-to-br from-red-50 via-white to-red-50 border-red-100/40 shadow-red-500/10"
          : "hover:bg-white/[0.98]"
        } w-full h-full min-h-[260px] md:min-h-[280px] lg:min-h-[300px]`}
    >
      {/* Content container */}
      <div className="relative z-10 p-4 sm:p-5 md:p-6 lg:p-7 flex flex-col h-full">
        {/* Header */}
        <div className="flex justify-between items-start gap-3 mb-4 md:mb-5">
          <div className="flex-1 min-w-0 pr-2">
            <motion.h3 className="text-base sm:text-lg md:text-xl font-bold text-gray-900 line-clamp-2 leading-snug break-words">
              {complaint.title}
            </motion.h3>
          </div>
          <ThreeDotMenu
            onView={() => onView(complaint)}
            onEdit={() => onEdit(complaint)}
            onDelete={() => openDeleteModal(complaint)}
            isAuthor={isAuthor}
            isAdmin={isAdmin}
          />
        </div>

        {/* Meta info (Name + Date always side by side, but wrap on small screens) */}
        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm text-gray-500 mb-4 md:mb-5 w-full gap-y-2">
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1 border border-gray-200">
            <User className="w-3.5 h-3.5 text-gray-400" />
            <span className="truncate font-semibold text-gray-700 max-w-[120px] sm:max-w-none">
              {complaint.user?.fullName || complaint.author || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-xl px-2.5 py-1 border border-gray-200">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span className="font-semibold text-gray-700 whitespace-nowrap">
              {new Date(
                complaint.createdAt || complaint.date
              ).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="flex-grow mb-4 md:mb-6">
          <p className="text-sm md:text-base text-gray-600 line-clamp-3 leading-relaxed break-words">
            {complaint.description}
          </p>
        </div>

        {/* Footer (Like + Comment + Status always side by side, wrap on small screens) */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 md:pt-4 border-t border-gray-100/80 w-full">
          {/* Like + Comment */}
          <div className="flex items-center gap-2">
            {/* Like button */}
            <button
              onClick={handleLikeClick}
              className={`flex items-center gap-1 px-2 py-1 rounded-xl font-semibold text-xs md:text-sm`}
              aria-label="Like complaint"
            >
              <Heart
                className="w-3.5 h-3.5 md:w-4 md:h-4"
                fill={isOptimisticallyLiked ? "#dc2626" : "none"}
              />
              <span>{optimisticLikes.length || 0}</span>
            </button>

            {/* Comments button */}
            <button
              onClick={() => onView(complaint)}
              className="flex items-center gap-1 px-2 py-1 rounded-xl font-semibold text-xs md:text-sm text-gray-500 hover:text-blue-600 bg-gray-50 border border-gray-200 hover:border-blue-200"
              aria-label="View comments"
            >
              <MessageSquare className="w-3.5 h-3.5 md:w-4 md:h-4" />
              <span>{complaint.comments?.length || 0}</span>
            </button>
          </div>

          {/* Status Badge */}
          <span
            className={`px-2.5 py-1 rounded-xl text-xs md:text-sm font-bold border ${getStatusColor(complaint.status)}`}
          >
            {statusConfig[complaint.status]?.label || complaint.status}
          </span>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onConfirm={handleDeleteConfirm}
        title="Confirm Complaint Deletion"
        message={`Are you sure you want to delete complaint "${complaintToDelete?.title}"? This action cannot be undone.`}
      />
    </motion.div>
  );
};

export default ComplaintCard;