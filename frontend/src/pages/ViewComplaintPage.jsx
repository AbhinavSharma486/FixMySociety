import React, { useState, useEffect, useCallback, useMemo, memo, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, deleteComplaint, addComment } from '../lib/complaintService';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ArrowLeft, Trash2, Edit, LoaderCircle, Image, Video as VideoIcon, Sparkles, Shield, Clock, User, Home } from 'lucide-react';
import { useSocketContext } from '../context/SocketContext';
import socket from '../lib/socket';
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import ReplyButton from '../components/ReplyButton';
import { axiosInstance as axios } from '../lib/axios';
import ConfirmationModal from '../Admin/components/ConfirmationModal';

// Holographic Avatar Component - Optimized & Responsive
const Avatar = memo(({ src, alt, size = 'md', showAdminBadge = false }) => {
  const sizeClasses = {
    sm: 'w-8 h-8 min-w-[2rem] xs:w-10 xs:h-10',
    md: 'w-10 h-10 min-w-[2.5rem] xs:w-12 xs:h-12 sm:w-14 sm:h-14',
    lg: 'w-16 h-16 min-w-[4rem] sm:w-20 sm:h-20'
  };

  const badgeSize = {
    sm: 'w-4 h-4 xs:w-5 xs:h-5',
    md: 'w-5 h-5 xs:w-6 xs:h-6',
    lg: 'w-6 h-6 xs:w-7 xs:h-7'
  };

  return (
    <div className="relative flex-shrink-0 group">

      <img
        src={src || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
        alt={alt || 'User'}
        className={`${sizeClasses[size]} rounded-full object-cover relative z-10 border-2 border-slate-900 shadow-2xl will-change-transform group-hover:scale-110 transition-transform duration-500`}
        loading="lazy"
        decoding="async"
      />

      {showAdminBadge && (
        <div className={`absolute -bottom-0.5 -right-0.5 xs:-bottom-1 xs:-right-1 ${badgeSize[size]} bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 rounded-full border-2 border-slate-900 flex items-center justify-center z-20 shadow-lg`}>
          <Shield className="w-2 h-2 xs:w-2.5 xs:h-2.5 sm:w-3 sm:h-3 text-white" />
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) =>
  prevProps.src === nextProps.src &&
  prevProps.size === nextProps.size &&
  prevProps.showAdminBadge === nextProps.showAdminBadge
);

Avatar.displayName = 'Avatar';

// Futuristic Media Card - Optimized & Responsive
const MediaCard = memo(({ item, index, onClick }) => {
  const isVideo = item.type === 'video';
  const handleClick = useCallback(() => onClick(), [onClick]);

  return (
    <div
      className="group relative cursor-pointer rounded-xl xs:rounded-2xl overflow-hidden will-change-transform hover:scale-105 hover:-rotate-1 transition-all duration-700 ease-out"
      onClick={handleClick}
    >
      {/* Holographic border - GPU accelerated */}
      <div className="absolute inset-0 rounded-xl xs:rounded-2xl bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-sm"></div>

      <div className="relative rounded-xl xs:rounded-2xl overflow-hidden border border-white/10 xs:border-2 group-hover:border-cyan-400/50 transition-all duration-500">
        {isVideo ? (
          <video
            src={item.src}
            className="w-full h-40 xs:h-44 sm:h-48 md:h-56 object-cover will-change-transform group-hover:scale-110 transition-transform duration-1000 ease-out"
            loading="lazy"
            preload="metadata"
          />
        ) : (
          <img
            src={item.src}
            alt={`Media ${index + 1}`}
            className="w-full h-40 xs:h-44 sm:h-48 md:h-56 object-cover will-change-transform group-hover:scale-110 transition-transform duration-1000 ease-out"
            loading="lazy"
            decoding="async"
          />
        )}

        {/* Overlay gradient - GPU accelerated */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative will-change-transform scale-0 group-hover:scale-100 transition-all duration-500">
              <div className="absolute inset-0 bg-cyan-400 blur-2xl animate-pulse"></div>
              <div className="relative bg-gradient-to-br from-cyan-400/20 to-blue-600/20 backdrop-blur-xl rounded-xl xs:rounded-2xl p-3 xs:p-4 sm:p-5 border border-cyan-400/30">
                {isVideo ? (
                  <VideoIcon className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-cyan-400" />
                ) : (
                  <Image className="w-8 h-8 xs:w-10 xs:h-10 sm:w-12 sm:h-12 text-cyan-400" />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) =>
  prevProps.item.src === nextProps.item.src &&
  prevProps.index === nextProps.index
);

MediaCard.displayName = 'MediaCard';

// Futuristic Reply Card - Optimized & Responsive
const ReplyCard = memo(({ reply, comment, id, resolveUser, currentUser, admin, setEditingReply, setEditText, handleDeleteReply, fetchComplaint }) => {
  const replyUser = useMemo(() => resolveUser(reply.user), [resolveUser, reply.user]);
  const isEditing = comment._id === reply.editingCommentId && reply._id === reply.editingReplyId;
  const canEdit = useMemo(() => (currentUser || admin) && (
    ((reply.user && currentUser && String(reply.user._id) === String(currentUser._id))) ||
    (reply.authorRole === 'admin' && admin && String(reply.user._id) === String(admin._id))
  ), [currentUser, admin, reply.user, reply.authorRole]);

  const handleEdit = useCallback(() => {
    setEditingReply({ commentId: comment._id, replyId: reply._id });
    setEditText(reply.text);
  }, [setEditingReply, setEditText, comment._id, reply._id, reply.text]);

  const handleDelete = useCallback(() => {
    handleDeleteReply(comment._id, reply._id);
  }, [handleDeleteReply, comment._id, reply._id]);

  const timeAgo = useMemo(() =>
    formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true }),
    [reply.createdAt]
  );

  return (
    <div className="group/reply relative rounded-xl xxs:rounded-2xl px-2 py-3 xxs:p-4 sm:p-5 md:p-6 will-change-transform hover:translate-x-1 xxs:hover:translate-x-2 transition-all duration-500 border border-white/5 hover:border-cyan-400/30 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl">
      {/* Glow effect on hover - GPU accelerated */}
      <div className="absolute inset-0 rounded-xl xxs:rounded-2xl bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-purple-600/0 will-change-opacity opacity-0 group-hover/reply:opacity-100 transition-opacity duration-500"></div>

      <div className="relative flex items-start space-x-1 xxs:space-x-2 sm:space-x-4">
        <Avatar src={replyUser.profilePic} alt={replyUser.fullName} size="sm" />
        <div className="flex-1 min-w-0">
          <div className="flex flex-col gap-2 mb-1 xxs:mb-3">
            <div className="flex items-center gap-1.5 xxs:gap-2">
              <p className="text-[11px] xxs:text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent truncate">
                {replyUser.fullName || 'Unknown'}
              </p>
              <Sparkles className="w-2 h-2 xxs:w-3 xxs:h-3 text-cyan-400 flex-shrink-0 will-change-opacity opacity-100 transition-opacity duration-300" />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <div className="flex items-center gap-1.5 text-[9px] xxs:text-xs text-white/50 bg-white/5 px-2 xxs:px-3 py-1 xxs:py-1.5 rounded-full border border-white/10">
                <Clock className="w-2 h-2 xxs:w-3 xxs:h-3 flex-shrink-0" />
                <span className="truncate">{timeAgo}</span>
              </div>
              {canEdit && (
                <div className="flex gap-1.5 xxs:gap-2 opacity-100 ">
                  <button
                    onClick={handleEdit}
                    className="text-[9px] xxs:text-xs font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-2 xxs:px-3 py-[0.2rem] xxs:py-1.5 rounded-full transition-all duration-300 border border-cyan-400/20 whitespace-nowrap cursor-pointer"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="text-[9px] xxs:text-xs font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-2 xxs:px-3 py-[0.2rem] xxs:py-1.5 rounded-full transition-all duration-300 border border-red-400/20 whitespace-nowrap cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              )}
            </div>
          </div>
          <p className="text-xs xxs:text-sm text-white/80 leading-relaxed break-words">{reply.text}</p>
        </div>
      </div>
    </div>
  );
}, (prevProps, nextProps) =>
  prevProps.reply._id === nextProps.reply._id &&
  prevProps.reply.text === nextProps.reply.text &&
  prevProps.reply.createdAt === nextProps.reply.createdAt
);

ReplyCard.displayName = 'ReplyCard';

const ViewComplaintPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useSelector(state => state.user);
  const { admin } = useSelector(state => state.admin);
  const { socket } = useSocketContext();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
  const [editText, setEditText] = useState('');
  const [opLoadingId, setOpLoadingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Use ref to avoid recreating function on every render
  const toastShownRef = useRef(new Set());

  const resolveUser = useCallback((user) => {
    if (!user) return { id: null, fullName: null, profilePic: null, flatNumber: null, authorRole: null };
    const id = user._id || user;
    let fullName = user.fullName || (currentUser && String(id) === String(currentUser._id) ? currentUser.fullName : null);
    let profilePic = user.profilePic || (currentUser && String(id) === String(currentUser._id) ? currentUser.profilePic : null);
    let flatNumber = user.flatNumber || (currentUser && String(id) === String(currentUser._id) ? currentUser.flatNumber : null);

    if (user.authorRole === 'admin') {
      fullName = "Admin";
      profilePic = admin?.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png";
      flatNumber = null;
    }

    if (!fullName && admin && String(id) === String(admin._id)) {
      fullName = admin.fullName;
      profilePic = admin.profilePic;
    }
    if (!profilePic && admin && String(id) === String(admin._id)) {
      profilePic = admin.profilePic;
    }

    return { id, fullName, profilePic, flatNumber, authorRole: user.authorRole };
  }, [currentUser, admin]);

  const fetchComplaint = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getComplaintById(id);
      setComplaint(data.complaint);
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchComplaint();

    if (socket && id) {
      console.log(`[ViewComplaintPage] Joining complaint room: ${id}`);
      socket.emit("joinComplaintRoom", id);

      const handleNewComment = (data) => {
        console.log('[ViewComplaintPage] Received new comment:', data);
        if (data.complaintId === id) {
          setComplaint((prevComplaint) => {
            if (!prevComplaint) return null;
            const commentExists = prevComplaint.comments.some(c => c._id === data.comment._id);
            if (commentExists) return prevComplaint;

            // Debounced toast to prevent duplicates
            const toastKey = `comment-${data.comment._id}`;
            if (!toastShownRef.current.has(toastKey)) {
              toastShownRef.current.add(toastKey);
              setTimeout(() => {
                toast.success("Comment added successfully!");
                toastShownRef.current.delete(toastKey);
              }, 0);
            }

            return {
              ...prevComplaint,
              comments: [...prevComplaint.comments, data.comment],
            };
          });
        }
      };

      const handleNewReply = (data) => {
        console.log('[ViewComplaintPage] Received new reply:', data);
        if (data.complaintId === id) {
          setComplaint((prevComplaint) => {
            if (!prevComplaint) return null;
            const nextComments = prevComplaint.comments.map(comment => {
              if (comment._id === data.parentCommentId) {
                const replyExists = comment.replies.some(r => r._id === data.reply._id);
                if (replyExists) return comment;

                // Debounced toast to prevent duplicates
                const toastKey = `reply-${data.reply._id}`;
                if (!toastShownRef.current.has(toastKey)) {
                  toastShownRef.current.add(toastKey);
                  setTimeout(() => {
                    toast.success("Reply added successfully!");
                    toastShownRef.current.delete(toastKey);
                  }, 0);
                }

                return {
                  ...comment,
                  replies: [...comment.replies, data.reply]
                };
              }
              return comment;
            });
            return {
              ...prevComplaint,
              comments: nextComments
            };
          });
        }
      };

      socket.on("comment:added", handleNewComment);
      socket.on("reply:added", handleNewReply);

      return () => {
        console.log(`[ViewComplaintPage] Leaving complaint room: ${id}`);
        socket.emit("leaveComplaintRoom", id);
        socket.off("comment:added", handleNewComment);
        socket.off("reply:added", handleNewReply);
      };
    }
  }, [fetchComplaint, id, socket]);

  const slides = useMemo(() => [
    ...(complaint?.images || []).map((src, idx) => ({ src, type: "image", idx: `image-${idx}` })),
    ...(complaint?.video ? [{
      src: complaint.video,
      type: "video",
      sources: [{ src: complaint.video, type: "video/mp4" }],
      idx: `video-0`
    }] : []),
  ], [complaint?.images, complaint?.video]);

  const handleMediaClick = useCallback((clickedItem) => {
    const index = slides.findIndex(slide => slide.src === clickedItem.src);
    if (index !== -1) {
      setPhotoIndex(index);
      setLightboxOpen(true);
    }
  }, [slides]);

  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      return toast.error("Comment cannot be empty.");
    }
    if (!currentUser && !admin) {
      return toast.error("You must be logged in to comment.");
    }

    try {
      await addComment(id, newCommentText);
      setNewCommentText('');
    } catch (error) {
      toast.error(error.message || "Failed to add comment.");
    }
  }, [newCommentText, currentUser, admin, id]);

  const handleDeleteComment = useCallback(async (commentId) => {
    setPendingDelete({ type: 'comment', commentId });
  }, []);

  const handleDeleteReply = useCallback(async (commentId, replyId) => {
    setPendingDelete({ type: 'reply', commentId, replyId });
  }, []);

  const handleDeleteComplaint = useCallback(async () => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await deleteComplaint(id);
        navigate(admin ? '/admin/dashboard' : '/main');
      } catch (err) {
        toast.error(err.message || "Failed to delete complaint.");
      }
    }
  }, [id, admin, navigate]);

  const handleEditComplaint = useCallback(() => {
    navigate(`/edit-complaint/${id}`);
  }, [id, navigate]);

  const handleBackClick = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  const handleLoginClick = useCallback(() => {
    navigate('/login');
  }, [navigate]);

  // Memoize expensive computations
  const isOwner = useMemo(() =>
    currentUser && complaint?.user?._id === currentUser._id,
    [currentUser, complaint?.user?._id]
  );

  const isAdmin = useMemo(() => !!admin, [admin]);

  if (loading) return (
    <div className="min-h-screen flex justify-center items-center relative overflow-hidden bg-slate-950 px-4">
      {/* Animated grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] xs:bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Animated orbs - GPU accelerated */}
      <div className="absolute top-1/4 left-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float will-change-transform"></div>
      <div className="absolute bottom-1/4 right-1/4 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-blue-500/20 rounded-full blur-3xl animate-float will-change-transform" style={{ animationDelay: '2s' }}></div>
      <div className="absolute top-1/2 left-1/2 w-48 h-48 xs:w-64 xs:h-64 sm:w-96 sm:h-96 bg-purple-500/20 rounded-full blur-3xl animate-float will-change-transform" style={{ animationDelay: '4s' }}></div>

      <div className="flex flex-col items-center space-y-4 xs:space-y-6 sm:space-y-8 relative z-10">
        {/* Holographic loader */}
        <div className="relative">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-2xl animate-pulse"></div>
          <LoaderCircle className="animate-spin w-16 h-16 xs:w-20 xs:h-20 sm:w-24 sm:h-24 text-cyan-400 relative z-10" strokeWidth={2} />
        </div>
        <div className="text-center px-4">
          <p className="text-lg xs:text-xl sm:text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent animate-pulse">
            Loading Complaint Details
          </p>
          <p className="text-white/40 mt-2 text-xs xs:text-sm">Initializing holographic interface...</p>
        </div>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen flex justify-center items-center bg-slate-950 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] xs:bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]"></div>

      <div className="text-center p-6 xs:p-8 sm:p-10 md:p-12 rounded-2xl xs:rounded-3xl shadow-2xl max-w-md w-full mx-4 relative z-10 border border-red-500/20 bg-gradient-to-br from-red-950/50 to-slate-950/50 backdrop-blur-xl">
        <div className="text-red-400 text-5xl xs:text-6xl sm:text-7xl md:text-8xl mb-4 xs:mb-6 sm:mb-8 animate-pulse">⚠️</div>
        <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold bg-gradient-to-r from-red-400 to-red-600 bg-clip-text text-transparent mb-3 xs:mb-4">System Error</h3>
        <p className="text-red-300/80 mb-6 xs:mb-8 sm:mb-10 leading-relaxed text-sm xs:text-base break-words">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="group relative px-6 xs:px-8 sm:px-10 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-red-500 to-red-600 text-white rounded-xl xs:rounded-2xl font-bold overflow-hidden transition-all duration-300 hover:scale-105 text-sm xs:text-base w-full xs:w-auto"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <span className="relative z-10">Retry Connection</span>
        </button>
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="min-h-screen flex justify-center items-center bg-slate-950 relative overflow-hidden px-4">
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] xs:bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem]"></div>

      <div className="text-center p-6 xs:p-8 sm:p-10 md:p-12 rounded-2xl xs:rounded-3xl shadow-2xl max-w-md w-full mx-4 relative z-10 border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl">
        <div className="text-white/30 text-5xl xs:text-6xl sm:text-7xl md:text-8xl mb-4 xs:mb-6 sm:mb-8">🔍</div>
        <h3 className="text-xl xs:text-2xl sm:text-3xl font-bold text-white mb-3 xs:mb-4">Complaint Not Found</h3>
        <p className="text-white/60 leading-relaxed text-sm xs:text-base">The complaint you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen relative overflow-hidden bg-slate-950">
      {/* Futuristic Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:2rem_2rem] xs:bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)]"></div>

      {/* Animated holographic orbs - GPU accelerated with will-change */}
      <div className="absolute top-20 left-10 w-48 h-48 xs:w-64 xs:h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 bg-cyan-500/20 rounded-full blur-3xl animate-float will-change-transform"></div>
      <div className="absolute top-1/3 right-20 w-64 h-64 xs:w-80 xs:h-80 sm:w-[30rem] sm:h-[30rem] md:w-[35rem] md:h-[35rem] lg:w-[40rem] lg:h-[40rem] bg-blue-500/20 rounded-full blur-3xl animate-float will-change-transform" style={{ animationDelay: '2s' }}></div>
      <div className="absolute bottom-20 left-1/3 w-48 h-48 xs:w-56 xs:h-56 sm:w-64 sm:h-64 md:w-80 md:h-80 bg-purple-500/20 rounded-full blur-3xl animate-float will-change-transform" style={{ animationDelay: '4s' }}></div>

      {/* Main Container */}
      <div className="px-3 xs:px-4 sm:px-6 lg:px-8 py-4 xs:py-5 sm:py-6 pt-16 xs:pt-18 sm:pt-20 lg:pt-24 relative z-10">
        <div className="max-w-7xl mx-auto">

          {/* Futuristic Back Button */}
          <div className="mb-6 xs:mb-8 sm:mb-10">
            <button
              onClick={handleBackClick}
              className="group relative inline-flex items-center px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 text-xs xs:text-sm font-bold bg-gradient-to-r from-cyan-500/10 to-blue-500/10 backdrop-blur-xl border border-cyan-400/20 rounded-xl xs:rounded-2xl text-cyan-400 overflow-hidden transition-all duration-500 hover:border-cyan-400/50 hover:scale-105 w-fit xs:w-full justify-center xs:justify-start cursor-pointer"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0 will-change-transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
              <ArrowLeft className="w-4 h-4 xs:w-5 xs:h-5 mr-2 xs:mr-3 will-change-transform group-hover:-translate-x-2 transition-transform duration-300 flex-shrink-0" />
              <span className="relative z-10 truncate">Back to Dashboard</span>
            </button>
          </div>

          {/* Main Holographic Card */}
          <div className="relative rounded-2xl xs:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-2xl shadow-2xl">
            {/* Scan line effect - GPU accelerated */}
            <div className="absolute inset-0 bg-gradient-to-b from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 will-change-transform translate-y-[-100%] animate-scan-slow pointer-events-none"></div>

            {/* Holographic Header Section */}
            <div className="relative overflow-hidden bg-gradient-to-br from-cyan-500/20 via-blue-600/20 to-purple-600/20 border-b border-white/10">

              <div className="relative p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6 xs:gap-8 sm:gap-10">
                  <div className="flex-1 min-w-0">
                    {/* Title with holographic effect */}
                    <h1 className="text-2xl xs:text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black mb-4 xs:mb-6 sm:mb-8 leading-tight break-words">
                      <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent drop-shadow-[0_0_30px_rgba(34,211,238,0.5)]">
                        {complaint.title}
                      </span>
                    </h1>

                    {/* Info Cards */}
                    <div className="flex flex-wrap gap-2 xs:gap-3 sm:gap-4 mb-4 xs:mb-6 sm:mb-8">
                      <div className="group relative px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-cyan-400/50 transition-all duration-300">
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 to-cyan-400/20 will-change-opacity opacity-0 group-hover:opacity-100 rounded-lg xs:rounded-xl transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-2 xs:gap-3">
                          <User className="w-3 h-3 xs:w-4 xs:h-4 text-cyan-400 flex-shrink-0" />
                          <span className="font-bold text-white text-xs xs:text-sm truncate">{complaint.user.fullName}</span>
                        </div>
                      </div>

                      <div className="group relative px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 flex-shrink-0 min-w-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400/0 to-blue-400/20 will-change-opacity opacity-0 group-hover:opacity-100 rounded-lg xs:rounded-xl transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-1.5 xs:gap-2 sm:gap-3 text-white/90 text-xs xs:text-sm">
                          <Home className="w-3 h-3 xs:w-4 xs:h-4 text-blue-400 flex-shrink-0" />
                          <span className="truncate max-w-[100px] xs:max-w-[150px] sm:max-w-none">{complaint.buildingName.buildingName}</span>
                          <span className="text-white/50 flex-shrink-0">•</span>
                          <span className="font-bold whitespace-nowrap">Flat {complaint.user.flatNumber}</span>
                        </div>
                      </div>

                      <div className="group relative px-3 xs:px-4 sm:px-5 py-2 xs:py-2.5 sm:py-3 rounded-lg xs:rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 hover:border-blue-400/50 transition-all duration-300 flex-shrink-0 min-w-0">
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-400/0 to-purple-400/20 will-change-opacity opacity-0 group-hover:opacity-100 rounded-lg xs:rounded-xl transition-opacity duration-300"></div>
                        <div className="relative flex items-center gap-2 xs:gap-3 text-white/80">
                          <Clock className="w-3 h-3 xs:w-4 xs:h-4 text-purple-400 flex-shrink-0" />
                          <span className="text-xs xs:text-sm truncate">
                            {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Holographic Status Badge */}
                    <div className="inline-block relative group w-fit xs:w-auto">
                      <div className={`absolute inset-0 blur-xl ${complaint.status === 'Pending'
                        ? 'bg-red-500/50'
                        : complaint.status === 'In Progress'
                          ? 'bg-yellow-500/50'
                          : 'bg-green-500/50'
                        } will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                      <span className={`relative px-4 xs:px-6 sm:px-8 py-2.5 xs:py-3 sm:py-4 text-xs xs:text-sm font-black rounded-xl xs:rounded-2xl backdrop-blur-xl border-2 transition-all duration-500 inline-block w-full xs:w-auto text-center ${complaint.status === 'Pending'
                        ? 'bg-gradient-to-r from-red-500/20 to-red-600/20 text-red-300 border-red-400/50 shadow-[0_0_30px_rgba(239,68,68,0.3)]'
                        : complaint.status === 'In Progress'
                          ? 'bg-gradient-to-r from-yellow-500/20 to-yellow-600/20 text-yellow-300 border-yellow-400/50 shadow-[0_0_30px_rgba(234,179,8,0.3)]'
                          : 'bg-gradient-to-r from-green-500/20 to-green-600/20 text-green-300 border-green-400/50 shadow-[0_0_30px_rgba(34,197,94,0.3)]'
                        }`}>
                        <span className="relative z-10">{complaint.status}</span>
                      </span>
                    </div>
                  </div>

                  {/* Futuristic Action Buttons */}
                  {(isOwner || isAdmin) && (
                    <div className="flex flex-row xs:flex-row gap-3 xs:gap-4 lg:flex-col w-full lg:w-auto">
                      <button
                        onClick={handleEditComplaint}
                        className="group relative inline-flex items-center justify-center px-4 xs:px-6 sm:px-8 md:px-10 py-3 xs:py-3.5 sm:py-4 md:py-5 font-bold rounded-xl xs:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 flex-1 lg:flex-none text-sm xs:text-base cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-white/20 to-cyan-400/0 will-change-transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <Edit className="relative z-10 w-4 h-4 xs:w-5 xs:h-5 mr-2 xs:mr-3 text-white will-change-transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
                        <span className="relative z-10 text-white">Edit</span>
                      </button>

                      <button
                        onClick={handleDeleteComplaint}
                        className="group relative inline-flex items-center justify-center px-4 xs:px-6 sm:px-8 md:px-10 py-3 xs:py-3.5 sm:py-4 md:py-5 font-bold rounded-xl xs:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-105 flex-1 lg:flex-none text-sm xs:text-base cursor-pointer"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-500 to-red-600"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400 to-red-500 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                        <div className="absolute inset-0 bg-gradient-to-r from-red-400/0 via-white/20 to-red-400/0 will-change-transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                        <Trash2 className="relative z-10 w-4 h-4 xs:w-5 xs:h-5 mr-2 xs:mr-3 text-white will-change-transform group-hover:scale-110 transition-transform duration-300 flex-shrink-0" />
                        <span className="relative z-10 text-white">Delete</span>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section with Holographic Panel */}
            <div className="p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16 border-b border-white/10">
              <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-6 xs:mb-8 sm:mb-10">
                <div className="w-0.5 xs:w-1 h-8 xs:h-10 sm:h-12 bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] flex-shrink-0"></div>
                <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Description
                </h2>
                <Sparkles className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-cyan-400 animate-pulse flex-shrink-0" />
              </div>

              <div className="relative group rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl overflow-hidden">
                {/* Holographic corner accents */}
                <div className="absolute top-0 left-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-2xl xs:rounded-tl-3xl"></div>
                <div className="absolute bottom-0 right-0 w-12 h-12 xs:w-16 xs:h-16 sm:w-20 sm:h-20 border-b-2 border-r-2 border-cyan-400/50 rounded-br-2xl xs:rounded-br-3xl"></div>

                {/* Glow effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-cyan-400/0 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                <p className="relative text-white/90 whitespace-pre-line leading-relaxed text-sm xs:text-base sm:text-lg break-words">
                  {complaint.description}
                </p>
              </div>

              {/* Futuristic Media Gallery */}
              {(complaint.images && complaint.images.length > 0) || complaint.video ? (
                <div className="mt-8 xs:mt-10 sm:mt-12 md:mt-14">
                  <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-6 xs:mb-8 sm:mb-10">
                    <div className="w-0.5 xs:w-1 h-8 xs:h-10 sm:h-12 bg-gradient-to-b from-purple-400 via-blue-400 to-cyan-400 rounded-full shadow-[0_0_20px_rgba(168,85,247,0.5)] flex-shrink-0"></div>
                    <h3 className="text-lg xs:text-xl sm:text-2xl font-black bg-gradient-to-r from-purple-400 to-cyan-400 bg-clip-text text-transparent">
                      Attachments
                    </h3>
                    <div className="px-3 xs:px-4 py-1.5 xs:py-2 rounded-full bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-400/30">
                      <span className="text-purple-300 font-bold text-xs xs:text-sm">{(complaint.images?.length || 0) + (complaint.video ? 1 : 0)}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 xl:grid-cols-4 gap-3 xs:gap-4 sm:gap-5 md:gap-6">
                    {complaint.images?.map((image, index) => (
                      <MediaCard
                        key={`img-${index}`}
                        item={{ src: image, type: 'image' }}
                        index={index}
                        onClick={() => handleMediaClick({ src: image })}
                      />
                    ))}
                    {complaint.video && (
                      <MediaCard
                        key="video-0"
                        item={{ src: complaint.video, type: 'video' }}
                        index={complaint.images?.length || 0}
                        onClick={() => handleMediaClick({ src: complaint.video })}
                      />
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Futuristic Comments Section */}
            <div className="p-4 xs:p-6 sm:p-8 md:p-10 lg:p-12 xl:p-16">
              <div className="flex items-center gap-2 xs:gap-3 sm:gap-4 mb-8 xs:mb-10 sm:mb-12">
                <div className="w-0.5 xs:w-1 h-8 xs:h-10 sm:h-12 bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-400 rounded-full shadow-[0_0_20px_rgba(34,211,238,0.5)] flex-shrink-0"></div>
                <h2 className="text-xl xs:text-2xl sm:text-3xl md:text-4xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                  Comments
                </h2>
                <div className="px-3 xs:px-4 sm:px-5 py-1.5 xs:py-2 rounded-full bg-gradient-to-r from-cyan-500/20 to-blue-500/20 border border-cyan-400/30">
                  <span className="text-cyan-300 font-bold text-xs xs:text-sm">{complaint.comments ? complaint.comments.length : 0}</span>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-4 xs:space-y-6 sm:space-y-8 mb-8 xs:mb-10 sm:mb-12">
                {complaint.comments && complaint.comments.length > 0 ? (
                  complaint.comments.map((comment) => {
                    const u = resolveUser(comment.user);
                    const canEditComment = (currentUser || admin) && (
                      ((comment.user && currentUser && String(comment.user._id) === String(currentUser._id))) ||
                      (comment.authorRole === 'admin' && admin && String(comment.user._id) === String(admin._id))
                    );

                    return (
                      <div key={comment._id} className="group relative rounded-2xl xs:rounded-3xl overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl hover:border-cyan-400/30 transition-all duration-500 hover:shadow-[0_0_40px_rgba(34,211,238,0.2)]">
                        {/* Holographic glow on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-purple-400/0 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

                        <div className="relative p-4 xs:p-6 sm:p-8 md:p-10">
                          <div className="flex items-start space-x-3 xs:space-x-4 sm:space-x-6">
                            <Avatar
                              src={u.profilePic}
                              alt={u.fullName}
                              size="md"
                              showAdminBadge={u.authorRole === 'admin'}
                            />

                            <div className="flex-1 min-w-0">
                              {/* Comment Header */}
                              <div className="flex flex-col gap-3 xs:gap-4 mb-3 xs:mb-4 sm:mb-5">
                                <div>
                                  <p className="text-base xs:text-lg sm:text-xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent break-words">
                                    {u.fullName || 'Unknown'}
                                  </p>
                                  {u.authorRole !== 'admin' && u.flatNumber && (
                                    <p className="text-xs xs:text-sm text-white/50 mt-1 flex items-center gap-2">
                                      <Home className="w-3 h-3 flex-shrink-0" />
                                      <span>Flat No: {u.flatNumber}</span>
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-wrap items-center gap-2 xs:gap-3">
                                  <div className="flex items-center gap-1.5 xs:gap-2 text-xs xs:text-sm text-white/50 bg-white/5 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full border border-white/10">
                                    <Clock className="w-3 h-3 flex-shrink-0" />
                                    <span className="truncate">{formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}</span>
                                  </div>

                                  {canEditComment && (
                                    <div className="flex gap-2">
                                      <button
                                        onClick={() => { setEditingCommentId(comment._id); setEditText(comment.text); }}
                                        className="text-xs xs:text-sm font-medium text-cyan-400 hover:text-cyan-300 bg-cyan-500/10 hover:bg-cyan-500/20 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full transition-all duration-300 border border-cyan-400/20 whitespace-nowrap cursor-pointer"
                                      >
                                        Edit
                                      </button>
                                      <button
                                        onClick={() => handleDeleteComment(comment._id)}
                                        className="text-xs xs:text-sm font-medium text-red-400 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 px-3 xs:px-4 py-1.5 xs:py-2 rounded-full transition-all duration-300 border border-red-400/20 whitespace-nowrap cursor-pointer"
                                      >
                                        Delete
                                      </button>
                                    </div>
                                  )}
                                </div>
                              </div>

                              {/* Comment Content */}
                              <div className="relative">
                                {editingCommentId === comment._id ? (
                                  <div className="space-y-4 xs:space-y-5">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full p-4 xs:p-5 sm:p-6 rounded-xl xs:rounded-2xl resize-none transition-all duration-300 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 focus:border-cyan-400/50 text-white placeholder-white/40 outline-none text-sm xs:text-base"
                                      rows={3}
                                      placeholder="Edit your comment..."
                                    />
                                    <div className="flex flex-col xs:flex-row gap-3 xs:gap-4">
                                      <button
                                        className="group relative px-6 xs:px-8 py-2.5 xs:py-3 text-white font-bold rounded-xl xs:rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 text-sm xs:text-base order-1 xs:order-1 cursor-pointer"
                                        onClick={async () => {
                                          if (!editText.trim()) return toast.error('Comment cannot be empty');
                                          try {
                                            setOpLoadingId(comment._id + ':edit');
                                            await axios.put(`/api/complaints/${id}/comment`, { commentId: comment._id, text: editText });
                                            setEditingCommentId(null);
                                            setEditText('');
                                            await fetchComplaint();
                                            toast.success('Comment updated');
                                          } catch (err) {
                                            toast.error(err?.message || 'Failed to update comment');
                                          } finally { setOpLoadingId(null); }
                                        }}
                                      >
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                                        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                        <span className="relative z-10">Save Changes</span>
                                      </button>
                                      <button
                                        className="px-6 xs:px-8 py-2.5 xs:py-3 font-bold rounded-xl xs:rounded-2xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-xl border border-white/20 text-white hover:border-white/40 transition-all duration-300 text-sm xs:text-base order-2 xs:order-2 cursor-pointer"
                                        onClick={() => { setEditingCommentId(null); setEditText(''); }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-white/90 leading-relaxed text-sm xs:text-base break-words">{comment.text}</p>
                                )}
                              </div>

                              {/* Replies with Neon Connector */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-6 xs:mt-8 sm:mt-10 pl-4 xs:pl-6 sm:pl-8 md:pl-12 space-y-3 xs:space-y-4 sm:space-y-5 border-l-2 border-gradient-to-b from-cyan-400 via-blue-400 to-purple-400 relative">
                                  <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-cyan-400 via-blue-400 to-purple-400 shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                                  {comment.replies.map((reply) => (
                                    <ReplyCard
                                      key={reply._id}
                                      reply={reply}
                                      comment={comment}
                                      id={id}
                                      resolveUser={resolveUser}
                                      currentUser={currentUser}
                                      admin={admin}
                                      setEditingReply={setEditingReply}
                                      setEditText={setEditText}
                                      handleDeleteReply={handleDeleteReply}
                                      fetchComplaint={fetchComplaint}
                                    />
                                  ))}
                                </div>
                              )}

                              {/* Reply Button */}
                              {(currentUser || admin) && (
                                <div className="mt-6 xs:mt-8 pl-4 xs:pl-6 sm:pl-8 md:pl-12">
                                  <ReplyButton commentId={comment._id} complaintId={id} onReplyAdded={fetchComplaint} />
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="text-center py-12 xs:py-16 sm:py-20 md:py-24">
                    <div className="relative rounded-2xl xs:rounded-3xl p-8 xs:p-12 sm:p-14 md:p-16 mx-auto max-w-md border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-xl overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/5 to-purple-400/0"></div>
                      <div className="relative">
                        <div className="text-white/20 text-5xl xs:text-6xl sm:text-7xl mb-4 xs:mb-6 sm:mb-8 animate-pulse">💬</div>
                        <h3 className="text-xl xs:text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3 xs:mb-4">No Comments Yet</h3>
                        <p className="text-white/50 text-sm xs:text-base sm:text-lg">Be the first to share your thoughts!</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Futuristic Comment Input */}
              {(currentUser || admin) ? (
                socket ? (
                  <div className="relative rounded-2xl xs:rounded-3xl p-4 xs:p-6 sm:p-8 md:p-10 border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl overflow-hidden">

                    <form onSubmit={handleCommentSubmit} className="relative space-y-4 xs:space-y-5 sm:space-y-6">
                      <div className="flex flex-col xs:flex-row items-start space-y-3 xs:space-y-0 xs:space-x-4 sm:space-x-6">
                        <div className="flex-shrink-0 self-center xs:self-start">
                          <Avatar
                            src={(currentUser?.profilePic || admin?.profilePic)}
                            alt="Your avatar"
                            size="md"
                          />
                        </div>
                        <div className="flex-1 w-full">
                          <textarea
                            className="w-full rounded-xl xs:rounded-2xl p-4 xs:p-5 sm:p-6 resize-none transition-all duration-300 bg-gradient-to-br from-white/10 to-white/5 backdrop-blur-xl border border-white/20 focus:border-cyan-400/50 text-white placeholder-white/40 outline-none shadow-inner text-sm xs:text-base"
                            rows="4"
                            placeholder="Share your thoughts on this complaint..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="group relative inline-flex items-center justify-center px-6 xs:px-8 sm:px-10 md:px-12 py-3 xs:py-3.5 sm:py-4 md:py-5 text-sm xs:text-base font-black rounded-xl xs:rounded-2xl text-white disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden transition-all duration-500 hover:scale-105 disabled:hover:scale-100 w-full xs:w-auto cursor-pointer"
                          disabled={!newCommentText.trim()}
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 will-change-transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                          <MessageSquare className="relative z-10 w-5 h-5 xs:w-6 xs:h-6 mr-2 xs:mr-3 will-change-transform group-hover:rotate-12 transition-transform duration-300 flex-shrink-0" />
                          <span className="relative z-10">Post Comment</span>
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="rounded-2xl xs:rounded-3xl p-6 xs:p-8 sm:p-10 border border-yellow-400/30 bg-gradient-to-br from-yellow-500/10 to-orange-500/10 backdrop-blur-xl">
                    <div className="flex flex-col xs:flex-row items-center justify-center space-y-4 xs:space-y-0 xs:space-x-4 sm:space-x-6">
                      <div className="relative flex-shrink-0">
                        <div className="absolute inset-0 bg-yellow-400 blur-xl animate-pulse"></div>
                        <LoaderCircle className="animate-spin w-8 h-8 xs:w-10 xs:h-10 text-yellow-400 relative z-10" strokeWidth={2} />
                      </div>
                      <div className="text-center xs:text-left">
                        <h4 className="font-black text-yellow-300 text-base xs:text-lg sm:text-xl mb-1 xs:mb-2">Connecting to real-time service...</h4>
                        <p className="text-xs xs:text-sm text-yellow-400/80">Please wait a moment to start commenting.</p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="relative rounded-2xl xs:rounded-3xl p-8 xs:p-10 sm:p-12 md:p-14 text-center border border-cyan-400/30 bg-gradient-to-br from-cyan-500/10 to-blue-500/10 backdrop-blur-xl overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/10 to-cyan-400/0"></div>
                  <div className="relative">
                    <div className="text-cyan-400 text-5xl xs:text-6xl sm:text-7xl md:text-8xl mb-4 xs:mb-6 sm:mb-8 animate-bounce-slow">🔐</div>
                    <h4 className="text-xl xs:text-2xl sm:text-3xl font-black bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-3 xs:mb-4">Join the Conversation</h4>
                    <p className="text-white/60 text-sm xs:text-base sm:text-lg mb-6 xs:mb-8 px-4">Please log in to add your comments and engage with this complaint.</p>
                    <button
                      onClick={handleLoginClick}
                      className="group relative inline-flex items-center justify-center px-8 xs:px-10 sm:px-12 py-3 xs:py-4 sm:py-5 text-white font-black rounded-xl xs:rounded-2xl overflow-hidden transition-all duration-500 hover:scale-110 text-sm xs:text-base w-full xs:w-auto"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-500 will-change-opacity opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 will-change-transform translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700"></div>
                      <span className="relative z-10">Sign In</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Modal */}
      {pendingDelete && (
        <ConfirmationModal
          isOpen={!!pendingDelete}
          onClose={() => setPendingDelete(null)}
          title={pendingDelete.type === 'comment' ? 'Delete Comment' : 'Delete Reply'}
          message={`You're about to delete the following ${pendingDelete.type}: "${pendingDelete.text}". This action will permanently remove it from the complaint.`}
          onConfirm={async () => {
            try {
              setOpLoadingId((pendingDelete.commentId || pendingDelete.replyId) + ':del');
              if (pendingDelete.type === 'comment') {
                await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId: pendingDelete.commentId } });
              } else {
                await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId: pendingDelete.commentId, replyId: pendingDelete.replyId } });
              }
              toast.success('Deleted successfully');
              setPendingDelete(null);
              await fetchComplaint();
            } catch (err) {
              console.error('Delete error', err);
              toast.error(err?.response?.data?.message || err?.message || 'Failed to delete');
            } finally {
              setOpLoadingId(null);
            }
          }}
        />
      )}

      {/* Lightbox */}
      {lightboxOpen && slides.length > 0 && (
        <Lightbox
          slides={slides}
          open={lightboxOpen}
          index={photoIndex}
          close={() => setLightboxOpen(false)}
          on={{ view: ({ index }) => setPhotoIndex(index) }}
          plugins={[Video]}
        />
      )}

      <style jsx>{`
        @keyframes float {
          0%, 100% { transform: translate3d(0, 0, 0) rotate(0deg); }
          33% { transform: translate3d(30px, -30px, 0) rotate(5deg); }
          66% { transform: translate3d(-20px, 20px, 0) rotate(-5deg); }
        }
        
        @keyframes scan-line {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100%); }
        }
        
        @keyframes scan-slow {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(200%); }
        }
        
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        
        @keyframes bounce-slow {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-20px); }
        }
        
        .animate-float {
          animation: float 6s ease-in-out infinite;
        }
        
        .animate-scan-line {
          animation: scan-line 2s linear infinite;
        }
        
        .animate-scan-slow {
          animation: scan-slow 8s linear infinite;
        }
        
        .animate-shimmer {
          animation: shimmer 3s linear infinite;
        }
        
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
        
        .animate-bounce-slow {
          animation: bounce-slow 2s ease-in-out infinite;
        }

        /* Custom breakpoint for extra small devices */
        @media (min-width: 320px) {
          .xs\:w-10 { width: 2.5rem; }
          .xs\:h-10 { height: 2.5rem; }
          .xs\:space-x-2 { margin-right: 0.5rem; margin-left: 0.5rem; }
          .xs\:text-xs { font-size: 0.75rem; line-height: 1rem; }
          .xs\:px-3 { padding-left: 0.75rem; padding-right: 0.75rem; }
          .xs\:py-1\.5 { padding-top: 0.375rem; padding-bottom: 0.375rem; }
          .xs\:gap-2 { gap: 0.5rem; }
          .xs\:w-3 { width: 0.75rem; }
          .xs\:h-3 { height: 0.75rem; }
        }

        @media (min-width: 375px) {
          .xxs\:w-10 { width: 2.5rem; }
          .xxs\:h-10 { height: 2.5rem; }
        }
      `}</style>
    </div>
  );
};

export default ViewComplaintPage;