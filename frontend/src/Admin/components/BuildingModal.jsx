import React, { useState, useEffect, useCallback, useMemo, memo } from 'react';
import { X, Building2, Save, Edit, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

// Memoized backdrop component to prevent unnecessary rerenders
const ModalBackdrop = memo(({ onClose, loading }) => (
  <div
    className="absolute inset-0"
    onClick={onClose}
    style={{ cursor: loading ? 'not-allowed' : 'pointer' }}
  />
));

// Memoized icon component to prevent rerender on parent updates
const IconWrapper = memo(({ mode }) => (
  <div className="relative">
    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl blur-lg opacity-50 icon-float" />
    <div className="relative p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl sm:rounded-2xl shadow-lg">
      {mode === 'create' ? (
        <Building2 className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
      ) : (
        <Edit className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
      )}
    </div>
  </div>
));

// Memoized input field to prevent unnecessary rerenders
const InputField = memo(({
  label,
  name,
  value,
  onChange,
  onFocus,
  onBlur,
  onKeyDown,
  type,
  placeholder,
  min,
  disabled,
  focused,
  helpText
}) => (
  <div className="space-y-2 sm:space-y-3">
    <label className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 sm:gap-0">
      <span className="text-xs sm:text-sm font-semibold text-gray-300">{label}</span>
      <span className="text-xs text-red-400 flex items-center gap-1">
        <Sparkles className="w-3 h-3" /> Required
      </span>
    </label>
    <div className="relative gradient-border rounded-lg sm:rounded-xl">
      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={onFocus}
        onBlur={onBlur}
        onKeyDown={onKeyDown}
        className="input-glow w-full px-3 sm:px-4 py-2.5 sm:py-3.5 bg-white/5 border border-white/10 rounded-lg sm:rounded-xl text-sm sm:text-base text-white placeholder-gray-500 focus:bg-white/10"
        placeholder={placeholder}
        min={min}
        required
        disabled={disabled}
      />
      {focused && (
        <div className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full" />
      )}
    </div>
    {helpText && (
      <p className="text-xs text-gray-500 flex items-center gap-2 pl-1">
        <span className="w-1 h-1 rounded-full bg-blue-500" />
        {helpText}
      </p>
    )}
  </div>
));

const BuildingModal = ({
  isOpen,
  onClose,
  building = null,
  onSubmit,
  mode = 'create'
}) => {
  const [formData, setFormData] = useState({
    buildingName: '',
    numberOfFlats: ''
  });
  const [loading, setLoading] = useState(false);
  const [focusedInput, setFocusedInput] = useState(null);

  // Memoize title and subtitle to prevent recalculation
  const { title, subtitle } = useMemo(() => ({
    title: mode === 'create' ? 'Create Building' : 'Edit Building',
    subtitle: mode === 'create' ? 'Add a new building to your complex' : 'Update building details'
  }), [mode]);

  // Memoize button text
  const buttonText = useMemo(() => mode === 'create' ? 'Create' : 'Update', [mode]);

  useEffect(() => {
    if (building && mode === 'edit') {
      setFormData({
        buildingName: building.buildingName,
        numberOfFlats: building.numberOfFlats.toString()
      });
    } else {
      setFormData({
        buildingName: '',
        numberOfFlats: ''
      });
    }
  }, [building, mode, isOpen]);

  // Use useCallback to memoize event handlers
  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();

    if (!formData.buildingName.trim() || !formData.numberOfFlats) {
      toast.error('Please fill all required fields');
      return;
    }

    if (parseInt(formData.numberOfFlats) <= 0) {
      toast.error('Number of flats must be greater than 0');
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        buildingName: formData.buildingName.trim(),
        numberOfFlats: parseInt(formData.numberOfFlats)
      });
      onClose();
    } catch (error) {
      toast.error(error.message || 'Failed to save building');
    } finally {
      setLoading(false);
    }
  }, [formData, onSubmit, onClose]);

  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  }, []);

  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  }, [handleSubmit]);

  // Memoize focus handlers
  const handleFocusBuildingName = useCallback(() => setFocusedInput('buildingName'), []);
  const handleFocusNumberOfFlats = useCallback(() => setFocusedInput('numberOfFlats'), []);
  const handleBlur = useCallback(() => setFocusedInput(null), []);

  // Early return for performance - don't render anything if modal is closed
  if (!isOpen) return null;

  return (
    <>
      <style>{`
        @keyframes modalFadeIn {
          from {
            opacity: 0;
            transform: scale(0.9) translateY(-20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes backdropFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes shimmer {
          0% { background-position: -1000px 0; }
          100% { background-position: 1000px 0; }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }

        @keyframes glow {
          0%, 100% { box-shadow: 0 0 20px rgba(96, 165, 250, 0.3), 0 0 40px rgba(96, 165, 250, 0.1); }
          50% { box-shadow: 0 0 30px rgba(96, 165, 250, 0.5), 0 0 60px rgba(96, 165, 250, 0.2); }
        }

        .modal-backdrop {
          animation: backdropFadeIn 0.3s ease-out;
          backdrop-filter: blur(12px);
          will-change: opacity;
        }

        .modal-content {
          animation: modalFadeIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
          will-change: transform, opacity;
        }

        .glass-effect {
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(255, 255, 255, 0.1);
        }

        .input-glow {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), border-color 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          will-change: transform, border-color, box-shadow;
        }

        .input-glow:focus {
          outline: none;
          border-color: rgba(96, 165, 250, 0.6);
          box-shadow: 0 0 0 3px rgba(96, 165, 250, 0.1), 0 8px 16px rgba(96, 165, 250, 0.2);
          transform: translateY(-2px);
        }

        .button-hover {
          transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1), box-shadow 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          position: relative;
          overflow: hidden;
          will-change: transform;
        }

        .button-hover::before {
          content: '';
          position: absolute;
          top: 50%;
          left: 50%;
          width: 0;
          height: 0;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.2);
          transform: translate(-50%, -50%);
          transition: width 0.6s, height 0.6s;
          will-change: width, height;
        }

        .button-hover:hover::before {
          width: 300px;
          height: 300px;
        }

        .button-hover:hover:not(:disabled) {
          transform: translateY(-2px);
          box-shadow: 0 10px 25px rgba(96, 165, 250, 0.4);
        }

        .button-hover:active:not(:disabled) {
          transform: translateY(0);
        }

        .icon-float {
          animation: float 3s ease-in-out infinite;
          will-change: transform;
        }

        .shimmer-effect {
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
          background-size: 1000px 100%;
          animation: shimmer 3s infinite;
          will-change: background-position;
        }

        .gradient-border {
          position: relative;
        }

        .gradient-border::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: inherit;
          padding: 1px;
          background: linear-gradient(135deg, rgba(96, 165, 250, 0.5), rgba(147, 51, 234, 0.5), rgba(236, 72, 153, 0.5));
          -webkit-mask: linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0);
          -webkit-mask-composite: xor;
          mask-composite: exclude;
          opacity: 0;
          transition: opacity 0.3s;
          will-change: opacity;
        }

        .gradient-border:focus-within::before {
          opacity: 1;
        }

        .loading-pulse {
          animation: pulse 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @media (max-width: 640px) {
          .modal-content {
            margin: 1rem;
            max-height: calc(100vh - 2rem);
            overflow-y: auto;
          }
        }

        /* Ultra-small screens (320px and up) */
        @media (max-width: 380px) {
          .modal-content {
            max-width: calc(100vw - 1rem);
            margin: 0.5rem;
            max-height: calc(100vh - 1rem);
          }

          .glass-effect {
            border-radius: 1rem;
          }
        }

        /* Small phones optimization */
        @media (max-width: 360px) {
          .modal-content {
            max-width: calc(100vw - 0.5rem);
            margin: 0.25rem;
          }
        }
      `}</style>

      <div className="fixed inset-0 z-[1000] flex items-center justify-center p-2 sm:p-4 modal-backdrop bg-black/60">
        <ModalBackdrop onClose={onClose} loading={loading} />

        <div className="modal-content relative w-full max-w-md glass-effect rounded-2xl sm:rounded-3xl shadow-2xl overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-purple-500/10 to-pink-500/10 opacity-50" />
          <div className="absolute inset-0 shimmer-effect opacity-30" />

          <div className="relative p-4 sm:p-6 md:p-8">
            <div className="flex items-start sm:items-center justify-between gap-3 sm:gap-4 mb-6 sm:mb-8">
              <div className="flex items-start sm:items-center gap-2 sm:gap-4 flex-1 min-w-0">
                <div className="flex-shrink-0">
                  <IconWrapper mode={mode} />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg sm:text-2xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent break-words">
                    {title}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-400 mt-0.5 sm:mt-1 line-clamp-2">
                    {subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="flex-shrink-0 p-1.5 sm:p-2 rounded-lg sm:rounded-xl bg-white/5 hover:bg-white/10 transition-all duration-300 hover:rotate-90 group"
                disabled={loading}
              >
                <X className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover:text-white transition-colors" />
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              <InputField
                label="Building Name"
                name="buildingName"
                type="text"
                value={formData.buildingName}
                onChange={handleInputChange}
                onFocus={handleFocusBuildingName}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g., Tower A, Block 1"
                disabled={loading}
                focused={focusedInput === 'buildingName'}
              />

              <InputField
                label="Number of Flats"
                name="numberOfFlats"
                type="number"
                value={formData.numberOfFlats}
                onChange={handleInputChange}
                onFocus={handleFocusNumberOfFlats}
                onBlur={handleBlur}
                onKeyDown={handleKeyDown}
                placeholder="e.g., 50"
                min="1"
                disabled={loading}
                focused={focusedInput === 'numberOfFlats'}
                helpText="Sets the initial capacity of the building"
              />

              <div className="flex flex-col sm:flex-row gap-2 sm:gap-3 pt-4 sm:pt-6">
                <button
                  type="button"
                  onClick={onClose}
                  className="button-hover w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-white/5 border border-white/10 text-gray-300 font-semibold hover:bg-white/10 text-sm sm:text-base"
                  disabled={loading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  onClick={handleSubmit}
                  className="button-hover w-full sm:flex-1 px-4 sm:px-6 py-2.5 sm:py-3.5 rounded-lg sm:rounded-xl bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-white font-semibold shadow-lg disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                  disabled={loading}
                >
                  <span className="relative z-10 flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="loading-pulse">Processing...</span>
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        {buttonText}
                      </>
                    )}
                  </span>
                </button>
              </div>
            </div>
          </div>

          <div className="absolute bottom-0 left-0 right-0 h-16 sm:h-24 bg-gradient-to-t from-blue-500/10 to-transparent pointer-events-none" />
        </div>
      </div>
    </>
  );
};

export default BuildingModal;