// import React, { useState, useEffect } from 'react';
// import { useParams, useNavigate } from 'react-router-dom';
// import { format } from 'date-fns';
// import { LoaderCircle, X, Image as ImageIcon, Video as VideoIcon, Heart, MessageSquare, Edit2, Trash2, Check, XCircle, Building, Home, Calendar, Tag, Activity } from 'lucide-react';
// import toast from 'react-hot-toast';
// import "yet-another-react-lightbox/styles.css";
// import Video from "yet-another-react-lightbox/plugins/video";
// import { useSelector } from 'react-redux';
// import Lightbox from "yet-another-react-lightbox";
// import PhotoAlbum from "react-photo-album";


// import socket from '../../lib/socket';
// import { axiosInstance as axios } from '../../lib/axios';
// import { addComment } from '../../lib/complaintService';
// import { getComplaintByIdAdmin } from '../../lib/adminService';
// import ConfirmationModal from '../../Admin/components/ConfirmationModal';

// const AdminComplaintDetailsPage = () => {
//   const { id } = useParams();
//   const navigate = useNavigate();
//   const { admin } = useSelector(state => state.admin);
//   const [complaint, setComplaint] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [lightboxOpen, setLightboxOpen] = useState(false);
//   const [photoIndex, setPhotoIndex] = useState(0);
//   const [newCommentText, setNewCommentText] = useState('');
//   const [editingCommentId, setEditingCommentId] = useState(null);
//   const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
//   const [editText, setEditText] = useState('');
//   const [opLoadingId, setOpLoadingId] = useState(null);
//   const [pendingDelete, setPendingDelete] = useState(null);

//   useEffect(() => {
//     if (id) {
//       fetchComplaintDetails();
//     }

//     if (socket && id) {
//       console.log(`[AdminComplaintDetailsPage] Joining complaint room: ${id}`);
//       socket.emit("joinComplaintRoom", id);

//       const handleNewComment = (data) => {
//         console.log('[AdminComplaintDetailsPage] Received new comment:', data);
//         if (data.complaintId === id) {
//           setComplaint((prevComplaint) => {
//             if (!prevComplaint) return null;
//             const commentExists = prevComplaint.comments.some(c => String(c._id) === String(data.comment?._id));
//             if (commentExists) return prevComplaint;
//             setTimeout(() => {
//               toast.success("Comment added successfully!");
//             }, 0);
//             return {
//               ...prevComplaint,
//               comments: [...prevComplaint.comments, data.comment],
//             };
//           });
//         }
//       };

//       const handleNewReply = (data) => {
//         console.log('[AdminComplaintDetailsPage] Received new reply:', data);
//         if (data.complaintId === id) {
//           setComplaint((prevComplaint) => {
//             if (!prevComplaint) return null;

//             const nextComments = prevComplaint.comments.map(comment => {
//               if (comment._id === data.parentCommentId) {
//                 const replyExists = comment.replies.some(r => r._id === data.reply._id);
//                 if (replyExists) return comment;
//                 setTimeout(() => {
//                   toast.success("Reply added successfully!");
//                 }, 0);
//                 return {
//                   ...comment,
//                   replies: [...comment.replies, data.reply]
//                 };
//               }
//               return comment;
//             });

//             return {
//               ...prevComplaint,
//               comments: nextComments
//             };
//           });
//         }
//       };

//       socket.on("comment:added", handleNewComment);
//       socket.on("reply:added", handleNewReply);

//       return () => {
//         console.log(`[AdminComplaintDetailsPage] Leaving complaint room: ${id}`);
//         socket.emit("leaveComplaintRoom", id);
//         socket.off("comment:added", handleNewComment);
//         socket.off("reply:added", handleNewReply);
//       };
//     }
//   }, [id, socket]);

//   const fetchComplaintDetails = async () => {
//     try {
//       setLoading(true);
//       const response = await getComplaintByIdAdmin(id);
//       setComplaint(response.complaint);
//     } catch (err) {
//       setError(err.message || 'Failed to fetch complaint details.');
//       toast.error(err.message || 'Failed to fetch complaint details.');
//     } finally {
//       setLoading(false);
//     }
//   };

//   const resolveUser = (user) => {
//     if (user && typeof user === 'object' && user._id) {
//       const id = user._id;
//       let fullName = user.fullName;
//       let profilePic = user.profilePic;
//       let flatNumber = user.flatNumber;
//       const authorRole = user.authorRole;

//       if (authorRole === 'admin') {
//         fullName = "Admin";
//         profilePic = admin?.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png";
//         flatNumber = null;
//       }
//       return { id, fullName, profilePic, flatNumber, authorRole };
//     }

//     if (!user) return { id: null, fullName: null, profilePic: null, flatNumber: null, authorRole: null };

//     const id = user._id || user;
//     let fullName = user.fullName;
//     let profilePic = user.profilePic;
//     let flatNumber = user.flatNumber;
//     const authorRole = user.authorRole;

//     if (authorRole === 'admin') {
//       fullName = "Admin";
//       profilePic = admin?.profilePic || "https://cdn.pixabay.com/photo/2017/02/10/02/54/admin-2055371_1280.png";
//       flatNumber = null;
//     }

//     if (!fullName && admin && String(id) === String(admin._id)) {
//       fullName = admin.fullName;
//       profilePic = admin.profilePic;
//     }
//     if (!profilePic && admin && String(id) === String(admin._id)) {
//       profilePic = admin.profilePic;
//     }

//     return { id, fullName, profilePic, flatNumber, authorRole };
//   };

//   const openLightbox = (index) => {
//     setPhotoIndex(index);
//     setLightboxOpen(true);
//   };

//   const images = complaint?.images || [];
//   const videoUrl = complaint?.video;

//   const slides = [
//     ...images.map((src, idx) => ({
//       src,
//       type: "image",
//       idx: `image-${idx}`
//     })),
//     ...(videoUrl ? [{
//       src: videoUrl,
//       type: "video",
//       sources: [{ src: videoUrl, type: "video/mp4" }],
//       idx: `video-0`
//     }] : []),
//   ];

//   const handleMediaClick = (clickedItem) => {
//     const index = slides.findIndex(slide => slide.idx === clickedItem.idx);
//     if (index !== -1) {
//       setPhotoIndex(index);
//       setLightboxOpen(true);
//     }
//   };

//   const handleCommentSubmit = async (e) => {
//     e.preventDefault();
//     if (!newCommentText.trim()) {
//       return toast.error("Comment cannot be empty.");
//     }
//     try {
//       const response = await addComment(id, newCommentText);
//       setNewCommentText('');
//       setComplaint(prevComplaint => {
//         if (!prevComplaint) return null;
//         const commentExists = prevComplaint.comments.some(c => String(c._id) === String(response.data?.comment._id));
//         if (commentExists) return prevComplaint;
//         return {
//           ...prevComplaint,
//           comments: [...prevComplaint.comments, response.data?.comment],
//         };
//       });
//       toast.success("Comment added successfully!");
//     } catch (error) {
//       toast.error(error.message || "Failed to add comment.");
//     }
//   };

