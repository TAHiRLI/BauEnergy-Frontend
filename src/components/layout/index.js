import React from 'react'
import Appbar from '../appbar/appbar'
import Sidebar from '../sidebar/sidebar'
import {Toolbar, Typography } from '@mui/material';


function Layout({ children }) {
  return (
    <div className="flex ">
      {/* Sidebar */}
      <nav className="h-screen lg:bg-blue-500">
        <Sidebar />
      </nav>

      <div className="flex-grow px-5 h-full mt-3 lg:ml-[260px]">
        {/* Appbar */}
        <Appbar position="static" className="bg-blue-200 " >
          <Toolbar>
            <Typography variant="h6" component="div" className="flex-grow">
              App Title
            </Typography>
          </Toolbar>
        </Appbar>

        {/* Main Content */}
        <main className="p-0 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout