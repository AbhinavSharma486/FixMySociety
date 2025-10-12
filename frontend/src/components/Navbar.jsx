import React, { useState, useCallback, useMemo, memo } from 'react';
import { useDispatch, useSelector } from "react-redux";
import { logout as userLogout } from "../redux/user/userSlice.js";
import { logout as adminLogout } from "../redux/admin/adminSlice.js";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { Building2, ShieldCheck, User, LogOut, Settings, Menu, X, Home, Bell } from 'lucide-react';
import NotificationCenter from "./NotificationCenter.jsx";

// Memoized sub-components for better performance
const LogoButton = memo(({ goHome }) => (
  <button
    onClick={goHome}
    className="group relative flex items-center space-x-1.5 xs:space-x-2 sm:space-x-3 transition-all duration-700 hover:scale-[1.03] active:scale-[0.97] min-w-0"
  >
    <div className="relative flex-shrink-0">
      <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 rounded-2xl opacity-0 group-hover:opacity-30 blur-xl transition-all duration-700 group-hover:blur-2xl will-change-transform" />
      <div className="absolute -inset-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-xl opacity-40 group-hover:opacity-70 blur-[2px] transition-all duration-700 animate-spin-slow will-change-transform" style={{ animationDuration: '8s' }} />
      <div className="relative p-1 xs:p-1.5 bg-gradient-to-br from-white/[0.08] to-white/[0.02] backdrop-blur-md rounded-xl border border-white/[0.15] group-hover:border-cyan-400/40 transition-all duration-700 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]">
        <Building2 className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 md:w-7 md:h-7 lg:w-8 lg:h-8 text-cyan-400 group-hover:text-fuchsia-400 transition-all duration-700 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)] group-hover:drop-shadow-[0_0_12px_rgba(217,70,239,0.8)]" />
      </div>
    </div>
    <div className="min-w-0 flex-shrink relative">
      <div className="absolute inset-0 blur-md bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text opacity-0 group-hover:opacity-40 transition-all duration-700" />
      <span className="relative block text-sm xs:text-base sm:text-lg md:text-xl lg:text-2xl xl:text-3xl font-black tracking-tight bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-500 bg-clip-text text-transparent group-hover:from-fuchsia-400 group-hover:via-purple-400 group-hover:to-cyan-400 transition-all duration-700 truncate drop-shadow-[0_0_20px_rgba(34,211,238,0.3)]" style={{ fontFamily: 'system-ui, -apple-system, sans-serif', letterSpacing: '-0.02em' }}>
        FixMySociety
      </span>
    </div>
  </button>
));

const UserLoginButton = memo(({ navigate }) => (
  <button
    onClick={() => navigate("/login")}
    className="group relative overflow-hidden px-3 lg:px-6 xl:px-8 py-2 lg:py-2.5 xl:py-3 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
  >
    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-500" />
    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-all duration-500" />
    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent will-change-transform" />
    <span className="relative z-10 text-xs lg:text-sm xl:text-base font-bold text-white whitespace-nowrap drop-shadow-lg">
      User Login
    </span>
    <div className="absolute inset-0 rounded-full ring-1 ring-white/20 group-hover:ring-white/40 transition-all duration-500" />
  </button>
));

const AdminLoginButton = memo(({ navigate }) => (
  <button
    onClick={() => navigate("/admin-login")}
    className="group relative overflow-hidden px-2.5 lg:px-4 xl:px-6 py-2 lg:py-2.5 xl:py-3 rounded-full transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />
    <div className="absolute inset-0 rounded-full border border-white/10 group-hover:border-fuchsia-500/30 transition-all duration-500" />
    <div className="relative flex items-center space-x-1.5 lg:space-x-2 text-white z-10">
      <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 xl:w-5 xl:h-5 transition-all duration-500 group-hover:rotate-12 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
      <span className="font-bold text-xs lg:text-sm xl:text-base whitespace-nowrap">Admin</span>
    </div>
  </button>
));

