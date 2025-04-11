import React, { useState, useEffect } from 'react';
import { Heart, MessageSquare, Send } from 'lucide-react';
import CommentSection from './CommentSection';
import { statusConfig } from "../constants/complaints";

const ComplaintModal = ({ complaint: propComplaint, onClose, onLike, onAddComment }) => {
  const [newComment, setNewComment] = useState('');
  const [complaint, setComplaint] = useState(propComplaint);

  // Update local state when prop changes
  useEffect(() => {
    setComplaint(propComplaint);
  }, [propComplaint]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    onAddComment(complaint.id, newComment);
    setNewComment('');
  };

  const handleLike = () => {
    const updatedComplaint = {
      ...complaint,
      isLiked: !complaint.isLiked,
      likes: complaint.isLiked ? complaint.likes - 1 : complaint.likes + 1
    };
    setComplaint(updatedComplaint);
    onLike(complaint.id);
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-base-100 rounded-box p-6 max-w-2xl w-full max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold">{complaint.title}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>✕</button>
        </div>
        <div className="text-sm text-base-content/70 mb-4 flex-wrap flex gap-1">
          <span className="font-medium">Posted by: {complaint.author}</span>
          <span>•</span>
          <span>{new Date(complaint.date).toLocaleDateString()}</span>
          <span>•</span>
          <span className={`badge ${statusConfig[complaint.status]?.color || 'badge-neutral'}`}>
            {statusConfig[complaint.status]?.label || complaint.status}
          </span>
        </div>

        <div className="prose max-w-none mb-6">
          <h3 className="text-lg font-semibold mb-2">Description</h3>
          <p>{complaint.description}</p>
        </div>

        <div className="flex items-center gap-4 border-t pt-4">
          <button
            className={`btn btn-ghost gap-2 ${complaint.isLiked ? 'text-red-500' : 'hover:text-red-500'}`}
            onClick={handleLike}
          >
            <Heart className="w-5 h-5 sm:w-5 sm:h-5" fill={complaint.isLiked ? "#ef4444" : "none"} />
            <span className="text-xs sm:text-sm">{complaint.likes} Likes</span>
          </button>
          <div className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            <span>{complaint.comments.length} Comments</span>
          </div>
        </div>

        <div className="mt-6 border-t pt-4">
          <h3 className="text-lg font-semibold mb-4">Comments</h3>
          <CommentSection comments={complaint.comments} />
          <div className="flex gap-2">
            <input
              type="text"
              placeholder="Add a comment..."
              className="input input-bordered flex-1"
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleAddComment()}
            />
            <button className="btn btn-primary" onClick={handleAddComment} disabled={!newComment.trim()}>
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ComplaintModal;