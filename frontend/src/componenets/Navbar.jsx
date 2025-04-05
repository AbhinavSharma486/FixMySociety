import React from 'react';
import { useDispatch, useSelector } from "react-redux";
import { setTheme } from "../redux/theme/themeSlice.js";
import { logout } from "../redux/user/userSlice.js";
import { useNavigate, useLocation } from "react-router-dom";
import { Building2 } from 'lucide-react';

const Navbar = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  const { currentUser } = useSelector((state) => state.user);
  const theme = useSelector((state) => state.theme.theme);

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    dispatch(setTheme(newTheme));
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  React.useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  const handleLogout = () => {
    dispatch(logout(navigate));
  };

  return (
    <div className="navbar bg-base-100 shadow-2xl border-b border-base-300 fixed w-full top-0 z-40 backdrop-blur-lg px-4 sm:px-6 md:px-8 lg:px-12 py-2">
      {/* Web App Name */}
      <div className="flex-1 flex items-center">
        <a href='/' className="flex items-center gap-2 text-lg sm:text-xl md:text-2xl font-bold">
          <Building2 className="w-6 h-6 sm:w-7 sm:h-7" />
          FixMySociety
        </a>
      </div>

      {/* Right Side */}
      <div className="flex items-center gap-1 sm:gap-2 md:gap-3 lg:gap-4">
        {/* Theme Toggle Button */}
        <label className="swap swap-rotate mx-1 sm:mx-2">
          <input type="checkbox" onChange={toggleTheme} checked={theme === 'dark'} />
          {/* Sun Icon */}
          <svg className="swap-on h-6 w-6 sm:h-6 sm:w-6 md:h-6 md:w-6 fill-current" viewBox="0 0 24 24">
            <path d="M5.64,17l-.71.71a1,1,0,0,0,0,1.41,1,1,0,0,0,1.41,0l.71-.71A1,1,0,0,0,5.64,17ZM5,12a1,1,0,0,0-1-1H3a1,1,0,0,0,0,2H4A1,1,0,0,0,5,12Zm7-7a1,1,0,0,0,1-1V3a1,1,0,0,0-2,0V4A1,1,0,0,0,12,5ZM5.64,7.05a1,1,0,0,0,.7.29,1,1,0,0,0,.71-.29,1,1,0,0,0,0-1.41l-.71-.71A1,1,0,0,0,4.93,6.34Zm12,.29a1,1,0,0,0,.7-.29l.71-.71a1,1,0,1,0-1.41-1.41L17,5.64a1,1,0,0,0,0,1.41A1,1,0,0,0,17.66,7.34ZM21,11H20a1,1,0,0,0,0,2h1a1,1,0,0,0,0-2Zm-9,8a1,1,0,0,0-1,1v1a1,1,0,0,0,2,0V20A1,1,0,0,0,12,19ZM18.36,17A1,1,0,0,0,17,18.36l.71.71a1,1,0,0,0,1.41,0,1,1,0,0,0,0-1.41Z" />
          </svg>
          {/* Moon Icon */}
          <svg className="swap-off h-6 w-6 sm:h-6 sm:w-6 md:h-6 md:w-6 fill-current" viewBox="0 0 24 24">
            <path d="M21.64,13a1,1,0,0,0-1.05-.14,8.05,8.05,0,0,1-3.37.73A8.15,8.15,0,0,1,9.08,5.49a8.59,8.59,0,0,1,.25-2A1,1,0,0,0,8,2.36,10.14,10.14,0,1,0,22,14.05,1,1,0,0,0,21.64,13Zm-9.5,6.69A8.14,8.14,0,0,1,7.08,5.22v.27A10.15,10.15,0,0,0,17.22,15.63a9.79,9.79,0,0,0,2.1-.22A8.11,8.11,0,0,1,12.14,19.73Z" />
          </svg>
        </label>

        {/* Sign Up Button */}
        {!currentUser && location.pathname === '/' && (
          <button
            onClick={() => navigate("/signup")}
            className="btn-navbar-signup"
          >
            Sign Up
          </button>
        )}

        {/* Logged-in User Options */}
        {currentUser && (
          <>
            {/* Notification Bell */}
            <button className="btn btn-ghost btn-circle mx-1 sm:mx-2">
              <div className="indicator">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="badge badge-xs badge-success indicator-item"></span>
              </div>
            </button>

            {/* User Profile Dropdown */}
            <div className="flex-none">
              <div className="dropdown dropdown-end">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                  <div className="w-7 sm:w-8 md:w-9 lg:w-10 rounded-full">
                    <img
                      alt="User profile"
                      src={currentUser?.profilePic}
                    />
                  </div>
                </div>
                <ul tabIndex={0} className="menu menu-sm md:menu-md dropdown-content bg-base-100 rounded-box z-10 mt-3 w-20 shadow-2xl">
                  <li><a href="/profile">Profile</a></li>
                  <li><a href="/settings">Settings</a></li>
                  <li><button onClick={handleLogout}>Logout</button></li>
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Navbar;
