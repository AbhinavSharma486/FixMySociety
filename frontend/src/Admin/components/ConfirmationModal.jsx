import React, { useEffect, useState, useCallback, useMemo } from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Portal from '../../components/Portal';

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
    } else {
      const timer = setTimeout(() => setIsVisible(false), 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Memoize handlers to prevent unnecessary re-renders
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleConfirm = useCallback(() => {
    onConfirm();
  }, [onConfirm]);

  // Memoize static styles to prevent recalculation
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
      animation: ${isOpen ? 'modalFadeIn 0.3s ease-out' : 'modalFadeIn 0.3s ease-out reverse'};
      will-change: opacity, backdrop-filter;
    }

    .modal-content {
      animation: ${isOpen ? 'modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1)' : 'modalSlideDown 0.3s cubic-bezier(0.16, 1, 0.3, 1)'};
      will-change: transform, opacity;
    }

    .warning-icon-container {
      animation: warningPulse 2s ease-in-out infinite;
      will-change: transform, filter;
    }

    .scan-line {
      animation: scanLine 8s linear infinite;
      will-change: transform;
    }

    .shimmer-effect {
      animation: shimmer 3s linear infinite;
      will-change: transform;
    }

    .glow-border {
      animation: glowPulse 3s ease-in-out infinite;
      will-change: box-shadow;
    }

    .float-animation {
      animation: float 3s ease-in-out infinite;
      will-change: transform;
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

    @media (max-width: 640px) {
      .modal-content {
        max-width: 90vw;
        margin: 0 1rem;
      }
    }
  `, [isOpen]);

  if (!isVisible) return null;

  return (
    <Portal>
      <style>{styles}</style>

      <div className="modal-overlay fixed inset-0 bg-black/80 backdrop-blur-md flex items-center justify-center z-[9999] p-4">
        {/* Animated Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-30 pointer-events-none"></div>

        {/* Floating Orbs - Optimized with transform-only animations */}
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl float-animation pointer-events-none"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/10 rounded-full blur-3xl float-animation pointer-events-none" style={{ animationDelay: '1.5s' }}></div>

        <div className="modal-content glow-border rounded-3xl shadow-2xl w-full max-w-md relative overflow-hidden border border-white/10 bg-gradient-to-br from-white/5 to-transparent backdrop-blur-2xl">
          {/* Scan Line Effect */}
          <div className="absolute inset-0 scan-line bg-gradient-to-b from-yellow-400/0 via-yellow-400/10 to-yellow-400/0 pointer-events-none"></div>

          {/* Shimmer Overlay */}
          <div className="absolute inset-0 pointer-events-none overflow-hidden">
            <div className="shimmer-effect absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent"></div>
          </div>

          {/* Ambient Glow */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-yellow-500/20 rounded-full blur-3xl pointer-events-none"></div>

          {/* Content */}
          <div className="relative z-10 p-8 sm:p-10 text-center">
            {/* Close Button */}
            <button
              className="close-btn absolute right-4 top-4 w-10 h-10 rounded-full bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 hover:border-white/30"
              onClick={handleClose}
              aria-label="Close modal"
            >
              <X className="w-5 h-5 text-white/80" />
            </button>

            {/* Warning Icon with Holographic Effect */}
            <div className="relative mb-8 flex justify-center">
              <div className="absolute inset-0 flex justify-center items-center">
                <div className="w-32 h-32 bg-yellow-500/30 rounded-full blur-2xl"></div>
              </div>
              <div className="warning-icon-container relative z-10">
                <AlertTriangle className="w-20 h-20 text-yellow-400" strokeWidth={1.5} />
              </div>
            </div>

            {/* Title */}
            <h2 className="text-3xl sm:text-4xl font-black mb-4 bg-gradient-to-r from-yellow-400 via-orange-400 to-red-400 bg-clip-text text-transparent leading-tight">
              {title}
            </h2>

            {/* Message */}
            <p className="text-white/70 text-base sm:text-lg mb-8 leading-relaxed px-2">
              {message}
            </p>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4">
              <button
                className="btn-futuristic px-8 py-4 rounded-xl bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-md text-white border border-white/20 hover:border-white/40 font-bold text-base transition-all"
                onClick={handleClose}
              >
                <span className="relative z-10">Cancel</span>
              </button>
              <button
                className="btn-futuristic px-8 py-4 rounded-xl bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-bold text-base shadow-lg shadow-yellow-500/30 border border-yellow-400/50"
                onClick={handleConfirm}
              >
                <span className="relative z-10">Confirm</span>
              </button>
            </div>

            {/* Holographic Corner Accents */}
            <div className="absolute top-0 left-0 w-16 h-16 border-t-2 border-l-2 border-yellow-400/30 rounded-tl-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 right-0 w-16 h-16 border-b-2 border-r-2 border-yellow-400/30 rounded-br-3xl pointer-events-none"></div>
          </div>

          {/* Bottom Accent Line */}
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-yellow-400 to-transparent opacity-50"></div>
        </div>
      </div>
    </Portal>
  );
};


export default ConfirmationModal;