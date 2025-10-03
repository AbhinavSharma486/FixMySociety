import React, { useState } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { logout as userLogout } from "../redux/user/userSlice.js";
import { logout as adminLogout } from "../redux/admin/adminSlice.js";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Building2, ShieldCheck, User, LogOut, Settings, Menu, X, Home, Bell } from 'lucide-react';
import NotificationCenter from "./NotificationCenter.jsx";

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { admin } = useSelector((state) => state.admin);
  const { currentUser } = useSelector((state) => state.user);

  const isHome = location.pathname === '/';
  const isVerifyEmail = location.pathname === '/verify-email';

  const getInitials = (fullName) => {
    if (!fullName || typeof fullName !== 'string') return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1]?.[0] : (parts[0]?.[1] || '');
    return (first + second).toUpperCase();
  };

  const handleUserLogout = () => {
    dispatch(userLogout(navigate));
    setIsMobileMenuOpen(false);
  };

  const handleAdminLogout = () => {
    dispatch(adminLogout(navigate));
    setIsMobileMenuOpen(false);
  };

  const goHome = () => {
    if (admin) return navigate('/admin-dashboard');
    if (currentUser) return navigate('/main');
    navigate('/');
    setIsMobileMenuOpen(false);
  };

  const avatarSrc = admin?.profileImage || currentUser?.profilePic || "/avatar.webp";

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  return (
    <>
      {/* Desktop Navbar - Ultra Responsive */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/5 backdrop-blur-3xl border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/[0.02] via-purple-600/[0.02] to-indigo-600/[0.02]"></div>
        <div className="relative w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 xs:h-15 sm:h-16 lg:h-18 xl:h-20">
            {/* Logo Section - Ultra Responsive */}
            <div className="flex items-center min-w-0 flex-1 md:flex-none">
              <button
                onClick={goHome}
                className="group flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3 transition-all duration-500 hover:scale-[1.02] active:scale-95 min-w-0"
              >
                <div className="relative flex-shrink-0">
                  <div className="absolute -inset-0.5 xs:-inset-1 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg xs:rounded-xl opacity-20 group-hover:opacity-40 blur-sm transition-all duration-500"></div>
                  <div className="relative p-1 xs:p-1.5 bg-white/10 backdrop-blur-sm rounded-lg xs:rounded-xl border border-white/20 group-hover:border-white/30 transition-all duration-500">
                    <Building2 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-blue-600 group-hover:text-purple-600 transition-all duration-500" />
                  </div>
                </div>
                <div className="min-w-0 flex-shrink">
                  <span className="block text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 bg-clip-text text-transparent group-hover:from-purple-600 group-hover:via-blue-600 group-hover:to-indigo-600 transition-all duration-500 truncate">
                    FixMySociety
                  </span>
                </div>
              </button>
            </div>

            {/* Desktop Navigation - Responsive (>= 768px) */}
            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {/* Login Buttons for Non-authenticated Users - Responsive */}
              {!currentUser && !admin && isHome && (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="group relative px-3 lg:px-6 xl:px-8 py-2 lg:py-2.5 xl:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-full transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 text-xs lg:text-sm xl:text-base whitespace-nowrap">User Login</span>
                    <div className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/30 transition-all duration-500"></div>
                  </button>

                  <button
                    onClick={() => navigate("/admin-login")}
                    className="group relative px-2.5 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 bg-black/80 hover:bg-black backdrop-blur-sm rounded-full transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-center space-x-1.5 lg:space-x-2 text-white">
                      <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="font-medium text-xs lg:text-sm xl:text-base whitespace-nowrap">Admin</span>
                    </div>
                  </button>
                </div>
              )}

              {/* Context-aware actions on auth pages - Responsive */}
              {!currentUser && !admin && location.pathname === '/login' && (
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/admin-login')}
                    className="group relative px-2.5 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 bg-black/80 hover:bg-black backdrop-blur-sm rounded-full transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-white/10 hover:border-white/20"
                  >
                    <div className="flex items-center space-x-1.5 lg:space-x-2 text-white">
                      <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 transition-transform duration-300 group-hover:rotate-12" />
                      <span className="font-medium text-xs lg:text-sm xl:text-base whitespace-nowrap">Admin</span>
                    </div>
                  </button>
                </div>
              )}

              {!currentUser && !admin && location.pathname === '/admin-login' && (
                <div className="flex items-center">
                  <button
                    onClick={() => navigate('/login')}
                    className="group relative px-3 lg:px-6 xl:px-8 py-2 lg:py-2.5 xl:py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-full transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl hover:shadow-purple-500/25"
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <span className="relative z-10 text-xs lg:text-sm xl:text-base whitespace-nowrap">User Login</span>
                    <div className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/30 transition-all duration-500"></div>
                  </button>
                </div>
              )}

              {/* Authenticated User Section - Responsive */}
              {(currentUser || admin) && !isVerifyEmail && (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  {/* Home button - Responsive */}
                  <button
                    onClick={goHome}
                    className="group hidden lg:inline-flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-4 py-1.5 lg:py-2 text-black/80 hover:text-black bg-white/5 hover:bg-white/10 rounded-lg lg:rounded-xl transition-all duration-300 hover:scale-105 active:scale-95 backdrop-blur-sm border border-white/10 hover:border-white/20"
                  >
                    <Home className="w-3.5 h-3.5 lg:w-4 lg:h-4 transition-transform duration-300 group-hover:-translate-y-0.5" />
                    <span className="font-medium text-xs lg:text-sm whitespace-nowrap">Home</span>
                  </button>

                  {/* Notification Center - Responsive */}
                  {!admin && (
                    <div className="relative">
                      <NotificationCenter />
                    </div>
                  )}

                  {/* Profile Dropdown - Responsive */}
                  <div className="relative group">
                    <div className="dropdown dropdown-end">
                      <button
                        tabIndex={0}
                        className="group relative flex items-center p-0.5 lg:p-1 rounded-full hover:bg-white/10 transition-all duration-500 hover:scale-105 active:scale-95 backdrop-blur-sm"
                      >
                        <div className="relative">
                          <div className="absolute -inset-0.5 lg:-inset-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full opacity-60 group-hover:opacity-100 transition-opacity duration-500 blur-sm animate-pulse"></div>
                          <div className="relative w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full p-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 group-hover:from-purple-600 group-hover:via-blue-600 group-hover:to-indigo-600 transition-all duration-500">
                            <img
                              src={avatarSrc}
                              alt="Profile"
                              className="w-full h-full rounded-full object-cover bg-white"
                            />
                          </div>
                          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-green-500 rounded-full border-2 border-white shadow-sm"></div>
                        </div>
                      </button>

                      {/* Dropdown Menu - Responsive */}
                      <ul
                        tabIndex={0}
                        className="dropdown-content mt-2 lg:mt-3 w-56 lg:w-64 bg-white/95 backdrop-blur-xl rounded-xl lg:rounded-2xl shadow-2xl border border-white/20 py-2 lg:py-3 z-[60] animate-in slide-in-from-top-2 duration-300"
                      >
                        <div className="px-3 lg:px-4 py-2 lg:py-3 border-b border-gray-100/50">
                          <div className="flex items-center space-x-2 lg:space-x-3">
                            <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full p-0.5 bg-gradient-to-r from-blue-600 to-purple-600">
                              <img
                                src={avatarSrc}
                                alt="Profile"
                                className="w-full h-full rounded-full object-cover bg-white"
                              />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-semibold text-gray-900 truncate text-xs lg:text-sm">
                                {admin ? admin.fullName : currentUser?.fullName}
                              </p>
                              <p className="text-xs text-gray-500 flex items-center space-x-1">
                                <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${admin ? 'bg-purple-500' : 'bg-blue-500'}`}></span>
                                <span className="text-xs">{admin ? 'Administrator' : 'User Account'}</span>
                              </p>
                            </div>
                          </div>
                        </div>

                        {!admin && (
                          <li>
                            <Link
                              to="/profile"
                              className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 mx-1.5 lg:mx-2 rounded-lg lg:rounded-xl group"
                            >
                              <div className="p-1.5 lg:p-2 bg-blue-100 rounded-lg lg:rounded-xl group-hover:bg-blue-200 transition-colors duration-300 group-hover:scale-110">
                                <User className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                              </div>
                              <span className="font-medium text-xs lg:text-sm">Profile Settings</span>
                            </Link>
                          </li>
                        )}

                        {admin && (
                          <>
                            <li>
                              <Link
                                to="/admin-dashboard"
                                className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-700 hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 mx-1.5 lg:mx-2 rounded-lg lg:rounded-xl group"
                              >
                                <div className="p-1.5 lg:p-2 bg-purple-100 rounded-lg lg:rounded-xl group-hover:bg-purple-200 transition-colors duration-300 group-hover:scale-110">
                                  <Settings className="w-3 h-3 lg:w-4 lg:h-4 text-purple-600" />
                                </div>
                                <span className="font-medium text-xs lg:text-sm">Admin Dashboard</span>
                              </Link>
                            </li>
                            <li>
                              <Link
                                to="/admin/profile"
                                className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-gray-700 hover:bg-gradient-to-r hover:from-blue-50 hover:to-purple-50 transition-all duration-300 mx-1.5 lg:mx-2 rounded-lg lg:rounded-xl group"
                              >
                                <div className="p-1.5 lg:p-2 bg-blue-100 rounded-lg lg:rounded-xl group-hover:bg-blue-200 transition-colors duration-300 group-hover:scale-110">
                                  <User className="w-3 h-3 lg:w-4 lg:h-4 text-blue-600" />
                                </div>
                                <span className="font-medium text-xs lg:text-sm">Profile Settings</span>
                              </Link>
                            </li>
                          </>
                        )}

                        <li className="my-1 lg:my-2">
                          <div className="border-t border-gray-100/50 mx-3 lg:mx-4"></div>
                        </li>

                        <li>
                          <button
                            onClick={admin ? handleAdminLogout : handleUserLogout}
                            className="flex items-center space-x-2 lg:space-x-3 w-full px-3 lg:px-4 py-2 lg:py-3 text-red-600 hover:bg-gradient-to-r hover:from-red-50 hover:to-pink-50 transition-all duration-300 mx-1.5 lg:mx-2 rounded-lg lg:rounded-xl group"
                          >
                            <div className="p-1.5 lg:p-2 bg-red-100 rounded-lg lg:rounded-xl group-hover:bg-red-200 transition-colors duration-300 group-hover:scale-110">
                              <LogOut className="w-3 h-3 lg:w-4 lg:h-4 text-red-600 transition-transform duration-300 group-hover:translate-x-0.5" />
                            </div>
                            <span className="font-medium text-xs lg:text-sm">Sign Out</span>
                          </button>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile Menu Button - Ultra Responsive */}
            {!isVerifyEmail && (
              <div className="flex md:hidden items-center space-x-1.5 xs:space-x-2">
                {/* Mobile Notification for users */}
                {!admin && (currentUser || admin) && (
                  <div className="relative">
                    <NotificationCenter />
                  </div>
                )}

                <button
                  onClick={toggleMobileMenu}
                  className="group relative p-1.5 xs:p-2 transition-all duration-500 hover:scale-110 active:scale-95 rounded-lg xs:rounded-xl bg-white/5 hover:bg-white/10 backdrop-blur-sm border border-white/10 hover:border-white/20"
                  aria-label="Toggle menu"
                >
                  <div className="relative w-5 h-5 xs:w-6 xs:h-6 shrink-0">
                    <Menu className={`absolute inset-0 w-full h-full text-black transition-all duration-500 ${isMobileMenuOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                    <X className={`absolute inset-0 w-full h-full text-black transition-all duration-500 ${!isMobileMenuOpen ? 'opacity-0 -rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'}`} />
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      {/* Mobile Menu Overlay - Ultra Responsive */}
      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible'}`}>
        <div
          className="absolute inset-0 bg-black/30 backdrop-blur-sm"
          onClick={toggleMobileMenu}
        ></div>

        {/* Mobile Menu Content - Ultra Responsive */}
        <div className={`absolute top-14 xs:top-15 sm:top-16 left-1 right-1 xs:left-2 xs:right-2 sm:left-3 sm:right-3 bg-white/95 backdrop-blur-2xl rounded-2xl xs:rounded-3xl shadow-2xl border border-white/30 transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-8 scale-95 opacity-0'} max-h-[calc(100vh-4rem)] xs:max-h-[calc(100vh-4.5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto`}>
          <div className="p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
            {/* Non-authenticated Users - Ultra Responsive */}
            {!currentUser && !admin && isHome && (
              <div className="space-y-3 xs:space-y-4">
                <button
                  onClick={() => {
                    navigate("/login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full group relative px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 rounded-xl xs:rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 text-sm xs:text-base">User Login</span>
                </button>

                <button
                  onClick={() => {
                    navigate("/admin-login");
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full group relative px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 bg-black/90 hover:bg-black text-white rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-white/10"
                >
                  <div className="flex items-center justify-center space-x-2 xs:space-x-3">
                    <ShieldCheck className="w-4 h-4 xs:w-5 xs:h-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="font-semibold text-sm xs:text-base">Admin Login</span>
                  </div>
                </button>
              </div>
            )}

            {/* Context-aware mobile actions - Ultra Responsive */}
            {!currentUser && !admin && location.pathname === '/login' && (
              <div className="space-y-3 xs:space-y-4">
                <button
                  onClick={() => {
                    navigate('/admin-login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full group relative px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 bg-black/90 hover:bg-black text-white rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl border border-white/10"
                >
                  <div className="flex items-center justify-center space-x-2 xs:space-x-3">
                    <ShieldCheck className="w-4 h-4 xs:w-5 xs:h-5 transition-transform duration-300 group-hover:rotate-12" />
                    <span className="font-semibold text-sm xs:text-base">Admin Login</span>
                  </div>
                </button>
              </div>
            )}

            {!currentUser && !admin && location.pathname === '/admin-login' && (
              <div className="space-y-3 xs:space-y-4">
                <button
                  onClick={() => {
                    navigate('/login');
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full group relative px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-purple-600 hover:to-blue-600 text-white font-semibold rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 shadow-lg hover:shadow-xl"
                >
                  <div className="absolute inset-0 rounded-xl xs:rounded-2xl bg-gradient-to-r from-purple-600 to-blue-600 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <span className="relative z-10 text-sm xs:text-base">User Login</span>
                </button>
              </div>
            )}

            {/* Authenticated Users - Ultra Responsive */}
            {(currentUser || admin) && (
              <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                {/* User Profile Card - Ultra Responsive */}
                <div className="relative p-4 xs:p-5 sm:p-6 bg-gradient-to-br from-blue-50/70 via-purple-50/70 to-indigo-50/70 rounded-2xl xs:rounded-3xl border border-white/50 backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.02] via-purple-600/[0.02] to-indigo-600/[0.02] rounded-2xl xs:rounded-3xl"></div>
                  <div className="relative flex flex-col items-center space-y-3 xs:space-y-4">
                    <div className="relative">
                      <div className="absolute -inset-1.5 xs:-inset-2 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 rounded-full opacity-60 blur-md animate-pulse"></div>
                      <div className="relative w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full p-1 bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600">
                        <img
                          src={avatarSrc}
                          alt="Profile"
                          className="w-full h-full rounded-full object-cover bg-white"
                        />
                      </div>
                      <div className="absolute -bottom-0.5 xs:-bottom-1 -right-0.5 xs:-right-1 w-5 h-5 xs:w-6 xs:h-6 bg-green-500 rounded-full border-2 xs:border-3 border-white shadow-lg flex items-center justify-center">
                        <div className="w-1.5 h-1.5 xs:w-2 xs:h-2 bg-white rounded-full"></div>
                      </div>
                    </div>
                    <div className="text-center space-y-1.5 xs:space-y-2">
                      <div className="font-bold text-gray-900 text-base xs:text-lg sm:text-xl truncate max-w-full">
                        {admin ? admin.fullName : currentUser?.fullName}
                      </div>
                      <div className="flex items-center justify-center">
                        {admin ? (
                          <span className="inline-flex items-center gap-1 xs:gap-1.5 bg-purple-100 text-purple-700 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-bold tracking-wide border border-purple-200/50">
                            <ShieldCheck className="w-3 h-3" />
                            <span className="xs:inline">Admin</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 xs:gap-1.5 bg-blue-100 text-blue-700 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-bold tracking-wide border border-blue-200/50">
                            <User className="w-3 h-3" />
                            <span className="xs:inline">User</span>
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Ultra Responsive 2x2 Grid Menu */}
                <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
                  {/* Home Button - Ultra Responsive */}
                  <button
                    onClick={() => {
                      goHome();
                      setIsMobileMenuOpen(false);
                    }}
                    className="group relative flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 bg-gradient-to-br from-blue-50/80 to-blue-100/80 hover:from-blue-100 hover:to-blue-200 transition-all duration-500 hover:scale-105 active:scale-95 rounded-xl xs:rounded-2xl border border-blue-200/50 hover:border-blue-300 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-600/[0.03] to-blue-700/[0.05] rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-2 xs:p-2.5 sm:p-3 bg-blue-500 rounded-xl xs:rounded-2xl group-hover:bg-blue-600 transition-all duration-500 mb-2 xs:mb-3 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                      <Home className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:-translate-y-0.5" />
                    </div>
                    <span className="relative text-xs xs:text-sm font-semibold text-gray-700 text-center">Home</span>
                  </button>

                  {/* Profile/Dashboard Button - Ultra Responsive */}
                  <button
                    onClick={() => {
                      if (admin) {
                        navigate("/admin-dashboard");
                      } else {
                        navigate("/profile");
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="group relative flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 bg-gradient-to-br from-purple-50/80 to-purple-100/80 hover:from-purple-100 hover:to-purple-200 transition-all duration-500 hover:scale-105 active:scale-95 rounded-xl xs:rounded-2xl border border-purple-200/50 hover:border-purple-300 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-600/[0.03] to-purple-700/[0.05] rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-2 xs:p-2.5 sm:p-3 bg-purple-500 rounded-xl xs:rounded-2xl group-hover:bg-purple-600 transition-all duration-500 mb-2 xs:mb-3 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                      {admin ? (
                        <Settings className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:rotate-90" />
                      ) : (
                        <User className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:scale-110" />
                      )}
                    </div>
                    <span className="relative text-xs xs:text-sm font-semibold text-gray-700 text-center">
                      {admin ? 'Dashboard' : 'Profile'}
                    </span>
                  </button>

                  {/* Notifications (Users only) - Ultra Responsive */}
                  {!admin && (
                    <button
                      onClick={() => {
                        setIsMobileMenuOpen(false);
                      }}
                      className="group relative flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 bg-gradient-to-br from-green-50/80 to-green-100/80 hover:from-green-100 hover:to-green-200 transition-all duration-500 hover:scale-105 active:scale-95 rounded-xl xs:rounded-2xl border border-green-200/50 hover:border-green-300 backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-green-600/[0.03] to-green-700/[0.05] rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative p-2 xs:p-2.5 sm:p-3 bg-green-500 rounded-xl xs:rounded-2xl group-hover:bg-green-600 transition-all duration-500 mb-2 xs:mb-3 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                        <Bell className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:animate-pulse" />
                      </div>
                      <span className="relative text-xs xs:text-sm font-semibold text-gray-700 text-center">Notifications</span>
                    </button>
                  )}

                  {/* Admin Profile (Admins only) - Ultra Responsive */}
                  {admin && (
                    <button
                      onClick={() => {
                        navigate("/admin/profile");
                        setIsMobileMenuOpen(false);
                      }}
                      className="group relative flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 bg-gradient-to-br from-indigo-50/80 to-indigo-100/80 hover:from-indigo-100 hover:to-indigo-200 transition-all duration-500 hover:scale-105 active:scale-95 rounded-xl xs:rounded-2xl border border-indigo-200/50 hover:border-indigo-300 backdrop-blur-sm"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/[0.03] to-indigo-700/[0.05] rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      <div className="relative p-2 xs:p-2.5 sm:p-3 bg-indigo-500 rounded-xl xs:rounded-2xl group-hover:bg-indigo-600 transition-all duration-500 mb-2 xs:mb-3 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                        <User className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:scale-110" />
                      </div>
                      <span className="relative text-xs xs:text-sm font-semibold text-gray-700 text-center">Profile</span>
                    </button>
                  )}

                  {/* Logout Button - Ultra Responsive */}
                  <button
                    onClick={admin ? handleAdminLogout : handleUserLogout}
                    className="group relative flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 bg-gradient-to-br from-red-50/80 to-red-100/80 hover:from-red-100 hover:to-red-200 transition-all duration-500 hover:scale-105 active:scale-95 rounded-xl xs:rounded-2xl border border-red-200/50 hover:border-red-300 backdrop-blur-sm"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-red-600/[0.03] to-red-700/[0.05] rounded-xl xs:rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                    <div className="relative p-2 xs:p-2.5 sm:p-3 bg-red-500 rounded-xl xs:rounded-2xl group-hover:bg-red-600 transition-all duration-500 mb-2 xs:mb-3 group-hover:scale-110 shadow-lg group-hover:shadow-xl">
                      <LogOut className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                    <span className="relative text-xs xs:text-sm font-semibold text-gray-700 text-center">Sign Out</span>
                  </button>
                </div>

                {/* Enhanced Notification Center for Mobile Users - Ultra Responsive */}
                {!admin && (
                  <div className="relative p-3 xs:p-4 bg-gradient-to-r from-blue-50/50 to-purple-50/50 rounded-xl xs:rounded-2xl border border-white/30 backdrop-blur-sm">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600/[0.01] to-purple-600/[0.01] rounded-xl xs:rounded-2xl"></div>
                    <div className="relative">
                      <h3 className="text-xs xs:text-sm font-semibold text-gray-700 mb-2 flex items-center space-x-1.5 xs:space-x-2">
                        <Bell className="w-3 h-3 xs:w-4 xs:h-4" />
                        <span>Notifications</span>
                      </h3>
                      <NotificationCenter />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;