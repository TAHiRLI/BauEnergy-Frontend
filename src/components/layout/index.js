import React from 'react'
import Appbar from '../appbar/appbar'
import Navbar from '../leftnavbar/navbar'
import { AppBar, Toolbar, Typography } from '@mui/material';


// function Layout({children}) {
//   return (
//     <>
//       <nav className="flex justify-end">
//         <div className='w-4/5'>
//           <Appbar/>
//         </div>
//       </nav>

//       <nav>
//         <Navbar/>
//       </nav>

        
//       {/* <main>
//         {children}
//       </main> */}
//     </>
//   )
// }

function Layout({ children }) {
  return (
    <div className="flex">
      {/* Sidebar */}
      <nav className="w-64 h-screen bg-blue-500">
        <Navbar />
      </nav>

      <div className="flex-grow px-5 ">
        {/* Appbar */}
        <Appbar position="static" className="bg-blue-500" >
          <Toolbar>
            <Typography variant="h6" component="div" className="flex-grow">
              App Title
            </Typography>
          </Toolbar>
        </Appbar>

        {/* Main Content */}
        <main className="p-6 ">
          {children}
        </main>
      </div>
    </div>
  );
}

export default Layout