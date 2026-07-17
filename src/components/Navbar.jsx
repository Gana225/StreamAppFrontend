import React, { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, Search, Video, Bell, User as UserIcon, LogOut, ArrowLeft, Settings } from 'lucide-react';
// 👇 Import your useAuth custom hook
import { useAuth } from '../context/AuthContext'; 

export default function Navbar({ onMenuToggle }) {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showProfileDropdown, setShowProfileDropdown] = useState(false);
  
  //  Consume authentication state and profile fields dynamically from your context
  const { user, logout, isAuthenticated } = useAuth();
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowProfileDropdown(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      // 👇 Navigate to search results page passing query params
      navigate(`/search?q=${encodeURIComponent(searchQuery.trim())}`);
      setShowMobileSearch(false); // Close mobile overlay if active
    }
  };

  const handleLogout = async () => {
    await logout(); // 👈 This natively wipes the local storage and resets the context user state smoothly
    setShowProfileDropdown(false);
    navigate('/auth');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-14 bg-zinc-950 border-b border-zinc-800 flex items-center justify-between px-4 z-50 text-zinc-100 select-none">
      
      {/* 1. MOBILE-ONLY FULL OVERLAY SEARCH STATE */}
      {showMobileSearch ? (
        <form onSubmit={handleSearchSubmit} className="flex md:hidden w-full items-center gap-2 animate-fadeIn">
          <button 
            type="button"
            onClick={() => setShowMobileSearch(false)}
            className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-zinc-400" />
          </button>
          <div className="flex-1 flex items-center bg-zinc-900 border border-zinc-700 rounded-full pl-4 overflow-hidden focus-within:border-blue-500 transition-all">
            <input
              type="text"
              autoFocus
              placeholder="Search videos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-transparent outline-none text-sm placeholder-zinc-500 py-1.5 text-zinc-100"
            />
            <button type="submit" className="bg-zinc-800 border-l border-zinc-700 px-5 py-2 hover:bg-zinc-700 transition-colors">
              <Search className="w-4 h-4 text-zinc-300" />
            </button>
          </div>
        </form>
      ) : (
        /* 2. REGULAR NAVIGATION CONTENT CONTAINER */
        <>
          {/* Left Block: Burger & Brand */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button 
              onClick={onMenuToggle}
              className="p-2 hover:bg-zinc-800 rounded-full transition-colors"
              aria-label="Toggle Navigation Drawer"
            >
              <Menu className="w-5 h-5" />
            </button>
            
            <Link to="/" className="flex items-center gap-2 cursor-pointer group active:scale-95 transition-transform">
              <div className="bg-red-600 p-1.5 rounded-lg group-hover:bg-red-700 transition-colors shadow-lg shadow-red-600/10">
                <Video className="w-4 h-4 sm:w-5 sm:h-5 text-white fill-current" />
              </div>
              <span className="text-lg sm:text-xl font-black tracking-tighter bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                StreamFlux
              </span>
            </Link>
          </div>

          {/* Center Block: Desktop Layout Search Bar */}
          <form 
            onSubmit={handleSearchSubmit} 
            className="hidden md:flex flex-1 max-w-[600px] mx-4 items-center"
          >
            <div className="w-full flex items-center bg-zinc-900 border border-zinc-800 rounded-l-full px-4 py-1.5 focus-within:border-blue-500 focus-within:bg-zinc-950 transition-all">
              <input
                type="text"
                placeholder="Search videos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-transparent outline-none text-sm placeholder-zinc-500 text-zinc-100"
              />
            </div>
            <button type="submit" className="bg-zinc-800 border-y border-r border-zinc-800 px-6 py-1.5 rounded-r-full hover:bg-zinc-700 text-zinc-300 hover:text-white transition-all">
              <Search className="w-4 h-4" />
            </button>
          </form>

          {/* Right Block: Dynamic Controls & Profile Setup */}
          <div className="flex items-center gap-1 sm:gap-3">
            {/* Small Screen Search Toggle Button */}
            <button 
              type="button"
              onClick={() => setShowMobileSearch(true)}
              className="md:hidden p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-300"
            >
              <Search className="w-5 h-5" />
            </button>

            <Link to="/upload" className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-300 hidden sm:block" title="Create / Upload">
              <Video className="w-5 h-5" />
            </Link>
            
            <button className="p-2 hover:bg-zinc-800 rounded-full transition-colors text-zinc-300 relative" title="Notifications">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-blue-500 rounded-full ring-2 ring-zinc-950" />
            </button>
            
            {/* Contextual Profile Menu Dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button 
                onClick={() => setShowProfileDropdown(!showProfileDropdown)}
                className="w-8 h-8 rounded-full overflow-hidden bg-gradient-to-tr from-indigo-500 to-purple-500 flex items-center justify-center cursor-pointer hover:scale-105 active:scale-95 transition-all ring-1 ring-zinc-700 hover:ring-2 hover:ring-zinc-400"
              >
                {/* 💡 Display actual user avatar if available, otherwise fall back to icon */}
                {isAuthenticated && user?.avatar_url ? (
                  <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <UserIcon className="w-4 h-4 text-white" />
                )}
              </button>

              {showProfileDropdown && (
                <div className="absolute right-0 mt-3 w-56 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl py-1.5 z-50 animate-fadeIn transform origin-top-right">
                  <div className="px-4 py-2.5 border-b border-zinc-800">
                    {isAuthenticated ? (
                      <>
                        {/* 💡 Safely read the real custom username from context payload */}
                        <p className="text-sm font-semibold text-zinc-200 truncate">
                          {user?.username || 'Logged In'}
                        </p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">
                          {user?.email || 'Welcome back!'}
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-sm font-semibold text-zinc-200">Guest User</p>
                        <p className="text-xs text-zinc-500 truncate mt-0.5">Please sign in</p>
                      </>
                    )}
                  </div>
                  
                  <div className="p-1">
                    {isAuthenticated ? (
                      <>
                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left">
                          <UserIcon className="w-4 h-4 text-zinc-400" />
                          View Channel
                        </button>

                        <button
                          onClick={() => {
                            setShowProfileDropdown(false);
                            navigate('/upload');
                          }}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                        >
                          <Video className="w-4 h-4 text-zinc-400" />
                          Upload Video
                        </button>

                        <button className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left">
                          <Settings className="w-4 h-4 text-zinc-400" />
                          Settings
                        </button>

                        <hr className="border-zinc-800 my-1 mx-2" />

                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-3 px-3 py-2 text-sm text-red-400 hover:bg-red-950/30 rounded-lg transition-colors text-left"
                        >
                          <LogOut className="w-4 h-4" />
                          Sign Out
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => {
                          setShowProfileDropdown(false);
                          navigate('/auth');
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-800 rounded-lg transition-colors text-left"
                      >
                        <UserIcon className="w-4 h-4" />
                        Sign In
                      </button>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </nav>
  );
}