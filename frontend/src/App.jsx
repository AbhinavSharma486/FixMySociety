import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Navbar from "./components/Navbar.jsx";
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { LoaderCircle } from 'lucide-react';
import { checkAuth } from './redux/user/userSlice.js';
import ProfilePage from './pages/ProfilePage.jsx';
import MainPage from './pages/MainPage.jsx';
import "./App.css";
import ForgetPassword from './pages/ForgetPassword.jsx';
import ResetPasswordPage from './pages/ResetPasswordPage.jsx';

// Admin Imports
import AdminLoginPage from "./Admin/pages/LoginPage.jsx";
import AdminDashboard from './Admin/pages/AdminDashboard.jsx';

function App() {
  const theme = useSelector((state) => state.theme.theme);
  const { currentUser, isCheckingAuth } = useSelector((state) => state.user);
  const { admin } = useSelector((state) => state.admin);

  const dispatch = useDispatch();
  const location = useLocation();

  const [prevAuthState, setPrevAuthState] = useState(null);
  const [showMainPage, setShowMainPage] = useState(false);

  const skipAuthRoutes = ['/signup', '/verify-email'];
  const shouldCheckAuth = !skipAuthRoutes.includes(location.pathname);

  useEffect(() => {
    if (shouldCheckAuth) {
      dispatch(checkAuth());
    }
  }, [dispatch, shouldCheckAuth]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (shouldCheckAuth && !isCheckingAuth) {
      if (prevAuthState === false && currentUser) {
        // ✅ Delay the reload to allow toast to display
        setTimeout(() => {
          window.location.reload();
        }, 1500); // 1.5 seconds delay
      }
      setPrevAuthState(!!currentUser);
    }
  }, [currentUser, isCheckingAuth, prevAuthState, shouldCheckAuth]);

  useEffect(() => {
    if (location.pathname === '/main' && currentUser) {
      const timer = setTimeout(() => {
        setShowMainPage(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowMainPage(false);
    }
  }, [location.pathname, currentUser]);

  if (shouldCheckAuth && isCheckingAuth && !currentUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={!currentUser ? <HomePage /> : <Navigate to="/main" />} />
        <Route path='/signup' element={!currentUser ? <SignUpPage /> : <Navigate to="/verify-email" />} />
        <Route path='/login' element={!currentUser ? <LoginPage /> : <Navigate to="/main" />} />
        <Route path='/verify-email' element={<EmailVerificationPage />} />
        <Route path='/profile' element={currentUser ? <ProfilePage /> : <Navigate to={"/main"} />} />
        <Route path='/forget-password' element={!currentUser ? <ForgetPassword /> : <Navigate to="/main" />} />
        <Route path='/reset-password/:token' element={!currentUser ? <ResetPasswordPage /> : <Navigate to="/main" />} />
        <Route
          path='/main'
          element={
            currentUser
              ? (showMainPage ? <MainPage /> : (
                <div className="flex items-center justify-center h-screen">
                  <LoaderCircle className="size-10 animate-spin" />
                </div>
              ))
              : <Navigate to={"/"} />
          }
        />



        {/* Admin Routes */}

        <Route path='/admin-login' element={!admin ? <AdminLoginPage /> : <Navigate to="/admin-dashboard" />} />
        <Route path='/admin-dashboard' element={admin ? <AdminDashboard /> : <Navigate to="admin-login" />} />

      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
