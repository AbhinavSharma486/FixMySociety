import React from 'react';
import { X, AlertTriangle } from 'lucide-react';
import Portal from '../../components/Portal'; // Import the Portal component

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <Portal>
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[9999]"> {/* Increased z-index */}
        <div className="bg-base-100 rounded-lg shadow-xl w-full max-w-sm p-6 relative text-center">
          <button
            className="btn btn-sm btn-circle absolute right-3 top-3"
            onClick={onClose}
          >
            <X className="w-4 h-4" />
          </button>
          <AlertTriangle className="w-16 h-16 text-warning mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-base-content mb-3">{title}</h2>
          <p className="text-base-content/70 mb-6">{message}</p>

          <div className="flex justify-center gap-4">
            <button className="btn btn-ghost" onClick={onClose}>Cancel</button>
            <button className="btn btn-warning" onClick={onConfirm}>Confirm</button>
          </div>
        </div>
      </div>
    </Portal>
  );
};

export default ConfirmationModal;
