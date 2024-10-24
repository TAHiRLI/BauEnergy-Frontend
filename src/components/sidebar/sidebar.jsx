import React, { useState, useEffect } from 'react';
import { Divider, List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
import { Search } from '@mui/icons-material';
import NotificationIcon from '@mui/icons-material/NotificationsNoneOutlined';
import Home from '@mui/icons-material/HomeOutlined';
import PollOutlinedIcon from '@mui/icons-material/PollOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import BrokenImageOutlinedIcon from '@mui/icons-material/BrokenImageOutlined';
import { ExpandLess, ExpandMore } from '@mui/icons-material';
import { Link, useNavigate } from 'react-router-dom';
import { ROUTES } from '../../pages/routes/routes';
import UserInfo from '../userinfo';
import { projectService } from '../../APIs/Services/project.service'; 
import Cookies from "universal-cookie";
import NotificationModal from '../notification/notification';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from "../../context/authContext";
import { notificationService } from '../../APIs/Services/notification.service';


const Sidebar = () => {
  const [openProjectsBtn, setOpenProjectsBtn] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // Store selected project
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const { user } = useAuth(); 
  
  const decodedToken = user?.token ? jwtDecode(user.token) : null;

  const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  

  const navigate = useNavigate();

  const handleProjectsClick = async () => {
    setOpenProjectsBtn(!openProjectsBtn);

    if (!openProjectsBtn && projects.length === 0) { 
      setLoading(true);
      setError(false);

      try {
        const response = await projectService.getAll();
        setProjects(response.data); 
        setLoading(false);
      } catch (error) {
        console.error("Error fetching projects:", error);
        setError(true);
        setLoading(false);
      }
    }
  };

  const handleProjectSelect = async (projectId) => {
    try {
      const projectResponse = await projectService.getById(projectId);
      setSelectedProject(projectResponse.data); 
      // console.log(selectedProject)
      navigate(`/project/${projectId}`, { state: { project: projectResponse.data } }); 
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);

  const handleNotificationClick = () => {
    setIsNotificationModalOpen(true);
  };

  const handleNotificationModalClose = () => {
    setIsNotificationModalOpen(false);
    fetchNotifications();
  };

  const fetchNotifications = async () => {
    try {
      console.log(userId)
      const response = await notificationService.getAll(userId);
      //console.log(response.data)
      const unreadNotifications = response.data.filter(notification => !notification.isRead);
    } catch (error) {
      //console.error('Error fetching notifications:', error);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);


  const handleSearchBtnClick = () => {
    navigate('/instruments', { state: { focusSearch: true } });
  };

  const cookies = new Cookies();
  //const user = cookies.get("user");
  const handleLogout = () => {
      cookies.remove('user', { path: '/' });
      window.location.reload();
  };

  return (
    <div className="flex bg-[#F8F8F8] fixed overflow-y-auto z-50">
      {/* Sidebar */}
      <div className="w-64 bg-[#F8F8F8] text-black flex flex-col h-screen">
        <div>
          {/* Company Logo */}
          <div className="CompanyLogo px-4 pt-4">
            <div className="flex items-center mb-3">
              <img
                src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/logo/BauEnergylogo.png`}
                alt="Company Logo"
                className="w-12 h-12"
              />
              <span className="ml-4 text-xl font-bold">BauEnergy</span>
            </div>
            <span className="text-lg">Dashboard</span>
          </div>

          {/* Navigation */}
          <div className="p-4">
            <List>
              <ListItem button component={Link} className='!rounded-xl' onClick={() => navigate('/instruments', { state: { focusSearch: true } })}  // Use query params instead of state
    >
                <ListItemIcon style={{ minWidth: '20px' }} className="mr-3">
                  <Search className="text-black" />
                </ListItemIcon>
                <ListItemText primary="Search" />
              </ListItem>
            </List>

            <List>
              <ListItem button className='!rounded-xl' onClick={handleNotificationClick}
              >
                <ListItemIcon style={{ minWidth: '20px' }} className="mr-3">
                  <NotificationIcon className="text-black" />
                </ListItemIcon>
                <ListItemText primary="Notifications" />
              </ListItem>
            </List>

            <List>
              <ListItem button className='!rounded-xl'>
                <ListItemIcon style={{ minWidth: '20px' }} className="mr-3">
                  <SettingsOutlinedIcon className="text-black" />
                </ListItemIcon>
                <ListItemText primary="Settings and Teams" />
              </ListItem>
            </List>

            <div className="px-5 py-4">
              <Divider className="bg-gray-200 mx-4" />
            </div>

            {/* Projects */}
            <List>
              <ListItem button component={Link} to={ROUTES.BASE} className='!rounded-xl'>
                <ListItemIcon>
                  <Home className="text-black" />
                </ListItemIcon>
                <ListItemText primary="Home" />
              </ListItem>

              <ListItem button component={Link} onClick={handleProjectsClick} className='!rounded-xl'>
                <ListItemIcon>
                  <PollOutlinedIcon className="text-black" />
                </ListItemIcon>
                <ListItemText primary="Projects" />
                {openProjectsBtn ? <ExpandLess /> : <ExpandMore />}
              </ListItem>
              <Collapse in={openProjectsBtn} timeout="auto" unmountOnExit={false}>
                <List component="div" disablePadding>
                  {projects.map((project) => (
                    <ListItem
                      button component={Link}
                      className="pl-12 rounded-xl"
                      key={project.id}
                      onClick={() => handleProjectSelect(project.id)}
                    >
                      <span className="text-[#1D34D8] mr-2 ml-7">&#x25A0;</span>
                      <ListItemText primary={project.name} />
                    </ListItem>
                  ))}
                </List>
              </Collapse>

              <ListItem button component={Link} to={ROUTES.INSTRUMENTS} className='!rounded-xl'>
                <ListItemIcon>
                  <BuildOutlinedIcon className="text-black" />
                </ListItemIcon>
                <ListItemText primary="Instruments" />
              </ListItem>

              <ListItem button component={Link} onClick={handleLogout} className='!rounded-xl'>
                <ListItemIcon>
                  <LogoutOutlinedIcon className="text-black" />
                </ListItemIcon>
                <ListItemText primary="Logout" />
              </ListItem>
            </List>
          </div>
          
        </div>

        {/* Bottom User Info */}
        <div className="px-4">
          <Divider className="bg-gray-200 mx-4" />
          <ListItem div>
            <UserInfo />
          </ListItem>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto">
        {/* Place the main content here */}
      </div>
      <NotificationModal 
              open={isNotificationModalOpen} 
              onClose={handleNotificationModalClose} 
              style={{ zIndex: 2500 }}
            />
    </div>

  );
};

export default Sidebar;

