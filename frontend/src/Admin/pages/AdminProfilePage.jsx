import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { toast } from 'react-hot-toast';
import { getAdminProfile, updateAdminProfile, changeAdminPassword } from '../../lib/adminService';
import { setAdmin } from '../../redux/admin/adminSlice';

// Memoized Icon Components - prevents unnecessary re-renders
const SaveIcon = React.memo(() => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V3" />
  </svg>
));

const XIcon = React.memo(() => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
));

const PencilIcon = React.memo(() => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
  </svg>
));

const LockIcon = React.memo(() => (
  <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
));

const SparklesIcon = React.memo(() => (
  <svg className="w-5 h-5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
));

// Memoized Background Component
const AnimatedBackground = React.memo(() => (
  <>
    <div className="fixed inset-0 pointer-events-none" style={{ willChange: 'opacity' }}>
      <div className="absolute top-10 sm:top-20 left-5 sm:left-10 w-40 sm:w-72 h-40 sm:h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse" style={{ willChange: 'transform, opacity' }}></div>
      <div className="absolute bottom-10 sm:bottom-20 right-5 sm:right-10 w-48 sm:w-96 h-48 sm:h-96 bg-cyan-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '1s', willChange: 'transform, opacity' }}></div>
      <div className="absolute top-1/2 left-1/2 w-40 sm:w-80 h-40 sm:h-80 bg-indigo-500/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: '2s', willChange: 'transform, opacity' }}></div>
    </div>
    <div className="fixed inset-0 opacity-[0.03] pointer-events-none" style={{
      backgroundImage: 'linear-gradient(0deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent), linear-gradient(90deg, transparent 24%, rgba(255,255,255,.05) 25%, rgba(255,255,255,.05) 26%, transparent 27%, transparent 74%, rgba(255,255,255,.05) 75%, rgba(255,255,255,.05) 76%, transparent 77%, transparent)',
      backgroundSize: '50px 50px'
    }}></div>
  </>
));

// Memoized Loading Component
const LoadingSpinner = React.memo(() => (
  <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex justify-center items-center p-4">
    <div className="text-center">
      <div className="inline-flex items-center justify-center mb-4">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-r-2 border-purple-500" style={{ willChange: 'transform' }}></div>
      </div>
      <p className="text-white/60 text-base sm:text-lg tracking-wider">Loading Admin Profile...</p>
    </div>
  </div>
));

// Memoized FormField Component
const FormField = React.memo(({ field, label, value, onChange, editMode, type = 'text' }) => (
  <div className="group/field">
    <label className="block text-xs sm:text-sm font-semibold text-purple-300 mb-2 sm:mb-3 uppercase tracking-wider">
      {label}
    </label>
    {editMode ? (
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-purple-500/50 to-cyan-500/50 rounded-lg sm:rounded-xl opacity-0 group-hover/field:opacity-20 blur-lg transition-opacity duration-300" style={{ willChange: 'opacity' }}></div>
        <input
          type={type}
          name={field}
          value={value}
          onChange={onChange}
          className="relative w-full px-3 sm:px-5 py-2.5 sm:py-4 text-sm sm:text-base bg-white/5 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-purple-500/50 focus:border-transparent transition-all duration-300 hover:border-white/40"
          style={{ willChange: 'border-color' }}
        />
      </div>
    ) : (
      <div className="relative px-3 sm:px-5 py-2.5 sm:py-4 text-sm sm:text-base bg-gradient-to-br from-white/10 to-white/5 border border-white/10 rounded-lg sm:rounded-xl text-white/90 backdrop-blur-md group-hover/field:border-white/30 group-hover/field:from-white/20 transition-all duration-300 break-words" style={{ willChange: 'border-color' }}>
        {value}
      </div>
    )}
  </div>
));

