import React, { useState } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Camera, Mail, User, Trash2, Lock, EyeOff, Eye, X } from "lucide-react";
import { deleteProfile, updateProfile } from '../redux/user/userSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [fullName, setFullName] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const { currentUser } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  console.log(currentUser)


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
      fullName: fullName || currentUser?.fullName,
      profilePic: selectedImg || currentUser?.profilePic,
      newPassword: newPassword || undefined
    };

    dispatch(updateProfile(updateData));

    setFullName("");
    setNewPassword("");
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
    <div className="min-h-screen pt-16 pb-8 px-4 sm:px-6">
      <div className="max-w-2xl mx-auto p-4 py-2">
        <div className="bg-base-300 rounded-4xl sm:rounded-4xl p-6 space-y-6 sm:space-y-8 drop-shadow-2xl sm:drop-shadow-4xl">

          <div className="text-center">
            <h1 className="text-xl sm:text-2xl font-semibold">Profile</h1>
            <p className="mt-1 sm:mt-2 text-sm sm:text-base">Your profile information</p>
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <div className="relative">
              <img
                src={selectedImg || currentUser?.profilePic}
                className="size-24 sm:size-32 rounded-full object-cover border-4"
                alt="Profile"
              />
              <label
                htmlFor="avatar-upload"
                className="absolute bottom-0 right-0 bg-base-content hover:scale-105 p-1.5 sm:p-2 rounded-full cursor-pointer transition-all duration-200"
              >
                <Camera className="w-4 h-4 sm:w-5 sm:h-5 text-base-200" />
                <input
                  type="file"
                  id="avatar-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <p className="text-xs sm:text-sm text-center">
              Click the camera icon to update your image
            </p>
          </div>

          <div className="space-y-4 sm:space-y-6">

            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Full Name
              </label>
              <input
                type="text"
                className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5 w-full border border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder={currentUser?.fullName}
              />
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <Mail className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                Email Address
              </label>
              <p className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5 border border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl">
                {currentUser?.email}
              </p>
            </div>

            <div className="space-y-1 sm:space-y-2">
              <label className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                <Lock className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                New Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="text-sm sm:text-base px-3 py-2 sm:px-4 sm:py-2.5 w-full pr-8 sm:pr-10 border border-gray-300 dark:border-gray-700 rounded-xl sm:rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
                <button
                  type="button"
                  className="absolute inset-y-0 right-2 sm:right-3 flex items-center"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="w-4 h-4 sm:w-5 sm:h-5" />
                  ) : (
                    <Eye className="w-4 h-4 sm:w-5 sm:h-5" />
                  )}
                </button>
              </div>
            </div>

          </div>

          <button
            onClick={handleUpdateProfile}
            className="mt-3 sm:mt-4 w-full bg-blue-500 hover:bg-blue-600 text-white py-2 rounded-lg transition-all text-sm sm:text-base"
          >
            Update Profile
          </button>

          <button
            onClick={() => setShowDeleteModal(true)}
            className="mt-3 sm:mt-4 w-full bg-red-500 hover:bg-red-600 text-white py-2 rounded-lg flex items-center justify-center gap-1 sm:gap-2 transition-all text-sm sm:text-base"
          >
            <Trash2 className="w-4 h-4 sm:w-5 sm:h-5" /> Delete Profile
          </button>

          <div className="mt-4 sm:mt-6 bg-base-300 rounded-lg sm:rounded-xl p-4 sm:p-6">
            <h2 className="text-base sm:text-lg font-medium mb-3 sm:mb-4">Account Information</h2>
            <div className="space-y-2 sm:space-y-3 text-xs sm:text-sm">
              <div className="flex items-center justify-between py-1.5 sm:py-2 border-b border-zinc-700">
                <span>Member Since</span>
                <span>
                  {currentUser?.createdAt
                    ? new Date(currentUser.createdAt).toLocaleDateString("en-GB")
                    : "N/A"}
                </span>
              </div>
            </div>
          </div>

        </div>
      </div>

      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
          <div className="bg-white p-4 sm:p-6 rounded-lg shadow-lg w-full max-w-sm sm:max-w-md">
            <div className="flex justify-between items-center">
              <h2 className="text-base sm:text-lg text-red-500 font-bold">Confirm Deletion</h2>
              <button onClick={() => setShowDeleteModal(false)}>
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="mt-3 sm:mt-4 text-xs sm:text-sm text-gray-600">
              Are you sure you want to delete your profile? This action cannot be undone.
            </p>
            <div className="mt-4 sm:mt-6 flex justify-end gap-2 sm:gap-3">
              <button
                className="bg-gray-300 hover:bg-gray-400 text-black px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl sm:rounded-3xl text-xs sm:text-sm"
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>

              <button
                className="bg-red-500 hover:bg-red-600 text-white px-3 py-1.5 sm:px-4 sm:py-2 rounded-2xl sm:rounded-3xl text-xs sm:text-sm"
                onClick={handleDeleteProfile}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;