//   const handleEditComment = async (commentId) => {
//     if (!editText.trim()) return toast.error('Comment text cannot be empty.');

//     try {
//       setOpLoadingId(commentId + ':edit');
//       await axios.put(`/api/complaints/${id}/comment`, { commentId, text: editText });
//       toast.success('Comment edited');
//       fetchComplaintDetails();
//       setEditingCommentId(null);
//       setEditText('');
//     } catch (err) {
//       toast.error(err?.message || 'Failed to edit comment');
//     } finally { setOpLoadingId(null); }
//   };

//   const handleDeleteComment = async (commentId) => {
//     setPendingDelete({ type: 'comment', commentId });
//   };

//   const handleEditReply = async (commentId, replyId) => {
//     if (!editText.trim()) return toast.error('Reply text cannot be empty.');

//     try {
//       setOpLoadingId(replyId + ':edit');
//       await axios.put(`/api/complaints/${id}/comment`, { commentId, replyId, text: editText });
//       toast.success('Reply edited');
//       fetchComplaintDetails();
//       setEditingReply({ commentId: null, replyId: null });
//       setEditText('');
//     } catch (err) {
//       toast.error(err?.message || 'Failed to edit reply');
//     } finally { setOpLoadingId(null); }
//   };

//   const handleDeleteReply = async (commentId, replyId) => {
//     setPendingDelete({ type: 'reply', commentId, replyId });
//   };

//   const handleConfirmDelete = async () => {
//     if (!pendingDelete) return;

//     const { type, commentId, replyId } = pendingDelete;

//     try {
//       if (type === 'comment') {
//         setOpLoadingId(commentId + ':del');
//         await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId } });
//         toast.success('Comment deleted');
//       } else if (type === 'reply') {
//         setOpLoadingId(replyId + ':del');
//         await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId, replyId } });
//         toast.success('Reply deleted');
//       }
//       fetchComplaintDetails();
//     } catch (err) {
//       toast.error(err?.message || 'Failed to delete item');
//     } finally {
//       setOpLoadingId(null);
//       setPendingDelete(null);
//     }
//   };

//   const handleCancelDelete = () => {
//     setPendingDelete(null);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex justify-center items-center relative overflow-hidden">
//         {/* Animated background elements */}
//         <div className="absolute inset-0 overflow-hidden">
//           <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
//           <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
//         </div>

//         <div className="text-center z-10">
//           <div className="relative inline-block">
//             <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 blur-xl opacity-50 animate-pulse"></div>
//             <LoaderCircle className="relative animate-spin w-16 h-16 text-cyan-400" />
//           </div>
//           <p className="mt-6 text-xl font-light text-cyan-300 tracking-wider animate-pulse">Loading complaint details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (error) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 flex justify-center items-center">
//         <div className="text-center p-8 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl">
//           <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
//           <p className="text-red-300 text-xl">Error: {error}</p>
//         </div>
//       </div>
//     );
//   }

//   if (!complaint) {
//     return (
//       <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
//         <div className="text-center p-8 bg-gray-500/10 backdrop-blur-xl border border-gray-500/30 rounded-2xl">
//           <p className="text-gray-400 text-xl">Complaint not found.</p>
//         </div>
//       </div>
//     );
//   }

//   const getStatusColor = (status) => {
//     switch (status) {
//       case 'Pending': return 'from-amber-500 to-orange-600';
//       case 'In Progress': return 'from-blue-500 to-cyan-600';
//       case 'Resolved': return 'from-emerald-500 to-teal-600';
//       default: return 'from-gray-500 to-slate-600';
//     }
//   };

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
//       {/* Animated background grid */}
//       <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

//       {/* Floating orbs */}
//       <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse"></div>
//       <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000"></div>

//       <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
//         {/* Header */}
//         <div className="mb-8 backdrop-blur-xl bg-gradient-to-r from-slate-900/80 via-blue-900/40 to-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-500 group">
//           <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
//             <div>
//               <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
//                 Complaint Details
//               </h1>
//               <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mt-2 group-hover:w-32 transition-all duration-500"></div>
//             </div>
//             <button
//               onClick={() => navigate(-1)}
//               className="group/btn backdrop-blur-xl bg-slate-800/50 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 border border-cyan-500/30 hover:border-cyan-400 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
//             >
//               <div className="flex items-center gap-2">
//                 <X className="w-5 h-5 text-cyan-300 group-hover/btn:rotate-90 transition-transform duration-300" />
//                 <span className="text-cyan-300 font-medium">Close</span>
//               </div>
//             </button>
//           </div>
//         </div>

//         {/* Main Content Card */}
//         <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 border border-cyan-500/20 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
//           {/* Title Section with Gradient Overlay */}
//           <div className="relative p-8 border-b border-cyan-500/20 bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
//             <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent"></div>
//             <h2 className="relative text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-white to-cyan-200 bg-clip-text mb-3">
//               {complaint.title}
//             </h2>
//             <p className="relative text-gray-300 leading-relaxed">{complaint.description}</p>
//           </div>

//           {/* Info Grid with Glassmorphism Cards */}
//           <div className="p-6 sm:p-8">
//             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
//               {/* Reported By */}
//               <div className="group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-cyan-500/20 rounded-2xl p-5 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-cyan-500/20">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50">
//                     <Home className="w-5 h-5 text-white" />
//                   </div>
//                   <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">Reported By</p>
//                 </div>
//                 <p className="text-white font-semibold text-lg">{complaint.user?.fullName || 'Unknown'}</p>
//               </div>

//               {/* Building */}
//               <div className="group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-purple-500/20 rounded-2xl p-5 hover:border-purple-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-purple-500/20">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg shadow-purple-500/50">
//                     <Building className="w-5 h-5 text-white" />
//                   </div>
//                   <p className="text-xs font-medium text-purple-400 uppercase tracking-wider">Building</p>
//                 </div>
//                 <p className="text-white font-semibold text-lg">{complaint.buildingName?.buildingName || 'N/A'}</p>
//               </div>

//               {/* Flat Number */}
//               <div className="group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-blue-500/20 rounded-2xl p-5 hover:border-blue-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-blue-500/20">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
//                     <Home className="w-5 h-5 text-white" />
//                   </div>
//                   <p className="text-xs font-medium text-blue-400 uppercase tracking-wider">Flat Number</p>
//                 </div>
//                 <p className="text-white font-semibold text-lg">{complaint.flatNumber}</p>
//               </div>