// Memoized PasswordField Component
const PasswordField = React.memo(({ field, label, value, onChange }) => (
  <div className="group/field">
    <label className="block text-xs sm:text-sm font-semibold text-orange-300 mb-2 sm:mb-3 uppercase tracking-wider">
      {label}
    </label>
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-r from-orange-500/50 to-red-500/50 rounded-lg sm:rounded-xl opacity-0 group-hover/field:opacity-20 blur-lg transition-opacity duration-300" style={{ willChange: 'opacity' }}></div>
      <input
        type="password"
        name={field}
        value={value}
        onChange={onChange}
        className="relative w-full px-3 sm:px-5 py-2.5 sm:py-4 text-sm sm:text-base bg-white/5 border border-white/20 rounded-lg sm:rounded-xl text-white placeholder-white/30 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-orange-500/50 focus:border-transparent transition-all duration-300 hover:border-white/40"
        style={{ willChange: 'border-color' }}
      />
    </div>
  </div>
));

const AdminProfilePage = () => {
  const { admin } = useSelector((state) => state.admin);
  const dispatch = useDispatch();

  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState({
    fullName: '',
    email: '',
    profileImage: '',
  });
  const [editMode, setEditMode] = useState(false);
  const [tempProfileImage, setTempProfileImage] = useState(null);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmNewPassword: '',
  });
  const [passwordChangeMode, setPasswordChangeMode] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const res = await getAdminProfile();
        if (res.success) {
          setProfileData({
            fullName: res.admin.fullName,
            email: res.admin.email,
            profileImage: res.admin.profileImage,
          });
        } else {
          toast.error(res.message);
        }
      } catch (error) {
        console.error("Failed to fetch admin profile:", error);
        toast.error("Failed to fetch profile.");
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, []);

  // Memoized callbacks prevent function recreation on every render
  const handleProfileChange = useCallback((e) => {
    const { name, value } = e.target;
    setProfileData(prev => ({ ...prev, [name]: value }));
  }, []);

  const handleImageChange = useCallback((e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setTempProfileImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleProfileSave = useCallback(async () => {
    try {
      const dataToUpdate = {
        fullName: profileData.fullName,
        email: profileData.email,
        profileImage: tempProfileImage || profileData.profileImage,
      };
      const res = await updateAdminProfile(dataToUpdate);
      if (res.success) {
        toast.success(res.message);
        dispatch(setAdmin(res.admin));
        setProfileData({
          fullName: res.admin.fullName,
          email: res.admin.email,
          profileImage: res.admin.profileImage,
        });
        setTempProfileImage(null);
        setEditMode(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Failed to update admin profile:", error);
      toast.error("Failed to update profile.");
    }
  }, [profileData, tempProfileImage, dispatch]);

  const handleCancelEdit = useCallback(() => {
    setEditMode(false);
    setTempProfileImage(null);
  }, []);

  const handlePasswordChange = useCallback((e) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));
  }, []);

  const handlePasswordSubmit = useCallback(async (e) => {
    e.preventDefault();
    try {
      const res = await changeAdminPassword(passwordForm);
      if (res.success) {
        toast.success(res.message);
        setPasswordForm({
          currentPassword: '',
          newPassword: '',
          confirmNewPassword: '',
        });
        setPasswordChangeMode(false);
      } else {
        toast.error(res.message);
      }
    } catch (error) {
      console.error("Failed to change password:", error);
      toast.error("Failed to change password.");
    }
  }, [passwordForm]);

  const handleCancelPassword = useCallback(() => {
    setPasswordChangeMode(false);
  }, []);

  const handleEditMode = useCallback(() => {
    setEditMode(true);
  }, []);

  const handlePasswordMode = useCallback(() => {
    setPasswordChangeMode(true);
  }, []);

  // Memoized computed values prevent recalculation
  const displayImage = useMemo(() =>
    tempProfileImage || profileData.profileImage,
    [tempProfileImage, profileData.profileImage]
  );

  // Memoized configuration arrays
  const formFields = useMemo(() => [
    { field: 'fullName', label: 'Full Name', type: 'text' },
    { field: 'email', label: 'Email Address', type: 'email' }
  ], []);

  const passwordFields = useMemo(() => [
    { field: 'currentPassword', label: 'Current Password' },
    { field: 'newPassword', label: 'New Password' },
    { field: 'confirmNewPassword', label: 'Confirm New Password' }
  ], []);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 overflow-hidden relative p-3 sm:p-4 md:p-8 pt-20 sm:pt-24 md:pt-32">
      <AnimatedBackground />

      <div className="relative z-10 min-h-screen p-3 xs:p-4 sm:p-6 lg:p-8 flex justify-center">
        <div className="w-full max-w-5xl">
          {/* Header */}
          <div className="mb-8 sm:mb-12 text-center px-2">
            <div className="inline-flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
              <div className="p-2 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-br from-purple-500/20 to-cyan-500/20 backdrop-blur-md border border-purple-500/30">
                <SparklesIcon />
              </div>
              <h1 className="text-3xl xs:text-4xl sm:text-5xl lg:text-6xl font-black bg-gradient-to-r from-purple-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent leading-tight">
                Admin Control
              </h1>
            </div>
            <p className="text-purple-300/60 text-xs xs:text-sm sm:text-base tracking-wider">Manage your profile & security</p>
          </div>

          {/* Main container */}
          <div className="space-y-4 sm:space-y-6 px-2 sm:px-0">
            {/* Profile Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 via-cyan-500/20 to-purple-500/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>

              <div className="relative bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 lg:p-10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>

                <div className="relative z-10">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                    <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-purple-400 to-cyan-400 rounded-full"></div>
                    <span>Profile Information</span>
                  </h2>

                  {/* Avatar Section */}
                  <div className="flex justify-center mb-6 sm:mb-10">
                    <div className="relative group/avatar">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-2xl sm:rounded-3xl blur-2xl opacity-50 group-hover/avatar:opacity-100 transition-all duration-500" style={{ willChange: 'opacity' }}></div>
                      <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-2xl sm:rounded-3xl overflow-hidden border-2 border-white/20 backdrop-blur-xl bg-white/5 flex items-center justify-center transform transition-transform duration-300 hover:scale-105" style={{ willChange: 'transform' }}>
                        <img
                          src={displayImage}
                          alt="Admin Avatar"
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                        />
                        {editMode && (
                          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity" style={{ willChange: 'opacity' }}>
                            <label className="cursor-pointer text-white text-xs sm:text-sm font-semibold text-center px-2">
                              <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
                              <span>Change Photo</span>
                            </label>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Form Fields */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-10">
                    {formFields.map(({ field, label, type }) => (
                      <FormField
                        key={field}
                        field={field}
                        label={label}
                        value={profileData[field]}
                        onChange={handleProfileChange}
                        editMode={editMode}
                        type={type}
                      />
                    ))}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-center sm:justify-end gap-2 sm:gap-4 flex-wrap">
                    {editMode ? (
                      <>
                        <button
                          onClick={handleProfileSave}
                          className="group/btn relative px-4 sm:px-8 py-2 sm:py-3 font-semibold text-white text-sm sm:text-base overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300 w-full sm:w-auto"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-green-500 to-cyan-500 rounded-lg sm:rounded-xl transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-green-500/50" style={{ willChange: 'box-shadow' }}></div>
                          <div className="absolute inset-0.5 bg-slate-900 rounded-lg sm:rounded-xl"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <SaveIcon />
                            <span>Save Profile</span>
                          </div>
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="group/btn px-4 sm:px-8 py-2 sm:py-3 font-semibold text-white text-sm sm:text-base rounded-lg sm:rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all duration-300 w-full sm:w-auto"
                          style={{ willChange: 'background-color, border-color' }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <XIcon />
                            <span>Cancel</span>
                          </div>
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={handleEditMode}
                        className="group/btn relative px-4 sm:px-8 py-2 sm:py-3 font-semibold text-white text-sm sm:text-base overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300 w-full sm:w-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-lg sm:rounded-xl transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-purple-500/50" style={{ willChange: 'box-shadow' }}></div>
                        <div className="absolute inset-0.5 bg-slate-900 rounded-lg sm:rounded-xl"></div>
                        <div className="relative flex items-center justify-center gap-2">
                          <PencilIcon />
                          <span>Edit Profile</span>
                        </div>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Password Card */}
            <div className="group relative">
              <div className="absolute inset-0 bg-gradient-to-r from-orange-500/20 via-red-500/20 to-orange-500/20 rounded-2xl sm:rounded-3xl blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>

              <div className="relative bg-white/5 backdrop-blur-2xl rounded-2xl sm:rounded-3xl border border-white/10 p-4 sm:p-6 lg:p-10 shadow-2xl overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" style={{ willChange: 'opacity' }}></div>

                <div className="relative z-10">
                  <h2 className="text-lg sm:text-2xl lg:text-3xl font-bold text-white mb-6 sm:mb-8 flex items-center gap-2 sm:gap-3">
                    <div className="w-1 h-6 sm:h-8 bg-gradient-to-b from-orange-400 to-red-400 rounded-full"></div>
                    <span>Security & Password</span>
                  </h2>

                  {passwordChangeMode ? (
                    <div className="space-y-4 sm:space-y-6">
                      {passwordFields.map(({ field, label }) => (
                        <PasswordField
                          key={field}
                          field={field}
                          label={label}
                          value={passwordForm[field]}
                          onChange={handlePasswordChange}
                        />
                      ))}

                      <div className="flex justify-center sm:justify-end gap-2 sm:gap-4 pt-2 sm:pt-4 flex-wrap">
                        <button
                          onClick={handlePasswordSubmit}
                          className="group/btn relative px-4 sm:px-8 py-2 sm:py-3 font-semibold text-white text-sm sm:text-base overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300 w-full sm:w-auto"
                        >
                          <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg sm:rounded-xl transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-orange-500/50" style={{ willChange: 'box-shadow' }}></div>
                          <div className="absolute inset-0.5 bg-slate-900 rounded-lg sm:rounded-xl"></div>
                          <div className="relative flex items-center justify-center gap-2">
                            <SaveIcon />
                            <span>Update Password</span>
                          </div>
                        </button>
                        <button
                          onClick={handleCancelPassword}
                          className="group/btn px-4 sm:px-8 py-2 sm:py-3 font-semibold text-white text-sm sm:text-base rounded-lg sm:rounded-xl border border-white/20 backdrop-blur-md hover:bg-white/10 hover:border-white/40 transition-all duration-300 w-full sm:w-auto"
                          style={{ willChange: 'background-color, border-color' }}
                        >
                          <div className="flex items-center justify-center gap-2">
                            <XIcon />
                            <span>Cancel</span>
                          </div>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-center sm:justify-end">
                      <button
                        onClick={handlePasswordMode}
                        className="group/btn relative px-4 sm:px-8 py-2 sm:py-3 font-semibold text-white text-sm sm:text-base overflow-hidden rounded-lg sm:rounded-xl transition-all duration-300 w-full sm:w-auto"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg sm:rounded-xl transition-all duration-300 group-hover/btn:shadow-2xl group-hover/btn:shadow-orange-500/50" style={{ willChange: 'box-shadow' }}></div>
                        <div className="absolute inset-0.5 bg-slate-900 rounded-lg sm:rounded-xl"></div>
                        <div className="relative flex items-center justify-center gap-2">
                          <LockIcon />
                          <span>Change Password</span>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Footer accent */}
          <div className="mt-8 sm:mt-16 text-center px-2">
            <p className="text-white/30 text-xs sm:text-sm tracking-widest">SECURED & ENCRYPTED ADMIN PANEL</p>
          </div>
        </div>
      </div>

      {/* Floating accent lines */}
      <svg className="fixed bottom-0 right-0 w-48 sm:w-96 h-48 sm:h-96 opacity-10 pointer-events-none" viewBox="0 0 200 200">
        <path d="M0,100 Q50,50 100,100 T200,100" stroke="url(#grad)" strokeWidth="2" fill="none" />
        <defs>
          <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#a78bfa" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
};

export default AdminProfilePage;