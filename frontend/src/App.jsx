import React, { useEffect, useState, Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { LoaderCircle } from 'lucide-react';
import { checkAuth } from './redux/user/userSlice.js';
import { checkAdminAuth } from './redux/admin/adminSlice.js';
import ScrollToTop from './components/ScrollToTop.jsx';

// Lazy-loaded components
const LoginPage = lazy(() => import('./pages/LoginPage.jsx'));
const ProfilePage = lazy(() => import('./pages/ProfilePage.jsx'));
const MainPage = lazy(() => import('./pages/MainPage.jsx'));
const HomePage = lazy(() => import('./pages/HomePage.jsx'));
const ReportIssuePage = lazy(() => import('./pages/ReportIssuePage.jsx'));
const ViewComplaintPage = lazy(() => import('./pages/ViewComplaintPage.jsx'));
const EditComplaintPage = lazy(() => import('./pages/EditComplaintPage.jsx'));
const AdminLoginPage = lazy(() => import('./Admin/pages/LoginPage.jsx'));
const AdminDashboard = lazy(() => import('./Admin/pages/AdminDashboard.jsx'));
const BuildingDetailsPage = lazy(() => import('./Admin/pages/BuildingDetailsPage.jsx'));
const BuildingResidentsPage = lazy(() => import('./Admin/pages/BuildingResidentsPage.jsx'));
const AdminBuildingComplaintsPage = lazy(() => import('./Admin/pages/AdminBuildingComplaintsPage.jsx'));
const AdminComplaintDetailsPage = lazy(() => import('./Admin/pages/AdminComplaintDetailsPage.jsx'));
const AdminProfilePage = lazy(() => import('./Admin/pages/AdminProfilePage.jsx'));

function App() {
  const theme = useSelector((state) => state.theme.theme);
  const { currentUser, isCheckingAuth } = useSelector((state) => state.user);
  const { admin, isCheckingAuth: isCheckingAdminAuth } = useSelector((state) => state.admin);

  const dispatch = useDispatch();
  const location = useLocation();

  const [prevAuthState, setPrevAuthState] = useState(null);
  const [showMainPage, setShowMainPage] = useState(false);

  const skipAuthRoutes = [];
  const shouldCheckAuth = !skipAuthRoutes.includes(location.pathname);

  useEffect(() => {
    if (shouldCheckAuth) {
      if (!currentUser) {
        dispatch(checkAuth());
      }
      if (!admin) {
        dispatch(checkAdminAuth());
      }
    }
  }, [dispatch, shouldCheckAuth, currentUser, admin]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (shouldCheckAuth && !isCheckingAuth && !isCheckingAdminAuth) {
      setPrevAuthState(!!currentUser || !!admin);
    }
  }, [currentUser, admin, isCheckingAuth, isCheckingAdminAuth, prevAuthState, shouldCheckAuth]);

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

  if (isCheckingAuth || isCheckingAdminAuth) {
    return (
      <div className="flex items-center justify-center h-screen">
        <LoaderCircle className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <>
      <Navbar />
      <ScrollToTop />
      <Suspense
        fallback={
          <div className="flex items-center justify-center h-screen">
            <LoaderCircle className="size-10 animate-spin" />
          </div>
        }
      >
        <Routes>
          {/* User Routes */}
          <Route
            path="/"
            element={!currentUser ? <HomePage /> : <Navigate to="/main" />}
          />
          <Route
            path="/login"
            element={!currentUser ? <LoginPage /> : <Navigate to="/main" />}
          />
          <Route
            path="/profile"
            element={currentUser ? <ProfilePage /> : <Navigate to="/main" />}
          />
          <Route
            path="/main"
            element={
              currentUser ? (
                showMainPage ? (
                  <MainPage />
                ) : (
                  <div className="flex items-center justify-center h-screen">
                    <LoaderCircle className="size-10 animate-spin" />
                  </div>
                )
              ) : (
                <Navigate to="/" />
              )
            }
          />
          <Route
            path="/create-complaint"
            element={currentUser ? <ReportIssuePage /> : <Navigate to="/login" />}
          />
          <Route
            path="/complaints/:id"
            element={currentUser ? <ViewComplaintPage /> : <Navigate to="/login" />}
          />
          <Route
            path="/edit-complaint/:id"
            element={currentUser ? <EditComplaintPage /> : <Navigate to="/login" />}
          />

          {/* Admin Routes */}
          <Route
            path="/admin-login"
            element={!admin ? <AdminLoginPage /> : <Navigate to="/admin-dashboard" />}
          />
          <Route
            path="/admin-dashboard"
            element={admin ? <AdminDashboard /> : <Navigate to="/admin-login" />}
          />
          <Route
            path="/admin/building/:buildingId/complaints"
            element={
              admin ? (
                <AdminBuildingComplaintsPage />
              ) : (
                <Navigate to="/admin-login" />
              )
            }
          />
          <Route
            path="/admin/complaints/:id"
            element={
              admin ? <AdminComplaintDetailsPage /> : <Navigate to="/admin-login" />
            }
          />
          <Route
            path="/admin/building/:id"
            element={
              admin ? <BuildingDetailsPage /> : <Navigate to="/admin-login" />
            }
          />
          <Route
            path="/admin/building/:id/residents"
            element={
              admin ? <BuildingResidentsPage /> : <Navigate to="/admin-login" />
            }
          />
          <Route
            path="/admin/profile"
            element={admin ? <AdminProfilePage /> : <Navigate to="/admin-login" />}
          />
        </Routes>
      </Suspense>
      <Toaster />
    </>
  );
}

export default App;
