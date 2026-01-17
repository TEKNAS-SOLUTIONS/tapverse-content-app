import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import Breadcrumb from './Breadcrumb';

// SVG Icon Components
const HomeIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
  </svg>
);

const FolderIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
  </svg>
);

const KeyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
  </svg>
);

const ChartIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
  </svg>
);

const PlugIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
  </svg>
);

const GearIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

const ChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const AdminChatIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

function Layout({ children }) {
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [logoError, setLogoError] = useState(false);
  
  // Get user role from localStorage
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const navItems = [
    { path: '/', label: 'Home', icon: HomeIcon },
    { path: '/clients', label: 'Clients', icon: UsersIcon },
    { path: '/chat', label: 'Chat', icon: ChatIcon },
    ...(isAdmin ? [{ path: '/admin-chat', label: 'Admin Chat', icon: AdminChatIcon }] : []),
    { path: '/admin', label: 'Settings', icon: GearIcon },
  ];
  
  const isActive = (path) => {
    if (path === '/') return location.pathname === '/';
    return location.pathname.startsWith(path);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Left Sidebar - Collapsible */}
      <aside className={`${sidebarOpen ? 'w-64' : 'w-16'} bg-white border-r border-gray-200 transition-all duration-300 ease-in-out flex-shrink-0`}>
        {/* Logo Section */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200">
          {sidebarOpen ? (
            <>
              <Link to="/" className="flex items-center space-x-3">
                {!logoError ? (
                  <img 
                    src="/logo.png" 
                    alt="Tapverse" 
                    className="h-8 w-auto"
                    onError={() => setLogoError(true)}
                  />
                ) : (
                  <span className="text-lg font-semibold text-gray-900">
                    Tapverse
                  </span>
                )}
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Collapse sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                </svg>
              </button>
            </>
          ) : (
            <div className="w-full flex items-center justify-center">
              <button
                onClick={() => setSidebarOpen(true)}
                className="p-1.5 rounded-xl text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label="Expand sidebar"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          )}
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center ${sidebarOpen ? 'px-4 py-3' : 'px-3 py-3 justify-center'} rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive(item.path)
                  ? 'bg-orange-50 text-orange-600 border border-orange-200'
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
              }`}
              title={!sidebarOpen ? item.label : ''}
            >
              <span className={sidebarOpen ? 'mr-3' : ''}>
                {React.createElement(item.icon)}
              </span>
              {sidebarOpen && <span>{item.label}</span>}
            </Link>
          ))}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Header */}
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-6">
          <Breadcrumb />
          <div className="flex items-center space-x-4">
            {/* User menu */}
            <div className="flex items-center space-x-3">
              <span className="text-sm text-gray-600">
                {JSON.parse(localStorage.getItem('user') || '{}')?.fullName || JSON.parse(localStorage.getItem('user') || '{}')?.email || 'User'}
              </span>
              <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded-full">
                {JSON.parse(localStorage.getItem('user') || '{}')?.role || 'user'}
              </span>
              <button
                onClick={() => {
                  localStorage.removeItem('authToken');
                  localStorage.removeItem('user');
                  window.location.href = '/login';
                }}
                className="text-sm text-gray-600 hover:text-orange-600"
              >
                Logout
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 overflow-auto bg-gray-50">
          <div className="max-w-7xl mx-auto px-6 py-8">
            {children}
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-white border-t border-gray-200 py-4 px-6">
          <p className="text-center text-gray-500 text-sm">
            © 2026 Tapverse Content Automation System
          </p>
        </footer>
      </div>
    </div>
  );
}

export default Layout;
