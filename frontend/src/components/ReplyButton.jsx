import React, { useState, useCallback, memo } from 'react';
import { MessageSquare } from 'lucide-react';
import { addComment } from '../lib/complaintService'; // Import actual addComment
import toast from 'react-hot-toast'; // Import actual toast

const ReplyButton = memo(({ commentId, complaintId, onReplyAdded }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [replyText, setReplyText] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleOpen = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  const handleTextChange = useCallback((e) => {
    setReplyText(e.target.value);
  }, []);

  const submitReply = useCallback(async () => {
    if (!replyText.trim()) return toast.error('Reply cannot be empty');
    setIsSubmitting(true);
    try {
      await addComment(complaintId, replyText, commentId);
      setReplyText('');
      setIsOpen(false);
      toast.success('Reply added');
      if (onReplyAdded) onReplyAdded();
    } catch (err) {
      toast.error(err?.message || 'Failed to add reply');
    } finally {
      setIsSubmitting(false);
    }
  }, [replyText, complaintId, commentId, onReplyAdded]);

  const handleCancel = useCallback(() => {
    setIsOpen(false);
  }, []);

  return (
    <div className="reply-container">
      <button
        onClick={toggleOpen}
        className="reply-trigger"
        aria-label="Reply to comment"
      >
        <span className="reply-icon-wrapper">
          <MessageSquare className="reply-icon" />
        </span>
        <span className="reply-text">Reply</span>
        <span className="reply-glow"></span>
      </button>

      <div className={`reply-form-wrapper ${isOpen ? 'open' : ''}`}>
        <div className="reply-form-container">
          <div className="textarea-wrapper">
            <textarea
              rows={2}
              value={replyText}
              onChange={handleTextChange}
              className="reply-textarea"
              placeholder="Write your reply..."
              disabled={isSubmitting}
            />
            <div className="textarea-border"></div>
          </div>

          <div className="button-group">
            <button
              className="btn-cancel"
              onClick={handleCancel}
              disabled={isSubmitting}
            >
              <span className="btn-content">Cancel</span>
              <span className="btn-hover-effect"></span>
            </button>

            <button
              className={`btn-submit ${isSubmitting ? 'loading' : ''}`}
              onClick={submitReply}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <span className="loader-wrapper">
                  <span className="loader"></span>
                  <span className="btn-content">Sending...</span>
                </span>
              ) : (
                <span className="btn-content">Reply</span>
              )}
              <span className="btn-glow"></span>
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .reply-container {
          position: relative;
          will-change: transform;
        }

        .reply-trigger {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 0.375rem;
          padding: 0.375rem 0.75rem;
          font-size: 0.75rem;
          font-weight: 500;
          color: #3b82f6;
          background: transparent;
          border: none;
          border-radius: 0.5rem;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          isolation: isolate;
        }

        .reply-trigger::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.08), rgba(147, 51, 234, 0.08));
          border-radius: 0.5rem;
          opacity: 0;
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .reply-trigger:hover::before {
          opacity: 1;
        }

        .reply-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          transform: translateZ(0);
          transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .reply-trigger:hover .reply-icon-wrapper {
          transform: translateY(-2px) scale(1.1);
        }

        .reply-icon {
          width: 0.75rem;
          height: 0.75rem;
        }

        .reply-text {
          position: relative;
          z-index: 1;
        }

        .reply-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #3b82f6, #9333ea);
          border-radius: 0.5rem;
          opacity: 0;
          filter: blur(8px);
          transition: opacity 0.3s ease;
          z-index: -2;
        }

        .reply-trigger:hover .reply-glow {
          opacity: 0.4;
        }

        .reply-form-wrapper {
          max-height: 0;
          opacity: 0;
          overflow: hidden;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s ease 0.1s;
          will-change: max-height, opacity;
        }

        .reply-form-wrapper.open {
          max-height: 300px;
          opacity: 1;
          transition: max-height 0.4s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.3s ease;
        }

        .reply-form-container {
          margin-top: 0.75rem;
          padding: 1rem;
          background: linear-gradient(135deg, rgba(15, 23, 42, 0.6), rgba(30, 41, 59, 0.4));
          backdrop-filter: blur(20px);
          border: 1px solid rgba(148, 163, 184, 0.1);
          border-radius: 1rem;
          box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12),
                      inset 0 1px 0 rgba(255, 255, 255, 0.05);
          transform: translateZ(0);
        }

        .textarea-wrapper {
          position: relative;
          margin-bottom: 0.75rem;
        }

        .reply-textarea {
          width: 100%;
          padding: 0.75rem;
          font-size: 0.875rem;
          line-height: 1.5;
          color: #e2e8f0;
          background: rgba(15, 23, 42, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.15);
          border-radius: 0.75rem;
          outline: none;
          resize: vertical;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          font-family: inherit;
        }

        .reply-textarea::placeholder {
          color: rgba(148, 163, 184, 0.5);
        }

        .reply-textarea:focus {
          background: rgba(15, 23, 42, 0.6);
          border-color: rgba(59, 130, 246, 0.4);
          box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1),
                      0 0 20px rgba(59, 130, 246, 0.15);
        }

        .reply-textarea:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .textarea-border {
          position: absolute;
          inset: 0;
          border-radius: 0.75rem;
          background: linear-gradient(135deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3));
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
          filter: blur(8px);
        }

        .reply-textarea:focus + .textarea-border {
          opacity: 1;
        }

        .button-group {
          display: flex;
          justify-content: flex-end;
          gap: 0.5rem;
        }

        .btn-cancel,
        .btn-submit {
          position: relative;
          padding: 0.5rem 1.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          border: none;
          border-radius: 0.625rem;
          cursor: pointer;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          isolation: isolate;
          transform: translateZ(0);
        }

        .btn-cancel {
          color: #94a3b8;
          background: rgba(51, 65, 85, 0.4);
          border: 1px solid rgba(148, 163, 184, 0.2);
        }

        .btn-cancel:hover:not(:disabled) {
          background: rgba(51, 65, 85, 0.6);
          border-color: rgba(148, 163, 184, 0.3);
          transform: translateY(-1px);
        }

        .btn-cancel:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit {
          color: #ffffff;
          background: linear-gradient(135deg, #3b82f6, #2563eb);
          border: 1px solid rgba(59, 130, 246, 0.3);
          box-shadow: 0 4px 16px rgba(59, 130, 246, 0.25);
        }

        .btn-submit:hover:not(:disabled) {
          background: linear-gradient(135deg, #2563eb, #1d4ed8);
          box-shadow: 0 6px 24px rgba(59, 130, 246, 0.4);
          transform: translateY(-2px);
        }

        .btn-submit:active:not(:disabled) {
          transform: translateY(0);
        }

        .btn-submit:disabled,
        .btn-cancel:disabled {
          opacity: 0.6;
          cursor: not-allowed;
          transform: none !important;
        }

        .btn-content {
          position: relative;
          z-index: 1;
        }

        .btn-hover-effect {
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255, 255, 255, 0.1), transparent);
          opacity: 0;
          transition: opacity 0.3s ease;
        }

        .btn-cancel:hover:not(:disabled) .btn-hover-effect {
          opacity: 1;
        }

        .btn-glow {
          position: absolute;
          inset: -2px;
          background: linear-gradient(135deg, #3b82f6, #9333ea);
          border-radius: 0.625rem;
          opacity: 0;
          filter: blur(12px);
          transition: opacity 0.3s ease;
          z-index: -1;
        }

        .btn-submit:hover:not(:disabled) .btn-glow {
          opacity: 0.6;
        }

        .btn-submit.loading {
          pointer-events: none;
        }

        .loader-wrapper {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .loader {
          width: 1rem;
          height: 1rem;
          border: 2px solid rgba(255, 255, 255, 0.2);
          border-top-color: #ffffff;
          border-radius: 50%;
          animation: spin 0.6s linear infinite;
        }

        @keyframes spin {
          to {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .reply-form-container {
            padding: 0.75rem;
          }

          .button-group {
            gap: 0.375rem;
          }

          .btn-cancel,
          .btn-submit {
            padding: 0.5rem 1rem;
            font-size: 0.8125rem;
          }
        }

        @media (prefers-reduced-motion: reduce) {
          .reply-trigger,
          .reply-icon-wrapper,
          .reply-glow,
          .reply-form-wrapper,
          .reply-textarea,
          .textarea-border,
          .btn-cancel,
          .btn-submit,
          .btn-hover-effect,
          .btn-glow {
            transition: none;
          }

          .loader {
            animation: none;
          }
        }
      `}</style>
    </div>
  );
});

ReplyButton.displayName = 'ReplyButton';

export default ReplyButton;