const ProfileDropdown = memo(({ avatarSrc, admin, currentUser, handleAdminLogout, handleUserLogout, goHome }) => (
  <div className="relative group">
    <div className="dropdown dropdown-end">
      <button
        tabIndex={0}
        className="group relative flex items-center p-0.5 lg:p-1 rounded-full transition-all duration-700 hover:scale-110 active:scale-95 will-change-transform"
      >
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-cyan-500 via-purple-600 to-fuchsia-500 rounded-full opacity-40 group-hover:opacity-70 blur-lg transition-all duration-700 animate-spin-slow will-change-transform" style={{ animationDuration: '6s' }} />
          <div className="relative w-8 h-8 md:w-9 md:h-9 lg:w-10 lg:h-10 xl:w-12 xl:h-12 rounded-full p-[2px] bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 group-hover:from-fuchsia-500 group-hover:via-purple-500 group-hover:to-cyan-400 transition-all duration-700">
            <div className="w-full h-full rounded-full overflow-hidden ring-2 ring-black/20">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full object-cover bg-slate-900"
                loading="lazy"
              />
            </div>
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 lg:w-3 lg:h-3 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 border-slate-900 shadow-[0_0_12px_rgba(34,197,94,0.8)] animate-pulse" />
        </div>
      </button>

      <ul
        tabIndex={0}
        className="dropdown-content mt-2 lg:mt-3 w-56 lg:w-64 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.4)] border border-white/10 py-2 lg:py-3 z-[60] animate-in slide-in-from-top-2 duration-300"
      >
        <div className="px-3 lg:px-4 py-2 lg:py-3 border-b border-white/10">
          <div className="flex items-center space-x-2 lg:space-x-3">
            <div className="relative w-8 h-8 lg:w-10 lg:h-10 rounded-full p-[2px] bg-gradient-to-r from-cyan-400 to-purple-600">
              <img
                src={avatarSrc}
                alt="Profile"
                className="w-full h-full rounded-full object-cover bg-slate-900"
                loading="lazy"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white truncate text-xs lg:text-sm drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                {admin ? admin.fullName : currentUser?.fullName}
              </p>
              <p className="text-xs flex items-center space-x-1 text-white/60">
                <span className={`w-1.5 h-1.5 lg:w-2 lg:h-2 rounded-full ${admin ? 'bg-purple-500 shadow-[0_0_8px_rgba(168,85,247,0.8)]' : 'bg-cyan-500 shadow-[0_0_8px_rgba(34,211,238,0.8)]'}`} />
                <span className="text-xs font-medium">{admin ? 'Administrator' : 'User Account'}</span>
              </p>
            </div>
          </div>
        </div>

        {!admin && (
          <li>
            <Link
              to="/profile"
              className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300 mx-1.5 lg:mx-2 rounded-xl group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <div className="relative p-1.5 lg:p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110 will-change-transform">
                <User className="w-3 h-3 lg:w-4 lg:h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
              </div>
              <span className="relative font-bold text-xs lg:text-sm">Profile Settings</span>
            </Link>
          </li>
        )}

        {admin && (
          <>
            <li>
              <Link
                to="/admin-dashboard"
                className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-purple-500/10 hover:to-fuchsia-500/10 transition-all duration-300 mx-1.5 lg:mx-2 rounded-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 to-fuchsia-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-1.5 lg:p-2 bg-purple-500/10 rounded-lg group-hover:bg-purple-500/20 transition-all duration-300 group-hover:scale-110 will-change-transform">
                  <Settings className="w-3 h-3 lg:w-4 lg:h-4 text-purple-400 drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                </div>
                <span className="relative font-bold text-xs lg:text-sm">Admin Dashboard</span>
              </Link>
            </li>
            <li>
              <Link
                to="/admin/profile"
                className="flex items-center space-x-2 lg:space-x-3 px-3 lg:px-4 py-2 lg:py-3 text-white/80 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500/10 hover:to-blue-500/10 transition-all duration-300 mx-1.5 lg:mx-2 rounded-xl group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 to-blue-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <div className="relative p-1.5 lg:p-2 bg-cyan-500/10 rounded-lg group-hover:bg-cyan-500/20 transition-all duration-300 group-hover:scale-110 will-change-transform">
                  <User className="w-3 h-3 lg:w-4 lg:h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                </div>
                <span className="relative font-bold text-xs lg:text-sm">Profile Settings</span>
              </Link>
            </li>
          </>
        )}

        <li className="my-1 lg:my-2">
          <div className="border-t border-white/10 mx-3 lg:mx-4" />
        </li>

        <li>
          <button
            onClick={admin ? handleAdminLogout : handleUserLogout}
            className="flex items-center space-x-2 lg:space-x-3 w-full px-3 lg:px-4 py-2 lg:py-3 text-red-400 hover:text-red-300 hover:bg-gradient-to-r hover:from-red-500/10 hover:to-pink-500/10 transition-all duration-300 mx-1.5 lg:mx-2 rounded-xl group relative overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            <div className="relative p-1.5 lg:p-2 bg-red-500/10 rounded-lg group-hover:bg-red-500/20 transition-all duration-300 group-hover:scale-110 will-change-transform">
              <LogOut className="w-3 h-3 lg:w-4 lg:h-4 text-red-400 drop-shadow-[0_0_8px_rgba(248,113,113,0.6)] transition-transform duration-300 group-hover:translate-x-0.5" />
            </div>
            <span className="relative font-bold text-xs lg:text-sm">Sign Out</span>
          </button>
        </li>
      </ul>
    </div>
  </div>
));

