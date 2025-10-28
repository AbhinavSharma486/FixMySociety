import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { LoaderCircle, X, Image as ImageIcon, Video as VideoIcon, Heart, MessageSquare, Edit2, Trash2, Check, XCircle, Building, Home, Calendar, Tag, Activity, ArrowLeft, Send, Sparkles, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import "yet-another-react-lightbox/styles.css";
import Video from "yet-another-react-lightbox/plugins/video";
import { useSelector } from 'react-redux';
import Lightbox from "yet-another-react-lightbox";

import socket from '../../lib/socket';
import { axiosInstance as axios } from '../../lib/axios';
import { addComment } from '../../lib/complaintService';
import { getComplaintByIdAdmin } from '../../lib/adminService';
import ConfirmationModal from '../../Admin/components/ConfirmationModal';

// Memoized LoadingScreen component
const LoadingScreen = memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex justify-center items-center relative overflow-hidden px-4">
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-cyan-500/20 rounded-full blur-[120px] animate-pulse top-[-50px] sm:top-[-100px] left-[-50px] sm:left-[-100px]" style={{ willChange: 'opacity' }}></div>
      <div className="absolute w-[300px] sm:w-[600px] h-[300px] sm:h-[600px] bg-blue-500/20 rounded-full blur-[120px] animate-pulse bottom-[-50px] sm:bottom-[-100px] right-[-50px] sm:right-[-100px] animation-delay-2000" style={{ willChange: 'opacity' }}></div>
      <div className="absolute w-[200px] sm:w-[400px] h-[200px] sm:h-[400px] bg-purple-500/15 rounded-full blur-[100px] animate-pulse top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animation-delay-1000" style={{ willChange: 'opacity' }}></div>
    </div>

    <div className="text-center z-10 space-y-4 sm:space-y-6 max-w-sm">
      <div className="relative inline-block">
        <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 blur-2xl opacity-60 animate-pulse" style={{ willChange: 'opacity' }}></div>
        <LoaderCircle className="relative animate-spin-slow w-16 h-16 sm:w-20 sm:h-20 text-cyan-400" strokeWidth={2.5} style={{ willChange: 'transform' }} />
      </div>
      <div className="space-y-2 sm:space-y-3">
        <p className="text-xl sm:text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 tracking-wide animate-pulse px-4">
          Loading Complaint Details
        </p>
        <div className="flex justify-center gap-2">
          <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ willChange: 'transform' }}></div>
          <div className="w-2 h-2 bg-blue-400 rounded-full animate-bounce animation-delay-200" style={{ willChange: 'transform' }}></div>
          <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce animation-delay-400" style={{ willChange: 'transform' }}></div>
        </div>
      </div>
    </div>
  </div>
));

// Memoized ErrorScreen component
const ErrorScreen = memo(({ error, onGoBack }) => (
  <div className="min-h-screen bg-gradient-to-br from-slate-950 via-red-950 to-slate-900 flex justify-center items-center relative overflow-hidden px-4">
    <div className="absolute inset-0 pointer-events-none">
      <div className="absolute w-64 sm:w-96 h-64 sm:h-96 bg-red-500/20 rounded-full blur-3xl animate-pulse top-0 right-0" style={{ willChange: 'opacity' }}></div>
    </div>
    <div className="relative z-10 text-center p-6 sm:p-10 w-full max-w-md backdrop-blur-2xl bg-gradient-to-br from-red-900/40 to-slate-900/40 border border-red-500/40 rounded-2xl sm:rounded-3xl shadow-2xl shadow-red-500/20 transform hover:scale-105 transition-transform duration-500" style={{ willChange: 'transform' }}>
      <div className="relative inline-block mb-4 sm:mb-6">
        <div className="absolute inset-0 bg-red-500 blur-2xl opacity-40 animate-pulse" style={{ willChange: 'opacity' }}></div>
        <XCircle className="relative w-16 h-16 sm:w-20 sm:h-20 text-red-400" strokeWidth={1.5} />
      </div>
      <h2 className="text-xl sm:text-2xl font-bold text-red-300 mb-2 sm:mb-3">Something Went Wrong</h2>
      <p className="text-red-200/80 text-base sm:text-lg break-words">{error}</p>
      <button
        onClick={onGoBack}
        className="mt-4 sm:mt-6 px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg hover:shadow-red-500/50 text-sm sm:text-base"
        style={{ willChange: 'transform' }}
      >
        Go Back
      </button>
    </div>
  </div>
));