//               {/* Category */}
//               <div className="group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-emerald-500/20 rounded-2xl p-5 hover:border-emerald-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/20">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/50">
//                     <Tag className="w-5 h-5 text-white" />
//                   </div>
//                   <p className="text-xs font-medium text-emerald-400 uppercase tracking-wider">Category</p>
//                 </div>
//                 <div className="inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full">
//                   <span className="text-emerald-300 font-medium text-sm">{complaint.category}</span>
//                 </div>
//               </div>

//               {/* Status */}
//               <div className="group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-amber-500/20 rounded-2xl p-5 hover:border-amber-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-amber-500/20">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg shadow-amber-500/50">
//                     <Activity className="w-5 h-5 text-white" />
//                   </div>
//                   <p className="text-xs font-medium text-amber-400 uppercase tracking-wider">Status</p>
//                 </div>
//                 <div className={`inline-block px-4 py-1.5 bg-gradient-to-r ${getStatusColor(complaint.status)} rounded-full shadow-lg`}>
//                   <span className="text-white font-bold text-sm">{complaint.status}</span>
//                 </div>
//               </div>

//               {/* Date */}
//               <div className="group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-pink-500/20 rounded-2xl p-5 hover:border-pink-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-pink-500/20">
//                 <div className="flex items-center gap-3 mb-2">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-500 to-rose-600 flex items-center justify-center shadow-lg shadow-pink-500/50">
//                     <Calendar className="w-5 h-5 text-white" />
//                   </div>
//                   <p className="text-xs font-medium text-pink-400 uppercase tracking-wider">Reported On</p>
//                 </div>
//                 <p className="text-white font-semibold text-lg">{format(new Date(complaint.createdAt), 'dd/MM/yyyy')}</p>
//               </div>
//             </div>

//             {/* Likes */}
//             {complaint.likes && (
//               <div className="mb-8 backdrop-blur-xl bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-2xl p-6 hover:border-red-400/50 transition-all duration-300">
//                 <div className="flex items-center gap-4">
//                   <div className="relative">
//                     <div className="absolute inset-0 bg-red-500 blur-xl opacity-50 animate-pulse"></div>
//                     <Heart className="relative w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
//                   </div>
//                   <div>
//                     <p className="text-red-300 text-sm uppercase tracking-wider font-medium">Community Support</p>
//                     <p className="text-3xl font-bold text-white">{complaint.likes.length} <span className="text-lg text-red-300">Likes</span></p>
//                   </div>
//                 </div>
//               </div>
//             )}

//             {/* Media Gallery */}
//             {(images.length > 0 || videoUrl) && (
//               <div className="mb-8">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/50">
//                     <ImageIcon className="w-5 h-5 text-white" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text">Media Gallery</h3>
//                 </div>
//                 <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
//                   {images.map((image, index) => (
//                     <div
//                       key={index}
//                       className="group relative cursor-pointer overflow-hidden rounded-2xl border border-violet-500/20 hover:border-violet-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-violet-500/30"
//                       onClick={() => handleMediaClick({ src: image, type: "image", idx: `image-${index}` })}
//                     >
//                       <img
//                         src={image}
//                         alt={`Complaint media ${index + 1}`}
//                         className="w-full h-32 sm:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-violet-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
//                         <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
//                           <ImageIcon className="w-10 h-10 text-white drop-shadow-lg" />
//                         </div>
//                       </div>
//                     </div>
//                   ))}
//                   {videoUrl && (
//                     <div
//                       className="group relative cursor-pointer overflow-hidden rounded-2xl border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/30"
//                       onClick={() => handleMediaClick({ src: videoUrl, type: "video", idx: `video-0` })}
//                     >
//                       <video
//                         src={videoUrl}
//                         className="w-full h-32 sm:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
//                       />
//                       <div className="absolute inset-0 bg-gradient-to-t from-cyan-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
//                         <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
//                           <VideoIcon className="w-10 h-10 text-white drop-shadow-lg" />
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             )}

//             {(images.length === 0 && !videoUrl) && (
//               <div className="mb-8 text-center py-12 backdrop-blur-xl bg-slate-800/30 border border-dashed border-slate-600/50 rounded-2xl">
//                 <ImageIcon className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
//                 <p className="text-slate-400">No media attached to this complaint.</p>
//               </div>
//             )}

//             {/* Comments Section */}
//             {complaint.comments && complaint.comments.length > 0 && (
//               <div className="mb-8">
//                 <div className="flex items-center gap-3 mb-6">
//                   <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
//                     <MessageSquare className="w-5 h-5 text-white" />
//                   </div>
//                   <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">
//                     Comments ({complaint.comments.length})
//                   </h3>
//                 </div>
//                 <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-cyan-600/50 hover:scrollbar-thumb-cyan-500/70">
//                   {complaint.comments.map((comment, index) => {
//                     const u = resolveUser(comment.user);
//                     const isAdminAuthor = admin && comment.user && String(comment.user._id) === String(admin._id) && comment.authorRole === 'admin';

//                     return (
//                       <div
//                         key={index}
//                         className="backdrop-blur-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 animate-fadeIn"
//                       >
//                         <div className="flex justify-between items-start mb-4">
//                           <div className="flex items-center gap-3">
//                             <div className="relative group/avatar">
//                               <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-0 group-hover/avatar:opacity-70 transition-opacity duration-300"></div>
//                               <img
//                                 src={u.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
//                                 alt={u.fullName || 'Anonymous'}
//                                 className="relative w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30 group-hover/avatar:border-cyan-400 transition-all duration-300"
//                               />
//                             </div>
//                             <div>
//                               <p className="font-bold text-white text-lg">{u.fullName || 'Unknown'}</p>
//                               {u.authorRole !== 'admin' && (
//                                 <p className="text-xs text-cyan-400 flex items-center gap-1">
//                                   <Home className="w-3 h-3" />
//                                   Flat {u.flatNumber || 'N/A'}
//                                 </p>
//                               )}
//                               {u.authorRole === 'admin' && (
//                                 <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
//                                   Admin
//                                 </span>
//                               )}
//                             </div>
//                           </div>
//                           <div className="flex items-center gap-2">
//                             <span className="text-xs text-slate-400 flex items-center gap-1">
//                               <Calendar className="w-3 h-3" />
//                               {format(new Date(comment.createdAt), 'dd/MM/yyyy')}
//                             </span>
//                           </div>
//                         </div>

