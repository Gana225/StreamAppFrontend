import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Sidebar from '../components/Sidebar';

export default function MainLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const isWatchPage = location.pathname.startsWith('/watch');
  const isAuthPage = location.pathname === '/auth'; 

  useEffect(() => {
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  }, [location.pathname]);

  return (
    <div className="min-h-screen bg-zinc-950 text-white">
      <Navbar onMenuToggle={() => setSidebarOpen(!sidebarOpen)} />

      <div className="flex">
        {/* Hide sidebar entirely on the auth/login page layout */}
        {!isAuthPage && (
          <Sidebar 
            isOpen={sidebarOpen} 
            onCloseDrawer={() => setSidebarOpen(false)} 
          />
        )}

        <main
          className={`flex-1 w-full min-h-[calc(100vh-3.5rem)] pt-16 pb-12 px-4 transition-all duration-300 ease-in-out
            ${isAuthPage ? 'ml-0' : sidebarOpen ? 'md:ml-64' : 'md:ml-20'}`}
        >
          {/* Wrap watch page content inside a responsive container to center it without breaking sidebar space */}
          <div className={isWatchPage ? 'max-w-5xl mx-auto w-full' : 'w-full'}>
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}