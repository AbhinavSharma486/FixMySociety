import React from 'react';
import './App.css';
import { Routes, Route } from "react-router-dom";
import HomePage from "./pages/HomePage.jsx";
import Navbar from "./componenets/Navbar.jsx";


function App() {

  return (
    <div>
      <Navbar />
      <Routes>
        <Route path='/' element={<HomePage />} />
      </Routes>
      <h1 className='text-3xl font-bold underline text-purple-600'>Hello World</h1>
    </div>
  );
}

export default App;
