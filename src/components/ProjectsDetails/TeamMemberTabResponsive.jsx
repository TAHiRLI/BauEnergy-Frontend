import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, IconButton, Typography, FormHelperText, Paper, Grid, CardActionArea, CardContent, Card, Divider, CardActions } from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import { Add as AddIcon, Share as ShareIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';
import { teamMemberService } from '../../APIs/Services/teammember.service'; 
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField } from '@mui/material';
import axios from 'axios';
import Cookies from "universal-cookie";
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { styled } from '@mui/material/styles';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';

const VisuallyHiddenInput = styled('input')({
  display: 'none',
});

const StyledBox = styled(Box)(({ theme }) => ({
  border: '1px solid',
  borderColor: theme.palette.grey[400],
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  '&:hover': {
      borderColor: theme.palette.common.black,
  },
}));

const cookies = new Cookies();

export default function TeamMember({ project }) {
  const { state, dispatch } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  const [allTeamMembers, setAllTeamMembers] = useState([]); 
  const [imageFile, setImageFile] = useState(null); 
  const [isCreatingNew, setIsCreatingNew] = useState(false); 
  const [selectedTeamMember, setSelectedTeamMember] = useState(null); 

  const fetchAllTeamMembers = async () => {
    try {
      const response = await teamMemberService.getAllByCompany(project.id); 
      setAllTeamMembers(response.data);
      console.log(response.data)
    } catch (error) {
      console.error('Error fetching all team members:', error);
    }
  };

  useEffect(() => {
    if (openDialog) {
      fetchAllTeamMembers();
    }
  }, [openDialog]);

  useEffect(() => {
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
    fetchTeamMembersForProject();
  }, [dispatch, project.id]);

  const validationSchema = Yup.object({
   name: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
    email: Yup.string().email('Invalid email').required('Required'),
    role: Yup.number().required('Required'),
   image: Yup.mixed().nullable(),
  });
  const RoleEnum = {
    CompanyOwner: 0,
    User: 1,
    ProjectManager: 2,
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

    return (
        <Grid container spacing={2}>

        <Button
        className='!bg-[#1D34D8] !rounded-2xl !my-5 w-full !ml-4 '
        startIcon={<AddIcon />}
        variant="contained"
        onClick={() => setOpenDialog(true)}
        >
            Add New People
        </Button>
  
        {state.data && state.data.map((tm) => {
            const image = tm.image ? 
            `${tm.image}` : 
            `defaultUser.png`; 
          return (
            <Grid item xs={12} sm={6} md={4} key={tm.id}>
              <Card sx={{ maxWidth: { xs: '100%', sm: 345 }, borderRadius: 2, boxShadow: 4, overflow: 'hidden',p:2 }}>
                <CardActionArea sx={{ 
                position: 'relative', 
                display: 'flex',           
                justifyContent: 'center',  
                alignItems: 'center'       
                }}>
                <Box
                    component="img"
                    loading="lazy"
                    src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/teammembers/${image}`}
                    alt={tm.name}
                    sx={{
                    width: 150,
                    height: 150,
                    objectFit: 'cover',
                    borderRadius: '50%',
                    overflow: 'hidden',
                    }}
                />
                </CardActionArea>

  
                  {/* Card Content */}
                <CardContent>
                    <Box sx={{
                        bottom: 0,
                        width: '100%',
                        padding: 1,
                        color: '#fff',
                        textAlign: 'center'
                    }}>
                    <Typography variant="h6" fontWeight="bold" color='black'>
                        {tm.name} {tm.lastName}
                    </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    </Box>
  
                    <Divider variant="middle" sx={{ my: 1, mx:0 }} />
  
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        Date Added:
                    </Typography>
                    <Box component="span" className='font-semibold'>
                        {formatDate(tm.dateAddedProject)}
                    </Box>
                    </Box>
                    <Divider variant="middle" sx={{ my: 1, mx:0 }} />
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        Role:
                    </Typography>
                    <Box component="span" className='font-semibold'>
                        {tm.role?.split('_').join(' ')}
                    </Box>
                    </Box>
                </CardContent>
  
                  {/* Actions Section */}
                  <CardActions sx={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 2 }}>

                    <Button size="small" color="error" variant="contained" sx={{ textTransform: 'none', ml: 1 }} onClick={() => handleDelete(tm.id)}
                    > Delete</Button>
                  </CardActions>
              </Card>
            </Grid>
          );
        })}

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

      </Grid>
    );
  }