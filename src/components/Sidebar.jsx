import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Compass, FolderHeart, History, Users, Flame } from 'lucide-react';
// 👇 Hook up your global auth provider context
import { useAuth } from '../context/AuthContext'; 

export default function Sidebar({ isOpen, onCloseDrawer }) {
  const location = useLocation();
  const { isAuthenticated } = useAuth();

  // Define the base paths matching your app router engine configuration
  const links = [
    { icon: Home, label: 'Home', path: '/' },
    { icon: Flame, label: 'Trending', path: '/trending' },
    { icon: Compass, label: 'Explore', path: '/explore' },
    // 💡 Auth-locked structural elements below
    { icon: History, label: 'History', path: '/history', requiresAuth: true },
    { icon: FolderHeart, label: 'Liked', path: '/liked', requiresAuth: true },
    { icon: Users, label: 'Subscribed', path: '/subscribed', requiresAuth: true },
  ];

  return (
    <>
      {/* 1. MOBILE BACKDROP OVERLAY */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-30 md:hidden animate-fadeIn"
          onClick={onCloseDrawer} // 👈 Clicking the layout dim backdrop now closes the side menu cleanly
        />
      )}

      {/* 2. THE MAIN SIDEBAR COMPONENT */}
      <aside 
        className={`fixed top-14 left-0 h-[calc(100vh-3.5rem)] bg-zinc-950 pt-2 z-40 transition-all duration-300 ease-in-out border-r border-zinc-900 select-none overflow-x-hidden overflow-y-auto scrollbar-thin
          ${isOpen 
            ? 'w-64 px-3 translate-x-0' 
            : 'w-0 -translate-x-full md:translate-x-0 md:w-20 md:px-2'
          }`}
      >
        <div className="flex flex-col gap-1">
          {links.map((item, idx) => {
            // Skip rendering private profile layout options if a guest is browsing
            if (item.requiresAuth && !isAuthenticated) return null;

            const Icon = item.icon;
            // Match structural active paths dynamically from browser window context
            const isActive = location.pathname === item.path;

            return (
              <Link
                key={idx}
                to={item.path}
                onClick={onCloseDrawer} // Close drawer on mobile immediately upon route change selection
                className={`flex items-center rounded-xl transition-all w-full group relative outline-none
                  ${isOpen 
                    ? 'flex-row gap-5 px-4 py-3 justify-start' 
                    : 'flex-col gap-1 py-3 px-1 justify-center'
                  }
                  ${isActive 
                    ? 'bg-zinc-800 font-semibold text-white' 
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900/80'
                  }`}
              >
                {/* Visual indicator bar on the left for active items */}
                {isActive && isOpen && (
                  <div className="absolute left-0 top-3 bottom-3 w-1 bg-red-600 rounded-r-full" />
                )}

                <Icon 
                  className={`w-5 h-5 shrink-0 transition-transform group-hover:scale-105
                    ${isActive ? 'text-red-500' : 'text-zinc-400 group-hover:text-zinc-200'}`} 
                />
                
                <span 
                  className={`tracking-wide truncate transition-all duration-150
                    ${isOpen 
                      ? 'text-sm' 
                      : 'text-[10px] font-medium max-w-full text-center'
                    }`}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </aside>
    </>
  );
}