import React, { useState } from 'react';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Search } from '@mui/icons-material';
import NotificationIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Home from '@mui/icons-material/HomeOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import QrCode2OutlinedIcon from '@mui/icons-material/QrCode2Outlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../pages/routes/routes';
import UserInfo from '../userinfo';

const Sidebar = () => {
  const [openProjectsBtn, setopenProjectsBtn] = useState(false);

  const handleProjectsClick = () => {
    setopenProjectsBtn(!openProjectsBtn);
  };

  return (
    <div className="h-full w-64 bg-gray-100 text-black flex flex-col ">
      <div className="CompanyLogo px-4 pt-4">
        <div className="flex items-center mb-3">
          <img
            src={process.env.REACT_APP_LOGO_URL}
            alt="Company Logo"
            className="w-12 h-12"
          />
          <span className="ml-4 text-xl font-bold">BauEnergy</span>
        </div>
        <span className="text-lg ">Dashboard</span>
      </div>

      <div className="px-4">
        <List>
          <ListItem button>
            <ListItemIcon style={{ minWidth: '20px' }} className="mr-3">
              <Search className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Search" />
          </ListItem>
        </List>

        <List>
          <ListItem button>
            <ListItemIcon style={{ minWidth: '20px' }} className="mr-3">
              <NotificationIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Notifications" />
          </ListItem>
        </List>

        <List>
          <ListItem button>
            <ListItemIcon style={{ minWidth: '20px' }} className="mr-3">
              <SettingsOutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Settings and Teams" />
          </ListItem>
        </List>
      </div>

      <div className="px-5 py-4">
        <Divider className="bg-gray-200 mx-4" />
      </div>

      {/* Bottom section */}
      <div className="p-4">
        <List>
          <ListItem button>
            <ListItemIcon>
              <Home className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          {/* Projects dropdown */}
          <ListItem button onClick={handleProjectsClick}>
            <ListItemIcon>
              <PollOutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Projects" />
            {openProjectsBtn ? <ExpandLess /> : <ExpandMore />}
          </ListItem>
          <Collapse in={openProjectsBtn} timeout="auto" unmountOnExit>
            <List component="div" disablePadding>
              <ListItem button className="pl-12">
                <span className="text-blue-500 mr-2 ml-7">&#x25A0;</span>
                <ListItemText primary="Bau Energy" />
              </ListItem>
              <ListItem button className="pl-12">
                <span className="text-blue-500 mr-2 ml-7">&#x25A0;</span>
                <ListItemText primary="Construction" />
              </ListItem>
            </List>
          </Collapse>

          <ListItem button >
            <ListItemIcon>
              <BuildOutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Instruments" />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <QrCode2OutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="QR" />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <BrokenImageOutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Photos and Files" />
          </ListItem>

          <ListItem button component={Link} to={ROUTES.BASE}>
            <ListItemIcon>
              <LogoutOutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItem>
        </List>
      </div>

      <div className="px-5 py-4">
        <Divider className="bg-gray-200 mx-4" />
      </div>

      <div className="px-4">
          <ListItem div>
            
            <UserInfo/>

          </ListItem>
      </div>
    </div>

    
  );
};

export default Sidebar;
