import React, { useState, useEffect } from 'react';
import { format } from 'date-fns'; // Import format from date-fns
import {
  AlertTriangle,
  Clock,
  CheckCircle,
  Eye,
  Edit3,
  Filter,
  Search,
  RefreshCw,
  Image as ImageIcon, // New import for media icons
  Video as VideoIcon, // New import for media icons
  X,
  Trash2, // New import for delete icon
  MessageSquare, // Explicitly added MessageSquare
  Heart // New import for Heart icon
} from 'lucide-react';
import { getAllComplaintsAdmin, deleteComplaintAdmin, updateComplaintStatusAdmin } from '../../lib/adminService'; // Update imports
import toast from 'react-hot-toast';

import PhotoAlbum from "react-photo-album"; // New import for react-photo-album
import Lightbox from "yet-another-react-lightbox"; // New import for yet-another-react-lightbox
import "yet-another-react-lightbox/styles.css"; // New import for lightbox styles
import Video from "yet-another-react-lightbox/plugins/video"; // New import for video plugin
import ConfirmationModal from '../components/ConfirmationModal'; // New import for ConfirmationModal
// Removed: import Lightbox from 'react-image-lightbox'; // For image lightbox
// Removed: import 'react-image-lightbox/style.css'; // Import lightbox styles
import { useSelector } from 'react-redux';
import { axiosInstance as axios } from '../../lib/axios'; // New import for axios
import socket from '../../lib/socket'; // Changed to default import