// Memoized InfoCard component
const InfoCard = memo(({ icon: Icon, iconColor, borderColor, hoverBorderColor, hoverShadowColor, bgGradient, iconBgGradient, blurGradient, label, value, children }) => (
  <div className={`group relative backdrop-blur-2xl bg-gradient-to-br from-slate-800/60 to-slate-900/60 border ${borderColor} rounded-xl sm:rounded-2xl p-4 sm:p-6 ${hoverBorderColor} transition-all duration-500 hover:scale-105 ${hoverShadowColor} overflow-hidden`} style={{ willChange: 'transform' }}>
    <div className={`absolute inset-0 ${bgGradient} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ willChange: 'opacity' }}></div>
    <div className="relative">
      <div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
        <div className="relative flex-shrink-0">
          <div className={`absolute inset-0 ${blurGradient} rounded-lg sm:rounded-xl blur-lg opacity-60 group-hover:opacity-100 transition-opacity duration-500`} style={{ willChange: 'opacity' }}></div>
          <div className={`relative w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl ${iconBgGradient} flex items-center justify-center shadow-lg transform group-hover:rotate-6 transition-transform duration-500`} style={{ willChange: 'transform' }}>
            <Icon className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
          </div>
        </div>
        <div className="min-w-0 flex-1">
          <p className={`text-xs font-bold ${iconColor} uppercase tracking-wider truncate`}>{label}</p>
          {children || <p className="text-white font-bold text-base sm:text-lg mt-1 truncate">{value}</p>}
        </div>
      </div>
    </div>
  </div>
));

// Memoized MediaItem component
const MediaItem = memo(({ item, onClick }) => {
  const isVideo = item.type === 'video';
  const Icon = isVideo ? VideoIcon : ImageIcon;
  const colorClass = isVideo ? 'cyan' : 'violet';

  return (
    <div
      className={`group relative cursor-pointer overflow-hidden rounded-xl sm:rounded-2xl border border-${colorClass}-400/30 hover:border-${colorClass}-400/60 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-${colorClass}-500/40 aspect-square`}
      onClick={onClick}
      style={{ willChange: 'transform' }}
    >
      {isVideo ? (
        <video
          src={item.src}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
          style={{ willChange: 'transform' }}
          preload="metadata"
        />
      ) : (
        <img
          src={item.src}
          alt={`Complaint media`}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-125"
          style={{ willChange: 'transform' }}
          loading="lazy"
        />
      )}
      <div className={`absolute inset-0 bg-gradient-to-t from-${colorClass}-900/90 via-${colorClass}-900/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500 flex items-center justify-center`} style={{ willChange: 'opacity' }}>
        <div className="transform translate-y-6 group-hover:translate-y-0 transition-transform duration-500" style={{ willChange: 'transform' }}>
          <div className="relative">
            <div className={`absolute inset-0 bg-${colorClass}-400 blur-xl opacity-60`}></div>
            <Icon className="relative w-8 h-8 sm:w-12 sm:h-12 text-white drop-shadow-2xl" strokeWidth={2} />
          </div>
        </div>
      </div>
      <div className={`absolute top-2 sm:top-3 right-2 sm:right-3 px-2 sm:px-3 py-0.5 sm:py-1 bg-${colorClass}-600/80 backdrop-blur-xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-500`} style={{ willChange: 'opacity' }}>
        <span className="text-xs font-bold text-white">{isVideo ? 'Play' : 'View'}</span>
      </div>
    </div>
  );
});

// Memoized Comment component
const Comment = memo(({ comment, admin, onEdit, onDelete, onEditReply, onDeleteReply, editingCommentId, editingReply, editText, setEditText, opLoadingId, resolveUser }) => {
  const u = useMemo(() => resolveUser(comment.user), [comment.user, resolveUser]);
  const isAdminAuthor = useMemo(() =>
    admin && comment.user && String(comment.user._id) === String(admin._id) && comment.authorRole === 'admin',
    [admin, comment.user, comment.authorRole]
  );

  const handleEditSave = useCallback(async () => {
    if (!editText.trim()) {
      toast.error('Comment text cannot be empty.');
      return;
    }
    await onEdit(comment._id);
  }, [editText, comment._id, onEdit]);

  return (
    <div className="group relative backdrop-blur-2xl bg-gradient-to-br from-slate-800/70 to-slate-900/70 border border-cyan-400/30 rounded-2xl sm:rounded-3xl p-4 sm:p-7 hover:border-cyan-400/50 transition-all duration-500 hover:shadow-2xl hover:shadow-cyan-500/20 animate-fadeIn">
      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl sm:rounded-3xl" style={{ willChange: 'opacity' }}></div>

      <div className="relative flex flex-col sm:flex-row justify-between items-start gap-3 sm:gap-0 mb-4 sm:mb-5">
        <div className="flex items-center gap-3 sm:gap-4 w-full sm:w-auto">
          <div className="relative group/avatar flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl sm:rounded-2xl blur-lg opacity-0 group-hover/avatar:opacity-80 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>
            <img
              src={u.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
              alt={u.fullName || 'Anonymous'}
              className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl object-cover border-2 border-cyan-400/40 group-hover/avatar:border-cyan-400/80 group-hover/avatar:scale-110 transition-all duration-500 shadow-lg"
              style={{ willChange: 'transform' }}
              loading="lazy"
            />
            {u.authorRole === 'admin' && (
              <div className="absolute -top-1 -right-1 w-5 h-5 sm:w-6 sm:h-6 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="font-black text-white text-base sm:text-lg truncate">{u.fullName || 'Unknown'}</p>
              {u.authorRole === 'admin' && (
                <span className="inline-flex items-center gap-1 px-2 sm:px-3 py-0.5 sm:py-1 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 rounded-full backdrop-blur-xl flex-shrink-0">
                  <Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-purple-300" />
                  <span className="text-xs text-purple-300 font-bold">Admin</span>
                </span>
              )}
            </div>
            {u.authorRole !== 'admin' && (
              <p className="text-xs text-cyan-400/80 flex items-center gap-1.5 mt-1 font-medium">
                <Home className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
                <span className="truncate">Flat {u.flatNumber || 'N/A'}</span>
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto justify-between sm:justify-end">
          <span className="text-xs text-slate-400 flex items-center gap-1.5 px-2 sm:px-3 py-1 sm:py-1.5 bg-slate-800/50 rounded-full backdrop-blur-xl flex-shrink-0">
            <Clock className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
            <span className="whitespace-nowrap">{format(new Date(comment.createdAt), 'dd/MM/yyyy')}</span>
          </span>
        </div>
      </div>

      <div className="relative">
        {editingCommentId === comment._id ? (
          <div className="space-y-3 sm:space-y-4">
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              className="w-full p-4 sm:p-5 bg-slate-900/60 border border-cyan-400/40 rounded-xl sm:rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/20 transition-all duration-500 resize-none backdrop-blur-xl font-medium text-sm sm:text-base"
              rows={3}
              placeholder="Edit your comment..."
            />
            <div className="flex gap-2 sm:gap-3 flex-wrap">
              <button
                className="group/btn px-4 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg sm:rounded-xl text-white font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 hover:shadow-xl hover:shadow-emerald-500/50 text-sm sm:text-base flex-shrink-0"
                onClick={handleEditSave}
                style={{ willChange: 'transform' }}
              >
                <Check className="w-4 h-4 sm:w-5 sm:h-5" strokeWidth={2.5} />
                Save
              </button>
              <button
                className="px-4 sm:px-6 py-2.5 sm:py-3 bg-slate-700/60 hover:bg-slate-600/60 rounded-lg sm:rounded-xl text-slate-300 font-bold flex items-center gap-2 transition-all duration-300 hover:scale-105 backdrop-blur-xl text-sm sm:text-base flex-shrink-0"
                onClick={() => { onEdit(null); setEditText(''); }}
                style={{ willChange: 'transform' }}
              >
                <XCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-gray-200 leading-relaxed text-sm sm:text-base font-medium break-words pr-0 sm:pr-20">{comment.text}</p>
            {comment.editedAt && (
              <span className="text-xs text-slate-500 italic flex items-center gap-1 mt-2">
                <Edit2 className="w-2.5 h-2.5 sm:w-3 sm:h-3 flex-shrink-0" />
                <span className="truncate">edited {format(new Date(comment.editedAt), 'dd/MM/yyyy')}</span>
              </span>
            )}
          </>
        )}

        {isAdminAuthor && editingCommentId !== comment._id && (
          <div className="absolute top-0 right-0 flex gap-1.5 sm:gap-2">
            <button
              onClick={() => { onEdit(comment._id); setEditText(comment.text); }}
              className="group/btn p-2 sm:p-2.5 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 hover:border-blue-400/70 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-blue-500/50 backdrop-blur-xl"
              style={{ willChange: 'transform' }}
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-blue-400 group-hover/btn:text-blue-300" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onDelete(comment._id)}
              className="group/btn p-2 sm:p-2.5 bg-red-600/30 hover:bg-red-600/50 border border-red-400/40 hover:border-red-400/70 rounded-lg sm:rounded-xl transition-all duration-300 hover:scale-110 hover:shadow-lg hover:shadow-red-500/50 backdrop-blur-xl"
              style={{ willChange: 'transform' }}
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-red-400 group-hover/btn:text-red-300" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>

      {comment.replies && comment.replies.length > 0 && (
        <div className="mt-4 sm:mt-7 pl-4 sm:pl-8 md:pl-16 space-y-3 sm:space-y-4 border-l-2 border-cyan-400/30 relative">
          <div className="absolute left-0 top-0 w-0.5 h-full bg-gradient-to-b from-cyan-400/50 to-transparent"></div>
          {comment.replies.map((reply) => (
            <Reply
              key={reply._id}
              reply={reply}
              commentId={comment._id}
              admin={admin}
              onEdit={onEditReply}
              onDelete={onDeleteReply}
              editingReply={editingReply}
              editText={editText}
              setEditText={setEditText}
              resolveUser={resolveUser}
            />
          ))}
        </div>
      )}
    </div>
  );
});

// Memoized Reply component
const Reply = memo(({ reply, commentId, admin, onEdit, onDelete, editingReply, editText, setEditText, resolveUser }) => {
  const ru = useMemo(() => resolveUser(reply.user), [reply.user, resolveUser]);
  const isAdminReplyAuthor = useMemo(() =>
    admin && reply.user && String(reply.user._id) === String(admin._id) && reply.authorRole === 'admin',
    [admin, reply.user, reply.authorRole]
  );

  const isEditing = editingReply.commentId === commentId && editingReply.replyId === reply._id;

  const handleEditSave = useCallback(async () => {
    if (!editText.trim()) {
      toast.error('Reply text cannot be empty.');
      return;
    }
    await onEdit(commentId, reply._id);
  }, [editText, commentId, reply._id, onEdit]);

  return (
    <div className="group/reply relative backdrop-blur-2xl bg-gradient-to-br from-slate-700/50 to-slate-800/50 border border-blue-400/30 rounded-xl sm:rounded-2xl p-4 sm:p-5 hover:border-blue-400/50 transition-all duration-500 hover:shadow-xl hover:shadow-blue-500/20">
      <div className="absolute inset-0 bg-gradient-to-br from-blue-500/0 to-blue-500/5 opacity-0 group-hover/reply:opacity-100 transition-opacity duration-500 rounded-xl sm:rounded-2xl" style={{ willChange: 'opacity' }}></div>

      <div className="relative flex flex-col sm:flex-row justify-between items-start gap-2 sm:gap-0 mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
          <div className="relative group/avatar flex-shrink-0">
            <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-600 rounded-lg sm:rounded-xl blur-md opacity-0 group-hover/avatar:opacity-80 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>
            <img
              src={ru.profilePic || "https://cdn.pixabay.com/photo/2018/11/13/21/43/avatar-3814049_1280.png"}
              alt={ru.fullName || 'Anonymous'}
              className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg sm:rounded-xl object-cover border-2 border-blue-400/40 group-hover/avatar:border-blue-400/80 group-hover/avatar:scale-110 transition-all duration-500 shadow-lg"
              style={{ willChange: 'transform' }}
              loading="lazy"
            />
            {ru.authorRole === 'admin' && (
              <div className="absolute -top-1 -right-1 w-4 h-4 sm:w-5 sm:h-5 bg-gradient-to-br from-purple-500 to-pink-600 rounded-full flex items-center justify-center shadow-lg">
                <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-white" strokeWidth={3} />
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 flex-wrap">
              <p className="text-sm font-black text-white truncate">{ru.fullName || 'Unknown'}</p>
              {ru.authorRole === 'admin' && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-purple-500/30 to-pink-500/30 border border-purple-400/50 rounded-full backdrop-blur-xl flex-shrink-0">
                  <Sparkles className="w-2 h-2 sm:w-2.5 sm:h-2.5 text-purple-300" />
                  <span className="text-xs text-purple-300 font-bold">Admin</span>
                </span>
              )}
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-400 flex items-center gap-1 px-2 py-1 bg-slate-800/50 rounded-lg backdrop-blur-xl flex-shrink-0 self-end sm:self-auto">
          <Clock className="w-3 h-3" />
          <span className="whitespace-nowrap">{format(new Date(reply.createdAt), 'dd/MM/yyyy')}</span>
        </p>
      </div>

      <div className="relative">
        {isEditing ? (
          <div className="space-y-2 sm:space-y-3">
            <textarea
              className="w-full p-3 sm:p-4 bg-slate-900/60 border border-blue-400/40 rounded-lg sm:rounded-xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-400 focus:ring-4 focus:ring-blue-500/20 transition-all duration-500 resize-none text-sm backdrop-blur-xl font-medium"
              rows={2}
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              placeholder="Edit your reply..."
            />
            <div className="flex gap-2 flex-wrap">
              <button
                className="px-3 sm:px-4 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 rounded-lg text-white text-sm font-bold flex items-center gap-1.5 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-emerald-500/50 flex-shrink-0"
                onClick={handleEditSave}
                style={{ willChange: 'transform' }}
              >
                <Check className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Save
              </button>
              <button
                className="px-3 sm:px-4 py-2 bg-slate-700/60 hover:bg-slate-600/60 rounded-lg text-slate-300 text-sm font-bold flex items-center gap-1.5 transition-all duration-300 hover:scale-105 backdrop-blur-xl flex-shrink-0"
                onClick={() => onEdit(null, null)}
                style={{ willChange: 'transform' }}
              >
                <XCircle className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <>
            <p className="text-sm text-gray-200 leading-relaxed font-medium break-words pr-0 sm:pr-16">{reply.text}</p>
            {reply.editedAt && (
              <span className="text-xs text-slate-500 italic flex items-center gap-1 mt-2">
                <Edit2 className="w-2 h-2 sm:w-2.5 sm:h-2.5 flex-shrink-0" />
                <span className="truncate">edited {format(new Date(reply.editedAt), 'dd/MM/yyyy')}</span>
              </span>
            )}
          </>
        )}

        {isAdminReplyAuthor && !isEditing && (
          <div className="absolute top-0 right-0 flex gap-1 sm:gap-1.5">
            <button
              onClick={() => { onEdit(commentId, reply._id); setEditText(reply.text); }}
              className="group/btn p-1.5 sm:p-2 bg-blue-600/30 hover:bg-blue-600/50 border border-blue-400/40 hover:border-blue-400/70 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-blue-500/50 backdrop-blur-xl"
              style={{ willChange: 'transform' }}
            >
              <Edit2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-blue-400 group-hover/btn:text-blue-300" strokeWidth={2.5} />
            </button>
            <button
              onClick={() => onDelete(commentId, reply._id)}
              className="group/btn p-1.5 sm:p-2 bg-red-600/30 hover:bg-red-600/50 border border-red-400/40 hover:border-red-400/70 rounded-lg transition-all duration-300 hover:scale-110 hover:shadow-md hover:shadow-red-500/50 backdrop-blur-xl"
              style={{ willChange: 'transform' }}
            >
              <Trash2 className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-red-400 group-hover/btn:text-red-300" strokeWidth={2.5} />
            </button>
          </div>
        )}
      </div>
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

  // Memoized resolveUser function
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

  const fetchComplaintDetails = useCallback(async () => {
    try {
      setLoading(true);
      const response = await getComplaintByIdAdmin(id);
      setComplaint(response.complaint);
    } catch (err) {
      setError(err.message || 'Failed to fetch complaint details.');
      toast.error(err.message || 'Failed to fetch complaint details.');
    } finally {
      setLoading(false);
    }
  }, [id]);

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
        console.log(`[AdminComplaintDetailsPage] Leaving complaint room: ${id}`);
        socket.emit("leaveComplaintRoom", id);
        socket.off("comment:added", handleNewComment);
        socket.off("reply:added", handleNewReply);
      };
    }
  }, [id, fetchComplaintDetails]);

  // Memoized slides for lightbox
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
      const response = await addComment(id, newCommentText);
      setNewCommentText('');
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
  }, [newCommentText, id]);

  const handleEditComment = useCallback(async (commentId) => {
    if (commentId === null) {
      setEditingCommentId(null);
      setEditText('');
      return;
    }

    if (!editText.trim()) return toast.error('Comment text cannot be empty.');

    try {
      setOpLoadingId(commentId + ':edit');
      await axios.put(`/api/complaints/${id}/comment`, { commentId, text: editText });
      toast.success('Comment edited');
      fetchComplaintDetails();
      setEditingCommentId(null);
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit comment');
    } finally { setOpLoadingId(null); }
  }, [editText, id, fetchComplaintDetails]);

  const handleDeleteComment = useCallback(async (commentId) => {
    setPendingDelete({ type: 'comment', commentId });
  }, []);

  const handleEditReply = useCallback(async (commentId, replyId) => {
    if (commentId === null || replyId === null) {
      setEditingReply({ commentId: null, replyId: null });
      setEditText('');
      return;
    }

    if (!editText.trim()) return toast.error('Reply text cannot be empty.');

    try {
      setOpLoadingId(replyId + ':edit');
      await axios.put(`/api/complaints/${id}/comment`, { commentId, replyId, text: editText });
      toast.success('Reply edited');
      fetchComplaintDetails();
      setEditingReply({ commentId: null, replyId: null });
      setEditText('');
    } catch (err) {
      toast.error(err?.message || 'Failed to edit reply');
    } finally { setOpLoadingId(null); }
  }, [editText, id, fetchComplaintDetails]);

  const handleDeleteReply = useCallback(async (commentId, replyId) => {
    setPendingDelete({ type: 'reply', commentId, replyId });
  }, []);

  const handleConfirmDelete = useCallback(async () => {
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
      fetchComplaintDetails();
    } catch (err) {
      toast.error(err?.message || 'Failed to delete item');
    } finally {
      setOpLoadingId(null);
      setPendingDelete(null);
    }
  }, [pendingDelete, id, fetchComplaintDetails]);

  const handleCancelDelete = useCallback(() => {
    setPendingDelete(null);
  }, []);

  const handleGoBack = useCallback(() => {
    navigate(-1);
  }, [navigate]);

  // Memoized status colors
  const statusColors = useMemo(() => {
    if (!complaint) return { color: 'from-gray-500 to-slate-600', glow: 'shadow-gray-500/50' };

    switch (complaint.status) {
      case 'Pending': return { color: 'from-amber-500 to-orange-600', glow: 'shadow-amber-500/50' };
      case 'In Progress': return { color: 'from-blue-500 to-cyan-600', glow: 'shadow-blue-500/50' };
      case 'Resolved': return { color: 'from-emerald-500 to-teal-600', glow: 'shadow-emerald-500/50' };
      default: return { color: 'from-gray-500 to-slate-600', glow: 'shadow-gray-500/50' };
    }
  }, [complaint?.status]);

  if (loading) {
    return <LoadingScreen />;
  }

  if (error) {
    return <ErrorScreen error={error} onGoBack={handleGoBack} />;
  }

  if (!complaint) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex justify-center items-center px-4">
        <div className="text-center p-6 sm:p-10 backdrop-blur-2xl bg-slate-800/40 border border-slate-600/40 rounded-2xl sm:rounded-3xl shadow-2xl max-w-md w-full">
          <p className="text-slate-300 text-lg sm:text-xl">Complaint not found.</p>
        </div>
      </div>
    );
  }

  const images = complaint?.images || [];
  const videoUrl = complaint?.video;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-3 sm:p-4 md:p-8 pt-20 sm:pt-24 md:pt-32">
      {/* Advanced Animated Background */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(6,182,212,0.08),transparent_50%)]"></div>
        <div className="absolute inset-0 bg-[linear-gradient(rgba(6,182,212,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(6,182,212,0.03)_1px,transparent_1px)] bg-[size:60px_60px] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_50%,black,transparent)]"></div>

        {/* Floating Orbs with Enhanced Animation */}
        <div className="absolute top-[-10%] left-[-5%] w-[300px] sm:w-[500px] h-[300px] sm:h-[500px] bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full blur-[80px] sm:blur-[100px] animate-float" style={{ willChange: 'transform, opacity' }}></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[350px] sm:w-[600px] h-[350px] sm:h-[600px] bg-gradient-to-br from-blue-500/20 to-purple-500/20 rounded-full blur-[100px] sm:blur-[120px] animate-float-delayed" style={{ willChange: 'transform, opacity' }}></div>
        <div className="absolute top-1/2 left-1/2 w-[250px] sm:w-[400px] h-[250px] sm:h-[400px] bg-gradient-to-br from-purple-500/15 to-pink-500/15 rounded-full blur-[60px] sm:blur-[80px] animate-pulse-slow" style={{ willChange: 'transform, opacity' }}></div>
      </div>

      <div className="relative z-10 p-3 sm:p-4 md:p-6 lg:p-8 max-w-7xl mx-auto">
        {/* Futuristic Header */}
        <div className="mb-6 sm:mb-8 group perspective-1000">
          <div className="relative backdrop-blur-2xl bg-gradient-to-r from-slate-900/60 via-blue-900/30 to-slate-900/60 border border-cyan-400/30 rounded-2xl sm:rounded-3xl p-4 sm:p-6 md:p-8 shadow-2xl hover:shadow-cyan-500/30 transition-all duration-700 transform hover:scale-[1.02]" style={{ willChange: 'transform' }}>
            <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 rounded-2xl sm:rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ willChange: 'opacity' }}></div>

            <div className="relative flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-6">
              <div className="flex-1 w-full sm:w-auto">
                <div className="flex items-center gap-2 sm:gap-3 mb-2 sm:mb-3">
                  <div className="w-1 h-8 sm:h-12 bg-gradient-to-b from-cyan-400 to-blue-600 rounded-full animate-pulse flex-shrink-0" style={{ willChange: 'opacity' }}></div>
                  <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-purple-300 tracking-tight leading-tight">
                    Complaint Details
                  </h1>
                </div>
                <div className="flex items-center gap-2 ml-3 sm:ml-4">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-cyan-400 animate-pulse flex-shrink-0" style={{ willChange: 'opacity' }} />
                  <p className="text-xs sm:text-sm text-cyan-300/70 font-medium">Real-time tracking & management</p>
                </div>
              </div>

              <button
                onClick={handleGoBack}
                className="group/btn relative backdrop-blur-xl bg-gradient-to-r from-slate-800/80 to-slate-900/80 hover:from-cyan-600 hover:to-blue-600 border border-cyan-400/40 hover:border-cyan-300 rounded-xl sm:rounded-2xl px-4 sm:px-6 py-2.5 sm:py-3.5 transition-all duration-500 hover:scale-110 hover:shadow-2xl hover:shadow-cyan-500/50 overflow-hidden w-full sm:w-auto"
                style={{ willChange: 'transform' }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/0 via-cyan-400/20 to-cyan-400/0 translate-x-[-100%] group-hover/btn:translate-x-[100%] transition-transform duration-1000" style={{ willChange: 'transform' }}></div>
                <div className="relative flex items-center justify-center gap-2 sm:gap-3">
                  <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300 group-hover/btn:-translate-x-1 transition-transform duration-300" strokeWidth={2.5} style={{ willChange: 'transform' }} />
                  <span className="text-cyan-300 font-bold text-sm sm:text-base">Back</span>
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content - Hero Card */}
        <div className="backdrop-blur-2xl bg-gradient-to-br from-slate-900/70 via-blue-900/20 to-slate-900/70 border border-cyan-400/20 rounded-2xl sm:rounded-3xl shadow-2xl shadow-blue-500/10 overflow-hidden transform transition-all duration-700 hover:shadow-cyan-500/20">

          {/* Title Section with 3D Effect */}
          <div className="relative p-4 sm:p-6 md:p-10 border-b border-cyan-400/20 bg-gradient-to-r from-blue-600/10 via-cyan-600/5 to-blue-600/10 overflow-hidden group">
            <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ willChange: 'opacity' }}></div>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

            <div className="relative">
              <div className="flex items-start gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="flex-shrink-0 w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-lg shadow-cyan-500/50 transform hover:rotate-12 transition-transform duration-300" style={{ willChange: 'transform' }}>
                  <Tag className="w-5 h-5 sm:w-6 sm:h-6 text-white" strokeWidth={2.5} />
                </div>
                <h2 className="flex-1 text-xl sm:text-2xl md:text-3xl lg:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-200 to-white leading-tight break-words">
                  {complaint.title}
                </h2>
              </div>
              <p className="text-sm sm:text-base md:text-lg text-gray-200 leading-relaxed ml-0 sm:ml-16 break-words">{complaint.description}</p>
            </div>
          </div>

          {/* Info Grid - Advanced Glassmorphism */}
          <div className="p-4 sm:p-6 md:p-10">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 mb-6 sm:mb-8 md:mb-10">

              {/* Reported By Card */}
              <InfoCard
                icon={Home}
                iconColor="text-cyan-400"
                borderColor="border-cyan-400/30"
                hoverBorderColor="hover:border-cyan-400/60"
                hoverShadowColor="hover:shadow-2xl hover:shadow-cyan-500/30"
                bgGradient="bg-gradient-to-br from-cyan-500/0 to-cyan-500/10"
                iconBgGradient="bg-gradient-to-br from-cyan-500 to-blue-600"
                blurGradient="bg-gradient-to-br from-cyan-400 to-blue-600"
                label="Reported By"
                value={complaint.user?.fullName || 'Unknown'}
              />

              {/* Building Card */}
              <InfoCard
                icon={Building}
                iconColor="text-purple-400"
                borderColor="border-purple-400/30"
                hoverBorderColor="hover:border-purple-400/60"
                hoverShadowColor="hover:shadow-2xl hover:shadow-purple-500/30"
                bgGradient="bg-gradient-to-br from-purple-500/0 to-purple-500/10"
                iconBgGradient="bg-gradient-to-br from-purple-500 to-pink-600"
                blurGradient="bg-gradient-to-br from-purple-400 to-pink-600"
                label="Building"
                value={complaint.buildingName?.buildingName || 'N/A'}
              />

              {/* Flat Number Card */}
              <InfoCard
                icon={Home}
                iconColor="text-blue-400"
                borderColor="border-blue-400/30"
                hoverBorderColor="hover:border-blue-400/60"
                hoverShadowColor="hover:shadow-2xl hover:shadow-blue-500/30"
                bgGradient="bg-gradient-to-br from-blue-500/0 to-blue-500/10"
                iconBgGradient="bg-gradient-to-br from-blue-500 to-indigo-600"
                blurGradient="bg-gradient-to-br from-blue-400 to-indigo-600"
                label="Flat Number"
                value={complaint.flatNumber}
              />

              {/* Category Card */}
              <InfoCard
                icon={Tag}
                iconColor="text-emerald-400"
                borderColor="border-emerald-400/30"
                hoverBorderColor="hover:border-emerald-400/60"
                hoverShadowColor="hover:shadow-2xl hover:shadow-emerald-500/30"
                bgGradient="bg-gradient-to-br from-emerald-500/0 to-emerald-500/10"
                iconBgGradient="bg-gradient-to-br from-emerald-500 to-teal-600"
                blurGradient="bg-gradient-to-br from-emerald-400 to-teal-600"
                label="Category"
              >
                <div className="inline-block mt-2 px-3 sm:px-4 py-1 sm:py-1.5 bg-gradient-to-r from-emerald-500/30 to-teal-500/30 border border-emerald-400/40 rounded-full backdrop-blur-xl">
                  <span className="text-emerald-300 font-bold text-xs sm:text-sm truncate">{complaint.category}</span>
                </div>
              </InfoCard>

              {/* Status Card */}
              <InfoCard
                icon={Activity}
                iconColor="text-amber-400"
                borderColor="border-amber-400/30"
                hoverBorderColor="hover:border-amber-400/60"
                hoverShadowColor="hover:shadow-2xl hover:shadow-amber-500/30"
                bgGradient="bg-gradient-to-br from-amber-500/0 to-amber-500/10"
                iconBgGradient={`bg-gradient-to-br ${statusColors.color}`}
                blurGradient={`bg-gradient-to-br ${statusColors.color}`}
                label="Status"
              >
                <div className={`inline-block mt-2 px-3 sm:px-5 py-1.5 sm:py-2 bg-gradient-to-r ${statusColors.color} rounded-full shadow-xl ${statusColors.glow}`}>
                  <span className="text-white font-black text-xs sm:text-sm tracking-wide">{complaint.status}</span>
                </div>
              </InfoCard>

              {/* Date Card */}
              <InfoCard
                icon={Calendar}
                iconColor="text-pink-400"
                borderColor="border-pink-400/30"
                hoverBorderColor="hover:border-pink-400/60"
                hoverShadowColor="hover:shadow-2xl hover:shadow-pink-500/30"
                bgGradient="bg-gradient-to-br from-pink-500/0 to-pink-500/10"
                iconBgGradient="bg-gradient-to-br from-pink-500 to-rose-600"
                blurGradient="bg-gradient-to-br from-pink-400 to-rose-600"
                label="Reported On"
                value={format(new Date(complaint.createdAt), 'dd/MM/yyyy')}
              />
            </div>

            {/* Likes Section - Premium Design */}
            {complaint.likes && (
              <div className="mb-6 sm:mb-8 md:mb-10 group relative backdrop-blur-2xl bg-gradient-to-r from-red-900/30 via-pink-900/20 to-red-900/30 border border-red-400/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 hover:border-red-400/60 transition-all duration-700 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-500/30 overflow-hidden" style={{ willChange: 'transform' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-red-500/0 via-red-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-700" style={{ willChange: 'opacity' }}></div>
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-red-400 to-transparent"></div>

                <div className="relative flex items-center gap-4 sm:gap-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-red-500 blur-2xl opacity-60 animate-pulse" style={{ willChange: 'opacity' }}></div>
                    <div className="relative w-12 h-12 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-2xl shadow-red-500/50 transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-500" style={{ willChange: 'transform' }}>
                      <Heart className="w-6 h-6 sm:w-8 sm:h-8 text-white fill-white animate-pulse" strokeWidth={2} style={{ willChange: 'opacity' }} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-red-300 text-xs sm:text-sm uppercase tracking-widest font-bold mb-1 sm:mb-2 flex items-center gap-2">
                      <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 animate-pulse flex-shrink-0" style={{ willChange: 'opacity' }} />
                      <span className="truncate">Community Support</span>
                    </p>
                    <p className="text-2xl sm:text-3xl md:text-4xl font-black text-white">
                      {complaint.likes.length}
                      <span className="text-base sm:text-xl text-red-300 ml-2 font-bold">Likes</span>
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Media Gallery - Ultra Modern */}
            {(images.length > 0 || videoUrl) && (
              <div className="mb-6 sm:mb-8 md:mb-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-violet-400 to-purple-600 rounded-lg sm:rounded-xl blur-xl opacity-60 animate-pulse" style={{ willChange: 'opacity' }}></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-2xl shadow-violet-500/50">
                      <ImageIcon className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-violet-300 via-purple-300 to-pink-300 truncate">
                      Media Gallery
                    </h3>
                    <p className="text-xs sm:text-sm text-violet-300/70 font-medium">View all attached media</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                  {images.map((image, index) => (
                    <MediaItem
                      key={`image-${index}`}
                      item={{ src: image, type: "image", idx: `image-${index}` }}
                      onClick={() => handleMediaClick({ src: image, type: "image", idx: `image-${index}` })}
                    />
                  ))}
                  {videoUrl && (
                    <MediaItem
                      key="video-0"
                      item={{ src: videoUrl, type: "video", idx: `video-0` }}
                      onClick={() => handleMediaClick({ src: videoUrl, type: "video", idx: `video-0` })}
                    />
                  )}
                </div>
              </div>
            )}

            {(images.length === 0 && !videoUrl) && (
              <div className="mb-6 sm:mb-8 md:mb-10 text-center py-12 sm:py-16 backdrop-blur-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-dashed border-slate-600/40 rounded-2xl sm:rounded-3xl hover:border-slate-500/60 transition-all duration-500">
                <div className="relative inline-block mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-slate-500 blur-xl opacity-20"></div>
                  <ImageIcon className="relative w-16 h-16 sm:w-20 sm:h-20 text-slate-500 opacity-40" strokeWidth={1.5} />
                </div>
                <p className="text-slate-400 text-base sm:text-lg font-medium px-4">No media attached to this complaint</p>
              </div>
            )}

            {/* Comments Section - Advanced Design */}
            {complaint.comments && complaint.comments.length > 0 && (
              <div className="mb-6 sm:mb-8 md:mb-10">
                <div className="flex items-center gap-3 sm:gap-4 mb-5 sm:mb-6 md:mb-8">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-400 to-cyan-600 rounded-lg sm:rounded-xl blur-xl opacity-60 animate-pulse" style={{ willChange: 'opacity' }}></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-2xl shadow-blue-500/50">
                      <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-cyan-300 to-teal-300 truncate">
                      Comments ({complaint.comments.length})
                    </h3>
                    <p className="text-xs sm:text-sm text-blue-300/70 font-medium">Community discussion</p>
                  </div>
                </div>

                <div className="space-y-4 sm:space-y-5 max-h-[500px] sm:max-h-[700px] overflow-y-auto pr-1 sm:pr-2 custom-scrollbar">
                  {complaint.comments.map((comment) => (
                    <Comment
                      key={comment._id}
                      comment={comment}
                      admin={admin}
                      onEdit={handleEditComment}
                      onDelete={handleDeleteComment}
                      onEditReply={handleEditReply}
                      onDeleteReply={handleDeleteReply}
                      editingCommentId={editingCommentId}
                      editingReply={editingReply}
                      editText={editText}
                      setEditText={setEditText}
                      opLoadingId={opLoadingId}
                      resolveUser={resolveUser}
                    />
                  ))}
                </div>
              </div>
            )}

            {complaint.comments && complaint.comments.length === 0 && (
              <div className="mb-6 sm:mb-8 md:mb-10 text-center py-12 sm:py-16 backdrop-blur-2xl bg-gradient-to-br from-slate-800/40 to-slate-900/40 border-2 border-dashed border-slate-600/40 rounded-2xl sm:rounded-3xl hover:border-slate-500/60 transition-all duration-500">
                <div className="relative inline-block mb-3 sm:mb-4">
                  <div className="absolute inset-0 bg-blue-500 blur-xl opacity-20"></div>
                  <MessageSquare className="relative w-16 h-16 sm:w-20 sm:h-20 text-slate-500 opacity-40" strokeWidth={1.5} />
                </div>
                <p className="text-slate-400 text-base sm:text-lg font-medium px-4">No comments yet. Be the first to comment!</p>
              </div>
            )}

            {/* Add Comment Form - Premium Design */}
            <div className="group relative backdrop-blur-2xl bg-gradient-to-br from-blue-900/30 via-cyan-900/20 to-blue-900/30 border border-cyan-400/40 rounded-2xl sm:rounded-3xl p-5 sm:p-6 md:p-8 shadow-2xl hover:shadow-cyan-500/30 transition-all duration-700 hover:scale-[1.01] overflow-hidden" style={{ willChange: 'transform' }}>
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/0 via-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700 rounded-2xl sm:rounded-3xl" style={{ willChange: 'opacity' }}></div>
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent"></div>

              <div className="relative">
                <div className="flex items-center gap-3 sm:gap-4 mb-4 sm:mb-6">
                  <div className="relative flex-shrink-0">
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg sm:rounded-xl blur-xl opacity-70 animate-pulse" style={{ willChange: 'opacity' }}></div>
                    <div className="relative w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-cyan-500/50 transform group-hover:rotate-6 transition-transform duration-500" style={{ willChange: 'transform' }}>
                      <MessageSquare className="w-6 h-6 sm:w-7 sm:h-7 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="text-xl sm:text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-cyan-300 via-blue-300 to-teal-300 truncate">
                      Add Your Comment
                    </h3>
                    <p className="text-xs sm:text-sm text-cyan-300/70 font-medium flex items-center gap-1.5 mt-1">
                      <Sparkles className="w-3 h-3 sm:w-3.5 sm:h-3.5 animate-pulse flex-shrink-0" style={{ willChange: 'opacity' }} />
                      <span className="truncate">Share your thoughts</span>
                    </p>
                  </div>
                </div>

                <form onSubmit={handleCommentSubmit} className="space-y-4 sm:space-y-5">
                  <div className="relative">
                    <textarea
                      className="w-full p-4 sm:p-5 md:p-6 bg-slate-900/60 border border-cyan-400/40 rounded-xl sm:rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-4 focus:ring-cyan-500/30 transition-all duration-500 resize-none backdrop-blur-xl font-medium text-sm sm:text-base"
                      rows="4"
                      placeholder="Share your thoughts on this complaint..."
                      value={newCommentText}
                      onChange={(e) => setNewCommentText(e.target.value)}
                    ></textarea>
                    <div className="absolute bottom-3 sm:bottom-4 right-3 sm:right-4 text-xs text-slate-500 font-medium">
                      {newCommentText.length} characters
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group/submit relative w-full sm:w-auto px-8 sm:px-10 py-4 sm:py-5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 rounded-xl sm:rounded-2xl text-white font-black text-base sm:text-lg flex items-center justify-center gap-2 sm:gap-3 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-cyan-500/60 overflow-hidden"
                    style={{ willChange: 'transform' }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover/submit:translate-x-[200%] transition-transform duration-1000" style={{ willChange: 'transform' }}></div>
                    <Send className="relative z-10 w-5 h-5 sm:w-6 sm:h-6 group-hover/submit:translate-x-1 transition-transform duration-300" strokeWidth={2.5} style={{ willChange: 'transform' }} />
                    <span className="relative z-10">Post Comment</span>
                  </button>
                </form>
              </div>
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

      {/* Confirmation Modal */}
      {pendingDelete && (
        <ConfirmationModal
          isOpen={!!pendingDelete}
          onClose={handleCancelDelete}
          onConfirm={handleConfirmDelete}
          title={`Confirm ${pendingDelete.type === 'comment' ? 'Comment' : 'Reply'} Deletion`}
          message={`Are you sure you want to delete this ${pendingDelete.type === 'comment' ? 'comment' : 'reply'}? This action cannot be undone.`}
        />
      )}

      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes float {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(30px, -30px) scale(1.1);
          }
          66% {
            transform: translate(-20px, 20px) scale(0.9);
          }
        }

        @keyframes float-delayed {
          0%, 100% {
            transform: translate(0, 0) scale(1);
          }
          33% {
            transform: translate(-30px, 30px) scale(1.1);
          }
          66% {
            transform: translate(20px, -20px) scale(0.9);
          }
        }

        @keyframes pulse-slow {
          0%, 100% {
            opacity: 0.3;
            transform: scale(1);
          }
          50% {
            opacity: 0.6;
            transform: scale(1.05);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out;
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        .animate-float-delayed {
          animation: float-delayed 25s ease-in-out infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 4s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animation-delay-200 {
          animation-delay: 0.2s;
        }

        .animation-delay-400 {
          animation-delay: 0.4s;
        }

        .animation-delay-1000 {
          animation-delay: 1s;
        }

        .animation-delay-2000 {
          animation-delay: 2s;
        }

        .perspective-1000 {
          perspective: 1000px;
        }

        /* Custom Scrollbar */
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: rgba(6, 182, 212, 0.5) rgba(30, 41, 59, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }

        @media (min-width: 640px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 10px;
          }
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(30, 41, 59, 0.3);
          border-radius: 10px;
          margin: 4px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.6), rgba(59, 130, 246, 0.6));
          border-radius: 10px;
          border: 2px solid rgba(30, 41, 59, 0.3);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(6, 182, 212, 0.8), rgba(59, 130, 246, 0.8));
        }

        /* Smooth transitions for all interactive elements */
        * {
          transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
        }

        /* Enhanced focus states for accessibility */
        button:focus-visible,
        textarea:focus-visible,
        input:focus-visible {
          outline: 2px solid rgba(6, 182, 212, 0.5);
          outline-offset: 2px;
        }

        /* Responsive image loading effect */
        img {
          image-rendering: -webkit-optimize-contrast;
          image-rendering: crisp-edges;
        }

        /* Gradient text animation */
        @keyframes gradient-shift {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .bg-gradient-animated {
          background-size: 200% 200%;
          animation: gradient-shift 3s ease infinite;
        }

        /* Performance optimizations */
        .backdrop-blur-2xl,
        .backdrop-blur-xl {
          -webkit-backdrop-filter: blur(40px);
          backdrop-filter: blur(40px);
        }

        @media (max-width: 640px) {
          .backdrop-blur-2xl,
          .backdrop-blur-xl {
            -webkit-backdrop-filter: blur(20px);
            backdrop-filter: blur(20px);
          }
        }

        /* GPU acceleration hints */
        .transform,
        .transition-transform,
        .hover\:scale-105:hover,
        .hover\:scale-110:hover,
        .group-hover\:scale-110,
        .group-hover\:scale-125 {
          transform: translateZ(0);
          backface-visibility: hidden;
          perspective: 1000px;
        }

        /* Prevent horizontal scroll on small screens */
        body {
          overflow-x: hidden;
        }

        /* Better text rendering on small screens */
        @media (max-width: 640px) {
          * {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
          }
        }

        /* Ensure buttons don't break on small screens */
        button {
          white-space: nowrap;
        }

        /* Better spacing for mobile */
        @media (max-width: 375px) {
          .custom-scrollbar::-webkit-scrollbar {
            width: 6px;
          }
        }
      `}</style>
    </div>
  );
};

export default AdminComplaintDetailsPage;