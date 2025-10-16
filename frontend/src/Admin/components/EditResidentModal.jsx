import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';
import { User, Mail, Hash, Building2, X } from 'lucide-react';
import { getAllBuildingsAdmin } from '../../lib/buildingService';

const EditResidentModal = memo(({ isOpen, onClose, resident, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    flatNumber: '',
    buildingName: ''
  });
  const [buildings, setBuildings] = useState([]);

  useEffect(() => {
    if (resident) {
      setFormData({
        fullName: resident.fullName || '',
        email: resident.email || '',
        flatNumber: resident.flatNumber || '',
        buildingName: resident.buildingName || ''
      });
    }
  }, [resident]);

  const fetchBuildings = useCallback(async () => {
    try {
      const response = await getAllBuildingsAdmin();
      setBuildings(response.buildings);
    } catch (error) {
      console.error("Failed to fetch buildings", error);
    }
  }, []);

  useEffect(() => {
    if (isOpen) {
      fetchBuildings();
    }
  }, [isOpen, fetchBuildings]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback((e) => {
    e.preventDefault();
    onSubmit(resident._id, formData);
  }, [resident?._id, formData, onSubmit]);

  const handleOverlayClick = useCallback((e) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  }, [onClose]);

  const buildingOptions = useMemo(() =>
    buildings.map(b => (
      <option key={b._id} value={b.buildingName} className="bg-gray-900">
        {b.buildingName}
      </option>
    )), [buildings]
  );

  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes modalSlideUp {
          from {
            opacity: 0;
            transform: translate3d(0, 30px, 0) scale3d(0.95, 0.95, 1);
          }
          to {
            opacity: 1;
            transform: translate3d(0, 0, 0) scale3d(1, 1, 1);
          }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        .modal-overlay {
          animation: modalFadeIn 0.3s ease-out;
          backdrop-filter: blur(12px);
          will-change: opacity;
        }

        .modal-content {
          animation: modalSlideUp 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          will-change: transform, opacity;
        }

        .input-group {
          position: relative;
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform;
        }

        .input-group:focus-within {
          transform: translate3d(0, -2px, 0);
        }

        .input-group:focus-within .icon-wrapper {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 100%);
          box-shadow: 0 4px 15px rgba(96, 165, 250, 0.4);
        }

        .input-group:focus-within input,
        .input-group:focus-within select {
          border-color: #60a5fa;
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1);
        }

        .glass-card {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .btn-primary-modern {
          position: relative;
          overflow: hidden;
          background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
          transition: transform 0.3s ease, box-shadow 0.3s ease;
          will-change: transform;
        }

        .btn-primary-modern::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
          will-change: left;
        }

        .btn-primary-modern:hover::before {
          left: 100%;
        }

        .btn-primary-modern:hover {
          transform: translate3d(0, -2px, 0);
          box-shadow: 0 10px 25px rgba(59, 130, 246, 0.4);
        }

        .btn-secondary-modern {
          transition: background 0.3s ease, transform 0.3s ease;
          border: 1px solid rgba(255, 255, 255, 0.2);
          will-change: transform;
        }

        .btn-secondary-modern:hover {
          background: rgba(255, 255, 255, 0.1);
          transform: translate3d(0, -2px, 0);
        }

        .close-button {
          transition: transform 0.3s ease, background 0.3s ease;
          will-change: transform;
        }

        .close-button:hover {
          transform: rotate(90deg) scale3d(1.1, 1.1, 1);
          background: rgba(239, 68, 68, 0.2);
        }

        .icon-wrapper {
          transition: background 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          background: rgba(96, 165, 250, 0.1);
        }

        .gradient-border {
          position: relative;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 12px;
          padding: 1px;
          background: linear-gradient(135deg, #60a5fa, #3b82f6, #8b5cf6);
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s ease;
          pointer-events: none;
        }

        .gradient-border:focus-within::before {
          opacity: 1;
        }

        input, select {
          transition: border-color 0.3s ease, box-shadow 0.3s ease;
        }

        select {
          cursor: pointer;
        }

        .form-title {
          background: linear-gradient(135deg, #60a5fa 0%, #3b82f6 50%, #8b5cf6 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: shimmer 3s infinite linear;
          background-size: 200% auto;
        }

        .ambient-gradient {
          will-change: transform;
          pointer-events: none;
        }

        @media (max-width: 640px) {
          .modal-content {
            max-width: 95vw;
            margin: 1rem;
          }
        }
      `}</style>

      <div
        className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
        onClick={handleOverlayClick}
      >
        <div className="modal-content glass-card rounded-2xl shadow-2xl w-full max-w-lg relative overflow-hidden">
          {/* Ambient background gradient */}
          <div className="ambient-gradient absolute top-0 right-0 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>
          <div className="ambient-gradient absolute bottom-0 left-0 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>

          {/* Header */}
          <div className="relative p-6 pb-4 border-b border-white/10">
            <button
              onClick={onClose}
              className="close-button absolute right-4 top-4 w-10 h-10 rounded-full flex items-center justify-center bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-400"
              aria-label="Close modal"
              type="button"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="form-title text-2xl font-bold pr-12">
              Edit Resident Details
            </h3>
            <p className="text-sm text-gray-400 mt-2">Update resident information below</p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            {/* Full Name */}
            <div className="input-group gradient-border">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-3 transition-all">
                <div className="icon-wrapper p-2 rounded-lg">
                  <User className="w-5 h-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  name="fullName"
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                  placeholder="Full Name"
                  value={formData.fullName}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Email */}
            <div className="input-group gradient-border">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-3 transition-all">
                <div className="icon-wrapper p-2 rounded-lg">
                  <Mail className="w-5 h-5 text-blue-400" />
                </div>
                <input
                  type="email"
                  name="email"
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                  placeholder="Email Address"
                  value={formData.email}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Building Name */}
            <div className="input-group gradient-border">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-3 transition-all">
                <div className="icon-wrapper p-2 rounded-lg">
                  <Building2 className="w-5 h-5 text-blue-400" />
                </div>
                <select
                  name="buildingName"
                  className="flex-1 bg-transparent outline-none text-white text-sm"
                  value={formData.buildingName}
                  onChange={handleChange}
                >
                  <option value="" disabled className="bg-gray-900">Select a building</option>
                  {buildingOptions}
                </select>
              </div>
            </div>

            {/* Flat Number */}
            <div className="input-group gradient-border">
              <div className="flex items-center gap-3 bg-white/5 rounded-xl border border-white/10 px-4 py-3 transition-all">
                <div className="icon-wrapper p-2 rounded-lg">
                  <Hash className="w-5 h-5 text-blue-400" />
                </div>
                <input
                  type="text"
                  name="flatNumber"
                  className="flex-1 bg-transparent outline-none text-white placeholder-gray-500 text-sm"
                  placeholder="Flat Number"
                  value={formData.flatNumber}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={onClose}
                className="btn-secondary-modern flex-1 px-6 py-3 rounded-xl font-medium text-white bg-white/5 hover:bg-white/10"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="btn-primary-modern flex-1 px-6 py-3 rounded-xl font-medium text-white shadow-lg"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </>
  );
});

EditResidentModal.displayName = 'EditResidentModal';

export default EditResidentModal;