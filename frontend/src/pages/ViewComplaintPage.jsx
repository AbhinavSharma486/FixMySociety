import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintById, deleteComplaint, addComment } from '../lib/complaintService'; // Corrected import path
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';
import { MessageSquare, ArrowLeft, Trash2, Edit, LoaderCircle, Image, Video as VideoIcon } from 'lucide-react';
import { useSocketContext } from '../context/SocketContext';
import socket from '../lib/socket'; // Corrected import path

import Lightbox from "yet-another-react-lightbox"; // Import Lightbox
import "yet-another-react-lightbox/styles.css"; // Import Lightbox styles
import Video from "yet-another-react-lightbox/plugins/video"; // Import video plugin for lightbox
import ReplyButton from '../components/ReplyButton';
import { axiosInstance as axios } from '../lib/axios';
import ConfirmationModal from '../Admin/components/ConfirmationModal';

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
  // Comment edit/delete UI state
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
  const [editText, setEditText] = useState('');
  const [opLoadingId, setOpLoadingId] = useState(null); // id for which operation is loading (edit/delete)
  const [pendingDelete, setPendingDelete] = useState(null); // {type:'comment'|'reply', commentId, replyId?, text}

  // Helper to normalize user info which may be populated object or an id string
  const resolveUser = (user) => {
    // user can be: populated object { _id, fullName, profilePic, flatNumber }
    // or a plain ObjectId/string (e.g. "64...")
    if (!user) return { id: null, fullName: null, profilePic: null, flatNumber: null, authorRole: null };
    const id = user._id || user;
    let fullName = user.fullName || (currentUser && String(id) === String(currentUser._id) ? currentUser.fullName : null);
    let profilePic = user.profilePic || (currentUser && String(id) === String(currentUser._id) ? currentUser.profilePic : null);
    let flatNumber = user.flatNumber || (currentUser && String(id) === String(currentUser._id) ? currentUser.flatNumber : null);

    // Explicitly handle admin's name and profile pic if the authorRole is admin
    if (user.authorRole === 'admin') {
      fullName = "Admin";
      profilePic = admin?.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png"; // Use admin's actual profile pic or default
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

    return { id, fullName, profilePic, flatNumber, authorRole: user.authorRole };
  };

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
            // Avoid duplicates: check if comment already exists
            const commentExists = prevComplaint.comments.some(c => c._id === data.comment._id);
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
        console.log('[ViewComplaintPage] Received new reply:', data);
        if (data.complaintId === id) {
          setComplaint((prevComplaint) => {
            if (!prevComplaint) return null;

            const nextComments = prevComplaint.comments.map(comment => {
              if (comment._id === data.parentCommentId) {
                // Avoid duplicates
                const replyExists = comment.replies.some(r => r._id === data.reply._id);
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
        console.log(`[ViewComplaintPage] Leaving complaint room: ${id}`);
        socket.emit("leaveComplaintRoom", id);
        socket.off("comment:added", handleNewComment);
        socket.off("reply:added", handleNewReply);
      };
    }
  }, [fetchComplaint, id, socket]);

  const slides = [
    ...(complaint?.images || []).map((src, idx) => ({ src, type: "image", idx: `image-${idx}` })),
    ...(complaint?.video ? [{
      src: complaint.video,
      type: "video",
      sources: [{ src: complaint.video, type: "video/mp4" }],
      idx: `video-0`
    }] : []),
  ];

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  const handleMediaClick = (clickedItem) => {
    const index = slides.findIndex(slide => slide.src === clickedItem.src);
    if (index !== -1) {
      setPhotoIndex(index);
      setLightboxOpen(true);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newCommentText.trim()) {
      return toast.error("Comment cannot be empty.");
    }
    if (!currentUser && !admin) {
      return toast.error("You must be logged in to comment.");
    }

    try {
      // Support parentCommentId if replying to a comment (reply UI not yet in this page)
      await addComment(id, newCommentText);
      setNewCommentText('');
      // fetchComplaint(); // Re-fetch complaint to show new comment - REMOVED for real-time update
    } catch (error) {
      toast.error(error.message || "Failed to add comment.");
    }
  };

  // Edit and delete handlers (frontend calls backend)
  const handleEditComment = async (commentId) => {
    if (!editText.trim()) return toast.error('Comment text cannot be empty.');

    try {
      const res = await axios.put(`/api/complaints/${id}/comment`, { commentId, text: editText });
      fetchComplaint();
      toast.success('Comment edited successfully!');
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit comment.');
    }
  };

  const handleDeleteComment = async (commentId) => {
    setPendingDelete({ type: 'comment', commentId });
  };

  const handleEditReply = async (commentId, replyId) => {
    if (!editText.trim()) return toast.error('Reply text cannot be empty.');

    try {
      const res = await axios.put(`/api/complaints/${id}/comment`, { commentId, replyId, text: editText });
      fetchComplaint();
      toast.success('Reply edited successfully!');
      setEditingReply({ commentId: null, replyId: null });
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit reply.');
    }
  };

  const handleDeleteReply = async (commentId, replyId) => {
    setPendingDelete({ type: 'reply', commentId, replyId });
  };

  const handleDeleteComplaint = async () => {
    if (window.confirm("Are you sure you want to delete this complaint?")) {
      try {
        await deleteComplaint(id);
        navigate(admin ? '/admin/dashboard' : '/main'); // Redirect after deletion
      } catch (err) {
        toast.error(err.message || "Failed to delete complaint.");
      }
    }
  };

  const handleEditComplaint = () => {
    navigate(`/edit-complaint/${id}`);
  };

  if (loading) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex justify-center items-center">
      <div className="flex flex-col items-center space-y-4">
        <LoaderCircle className="animate-spin w-16 h-16 text-blue-600 drop-shadow-lg" />
        <p className="text-gray-600 font-medium">Loading complaint details...</p>
      </div>
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex justify-center items-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
        <div className="text-red-500 text-6xl mb-4">⚠️</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Error Loading Complaint</h3>
        <p className="text-red-600 mb-6">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Again
        </button>
      </div>
    </div>
  );

  if (!complaint) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200 flex justify-center items-center">
      <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md mx-4">
        <div className="text-gray-400 text-6xl mb-4">🔍</div>
        <h3 className="text-xl font-bold text-gray-800 mb-2">Complaint Not Found</h3>
        <p className="text-gray-600">The complaint you're looking for doesn't exist or has been removed.</p>
      </div>
    </div>
  );

  const isOwner = currentUser && complaint.user._id === currentUser._id;
  const isAdmin = !!admin;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-gray-100 to-gray-200">
      {/* Main Container */}
      <div className="px-4 sm:px-6 lg:px-8 py-6 pt-18 lg:pt-20">
        <div className="max-w-5xl mx-auto">

          {/* Back Button */}
          <div className="mb-6 sm:mb-8">
            <button
              onClick={() => navigate(-1)}
              className="group inline-flex items-center px-4 py-2 text-sm font-medium text-gray-600 bg-white/80 backdrop-blur-sm border border-gray-200 rounded-xl hover:bg-white hover:text-blue-600 hover:border-blue-200 transition-all duration-300 shadow-sm hover:shadow-md"
            >
              <ArrowLeft className="w-4 h-4 mr-2 transform group-hover:-translate-x-1 transition-transform duration-300" />
              Back to Dashboard
            </button>
          </div>

          {/* Main Card */}
          <div className="bg-white/70 backdrop-blur-sm rounded-3xl shadow-2xl border border-gray-200/50 overflow-hidden">

            {/* Header Section */}
            <div className="relative bg-gradient-to-r from-blue-600 to-blue-700 text-white">
              <div className="absolute inset-0 bg-black/10"></div>
              <div className="relative p-6 sm:p-8 lg:p-10">
                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-6">
                  <div className="flex-1">
                    <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4 leading-tight">
                      {complaint.title}
                    </h1>

                    <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-sm sm:text-base text-blue-100 mb-6">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-white rounded-full"></div>
                        <span className="font-medium">{complaint.user.fullName}</span>
                      </div>
                      <div className="hidden sm:block w-px h-4 bg-blue-200"></div>
                      <div className="flex items-center gap-2">
                        <span>{complaint.buildingName.buildingName}</span>
                        <span className="font-medium">• Flat {complaint.user.flatNumber}</span>
                      </div>
                      <div className="hidden sm:block w-px h-4 bg-blue-200"></div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs sm:text-sm">
                          {formatDistanceToNow(new Date(complaint.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>

                    {/* Status Badge */}
                    <div className="inline-block">
                      <span className={`px-4 py-2 text-sm font-semibold rounded-full transition-all duration-300 ${complaint.status === 'Pending'
                        ? 'bg-red-100 text-red-800 border border-red-200'
                        : complaint.status === 'In Progress'
                          ? 'bg-yellow-100 text-yellow-800 border border-yellow-200'
                          : 'bg-green-100 text-green-800 border border-green-200'
                        }`}>
                        {complaint.status}
                      </span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {(isOwner || isAdmin) && (
                    <div className="flex flex-col sm:flex-row gap-3 lg:flex-col lg:gap-2">
                      <button
                        onClick={handleEditComplaint}
                        className="group inline-flex items-center justify-center px-6 py-3 bg-white/20 backdrop-blur-sm border border-white/30 text-white font-medium rounded-xl hover:bg-white/30 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Edit className="w-4 h-4 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                        Edit
                      </button>
                      <button
                        onClick={handleDeleteComplaint}
                        className="group inline-flex items-center justify-center px-6 py-3 bg-red-500/90 backdrop-blur-sm border border-red-400/50 text-white font-medium rounded-xl hover:bg-red-600 hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                      >
                        <Trash2 className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform duration-300" />
                        Delete
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Description Section */}
            <div className="p-6 sm:p-8 lg:p-10 border-b border-gray-200/60">
              <h2 className="text-xl sm:text-2xl font-bold mb-6 text-gray-800 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                Description
              </h2>
              <div className="bg-gradient-to-r from-gray-50 to-gray-100/50 rounded-2xl p-6 sm:p-8 border border-gray-200/50">
                <p className="text-gray-700 whitespace-pre-line leading-relaxed text-base sm:text-lg">
                  {complaint.description}
                </p>
              </div>

              {/* Media Section */}
              {(complaint.images && complaint.images.length > 0) || complaint.video ? (
                <div className="mt-8">
                  <h3 className="text-lg font-semibold text-gray-800 mb-6 flex items-center gap-2">
                    <div className="w-1 h-6 bg-gradient-to-b from-blue-400 to-blue-500 rounded-full"></div>
                    Attachments ({(complaint.images?.length || 0) + (complaint.video ? 1 : 0)})
                  </h3>
                  <div className="grid grid-cols-1 xs:grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
                    {complaint.images?.map((image, index) => (
                      <div
                        key={index}
                        className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-gray-200/50"
                        onClick={() => handleMediaClick({ src: image })}
                      >
                        <img
                          src={image}
                          alt={`Complaint image ${index + 1}`}
                          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <Image className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                    ))}

                    {complaint.video && (
                      <div
                        className="group relative cursor-pointer bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transform hover:scale-105 transition-all duration-500 border border-gray-200/50"
                        onClick={() => handleMediaClick({ src: complaint.video })}
                      >
                        <video
                          src={complaint.video}
                          className="w-full h-40 sm:h-48 object-cover group-hover:scale-110 transition-transform duration-700"
                          controls
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center">
                          <div className="bg-white/20 backdrop-blur-sm rounded-full p-3">
                            <VideoIcon className="w-8 h-8 text-white drop-shadow-lg" />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : null}
            </div>

            {/* Comments Section */}
            <div className="p-6 sm:p-8 lg:p-10">
              <h2 className="text-xl sm:text-2xl font-bold mb-8 text-gray-800 flex items-center gap-3">
                <div className="w-1 h-8 bg-gradient-to-b from-blue-500 to-blue-600 rounded-full"></div>
                Comments ({complaint.comments ? complaint.comments.length : 0})
              </h2>

              {/* Comments List */}
              <div className="space-y-6 mb-8">
                {complaint.comments && complaint.comments.length > 0 ? (
                  complaint.comments.map((comment) => {
                    const u = resolveUser(comment.user);
                    return (
                      <div key={comment._id} className="group bg-gradient-to-r from-gray-50/80 to-gray-100/40 backdrop-blur-sm rounded-2xl border border-gray-200/50 overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300">
                        <div className="p-6">
                          <div className="flex items-start space-x-4">
                            {/* Avatar */}
                            <div className="relative flex-shrink-0">
                              <img
                                src={u.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                                alt={u.fullName || 'Anonymous'}
                                className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg"
                              />
                              {u.authorRole === 'admin' && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-600 rounded-full border-2 border-white flex items-center justify-center">
                                  <span className="text-white text-xs font-bold">A</span>
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              {/* Comment Header */}
                              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-3">
                                <div>
                                  <p className="text-base font-bold text-gray-900">{u.fullName || 'Unknown'}</p>
                                  {u.authorRole !== 'admin' && u.flatNumber && (
                                    <p className="text-sm text-gray-600">Flat No: {u.flatNumber}</p>
                                  )}
                                </div>
                                <div className="flex items-center gap-3">
                                  <p className="text-xs sm:text-sm text-gray-500 bg-gray-200/50 px-3 py-1 rounded-full">
                                    {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                                  </p>

                                  {/* Edit/Delete for top-level comment */}
                                  {(currentUser || admin) && (
                                    ((comment.user && currentUser && String(comment.user._id) === String(currentUser._id))) ||
                                    (comment.authorRole === 'admin' && admin && String(comment.user._id) === String(admin._id))
                                  ) && (
                                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <button
                                          onClick={() => { setEditingCommentId(comment._id); setEditText(comment.text); }}
                                          className="text-xs font-medium text-blue-600 hover:text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1 rounded-full transition-colors duration-200"
                                        >
                                          Edit
                                        </button>
                                        <button
                                          onClick={() => handleDeleteComment(comment._id)}
                                          className="text-xs font-medium text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-3 py-1 rounded-full transition-colors duration-200"
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
                                  <div className="space-y-4">
                                    <textarea
                                      value={editText}
                                      onChange={(e) => setEditText(e.target.value)}
                                      className="w-full p-4 border border-gray-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-200 bg-white/70 backdrop-blur-sm"
                                      rows={3}
                                      placeholder="Edit your comment..."
                                    />
                                    <div className="flex gap-3">
                                      <button
                                        className="px-6 py-2 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
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
                                        Save Changes
                                      </button>
                                      <button
                                        className="px-6 py-2 bg-gray-200 text-gray-700 font-medium rounded-xl hover:bg-gray-300 transition-colors duration-200"
                                        onClick={() => { setEditingCommentId(null); setEditText(''); }}
                                      >
                                        Cancel
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <p className="text-gray-700 leading-relaxed text-base">{comment.text}</p>
                                )}
                              </div>

                              {/* Replies */}
                              {comment.replies && comment.replies.length > 0 && (
                                <div className="mt-6 pl-4 sm:pl-8 space-y-4 border-l-2 border-gray-300/50">
                                  {comment.replies.map((reply) => (
                                    <div key={reply._id} className="group/reply bg-white/60 backdrop-blur-sm rounded-xl border border-gray-200/40 p-4 shadow-sm hover:shadow-md transition-all duration-300">
                                      <div className="flex items-start space-x-3">
                                        <img
                                          src={resolveUser(reply.user).profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                                          alt={resolveUser(reply.user).fullName || 'Anonymous'}
                                          className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                        />
                                        <div className="flex-1">
                                          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                                            <p className="text-sm font-semibold text-gray-800">{resolveUser(reply.user).fullName || 'Unknown'}</p>
                                            <div className="flex items-center gap-2">
                                              <p className="text-xs text-gray-500">
                                                {formatDistanceToNow(new Date(reply.createdAt), { addSuffix: true })}
                                              </p>

                                              {/* Edit/Delete for reply */}
                                              {(currentUser || admin) && (
                                                ((reply.user && currentUser && String(reply.user._id) === String(currentUser._id))) ||
                                                (reply.authorRole === 'admin' && admin && String(reply.user._id) === String(admin._id))
                                              ) && (
                                                  <div className="flex gap-2 opacity-0 group-hover/reply:opacity-100 transition-opacity duration-300">
                                                    <button
                                                      onClick={() => { setEditingReply({ commentId: comment._id, replyId: reply._id }); setEditText(reply.text); }}
                                                      className="text-xs text-blue-600 hover:text-blue-700 bg-blue-50 px-2 py-1 rounded-full"
                                                    >
                                                      Edit
                                                    </button>
                                                    <button
                                                      onClick={() => handleDeleteReply(comment._id, reply._id)}
                                                      className="text-xs text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded-full"
                                                    >
                                                      Delete
                                                    </button>
                                                  </div>
                                                )}
                                            </div>
                                          </div>

                                          {editingReply.commentId === comment._id && editingReply.replyId === reply._id ? (
                                            <div className="space-y-3">
                                              <textarea
                                                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white/70 backdrop-blur-sm"
                                                rows={2}
                                                value={editText}
                                                onChange={(e) => setEditText(e.target.value)}
                                                placeholder="Edit your reply..."
                                              />
                                              <div className="flex gap-2">
                                                <button
                                                  className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors"
                                                  onClick={async () => {
                                                    if (!editText.trim()) return toast.error('Reply cannot be empty');
                                                    try {
                                                      setOpLoadingId(reply._id + ':edit');
                                                      await axios.put(`/api/complaints/${id}/comment`, { commentId: comment._id, replyId: reply._id, text: editText });
                                                      setEditingReply({ commentId: null, replyId: null });
                                                      setEditText('');
                                                      await fetchComplaint();
                                                      toast.success('Reply updated');
                                                    } catch (err) {
                                                      toast.error(err?.message || 'Failed to update reply');
                                                    } finally {
                                                      setOpLoadingId(null);
                                                    }
                                                  }}
                                                >
                                                  Save
                                                </button>
                                                <button
                                                  className="px-4 py-2 bg-gray-200 text-gray-700 text-sm font-medium rounded-lg hover:bg-gray-300 transition-colors"
                                                  onClick={() => setEditingReply({ commentId: null, replyId: null })}
                                                >
                                                  Cancel
                                                </button>
                                              </div>
                                            </div>
                                          ) : (
                                            <p className="text-sm text-gray-700 leading-relaxed">{reply.text}</p>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              )}

                              {/* Reply button for logged in users */}
                              {(currentUser || admin) && (
                                <div className="mt-4 pl-4 sm:pl-8">
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
                  <div className="text-center py-16">
                    <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl p-8 mx-auto max-w-md">
                      <div className="text-gray-400 text-5xl mb-4">💬</div>
                      <h3 className="text-xl font-semibold text-gray-700 mb-2">No Comments Yet</h3>
                      <p className="text-gray-500">Be the first to share your thoughts on this complaint!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Comment Input Section */}
              {(currentUser || admin) ? (
                socket ? (
                  <div className="bg-gradient-to-r from-blue-50/50 to-indigo-50/50 backdrop-blur-sm rounded-2xl border border-blue-200/50 p-6 shadow-lg">
                    <form onSubmit={handleCommentSubmit} className="space-y-4">
                      <div className="flex items-start space-x-4">
                        <img
                          src={(currentUser?.profilePic || admin?.profilePic) || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
                          alt="Your avatar"
                          className="w-12 h-12 rounded-full object-cover border-2 border-white shadow-lg flex-shrink-0"
                        />
                        <div className="flex-1">
                          <textarea
                            className="w-full rounded-xl border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-4 resize-none transition-all duration-300 bg-white/80 backdrop-blur-sm placeholder-gray-500"
                            rows="3"
                            placeholder="Share your thoughts on this complaint..."
                            value={newCommentText}
                            onChange={(e) => setNewCommentText(e.target.value)}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end">
                        <button
                          type="submit"
                          className="group inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium rounded-xl shadow-lg text-white bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transform hover:scale-105 transition-all duration-300"
                          disabled={!newCommentText.trim()}
                        >
                          <MessageSquare className="w-5 h-5 mr-2 group-hover:rotate-12 transition-transform duration-300" />
                          Post Comment
                        </button>
                      </div>
                    </form>
                  </div>
                ) : (
                  <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center justify-center space-x-4">
                      <LoaderCircle className="animate-spin w-6 h-6 text-yellow-600" />
                      <div className="text-center">
                        <h4 className="font-semibold text-yellow-800">Connecting to real-time service...</h4>
                        <p className="text-sm text-yellow-700 mt-1">Please wait a moment to start commenting.</p>
                      </div>
                    </div>
                  </div>
                )
              ) : (
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl p-6 text-center shadow-lg">
                  <div className="text-blue-600 text-4xl mb-4">🔐</div>
                  <h4 className="text-lg font-semibold text-blue-800 mb-2">Join the Conversation</h4>
                  <p className="text-blue-700">Please log in to add your comments and engage with this complaint.</p>
                  <button
                    onClick={() => navigate('/login')}
                    className="mt-4 px-6 py-3 bg-blue-600 text-white font-medium rounded-xl hover:bg-blue-700 transform hover:scale-105 transition-all duration-300 shadow-lg hover:shadow-xl"
                  >
                    Sign In
                  </button>
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
    </div>
  );
};

export default ViewComplaintPage;