import React, { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { addComment } from '../lib/complaintService';
import { axiosInstance as axios } from '../lib/axios';
import toast from 'react-hot-toast';

const ReplyButton = ({ commentId, complaintId, onReplyAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const submitReply = async () => {
    if (!replyText.trim()) return toast.error('Reply cannot be empty');
    setIsSubmitting(true);
    try {
      // Use addComment helper which supports parentCommentId
      await addComment(complaintId, replyText, commentId);
      setReplyText('');
      setIsOpen(false);
      toast.success('Reply added'); // RE-ENABLED: User who adds reply sees this.
      if (onReplyAdded) onReplyAdded();
    } catch (err) {
      toast.error(err?.message || 'Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <button onClick={() => setIsOpen(p => !p)} className="text-xs text-blue-600 hover:underline inline-flex items-center gap-1">
        <MessageSquare className="w-3 h-3" /> Reply
      </button>
      {isOpen && (
        <div className="mt-2">
          <textarea rows={2} value={replyText} onChange={e => setReplyText(e.target.value)} className="w-full textarea textarea-bordered" />
          <div className="flex justify-end gap-2 mt-2">
            <button className="btn btn-ghost" onClick={() => setIsOpen(false)}>Cancel</button>
            <button className={`btn btn-primary ${isSubmitting ? 'loading' : ''}`} onClick={submitReply} disabled={isSubmitting}>Reply</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReplyButton;