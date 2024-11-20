import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { Field, Form, Formik, useFormik } from 'formik';
import * as Yup from 'yup';
import { teamMemberService } from '../../APIs/Services/teammember.service';
import { userSerivce } from '../../APIs/Services/user.service'; 

const SettingsAndTeams = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    try {
      const data = await teamMemberService.getAllMembers();
      setTeamMembers(data.data);
    } catch (error) {
      console.error('Error fetching team members:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (date) => {
    if (!date) return;
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1D34D8',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await teamMemberService.removeUser(id);
        setTeamMembers((prevMembers) =>
          prevMembers.filter((member) => member.id !== id)
        );
        Swal.fire('Deleted!', 'Team member has been removed from the project.', 'success');
      }
    } catch (error) {
      console.error('Error deleting team member:', error.message);
      Swal.fire('Error!', 'Failed to remove team member.', 'error');
    }
  };

  const handleOpenDialog = () => setOpenDialog(true);
  const handleCloseDialog = () => setOpenDialog(false);

  const validationSchema = Yup.object({
    Name: Yup.string()
      .required('Name is required')
      .min(2, 'Name must be at least 2 characters')
      .max(50, 'Name must be at most 50 characters'),
    
    LastName: Yup.string()
      .required('Last name is required')
      .min(2, 'Last name must be at least 10 characters')
      .max(50, 'Last name must be at most 200 characters'),
    
    Email: Yup.string()
      .required('Address is required')
  });

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('Name', values.Name);
      formData.append('LastName', values.LastName);
      formData.append('Email', values.Email);

      await userSerivce.AddUser(formData); 
      Swal.fire('Success', 'Admin has been added!', 'success');
      resetForm();
      setOpenDialog(false); 
    } catch (error) {
      console.error('Error adding project:', error);
      Swal.fire('Error', 'Failed to add project.', 'error');
      setOpenDialog(false)
    } finally {
      setSubmitting(false);
    }
  };

  const columns = [
    {
      field: 'name',
      headerName: 'Name & Last name',
      minWidth: 300,
      renderCell: (params) => {
        const fullName = `${params.row.name} ${params.row.lastName}`;
        const image = params.row.image
          ? `${params.row.image}`
          : `defaultUser.png`;
        return (
          <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }}>
            <img
              src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/teammembers/${image}`}
              alt={fullName}
              style={{ width: 50, height: 50, marginRight: 10 }}
            />
            <Typography>{fullName}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'role',
      headerName: 'Role',
      minWidth: 130,
      renderCell: (params) => params.row?.role?.split('_').join(' '),
    },
    {
      field: 'dateAddedProject',
      headerName: 'Joined date',
      minWidth: 150,
      renderCell: (params) => formatDate(params.row?.dateAddedProject),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 130,
      renderCell: (params) => (
        <div className="text-center">
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '20%',
              padding: '5px',
              border: '1px solid #e0e0e0',
              '&:hover': { backgroundColor: '#e0e0e0' },
              marginRight: '8px',
            }}
          >
            <DeleteIcon sx={{ color: '#424242' }} />
          </IconButton>
        </div>
      ),
    },
  ];

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Paper sx={{ width: '100%', overflowX: 'hidden', maxWidth: '100vw' }}>
      <Button
              variant="contained"
              className="!m-2 !bg-[#1D34D8] !rounded-3xl !py-2 !text-base sm:text-xs"
              onClick={handleOpenDialog}
              sx={{ textTransform: "none",display: { xs: 'none', md: 'flex' }, 
            }}
            >
              Create admin
            </Button>
      <Dialog open={openDialog} onClose={() => handleCloseDialog(false)} fullWidth PaperProps={{
        style: {
          borderRadius: 20,
          //height: "500px",
          backgroundColor: "#fcfcfc"  
        },
      }}>
        <DialogTitle>Add New Admin</DialogTitle>
        <DialogContent>
          <Formik
            initialValues={{
              Name: '',
              LastName: '',
              Email: '',
            }}
            validationSchema={validationSchema}
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
                  label="LastName"
                  name="LastName"
                  fullWidth
                  margin="dense"
                  error={touched.Description && !!errors.Description}
                  helperText={touched.Description && errors.Description}
                />
                <Field
                  as={TextField}
                  label="Email"
                  name="Email"
                  fullWidth
                  margin="dense"
                  error={touched.Address && !!errors.Address}
                  helperText={touched.Address && errors.Address}
                />
                <DialogActions>
                  <Button className='!text-[#1D34D8]' onClick={() => setOpenDialog(false)}>Cancel</Button>
                  <Button type="submit" className='!bg-[#1D34D8]' variant="contained" disabled={isSubmitting}>
                    Add Admin
                  </Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

      <Box sx={{ maxWidth: { xs: '250px', sm: '100%' }, overflowX: 'auto' }}>
        <DataGrid
          rows={teamMembers}
          columns={columns}
          initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
          pageSizeOptions={[5, 10, 20]}
          sx={{
            border: 0,
            minWidth: 640,
            height: 'auto',
            overflowX: 'auto',
          }}
          getRowId={(row) => row.id}
        />
      </Box>
    </Paper>
  );
};

export default SettingsAndTeams;
