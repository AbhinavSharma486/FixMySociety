import React from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Navbar from "./componenets/Navbar.jsx";
import SignUpPage from './pages/SignUpPage.jsx';

function App() {

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
        <Route path='/signup' element={<SignUpPage />} />
      </Routes>

    </div>
  );
}

export default App;