const MobileMenuButton = memo(({ isMobileMenuOpen, toggleMobileMenu }) => (
  <button
    onClick={toggleMobileMenu}
    className="group relative p-1.5 xs:p-2 transition-all duration-500 hover:scale-110 active:scale-95 rounded-xl overflow-hidden will-change-transform"
    aria-label="Toggle menu"
  >
    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-md" />
    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
    <div className="absolute inset-0 border border-white/10 group-hover:border-cyan-400/30 rounded-xl transition-all duration-500" />

    <div className="relative w-5 h-5 xs:w-6 xs:h-6 shrink-0 z-10">
      <Menu className={`absolute inset-0 w-full h-full text-white transition-all duration-500 ${isMobileMenuOpen ? 'opacity-0 rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'} drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]`} />
      <X className={`absolute inset-0 w-full h-full text-white transition-all duration-500 ${!isMobileMenuOpen ? 'opacity-0 -rotate-180 scale-0' : 'opacity-100 rotate-0 scale-100'} drop-shadow-[0_0_8px_rgba(217,70,239,0.6)]`} />
    </div>
  </button>
));

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const { admin } = useSelector((state) => state.admin);
  const { currentUser } = useSelector((state) => state.user);

  const isHome = location.pathname === '/';
  const isVerifyEmail = location.pathname === '/verify-email';

  const getInitials = useCallback((fullName) => {
    if (!fullName || typeof fullName !== 'string') return '';
    const parts = fullName.trim().split(/\s+/);
    const first = parts[0]?.[0] || '';
    const second = parts.length > 1 ? parts[1]?.[0] : (parts[0]?.[1] || '');
    return (first + second).toUpperCase();
  }, []);

  const handleUserLogout = useCallback(() => {
    dispatch(userLogout(navigate));
    setIsMobileMenuOpen(false);
  }, [dispatch, navigate]);

  const handleAdminLogout = useCallback(() => {
    dispatch(adminLogout(navigate));
    setIsMobileMenuOpen(false);
  }, [dispatch, navigate]);

  const goHome = useCallback(() => {
    if (admin) return navigate('/admin-dashboard');
    if (currentUser) return navigate('/main');
    navigate('/');
    setIsMobileMenuOpen(false);
  }, [admin, currentUser, navigate]);

  const avatarSrc = useMemo(() =>
    admin?.profileImage || currentUser?.profilePic || "/avatar.webp",
    [admin?.profileImage, currentUser?.profilePic]
  );

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const closeMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(false);
  }, []);

  return (
    <>
      <nav className="fixed top-0 left-0 right-0 z-50 will-change-transform">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-950/40 via-indigo-950/30 to-purple-950/40 backdrop-blur-[40px] backdrop-saturate-150" />
        <div className="absolute inset-0 opacity-[0.015]" style={{
          backgroundImage: `radial-gradient(circle at 2px 2px, rgb(99, 102, 241) 1px, transparent 0)`,
          backgroundSize: '48px 48px'
        }} />
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 h-[1px]">
          <div className="absolute inset-0 bg-gradient-to-r from-violet-500/0 via-fuchsia-500/50 to-violet-500/0 blur-sm" />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>

        <div className="relative w-full px-2 xs:px-3 sm:px-4 md:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="flex items-center justify-between h-14 xs:h-15 sm:h-16 lg:h-18 xl:h-20">

            <div className="flex items-center min-w-0 flex-1 md:flex-none">
              <LogoButton goHome={goHome} />
            </div>

            <div className="hidden md:flex items-center space-x-2 lg:space-x-4">
              {!currentUser && !admin && isHome && (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <UserLoginButton navigate={navigate} />
                  <AdminLoginButton navigate={navigate} />
                </div>
              )}

              {!currentUser && !admin && location.pathname === '/login' && (
                <AdminLoginButton navigate={navigate} />
              )}

              {!currentUser && !admin && location.pathname === '/admin-login' && (
                <UserLoginButton navigate={navigate} />
              )}

              {(currentUser || admin) && !isVerifyEmail && (
                <div className="flex items-center space-x-2 lg:space-x-3">
                  <button
                    onClick={goHome}
                    className="group hidden lg:inline-flex items-center space-x-1.5 lg:space-x-2 px-2.5 lg:px-4 py-1.5 lg:py-2 rounded-xl transition-all duration-500 hover:scale-105 active:scale-95 relative overflow-hidden will-change-transform"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-white/[0.05] to-white/[0.01] backdrop-blur-md" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 border border-white/10 group-hover:border-cyan-400/30 rounded-xl transition-all duration-500" />
                    <div className="relative z-10 flex items-center space-x-1.5 lg:space-x-2">
                      <Home className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-cyan-400 transition-all duration-500 group-hover:-translate-y-0.5 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
                      <span className="font-bold text-xs lg:text-sm text-white/90 group-hover:text-white whitespace-nowrap">Home</span>
                    </div>
                  </button>

                  {!admin && (
                    <div className="relative">
                      <NotificationCenter />
                    </div>
                  )}

                  <ProfileDropdown
                    avatarSrc={avatarSrc}
                    admin={admin}
                    currentUser={currentUser}
                    handleAdminLogout={handleAdminLogout}
                    handleUserLogout={handleUserLogout}
                    goHome={goHome}
                  />
                </div>
              )}
            </div>

            {!isVerifyEmail && (
              <div className="flex md:hidden items-center space-x-1.5 xs:space-x-2">
                {!admin && (currentUser || admin) && (
                  <div className="relative">
                    <NotificationCenter />
                  </div>
                )}
                <MobileMenuButton
                  isMobileMenuOpen={isMobileMenuOpen}
                  toggleMobileMenu={toggleMobileMenu}
                />
              </div>
            )}
          </div>
        </div>
      </nav>

      <div className={`fixed inset-0 z-40 md:hidden transition-all duration-500 ${isMobileMenuOpen ? 'opacity-100 visible' : 'opacity-0 invisible pointer-events-none'}`}>
        <div
          className="absolute inset-0 bg-black/60 backdrop-blur-md transition-all duration-500"
          onClick={closeMobileMenu}
        />

        <div className={`absolute top-14 xs:top-15 sm:top-16 left-1 right-1 xs:left-2 xs:right-2 sm:left-3 sm:right-3 transition-all duration-500 ${isMobileMenuOpen ? 'translate-y-0 scale-100 opacity-100' : '-translate-y-8 scale-95 opacity-0'} max-h-[calc(100vh-4rem)] xs:max-h-[calc(100vh-4.5rem)] sm:max-h-[calc(100vh-5rem)] overflow-y-auto will-change-transform`}>
          <div className="relative rounded-2xl xs:rounded-3xl overflow-hidden shadow-[0_8px_32px_rgba(0,0,0,0.6)]">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900/95 via-slate-800/95 to-slate-900/95 backdrop-blur-2xl" />
            <div className="absolute inset-0 opacity-[0.02]" style={{
              backgroundImage: `linear-gradient(rgba(34,211,238,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(34,211,238,0.3) 1px, transparent 1px)`,
              backgroundSize: '32px 32px'
            }} />
            <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent" />

            <div className="relative p-3 xs:p-4 sm:p-6 space-y-4 xs:space-y-5 sm:space-y-6">
              {!currentUser && !admin && isHome && (
                <div className="space-y-3 xs:space-y-4">
                  <button
                    onClick={() => {
                      navigate("/login");
                      closeMobileMenu();
                    }}
                    className="w-full group relative overflow-hidden px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent will-change-transform" />
                    <span className="relative z-10 text-sm xs:text-base font-black text-white drop-shadow-lg">User Login</span>
                    <div className="absolute inset-0 rounded-xl xs:rounded-2xl ring-1 ring-white/20 group-hover:ring-white/40 transition-all duration-500" />
                  </button>

                  <button
                    onClick={() => {
                      navigate("/admin-login");
                      closeMobileMenu();
                    }}
                    className="w-full group relative overflow-hidden px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-white/10 group-hover:border-fuchsia-500/30 transition-all duration-500" />
                    <div className="relative flex items-center justify-center space-x-2 xs:space-x-3 z-10">
                      <ShieldCheck className="w-4 h-4 xs:w-5 xs:h-5 transition-all duration-500 group-hover:rotate-12 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      <span className="font-black text-sm xs:text-base text-white">Admin Login</span>
                    </div>
                  </button>
                </div>
              )}

              {!currentUser && !admin && location.pathname === '/login' && (
                <div className="space-y-3 xs:space-y-4">
                  <button
                    onClick={() => {
                      navigate('/admin-login');
                      closeMobileMenu();
                    }}
                    className="w-full group relative overflow-hidden px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900/90 via-slate-800/90 to-slate-900/90 backdrop-blur-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-900/30 to-fuchsia-900/30 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-white/10 group-hover:border-fuchsia-500/30 transition-all duration-500" />
                    <div className="relative flex items-center justify-center space-x-2 xs:space-x-3 z-10">
                      <ShieldCheck className="w-4 h-4 xs:w-5 xs:h-5 transition-all duration-500 group-hover:rotate-12 text-white drop-shadow-[0_0_8px_rgba(168,85,247,0.6)]" />
                      <span className="font-black text-sm xs:text-base text-white">Admin Login</span>
                    </div>
                  </button>
                </div>
              )}

              {!currentUser && !admin && location.pathname === '/admin-login' && (
                <div className="space-y-3 xs:space-y-4">
                  <button
                    onClick={() => {
                      navigate('/login');
                      closeMobileMenu();
                    }}
                    className="w-full group relative overflow-hidden px-4 xs:px-5 sm:px-6 py-3 xs:py-3.5 sm:py-4 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                  >
                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 via-blue-600 to-purple-600 transition-all duration-500" />
                    <div className="absolute inset-0 bg-gradient-to-r from-purple-600 via-fuchsia-600 to-cyan-500 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                    <div className="absolute inset-0 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 bg-gradient-to-r from-transparent via-white/20 to-transparent will-change-transform" />
                    <span className="relative z-10 text-sm xs:text-base font-black text-white drop-shadow-lg">User Login</span>
                    <div className="absolute inset-0 rounded-xl xs:rounded-2xl ring-1 ring-white/20 group-hover:ring-white/40 transition-all duration-500" />
                  </button>
                </div>
              )}

              {(currentUser || admin) && (
                <div className="space-y-4 xs:space-y-5 sm:space-y-6">
                  <div className="relative overflow-hidden p-4 xs:p-5 sm:p-6 rounded-2xl xs:rounded-3xl">
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 via-slate-700/50 to-slate-800/50 backdrop-blur-xl" />
                    <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/[0.03] via-purple-500/[0.03] to-fuchsia-500/[0.03]" />
                    <div className="absolute inset-0 rounded-2xl xs:rounded-3xl border border-white/10" />

                    <div className="relative flex flex-col items-center space-y-3 xs:space-y-4">
                      <div className="relative">
                        <div className="absolute -inset-3 xs:-inset-4 bg-gradient-to-r from-cyan-500 via-purple-600 to-fuchsia-500 rounded-full opacity-30 blur-2xl animate-pulse" />
                        <div className="absolute -inset-2 xs:-inset-3 bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 rounded-full blur-sm animate-spin-slow will-change-transform" style={{ animationDuration: '8s' }} />
                        <div className="relative w-16 h-16 xs:w-18 xs:h-18 sm:w-20 sm:h-20 rounded-full p-[2px] bg-gradient-to-r from-cyan-400 via-purple-500 to-fuchsia-500">
                          <img
                            src={avatarSrc}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover bg-slate-900 ring-2 ring-black/20"
                            loading="lazy"
                          />
                        </div>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 xs:w-6 xs:h-6 bg-gradient-to-br from-green-400 to-emerald-500 rounded-full border-2 xs:border-3 border-slate-900 shadow-[0_0_16px_rgba(34,197,94,0.8)] flex items-center justify-center">
                          <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                        </div>
                      </div>

                      <div className="text-center space-y-1.5 xs:space-y-2">
                        <div className="font-black text-base xs:text-lg sm:text-xl text-white truncate max-w-full drop-shadow-[0_0_16px_rgba(255,255,255,0.3)]">
                          {admin ? admin.fullName : currentUser?.fullName}
                        </div>
                        <div className="flex items-center justify-center">
                          {admin ? (
                            <span className="inline-flex items-center gap-1 xs:gap-1.5 bg-gradient-to-r from-purple-500/20 to-fuchsia-500/20 backdrop-blur-sm text-purple-300 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-black tracking-wide border border-purple-400/30 shadow-[0_0_16px_rgba(168,85,247,0.3)]">
                              <ShieldCheck className="w-3 h-3 drop-shadow-[0_0_8px_rgba(168,85,247,0.8)]" />
                              <span>Admin</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 xs:gap-1.5 bg-gradient-to-r from-cyan-500/20 to-blue-500/20 backdrop-blur-sm text-cyan-300 px-2.5 xs:px-3 py-1 xs:py-1.5 rounded-full text-xs xs:text-sm font-black tracking-wide border border-cyan-400/30 shadow-[0_0_16px_rgba(34,211,238,0.3)]">
                              <User className="w-3 h-3 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
                              <span>User</span>
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2.5 xs:gap-3 sm:gap-4">
                    <button
                      onClick={() => {
                        goHome();
                        closeMobileMenu();
                      }}
                      className="group relative overflow-hidden flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/10 via-blue-500/10 to-cyan-600/10 backdrop-blur-md" />
                      <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-cyan-400/20 group-hover:border-cyan-400/40 transition-all duration-500" />
                      <div className="relative p-2 xs:p-2.5 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl xs:rounded-2xl group-hover:scale-110 transition-all duration-500 mb-2 xs:mb-3 shadow-[0_8px_32px_rgba(34,211,238,0.4)] will-change-transform">
                        <Home className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-all duration-500 group-hover:-translate-y-0.5 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      </div>
                      <span className="relative text-xs xs:text-sm font-black text-white text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Home</span>
                    </button>

                    <button
                      onClick={() => {
                        if (admin) {
                          navigate("/admin-dashboard");
                        } else {
                          navigate("/profile");
                        }
                        closeMobileMenu();
                      }}
                      className="group relative overflow-hidden flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 via-fuchsia-500/10 to-purple-600/10 backdrop-blur-md" />
                      <div className="absolute inset-0 bg-gradient-to-br from-purple-500/20 to-fuchsia-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-purple-400/20 group-hover:border-purple-400/40 transition-all duration-500" />
                      <div className="relative p-2 xs:p-2.5 sm:p-3 bg-gradient-to-br from-purple-500 to-fuchsia-600 rounded-xl xs:rounded-2xl group-hover:scale-110 transition-all duration-500 mb-2 xs:mb-3 shadow-[0_8px_32px_rgba(168,85,247,0.4)] will-change-transform">
                        {admin ? (
                          <Settings className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-all duration-500 group-hover:rotate-90 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        ) : (
                          <User className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        )}
                      </div>
                      <span className="relative text-xs xs:text-sm font-black text-white text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                        {admin ? 'Dashboard' : 'Profile'}
                      </span>
                    </button>

                    {!admin && (
                      <button
                        onClick={closeMobileMenu}
                        className="group relative overflow-hidden flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 via-emerald-500/10 to-green-600/10 backdrop-blur-md" />
                        <div className="absolute inset-0 bg-gradient-to-br from-green-500/20 to-emerald-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-green-400/20 group-hover:border-green-400/40 transition-all duration-500" />
                        <div className="relative p-2 xs:p-2.5 sm:p-3 bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl xs:rounded-2xl group-hover:scale-110 transition-all duration-500 mb-2 xs:mb-3 shadow-[0_8px_32px_rgba(34,197,94,0.4)] will-change-transform">
                          <Bell className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-all duration-500 group-hover:animate-pulse drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        </div>
                        <span className="relative text-xs xs:text-sm font-black text-white text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Notifications</span>
                      </button>
                    )}

                    {admin && (
                      <button
                        onClick={() => {
                          navigate("/admin/profile");
                          closeMobileMenu();
                        }}
                        className="group relative overflow-hidden flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                      >
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-blue-500/10 to-indigo-600/10 backdrop-blur-md" />
                        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/20 to-blue-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                        <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-indigo-400/20 group-hover:border-indigo-400/40 transition-all duration-500" />
                        <div className="relative p-2 xs:p-2.5 sm:p-3 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-xl xs:rounded-2xl group-hover:scale-110 transition-all duration-500 mb-2 xs:mb-3 shadow-[0_8px_32px_rgba(99,102,241,0.4)] will-change-transform">
                          <User className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-all duration-500 group-hover:scale-110 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                        </div>
                        <span className="relative text-xs xs:text-sm font-black text-white text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Profile</span>
                      </button>
                    )}

                    <button
                      onClick={admin ? handleAdminLogout : handleUserLogout}
                      className="group relative overflow-hidden flex flex-col items-center justify-center p-3 xs:p-4 sm:p-6 rounded-xl xs:rounded-2xl transition-all duration-500 hover:scale-105 active:scale-95 will-change-transform"
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/10 via-pink-500/10 to-red-600/10 backdrop-blur-md" />
                      <div className="absolute inset-0 bg-gradient-to-br from-red-500/20 to-pink-600/20 opacity-0 group-hover:opacity-100 transition-all duration-500" />
                      <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-red-400/20 group-hover:border-red-400/40 transition-all duration-500" />
                      <div className="relative p-2 xs:p-2.5 sm:p-3 bg-gradient-to-br from-red-500 to-pink-600 rounded-xl xs:rounded-2xl group-hover:scale-110 transition-all duration-500 mb-2 xs:mb-3 shadow-[0_8px_32px_rgba(239,68,68,0.4)] will-change-transform">
                        <LogOut className="w-4 h-4 xs:w-5 xs:h-5 sm:w-6 sm:h-6 text-white transition-all duration-500 group-hover:translate-x-1 drop-shadow-[0_0_8px_rgba(255,255,255,0.8)]" />
                      </div>
                      <span className="relative text-xs xs:text-sm font-black text-white text-center drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">Sign Out</span>
                    </button>
                  </div>

                  {!admin && (
                    <div className="relative overflow-hidden p-3 xs:p-4 rounded-xl xs:rounded-2xl">
                      <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-slate-700/50 backdrop-blur-xl" />
                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/[0.02] to-blue-500/[0.02]" />
                      <div className="absolute inset-0 rounded-xl xs:rounded-2xl border border-white/10" />
                      <div className="relative">
                        <h3 className="text-xs xs:text-sm font-black text-white/90 mb-2 flex items-center space-x-1.5 xs:space-x-2 drop-shadow-[0_0_8px_rgba(255,255,255,0.3)]">
                          <Bell className="w-3 h-3 xs:w-4 xs:h-4 text-cyan-400 drop-shadow-[0_0_8px_rgba(34,211,238,0.6)]" />
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
      </div>

      <style jsx>{`
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </>
  );
};

export default Navbar;