import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import AccountCircle from '@mui/icons-material/AccountCircle';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import UserInfo from '../userinfo';
import { useEffect, useState } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from "../../context/authContext";
import * as Yup from 'yup';
import { projectService } from '../../APIs/Services/project.service';
import Swal from 'sweetalert2';
import { Formik, Form, Field } from 'formik';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel, useMediaQuery } from '@mui/material';
import NotificationModal from '../notification/notification';
import { notificationService } from '../../APIs/Services/notification.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell} from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';


export default function Appbar({ toggleSidebar }) {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const { user } = useAuth(); 
  
  const decodedToken = user?.token ? jwtDecode(user.token) : null;

  const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  
  useEffect(() => {
    if (openDialog) {
      //fetchAllTeamMembers(); 
    }
  }, [openDialog]);

  const handleNotificationClick = () => {
    setOpenNotifications(true);
  };

  
  const fetchNotifications = async () => {
    try {
      console.log(userId)
      const response = await notificationService.getAll(userId);
      //console.log(response.data)
      const unreadNotifications = response.data.filter(notification => !notification.isRead);
      setUnreadCount(unreadNotifications.length); 
    } catch (error) {
      //console.error('Error fetching notifications:', error);
    }
  };
  
  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId]);

  const handleNotificationClose = () => {
    setOpenNotifications(false);
    fetchNotifications();
  };

  // const validationSchema = Yup.object({
  //   name: Yup.string().required('Required'),
  //   lastName: Yup.string().required('Required'),
  //   email: Yup.string().email('Invalid email').required('Required'),
  //   role: Yup.number().required('Required'),
  //   image: Yup.mixed().nullable(),
  // });

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('Name', values.Name);
      formData.append('Description', values.Description);
      formData.append('StartDate', values.StartDate);
      formData.append('EndDate', values.EndDate);
      formData.append('Address', values.Address);

      await projectService.add(formData ); 
      Swal.fire('Success', 'Project has been added!', 'success');
      window.location.reload(); 
      resetForm();
      setOpenDialog(false); 
      //dispatch({ type: ProjectsActions.success, payload: response.data.teamMembers });
    } catch (error) {
      console.error('Error adding project:', error);
      Swal.fire('Error', 'Failed to add project.', 'error');
      setOpenDialog(false)
    } finally {
      setSubmitting(false);
    }
  };

  const handleProfileMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
          onClick={handleNotificationClick}
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
      </MenuItem>
      <MenuItem>
        <IconButton size="large" aria-label="create new project" color="inherit" onClick={() => setOpenDialog(true)}
        >
            <AddIcon />
        </IconButton>
        <p>Create Project</p>
      </MenuItem>
      <MenuItem onClick={handleProfileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );
  const isMobile = useMediaQuery('(max-width:1023px)'); // Check if screen size is <= 1024px

  return (
    <Box sx={{ flexGrow: 1}} >
      <AppBar position="static" className='rounded-t-xl' sx={{backgroundColor: '#F1F3FD'}}>
        <Toolbar>
              {isMobile && (
        <IconButton onClick={toggleSidebar} aria-label="menu">
          <MenuIcon />
        </IconButton>
      )}

          <UserInfo/>
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }} className='!flex !justify-center !items-center'>
          <div className='flex justify-center items-center gap-5 p-2 pr-6'>
            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              color="inherit"
              onClick={handleNotificationClick}
              sx={{
                display: { xs: 'none', md: 'flex' }, 
                width: '30px',     
                height: '30px',    
                borderRadius: '50%',
                padding: 0,        
                backgroundColor: 'white', 
                '&:hover': {
                backgroundColor: 'white', 
                boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)', 
              },
              }}
            >
              <Badge badgeContent={unreadCount} color="error" sx={{
                  display: { xs: 'none', md: 'block' },  
                }}>
              <FontAwesomeIcon icon={faBell} className='text-lg text-black bg-white rounded-full p-[6px] '/>
                {/* <NotificationsNoneOutlinedIcon className='bg-white rounded-full p-1 !text-black !text-3xl !font-thin' /> */}
              </Badge>
            </IconButton>

            <IconButton
              size="large"
              edge="end"
              aria-label="account of current user"
              aria-controls={menuId}
              aria-haspopup="true"
              onClick={handleProfileMenuOpen}
              color="inherit"
              sx={{
                display: { xs: 'none', md: 'flex' }, 
                width: '30px',     
                height: '30px',    
                borderRadius: '50%',
                padding: 0,        
                backgroundColor: 'white',
                '&:hover': {
                  backgroundColor: 'white',
                  boxShadow: '0px 5px 15px rgba(0, 0, 0, 0.1)',
                },
              }}
            >
              <FontAwesomeIcon
                icon={faEllipsis}
                className="text-lg text-black"
                style={{
                  padding: '6px',    
                  borderRadius: '50%',
                }}
              />
            </IconButton>

            <Button
              variant="contained"
              className="!ml-6 !bg-[#1D34D8] !rounded-3xl !py-2 !text-base sm:text-xs"
              onClick={() => setOpenDialog(true)}
              sx={{ ml: 2, textTransform: "none",display: { xs: 'none', md: 'flex' }, 
            }}
            >
              Create new project
            </Button>
          </div>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              sx={{
                bgcolor: 'white',     // white background
                color: 'black',       // black icon color
                borderRadius: '50%',  // circular shape
                p: 0.5,               // reduced padding
                '&:hover': {
                  bgcolor: 'white',   // keep background white on hover
                },
              }}
            >
              <MoreIcon />
            </IconButton>
          </Box>


        </Toolbar>
      </AppBar>
      <NotificationModal open={openNotifications} onClose={handleNotificationClose} />
      {renderMobileMenu}
      {renderMenu}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth PaperProps={{
        style: {
          borderRadius: 20,
          //height: "500px",
          backgroundColor: "#fcfcfc"  
        },
      }}>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              Name: '',
              Description: '',
              StartDate: '',
              EndDate: '',
              Address: '',
            }}
            //validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ setFieldValue, isSubmitting, errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  label="Name"
                  name="Name"
                  fullWidth
                  margin="dense"
                  error={touched.Name && !!errors.Name}
                  helperText={touched.Name && errors.Name}
                />
                <Field
                  as={TextField}
                  label="Description"
                  name="Description"
                  fullWidth
                  margin="dense"
                  error={touched.Description && !!errors.Description}
                  helperText={touched.Description && errors.Description}
                />
                <Field
                  as={TextField}
                  label="Address"
                  name="Address"
                  fullWidth
                  margin="dense"
                  error={touched.Address && !!errors.Address}
                  helperText={touched.Address && errors.Address}
                />
                <Field
                  as={TextField}
                  label="Start Date"
                  name="StartDate"
                  type="date"
                  fullWidth
                  margin="dense"
                  error={touched.StartDate && !!errors.StartDate}
                  helperText={touched.StartDate && errors.StartDate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { style: { cursor: 'pointer' } },
                  }}
                  onClick={(e) => {
                    const inputElement = e.currentTarget.querySelector('input');
                    if (inputElement) {
                      inputElement.showPicker(); 
                    }                  }}
                  sx={{
                    cursor: 'pointer',  
                    '.MuiInputBase-input': { cursor: 'pointer' }, 
                  }}                                  />
              <Field
                  as={TextField}
                  label="End Date"
                  name="EndDate"
                  type="date"
                  fullWidth
                  margin="dense"
                  error={touched.EndDate && !!errors.EndDate}
                  helperText={touched.EndDate && errors.EndDate}
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    inputProps: { style: { cursor: 'pointer' } },
                  }}
                  onClick={(e) => {
                    const inputElement = e.currentTarget.querySelector('input');
                    if (inputElement) {
                      inputElement.showPicker(); 
                    }                  }}
                  sx={{
                    cursor: 'pointer',  
                    '.MuiInputBase-input': { cursor: 'pointer' }, 
                  }}                  
                />

                <DialogActions>
                  <Button className='!text-[#1D34D8]' onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button type="submit" className='!bg-[#1D34D8]' variant="contained" disabled={isSubmitting}>
                    Add Project
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
}