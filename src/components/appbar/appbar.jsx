import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import AccountCircle from '@mui/icons-material/AccountCircle';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';
import UserInfo from '../userinfo';
import { useEffect, useState } from 'react';
import * as Yup from 'yup';
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';
import Swal from 'sweetalert2';
import { Formik, Form, Field } from 'formik';
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, FormControl, InputLabel } from '@mui/material';



const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(1),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

// const StyledInputBase = styled(InputBase)(({ theme }) => ({
//   color: 'inherit',
//   '& .MuiInputBase-input': {
//     padding: theme.spacing(1, 1, 1, 0),
//     // vertical padding + font size from searchIcon
//     paddingLeft: calc(1em + ${theme.spacing(4)}),
//     transition: theme.transitions.create('width'),
//     width: '100%',
//     [theme.breakpoints.up('md')]: {
//       width: '20ch',
//     },
//   },
// }));

export default function Appbar() {
  const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    if (openDialog) {
      //fetchAllTeamMembers(); 
    }
  }, [openDialog]);


  // const validationSchema = Yup.object({
  //   name: Yup.string().required('Required'),
  //   lastName: Yup.string().required('Required'),
  //   email: Yup.string().email('Invalid email').required('Required'),
  //   role: Yup.number().required('Required'),
  //   image: Yup.mixed().nullable(),
  // });

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log("values:", values )
    try {
      const formData = new FormData();
      formData.append('Name', values.Name);
      formData.append('Description', values.Description);
      formData.append('StartDate', values.StartDate);
      formData.append('EndDate', values.EndDate);

      console.log(formData)
      await projectService.add(formData ); 
      Swal.fire('Success', 'Project has been added!', 'success');
      resetForm();
      setOpenDialog(false); 
      //dispatch({ type: ProjectsActions.success, payload: response.data.teamMembers });
    } catch (error) {
      console.error('Error adding project:', error);
      Swal.fire('Error', 'Failed to add project.', 'error');
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
        <IconButton size="large" aria-label="show 4 new mails" color="inherit">
          <Badge badgeContent={4} color="error">
            <MailIcon />
          </Badge>
        </IconButton>
        <p>Messages</p>
      </MenuItem>
      <MenuItem>
        <IconButton
          size="large"
          aria-label="show 17 new notifications"
          color="inherit">
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
        </IconButton>
        <p>Notifications</p>
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

  return (
    <Box sx={{ flexGrow: 1}} >
      <AppBar position="static" className='rounded-t-xl' sx={{backgroundColor: '#dce7fa'}}>
        <Toolbar>
          <UserInfo/>
          
          <Box sx={{ flexGrow: 1 }} />
          <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
          {/* <Search>
            <SearchIconWrapper>
              <SearchIcon />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Search…"
              inputProps={{ 'aria-label': 'search' }}
            />
          </Search> */}
            <IconButton size="large" aria-label="show 4 new mails" color="inherit">
              <Badge badgeContent={4} color="error">
                <MailIcon />
              </Badge>
            </IconButton>
            <IconButton
              size="large"
              aria-label="show 17 new notifications"
              color="inherit"
            >
              <Badge badgeContent={17} color="error">
                <NotificationsIcon />
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
            >
              <AccountCircle />
            </IconButton>

            <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        Add New Project
      </Button>
          </Box>
          <Box sx={{ display: { xs: 'flex', md: 'none' } }}>
            <IconButton
              size="large"
              aria-label="show more"
              aria-controls={mobileMenuId}
              aria-haspopup="true"
              onClick={handleMobileMenuOpen}
              color="inherit"
            >
              <MoreIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>Add New Project</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              Name: '',
              Description: '',
              StartDate: '',
              EndDate: '',
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
                  label="Start Date"
                  name="StartDate"
                  type="date"
                  fullWidth
                  margin="dense"
                  error={touched.StartDate && !!errors.StartDate}
                  helperText={touched.StartDate && errors.StartDate}
                />
               <Field
                  as={TextField}
                  label="End Date"
                  name="EndDate"
                  type="date"
                  fullWidth
                  margin="dense"
                  error={touched.EndDate && !!errors.EndDate}
                  helperText={touched.EndDate && errors.EndDate}
                />

                <DialogActions>
                  <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
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