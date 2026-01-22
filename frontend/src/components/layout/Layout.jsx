import React from 'react';
import Sidebar from './Sidebar';
import Breadcrumb from '../Breadcrumb';

function Layout({ children }) {
  return (
    <div className="min-h-screen bg-slate-950 flex">
      {/* Left Sidebar */}
      <Sidebar />
      
      {/* Main Content Area */}
      <div className="flex-1 ml-64">
        {/* Main Content */}
        <main className="p-8">
          <Breadcrumb />
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout;
