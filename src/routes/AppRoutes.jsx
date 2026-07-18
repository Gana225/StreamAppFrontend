import React from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import MainLayout from '../layouts/MainLayout';
import Home from '../pages/Home';
import Auth from '../pages/Auth';
import Upload from '../pages/Upload';
import Watch from '../pages/Watch';
import SearchPage from "../pages/SearchPage";

// 👇 Import your new feature pages
import Trending from '../pages/Trending';
import History from '../pages/History';

export default function AppRoutes() {
  const navigate = useNavigate();

  const handleAuthSuccess = () => { navigate("/"); };

  return (
    <Routes>
      {/* Main layout wrapper containing descendant paths */}
        <Route path="*" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="auth" element={<Auth onAuthSuccess={handleAuthSuccess}/>} />
        <Route path="search" element={<SearchPage />} />
        <Route path="upload" element={<Upload />} />
        <Route path="watch/:id" element={<Watch />} />
        <Route path="trending" element={<Trending />} />
        <Route path="history" element={<History />} />
      </Route>
    </Routes>
  );
}