import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,

} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { teamMemberService } from '../../APIs/Services/teammember.service';
import { userSerivce } from '../../APIs/Services/user.service'; 
import VpnKeyIcon from '@mui/icons-material/VpnKey';

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

  const handleAdminCreateFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('Name', values.Name);
      formData.append('LastName', values.LastName);
      formData.append('Email', values.Email);

      await userSerivce.AddUser(formData); 
      setOpenDialog(false); 
      Swal.fire('Success', 'Admin has been added!', 'success');
      resetForm();
    } catch (error) {
      setOpenDialog(false)
      console.error('Error adding project:', error);
      Swal.fire('Error', 'Failed to add project.', 'error');
    } finally {
      setSubmitting(false);
    }
  };


  const handleResetPassword = async (id) => {
    try {
      const confirmation = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to reset the password for this user?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1D34D8",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, reset it!",
      });
  
      if (!confirmation.isConfirmed) return;
  
      const response = await userSerivce.resetUserPassword(id);
  
      await Swal.fire({
        title: "Success!",
        text: response?.data?.message || "Password has been reset successfully.",
        icon: "success",
        confirmButtonColor: "#3085d6",
      });
    } catch (error) {
      Swal.fire({
        title: "Error!",
        text: "Failed to reset the password. Please try again.",
        icon: "error",
        confirmButtonColor: "#d33",
      });
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
              alt={params.row.fullName}
              style={{ width: 50, height: 50, marginRight: 10 }}
            />
            <Typography>{fullName}</Typography>
          </Box>
        );
      },
    },
    {
      field: 'email',
      headerName: 'Email',
      minWidth: 250,
      renderCell: (params) => (
        <Typography>{params.row?.email || 'N/A'}</Typography>
      ),
    },
    {
      field: 'phoneNumber',
      headerName: 'Phone Number',
      minWidth: 150,
      renderCell: (params) => (
        <Typography>{params.row?.phoneNumber || 'N/A'}</Typography>
      ),
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
      renderCell: (params) => formatDate(params.row?.addedTimeProject),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 180,
      renderCell: (params) => (
        <div className="text-center">
          {/* Delete Button */}
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
  
          {/* Reset Password Button */}
          <IconButton
            onClick={() => handleResetPassword(params.row.id)}
            sx={{
              backgroundColor: '#f5f5f5',
              borderRadius: '20%',
              padding: '5px',
              border: '1px solid #e0e0e0',
              '&:hover': { backgroundColor: '#e0e0e0' },
            }}
          >
            <VpnKeyIcon sx={{ color: '#424242' }} />
          </IconButton>
        </div>
      ),
    },
  ];
  
  

  if (loading) return <Typography>Loading...</Typography>;

  return (
    <Paper sx={{ width: '100%', overflowX: 'hidden', maxWidth: '100vw' }}>
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
