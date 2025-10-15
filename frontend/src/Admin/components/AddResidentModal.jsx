import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { X, User, Mail, Home, Hash, PlusCircle, Eye, EyeOff } from 'lucide-react';
import ButtonComponent from '../../components/Button';
import { useSelector } from 'react-redux';

const AddResidentModal = ({ isOpen, onClose, buildingId, onSubmit }) => {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    flatNumber: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const { isAddingResident } = useSelector((state) => state.admin);

  useEffect(() => {
    if (!isOpen) {
      setFormData({
        fullName: '',
        email: '',
        flatNumber: '',
        password: '',
      });
      setErrors({});
      setShowPassword(false);
      setFocusedField(null);
    }
  }, [isOpen]);

  const validateForm = useCallback(() => {
    const newErrors = {};
    if (!formData.fullName) newErrors.fullName = 'Full Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    else if (!/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.flatNumber) newErrors.flatNumber = 'Flat Number is required';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 6) newErrors.password = 'Password must be at least 6 characters';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (validateForm()) {
      onSubmit({ ...formData, buildingId });
    }
  }, [validateForm, formData, buildingId, onSubmit]);

  const togglePassword = useCallback(() => {
    setShowPassword(prev => !prev);
  }, []);

  const handleFocus = useCallback((field) => {
    setFocusedField(field);
  }, []);

  const handleBlur = useCallback(() => {
    setFocusedField(null);
  }, []);

  // Memoized style objects to prevent recalculation
  const backdropStyle = useMemo(() => ({
    background: 'radial-gradient(circle at 20% 30%, rgba(59, 130, 246, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 70%, rgba(168, 85, 247, 0.15) 0%, transparent 50%), rgba(0, 0, 0, 0.85)'
  }), []);

  const cardStyle = useMemo(() => ({
    background: 'linear-gradient(135deg, rgba(17, 24, 39, 0.95) 0%, rgba(31, 41, 55, 0.92) 50%, rgba(17, 24, 39, 0.95) 100%)',
    boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.5), inset 0 1px 0 0 rgba(255, 255, 255, 0.05)'
  }), []);

  const borderAnimStyle = useMemo(() => ({
    background: 'conic-gradient(from 0deg, transparent 0deg, rgba(59, 130, 246, 0.4) 60deg, transparent 120deg, rgba(168, 85, 247, 0.4) 180deg, transparent 240deg, rgba(236, 72, 153, 0.4) 300deg, transparent 360deg)',
    filter: 'blur(8px)'
  }), []);

  const headerStyle = useMemo(() => ({
    background: 'linear-gradient(180deg, rgba(30, 41, 59, 0.4) 0%, transparent 100%)'
  }), []);

  const titleStyle = useMemo(() => ({
    backgroundSize: '200% auto',
    textShadow: '0 0 30px rgba(147, 51, 234, 0.3)'
  }), []);

  const closeButtonStyle = useMemo(() => ({
    background: 'rgba(17, 24, 39, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.1)',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)'
  }), []);

  const closeButtonShadow = useMemo(() => ({
    boxShadow: '0 0 20px rgba(239, 68, 68, 0.4)'
  }), []);

  // Memoized input styles generator
  const getInputStyle = useCallback((fieldName, hasError) => {
    const isFocused = focusedField === fieldName;
    const baseStyles = {
      WebkitBoxShadow: "0 0 0 1000px transparent inset !important",
      WebkitTextFillColor: 'white !important',
      backdropFilter: 'blur(12px)'
    };

    if (hasError) {
      return {
        ...baseStyles,
        background: 'linear-gradient(135deg, rgba(127, 29, 29, 0.2) 0%, rgba(17, 24, 39, 0.4) 100%)',
        border: '1px solid rgba(239, 68, 68, 0.3)',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
      };
    }

    const focusColors = {
      fullName: {
        bg: 'linear-gradient(135deg, rgba(30, 58, 138, 0.2) 0%, rgba(17, 24, 39, 0.4) 100%)',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        shadow: '0 0 0 4px rgba(59, 130, 246, 0.1), 0 8px 24px rgba(59, 130, 246, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      },
      email: {
        bg: 'linear-gradient(135deg, rgba(88, 28, 135, 0.2) 0%, rgba(17, 24, 39, 0.4) 100%)',
        border: '1px solid rgba(168, 85, 247, 0.4)',
        shadow: '0 0 0 4px rgba(168, 85, 247, 0.1), 0 8px 24px rgba(168, 85, 247, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      },
      flatNumber: {
        bg: 'linear-gradient(135deg, rgba(131, 24, 67, 0.2) 0%, rgba(17, 24, 39, 0.4) 100%)',
        border: '1px solid rgba(236, 72, 153, 0.4)',
        shadow: '0 0 0 4px rgba(236, 72, 153, 0.1), 0 8px 24px rgba(236, 72, 153, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      },
      password: {
        bg: 'linear-gradient(135deg, rgba(8, 145, 178, 0.2) 0%, rgba(17, 24, 39, 0.4) 100%)',
        border: '1px solid rgba(6, 182, 212, 0.4)',
        shadow: '0 0 0 4px rgba(6, 182, 212, 0.1), 0 8px 24px rgba(6, 182, 212, 0.15), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      }
    };

    if (isFocused && focusColors[fieldName]) {
      return {
        ...baseStyles,
        background: focusColors[fieldName].bg,
        border: focusColors[fieldName].border,
        boxShadow: focusColors[fieldName].shadow
      };
    }

    return {
      ...baseStyles,
      background: 'rgba(17, 24, 39, 0.4)',
      border: '1px solid rgba(255, 255, 255, 0.08)',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.03)'
    };
  }, [focusedField]);

  const getFocusGlowStyle = useCallback((fieldName) => {
    const colors = {
      fullName: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.05) 100%)',
      email: 'linear-gradient(135deg, rgba(168, 85, 247, 0.1) 0%, rgba(236, 72, 153, 0.05) 100%)',
      flatNumber: 'linear-gradient(135deg, rgba(236, 72, 153, 0.1) 0%, rgba(219, 39, 119, 0.05) 100%)',
      password: 'linear-gradient(135deg, rgba(6, 182, 212, 0.1) 0%, rgba(14, 165, 233, 0.05) 100%)'
    };
    return { background: colors[fieldName] || '' };
  }, []);

  const getBorderLightStyle = useCallback((fieldName) => {
    const colors = {
      fullName: 'linear-gradient(90deg, transparent, rgba(59, 130, 246, 0.6), transparent)',
      email: 'linear-gradient(90deg, transparent, rgba(168, 85, 247, 0.6), transparent)',
      flatNumber: 'linear-gradient(90deg, transparent, rgba(236, 72, 153, 0.6), transparent)',
      password: 'linear-gradient(90deg, transparent, rgba(6, 182, 212, 0.6), transparent)'
    };
    return {
      background: colors[fieldName] || '',
      width: '100%',
      height: '2px',
      top: 0
    };
  }, []);

  const eyeButtonStyle = useMemo(() => ({
    background: 'rgba(17, 24, 39, 0.6)',
    border: '1px solid rgba(255, 255, 255, 0.08)'
  }), []);

  // Memoized field configurations
  const fieldConfigs = useMemo(() => [
    {
      name: 'fullName',
      label: 'Full Name',
      icon: User,
      placeholder: 'John Doe',
      type: 'text',
      color: 'blue'
    },
    {
      name: 'email',
      label: 'Email Address',
      icon: Mail,
      placeholder: 'john.doe@example.com',
      type: 'email',
      color: 'purple'
    },
    {
      name: 'flatNumber',
      label: 'Flat Number',
      icon: Home,
      placeholder: 'A-101',
      type: 'text',
      color: 'pink'
    },
    {
      name: 'password',
      label: 'Password (initial)',
      icon: Hash,
      placeholder: '••••••••',
      type: showPassword ? 'text' : 'password',
      color: 'cyan',
      hasToggle: true
    }
  ], [showPassword]);

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 z-[999] flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div
          className="absolute inset-0 backdrop-blur-2xl animate-fadeIn"
          onClick={onClose}
          style={backdropStyle}
        />

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[10%] left-[15%] w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-floatSlow will-change-transform" />
          <div className="absolute top-[60%] right-[10%] w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-floatMedium will-change-transform" />
          <div className="absolute bottom-[20%] left-[40%] w-80 h-80 bg-pink-500/10 rounded-full blur-3xl animate-floatFast will-change-transform" />
          <div className="absolute top-[40%] right-[30%] w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl animate-floatReverse will-change-transform" />
        </div>

        <div className="relative w-full max-w-md lg:max-w-lg animate-modalSlideIn will-change-transform">
          <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-3xl blur-2xl opacity-30 animate-pulseGlow will-change-transform" />
          <div className="absolute -inset-1 bg-gradient-to-br from-cyan-400/20 via-blue-500/20 to-purple-600/20 rounded-3xl blur-xl opacity-40" />

          <div className="relative backdrop-blur-3xl rounded-3xl overflow-hidden shadow-2xl border border-white/10" style={cardStyle}>
            <div className="absolute inset-0 opacity-40 pointer-events-none overflow-hidden rounded-3xl">
              <div className="absolute inset-0 animate-rotateBorder will-change-transform" style={borderAnimStyle} />
            </div>

            <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />

            <div className="relative p-5 sm:p-6 lg:p-8 pb-4 border-b border-white/5" style={headerStyle}>
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-2 flex-1">
                  <div>
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-gradientFlow"
                      style={titleStyle}>
                      Add New Resident
                    </h2>
                    <div className="h-0.5 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 rounded-full mt-1 animate-expandWidth" />
                  </div>
                  <p className="text-gray-400 text-xs sm:text-sm flex items-center gap-2">
                    <span className="inline-block w-1.5 h-1.5 bg-gradient-to-r from-blue-400 to-purple-400 rounded-full animate-pulse" />
                    Create a new resident account
                  </p>
                </div>

                <button
                  onClick={onClose}
                  className="group relative p-2 sm:p-2.5 rounded-xl transition-all duration-500 hover:scale-110 flex-shrink-0 will-change-transform"
                  style={closeButtonStyle}>
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-red-500/0 to-pink-500/0 group-hover:from-red-500/20 group-hover:to-pink-500/20 transition-all duration-500" />
                  <X className="w-5 h-5 text-gray-400 group-hover:text-white transition-all duration-300 group-hover:rotate-90 relative z-10 will-change-transform" />
                  <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={closeButtonShadow} />
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="p-5 sm:p-6 lg:p-8 space-y-5 sm:space-y-6">
              {fieldConfigs.map(({ name, label, icon: Icon, placeholder, type, color, hasToggle }) => (
                <div key={name} className="space-y-2">
                  <label htmlFor={name} className="flex items-center gap-2 text-xs sm:text-sm font-medium text-gray-300 ml-1">
                    <span className={`transition-all duration-300 ${focusedField === name ? `text-${color}-400` : ''}`}>{label}</span>
                    {focusedField === name && (
                      <span className={`inline-block w-1 h-1 bg-${color}-400 rounded-full animate-ping`} />
                    )}
                  </label>
                  <div className="relative">
                    <div className={`absolute left-3 sm:left-4 top-1/2 -translate-y-1/2 transition-all duration-500 z-10 ${focusedField === name ? `text-${color}-400 scale-110 rotate-12` : 'text-gray-500 scale-100 rotate-0'} will-change-transform`}>
                      <div className="relative">
                        <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
                        {focusedField === name && (
                          <div className={`absolute inset-0 bg-${color}-400/30 rounded-full blur-md animate-ping`} />
                        )}
                      </div>
                    </div>

                    <div className="relative">
                      <input
                        type={type}
                        id={name}
                        name={name}
                        value={formData[name]}
                        onChange={handleChange}
                        onFocus={() => handleFocus(name)}
                        onBlur={handleBlur}
                        className={`w-full py-3 sm:py-3.5 pl-10 sm:pl-12 ${hasToggle ? 'pr-12 sm:pr-14' : 'pr-4'} rounded-2xl focus:outline-none text-white placeholder-gray-500 text-sm sm:text-base transition-all duration-500 relative z-10`}
                        placeholder={placeholder}
                        style={getInputStyle(name, errors[name])}
                      />

                      {hasToggle && (
                        <button
                          type="button"
                          onClick={togglePassword}
                          className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-all duration-300 group/eye z-20"
                          aria-label="Toggle Password Visibility"
                          style={eyeButtonStyle}>
                          <div className="absolute inset-0 rounded-lg bg-cyan-500/0 group-hover/eye:bg-cyan-500/10 transition-all duration-300" />
                          {showPassword ? (
                            <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover/eye:text-cyan-400 transition-all duration-300 relative z-10" />
                          ) : (
                            <Eye className="w-4 h-4 sm:w-5 sm:h-5 text-gray-400 group-hover/eye:text-cyan-400 transition-all duration-300 relative z-10" />
                          )}
                        </button>
                      )}

                      {focusedField === name && (
                        <div className="absolute inset-0 rounded-2xl pointer-events-none animate-focusGlow" style={getFocusGlowStyle(name)} />
                      )}
                    </div>

                    {focusedField === name && (
                      <div className="absolute inset-0 rounded-2xl pointer-events-none overflow-hidden">
                        <div className="absolute inset-0 animate-borderLight" style={getBorderLightStyle(name)} />
                      </div>
                    )}
                  </div>

                  {errors[name] && (
                    <div className="flex items-center gap-2 ml-1 animate-slideIn">
                      <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-500/10 border border-red-500/20">
                        <span className="inline-block w-1.5 h-1.5 bg-red-400 rounded-full animate-pulse" />
                        <p className="text-red-400 text-xs">{errors[name]}</p>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              <div className="pt-3 sm:pt-4">
                <ButtonComponent
                  buttonText={isAddingResident ? "Adding Resident..." : "Add Resident"}
                  type="submit"
                  icon={<PlusCircle className="w-5 h-5" />}
                  loading={isAddingResident}
                />
              </div>
            </form>

            <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          </div>
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from { 
            opacity: 0;
          }
          to { 
            opacity: 1;
          }
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: scale(0.92) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes floatSlow {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.1;
          }
          33% { 
            transform: translate(40px, -40px) scale(1.15);
            opacity: 0.15;
          }
          66% { 
            transform: translate(-30px, 30px) scale(0.9);
            opacity: 0.08;
          }
        }

        @keyframes floatMedium {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.1;
          }
          50% { 
            transform: translate(-50px, -50px) scale(1.2) rotate(180deg);
            opacity: 0.15;
          }
        }

        @keyframes floatFast {
          0%, 100% { 
            transform: translate(0, 0) scale(1);
            opacity: 0.1;
          }
          25% { 
            transform: translate(30px, -30px) scale(1.1);
            opacity: 0.12;
          }
          50% { 
            transform: translate(-20px, 40px) scale(0.95);
            opacity: 0.08;
          }
          75% { 
            transform: translate(40px, 20px) scale(1.05);
            opacity: 0.14;
          }
        }

        @keyframes floatReverse {
          0%, 100% { 
            transform: translate(0, 0) scale(1) rotate(0deg);
            opacity: 0.1;
          }
          33% { 
            transform: translate(-35px, 35px) scale(1.12) rotate(-120deg);
            opacity: 0.13;
          }
          66% { 
            transform: translate(25px, -25px) scale(0.92) rotate(-240deg);
            opacity: 0.09;
          }
        }

        @keyframes rotateBorder {
          0% { 
            transform: rotate(0deg);
          }
          100% { 
            transform: rotate(360deg);
          }
        }

        @keyframes pulseGlow {
          0%, 100% { 
            opacity: 0.3;
          }
          50% { 
            opacity: 0.5;
          }
        }

        @keyframes gradientFlow {
          0% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
          100% {
            background-position: 0% 50%;
          }
        }

        @keyframes expandWidth {
          from {
            width: 0%;
            opacity: 0;
          }
          to {
            width: 100%;
            opacity: 1;
          }
        }

        @keyframes focusGlow {
          0%, 100% { 
            opacity: 0.8;
          }
          50% { 
            opacity: 1;
          }
        }

        @keyframes borderLight {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(200%);
          }
        }

        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(-8px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-modalSlideIn {
          animation: modalSlideIn 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-floatSlow {
          animation: floatSlow 12s ease-in-out infinite;
        }

        .animate-floatMedium {
          animation: floatMedium 15s ease-in-out infinite;
        }

        .animate-floatFast {
          animation: floatFast 8s ease-in-out infinite;
        }

        .animate-floatReverse {
          animation: floatReverse 14s ease-in-out infinite;
        }

        .animate-rotateBorder {
          animation: rotateBorder 8s linear infinite;
        }

        .animate-pulseGlow {
          animation: pulseGlow 3s ease-in-out infinite;
        }

        .animate-gradientFlow {
          animation: gradientFlow 4s ease-in-out infinite;
        }

        .animate-expandWidth {
          animation: expandWidth 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .animate-focusGlow {
          animation: focusGlow 2s ease-in-out infinite;
        }

        .animate-borderLight {
          animation: borderLight 2s ease-in-out infinite;
        }

        .animate-slideIn {
          animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .will-change-transform {
          will-change: transform;
        }

        form::-webkit-scrollbar {
          width: 6px;
        }

        form::-webkit-scrollbar-track {
          background: rgba(17, 24, 39, 0.4);
          border-radius: 10px;
        }

        form::-webkit-scrollbar-thumb {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.5) 0%, rgba(147, 51, 234, 0.5) 100%);
          border-radius: 10px;
        }

        form::-webkit-scrollbar-thumb:hover {
          background: linear-gradient(180deg, rgba(59, 130, 246, 0.7) 0%, rgba(147, 51, 234, 0.7) 100%);
        }

        @media (max-width: 640px) {
          .animate-modalSlideIn {
            animation: modalSlideIn 0.5s cubic-bezier(0.16, 1, 0.3, 1);
          }
        }

        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus {
          -webkit-box-shadow: 0 0 0 1000px transparent inset !important;
          -webkit-text-fill-color: white !important;
          transition: background-color 5000s ease-in-out 0s;
        }

        * {
          -webkit-tap-highlight-color: transparent;
        }
      `}</style>
    </>
  );
};

export default AddResidentModal;