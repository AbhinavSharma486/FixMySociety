import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Camera, Mail, User, Trash2, Lock, EyeOff, Eye, X, Home, Hash, LoaderCircle, Shield, Calendar } from "lucide-react";
import { deleteProfile, updateProfile } from '../redux/user/userSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { currentUser, isUpdatingProfile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log(currentUser);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];

    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = () => {
    if (newPassword && newPassword.length < 6) {
      return toast.error("Password must be at least 6 characters long");
    }

    const updateData = {
      profilePic: selectedImg || currentUser?.profilePic,
      newPassword: newPassword || undefined
    };

    dispatch(updateProfile(updateData));

    setNewPassword("");
    setSelectedImg(null);
  };

  const handleDeleteProfile = () => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }

    setShowDeleteModal(false);
    dispatch(deleteProfile(currentUser._id, navigate));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 py-6 sm:py-12 px-3 sm:px-6 lg:px-8 p-3 sm:p-6 pt-20 sm:pt-24 pb-12">
      {/* Header Section */}
      <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
        <div className="text-center">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl mb-4 sm:mb-6 mx-auto shadow-xl">
            <Shield className="w-8 h-8 sm:w-10 sm:h-10 text-blue-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-3 sm:mb-4">
            Profile Settings
          </h1>
          <p className="text-base sm:text-lg text-gray-600/80 max-w-2xl mx-auto leading-relaxed">
            Manage your personal information, security settings, and account preferences
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-4xl mx-auto">
        <div className="bg-white/90 backdrop-blur-2xl border border-white/30 shadow-2xl rounded-4xl overflow-hidden">

          {/* Profile Header */}
          <div className="relative bg-gradient-to-r from-blue-500/10 via-purple-500/10 to-pink-500/10 px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 via-purple-100/20 to-pink-100/20"></div>

            {/* Avatar Section */}
            <div className="relative z-10 flex flex-col items-center">
              <div className="relative group mb-6">
                <div className="absolute -inset-2 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full blur-lg opacity-20 group-hover:opacity-40 transition-all duration-700"></div>
                <div className="absolute -inset-1 bg-gradient-to-br from-blue-300 to-purple-500 rounded-full blur opacity-30 group-hover:opacity-50 transition-all duration-500"></div>
                <div className="relative">
                  <img
                    src={selectedImg || currentUser?.profilePic}
                    className="size-28 sm:size-32 lg:size-40 xl:size-44 rounded-full object-cover border-4 sm:border-6 border-white shadow-2xl transition-all duration-700 group-hover:scale-110 group-hover:rotate-3"
                    alt="Profile"
                  />
                  <label
                    htmlFor="avatar-upload"
                    className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 bg-gradient-to-br from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 p-3 sm:p-4 rounded-full cursor-pointer transition-all duration-300 shadow-xl hover:shadow-2xl hover:scale-110 group/camera"
                  >
                    <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover/camera:rotate-12" />
                    <input
                      type="file"
                      id="avatar-upload"
                      className="hidden"
                      accept="image/*"
                      onChange={handleImageUpload}
                    />
                  </label>
                </div>
              </div>

              <div className="text-center">
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">
                  {currentUser?.fullName || "User"}
                </h2>
                <p className="text-sm sm:text-base text-gray-600/80 mb-4">
                  {currentUser?.email}
                </p>
                <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/60 backdrop-blur-sm rounded-full border border-white/40 shadow-lg">
                  <Calendar className="w-4 h-4 text-blue-500" />
                  <span className="text-sm font-medium text-gray-700">
                    Member since {currentUser?.createdAt
                      ? new Date(currentUser.createdAt).toLocaleDateString("en-GB")
                      : "N/A"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Form Content */}
          <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

              {/* Left Column - Personal Information */}
              <div className="space-y-6 sm:space-y-8">
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl flex items-center justify-center">
                      <User className="w-4 h-4 text-blue-600" />
                    </div>
                    Personal Information
                  </h3>

                  <div className="space-y-6">
                    {/* Full Name Field */}
                    <div className="space-y-3">
                      <label className="text-sm sm:text-base font-semibold flex items-center gap-2 text-gray-700">
                        <User className="w-4 h-4 text-blue-500" />
                        Full Name
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <User className="h-5 w-5 text-blue-500/70" />
                        </div>
                        <div className="relative w-full py-4 sm:py-5 px-12 border border-gray-200/80 rounded-2xl text-gray-900 text-sm sm:text-base bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-300 font-medium">
                          {currentUser?.fullName}
                        </div>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-3">
                      <label className="text-sm sm:text-base font-semibold flex items-center gap-2 text-gray-700">
                        <Mail className="w-4 h-4 text-blue-500" />
                        Email Address
                      </label>
                      <div className="relative group">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-100/50 to-purple-100/50 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                          <Mail className="h-5 w-5 text-blue-500/70" />
                        </div>
                        <div className="relative w-full py-4 sm:py-5 px-12 border border-gray-200/80 rounded-2xl text-gray-900 text-sm sm:text-base bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:border-blue-300 font-medium">
                          {currentUser?.email}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Security Section */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl flex items-center justify-center">
                      <Lock className="w-4 h-4 text-purple-600" />
                    </div>
                    Security Settings
                  </h3>

                  <div className="space-y-3">
                    <label className="text-sm sm:text-base font-semibold flex items-center gap-2 text-gray-700">
                      <Lock className="w-4 h-4 text-purple-500" />
                      New Password
                    </label>
                    <div className="relative group">
                      <div className="absolute inset-0 bg-gradient-to-r from-purple-100/50 to-pink-100/50 rounded-2xl opacity-0 group-focus-within:opacity-100 transition-all duration-300"></div>
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none z-10">
                        <Lock className="h-5 w-5 text-purple-500/70" />
                      </div>
                      <input
                        type={showPassword ? "text" : "password"}
                        className="relative w-full py-4 sm:py-5 px-12 pr-14 border border-gray-200/80 rounded-2xl focus:outline-none focus:ring-4 focus:ring-purple-400/20 focus:border-purple-400 text-gray-900 placeholder-gray-400/70 text-sm sm:text-base bg-white/80 backdrop-blur-sm shadow-lg transition-all duration-300 hover:shadow-xl hover:border-purple-300 font-medium"
                        placeholder="Enter new password (optional)"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute inset-y-0 right-0 pr-4 flex items-center z-10 group/eye"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff className="h-5 w-5 text-purple-500 transition-all duration-300 group-hover/eye:text-purple-600 group-hover/eye:scale-110" />
                        ) : (
                          <Eye className="h-5 w-5 text-purple-500 transition-all duration-300 group-hover/eye:text-purple-600 group-hover/eye:scale-110" />
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column - Account Information & Actions */}
              <div className="space-y-6 sm:space-y-8">

                {/* Account Information Card */}
                <div>
                  <h3 className="text-xl sm:text-2xl font-semibold text-gray-900 mb-6 flex items-center gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-green-100 to-blue-100 rounded-xl flex items-center justify-center">
                      <Hash className="w-4 h-4 text-green-600" />
                    </div>
                    Account Details
                  </h3>

                  <div className="bg-gradient-to-br from-white/95 to-white/80 backdrop-blur-xl border border-white/40 rounded-3xl p-6 sm:p-8 shadow-xl hover:shadow-2xl transition-all duration-500">
                    <div className="space-y-6">
                      <div className="flex items-center justify-between py-4 border-b border-gray-200/60 group/item hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 rounded-2xl px-4 transition-all duration-300">
                        <span className="text-gray-600 text-sm sm:text-base font-semibold flex items-center gap-3">
                          <Calendar className="w-4 h-4 text-blue-500" />
                          Member Since
                        </span>
                        <span className="text-gray-900 font-bold text-sm sm:text-base">
                          {currentUser?.createdAt
                            ? new Date(currentUser.createdAt).toLocaleDateString("en-GB")
                            : "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-4 border-b border-gray-200/60 group/item hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 rounded-2xl px-4 transition-all duration-300">
                        <span className="text-gray-600 flex items-center gap-3 text-sm sm:text-base font-semibold">
                          <Home className="w-4 h-4 text-blue-500" />
                          Building
                        </span>
                        <span className="text-gray-900 font-bold text-sm sm:text-base">
                          {currentUser?.buildingName || "N/A"}
                        </span>
                      </div>

                      <div className="flex items-center justify-between py-4 hover:bg-gradient-to-r hover:from-blue-50/50 hover:to-purple-50/50 rounded-2xl px-4 transition-all duration-300">
                        <span className="text-gray-600 flex items-center gap-3 text-sm sm:text-base font-semibold">
                          <Hash className="w-4 h-4 text-purple-500" />
                          Flat Number
                        </span>
                        <span className="text-gray-900 font-bold text-sm sm:text-base">
                          {currentUser?.flatNumber || "N/A"}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="space-y-4 sm:space-y-6">
                  <button
                    onClick={handleUpdateProfile}
                    disabled={isUpdatingProfile}
                    className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white py-4 sm:py-5 rounded-2xl transition-all duration-300 text-sm sm:text-base font-bold flex items-center justify-center gap-3 shadow-xl hover:shadow-2xl transform hover:scale-[1.02] disabled:hover:scale-100 disabled:cursor-not-allowed group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    {isUpdatingProfile ? (
                      <>
                        <LoaderCircle className="w-6 h-6 animate-spin" />
                        <span>Updating Profile...</span>
                      </>
                    ) : (
                      <>
                        <span>Update Profile</span>
                        <User className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="w-full bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-4 sm:py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 text-sm sm:text-base font-bold shadow-xl hover:shadow-2xl transform hover:scale-[1.02] group relative overflow-hidden"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                    <Trash2 className="w-5 h-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span>Delete Profile</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 z-50 animate-in fade-in duration-300">
          <div className="bg-white/95 backdrop-blur-2xl p-6 sm:p-8 lg:p-10 rounded-4xl shadow-2xl w-full max-w-sm sm:max-w-md lg:max-w-lg border border-white/30 transform animate-in zoom-in-95 duration-300">
            <div className="flex justify-between items-start mb-6 sm:mb-8">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-red-100 to-red-200 rounded-2xl flex items-center justify-center shadow-lg">
                  <Trash2 className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
                </div>
                <div>
                  <h2 className="text-lg sm:text-xl lg:text-2xl text-red-600 font-bold">
                    Confirm Deletion
                  </h2>
                  <p className="text-sm text-gray-500 mt-1">This action is irreversible</p>
                </div>
              </div>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="w-10 h-10 rounded-2xl hover:bg-gray-100 flex items-center justify-center transition-all duration-200 group"
              >
                <X className="w-5 h-5 text-gray-400 group-hover:text-gray-600 transition-colors duration-200" />
              </button>
            </div>

            <div className="mb-8 sm:mb-10">
              <p className="text-sm sm:text-base lg:text-lg text-gray-700 leading-relaxed mb-4">
                Are you sure you want to permanently delete your profile?
              </p>
              <div className="bg-red-50/80 border border-red-200/60 rounded-2xl p-4 sm:p-5">
                <p className="text-xs sm:text-sm text-red-700 font-medium">
                  ⚠️ This action cannot be undone. All your data, settings, and account information will be permanently removed from our servers.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4">
              <button
                className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-4 rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 hover:shadow-lg transform hover:scale-[1.02]"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button
                className="flex-1 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-6 py-4 rounded-2xl text-sm sm:text-base font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] relative overflow-hidden group"
                onClick={handleDeleteProfile}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/20 to-white/0 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>
                Delete Profile
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;