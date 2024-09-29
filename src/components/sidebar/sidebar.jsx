import React, { useState } from 'react';
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

const Sidebar = () => {
  const [openProjectsBtn, setOpenProjectsBtn] = useState(false);
  const [projects, setProjects] = useState([]);
  const [selectedProject, setSelectedProject] = useState(null); // Store selected project
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

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
      navigate(`/project/${projectId}`, { state: { project: projectResponse.data } }); 
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };

  const cookies = new Cookies();
  const user = cookies.get("user");
  const handleLogout = () => {
      cookies.remove('user', { path: '/' });
      window.location.reload();
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

      <div className="p-4">
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

        <div className="px-5 py-4">
        <Divider className="bg-gray-200 mx-4" />
        </div>

        <List>
          <ListItem button component={Link} to={ROUTES.BASE}>
            <ListItemIcon>
              <Home className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItem>

          <ListItem button  component={Link} onClick={handleProjectsClick}>
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
                  className="pl-12" 
                  key={project.id} 
                  onClick={() => handleProjectSelect(project.id)}
                >
                  <span className="text-blue-500 mr-2 ml-7">&#x25A0;</span>
                  <ListItemText primary={project.name} />
                </ListItem>
              ))}
            </List>
          </Collapse>

          <ListItem button  component={Link} to={ROUTES.INSTRUMENTS}>
            <ListItemIcon>
              <BuildOutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Instruments" />
          </ListItem>

          <ListItem button>
            <ListItemIcon>
              <BrokenImageOutlinedIcon className="text-black" />
            </ListItemIcon>
            <ListItemText primary="Photos and Files" />
          </ListItem>

          <ListItem button component={Link} onClick={handleLogout}  >
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
          <UserInfo />
        </ListItem>
      </div>

      {selectedProject && (
        <div className="project-details">
          <h2>{selectedProject.name}</h2>
          <p>{selectedProject.description}</p>
        </div>
      )}
    </div>
  );
};

export default Sidebar;