const ComplaintManagement = ({ complaints, buildings, analytics, onStatusChange }) => {
  const [loading, setLoading] = useState(false); // No longer loading within component, assumed by parent
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [filters, setFilters] = useState({
    status: 'all',
    category: 'all',
    search: ''
  });
  const [lightboxOpen, setLightboxOpen] = useState(false); // State for image lightbox
  const [photoIndex, setPhotoIndex] = useState(0); // State for current image index
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false); // New state for delete confirmation
  const [complaintToDelete, setComplaintToDelete] = useState(null); // New state to hold complaint to be deleted
  // New states for editing comments/replies
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
  const [editText, setEditText] = useState('');
  const [opLoadingId, setOpLoadingId] = useState(null); // id for which operation is loading (edit/delete)
  const [pendingDelete, setPendingDelete] = useState(null); // {type:'comment'|'reply', commentId, replyId?, text}
  const [newCommentText, setNewCommentText] = useState(''); // State for new comment text

  // Removed useEffect for fetching complaints, now received via props
  // Removed fetchComplaints function
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
            }, 0); // Wrap in setTimeout to avoid React rendering error
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
                }, 0); // Wrap in setTimeout to avoid React rendering error
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
  }, [selectedComplaint, socket]);

  const handleStatusUpdate = async (complaintId, newStatus) => {
    try {
      await updateComplaintStatusAdmin(complaintId, newStatus);
      toast.success('Complaint status updated successfully');
      if (onStatusChange) {
        onStatusChange(); // Trigger parent to re-fetch/update complaints
      }
      // Local state update for selected complaint if necessary, but parent will provide fresh data
      if (selectedComplaint?._id === complaintId) {
        setSelectedComplaint(prev => ({ ...prev, status: newStatus }));
      }
    } catch (error) {
      toast.error(error.message || 'Failed to update status');
    }
  };

  const handleDeleteClick = (complaint) => {
    setComplaintToDelete(complaint);
    setIsDeleteModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      if (complaintToDelete) {
        await deleteComplaintAdmin(complaintToDelete._id);
        toast.success('Complaint deleted successfully!');
        setIsDeleteModalOpen(false);
        setComplaintToDelete(null);
        if (onStatusChange) {
          onStatusChange(); // Trigger parent to re-fetch/update complaints
        }
      }
    } catch (error) {
      toast.error(error.message || 'Failed to delete complaint.');
    }
  };

  // Helper to normalize user info which may be populated object or an id string
  const resolveUser = (user) => {
    // If user is already a populated object, use it directly
    if (user && typeof user === 'object' && user._id) {
      const id = user._id;
      let fullName = user.fullName;
      let profilePic = user.profilePic;
      let flatNumber = user.flatNumber;
      const authorRole = user.authorRole; // Use the authorRole from the user object

      if (authorRole === 'admin') {
        fullName = "Admin";
        profilePic = admin?.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png"; // Use admin's actual profile pic
        flatNumber = null; // Admin should not have a flat number
      }
      return { id, fullName, profilePic, flatNumber, authorRole };
    }

    // Fallback for cases where user might just be an ID or null/undefined (though now less likely with Mixed type)
    if (!user) return { id: null, fullName: null, profilePic: null, flatNumber: null, authorRole: null };

    const id = user._id || user; // Should be user._id if it's an object
    let fullName = user.fullName; // Should be available if populated
    let profilePic = user.profilePic; // Should be available if populated
    let flatNumber = user.flatNumber; // Should be available if populated
    const authorRole = user.authorRole; // Should be available if populated

    // Explicitly handle admin's name and profile pic if the authorRole is admin
    if (authorRole === 'admin') {
      fullName = "Admin";
      profilePic = admin?.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png"; // Use admin's actual profile pic
      flatNumber = null; // Admin should not have a flat number
    }

    // Fallback for admin if current user is admin and matches id
    if (!fullName && admin && String(id) === String(admin._id)) {
      fullName = admin.fullName;
      profilePic = admin.profilePic;
    }
    if (!profilePic && admin && String(id) === String(admin._id)) {
      profilePic = admin.profilePic;
    }

    return { id, fullName, profilePic, flatNumber, authorRole };
  };

  // Edit and delete handlers
  const handleEditComment = async (commentId) => {
    // newText is already in state, no need for prompt
    if (!editText.trim()) return toast.error('Comment text cannot be empty.');

    try {
      setOpLoadingId(commentId + ':edit');
      await axios.put(`/api/complaints/${selectedComplaint._id}/comment`, { commentId, text: editText });
      toast.success('Comment edited');
      // Optionally update local selectedComplaint state if needed for faster UI response
      setSelectedComplaint(prev => {
        if (!prev) return null;
        const nextComments = prev.comments.map(c => c._id === commentId ? { ...c, text: editText, editedAt: new Date().toISOString() } : c);
        return { ...prev, comments: nextComments };
      });
      setEditingCommentId(null); // Exit editing mode
      setEditText(''); // Clear edit text
    } catch (err) {
      toast.error(err?.message || 'Failed to edit comment');
    } finally { setOpLoadingId(null); }
  };

  const handleDeleteComment = async (commentId) => {
    setPendingDelete({ type: 'comment', commentId });
  };

  const handleEditReply = async (commentId, replyId) => {
    // newText is already in state, no need for prompt
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
      setEditingReply({ commentId: null, replyId: null }); // Exit editing mode
      setEditText(''); // Clear edit text
    } catch (err) {
      toast.error(err?.message || 'Failed to edit reply');
    } finally { setOpLoadingId(null); }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    setPendingDelete({ type: 'reply', commentId, replyId });
  };

  const handleConfirmDelete = async () => {
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
      setPendingDelete(null); // Close the confirmation modal
    }
  };

  const handleCancelDelete = () => {
    setPendingDelete(null); // Close the confirmation modal
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) return toast.error('Comment cannot be empty');
    try {
      setOpLoadingId('newComment');
      const response = await axios.post(`/api/complaints/${selectedComplaint._id}/comment`, { text: newCommentText });
      toast.success('Comment added successfully!');
      setNewCommentText('');
      if (onStatusChange) onStatusChange(); // Trigger parent to re-fetch/update complaints
      setSelectedComplaint(prev => {
        if (!prev) return null;
        // Check if the comment already exists to prevent duplicates
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
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Pending': return 'badge-warning';
      case 'In Progress': return 'badge-info';
      case 'Resolved': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending': return <Clock className="w-4 h-4" />;
      case 'In Progress': return <AlertTriangle className="w-4 h-4" />;
      case 'Resolved': return <CheckCircle className="w-4 h-4" />;
      default: return <Clock className="w-4 h-4" />;
    }
  };

  const openLightbox = (clickedItem) => {
    const index = slides.findIndex(slide => slide.idx === clickedItem.idx);
    if (index !== -1) {
      setPhotoIndex(index);
      setLightboxOpen(true);
    }
  };

  const filteredComplaints = complaints.filter(complaint => {
    const matchesStatus = filters.status === 'all' || complaint.status === filters.status;
    const matchesCategory = filters.category === 'all' || complaint.category === filters.category;
    const matchesSearch = filters.search === '' ||
      complaint.title.toLowerCase().includes(filters.search.toLowerCase()) ||
      complaint.description.toLowerCase().includes(filters.search.toLowerCase()) ||
      complaint.user?.fullName?.toLowerCase().includes(filters.search.toLowerCase());

    return matchesStatus && matchesCategory && matchesSearch;
  });

  const statusCounts = analytics?.overview ? {
    all: analytics.overview.totalComplaints,
    Pending: analytics.overview.pendingComplaints,
    'In Progress': analytics.overview.inProgressComplaints,
    Resolved: analytics.overview.resolvedComplaints
  } : {
    all: complaints.length,
    Pending: complaints.filter(c => c.status === 'Pending').length,
    'In Progress': complaints.filter(c => c.status === 'In Progress').length,
    Resolved: complaints.filter(c => c.status === 'Resolved').length
  };

  // Removed loading state check as parent handles initial loading
  // if (loading) { ... }

  const images = selectedComplaint?.images || [];
  const videoUrl = selectedComplaint?.video; // Assuming it's a single video URL

  const slides = [
    ...images.map((src, idx) => ({
      src,
      type: "image",
      idx: `image-${idx}` // Unique identifier
    })),
    ...(videoUrl ? [{
      src: videoUrl,
      type: "video",
      sources: [{ src: videoUrl, type: "video/mp4" }], // Specify video sources for the plugin
      idx: `video-0` // Unique identifier for the single video
    }] : []),
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Complaint Management</h2>
        <button
          onClick={onStatusChange} // Assuming onStatusChange is the refresh function
          className="btn btn-outline btn-sm gap-2"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-primary">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="stat-title">Total Complaints</div>
          <div className="stat-value text-primary">{statusCounts.all}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-warning">
            <Clock className="w-8 h-8" />
          </div>
          <div className="stat-title">Pending</div>
          <div className="stat-value text-warning">{statusCounts.Pending}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-info">
            <AlertTriangle className="w-8 h-8" />
          </div>
          <div className="stat-title">In Progress</div>
          <div className="stat-value text-info">{statusCounts['In Progress']}</div>
        </div>

        <div className="stat bg-base-100 shadow-lg rounded-lg">
          <div className="stat-figure text-success">
            <CheckCircle className="w-8 h-8" />
          </div>
          <div className="stat-title">Resolved</div>
          <div className="stat-value text-success">{statusCounts.Resolved}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-base-100 p-4 rounded-lg shadow-lg">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <label className="label">
              <span className="label-text">Search</span>
            </label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-base-content/50" />
              <input
                type="text"
                placeholder="Search by title, description, or user..."
                className="input input-bordered w-full pl-10"
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              />
            </div>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Status</span>
            </label>
            <select
              className="select select-bordered"
              value={filters.status}
              onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            >
              <option value="all">All Status</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Resolved">Resolved</option>
            </select>
          </div>

          <div>
            <label className="label">
              <span className="label-text">Category</span>
            </label>
            <select
              className="select select-bordered"
              value={filters.category}
              onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
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
      </div>

      {/* Complaints List */}
      <div className="bg-base-100 rounded-lg shadow-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="table table-zebra w-full">
            <thead>
              <tr><th>Complaint</th><th>User</th><th>Building</th><th>Category</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {filteredComplaints.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-8 text-base-content/50"> {/* Adjusted colSpan */}
                    No complaints found
                  </td>
                </tr>
              ) : (
                filteredComplaints.map((complaint) => (
                  <tr key={complaint._id}>
                    <td>
                      <div>
                        <div className="font-medium">{complaint.title}</div>
                        <div className="text-sm text-base-content/70" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                          {complaint.description}
                        </div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{complaint.user?.fullName || 'Unknown'}</div>
                        <div className="text-base-content/70">Flat {complaint.flatNumber}</div>
                      </div>
                    </td>
                    <td>
                      <div className="text-sm">
                        <div className="font-medium">{complaint.buildingName?.buildingName || 'N/A'}</div> {/* Display Building Name */}
                      </div>
                    </td>
                    <td>
                      <span className="badge badge-outline">{complaint.category}</span>
                    </td>
                    <td>
                      <span className={`badge gap-2 ${getStatusColor(complaint.status)}`}>
                        {getStatusIcon(complaint.status)}
                        {complaint.status}
                      </span>
                    </td>
                    <td>
                      <div className="text-sm">
                        {format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
                      </div>
                    </td>
                    <td>
                      <div className="flex gap-2">
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => setSelectedComplaint(complaint)}
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <select
                          className="select select-bordered select-xs"
                          value={complaint.status}
                          onChange={(e) => handleStatusUpdate(complaint._id, e.target.value)}
                        >
                          <option value="Pending">Pending</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Resolved">Resolved</option>
                        </select>
                        {complaint.status === "Resolved" && (
                          <button
                            className="btn btn-ghost btn-xs btn-error"
                            onClick={() => handleDeleteClick(complaint)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Complaint Detail Modal */}
      {selectedComplaint && (
        <div className="modal modal-open" style={{ zIndex: 900 }}> {/* Adjusted zIndex for consistency */}
          <div className="modal-box max-w-2xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">Complaint Details</h3>
              <button onClick={() => setSelectedComplaint(null)} className="btn btn-sm btn-circle btn-ghost">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <h4 className="font-semibold text-lg">{selectedComplaint.title}</h4>
                <p className="text-base-content/70">{selectedComplaint.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4 bg-base-200 p-4 rounded-lg">
                <div>
                  <span className="text-sm font-medium text-base-content/70">User:</span>
                  <p>{selectedComplaint.user?.fullName || 'Unknown'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-base-content/70">Building:</span> {/* Added Building Name */}
                  <p>{selectedComplaint.buildingName?.buildingName || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-base-content/70">Flat:</span>
                  <p>{selectedComplaint.flatNumber}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-base-content/70">Category:</span>
                  <p>{selectedComplaint.category}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-base-content/70">Status:</span>
                  <select
                    className="select select-bordered select-sm ml-2"
                    value={selectedComplaint.status}
                    onChange={(e) => handleStatusUpdate(selectedComplaint._id, e.target.value)}
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Resolved">Resolved</option>
                  </select>
                </div>
                <div>
                  <span className="text-sm font-medium text-base-content/70">Reported On:</span>
                  <p>{format(new Date(selectedComplaint.createdAt), 'dd/MM/yyyy')}</p>
                </div>
              </div>

              {/* Likes Count */}
              {selectedComplaint.likes && (
                <div>
                  <span className="text-sm font-medium text-base-content/70">Likes:</span>
                  <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                    <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                    <span>{selectedComplaint.likes.length}</span>
                  </div>
                </div>
              )}

              {/* Media Section in Modal */}
              {(images.length > 0 || videoUrl) && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Media</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {images.map((image, index) => (
                      <div key={index} className="relative group cursor-pointer" onClick={() => openLightbox({ idx: `image-${index}` })}>
                        <img src={image} alt={`Complaint media ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <ImageIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    ))}
                    {videoUrl && (
                      <div key="single-video" className="relative group cursor-pointer" onClick={() => openLightbox({ idx: `video-0` })}>
                        <video src={videoUrl} className="w-full h-32 object-cover rounded-lg shadow-md" controls />
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                          <VideoIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
              {(images.length === 0 && !videoUrl) && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No media attached to this complaint.
                </div>
              )}

              {/* Comments Section */}
              {selectedComplaint.comments && selectedComplaint.comments.length > 0 && (
                <div>
                  <h3 className="text-xl font-semibold mb-3">Comments</h3>
                  <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                    {selectedComplaint.comments.map((comment, index) => {
                      const u = resolveUser(comment.user);
                      // Determine if the current admin is the author of the comment
                      const isAdminAuthor = admin && comment.user && String(comment.user?._id) === String(admin._id) && comment.authorRole === 'admin';

                      console.log('ComplaintManagement - Comment Debug:', {
                        commentId: comment._id,
                        adminPresent: !!admin,
                        adminId: admin?._id,
                        commentUserId: comment.user?._id,
                        commentAuthorRole: comment.authorRole,
                        isAdminAuthor: isAdminAuthor
                      });

                      return (
                        <div key={index} className="bg-base-200 p-4 rounded-lg shadow-sm relative">
                          <div className="flex justify-between items-start mb-1">
                            <div className="flex items-center gap-2">
                              <img
                                src={u.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                                alt={u.fullName || 'Anonymous'}
                                className="w-8 h-8 rounded-full object-cover"
                              />
                              <p className="font-semibold text-gray-900 dark:text-white">{u.fullName || 'Unknown'}</p>
                              {u.authorRole !== 'admin' && (
                                <p className="text-xs text-gray-600">Flat No: {u.flatNumber || 'N/A'}</p>
                              )}
                            </div>
                            <span className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(comment.createdAt), 'dd/MM/yyyy')}</span>
                          </div>
                          <div className="relative">
                            {editingCommentId === comment._id ? (
                              <div className="mt-2">
                                <textarea value={editText} onChange={(e) => setEditText(e.target.value)} className="w-full p-2 border rounded-md" rows={3} />
                                <div className="flex gap-2 mt-2">
                                  <button className="btn btn-sm btn-primary" onClick={async () => {
                                    if (!editText.trim()) return toast.error('Comment cannot be empty');
                                    await handleEditComment(comment._id);
                                    setEditingCommentId(null);
                                    setEditText('');
                                  }}>Save</button>
                                  <button className="btn btn-sm" onClick={() => { setEditingCommentId(null); setEditText(''); }}>Cancel</button>
                                </div>
                              </div>
                            ) : (
                              <p className="text-gray-700 dark:text-gray-300 mt-2">{comment.text}</p>
                            )}
                            {comment.editedAt && <span className="text-2xs text-gray-400 ml-2">{`(edited ${format(new Date(comment.editedAt), 'dd/MM/yyyy')})`}</span>}

                            {isAdminAuthor && (
                              <div className="absolute top-2 right-2 flex gap-2">
                                <button onClick={() => { setEditingCommentId(comment._id); setEditText(comment.text); }} className="text-xs text-blue-600">Edit</button>
                                <button onClick={() => handleDeleteComment(comment._id)} className="text-xs text-red-600">Delete</button>
                              </div>
                            )}
                          </div>

                          {/* Replies Section */}
                          {comment.replies && comment.replies.length > 0 && (
                            <div className="mt-3 pl-6 space-y-2">
                              {comment.replies.map((reply) => {
                                const ru = resolveUser(reply.user);
                                const isAdminReplyAuthor = admin && reply.user && String(reply.user?._id) === String(admin._id) && reply.authorRole === 'admin';

                                console.log('ComplaintManagement - Reply Debug:', {
                                  replyId: reply._id,
                                  adminPresent: !!admin,
                                  adminId: admin?._id,
                                  replyUserId: reply.user?._id,
                                  replyAuthorRole: reply.authorRole,
                                  isAdminReplyAuthor: isAdminReplyAuthor
                                });

                                return (
                                  <div key={reply._id} className="bg-white p-2 rounded-md border relative">
                                    <div className="flex justify-between items-start">
                                      <div className="flex items-center gap-2">
                                        <img
                                          src={ru.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                                          alt={ru.fullName || 'Anonymous'}
                                          className="w-6 h-6 rounded-full object-cover"
                                        />
                                        <p className="text-xs font-semibold text-gray-800">{ru.fullName || 'Unknown'}</p>
                                      </div>
                                      <p className="text-2xs text-gray-400">{format(new Date(reply.createdAt), 'dd/MM/yyyy')}</p>
                                    </div>
                                    {editingReply.commentId === comment._id && editingReply.replyId === reply._id ? (
                                      <div className="mt-1">
                                        <textarea className="w-full p-2 border rounded-md" rows={2} value={editText} onChange={(e) => setEditText(e.target.value)} />
                                        <div className="flex gap-2 mt-1">
                                          <button className="btn btn-sm btn-primary" onClick={async () => {
                                            if (!editText.trim()) return toast.error('Reply cannot be empty');
                                            await handleEditReply(comment._id, reply._id);
                                            setEditingReply({ commentId: null, replyId: null });
                                            setEditText('');
                                          }}>Save</button>
                                          <button className="btn btn-sm" onClick={() => { setEditingReply({ commentId: null, replyId: null }); setEditText(''); }}>Cancel</button>
                                        </div>
                                      </div>
                                    ) : (
                                      <p className="text-xs text-gray-700 mt-1">{reply.text}</p>
                                    )}
                                    {reply.editedAt && <span className="text-2xs text-gray-400 ml-2">{`(edited ${format(new Date(reply.editedAt), 'dd/MM/yyyy')})`}</span>}

                                    {isAdminReplyAuthor && (
                                      <div className="absolute top-1 right-1 flex gap-2">
                                        <button onClick={() => { setEditingReply({ commentId: comment._id, replyId: reply._id }); setEditText(reply.text); }} className="text-2xs text-blue-600">Edit</button>
                                        <button onClick={() => handleDeleteReply(comment._id, reply._id)} className="text-2xs text-red-600">Delete</button>
                                      </div>
                                    )}
                                  </div>
                                );
                              })}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
              {selectedComplaint.comments && selectedComplaint.comments.length === 0 && (
                <div className="text-center py-4 text-gray-500 dark:text-gray-400">
                  No comments yet.
                </div>
              )}
              {/* Add Comment Input */}
              <div className="mt-6 p-6 bg-base-100 rounded-lg shadow-lg">
                <h3 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Add a Comment</h3>
                <form onSubmit={handleCommentSubmit} className="flex items-center space-x-3">
                  <textarea
                    className="textarea textarea-bordered w-full flex-grow"
                    rows="2"
                    placeholder="Write your comment here..."
                    value={newCommentText}
                    onChange={(e) => setNewCommentText(e.target.value)}
                  ></textarea>
                  <button
                    type="submit"
                    className="btn btn-primary gap-2"
                  >
                    <MessageSquare className="w-5 h-5" />
                    Comment
                  </button>
                </form>
              </div>
            </div>

            <div className="modal-action">
              {selectedComplaint.status === "Resolved" && (
                <button
                  className="btn btn-error gap-2"
                  onClick={() => handleDeleteClick(selectedComplaint)}
                >
                  <Trash2 className="w-5 h-5" />
                  Delete Complaint
                </button>
              )}
              <button onClick={() => setSelectedComplaint(null)} className="btn">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* Lightbox for Images in Complaint Management Modal */}
      {lightboxOpen && (images.length > 0 || videoUrl) && (
        <Lightbox
          slides={slides} // Use slides prop for yet-another-react-lightbox
          open={lightboxOpen}
          index={photoIndex}
          close={() => setLightboxOpen(false)}
          on={{ view: ({ index }) => setPhotoIndex(index) }} // Update index on view change
          plugins={[Video]} // Add the video plugin here
        />
      )}

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
