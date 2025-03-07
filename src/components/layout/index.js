import React, { useState } from 'react'
import Appbar from '../appbar/appbar'
import Sidebar from '../sidebar/sidebar'
import {Toolbar, Typography, useMediaQuery } from '@mui/material';


function Layout({ children }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const isMobile = useMediaQuery('(max-width:1024px)'); 

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };



  return (
    <div className="flex ">
      {/* Sidebar */}
      <nav className="h-screen lg:bg-blue-500">
        <Sidebar isSidebarOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />
      </nav>
      {/* Problem px-5 here  */}
      <div className="flex-grow px-5 h-full mt-3 lg:ml-[260px] overflow-x-hidden">
        {/* Appbar */}
        <Appbar position="static" className="bg-blue-200 "  toggleSidebar={toggleSidebar} >
          <Toolbar>
            <Typography variant="h6" component="div" className="flex-grow">
              App Title
            </Typography>
          </Toolbar>
        </Appbar>

        {/* Main Content */}
        <main className="p-0 sm:p-6 ">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout