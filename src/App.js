import './App.css';
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import RegisterPage from './components/auth/RegisterPage';
import LoginPage from './components/auth/LoginPage';
import HomePage from './components/chat/HomePage';
import AdminPage from './components/admin/AdminPage';
import { AdminRoute } from './components/service/guard';
import Navbar from './components/chat/Navbar';
import ProfilePage from './components/profile/ProfilePage';

function App() {
  return (
    <BrowserRouter>
      <div className="App">
        <Navbar/>
        <div className="content">
          <Routes>
            <Route path="/" element={<Navigate to="/login" />} />
            <Route exact path="/register" element={<RegisterPage />} />
            <Route exact path="/login" element={<LoginPage />} />
            <Route exact path="/home" element={<HomePage />} />
            <Route exact path="/profile" element={<ProfilePage />} />

            <Route exact path="/admin" element={<AdminPage />} />
            
          </Routes>
        </div>
      </div>
    </BrowserRouter>
  );
}

export default App;
