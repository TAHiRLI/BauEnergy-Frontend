import * as React from 'react';
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
import { loginService } from '../../APIs/Services/login.service';
import Swal from 'sweetalert2';
import { Formik, Form, Field } from 'formik';
import { Avatar, Button, Dialog, DialogActions, DialogContent, DialogTitle, FormControl, FormHelperText, InputLabel, Select, TextField, useMediaQuery } from '@mui/material';
import NotificationModal from '../notification/notification';
import { notificationService } from '../../APIs/Services/notification.service';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell} from '@fortawesome/free-regular-svg-icons';
import { faEllipsis } from '@fortawesome/free-solid-svg-icons';
import AddIcon from '@mui/icons-material/Add';
import MenuIcon from '@mui/icons-material/Menu';
import { useNavigate } from "react-router-dom";
import { ROUTES } from '../../pages/routes/routes';
import { useLocation } from "react-router-dom";
import { userSerivce } from '../../APIs/Services/user.service';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import { LangInput } from '../common/langInput/Index';
import { useTranslation } from "react-i18next";

export default function Appbar({ toggleSidebar }) {
  const { t } = useTranslation();
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const [openDialog, setOpenDialog] = useState(false);
  const [openNotifications, setOpenNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [openAdminCreateDialog, setOpenAdminCreateDialog] = useState(false);

  const [profilePhotoPreview, setProfilePhotoPreview] = useState(null);



  const { user } = useAuth(); 
  
  const decodedToken = user?.token ? jwtDecode(user.token) : null;

  const userId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];
  const email = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];

  const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || []; 
  
  var isUser = false
  if (userRoles.includes("User")) {
    isUser = true;
  }


  const navigate = useNavigate();
  const location = useLocation();
  const isSettingsAndTeamsPage = location.pathname === "/settingsandteams";
  useEffect(() => {
    if (openDialog) {
      //fetchAllTeamMembers(); 
    }
  }, [openDialog]);

  const handleNotificationClick = () => {
    setOpenNotifications(true);
  };

  const handleAdminCreateOpenDialog = () => setOpenAdminCreateDialog(true);
  const handleAdminCreateCloseDialog = () => setOpenAdminCreateDialog(false);

  
  const fetchNotifications = async () => {
    try {
      //console.log(userId)
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

  const RoleEnum = {
    Company_Owner: 0,
    User: 1,
    Project_Manager: 2,
  };

  const handleImageUpload = (event, setFieldValue) => {
    const file = event.target.files[0];
    if (file) {
      const previewUrl = URL.createObjectURL(file);
      setProfilePhotoPreview(previewUrl); // Update the preview
      setFieldValue('image', file); // Set the file in Formik's state
    }
  };

  const validationSchema = Yup.object({
    Name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    
    Description: Yup.string()
      .required('Description is required')
      .min(10, 'Description must be at least 10 characters')
      .max(600, 'Description must be at most 200 characters'),
    
    Address: Yup.string()
      .required('Address is required')
      .min(5, 'Address must be at least 5 characters')
      .max(100, 'Address must be at most 100 characters'),
    
    StartDate: Yup.date()
      .required('Start date is required')
      .typeError('Invalid date format'),
    
    EndDate: Yup.date()
      .required('End date is required')
      .typeError('Invalid date format')
      .min(Yup.ref('StartDate'), 'End date cannot be before start date')
  });


const validationCreateUserSchema = Yup.object().shape({
  name: Yup.string()
    .trim()
    .required('Name is required')
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters'),
  lastName: Yup.string()
    .trim()
    .required('Last Name is required')
    .min(2, 'Last Name must be at least 2 characters')
    .max(50, 'Last Name cannot exceed 50 characters'),
  email: Yup.string()
    .trim()
    .email('Invalid email format')
    .required('Email is required'),
  birthDate: Yup.date()
    .required('Birth Date is required')
    .typeError('Invalid date format')
    .max(new Date(), 'Birth Date cannot be in the future'),
  phoneNumber: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number format')
    .required('Phone Number is required'),
  role: Yup.mixed()
    .oneOf(Object.values(RoleEnum), 'Invalid role selected')
    .required('Role is required'),
});

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
      Swal.fire(t('messages:Error'), t('Failed to add project.'), 'error');
      setOpenDialog(false)
    } finally {
      setSubmitting(false);
    }
  };

  const handleResetPassword = async (email) => {
    // Show confirmation dialog
    handleMenuClose();
    const result = await Swal.fire({
      title: t("PopUp:Areyousure?"),
      text: t("messages:DoYouWantToResetThePassword?"),
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#1D34D8",
      cancelButtonColor: "#d33",
      confirmButtonText: t("messages:Yes,resetIt"),
      cancelButtonText: t("PopUp:Cancel"),
    });
  
    // Exit if the user cancels
    if (!result.isConfirmed) {
      return;
    }
  
    // Proceed with the reset password process
    try {
      const response = await loginService.generateResetToken(email);
      const token = response.data.resetToken;
  
      // Navigate to the reset password page with the token in state
      navigate(ROUTES.RESET_PASSWORD, { state: { token } });
  
      // Show success message
      Swal.fire({
        title: "Success!",
        text: "Password reset link has been sent successfully.",
        icon: "success",
        confirmButtonText: "OK",
      });
    } catch (error) {
      console.error("Failed to generate reset token:", error);
  
      // Show error message
      Swal.fire({
        title: "Error!",
        text: "Failed to reset password. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    }
  };
  

const handleCreateUserFormSubmit = async (values, { setSubmitting, resetForm }) => {
  console.log(values)
  try {
    const formData = new FormData();
    formData.append('Name', values.name);
    formData.append('LastName', values.lastName);
    formData.append('Email', values.email.trim());
    formData.append('Role', values.role);
    formData.append('BirthDate', values.birthDate);
    formData.append('PhoneNumber', values.phoneNumber.trim());
    formData.append('Image', values.image);

    const response =  await userSerivce.AddUser(formData); 
  
    setOpenAdminCreateDialog(false)
    Swal.fire('Success', 'Team member has been created and added to the project!', 'success').then(() => {
      // Reload the page after the success alert is closed
      window.location.reload();
    });
    resetForm();
    setProfilePhotoPreview(null)
  } catch (error) {
    console.error('Error adding team member:', error);
    setOpenAdminCreateDialog(false)
    Swal.fire('Error', error.response.data.error, 'error');
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

  const handleProfileButtonClick = () => {
    handleMenuClose();
    navigate("/updateuser");
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
      <MenuItem onClick={handleProfileButtonClick}>{t("Profile")}</MenuItem>
      <MenuItem onClick={() => handleResetPassword(email)}>
      {t("ResetPassword")}
    </MenuItem>
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
      <MenuItem onClick={handleNotificationClick}>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit"
          
        >
          <Badge badgeContent={unreadCount} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>{t("Notifications")}</p>
      </MenuItem>
      <MenuItem onClick={() => setOpenDialog(true)}>
        <IconButton size="large" aria-label="create new project" color="inherit" 
        >
            <AddIcon />
        </IconButton>
        <p>{t("CreateProject")}</p>
      </MenuItem>
      <MenuItem onClick={handleAdminCreateOpenDialog}>
        <IconButton size="large" aria-label="create new project" color="inherit" 
        >
            <PersonAddIcon />
        </IconButton>
        <p>{t("CreateUser")}</p>
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
        <p>{t("PopUp:Profile")}</p>
      </MenuItem>
    </Menu>
  );
  const isMobile = useMediaQuery('(max-width:1023px)');

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
            {!isUser && (   
              isSettingsAndTeamsPage ? (
                <Button
                  variant="contained"
                  className="!m-2 !bg-[#1D34D8] !rounded-3xl !py-2 !text-base sm:text-xs"
                  onClick={handleAdminCreateOpenDialog}
                  sx={{ textTransform: "none", display: { xs: "none", md: "flex" } }}
                >
                  {t("CreateUser")}
                  </Button>
              ) : (
                <Button
                  variant="contained"
                  className="!ml-6 !bg-[#1D34D8] !rounded-3xl !py-2 !text-base sm:text-xs"
                  onClick={() => setOpenDialog(true)}
                  sx={{ ml: 2, textTransform: "none", display: { xs: "none", md: "flex" } }}
                >
                  {t("CreateProject")}
                </Button>
              )
            )}

        <LangInput />

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
                bgcolor: 'white',   
                color: 'black',     
                borderRadius: '50%',
                p: 0.5,             
                '&:hover': {
                  bgcolor: 'white', 
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

      {/* Add new Project */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth PaperProps={{
        style: {
          borderRadius: 20,
          //height: "500px",
          backgroundColor: "#fcfcfc"  
        },
      }}>
        <DialogTitle>{t("PopUp:AddNewProject")}
        <IconButton
              className="!text-[#1D34D8]"
              aria-label="close"
              onClick={() => setOpenDialog(false)}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CancelOutlinedIcon />
            </IconButton>
        </DialogTitle>

        <DialogContent>
          <Formik
            initialValues={{
              Name: '',
              Description: '',
              StartDate: '',
              EndDate: '',
              Address: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ setFieldValue, isSubmitting, errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  label={t("PopUp:Name")}
                  name="Name"
                  fullWidth
                  margin="dense"
                  error={touched.Name && !!errors.Name}
                  helperText={touched.Name && errors.Name}
                />
                <Field
                  as={TextField}
                  label={t("columns:Description")}
                  name="Description"
                  fullWidth
                  margin="dense"
                  error={touched.Description && !!errors.Description}
                  helperText={touched.Description && errors.Description}
                />
                <Field
                  as={TextField}
                  label={t("PopUp:Address")}
                  name="Address"
                  fullWidth
                  margin="dense"
                  error={touched.Address && !!errors.Address}
                  helperText={touched.Address && errors.Address}
                />
                <Field
                  as={TextField}
                  label={t("columns:Start Date")}
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
                  label={t("columns:End Date")}
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
                  onBlur={(e) => {
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
                  <Button className='!text-[#1D34D8]' onClick={() => setOpenDialog(false)}>{t("PopUp:Cancel")}</Button>
                  <Button type="submit" className='!bg-[#1D34D8]' variant="contained" disabled={isSubmitting}>
                    {t("PopUp:AddProject")}
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      {/* Add new User */}
      <Dialog
        open={openAdminCreateDialog}
        onClose={() => handleAdminCreateCloseDialog(false)}
        fullWidth
        PaperProps={{
          style: {
            borderRadius: 20,
            backgroundColor: '#fcfcfc',
          },
        }}
      >
        <DialogTitle>
          {t("PopUp:AddNewUser")}
          <IconButton
            className="!text-[#1D34D8]"
            aria-label="close"
            onClick={() => handleAdminCreateCloseDialog(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              name: '',
              lastName: '',
              email: '',
              role: '',
              image: null,
              birthDate: '',
              phoneNumber: '',
            }}
            validationSchema={validationCreateUserSchema}
            onSubmit={handleCreateUserFormSubmit}
          >
            {({ setFieldValue, errors, touched, isSubmitting }) => (
              <Form>
                <Box display="flex" flexDirection="column" alignItems="center" mb={2}>
                  {/* Circle with profile photo */}
                  <Avatar
                    src={profilePhotoPreview || ''} // Default profile image
                    alt="Profile Photo"
                    sx={{
                      width: 120,
                      height: 120,
                      marginBottom: 2,
                    }}
                  />

                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    {t("PopUp:Select Profile Photo")}
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={(event) => handleImageUpload(event, setFieldValue)}
                    />
                  </Button>
                </Box>

                <Field
                  as={TextField}
                  name="name"
                  label={t("PopUp:Name")}
                  fullWidth
                  margin="normal"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />

                <Field
                  as={TextField}
                  name="lastName"
                  label={t("LastName")}
                  fullWidth
                  margin="normal"
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                />

                <Field
                  as={TextField}
                  name="email"
                  label={t("columns:Email")}
                  fullWidth
                  margin="normal"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />

                <Field
                  as={TextField}
                  name="birthDate"
                  label={t("PopUp:BirthDate")}
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={touched.birthDate && Boolean(errors.birthDate)}
                  helperText={touched.birthDate && errors.birthDate}
                />

                <Field
                  as={TextField}
                  name="phoneNumber"
                  label={t("columns:Phonenumber")}
                  fullWidth
                  margin="normal"
                  error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                  helperText={touched.phoneNumber && errors.phoneNumber}
                />

                <Field name="role">
                  {({ field, form }) => (
                    <FormControl fullWidth margin="normal" error={form.touched.role && Boolean(form.errors.role)}>
                      <InputLabel id="role-label">{t("role")}</InputLabel>
                      <Select
                        {...field}
                        labelId="role-label"
                        label="Role"
                        value={field.value}
                      >
                        {Object.entries(RoleEnum).map(([key, value]) => (
                          <MenuItem key={value} value={value}>
                            {key?.split('_').join(' ')}
                          </MenuItem>
                        ))}
                      </Select>
                      {form.touched.role && form.errors.role && (
                        <FormHelperText>{form.errors.role}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                </Field>
                <DialogActions>
                  <Button type="submit" disabled={isSubmitting} variant="contained" className="!bg-[#1D34D8]">
                  {t("PopUp:Submit")}
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