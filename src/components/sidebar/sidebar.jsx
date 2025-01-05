import React, { useState, useEffect } from "react";
import { Divider, List, ListItem, ListItemIcon, ListItemText, Collapse, Drawer } from "@mui/material";
import {
  Menu as MenuIcon,
  Search,
  ExpandLess,
  ExpandMore,
} from "@mui/icons-material";
import NotificationIcon from "@mui/icons-material/NotificationsNoneOutlined";
import Home from "@mui/icons-material/HomeOutlined";
import PollOutlinedIcon from "@mui/icons-material/PollOutlined";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import BuildOutlinedIcon from "@mui/icons-material/BuildOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import DeleteOutlinedIcon from "@mui/icons-material/DeleteOutlined";
import { Link, useNavigate } from "react-router-dom";
import { ROUTES } from "../../pages/routes/routes";
import UserInfo from "../userinfo";
import { projectService } from "../../APIs/Services/project.service";
import Cookies from "universal-cookie";
import NotificationModal from "../notification/notification";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/authContext";
import { notificationService } from "../../APIs/Services/notification.service";
import { useMediaQuery } from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import { useTranslation } from 'react-i18next';

const Sidebar = ({ isSidebarOpen, toggleSidebar }) => {
  const { t } = useTranslation();

  const [openProjectsBtn, setOpenProjectsBtn] = useState(false);
  const [projects, setProjects] = useState([]);
  const { user } = useAuth();
  const decodedToken = user?.token ? jwtDecode(user.token) : null;
  const userId = decodedToken?.["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  const navigate = useNavigate();
  const [selectedProject, setSelectedProject] = useState(null);

  const handleProjectsClick = async () => {
    setOpenProjectsBtn(!openProjectsBtn);
    if (!openProjectsBtn && projects.length === 0) {
      try {
        const response = await projectService.getAll();
        setProjects(response.data);
      } catch (error) {
        console.error("Error fetching projects:", error);
      }
    }
  };

  const handleProjectSelect = async (projectId) => {
    try {
      const projectResponse = await projectService.getById(projectId);
      setSelectedProject(projectResponse.data); 
      navigate(`/project/${projectId}`, { state: { project: projectResponse.data } }); 
      //console.log(projectResponse.data)
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
      //console.log(userId)
      const response = await notificationService.getAll(userId);
      //console.log(response.data)
      const unreadNotifications = response.data.filter((notification) => !notification.isRead);
    } catch (error) {
      //console.error('Error fetching notifications:', error);
    }
  };
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleLogout = () => {
    const cookies = new Cookies();
    cookies.remove("user", { path: "/" });
    window.location.reload();
  };
  const isMobile = useMediaQuery("(max-width:1023px)"); 

  var isAdmin = false
  const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || []; 
  if (userRoles.includes("Company_Owner")) {

      isAdmin = true;
  }
  var isUser = false
  if (userRoles.includes("User")) {
    isUser = true;
  }

  return (
    <div className="flex">
      <Drawer
        variant={isMobile ? "temporary" : "persistent"}
        anchor="left"
        open={isMobile ? isSidebarOpen : true}
        onClose={toggleSidebar}
        PaperProps={{ style: { width: "256px", backgroundColor: "#F8F8F8" } }}
      >
        <div className="flex bg-[#F8F8F8] fixed overflow-y-auto z-50">
          {/* Sidebar */}
          <div className="w-64 bg-[#F8F8F8] text-black flex flex-col h-screen">
            <div>
              {/* Company Logo */}
              <div className="CompanyLogo px-4 pt-4">
                <div className="flex items-end">
                  <img
                    src='/BauEnergy logo.png'
                    alt="Company Logo"
                    className="w-[76px] h-[58px] pb-[6px]"

                  />
                  <div className="ml-1 text-2xl font-bold text-[#843c0c]">BauEnergy</div>
                </div>
              </div>

              {/* Navigation */}
              <div className="p-4 flex flex-col h-full">
              <div className="flex-grow">

                <List>

                {!isUser && (
                  <ListItem
                      button
                      component={Link}
                      className="!rounded-xl"
                      onClick={() => {
                        navigate("/instruments", { state: { focusSearch: true } });
                        if (isMobile) toggleSidebar();
                      }}
                    >
                      <ListItemIcon style={{ minWidth: "20px" }} className="mr-3">
                        <Search className="text-black" />
                      </ListItemIcon>
                      <ListItemText primary= {t("Search")}/>
                  </ListItem>   
                )}

                </List>

                <List>
                  <ListItem button className="!rounded-xl" onClick={() => {handleNotificationClick(); if (isMobile) toggleSidebar();
}} component={Link}>
                    <ListItemIcon style={{ minWidth: "20px" }} className="mr-3">
                      <NotificationIcon className="text-black" />
                    </ListItemIcon>
                    <ListItemText primary={t("Notifications")}/>
                  </ListItem>
                </List>

                {isAdmin && (
                  <List>
                    <ListItem button component={Link} to={ROUTES.SETTINGSANDTEAMS} className="!rounded-xl" 
                  onClick={() => {
                    if (isMobile) toggleSidebar();
                  }}>
                      <ListItemIcon style={{ minWidth: "20px" }} className="mr-3">
                        <SettingsOutlinedIcon className="text-black" />
                      </ListItemIcon>
                      <ListItemText primary={t("SettingTeams")} />
                    </ListItem>
                  </List>
                )}

                <div className="px-5 py-4">
                  <Divider className="bg-gray-200 mx-4" />
                </div>

                {/* Projects */}
                <List>
                  <ListItem button component={Link} to={ROUTES.BASE} className="!rounded-xl" 
                  onClick={() => {
                    if (isMobile) toggleSidebar();
                  }}>
                    <ListItemIcon>
                      <Home className="text-black" />
                    </ListItemIcon>
                    <ListItemText primary={t("Home")} />
                  </ListItem>

                  <ListItem button component={Link} to={ROUTES.CERTIFICATE} className="!rounded-xl"
                  onClick={() => {
                    if (isMobile) toggleSidebar();
                  }}>
                    <ListItemIcon>
                      <WorkspacePremiumIcon className="text-black" />
                    </ListItemIcon>
                    <ListItemText primary={t("Tutorial")} />
                  </ListItem>

                  <ListItem button component={Link} onClick={handleProjectsClick} className="!rounded-xl">
                    <ListItemIcon>
                      <PollOutlinedIcon className="text-black" />
                    </ListItemIcon>
                    <ListItemText primary={t("Projects")}/>
                    {openProjectsBtn ? <ExpandLess /> : <ExpandMore />}
                  </ListItem>

                  <Collapse in={openProjectsBtn} timeout="auto" unmountOnExit={false}>
                    <List component="div" disablePadding>
                      {projects.map((project) => (
                        <ListItem
                          button
                          component={Link}
                          className="pl-12 rounded-xl"
                          key={project.id}
                          onClick={
                            () => {handleProjectSelect(project.id); if (isMobile) toggleSidebar();}
                          }
                        >
                          <span className="text-[#1D34D8] mr-2 ml-7">&#x25A0;</span>
                          <ListItemText primary={project.name} />
                        </ListItem>
                      ))}
                    </List>
                  </Collapse>

                  {!isUser && (
                    <ListItem button component={Link} to={ROUTES.INSTRUMENTS} className="!rounded-xl"  
                    onClick={() => {
                      if (isMobile) toggleSidebar();
                    }}>
                      <ListItemIcon>
                        <BuildOutlinedIcon className="text-black" />
                      </ListItemIcon>
                      <ListItemText primary={t("Instruments")} />
                    </ListItem>
                  )}   

                  {!isUser && (
                    <ListItem button component={Link} to={ROUTES.DOCUMENTS} className="!rounded-xl"
                    onClick={() => {
                      if (isMobile) toggleSidebar();
                    }}>
                      <ListItemIcon>
                        <DeleteOutlinedIcon className="text-black" />
                      </ListItemIcon>
                      <ListItemText primary={t("Trahsbin")} /> 
                    </ListItem>
                  )}   

                  <ListItem button component={Link} onClick={handleLogout} className="!rounded-xl">
                    <ListItemIcon>
                      <LogoutOutlinedIcon className="text-black" />
                    </ListItemIcon>
                    <ListItemText primary={t("Logout")} />
                  </ListItem>
                </List>

              {/* Bottom User Info */}
              <div className="">
                <Divider className="bg-gray-200 mx-4" />
                <ListItem div>
                  <UserInfo />
                </ListItem>

              </div>
                </div>

                <ListItem
                    className="!mt-4 cursor-pointer"
                    onClick={() => window.open("https://www.musts.io/", "_blank")}
                >
                    <img
                        src="/Powered by logo.png"
                        alt="BauEnergy Login"
                        className="w-[174px] h-[35px]"
                    />
                </ListItem>
              </div>
            </div>

          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-y-auto"></div>

          <NotificationModal
            open={isNotificationModalOpen}
            onClose={handleNotificationModalClose}
            style={{ zIndex: 2500 }}
          />
        </div>
      </Drawer>
    </div>
  );
};

export default Sidebar;
