import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Camera, Mail, User, Trash2, Lock, EyeOff, Eye, X, Home, Hash, LoaderCircle, Shield, Calendar, Sparkles, Zap } from "lucide-react";
import { deleteProfile, updateProfile } from '../redux/user/userSlice';
import toast from 'react-hot-toast';

const ProfilePage = () => {
  const [selectedImg, setSelectedImg] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isHovering, setIsHovering] = useState(false);
  const { currentUser, isUpdatingProfile } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Throttled mouse move handler for better performance
  useEffect(() => {
    let rafId = null;
    let lastUpdate = 0;
    const throttleMs = 16; // ~60fps

    const handleMouseMove = (e) => {
      const now = Date.now();
      if (now - lastUpdate < throttleMs) return;

      if (rafId) return;

      rafId = requestAnimationFrame(() => {
        setMousePosition({ x: e.clientX, y: e.clientY });
        lastUpdate = now;
        rafId = null;
      });
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, []);

  // Memoized image upload handler
  const handleImageUpload = useCallback((event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setSelectedImg(reader.result);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  // Memoized update profile handler
  const handleUpdateProfile = useCallback(() => {
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
  }, [newPassword, selectedImg, currentUser?.profilePic, dispatch]);

  // Memoized delete profile handler
  const handleDeleteProfile = useCallback(() => {
    if (!currentUser) {
      toast.error("User not found");
      return;
    }
    setShowDeleteModal(false);
    dispatch(deleteProfile(currentUser._id, navigate));
  }, [currentUser, dispatch, navigate]);

  // Memoized toggle handlers
  const togglePassword = useCallback(() => setShowPassword(prev => !prev), []);
  const openDeleteModal = useCallback(() => setShowDeleteModal(true), []);
  const closeDeleteModal = useCallback(() => setShowDeleteModal(false), []);
  const handleAvatarHover = useCallback(() => setIsHovering(true), []);
  const handleAvatarLeave = useCallback(() => setIsHovering(false), []);

  // Memoized formatted date
  const memberSinceDate = useMemo(() =>
    currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString("en-GB") : "N/A"
    , [currentUser?.createdAt]);

  // Memoized mouse follow gradient style
  const mouseGradientStyle = useMemo(() => ({
    background: `radial-gradient(600px at ${mousePosition.x}px ${mousePosition.y}px, rgba(59, 130, 246, 0.15), transparent 80%)`
  }), [mousePosition.x, mousePosition.y]);

  // Memoized avatar transform style
  const avatarStyle = useMemo(() => ({
    transform: isHovering ? 'translateZ(20px)' : 'translateZ(0)',
    boxShadow: isHovering ? '0 25px 50px -12px rgba(59, 130, 246, 0.5)' : ''
  }), [isHovering]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-blue-950 to-purple-950 relative overflow-hidden">
      {/* Animated Background Grid - GPU accelerated */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#4f46e520_1px,transparent_1px),linear-gradient(to_bottom,#4f46e520_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_80%_50%_at_50%_0%,#000_70%,transparent_110%)] will-change-transform" />

      {/* Floating Orbs - Using will-change for GPU acceleration */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/30 rounded-full blur-3xl animate-pulse will-change-transform" />
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDelay: '1s' }} />
      <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse will-change-transform" style={{ animationDelay: '2s' }} />

      {/* Mouse Follow Gradient - Optimized with will-change */}
      <div
        className="pointer-events-none fixed inset-0 z-30 transition duration-300 will-change-transform"
        style={mouseGradientStyle}
      />

      <div className="relative z-10 py-6 sm:py-12 px-3 sm:px-6 lg:px-8 pt-20 sm:pt-24 pb-12">
        {/* Holographic Header */}
        <div className="max-w-4xl mx-auto mb-8 sm:mb-12">
          <div className="text-center relative">
            {/* Holographic Badge */}
            <div className="inline-flex items-center justify-center mb-6 relative group">
              <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full blur-xl opacity-75 group-hover:opacity-100 transition-opacity duration-500 animate-pulse will-change-transform" />
              <div className="relative w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-blue-500/20 to-purple-500/20 backdrop-blur-xl border border-white/20 rounded-3xl flex items-center justify-center shadow-2xl">
                <Shield className="w-10 h-10 sm:w-12 sm:h-12 text-blue-400 drop-shadow-[0_0_10px_rgba(59,130,246,0.5)]" />
                <div className="absolute inset-0 rounded-3xl bg-gradient-to-br from-blue-400/0 via-purple-400/0 to-pink-400/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              </div>
            </div>

            {/* Glitch Effect Title */}
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black mb-4 relative">
              <span className="absolute inset-0 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Profile Command Center
              </span>
              <span className="relative bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent animate-pulse">
                Profile Command Center
              </span>
            </h1>

            <p className="text-base sm:text-lg text-blue-200/70 max-w-2xl mx-auto leading-relaxed font-light tracking-wide">
              Advanced identity management and security protocols
            </p>
          </div>
        </div>

        {/* Main Holographic Container */}
        <div className="max-w-4xl mx-auto">
          <div className="relative group">
            {/* Outer Glow */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-3xl blur-xl opacity-30 group-hover:opacity-50 transition-opacity duration-500 will-change-transform" />

            {/* Main Card */}
            <div className="relative bg-gradient-to-br from-slate-900/90 via-blue-900/50 to-purple-900/50 backdrop-blur-2xl border border-white/10 shadow-2xl rounded-3xl overflow-hidden">
              {/* Scanline Effect */}
              <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(59,130,246,0.03)_50%)] bg-[length:100%_4px] pointer-events-none" />

              {/* Profile Header Section */}
              <div className="relative px-6 sm:px-8 lg:px-12 py-8 sm:py-12 lg:py-16 overflow-hidden">
                {/* Animated Background Particles */}
                <div className="absolute inset-0">
                  <div className="absolute top-10 left-10 w-2 h-2 bg-blue-400 rounded-full blur-sm animate-ping" />
                  <div className="absolute top-20 right-20 w-2 h-2 bg-purple-400 rounded-full blur-sm animate-ping" style={{ animationDelay: '1s' }} />
                  <div className="absolute bottom-10 left-1/3 w-2 h-2 bg-pink-400 rounded-full blur-sm animate-ping" style={{ animationDelay: '2s' }} />
                </div>

                {/* Avatar Section with 3D Effect */}
                <div className="relative z-10 flex flex-col items-center">
                  <div
                    className="relative group/avatar mb-6"
                    onMouseEnter={handleAvatarHover}
                    onMouseLeave={handleAvatarLeave}
                  >
                    {/* Rotating Ring - GPU accelerated */}
                    <div className="absolute -inset-4 rounded-full opacity-75">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 blur-md animate-spin will-change-transform" style={{ animationDuration: '3s' }} />
                    </div>

                    {/* Pulsing Rings */}
                    <div className="absolute -inset-3 bg-gradient-to-r from-blue-400/30 to-purple-400/30 rounded-full blur-lg animate-pulse will-change-transform" />
                    <div className="absolute -inset-2 bg-gradient-to-r from-blue-400/50 to-purple-400/50 rounded-full blur animate-pulse will-change-transform" style={{ animationDelay: '0.5s' }} />

                    {/* Avatar Container */}
                    <div className="relative">
                      <div className="absolute inset-0 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 blur-xl opacity-50" />
                      <img
                        src={selectedImg || currentUser?.profilePic}
                        className="relative size-32 sm:size-40 lg:size-48 rounded-full object-cover border-4 border-white/20 shadow-2xl transition-all duration-700 group-hover/avatar:scale-110 group-hover/avatar:border-blue-400/50 will-change-transform"
                        alt="Profile"
                        style={avatarStyle}
                      />

                      {/* Camera Button with Neon Effect */}
                      <label
                        htmlFor="avatar-upload"
                        className="absolute -bottom-2 -right-2 sm:-bottom-3 sm:-right-3 cursor-pointer group/btn"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl blur-lg opacity-75 group-hover/btn:opacity-100 transition-opacity" />
                        <div className="relative bg-gradient-to-br from-blue-600 to-purple-700 p-3 sm:p-4 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 border border-white/20">
                          <Camera className="w-5 h-5 sm:w-6 sm:h-6 text-white drop-shadow-[0_0_8px_rgba(255,255,255,0.8)] transition-transform duration-300 group-hover/btn:rotate-12 group-hover/btn:scale-110" />
                        </div>
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

                  {/* User Info with Holographic Effect */}
                  <div className="text-center space-y-4">
                    <h2 className="text-3xl sm:text-4xl font-black text-transparent bg-clip-text bg-gradient-to-r from-blue-200 via-purple-200 to-pink-200 drop-shadow-[0_0_30px_rgba(59,130,246,0.5)]">
                      {currentUser?.fullName || "User"}
                    </h2>
                    <p className="text-sm sm:text-base text-blue-300/80 font-light tracking-wider">
                      {currentUser?.email}
                    </p>

                    {/* Membership Badge */}
                    <div className="inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-blue-500/20 to-purple-500/20 backdrop-blur-xl rounded-2xl border border-white/10 shadow-xl group/badge hover:border-white/30 transition-all duration-300">
                      <div className="relative">
                        <Calendar className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        <div className="absolute inset-0 bg-blue-400 blur-md opacity-50 group-hover/badge:opacity-75 transition-opacity" />
                      </div>
                      <span className="text-sm font-semibold text-white/90 tracking-wide">
                        Member since {memberSinceDate}
                      </span>
                      <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Form Content with Glass Morphism */}
              <div className="px-6 sm:px-8 lg:px-12 py-8 sm:py-12">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">

                  {/* Left Column - Personal Information */}
                  <div className="space-y-8">
                    {/* Section Header */}
                    <div className="flex items-center gap-3 mb-6">
                      <div className="relative">
                        <div className="absolute inset-0 bg-blue-500 blur-md opacity-50" />
                        <div className="relative w-10 h-10 bg-gradient-to-br from-blue-500/30 to-purple-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                          <User className="w-5 h-5 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.8)]" />
                        </div>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-bold text-white/90">Personal Data</h3>
                      <div className="flex-1 h-px bg-gradient-to-r from-blue-500/50 to-transparent" />
                    </div>

                    {/* Full Name Field */}
                    <div className="space-y-3 group/field">
                      <label className="text-sm font-semibold flex items-center gap-2 text-blue-300/80 tracking-wide uppercase">
                        <User className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        Full Name
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover/field:opacity-100 transition-opacity duration-500 blur-sm" />
                        <div className="relative flex items-center gap-4 py-5 px-6 border border-white/10 rounded-2xl bg-gradient-to-br from-slate-800/50 to-blue-900/30 backdrop-blur-xl shadow-xl group-hover/field:border-blue-500/50 group-hover/field:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                          <User className="h-5 w-5 text-blue-400/70 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          <div className="text-white/90 text-base font-medium tracking-wide">
                            {currentUser?.fullName}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Email Field */}
                    <div className="space-y-3 group/field">
                      <label className="text-sm font-semibold flex items-center gap-2 text-blue-300/80 tracking-wide uppercase">
                        <Mail className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                        Email Address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl opacity-0 group-hover/field:opacity-100 transition-opacity duration-500 blur-sm" />
                        <div className="relative flex items-center gap-4 py-5 px-6 border border-white/10 rounded-2xl bg-gradient-to-br from-slate-800/50 to-blue-900/30 backdrop-blur-xl shadow-xl group-hover/field:border-blue-500/50 group-hover/field:shadow-[0_0_30px_rgba(59,130,246,0.3)] transition-all duration-500">
                          <Mail className="h-5 w-5 text-blue-400/70 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                          <div className="text-white/90 text-base font-medium tracking-wide">
                            {currentUser?.email}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Security Section */}
                    <div className="pt-6">
                      <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-purple-500 blur-md opacity-50" />
                          <div className="relative w-10 h-10 bg-gradient-to-br from-purple-500/30 to-pink-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                            <Lock className="w-5 h-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                          </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white/90">Security</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent" />
                      </div>

                      <div className="space-y-3 group/field">
                        <label className="text-sm font-semibold flex items-center gap-2 text-purple-300/80 tracking-wide uppercase">
                          <Lock className="w-4 h-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                          New Password
                        </label>
                        <div className="relative">
                          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/20 to-pink-500/20 rounded-2xl opacity-0 group-focus-within/field:opacity-100 transition-opacity duration-500 blur-sm" />
                          <div className="relative flex items-center gap-4 py-5 px-6 border border-white/10 rounded-2xl bg-gradient-to-br from-slate-800/50 to-purple-900/30 backdrop-blur-xl shadow-xl group-focus-within/field:border-purple-500/50 group-focus-within/field:shadow-[0_0_30px_rgba(168,85,247,0.3)] transition-all duration-500">
                            <Lock className="h-5 w-5 text-purple-400/70 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                            <input
                              type={showPassword ? "text" : "password"}
                              className="flex-1 bg-transparent focus:outline-none text-white/90 placeholder-white/30 text-base font-medium tracking-wide"
                              placeholder="Enter new password (optional)"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                            />
                            <button
                              type="button"
                              className="group/eye"
                              onClick={togglePassword}
                            >
                              {showPassword ? (
                                <EyeOff className="h-5 w-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-transform duration-300 group-hover/eye:scale-110" />
                              ) : (
                                <Eye className="h-5 w-5 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)] transition-transform duration-300 group-hover/eye:scale-110" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Account Details & Actions */}
                  <div className="space-y-8">
                    {/* Account Details */}
                    <div>
                      <div className="flex items-center gap-3 mb-6">
                        <div className="relative">
                          <div className="absolute inset-0 bg-green-500 blur-md opacity-50" />
                          <div className="relative w-10 h-10 bg-gradient-to-br from-green-500/30 to-blue-500/30 backdrop-blur-xl rounded-xl flex items-center justify-center border border-white/10">
                            <Hash className="w-5 h-5 text-green-400 drop-shadow-[0_0_8px_rgba(34,197,94,0.8)]" />
                          </div>
                        </div>
                        <h3 className="text-xl sm:text-2xl font-bold text-white/90">Account Info</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-green-500/50 to-transparent" />
                      </div>

                      <div className="relative group/card">
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-blue-500/20 rounded-3xl blur-xl opacity-0 group-hover/card:opacity-100 transition-opacity duration-500" />
                        <div className="relative bg-gradient-to-br from-slate-800/70 to-blue-900/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
                          {/* Scanline Effect */}
                          <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(59,130,246,0.02)_50%)] bg-[length:100%_4px] pointer-events-none" />

                          <div className="relative space-y-6">
                            {/* Member Since */}
                            <div className="flex items-center justify-between py-4 px-4 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-800/30 to-transparent group/item hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300">
                              <span className="text-white/60 text-sm font-semibold flex items-center gap-3 tracking-wide uppercase">
                                <Calendar className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                Member Since
                              </span>
                              <span className="text-white font-bold text-sm">
                                {memberSinceDate}
                              </span>
                            </div>

                            {/* Building */}
                            <div className="flex items-center justify-between py-4 px-4 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-800/30 to-transparent group/item hover:border-blue-500/30 hover:bg-gradient-to-r hover:from-blue-500/10 hover:to-purple-500/10 transition-all duration-300">
                              <span className="text-white/60 flex items-center gap-3 text-sm font-semibold tracking-wide uppercase">
                                <Home className="w-4 h-4 text-blue-400 drop-shadow-[0_0_8px_rgba(59,130,246,0.5)]" />
                                Building
                              </span>
                              <span className="text-white font-bold text-sm">
                                {currentUser?.buildingName || "N/A"}
                              </span>
                            </div>

                            {/* Flat Number */}
                            <div className="flex items-center justify-between py-4 px-4 rounded-2xl border border-white/5 bg-gradient-to-r from-slate-800/30 to-transparent group/item hover:border-purple-500/30 hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-300">
                              <span className="text-white/60 flex items-center gap-3 text-sm font-semibold tracking-wide uppercase">
                                <Hash className="w-4 h-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.5)]" />
                                Flat Number
                              </span>
                              <span className="text-white font-bold text-sm">
                                {currentUser?.flatNumber || "N/A"}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="space-y-4">
                      {/* Update Button */}
                      <button
                        onClick={handleUpdateProfile}
                        disabled={isUpdatingProfile}
                        className="relative w-full group/btn overflow-hidden rounded-2xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 blur-lg opacity-75 group-hover/btn:opacity-100 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-600 hover:via-purple-600 hover:to-pink-600 disabled:from-gray-600 disabled:via-gray-600 disabled:to-gray-700 text-white py-5 rounded-2xl transition-all duration-500 font-bold flex items-center justify-center gap-3 shadow-xl border border-white/20 disabled:cursor-not-allowed">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000 will-change-transform" />
                          {isUpdatingProfile ? (
                            <>
                              <LoaderCircle className="w-6 h-6 animate-spin drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                              <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Updating...</span>
                            </>
                          ) : (
                            <>
                              <Zap className="w-5 h-5 drop-shadow-[0_0_12px_rgba(255,255,255,1)] animate-pulse" />
                              <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Update Profile</span>
                            </>
                          )}
                        </div>
                      </button>

                      {/* Delete Button */}
                      <button
                        onClick={openDeleteModal}
                        className="relative w-full group/btn overflow-hidden rounded-2xl"
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-red-700 blur-lg opacity-75 group-hover/btn:opacity-100 transition-opacity" />
                        <div className="relative bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white py-5 rounded-2xl flex items-center justify-center gap-3 transition-all duration-500 font-bold shadow-xl border border-white/20">
                          <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover/btn:translate-x-[200%] transition-transform duration-1000 will-change-transform" />
                          <Trash2 className="w-5 h-5 transition-transform duration-300 group-hover/btn:rotate-12 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                          <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Delete Profile</span>
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Futuristic Delete Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
          {/* Backdrop with Blur */}
          <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={closeDeleteModal} />

          {/* Holographic Grid Background */}
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#ef444420_1px,transparent_1px),linear-gradient(to_bottom,#ef444420_1px,transparent_1px)] bg-[size:3rem_3rem] opacity-20" />

          {/* Modal Container */}
          <div className="relative max-w-lg w-full animate-in zoom-in-95 duration-500">
            {/* Outer Glow */}
            <div className="absolute -inset-4 bg-gradient-to-r from-red-600 via-orange-600 to-red-600 rounded-3xl blur-2xl opacity-50 animate-pulse will-change-transform" />

            {/* Modal Content */}
            <div className="relative bg-gradient-to-br from-slate-900/95 via-red-900/50 to-slate-900/95 backdrop-blur-2xl border border-red-500/30 rounded-3xl shadow-2xl overflow-hidden">
              {/* Danger Scanlines */}
              <div className="absolute inset-0 bg-[linear-gradient(0deg,transparent_50%,rgba(239,68,68,0.05)_50%)] bg-[length:100%_4px] pointer-events-none" />

              {/* Warning Pulse at Top */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" />

              <div className="relative p-8 sm:p-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-8">
                  <div className="flex items-center gap-4">
                    {/* Danger Icon */}
                    <div className="relative">
                      <div className="absolute inset-0 bg-red-500 blur-xl opacity-75 animate-pulse" />
                      <div className="relative w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-br from-red-500/30 to-orange-500/30 backdrop-blur-xl rounded-2xl flex items-center justify-center border border-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.5)]">
                        <Trash2 className="w-7 h-7 sm:w-8 sm:h-8 text-red-400 drop-shadow-[0_0_12px_rgba(239,68,68,1)] animate-pulse" />
                      </div>
                    </div>

                    <div>
                      <h2 className="text-2xl sm:text-3xl font-black text-transparent bg-clip-text bg-gradient-to-r from-red-400 to-orange-400 drop-shadow-[0_0_20px_rgba(239,68,68,0.5)] mb-1">
                        CRITICAL ACTION
                      </h2>
                      <p className="text-sm text-red-300/70 font-semibold tracking-wider uppercase">
                        ⚠ Irreversible Operation
                      </p>
                    </div>
                  </div>

                  {/* Close Button */}
                  <button
                    onClick={closeDeleteModal}
                    className="group/close relative"
                  >
                    <div className="absolute inset-0 bg-red-500 blur-md opacity-0 group-hover/close:opacity-75 transition-opacity rounded-xl" />
                    <div className="relative w-10 h-10 rounded-xl hover:bg-red-500/20 flex items-center justify-center transition-all duration-300 border border-transparent hover:border-red-500/50">
                      <X className="w-5 h-5 text-red-400 group-hover/close:text-red-300 transition-colors duration-200 drop-shadow-[0_0_8px_rgba(239,68,68,0.5)]" />
                    </div>
                  </button>
                </div>

                {/* Warning Message */}
                <div className="mb-8 space-y-4">
                  <p className="text-base sm:text-lg text-white/90 leading-relaxed font-medium">
                    You are about to permanently delete your profile. This action will erase all your data from our systems.
                  </p>

                  {/* Alert Box */}
                  <div className="relative group/alert">
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600/30 to-orange-600/30 rounded-2xl blur-md opacity-75" />
                    <div className="relative bg-gradient-to-br from-red-950/80 to-orange-950/60 backdrop-blur-xl border border-red-500/40 rounded-2xl p-5 sm:p-6 shadow-xl">
                      <div className="flex gap-3">
                        <div className="flex-shrink-0 mt-1">
                          <div className="w-6 h-6 rounded-full bg-red-500/30 flex items-center justify-center border border-red-500/50">
                            <span className="text-red-400 text-sm font-bold drop-shadow-[0_0_8px_rgba(239,68,68,0.8)]">!</span>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <p className="text-sm text-red-200 font-semibold">
                            This action cannot be undone
                          </p>
                          <ul className="text-xs text-red-300/80 space-y-1 font-medium">
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-red-400" />
                              All personal information will be deleted
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-red-400" />
                              Account settings will be removed
                            </li>
                            <li className="flex items-center gap-2">
                              <div className="w-1 h-1 rounded-full bg-red-400" />
                              No recovery option available
                            </li>
                          </ul>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Cancel Button */}
                  <button
                    className="relative flex-1 group/cancel overflow-hidden rounded-2xl"
                    onClick={closeDeleteModal}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-slate-700 to-slate-600 blur-md opacity-0 group-hover/cancel:opacity-75 transition-opacity" />
                    <div className="relative bg-gradient-to-br from-slate-700/80 to-slate-600/80 hover:from-slate-600/90 hover:to-slate-500/90 backdrop-blur-xl text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 border border-white/10 hover:border-white/30 hover:shadow-[0_0_30px_rgba(148,163,184,0.3)]">
                      <span className="drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Cancel</span>
                    </div>
                  </button>

                  {/* Delete Button */}
                  <button
                    className="relative flex-1 group/delete overflow-hidden rounded-2xl"
                    onClick={handleDeleteProfile}
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-red-600 to-orange-600 blur-lg opacity-75 group-hover/delete:opacity-100 transition-opacity animate-pulse" />
                    <div className="relative bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-700 hover:to-orange-700 text-white px-6 py-4 rounded-2xl font-black transition-all duration-300 border border-red-400/50 hover:border-red-300 shadow-xl hover:shadow-[0_0_40px_rgba(239,68,68,0.6)]">
                      <div className="absolute inset-0 bg-gradient-to-r from-white/0 via-white/30 to-white/0 translate-x-[-200%] group-hover/delete:translate-x-[200%] transition-transform duration-1000 will-change-transform" />
                      <span className="relative flex items-center justify-center gap-2">
                        <Trash2 className="w-5 h-5 drop-shadow-[0_0_12px_rgba(255,255,255,1)] animate-pulse" />
                        <span className="drop-shadow-[0_0_12px_rgba(255,255,255,0.8)]">DELETE FOREVER</span>
                      </span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Bottom Warning Pulse */}
              <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-transparent via-red-500 to-transparent animate-pulse" style={{ animationDelay: '0.5s' }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;