import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getComplaintByIdAdmin } from '../../lib/adminService'; // Updated to admin service
import { addComment } from '../../lib/complaintService'; // New import for addComment
import { format } from 'date-fns';
import { LoaderCircle, X, Image as ImageIcon, Video as VideoIcon, Heart, MessageSquare } from 'lucide-react'; // Added MessageSquare icon
import toast from 'react-hot-toast';
import { useSelector } from 'react-redux';
import { axiosInstance as axios } from '../../lib/axios';
import socket from '../../lib/socket'; // Changed to default import

import PhotoAlbum from "react-photo-album"; // New import for react-photo-album
import Lightbox from "yet-another-react-lightbox"; // New import for yet-another-react-lightbox
import "yet-another-react-lightbox/styles.css"; // New import for lightbox styles
import Video from "yet-another-react-lightbox/plugins/video"; // New import for video plugin
// Removed: import Lightbox from 'react-image-lightbox'; // For image lightbox
// Removed: import 'react-image-lightbox/style.css'; // Import lightbox styles
import ConfirmationModal from '../../Admin/components/ConfirmationModal'; // Correctly import ConfirmationModal

const AdminComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useSelector(state => state.admin);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState(''); // New state for comment input
  // New states for editing comments/replies
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
  const [editText, setEditText] = useState('');
  const [opLoadingId, setOpLoadingId] = useState(null); // id for which operation is loading (edit/delete)
  const [pendingDelete, setPendingDelete] = useState(null); // {type:'comment'|'reply', commentId, replyId?, text}

  useEffect(() => {
    if (id) {
      fetchComplaintDetails();
    }

    if (socket && id) {
      console.log(`[AdminComplaintDetailsPage] Joining complaint room: ${id}`);
      socket.emit("joinComplaintRoom", id);

      const handleNewComment = (data) => {
        console.log('[AdminComplaintDetailsPage] Received new comment:', data);
        if (data.complaintId === id) {
          setComplaint((prevComplaint) => {
            if (!prevComplaint) return null;
            // Check if the comment already exists to prevent duplicates
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
        console.log('[AdminComplaintDetailsPage] Received new reply:', data);
        if (data.complaintId === id) {
          setComplaint((prevComplaint) => {
            if (!prevComplaint) return null;

            const nextComments = prevComplaint.comments.map(comment => {
              if (comment._id === data.parentCommentId) {
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
        console.log(`[AdminComplaintDetailsPage] Leaving complaint room: ${id}`);
        socket.emit("leaveComplaintRoom", id);
        socket.off("comment:added", handleNewComment);
        socket.off("reply:added", handleNewReply);
      };
    }
  }, [id, socket]); // fetchComplaintDetails is intentionally removed as it's replaced by socket updates

  const fetchComplaintDetails = async () => {
    try {
      setLoading(true);
      const response = await getComplaintByIdAdmin(id); // Use admin specific function
      setComplaint(response.complaint);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint details.');
      toast.error(err.message || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
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

  const openLightbox = (index) => {
    setPhotoIndex(index);
    setLightboxOpen(true);
  };

  const images = complaint?.images || [];
  const videoUrl = complaint?.video; // Assuming complaint.video is a single URL string

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

  const handleMediaClick = (clickedItem) => {
    const index = slides.findIndex(slide => slide.idx === clickedItem.idx);
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
    try {
      // Admins call same endpoint but server authorizes admin via req.admin
      const response = await addComment(id, newCommentText);
      setNewCommentText('');
      // Update local state immediately with the new comment to prevent real-time sync issues for admin's own comments
      setComplaint(prevComplaint => {
        if (!prevComplaint) return null;
        const commentExists = prevComplaint.comments.some(c => String(c._id) === String(response.data?.comment._id));
        if (commentExists) return prevComplaint;
        return {
          ...prevComplaint,
          comments: [...prevComplaint.comments, response.data?.comment],
        };
      });
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add comment.");
    }
  };

  // Edit and delete handlers
  const handleEditComment = async (commentId) => {
    // newText is already in state, no need for prompt
    if (!editText.trim()) return toast.error('Comment text cannot be empty.');

    try {
      setOpLoadingId(commentId + ':edit');
      await axios.put(`/api/complaints/${id}/comment`, { commentId, text: editText });
      toast.success('Comment edited');
      fetchComplaintDetails(); // Re-fetch to update UI after successful edit
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
      await axios.put(`/api/complaints/${id}/comment`, { commentId, replyId, text: editText });
      toast.success('Reply edited');
      fetchComplaintDetails(); // Re-fetch to update UI after successful edit
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
        await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId } });
        toast.success('Comment deleted');
      } else if (type === 'reply') {
        setOpLoadingId(replyId + ':del');
        await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId, replyId } });
        toast.success('Reply deleted');
      }
      fetchComplaintDetails(); // Re-fetch to update UI after successful delete
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-screen dark:bg-zinc-900">
        <div className="text-center">
          <LoaderCircle className="animate-spin w-10 h-10 text-blue-500" />
          <p className="mt-4 text-lg">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-500 p-4 dark:bg-zinc-900">Error: {error}</div>;
  }

  if (!complaint) {
    return <div className="text-center text-gray-500 p-4 dark:bg-zinc-900">Complaint not found.</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-zinc-900 p-8">
      <div className="max-w-4xl mx-auto bg-base-100 rounded-lg shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Complaint Details</h1>
          <button onClick={() => navigate(-1)} className="btn btn-ghost btn-sm">
            <X className="w-5 h-5" />
            Close
          </button>
        </div>

        <div className="space-y-6">
          <div>
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">{complaint.title}</h2>
            <p className="text-gray-700 dark:text-gray-300 mt-2">{complaint.description}</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-base-200 p-4 rounded-lg">
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported By:</p>
              <p className="text-gray-900 dark:text-white">{complaint.user?.fullName || 'Unknown'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Building:</p>
              <p className="text-gray-900 dark:text-white">{complaint.buildingName?.buildingName || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Flat Number:</p>
              <p className="text-gray-900 dark:text-white">{complaint.flatNumber}</p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Category:</p>
              <p className="text-gray-900 dark:text-white"><span className="badge badge-outline">{complaint.category}</span></p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Status:</p>
              <p className="text-gray-900 dark:text-white"><span className={`badge ${complaint.status === 'Pending' ? 'badge-warning' : complaint.status === 'In Progress' ? 'badge-info' : 'badge-success'}`}>{complaint.status}</span></p>
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Reported On:</p>
              <p className="text-gray-900 dark:text-white">{format(new Date(complaint.createdAt), 'dd/MM/yyyy')}</p>
            </div>
            {/* Likes Count */}
            {complaint.likes && (
              <div>
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Likes:</p>
                <div className="flex items-center gap-1 text-gray-900 dark:text-white">
                  <Heart className="w-4 h-4 text-red-500 fill-red-500" />
                  <span>{complaint.likes.length}</span>
                </div>
              </div>
            )}
          </div>

          {/* Media Section */}
          {(images.length > 0 || videoUrl) && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Media</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group cursor-pointer" onClick={() => handleMediaClick({ src: image, type: "image", idx: `image-${index}` })}>
                    <img src={image} alt={`Complaint media ${index + 1}`} className="w-full h-32 object-cover rounded-lg shadow-md" />
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
                      <ImageIcon className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ))}
                {videoUrl && (
                  <div className="relative group cursor-pointer" onClick={() => handleMediaClick({ src: videoUrl, type: "video", idx: `video-0` })}>
                    <video src={videoUrl} className="w-full h-32 object-cover rounded-lg shadow-md" />
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
          {complaint.comments && complaint.comments.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Comments</h3>
              <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                {complaint.comments.map((comment, index) => {
                  const u = resolveUser(comment.user);
                  // Determine if the current admin is the author of the comment
                  const isAdminAuthor = admin && comment.user && String(comment.user._id) === String(admin._id) && comment.authorRole === 'admin';

                  console.log('AdminComplaintDetailsPage - Comment Debug:', {
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
                                if (!editText.trim()) return toast.error('Comment text cannot be empty.');
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

                        {(admin && comment.user && String(comment.user._id) === String(admin._id) && comment.authorRole === 'admin') && (
                          <div className="absolute top-2 right-2 flex gap-2">
                            <button onClick={() => { setEditingCommentId(comment._id); setEditText(comment.text); }} className="text-xs text-blue-600">Edit</button>
                            <button onClick={() => handleDeleteComment(comment._id)} className="text-xs text-red-600">Delete</button>
                          </div>
                        )}
                      </div>

                      {/* Replies Section */}
                      {comment.replies && comment.replies.length > 0 && (
                        <div className="mt-3 pl-10 space-y-2">
                          {comment.replies.map((reply) => {
                            const ru = resolveUser(reply.user);
                            const isAdminReplyAuthor = admin && reply.user && String(reply.user._id) === String(admin._id) && reply.authorRole === 'admin';

                            console.log('AdminComplaintDetailsPage - Reply Debug:', {
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
                                        if (!editText.trim()) return toast.error('Reply text cannot be empty.');
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

                                {(admin && reply.user && String(reply.user._id) === String(admin._id) && reply.authorRole === 'admin') && (
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
              {/* Comment Input Section */}
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
          )}
          {complaint.comments && complaint.comments.length === 0 && (
            <div className="text-center py-4 text-gray-500 dark:text-gray-400">
              No comments yet.
            </div>
          )}
        </div>

        {/* Lightbox for Images */}
        {lightboxOpen && slides.length > 0 && (
          <Lightbox
            slides={slides} // Use slides prop for yet-another-react-lightbox
            open={lightboxOpen}
            index={photoIndex}
            close={() => setLightboxOpen(false)}
            on={{ view: ({ index }) => setPhotoIndex(index) }} // Update index on view change
            plugins={[Video]} // Add the video plugin here
          />
        )}

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
    </div>
  );
};

export default AdminComplaintDetailsPage;
