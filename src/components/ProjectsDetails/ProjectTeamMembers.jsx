import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, IconButton, Typography, Paper } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { Add as AddIcon, Share as ShareIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';
import { teamMemberService } from '../../APIs/Services/teammember.service'; 
import Cookies from "universal-cookie";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';

const cookies = new Cookies();

export default function TeamMember({ project }) {
  const { state, dispatch } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  const [allTeamMembers, setAllTeamMembers] = useState([]); 
  const [imageFile, setImageFile] = useState(null); 
  const [isCreatingNew, setIsCreatingNew] = useState(false); 
  const [selectedTeamMember, setSelectedTeamMember] = useState(null); 
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [teamMemberToEdit, setTeamMemberToEdit] = useState(null);

  const fetchAllTeamMembers = async () => {
    try {
      const response = await teamMemberService.getAllByCompany(project.id); 
      console.log(response)
      setAllTeamMembers(response.data);
      //console.log(response.data)
    } catch (error) {
      console.error('Error fetching all team members:', error);
      // Handle error accordingly
    }
  };
  

  useEffect(() => {
    if (openDialog) {
      fetchAllTeamMembers();
    }
  }, [openDialog]);

  const fetchTeamMembersForProject = async () => {
    dispatch({ type: ProjectsActions.start });
    try {
      const response = await projectService.getById(project.id);
      dispatch({ type: ProjectsActions.success, payload: response.data.teamMembers });
    } catch (error) {
      console.error('Error fetching team members:', error);
      dispatch({ type: ProjectsActions.failure, payload: error });
    }
  };
  useEffect(() => {
    
    fetchTeamMembersForProject();
  }, [dispatch, project.id]);


  
  const RoleEnum = {
    User: 1,
    Project_Manager: 2,
  };

  const handleAddExistingTeamMember = async () => {
    try {
      if (selectedTeamMember) {
        const formData = new FormData();
        const roleEnumValue = RoleEnum[selectedTeamMember.role];

        const [firstName, ...lastNameParts] = selectedTeamMember.fullName.split(' ');
        const lastName = lastNameParts.join(' '); // Join the remaining parts for multi-word last names
  
        formData.append('Name', firstName || '');
        formData.append('LastName', lastName || '');

      formData.append('Email', selectedTeamMember.email);
      formData.append('Role', roleEnumValue);
      formData.append('BirthDate', selectedTeamMember.birthDate)
      formData.append('PhoneNumber', selectedTeamMember.phoneNumber)
      formData.append('ProjectId', project.id);
      if (imageFile) {
        formData.append('Image', imageFile); 
      }
        
        await teamMemberService.add(formData);
        Swal.fire('Success', 'Team member has been added to the project!', 'success');
        setOpenDialog(false);
        const response = await projectService.getById(project.id);
        dispatch({ type: ProjectsActions.success, payload: response.data.teamMembers });
      }
    } 
    catch (error) {
      setOpenDialog(false);
      console.error('Error adding team member:', error);
      Swal.fire('Error', 'Failed to add team member.', 'error');
    }
  };

  
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1D34D8',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!',
      });

      if (result.isConfirmed) {
        await teamMemberService.remove(id);
        Swal.fire('Deleted!', 'Team member has been removed from the project.', 'success');
        const response = await projectService.getById(project.id);
        dispatch({ type: ProjectsActions.success, payload: response.data.teamMembers });
      }
    } catch (error) {
      console.error('Error deleting team member:', error.message);
      Swal.fire('Error!', 'Failed to remove team member.', 'error');
    }
  };

  
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
  const columns = [
    {
      field: 'name',
      headerName: 'Name & Last name',
      minWidth: 300,
      renderCell: (params) => {
        console.log(params)
        const fullName = `${params.row.name} ${params.row.lastName}`; 
        const image = params.row.image ? 
          `${params.row.image}` : 
          `defaultUser.png`; 
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
    { field: 'dateAddedProject', headerName: 'Joined date', minWidth: 150, renderCell: (params) => formatDate(params.row.dateAddedProject),  },
    {
      field: 'actions',
      headerName: 'Actions',
      minWidth: 130,
      renderCell: (params) => (
        <>
        <div className='text-center'>
          
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            sx={{
              backgroundColor: "#f5f5f5",  
              borderRadius: "20%",         
              padding: "5px",               
              border: "1px solid #e0e0e0", "&:hover": {backgroundColor: "#e0e0e0"},
              marginRight: "8px"
            }}>            
            <DeleteIcon sx={{ color: "" }} className='text-[#d33]' />

          </IconButton>
        </div>
        </>
      ),
    },
  ];
  
  return (
    <Box height={400} className="p-0">
      <Button
        className='!bg-[#1D34D8] !rounded-2xl !mb-5'
        startIcon={<AddIcon />}
        variant="contained"
        onClick={() => setOpenDialog(true)}
      >
        Add New People
      </Button>

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
            rows={state.data || []}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 5 } } }}
            pageSizeOptions={[5, 10]}
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

      {/* Modal dialog for adding team member */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth PaperProps={{
          style: {
            borderRadius: 20,
            //height: "500px",
            backgroundColor: "#fcfcfc"  
          },
        }}>
        <DialogTitle className='!font-semibold'>{isCreatingNew ? 'Create New Team Member' : 'Select Existing Team Member'}
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
          <FormControl fullWidth margin="dense">
          <InputLabel sx={{ color: '#1D34D8' }}>Select Team Member</InputLabel>
          <Select
            value={selectedTeamMember ? selectedTeamMember.id : ''}
            label="Select Team Member"
            onChange={(e) => {
              const selectedMember = allTeamMembers.find((member) => member.id === e.target.value);
              setSelectedTeamMember(selectedMember);
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': { borderColor: '#1D34D8' },
              '&:hover .MuiOutlinedInput-notchedOutline': { borderColor: '#1D34D8' },
              '&.Mui-focused .MuiOutlinedInput-notchedOutline': { borderColor: '#1D34D8' },
            }}
          >
            {allTeamMembers.map((member) => (
              <MenuItem key={member.id} value={member.id}>
                {member.fullName}
              </MenuItem>
            ))}
          </Select>
        
          <Button
            variant="contained"
            sx={{
              backgroundColor: '#1D34D8',
              '&:hover': {
                backgroundColor: '#1730b5', 
              },
              mt: 2,
            }}
            onClick={handleAddExistingTeamMember}
            disabled={!selectedTeamMember}
          >
            Add to Project
          </Button>
        </FormControl>
        
        </DialogContent>
      </Dialog>


    </Box>
  );
}
