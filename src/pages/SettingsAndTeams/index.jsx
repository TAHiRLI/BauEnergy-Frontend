import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
} from '@mui/material';
import { teamMemberService } from '../../APIs/Services/teammember.service';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';

const SettingsAndTeams = () => {
  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

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

  if (loading) return <Typography>Loading...</Typography>;

  const formatDate = (date) => {
    if (!date) {
      return 'N/A';
    }

    try {
      return new Intl.DateTimeFormat('en-GB', {
        year: 'numeric',
        month: 'numeric',
        day: 'numeric',
      }).format(new Date(date));
    } catch (error) {
      console.error('Error formatting date:', error);
      return 'Invalid date';
    }
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
      renderCell: (params) => formatDate(params.row.dateAddedProject),
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

  return (
    <Paper
      sx={{
        width: '100%',
        overflowX: 'hidden',
        maxWidth: '100vw',
      }}
    >
      <Box
        sx={{
          maxWidth: { xs: '250px', sm: '100%' },
          overflowX: 'auto',
        }}
      >
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
