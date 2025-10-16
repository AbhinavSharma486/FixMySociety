import React, { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { format } from 'date-fns';
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Edit3,
  Filter,
  Search,
  RefreshCw,
  Image as ImageIcon,
  Video as VideoIcon,
  X,
  Trash2,
  MessageSquare,
  Heart,
  Send,
  Sparkles,
  TrendingUp,
  Zap
} from 'lucide-react';
import { getAllComplaintsAdmin, deleteComplaintAdmin, updateComplaintStatusAdmin } from '../../lib/adminService';
import toast from 'react-hot-toast';
import PhotoAlbum from "react-photo-album";
import Lightbox from "yet-another-react-lightbox";
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import ConfirmationModal from '../components/ConfirmationModal';
import { useSelector } from 'react-redux';
import { axiosInstance as axios } from '../../lib/axios';
import socket from '../../lib/socket';

// Memoized StatCard component to prevent unnecessary re-renders
const StatCard = memo(({ stat, idx }) => {
  return (
    <div
      className="stat-card glass-card rounded-2xl p-6 hover-lift group cursor-pointer"
      style={{ '--index': idx, animationDelay: stat.delay }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} floating`}>
          <stat.icon className="w-6 h-6 text-white" />
        </div>
        <TrendingUp className="w-5 h-5 text-gray-400 group-hover:text-green-400 transition-colors" />
      </div>
      <h3 className="text-gray-400 text-sm font-medium mb-2">{stat.title}</h3>
      <p className="text-4xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
        {stat.value}
      </p>
    </div>
  );
});

// Memoized ComplaintRow component
const ComplaintRow = memo(({ complaint, onView, onStatusUpdate, onDelete, getStatusColor, getStatusIcon }) => {
  const handleStatusChange = useCallback((e) => {
    onStatusUpdate(complaint._id, e.target.value);
  }, [complaint._id, onStatusUpdate]);

  const handleViewClick = useCallback(() => {
    onView(complaint);
  }, [complaint, onView]);

  const handleDeleteClick = useCallback(() => {
    onDelete(complaint);
  }, [complaint, onDelete]);

  return (
    <tr className="table-row-hover">
      <td className="px-6 py-4">
        <div className="max-w-xs">
          <p className="font-semibold text-gray-200 mb-1">{complaint.title}</p>
          <p className="text-sm text-gray-400 line-clamp-2">{complaint.description}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <div>
          <p className="font-medium text-gray-200">{complaint.user?.fullName || 'Unknown'}</p>
          <p className="text-sm text-gray-400">Flat {complaint.flatNumber}</p>
        </div>
      </td>
      <td className="px-6 py-4">
        <p className="text-gray-200">{complaint.buildingName?.buildingName || 'N/A'}</p>
      </td>
      <td className="px-6 py-4">
        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-500/30">
          {complaint.category}
        </span>
      </td>
      <td className="px-6 py-4">
        <span className={`flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${getStatusColor(complaint.status)} text-white w-fit`}>
          {getStatusIcon(complaint.status)}
          {complaint.status}
        </span>
      </td>
      <td className="px-6 py-4">
        <p className="text-sm text-gray-300">{format(new Date(complaint.createdAt), 'dd/MM/yyyy')}</p>
      </td>
      <td className="px-6 py-4">
        <div className="flex items-center gap-2">
          <button
            className="p-2 hover:bg-blue-500/20 rounded-lg transition-all group"
            onClick={handleViewClick}
          >
            <Eye className="w-4 h-4 text-gray-400 group-hover:text-blue-400" />
          </button>
          <select
            className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-sm text-gray-200 cursor-pointer hover:border-blue-500/50 transition-all"
            value={complaint.status}
            onChange={handleStatusChange}
          >
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>
          {complaint.status === "Resolved" && (
            <button
              className="p-2 hover:bg-red-500/20 rounded-lg transition-all group"
              onClick={handleDeleteClick}
            >
              <Trash2 className="w-4 h-4 text-gray-400 group-hover:text-red-400" />
            </button>
          )}
        </div>
      </td>
    </tr>
  );
});

// Memoized Comment component
const CommentItem = memo(({
  comment,
  admin,
  resolveUser,
  editingCommentId,
  editText,
  setEditText,
  setEditingCommentId,
  handleEditComment,
  handleDeleteComment,
  editingReply,
  setEditingReply,
  handleEditReply,
  handleDeleteReply
}) => {
  const u = useMemo(() => resolveUser(comment.user), [comment.user, resolveUser]);
  const isAdminAuthor = useMemo(() =>
    admin && comment.user && String(comment.user?._id) === String(admin._id) && comment.authorRole === 'admin',
    [admin, comment.user, comment.authorRole]
  );

  const handleEditClick = useCallback(() => {
    setEditingCommentId(comment._id);
    setEditText(comment.text);
  }, [comment._id, comment.text, setEditingCommentId, setEditText]);

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim()) return toast.error('Comment cannot be empty');
    await handleEditComment(comment._id);
    setEditingCommentId(null);
    setEditText('');
  }, [editText, handleEditComment, comment._id, setEditingCommentId, setEditText]);

  const handleCancelEdit = useCallback(() => {
    setEditingCommentId(null);
    setEditText('');
  }, [setEditingCommentId, setEditText]);

  const handleDeleteClick = useCallback(() => {
    handleDeleteComment(comment._id);
  }, [comment._id, handleDeleteComment]);

  return (
    <div className="glass-card rounded-xl p-4 hover-lift">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-3">
          <img
            src={u.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
            alt={u.fullName || 'Anonymous'}
            className="w-10 h-10 rounded-full object-cover ring-2 ring-blue-500/30"
          />
          <div>
            <p className="font-semibold text-gray-200">{u.fullName || 'Unknown'}</p>
            {u.authorRole !== 'admin' && (
              <p className="text-xs text-gray-500">Flat {u.flatNumber || 'N/A'}</p>
            )}
          </div>
        </div>
        <span className="text-xs text-gray-400">{format(new Date(comment.createdAt), 'dd/MM/yyyy')}</span>
      </div>

      {editingCommentId === comment._id ? (
        <div className="space-y-2">
          <textarea
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            className="w-full p-3 bg-white/5 border border-white/10 rounded-lg text-gray-200 focus:outline-none input-glow"
            rows={3}
          />
          <div className="flex gap-2">
            <button
              className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className="px-4 py-2 bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <div className="relative">
          <p className="text-gray-300">{comment.text}</p>
          {comment.editedAt && (
            <span className="text-xs text-gray-500 italic ml-2">
              (edited {format(new Date(comment.editedAt), 'dd/MM/yyyy')})
            </span>
          )}
          {isAdminAuthor && (
            <div className="absolute top-0 right-0 flex gap-2">
              <button
                onClick={handleEditClick}
                className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
              >
                Edit
              </button>
              <button
                onClick={handleDeleteClick}
                className="text-xs text-red-400 hover:text-red-300 transition-colors"
              >
                Delete
              </button>
            </div>
          )}
        </div>
      )}

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 pl-4 border-l-2 border-purple-500/30 space-y-2">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply._id}
              reply={reply}
              comment={comment}
              admin={admin}
              resolveUser={resolveUser}
              editingReply={editingReply}
              editText={editText}
              setEditText={setEditText}
              setEditingReply={setEditingReply}
              handleEditReply={handleEditReply}
              handleDeleteReply={handleDeleteReply}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Memoized Reply component
const ReplyItem = memo(({
  reply,
  comment,
  admin,
  resolveUser,
  editingReply,
  editText,
  setEditText,
  setEditingReply,
  handleEditReply,
  handleDeleteReply
}) => {
  const ru = useMemo(() => resolveUser(reply.user), [reply.user, resolveUser]);
  const isAdminReplyAuthor = useMemo(() =>
    admin && reply.user && String(reply.user?._id) === String(admin._id) && reply.authorRole === 'admin',
    [admin, reply.user, reply.authorRole]
  );

  const handleEditClick = useCallback(() => {
    setEditingReply({ commentId: comment._id, replyId: reply._id });
    setEditText(reply.text);
  }, [comment._id, reply._id, reply.text, setEditingReply, setEditText]);

  const handleSaveEdit = useCallback(async () => {
    if (!editText.trim()) return toast.error('Reply cannot be empty');
    await handleEditReply(comment._id, reply._id);
    setEditingReply({ commentId: null, replyId: null });
    setEditText('');
  }, [editText, handleEditReply, comment._id, reply._id, setEditingReply, setEditText]);

  const handleCancelEdit = useCallback(() => {
    setEditingReply({ commentId: null, replyId: null });
    setEditText('');
  }, [setEditingReply, setEditText]);

  const handleDeleteClick = useCallback(() => {
    handleDeleteReply(comment._id, reply._id);
  }, [comment._id, reply._id, handleDeleteReply]);

  const isEditing = editingReply.commentId === comment._id && editingReply.replyId === reply._id;

  return (
    <div className="bg-white/5 rounded-lg p-3 relative">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <img
            src={ru.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
            alt={ru.fullName || 'Anonymous'}
            className="w-7 h-7 rounded-full object-cover ring-1 ring-purple-500/30"
          />
          <p className="text-sm font-semibold text-gray-300">{ru.fullName || 'Unknown'}</p>
        </div>
        <p className="text-xs text-gray-500">{format(new Date(reply.createdAt), 'dd/MM/yyyy')}</p>
      </div>

      {isEditing ? (
        <div className="space-y-2">
          <textarea
            className="w-full p-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 text-sm focus:outline-none input-glow"
            rows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
          <div className="flex gap-2">
            <button
              className="px-3 py-1 text-sm bg-gradient-to-r from-blue-500 to-purple-600 rounded-lg font-semibold hover:from-blue-600 hover:to-purple-700 transition-all"
              onClick={handleSaveEdit}
            >
              Save
            </button>
            <button
              className="px-3 py-1 text-sm bg-white/5 rounded-lg hover:bg-white/10 transition-all"
              onClick={handleCancelEdit}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-300">{reply.text}</p>
          {reply.editedAt && (
            <span className="text-xs text-gray-500 italic ml-2">
              (edited {format(new Date(reply.editedAt), 'dd/MM/yyyy')})
            </span>
          )}
        </>
      )}

      {isAdminReplyAuthor && (
        <div className="absolute top-2 right-2 flex gap-2">
          <button
            onClick={handleEditClick}
            className="text-xs text-blue-400 hover:text-blue-300 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={handleDeleteClick}
            className="text-xs text-red-400 hover:text-red-300 transition-colors"
          >
            Delete
          </button>
        </div>
      )}
    </div>
  );
});

const ComplaintManagement = ({ complaints, buildings, analytics, onStatusChange }) => {
  const [loading, setLoading] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [complaintToDelete, setComplaintToDelete] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
  const [editText, setEditText] = useState('');
  const [opLoadingId, setOpLoadingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);
  const [newCommentText, setNewCommentText] = useState('');
  const { admin } = useSelector(state => state.admin);

  useEffect(() => {
    if (!selectedComplaint) return;

    if (socket && selectedComplaint._id) {
      console.log(`[ComplaintManagement] Joining complaint room: ${selectedComplaint._id}`);
      socket.emit("joinComplaintRoom", selectedComplaint._id);

      const handleNewComment = (data) => {
        console.log('[ComplaintManagement] Received new comment:', data);
        if (data.complaintId === selectedComplaint._id) {
          setSelectedComplaint((prevComplaint) => {
            if (!prevComplaint) return null;
            const commentExists = prevComplaint.comments.some(c => String(c._id) === String(data.comment?._id));
            if (commentExists) return prevComplaint;
            setTimeout(() => {
              toast.success("Comment added successfully!");
            }, 0);
            return {
              ...prevComplaint,
              comments: [...prevComplaint.comments, data.comment],
            };
          });
        }
      };

      const handleNewReply = (data) => {
        console.log('[ComplaintManagement] Received new reply:', data);
        if (data.complaintId === selectedComplaint._id) {
          setSelectedComplaint((prevComplaint) => {
            if (!prevComplaint) return null;

            const nextComments = prevComplaint.comments.map(comment => {
              if (comment._id === data.parentCommentId) {
                const replyExists = comment.replies.some(r => r._id === data.reply?._id);
                if (replyExists) return comment;
                setTimeout(() => {
                  toast.success("Reply added successfully!");
                }, 0);
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
        console.log(`[ComplaintManagement] Leaving complaint room: ${selectedComplaint._id}`);
        socket.emit("leaveComplaintRoom", selectedComplaint._id);
        socket.off("comment:added", handleNewComment);
        socket.off("reply:added", handleNewReply);
      };
    }
  }, [selectedComplaint]);

  const handleStatusUpdate = useCallback(async (complaintId, newStatus) => {
    try {
      await updateComplaintStatusAdmin(complaintId, newStatus);
      toast.success('Complaint status updated successfully');
      if (onStatusChange) {
        onStatusChange();
      }
      if (selectedComplaint?._id === complaintId) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  }, [onStatusChange, selectedComplaint]);

  const handleDeleteClick = useCallback((complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  }, []);

  const handleDeleteConfirm = useCallback(async () => {
    try {
      if (complaintToDelete) {
        await deleteComplaintAdmin(complaintToDelete._id);
        toast.success('Complaint deleted successfully!');
        setIsDeleteModalOpen(false);
        setComplaintToDelete(null);
        if (onStatusChange) {
          onStatusChange();
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete complaint.');
    }
  }, [complaintToDelete, onStatusChange]);

  const resolveUser = useCallback((user) => {
    if (user && typeof user === 'object' && user._id) {
      const id = user._id;
      let fullName = user.fullName;
      let profilePic = user.profilePic;
      let flatNumber = user.flatNumber;
      const authorRole = user.authorRole;

      if (authorRole === 'admin') {
        fullName = "Admin";
        profilePic = admin?.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png";
        flatNumber = null;
      }
      return { id, fullName, profilePic, flatNumber, authorRole };
    }

    if (!user) return { id: null, fullName: null, profilePic: null, flatNumber: null, authorRole: null };

    const id = user._id || user;
    let fullName = user.fullName;
    let profilePic = user.profilePic;
    let flatNumber = user.flatNumber;
    const authorRole = user.authorRole;

    if (authorRole === 'admin') {
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

    return { id, fullName, profilePic, flatNumber, authorRole };
  }, [admin]);

  const handleEditComment = useCallback(async (commentId) => {
    if (!editText.trim()) return toast.error('Comment text cannot be empty.');

    try {
      setOpLoadingId(commentId + ':edit');
      await axios.put(`/api/complaints/${selectedComplaint._id}/comment`, { commentId, text: editText });
      toast.success('Comment edited');
      setSelectedComplaint(prev => {
        if (!prev) return null;
        const nextComments = prev.comments.map(c => c._id === commentId ? { ...c, text: editText, editedAt: new Date().toISOString() } : c);
        return { ...prev, comments: nextComments };
      });
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit comment');
    } finally { setOpLoadingId(null); }
  }, [editText, selectedComplaint]);

  const handleDeleteComment = useCallback((commentId) => {
    setPendingDelete({ type: 'comment', commentId });
  }, []);

  const handleEditReply = useCallback(async (commentId, replyId) => {
    if (!editText.trim()) return toast.error('Reply text cannot be empty.');

    try {
      setOpLoadingId(replyId + ':edit');
      await axios.put(`/api/complaints/${selectedComplaint._id}/comment`, { commentId, replyId, text: editText });
      toast.success('Reply edited');
      setSelectedComplaint(prev => {
        if (!prev) return null;
        const nextComments = prev.comments.map(c => {
          if (c._id === commentId) {
            const nextReplies = c.replies.map(r => r._id === replyId ? { ...r, text: editText, editedAt: new Date().toISOString() } : r);
            return { ...c, replies: nextReplies };
          }
          return c;
        });
        return { ...prev, comments: nextComments };
      });
      setEditingReply({ commentId: null, replyId: null });
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit reply');
    } finally { setOpLoadingId(null); }
  }, [editText, selectedComplaint]);

  const handleDeleteReply = useCallback((commentId, replyId) => {
    setPendingDelete({ type: 'reply', commentId, replyId });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    const { type, commentId, replyId } = pendingDelete;

    try {
      if (type === 'comment') {
        setOpLoadingId(commentId + ':del');
        await axios.delete(`/api/complaints/${selectedComplaint._id}/comment`, { data: { commentId } });
        toast.success('Comment deleted');
        setSelectedComplaint(prev => {
          if (!prev) return null;
          const nextComments = prev.comments.filter(c => c._id !== commentId);
          return { ...prev, comments: nextComments };
        });
      } else if (type === 'reply') {
        setOpLoadingId(replyId + ':del');
        await axios.delete(`/api/complaints/${selectedComplaint._id}/comment`, { data: { commentId, replyId } });
        toast.success('Reply deleted');
        setSelectedComplaint(prev => {
          if (!prev) return null;
          const nextComments = prev.comments.map(c => {
            if (c._id === commentId) {
              const nextReplies = c.replies.filter(r => r._id !== replyId);
              return { ...c, replies: nextReplies };
            }
            return c;
          });
          return { ...prev, comments: nextComments };
        });
      }
    } catch (err) {
      toast.error(err?.message || 'Failed to delete item');
    } finally {
      setOpLoadingId(null);
      setPendingDelete(null);
    }
  }, [pendingDelete, selectedComplaint]);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleCommentSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return toast.error('Comment cannot be empty');
    try {
      setOpLoadingId('newComment');
      const response = await axios.post(`/api/complaints/${selectedComplaint._id}/comment`, { text: newCommentText });
      toast.success('Comment added successfully!');
      setNewCommentText('');
      if (onStatusChange) onStatusChange();
      setSelectedComplaint(prev => {
        if (!prev) return null;
        const commentExists = prev.comments.some(c => String(c._id) === String(response.data?.comment?._id));
        if (commentExists) return prev;
        return {
          ...prev,
          comments: [...prev.comments, response.data?.comment]
        };
      });
    } catch (err) {
      toast.error(err?.message || 'Failed to add comment');
    } finally { setOpLoadingId(null); }
  }, [newCommentText, selectedComplaint, onStatusChange]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Pending': return 'from-amber-500 to-orange-600';
      case 'In Progress': return 'from-blue-500 to-cyan-600';
      case 'Resolved': return 'from-emerald-500 to-green-600';
      default: return 'from-gray-500 to-slate-600';
    }
  }, []);

  const getStatusIcon = useCallback((status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <Zap className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  }, []);

  const openLightbox = useCallback((clickedItem) => {
    const index = slides.findIndex(slide => slide.idx === clickedItem.idx);
    if (index !== -1) {
      setPhotoIndex(index);
      setLightboxOpen(true);
    }
  }, []);

  // Memoized filtered complaints - prevent unnecessary recalculations
  const filteredComplaints = useMemo(() => {
    return complaints.filter(complaint => {
      const matchesStatus = filters.status === 'all' || complaint.status === filters.status;
      const matchesCategory = filters.category === 'all' || complaint.category === filters.category;
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = filters.search === '' ||
        complaint.title.toLowerCase().includes(searchLower) ||
        complaint.description.toLowerCase().includes(searchLower) ||
        complaint.user?.fullName?.toLowerCase().includes(searchLower);

      return matchesStatus && matchesCategory && matchesSearch;
    });
  }, [complaints, filters]);

  // Memoized status counts
  const statusCounts = useMemo(() => {
    if (analytics?.overview) {
      return {
        all: analytics.overview.totalComplaints,
        Pending: analytics.overview.pendingComplaints,
        'In Progress': analytics.overview.inProgressComplaints,
        Resolved: analytics.overview.resolvedComplaints
      };
    }
    return {
      all: complaints.length,
      Pending: complaints.filter(c => c.status === 'Pending').length,
      'In Progress': complaints.filter(c => c.status === 'In Progress').length,
      Resolved: complaints.filter(c => c.status === 'Resolved').length
    };
  }, [analytics, complaints]);

  // Memoized slides for lightbox
  const slides = useMemo(() => {
    const images = selectedComplaint?.images || [];
    const videoUrl = selectedComplaint?.video;

    return [
      ...images.map((src, idx) => ({
        src,
        type: "image",
        idx: `image-${idx}`
      })),
      ...(videoUrl ? [{
        src: videoUrl,
        type: "video",
        sources: [{ src: videoUrl, type: "video/mp4" }],
        idx: `video-0`
      }] : []),
    ];
  }, [selectedComplaint]);

  // Memoized stat cards data
  const statCardsData = useMemo(() => [
    { title: 'Total Complaints', value: statusCounts.all, icon: AlertTriangle, gradient: 'from-blue-500 to-cyan-500', delay: '0s' },
    { title: 'Pending', value: statusCounts.Pending, icon: Clock, gradient: 'from-amber-500 to-orange-500', delay: '0.1s' },
    { title: 'In Progress', value: statusCounts['In Progress'], icon: Zap, gradient: 'from-blue-500 to-indigo-500', delay: '0.2s' },
    { title: 'Resolved', value: statusCounts.Resolved, icon: CheckCircle, gradient: 'from-emerald-500 to-green-500', delay: '0.3s' }
  ], [statusCounts]);

  // Memoized filter handlers with debouncing for search
  const handleSearchChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, search: e.target.value }));
  }, []);

  const handleStatusFilterChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, status: e.target.value }));
  }, []);

  const handleCategoryFilterChange = useCallback((e) => {
    setFilters(prev => ({ ...prev, category: e.target.value }));
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-8 space-y-8">
      <style>{`
        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(59, 130, 246, 0.5); }
          50% { box-shadow: 0 0 40px rgba(59, 130, 246, 0.8); }
        }

        @keyframes slideIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
        }

        .neon-border {
          border: 1px solid transparent;
          background: linear-gradient(145deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2)) padding-box,
                      linear-gradient(145deg, #3b82f6, #9333ea) border-box;
        }

        .stat-card {
          animation: slideIn 0.6s ease-out forwards;
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          transform: translateY(-5px) scale(1.02);
        }

        .hover-lift {
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .hover-lift:hover {
          transform: translateY(-2px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .gradient-text {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
        }

        .shimmer {
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
          background-size: 200% 100%;
          animation: shimmer 2s infinite;
        }

        .floating {
          animation: float 3s ease-in-out infinite;
        }

        .pulse-glow {
          animation: glow 2s ease-in-out infinite;
        }

        .scroll-smooth {
          scroll-behavior: smooth;
        }

        .table-row-hover {
          transition: all 0.2s ease;
        }

        .table-row-hover:hover {
          background: linear-gradient(90deg, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1));
          transform: scale(1.01);
        }

        .input-glow:focus {
          box-shadow: 0 0 20px rgba(59, 130, 246, 0.3);
          border-color: #3b82f6;
        }

        .modal-backdrop {
          backdrop-filter: blur(10px);
          background: rgba(0, 0, 0, 0.6);
        }

        @media (max-width: 768px) {
          .stat-card {
            animation-delay: calc(var(--index) * 0.1s);
          }
        }
      `}</style>

      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 glass-card rounded-2xl p-6">
        <div>
          <h2 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-500 to-pink-500 bg-clip-text text-transparent">
            Complaint Management
          </h2>
          <p className="text-sm text-gray-400 mt-2">Monitor and manage all complaints in real-time</p>
        </div>
        <button
          onClick={onStatusChange}
          className="group flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-blue-500/50"
        >
          <RefreshCw className="w-4 h-4 group-hover:rotate-180 transition-transform duration-500" />
          <span className="font-semibold">Refresh</span>
        </button>
      </div>

      {/* Statistics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCardsData.map((stat, idx) => (
          <StatCard key={idx} stat={stat} idx={idx} />
        ))}
      </div>

      {/* Filters Section */}
      <div className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Filter className="w-5 h-5 text-blue-400" />
          <h3 className="text-xl font-semibold text-gray-200">Filters</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search complaints..."
              className="w-full pl-12 pr-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none input-glow transition-all text-gray-200 placeholder-gray-500"
              value={filters.search}
              onChange={handleSearchChange}
            />
          </div>

          <select
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none input-glow transition-all text-gray-200 cursor-pointer"
            value={filters.status}
            onChange={handleStatusFilterChange}
          >
            <option value="all">All Status</option>
            <option value="Pending">Pending</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
          </select>

          <select
            className="px-4 py-3 bg-white/5 border border-white/10 rounded-xl focus:outline-none input-glow transition-all text-gray-200 cursor-pointer"
            value={filters.category}
            onChange={handleCategoryFilterChange}
          >
            <option value="all">All Categories</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Water Management">Water Management</option>
            <option value="Electricity">Electricity</option>
            <option value="Security">Security</option>
            <option value="Waste Management">Waste Management</option>
            <option value="Building Structure">Building Structure</option>
            <option value="Elevators">Elevators</option>
            <option value="Parking">Parking</option>
            <option value="Fire Safety">Fire Safety</option>
            <option value="Financial Issues">Financial Issues</option>
            <option value="Social Nuisances">Social Nuisances</option>
            <option value="Other">Other</option>
          </select>
        </div>
      </div>

      {/* Complaints Table */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-600/20 to-purple-600/20">
              <tr>
                {['Complaint', 'User', 'Building', 'Category', 'Status', 'Date', 'Actions'].map((header) => (
                  <th key={header} className="px-6 py-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center space-y-3">
                      <Sparkles className="w-12 h-12 text-gray-600" />
                      <p className="text-gray-400 text-lg">No complaints found</p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <ComplaintRow
                    key={complaint._id}
                    complaint={complaint}
                    onView={setSelectedComplaint}
                    onStatusUpdate={handleStatusUpdate}
                    onDelete={handleDeleteClick}
                    getStatusColor={getStatusColor}
                    getStatusIcon={getStatusIcon}
                  />
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 modal-backdrop" onClick={() => setSelectedComplaint(null)}>
          <div className="glass-card rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto scroll-smooth" onClick={(e) => e.stopPropagation()}>
            <div className="sticky top-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-xl p-6 flex justify-between items-center border-b border-white/10 z-10">
              <h3 className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                Complaint Details
              </h3>
              <button onClick={() => setSelectedComplaint(null)} className="p-2 hover:bg-white/10 rounded-full transition-all group">
                <X className="w-6 h-6 text-gray-300 group-hover:text-white group-hover:rotate-90 transition-all duration-300" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Title & Description */}
              <div className="space-y-3">
                <h4 className="text-2xl font-bold text-gray-100">{selectedComplaint.title}</h4>
                <p className="text-gray-300 leading-relaxed">{selectedComplaint.description}</p>
              </div>

              {/* Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[
                  { label: 'User', value: selectedComplaint.user?.fullName || 'Unknown' },
                  { label: 'Building', value: selectedComplaint.buildingName?.buildingName || 'N/A' },
                  { label: 'Flat', value: selectedComplaint.flatNumber },
                  { label: 'Category', value: selectedComplaint.category },
                  { label: 'Reported On', value: format(new Date(selectedComplaint.createdAt), 'dd/MM/yyyy') }
                ].map((item, idx) => (
                  <div key={idx} className="bg-white/5 rounded-xl p-4 border border-white/10 hover:border-blue-500/30 transition-all">
                    <span className="text-xs text-gray-400 uppercase tracking-wider">{item.label}</span>
                    <p className="text-lg font-semibold text-gray-200 mt-1">{item.value}</p>
                  </div>
                ))}

                <div className="bg-white/5 rounded-xl p-4 border border-white/10">
                  <span className="text-xs text-gray-400 uppercase tracking-wider">Status</span>
                  <select
                    className="mt-2 w-full px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-200 cursor-pointer hover:border-blue-500/50 transition-all"
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusUpdate(selectedComplaint._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
              </div>

              {/* Likes */}
              {selectedComplaint.likes && (
                <div className="flex items-center gap-3 bg-gradient-to-r from-red-500/10 to-pink-500/10 rounded-xl p-4 border border-red-500/20">
                  <Heart className="w-5 h-5 text-red-400 fill-red-400" />
                  <span className="text-gray-200 font-semibold">{selectedComplaint.likes.length} Likes</span>
                </div>
              )}

              {/* Media Section */}
              {(selectedComplaint.images?.length > 0 || selectedComplaint.video) && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-blue-400" />
                    Media Gallery
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {selectedComplaint.images?.map((image, index) => (
                      <div
                        key={index}
                        className="relative group cursor-pointer overflow-hidden rounded-xl hover-lift"
                        onClick={() => openLightbox({ idx: `image-${index}` })}
                      >
                        <img src={image} alt={`Media ${index + 1}`} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <ImageIcon className="w-8 h-8 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                        </div>
                      </div>
                    ))}
                    {selectedComplaint.video && (
                      <div
                        key="video"
                        className="relative group cursor-pointer overflow-hidden rounded-xl hover-lift"
                        onClick={() => openLightbox({ idx: `video-0` })}
                      >
                        <video src={selectedComplaint.video} className="w-full h-32 object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                          <VideoIcon className="w-8 h-8 text-white transform scale-0 group-hover:scale-100 transition-transform duration-300" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Comments Section */}
              {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
                <div className="space-y-4">
                  <h3 className="text-xl font-semibold text-gray-200 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-purple-400" />
                    Comments ({selectedComplaint.comments.length})
                  </h3>
                  <div className="space-y-3 max-h-96 overflow-y-auto pr-2 scroll-smooth">
                    {selectedComplaint.comments.map((comment) => (
                      <CommentItem
                        key={comment._id}
                        comment={comment}
                        admin={admin}
                        resolveUser={resolveUser}
                        editingCommentId={editingCommentId}
                        editText={editText}
                        setEditText={setEditText}
                        setEditingCommentId={setEditingCommentId}
                        handleEditComment={handleEditComment}
                        handleDeleteComment={handleDeleteComment}
                        editingReply={editingReply}
                        setEditingReply={setEditingReply}
                        handleEditReply={handleEditReply}
                        handleDeleteReply={handleDeleteReply}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Add Comment */}
              <div className="glass-card rounded-xl p-6 space-y-4">
                <h3 className="text-lg font-semibold text-gray-200 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-yellow-400" />
                  Add Your Comment
                </h3>
                <form onSubmit={handleCommentSubmit} className="flex flex-col md:flex-row gap-3">
                  <textarea
                    className="flex-1 p-4 bg-white/5 border border-white/10 rounded-xl text-gray-200 placeholder-gray-500 focus:outline-none input-glow resize-none"
                    rows="3"
                    placeholder="Share your thoughts..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  ></textarea>
                  <button
                    type="submit"
                    className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 transition-all flex items-center justify-center gap-2 group shadow-lg hover:shadow-blue-500/50"
                    disabled={opLoadingId === 'newComment'}
                  >
                    {opLoadingId === 'newComment' ? (
                      <RefreshCw className="w-5 h-5 animate-spin" />
                    ) : (
                      <>
                        <Send className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </form>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gradient-to-r from-blue-600/30 to-purple-600/30 backdrop-blur-xl p-6 flex justify-between items-center border-t border-white/10">
              {selectedComplaint.status === "Resolved" && (
                <button
                  className="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-600 rounded-xl font-semibold hover:from-red-600 hover:to-pink-700 transition-all flex items-center gap-2 shadow-lg hover:shadow-red-500/50"
                  onClick={() => handleDeleteClick(selectedComplaint)}
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Complaint
                </button>
              )}
              <button
                onClick={() => setSelectedComplaint(null)}
                className="ml-auto px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-semibold transition-all"
              >
                Close
              </button>
            </div>
          </div>
        </div>
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

      {/* Confirmation Modals */}
      <ConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleDeleteConfirm}
        title="Confirm Complaint Deletion"
        message={`Are you sure you want to delete complaint "${complaintToDelete?.title}"? This action cannot be undone.`}
      />

      {pendingDelete && (
        <ConfirmationModal
          isOpen={!!pendingDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={`Confirm ${pendingDelete.type === 'comment' ? 'Comment' : 'Reply'} Deletion`}
          message={`Are you sure you want to delete this ${pendingDelete.type === 'comment' ? 'comment' : 'reply'}? This action cannot be undone.`}
        />
      )}
    </div>
  );
};

export default ComplaintManagement;