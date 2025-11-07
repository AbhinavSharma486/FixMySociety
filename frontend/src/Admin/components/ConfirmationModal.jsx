import React, { useEffect, useState, useCallback, useMemo, useRef } from 'react';
import { X, AlertTriangle } from 'lucide-react';

import Portal from '../../components/Portal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      // Use RAF for smoother state transitions
      animationFrameRef.current = requestAnimationFrame(() => {
        setIsVisible(true);
      });
    } else {
      setIsVisible(false);
      const timer = setTimeout(() => setShouldRender(false), 300);
      return () => {
        clearTimeout(timer);
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
      };
    }
  }, [isOpen]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  // Memoize styles once - no dependencies needed as animations are static
  const styles = useMemo(() => `
    @keyframes modalFadeIn {
      from {
        opacity: 0;
        backdrop-filter: blur(0px);
      }
      to {
        opacity: 1;
        backdrop-filter: blur(12px);
      }
    }

    @keyframes modalSlideUp {
      from {
        opacity: 0;
        transform: translateY(40px) scale(0.9);
      }
      to {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
    }

    @keyframes modalSlideDown {
      from {
        opacity: 1;
        transform: translateY(0) scale(1);
      }
      to {
        opacity: 0;
        transform: translateY(40px) scale(0.9);
      }
    }

    @keyframes warningPulse {
      0%, 100% {
        transform: scale(1);
        filter: drop-shadow(0 0 20px rgba(251, 191, 36, 0.6));
      }
      50% {
        transform: scale(1.05);
        filter: drop-shadow(0 0 40px rgba(251, 191, 36, 0.9));
      }
    }

    @keyframes scanLine {
      0% {
        transform: translateY(-100%);
      }
      100% {
        transform: translateY(200%);
      }
    }

    @keyframes shimmer {
      0% {
        transform: translateX(-100%);
      }
      100% {
        transform: translateX(100%);
      }
    }

    @keyframes glowPulse {
      0%, 100% {
        box-shadow: 0 0 20px rgba(251, 191, 36, 0.3),
                    0 0 40px rgba(251, 191, 36, 0.2),
                    inset 0 0 20px rgba(251, 191, 36, 0.05);
      }
      50% {
        box-shadow: 0 0 40px rgba(251, 191, 36, 0.5),
                    0 0 80px rgba(251, 191, 36, 0.3),
                    inset 0 0 30px rgba(251, 191, 36, 0.1);
      }
    }

    @keyframes float {
      0%, 100% { 
        transform: translateY(0px);
      }
      50% { 
        transform: translateY(-10px);
      }
    }

    .modal-overlay {
      animation: ${isVisible ? 'modalFadeIn 0.3s ease-out forwards' : 'modalFadeIn 0.3s ease-out reverse forwards'};
      will-change: opacity, backdrop-filter;
      contain: layout style paint;
    }

    .modal-content {
      animation: ${isVisible ? 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards' : 'modalSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards'};
      will-change: transform, opacity;
      contain: layout style paint;
    }

    .warning-icon-container {
      animation: warningPulse 2s ease-in-out infinite;
      will-change: transform, filter;
      contain: layout style paint;
    }

    .scan-line {
      animation: scanLine 8s linear infinite;
      will-change: transform;
      contain: layout style paint;
    }

    .shimmer-effect {
      animation: shimmer 3s linear infinite;
      will-change: transform;
      contain: layout style paint;
    }

    .glow-border {
      animation: glowPulse 3s ease-in-out infinite;
      will-change: box-shadow;
      contain: layout style paint;
    }

    .float-animation {
      animation: float 3s ease-in-out infinite;
      will-change: transform;
      contain: layout style paint;
    }

    .close-btn {
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1), background 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
    }

    .close-btn:hover {
      transform: rotate(90deg) scale(1.1);
      background: rgba(255, 255, 255, 0.15);
    }

    .btn-futuristic {
      position: relative;
      overflow: hidden;
      transition: transform 0.3s cubic-bezier(0.16, 1, 0.3, 1);
      will-change: transform;
      contain: layout style paint;
    }

    .btn-futuristic::before {
      content: '';
      position: absolute;
      top: 0;
      left: -100%;
      width: 100%;
      height: 100%;
      background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.3),
        transparent
      );
      transition: left 0.6s;
      will-change: left;
    }

    .btn-futuristic:hover::before {
      left: 100%;
    }

    .btn-futuristic:hover {
      transform: translateY(-2px) scale(1.02);
    }

    .btn-futuristic:active {
      transform: translateY(0) scale(0.98);
    }

    @media (max-width: 768px) {
      .modal-overlay {
        padding: 1rem;
      }
    }

    @media (max-width: 640px) {
      .modal-overlay {
        padding: 0.75rem;
      }

      .modal-content {
        max-width: 100%;
        border-radius: 1.5rem;
      }

      .modal-content-padding {
        padding: 1.5rem 1rem;
      }
    }

    @media (max-width: 480px) {
      .modal-overlay {
        padding: 0.5rem;
      }

      .modal-content {
        border-radius: 1.25rem;
      }

      .modal-content-padding {
        padding: 1.25rem 0.875rem;
      }

      .modal-title {
        font-size: 1.5rem;
        line-height: 1.2;
        margin-bottom: 0.75rem;
      }

      .modal-message {
        font-size: 0.875rem;
        margin-bottom: 1rem;
        padding-left: 0.5rem;
        padding-right: 0.5rem;
      }

      .modal-buttons {
        gap: 0.75rem;
      }

      .btn-futuristic {
        padding: 0.875rem 1rem;
        font-size: 0.875rem;
        border-radius: 0.625rem;
      }

      .warning-icon {
        width: 3.5rem;
        height: 3.5rem;
      }

      .warning-bg {
        width: 5rem;
        height: 5rem;
      }

      .warning-icon-wrapper {
        margin-bottom: 1rem;
      }

      .close-btn {
        width: 2rem;
        height: 2rem;
        right: 0.75rem;
        top: 0.75rem;
      }

      .close-icon {
        width: 1.125rem;
        height: 1.125rem;
      }

      .corner-accent {
        width: 2rem;
        height: 2rem;
      }

      .corner-accent.top-left {
        border-width: 1px;
        border-radius: 0.75rem;
      }

      .corner-accent.bottom-right {
        border-width: 1px;
        border-radius: 0.75rem;
      }

      .bg-grid {
        background-size: 2rem 2rem;
      }

      .floating-orb-lg {
        width: 15rem;
        height: 15rem;
      }

      .floating-orb-md {
        width: 12rem;
        height: 12rem;
      }

      .ambient-glow {
        width: 10rem;
        height: 10rem;
      }
    }

    @media (max-width: 360px) {
      .modal-title {
        font-size: 1.25rem;
      }

      .modal-message {
        font-size: 0.8125rem;
      }

      .btn-futuristic {
        padding: 0.75rem 0.875rem;
        font-size: 0.8125rem;
      }

      .warning-icon {
        width: 3rem;
        height: 3rem;
      }

      .warning-bg {
        width: 4rem;
        height: 4rem;
      }

      .modal-content-padding {
        padding: 1rem 0.75rem;
      }
    }
  `, [isVisible]);

  if (!shouldRender) return null;

  return (
    <Portal>
      <style>{styles}</style>

      <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
        {/* Animated Grid Background */}
        <div className="bg-grid absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>

        {/* Floating Orbs - Optimized with transform-only animations */}
        <div className="floating-orb-lg absolute top-1/4 left-1/4 bg-yellow-500/10 rounded-full blur-3xl float-animation pointer-events-none" style={{ maxWidth: '24rem' }}></div>
        <div className="floating-orb-md absolute bottom-1/4 right-1/4 bg-orange-500/10 rounded-full blur-3xl float-animation pointer-events-none" style={{ maxWidth: '24rem', animationDelay: '1.5s' }}></div>

        <div className="modal-content glow-border rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-2xl">
          {/* Scan Line Effect */}
          <div className="absolute inset-0 scan-line bg-gradient-to-b from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 pointer-events-none"></div>

          {/* Shimmer Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>

          {/* Ambient Glow */}
          <div className="ambient-glow absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none" style={{ maxWidth: '16rem' }}></div>

          {/* Content */}
          <div className="modal-content-padding relative z-10 p-8 sm:p-10 text-center">
            {/* Close Button */}
            <button
              className="close-btn absolute right-4 top-4 w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 hover:border-white/30 cursor-pointer"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <X className="close-icon w-5 h-5 text-white/80" />
            </button>

            {/* Warning Icon with Holographic Effect */}
            <div className="warning-icon-wrapper relative mb-8 flex justify-center">
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="warning-bg w-32 h-32 bg-yellow-500/30 rounded-full blur-2xl"></div>
              </div>
              <div className="warning-icon-container relative z-10">
                <AlertTriangle className="warning-icon w-20 h-20 text-yellow-400" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <h2 className="modal-title text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent leading-tight">
              {title}
            </h2>

            {/* Message */}
            <p className="modal-message text-white/70 text-base sm:text-lg mb-8 leading-relaxed px-2">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="modal-buttons flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="btn-futuristic px-8 py-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md text-white border border-white/20 hover:border-white/40 font-bold text-base transition-all w-full sm:w-auto cursor-pointer"
                onClick={handleClose}
              >
                <span className="relative z-10">Cancel</span>
              </button>
              <button
                className="btn-futuristic px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-base shadow-lg shadow-yellow-500/30 border border-yellow-400/50 w-full sm:w-auto cursor-pointer"
                onClick={handleConfirm}
              >
                <span className="relative z-10">Confirm</span>
              </button>
            </div>

            {/* Holographic Corner Accents */}
            <div className="corner-accent top-left absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yellow-400/30 rounded-tl-3xl pointer-events-none"></div>
            <div className="corner-accent bottom-right absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yellow-400/30 rounded-br-3xl pointer-events-none"></div>
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
        </div>
      </div>
    </Portal>
  );
};

export default ConfirmationModal;