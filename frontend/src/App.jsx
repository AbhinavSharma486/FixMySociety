import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { LoaderCircle } from 'lucide-react';
import { checkAuth } from './redux/user/userSlice.js';
import ProfilePage from './pages/ProfilePage.jsx';
import MainPage from './pages/MainPage.jsx';
import "./App.css";
import HomePage from './pages/HomePage.jsx';
import ReportIssuePage from './pages/ReportIssuePage.jsx';
import ViewComplaintPage from './pages/ViewComplaintPage.jsx';
import EditComplaintPage from './pages/EditComplaintPage.jsx';
import ScrollToTop from './components/ScrollToTop.jsx';
// import MobileOptimizedLayout from './components/MobileOptimizedLayout.jsx';

// Admin Imports
import AdminLoginPage from "./Admin/pages/LoginPage.jsx";
import AdminDashboard from './Admin/pages/AdminDashboard.jsx';
import BuildingDetailsPage from './Admin/pages/BuildingDetailsPage.jsx';
import BuildingResidentsPage from './Admin/pages/BuildingResidentsPage.jsx';
import AdminBuildingComplaintsPage from './Admin/pages/AdminBuildingComplaintsPage.jsx'; // New Admin Building Complaints Page
import AdminComplaintDetailsPage from './Admin/pages/AdminComplaintDetailsPage.jsx'; // New Admin Complaint Details Page
import AdminProfilePage from './Admin/pages/AdminProfilePage.jsx'; // New Admin Profile Page

function App() {
  const theme = useSelector((state) => state.theme.theme);
  const { currentUser, isCheckingAuth } = useSelector((state) => state.user);
  const { admin } = useSelector((state) => state.admin);

  const dispatch = useDispatch();
  const location = useLocation();

  const [prevAuthState, setPrevAuthState] = useState(null);
  const [showMainPage, setShowMainPage] = useState(false);

  const skipAuthRoutes = [];
  const shouldCheckAuth = !skipAuthRoutes.includes(location.pathname);

  useEffect(() => {
    if (shouldCheckAuth && !currentUser) {
      dispatch(checkAuth());
    }
  }, [dispatch, shouldCheckAuth, currentUser]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  useEffect(() => {
    if (shouldCheckAuth && !isCheckingAuth) {
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

  // if (shouldCheckAuth && isCheckingAuth && !currentUser) {
  //   return (
  //     <div className="flex items-center justify-center h-screen">
  //       <LoaderCircle className="size-10 animate-spin" />
  //     </div>
  //   );
  // }

  if (isCheckingAuth) {
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
      <Routes>
        <Route path='/' element={!currentUser ? <HomePage /> : <Navigate to="/main" />} />
        <Route path='/login' element={!currentUser ? <LoginPage /> : <Navigate to="/main" />} />
        <Route path='/profile' element={currentUser ? <ProfilePage /> : <Navigate to={"/main"} />} />
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
        <Route path='/create-complaint' element={currentUser ? <ReportIssuePage /> : <Navigate to="/login" />} />
        <Route path='/complaints/:id' element={currentUser ? <ViewComplaintPage /> : <Navigate to="/login" />} />
        <Route path='/edit-complaint/:id' element={currentUser ? <EditComplaintPage /> : <Navigate to="/login" />} />

        {/* Admin Routes */}

        <Route path='/admin-login' element={!admin ? <AdminLoginPage /> : <Navigate to="/admin-dashboard" />} />
        <Route path='/admin-dashboard' element={admin ? <AdminDashboard /> : <Navigate to="/admin-login" />} />
        <Route path='/admin/building/:buildingId/complaints' element={admin ? <AdminBuildingComplaintsPage /> : <Navigate to="/admin-login" />} /> {/* New route for building-specific complaints */}
        <Route path='/admin/complaints/:id' element={admin ? <AdminComplaintDetailsPage /> : <Navigate to="/admin-login" />} /> {/* New route for generic admin complaint details */}
        <Route path='/admin/building/:id' element={admin ? <BuildingDetailsPage /> : <Navigate to="/admin-login" />} />
        <Route path='/admin/building/:id/residents' element={admin ? <BuildingResidentsPage /> : <Navigate to="/admin-login" />} />
        <Route path='/admin/profile' element={admin ? <AdminProfilePage /> : <Navigate to="/admin-login" />} /> {/* New route for Admin Profile Page */}

      </Routes>
      <Toaster />
      {/* </Routes> */}
    </>
  );
}

export default App;