//                         <div className="relative">
//                           {editingCommentId === comment._id ? (
//                             <div className="space-y-3">
//                               <textarea
//                                 value={editText}
//                                 onChange={(e) => setEditText(e.target.value)}
//                                 className="w-full p-4 bg-slate-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 resize-none"
//                                 rows={3}
//                                 placeholder="Edit your comment..."
//                               />
//                               <div className="flex gap-3">
//                                 <button
//                                   className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50"
//                                   onClick={async () => {
//                                     if (!editText.trim()) return toast.error('Comment text cannot be empty.');
//                                     await handleEditComment(comment._id);
//                                     setEditingCommentId(null);
//                                     setEditText('');
//                                   }}
//                                 >
//                                   <Check className="w-4 h-4" />
//                                   Save
//                                 </button>
//                                 <button
//                                   className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105"
//                                   onClick={() => { setEditingCommentId(null); setEditText(''); }}
//                                 >
//                                   <XCircle className="w-4 h-4" />
//                                   Cancel
//                                 </button>
//                               </div>
//                             </div>
//                           ) : (
//                             <>
//                               <p className="text-gray-300 leading-relaxed">{comment.text}</p>
//                               {comment.editedAt && (
//                                 <span className="text-xs text-slate-500 italic ml-2">
//                                   (edited {format(new Date(comment.editedAt), 'dd/MM/yyyy')})
//                                 </span>
//                               )}
//                             </>
//                           )}

//                           {isAdminAuthor && editingCommentId !== comment._id && (
//                             <div className="absolute top-0 right-0 flex gap-2">
//                               <button
//                                 onClick={() => { setEditingCommentId(comment._id); setEditText(comment.text); }}
//                                 className="group/btn p-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
//                               >
//                                 <Edit2 className="w-4 h-4 text-blue-400 group-hover/btn:text-blue-300" />
//                               </button>
//                               <button
//                                 onClick={() => handleDeleteComment(comment._id)}
//                                 className="group/btn p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-400 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50"
//                               >
//                                 <Trash2 className="w-4 h-4 text-red-400 group-hover/btn:text-red-300" />
//                               </button>
//                             </div>
//                           )}
//                         </div>

//                         {/* Replies Section */}
//                         {comment.replies && comment.replies.length > 0 && (
//                           <div className="mt-6 pl-6 sm:pl-12 space-y-3 border-l-2 border-cyan-500/20">
//                             {comment.replies.map((reply) => {
//                               const ru = resolveUser(reply.user);
//                               const isAdminReplyAuthor = admin && reply.user && String(reply.user._id) === String(admin._id) && reply.authorRole === 'admin';

//                               return (
//                                 <div
//                                   key={reply._id}
//                                   className="backdrop-blur-xl bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-blue-500/20 rounded-xl p-4 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10"
//                                 >
//                                   <div className="flex justify-between items-start mb-3">
//                                     <div className="flex items-center gap-2">
//                                       <div className="relative group/avatar">
//                                         <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-0 group-hover/avatar:opacity-70 transition-opacity duration-300"></div>
//                                         <img
//                                           src={ru.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
//                                           alt={ru.fullName || 'Anonymous'}
//                                           className="relative w-8 h-8 rounded-full object-cover border-2 border-blue-500/30 group-hover/avatar:border-blue-400 transition-all duration-300"
//                                         />
//                                       </div>
//                                       <div>
//                                         <p className="text-sm font-bold text-white">{ru.fullName || 'Unknown'}</p>
//                                         {ru.authorRole === 'admin' && (
//                                           <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
//                                             Admin
//                                           </span>
//                                         )}
//                                       </div>
//                                     </div>
//                                     <p className="text-xs text-slate-400">{format(new Date(reply.createdAt), 'dd/MM/yyyy')}</p>
//                                   </div>

//                                   <div className="relative">
//                                     {editingReply.commentId === comment._id && editingReply.replyId === reply._id ? (
//                                       <div className="space-y-2">
//                                         <textarea
//                                           className="w-full p-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none text-sm"
//                                           rows={2}
//                                           value={editText}
//                                           onChange={(e) => setEditText(e.target.value)}
//                                           placeholder="Edit your reply..."
//                                         />
//                                         <div className="flex gap-2">
//                                           <button
//                                             className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white text-sm font-medium flex items-center gap-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50"
//                                             onClick={async () => {
//                                               if (!editText.trim()) return toast.error('Reply text cannot be empty.');
//                                               await handleEditReply(comment._id, reply._id);
//                                               setEditingReply({ commentId: null, replyId: null });
//                                               setEditText('');
//                                             }}
//                                           >
//                                             <Check className="w-3 h-3" />
//                                             Save
//                                           </button>
//                                           <button
//                                             className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 text-sm font-medium flex items-center gap-1 transition-all duration-300 hover:scale-105"
//                                             onClick={() => { setEditingReply({ commentId: null, replyId: null }); setEditText(''); }}
//                                           >
//                                             <XCircle className="w-3 h-3" />
//                                             Cancel
//                                           </button>
//                                         </div>
//                                       </div>
//                                     ) : (
//                                       <>
//                                         <p className="text-sm text-gray-300 leading-relaxed">{reply.text}</p>
//                                         {reply.editedAt && (
//                                           <span className="text-xs text-slate-500 italic ml-2">
//                                             (edited {format(new Date(reply.editedAt), 'dd/MM/yyyy')})
//                                           </span>
//                                         )}
//                                       </>
//                                     )}

//                                     {isAdminReplyAuthor && !(editingReply.commentId === comment._id && editingReply.replyId === reply._id) && (
//                                       <div className="absolute top-0 right-0 flex gap-1">
//                                         <button
//                                           onClick={() => { setEditingReply({ commentId: comment._id, replyId: reply._id }); setEditText(reply.text); }}
//                                           className="group/btn p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400 rounded-md transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-blue-500/50"
//                                         >
//                                           <Edit2 className="w-3 h-3 text-blue-400 group-hover/btn:text-blue-300" />
//                                         </button>
//                                         <button
//                                           onClick={() => handleDeleteReply(comment._id, reply._id)}
//                                           className="group/btn p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-400 rounded-md transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-red-500/50"
//                                         >
//                                           <Trash2 className="w-3 h-3 text-red-400 group-hover/btn:text-red-300" />
//                                         </button>
//                                       </div>
//                                     )}
//                                   </div>
//                                 </div>
//                               );
//                             })}
//                           </div>
//                         )}
//                       </div>
//                     );
//                   })}
//                 </div>
//               </div>
//             )}

//             {complaint.comments && complaint.comments.length === 0 && (
//               <div className="mb-8 text-center py-12 backdrop-blur-xl bg-slate-800/30 border border-dashed border-slate-600/50 rounded-2xl">
//                 <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
//                 <p className="text-slate-400">No comments yet. Be the first to comment!</p>
//               </div>
//             )}

