import React, { useEffect } from 'react';
import './App.css';
import { Routes, Route, Navigate } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Navbar from "./componenets/Navbar.jsx";
import SignUpPage from './pages/SignUpPage.jsx';
import LoginPage from "./pages/LoginPage.jsx";
import EmailVerificationPage from './pages/EmailVerificationPage.jsx';
import { Toaster } from 'react-hot-toast';
import { useDispatch, useSelector } from 'react-redux';
import { Loader } from 'lucide-react';
import { checkAuth } from './redux/user/userSlice.js';

function App() {
  const dispatch = useDispatch();
  const { currentUser, isCheckingAuth } = useSelector((state) => state.user);

  useEffect(() => {
    dispatch(checkAuth());
  }, [dispatch]);

  if (isCheckingAuth && !currentUser) {
    reutrn(
      <div className="flex item-center justify-center h-screen">
        <Loader className='size-10 animate-spin' />
      </div>
    );
  }

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={currentUser ? <HomePage /> : <Navigate to="/login" />} />
        <Route path='/signup' element={!currentUser ? <SignUpPage /> : <Navigate to="/" />} />
        <Route path='/login' element={!currentUser ? <LoginPage /> : <Navigate to="/" />} />
        <Route path='/verify-email' element={<EmailVerificationPage />} />
      </Routes>

      <Toaster />
    </div>
  );
}

export default App;