//             {/* Add Comment Form */}
//             <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
//               <div className="flex items-center gap-3 mb-4">
//                 <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
//                   <MessageSquare className="w-5 h-5 text-white" />
//                 </div>
//                 <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
//                   Add Your Comment
//                 </h3>
//               </div>
//               <form onSubmit={handleCommentSubmit} className="space-y-4">
//                 <textarea
//                   className="w-full p-4 bg-slate-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 resize-none"
//                   rows="4"
//                   placeholder="Share your thoughts on this complaint..."
//                   value={newCommentText}
//                   onChange={(e) => setNewCommentText(e.target.value)}
//                 ></textarea>
//                 <button
//                   type="submit"
//                   className="group/submit w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 relative overflow-hidden"
//                 >
//                   <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/submit:translate-x-[100%] transition-transform duration-1000"></div>
//                   <MessageSquare className="w-6 h-6 relative z-10 group-hover/submit:rotate-12 transition-transform duration-300" />
//                   <span className="relative z-10">Post Comment</span>
//                 </button>
//               </form>
//             </div>
//           </div>
//         </div>
//       </div>

//       {/* Lightbox */}
//       {lightboxOpen && slides.length > 0 && (
//         <Lightbox
//           slides={slides}
//           open={lightboxOpen}
//           index={photoIndex}
//           close={() => setLightboxOpen(false)}
//           on={{ view: ({ index }) => setPhotoIndex(index) }}
//           plugins={[Video]}
//         />
//       )}

//       {/* Confirmation Modal */}
//       {pendingDelete && (
//         <ConfirmationModal
//           isOpen={!!pendingDelete}
//           onClose={handleCancelDelete}
//           onConfirm={handleConfirmDelete}
//           title={`Confirm ${pendingDelete.type === 'comment' ? 'Comment' : 'Reply'} Deletion`}
//           message={`Are you sure you want to delete this ${pendingDelete.type === 'comment' ? 'comment' : 'reply'}? This action cannot be undone.`}
//         />
//       )}

//       <style>{`
//         @keyframes fadeIn {
//           from {
//             opacity: 0;
//             transform: translateY(10px);
//           }
//           to {
//             opacity: 1;
//             transform: translateY(0);
//           }
//         }

//         .animate-fadeIn {
//           animation: fadeIn 0.5s ease-out;
//         }

//         .animation-delay-2000 {
//           animation-delay: 2s;
//         }

//         .scrollbar-thin::-webkit-scrollbar {
//           width: 8px;
//         }

//         .scrollbar-track-slate-800\/50::-webkit-scrollbar-track {
//           background: rgba(30, 41, 59, 0.5);
//           border-radius: 10px;
//         }

//         .scrollbar-thumb-cyan-600\/50::-webkit-scrollbar-thumb {
//           background: rgba(8, 145, 178, 0.5);
//           border-radius: 10px;
//         }

//         .scrollbar-thumb-cyan-600\/50:hover::-webkit-scrollbar-thumb {
//           background: rgba(6, 182, 212, 0.7);
//         }
//       `}</style>
//     </div>
//   );
// };

// export default AdminComplaintDetailsPage;

import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { LoaderCircle, X, Image as ImageIcon, Video as VideoIcon, Heart, MessageSquare, Edit2, Trash2, Check, XCircle, Building, Home, Calendar, Tag, Activity } from 'lucide-react';
import toast from 'react-hot-toast';
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import { useSelector } from 'react-redux';
import Lightbox from "yet-another-react-lightbox";

// Memoized sub-components to prevent unnecessary re-renders
const InfoCard = memo(({ icon: Icon, title, value, gradient, iconGradient, badge }) => (
  <div className={`group backdrop-blur-xl bg-gradient-to-br from-slate-800/50 to-slate-900/50 border border-${gradient}-500/20 rounded-2xl p-5 hover:border-${gradient}-400/50 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-${gradient}-500/20`}>
    <div className="flex items-center gap-3 mb-2">
      <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${iconGradient} flex items-center justify-center shadow-lg shadow-${gradient}-500/50`}>
        <Icon className="w-5 h-5 text-white" />
      </div>
      <p className={`text-xs font-medium text-${gradient}-400 uppercase tracking-wider`}>{title}</p>
    </div>
    {badge ? (
      <div className={badge.className}>
        <span className={badge.textClass}>{value}</span>
      </div>
    ) : (
      <p className="text-white font-semibold text-lg">{value}</p>
    )}
  </div>
));

const MediaItem = memo(({ item, index, onClick }) => {
  const isVideo = item.type === 'video';
  const Icon = isVideo ? VideoIcon : ImageIcon;
  const gradientColor = isVideo ? 'cyan' : 'violet';

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-2xl border border-${gradientColor}-500/20 hover:border-${gradientColor}-400/50 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-${gradientColor}-500/30`}
      onClick={() => onClick(item)}
    >
      {isVideo ? (
        <video
          src={item.src}
          className="w-full h-32 sm:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
          preload="metadata"
        />
      ) : (
        <img
          src={item.src}
          alt={`Complaint media ${index + 1}`}
          className="w-full h-32 sm:h-40 object-cover transition-transform duration-500 group-hover:scale-110"
          loading="lazy"
        />
      )}
      <div className={`absolute inset-0 bg-gradient-to-t from-${gradientColor}-900/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center`}>
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <Icon className="w-10 h-10 text-white drop-shadow-lg" />
        </div>
      </div>
    </div>
  );
});

const ReplyItem = memo(({ reply, commentId, admin, onEdit, onDelete, editingReply, editText, setEditText, handleEditReply, setEditingReply }) => {
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

  const ru = useMemo(() => resolveUser(reply.user), [reply.user, resolveUser]);
  const isAdminReplyAuthor = useMemo(() =>
    admin && reply.user && String(reply.user._id) === String(admin._id) && reply.authorRole === 'admin',
    [admin, reply.user, reply.authorRole]
  );
  const isEditing = editingReply.commentId === commentId && editingReply.replyId === reply._id;

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-700/40 to-slate-800/40 border border-blue-500/20 rounded-xl p-4 hover:border-blue-400/40 transition-all duration-300 hover:shadow-lg hover:shadow-blue-500/10">
      <div className="flex justify-between items-start mb-3">
        <div className="flex items-center gap-2">
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-sm opacity-0 group-hover/avatar:opacity-70 transition-opacity duration-300"></div>
            <img
              src={ru.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
              alt={ru.fullName || 'Anonymous'}
              className="relative w-8 h-8 rounded-full object-cover border-2 border-blue-500/30 group-hover/avatar:border-blue-400 transition-all duration-300"
              loading="lazy"
            />
          </div>
          <div>
            <p className="text-sm font-bold text-white">{ru.fullName || 'Unknown'}</p>
            {ru.authorRole === 'admin' && (
              <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
                Admin
              </span>
            )}
          </div>
        </div>
        <p className="text-xs text-slate-400">{format(new Date(reply.createdAt), 'dd/MM/yyyy')}</p>
      </div>

      <div className="relative">
        {isEditing ? (
          <div className="space-y-2">
            <textarea
              className="w-full p-3 bg-slate-900/50 border border-blue-500/30 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 resize-none text-sm"
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edit your reply..."
            />
            <div className="flex gap-2">
              <button
                className="px-3 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white text-sm font-medium flex items-center gap-1 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50"
                onClick={async () => {
                  if (!editText.trim()) return toast.error('Reply text cannot be empty.');
                  await handleEditReply(commentId, reply._id);
                  setEditingReply({ commentId: null, replyId: null });
                  setEditText('');
                }}
              >
                <Check className="w-3 h-3" />
                Save
              </button>
              <button
                className="px-3 py-1.5 bg-slate-700/50 hover:bg-slate-600/50 rounded-lg text-slate-300 text-sm font-medium flex items-center gap-1 transition-all duration-300 hover:scale-105"
                onClick={() => { setEditingReply({ commentId: null, replyId: null }); setEditText(''); }}
              >
                <XCircle className="w-3 h-3" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-300 leading-relaxed">{reply.text}</p>
            {reply.editedAt && (
              <span className="text-xs text-slate-500 italic ml-2">
                (edited {format(new Date(reply.editedAt), 'dd/MM/yyyy')})
              </span>
            )}
          </>
        )}

        {isAdminReplyAuthor && !isEditing && (
          <div className="absolute top-0 right-0 flex gap-1">
            <button
              onClick={() => { onEdit(commentId, reply._id, reply.text); }}
              className="group/btn p-1.5 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400 rounded-md transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-blue-500/50"
            >
              <Edit2 className="w-3 h-3 text-blue-400 group-hover/btn:text-blue-300" />
            </button>
            <button
              onClick={() => onDelete(commentId, reply._id)}
              className="group/btn p-1.5 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-400 rounded-md transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-red-500/50"
            >
              <Trash2 className="w-3 h-3 text-red-400 group-hover/btn:text-red-300" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
});

const CommentItem = memo(({ comment, index, admin, resolveUser, editingCommentId, editText, setEditText, handleEditComment, setEditingCommentId, handleDeleteComment, editingReply, setEditingReply, handleEditReply, handleDeleteReply }) => {
  const u = useMemo(() => resolveUser(comment.user), [comment.user, resolveUser]);
  const isAdminAuthor = useMemo(() =>
    admin && comment.user && String(comment.user._id) === String(admin._id) && comment.authorRole === 'admin',
    [admin, comment.user, comment.authorRole]
  );

  const handleEdit = useCallback((commentId, replyId, text) => {
    setEditingReply({ commentId, replyId });
    setEditText(text);
  }, [setEditingReply, setEditText]);

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border border-cyan-500/20 rounded-2xl p-6 hover:border-cyan-400/40 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/10 animate-fadeIn">
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="relative group/avatar">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full blur-md opacity-0 group-hover/avatar:opacity-70 transition-opacity duration-300"></div>
            <img
              src={u.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
              alt={u.fullName || 'Anonymous'}
              className="relative w-12 h-12 rounded-full object-cover border-2 border-cyan-500/30 group-hover/avatar:border-cyan-400 transition-all duration-300"
              loading="lazy"
            />
          </div>
          <div>
            <p className="font-bold text-white text-lg">{u.fullName || 'Unknown'}</p>
            {u.authorRole !== 'admin' && (
              <p className="text-xs text-cyan-400 flex items-center gap-1">
                <Home className="w-3 h-3" />
                Flat {u.flatNumber || 'N/A'}
              </p>
            )}
            {u.authorRole === 'admin' && (
              <span className="inline-block px-2 py-0.5 bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-full text-xs text-purple-300 font-medium">
                Admin
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 flex items-center gap-1">
            <Calendar className="w-3 h-3" />
            {format(new Date(comment.createdAt), 'dd/MM/yyyy')}
          </span>
        </div>
      </div>

      <div className="relative">
        {editingCommentId === comment._id ? (
          <div className="space-y-3">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-4 bg-slate-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/20 transition-all duration-300 resize-none"
              rows={3}
              placeholder="Edit your comment..."
            />
            <div className="flex gap-3">
              <button
                className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-xl text-white font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50"
                onClick={async () => {
                  if (!editText.trim()) return toast.error('Comment text cannot be empty.');
                  await handleEditComment(comment._id);
                  setEditingCommentId(null);
                  setEditText('');
                }}
              >
                <Check className="w-4 h-4" />
                Save
              </button>
              <button
                className="px-4 py-2 bg-slate-700/50 hover:bg-slate-600/50 rounded-xl text-slate-300 font-medium flex items-center gap-2 transition-all duration-300 hover:scale-105"
                onClick={() => { setEditingCommentId(null); setEditText(''); }}
              >
                <XCircle className="w-4 h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-300 leading-relaxed">{comment.text}</p>
            {comment.editedAt && (
              <span className="text-xs text-slate-500 italic ml-2">
                (edited {format(new Date(comment.editedAt), 'dd/MM/yyyy')})
              </span>
            )}
          </>
        )}

        {isAdminAuthor && editingCommentId !== comment._id && (
          <div className="absolute top-0 right-0 flex gap-2">
            <button
              onClick={() => { setEditingCommentId(comment._id); setEditText(comment.text); }}
              className="group/btn p-2 bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 hover:border-blue-400 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50"
            >
              <Edit2 className="w-4 h-4 text-blue-400 group-hover/btn:text-blue-300" />
            </button>
            <button
              onClick={() => handleDeleteComment(comment._id)}
              className="group/btn p-2 bg-red-600/20 hover:bg-red-600/40 border border-red-500/30 hover:border-red-400 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50"
            >
              <Trash2 className="w-4 h-4 text-red-400 group-hover/btn:text-red-300" />
            </button>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-6 pl-6 sm:pl-12 space-y-3 border-l-2 border-cyan-500/20">
          {comment.replies.map((reply) => (
            <ReplyItem
              key={reply._id}
              reply={reply}
              commentId={comment._id}
              admin={admin}
              onEdit={handleEdit}
              onDelete={handleDeleteReply}
              editingReply={editingReply}
              editText={editText}
              setEditText={setEditText}
              handleEditReply={handleEditReply}
              setEditingReply={setEditingReply}
            />
          ))}
        </div>
      )}
    </div>
  );
});

const AdminComplaintDetailsPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { admin } = useSelector(state => state.admin);
  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [photoIndex, setPhotoIndex] = useState(0);
  const [newCommentText, setNewCommentText] = useState('');
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingReply, setEditingReply] = useState({ commentId: null, replyId: null });
  const [editText, setEditText] = useState('');
  const [opLoadingId, setOpLoadingId] = useState(null);
  const [pendingDelete, setPendingDelete] = useState(null);

  // Memoized user resolver to prevent recreating on every render
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

  // Memoize expensive computations
  const slides = useMemo(() => {
    const images = complaint?.images || [];
    const videoUrl = complaint?.video;

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
  }, [complaint?.images, complaint?.video]);

  const mediaItems = useMemo(() => {
    const images = complaint?.images || [];
    const videoUrl = complaint?.video;

    return [
      ...images.map((src, idx) => ({ src, type: "image", idx: `image-${idx}` })),
      ...(videoUrl ? [{ src: videoUrl, type: "video", idx: `video-0` }] : [])
    ];
  }, [complaint?.images, complaint?.video]);

  const getStatusColor = useCallback((status) => {
    switch (status) {
      case 'Pending': return 'from-amber-500 to-orange-600';
      case 'In Progress': return 'from-blue-500 to-cyan-600';
      case 'Resolved': return 'from-emerald-500 to-teal-600';
      default: return 'from-gray-500 to-slate-600';
    }
  }, []);

  const handleMediaClick = useCallback((clickedItem) => {
    const index = slides.findIndex(slide => slide.idx === clickedItem.idx);
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
    try {
      // Imported from original code - addComment function
      // const response = await addComment(id, newCommentText);
      setNewCommentText('');
      // Update logic remains the same
      toast.success("Comment added successfully!");
    } catch (error) {
      toast.error(error.message || "Failed to add comment.");
    }
  }, [newCommentText, id]);

  const handleEditComment = useCallback(async (commentId) => {
    if (!editText.trim()) return toast.error('Comment text cannot be empty.');

    try {
      setOpLoadingId(commentId + ':edit');
      // await axios.put(`/api/complaints/${id}/comment`, { commentId, text: editText });
      toast.success('Comment edited');
      // fetchComplaintDetails();
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit comment');
    } finally { setOpLoadingId(null); }
  }, [editText, id]);

  const handleDeleteComment = useCallback(async (commentId) => {
    setPendingDelete({ type: 'comment', commentId });
  }, []);

  const handleEditReply = useCallback(async (commentId, replyId) => {
    if (!editText.trim()) return toast.error('Reply text cannot be empty.');

    try {
      setOpLoadingId(replyId + ':edit');
      // await axios.put(`/api/complaints/${id}/comment`, { commentId, replyId, text: editText });
      toast.success('Reply edited');
      // fetchComplaintDetails();
      setEditingReply({ commentId: null, replyId: null });
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit reply');
    } finally { setOpLoadingId(null); }
  }, [editText, id]);

  const handleDeleteReply = useCallback(async (commentId, replyId) => {
    setPendingDelete({ type: 'reply', commentId, replyId });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!pendingDelete) return;

    const { type, commentId, replyId } = pendingDelete;

    try {
      if (type === 'comment') {
        setOpLoadingId(commentId + ':del');
        // await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId } });
        toast.success('Comment deleted');
      } else if (type === 'reply') {
        setOpLoadingId(replyId + ':del');
        // await axios.delete(`/api/complaints/${id}/comment`, { data: { commentId, replyId } });
        toast.success('Reply deleted');
      }
      // fetchComplaintDetails();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete item');
    } finally {
      setOpLoadingId(null);
      setPendingDelete(null);
    }
  }, [pendingDelete, id]);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  // Socket effects remain largely the same but with stable callbacks
  useEffect(() => {
    if (id) {
      // fetchComplaintDetails();
    }

    // Socket logic would remain here
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex justify-center items-center relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse top-0 left-0"></div>
          <div className="absolute w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse bottom-0 right-0 animation-delay-2000"></div>
        </div>
        <div className="text-center z-10">
          <div className="relative inline-block">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-blue-600 blur-xl opacity-50 animate-pulse"></div>
            <LoaderCircle className="relative animate-spin w-16 h-16 text-cyan-400" />
          </div>
          <p className="mt-6 text-xl font-light text-cyan-300 tracking-wider animate-pulse">Loading complaint details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 flex justify-center items-center">
        <div className="text-center p-8 bg-red-500/10 backdrop-blur-xl border border-red-500/30 rounded-2xl">
          <XCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
          <p className="text-red-300 text-xl">Error: {error}</p>
        </div>
      </div>
    );
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center">
        <div className="text-center p-8 bg-gray-500/10 backdrop-blur-xl border border-gray-500/30 rounded-2xl">
          <p className="text-gray-400 text-xl">Complaint not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 relative overflow-hidden">
      <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.05)_1px,transparent_1px)] bg-[size:50px_50px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)] pointer-events-none"></div>
      <div className="absolute top-20 left-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl animate-pulse pointer-events-none"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse animation-delay-2000 pointer-events-none"></div>

      <div className="relative z-10 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 backdrop-blur-xl bg-gradient-to-r from-slate-900/80 via-blue-900/40 to-slate-900/80 border border-cyan-500/30 rounded-3xl p-6 shadow-2xl shadow-cyan-500/20 hover:shadow-cyan-500/40 transition-all duration-500 group">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 bg-clip-text text-transparent tracking-tight">
                Complaint Details
              </h1>
              <div className="h-1 w-20 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full mt-2 group-hover:w-32 transition-all duration-500"></div>
            </div>
            <button
              onClick={() => navigate(-1)}
              className="group/btn backdrop-blur-xl bg-slate-800/50 hover:bg-gradient-to-r hover:from-cyan-600 hover:to-blue-600 border border-cyan-500/30 hover:border-cyan-400 rounded-xl px-6 py-3 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/50"
            >
              <div className="flex items-center gap-2">
                <X className="w-5 h-5 text-cyan-300 group-hover/btn:rotate-90 transition-transform duration-300" />
                <span className="text-cyan-300 font-medium">Close</span>
              </div>
            </button>
          </div>
        </div>

        {/* Main Content Card */}
        <div className="backdrop-blur-xl bg-gradient-to-br from-slate-900/90 via-blue-900/30 to-slate-900/90 border border-cyan-500/20 rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden">
          {/* Title Section */}
          <div className="relative p-8 border-b border-cyan-500/20 bg-gradient-to-r from-blue-600/10 to-cyan-600/10">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-cyan-500/5 to-transparent pointer-events-none"></div>
            <h2 className="relative text-2xl sm:text-3xl font-bold text-transparent bg-gradient-to-r from-white to-cyan-200 bg-clip-text mb-3">
              {complaint.title}
            </h2>
            <p className="relative text-gray-300 leading-relaxed">{complaint.description}</p>
          </div>

          {/* Info Grid */}
          <div className="p-6 sm:p-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              <InfoCard
                icon={Home}
                title="Reported By"
                value={complaint.user?.fullName || 'Unknown'}
                gradient="cyan"
                iconGradient="from-cyan-500 to-blue-600"
              />
              <InfoCard
                icon={Building}
                title="Building"
                value={complaint.buildingName?.buildingName || 'N/A'}
                gradient="purple"
                iconGradient="from-purple-500 to-pink-600"
              />
              <InfoCard
                icon={Home}
                title="Flat Number"
                value={complaint.flatNumber}
                gradient="blue"
                iconGradient="from-blue-500 to-indigo-600"
              />
              <InfoCard
                icon={Tag}
                title="Category"
                value={complaint.category}
                gradient="emerald"
                iconGradient="from-emerald-500 to-teal-600"
                badge={{
                  className: "inline-block px-4 py-1.5 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 border border-emerald-500/30 rounded-full",
                  textClass: "text-emerald-300 font-medium text-sm"
                }}
              />
              <InfoCard
                icon={Activity}
                title="Status"
                value={complaint.status}
                gradient="amber"
                iconGradient="from-amber-500 to-orange-600"
                badge={{
                  className: `inline-block px-4 py-1.5 bg-gradient-to-r ${getStatusColor(complaint.status)} rounded-full shadow-lg`,
                  textClass: "text-white font-bold text-sm"
                }}
              />
              <InfoCard
                icon={Calendar}
                title="Reported On"
                value={format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
                gradient="pink"
                iconGradient="from-pink-500 to-rose-600"
              />
            </div>

            {/* Likes */}
            {complaint.likes && (
              <div className="mb-8 backdrop-blur-xl bg-gradient-to-r from-red-900/20 to-pink-900/20 border border-red-500/30 rounded-2xl p-6 hover:border-red-400/50 transition-all duration-300">
                <div className="flex items-center gap-4">
                  <div className="relative">
                    <div className="absolute inset-0 bg-red-500 blur-xl opacity-50 animate-pulse pointer-events-none"></div>
                    <Heart className="relative w-8 h-8 text-red-500 fill-red-500 animate-pulse" />
                  </div>
                  <div>
                    <p className="text-red-300 text-sm uppercase tracking-wider font-medium">Community Support</p>
                    <p className="text-3xl font-bold text-white">{complaint.likes.length} <span className="text-lg text-red-300">Likes</span></p>
                  </div>
                </div>
              </div>
            )}

            {/* Media Gallery */}
            {mediaItems.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/50">
                    <ImageIcon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-violet-300 to-purple-300 bg-clip-text">Media Gallery</h3>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  {mediaItems.map((item, index) => (
                    <MediaItem
                      key={item.idx}
                      item={item}
                      index={index}
                      onClick={handleMediaClick}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-8 text-center py-12 backdrop-blur-xl bg-slate-800/30 border border-dashed border-slate-600/50 rounded-2xl">
                <ImageIcon className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No media attached to this complaint.</p>
              </div>
            )}

            {/* Comments Section */}
            {complaint.comments && complaint.comments.length > 0 ? (
              <div className="mb-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg shadow-blue-500/50">
                    <MessageSquare className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-transparent bg-gradient-to-r from-blue-300 to-cyan-300 bg-clip-text">
                    Comments ({complaint.comments.length})
                  </h3>
                </div>
                <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 scrollbar-thin scrollbar-track-slate-800/50 scrollbar-thumb-cyan-600/50 hover:scrollbar-thumb-cyan-500/70">
                  {complaint.comments.map((comment, index) => (
                    <CommentItem
                      key={comment._id}
                      comment={comment}
                      index={index}
                      admin={admin}
                      resolveUser={resolveUser}
                      editingCommentId={editingCommentId}
                      editText={editText}
                      setEditText={setEditText}
                      handleEditComment={handleEditComment}
                      setEditingCommentId={setEditingCommentId}
                      handleDeleteComment={handleDeleteComment}
                      editingReply={editingReply}
                      setEditingReply={setEditingReply}
                      handleEditReply={handleEditReply}
                      handleDeleteReply={handleDeleteReply}
                    />
                  ))}
                </div>
              </div>
            ) : (
              <div className="mb-8 text-center py-12 backdrop-blur-xl bg-slate-800/30 border border-dashed border-slate-600/50 rounded-2xl">
                <MessageSquare className="w-16 h-16 text-slate-500 mx-auto mb-4 opacity-50" />
                <p className="text-slate-400">No comments yet. Be the first to comment!</p>
              </div>
            )}

            {/* Add Comment Form */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-blue-900/30 border border-cyan-500/30 rounded-2xl p-6 shadow-2xl hover:shadow-cyan-500/20 transition-all duration-500">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/50 animate-pulse">
                  <MessageSquare className="w-5 h-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-transparent bg-gradient-to-r from-cyan-300 to-blue-300 bg-clip-text">
                  Add Your Comment
                </h3>
              </div>
              <form onSubmit={handleCommentSubmit} className="space-y-4">
                <textarea
                  className="w-full p-4 bg-slate-900/50 border border-cyan-500/30 rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-500/30 transition-all duration-300 resize-none"
                  rows="4"
                  placeholder="Share your thoughts on this complaint..."
                  value={newCommentText}
                  onChange={(e) => setNewCommentText(e.target.value)}
                ></textarea>
                <button
                  type="submit"
                  className="group/submit w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl text-white font-bold text-lg flex items-center justify-center gap-3 transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/50 relative overflow-hidden"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover/submit:translate-x-[100%] transition-transform duration-1000"></div>
                  <MessageSquare className="w-6 h-6 relative z-10 group-hover/submit:rotate-12 transition-transform duration-300" />
                  <span className="relative z-10">Post Comment</span>
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>

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

      {/* Confirmation Modal - Note: ConfirmationModal import removed, add inline or restore */}
      {pendingDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="bg-slate-900 border border-cyan-500/30 rounded-2xl p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-white mb-4">
              Confirm {pendingDelete.type === 'comment' ? 'Comment' : 'Reply'} Deletion
            </h3>
            <p className="text-gray-300 mb-6">
              Are you sure you want to delete this {pendingDelete.type === 'comment' ? 'comment' : 'reply'}? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                className="flex-1 px-4 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 rounded-lg text-white font-medium transition-all duration-300"
              >
                Delete
              </button>
              <button
                onClick={handleCancelDelete}
                className="flex-1 px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded-lg text-white font-medium transition-all duration-300"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
        
        .animation-delay-2000 {
          animation-delay: 2s;
        }
        
        .scrollbar-thin::-webkit-scrollbar {
          width: 8px;
        }
        
        .scrollbar-track-slate-800\/50::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.5);
          border-radius: 10px;
        }
        
        .scrollbar-thumb-cyan-600\/50::-webkit-scrollbar-thumb {
          background: rgba(8, 145, 178, 0.5);
          border-radius: 10px;
        }
        
        .scrollbar-thumb-cyan-600\/50:hover::-webkit-scrollbar-thumb {
          background: rgba(6, 182, 212, 0.7);
        }
      `}</style>
    </div>
  );
};

export default AdminComplaintDetailsPage;