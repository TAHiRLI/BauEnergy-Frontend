import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import Swal from 'sweetalert2';
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';
import { teamMemberService } from '../../APIs/Services/teammember.service'; 
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { TextField } from '@mui/material';
import axios from 'axios';
import Cookies from "universal-cookie";

const cookies = new Cookies();

export default function TeamMember({ project }) {
  const { state, dispatch } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  const [allTeamMembers, setAllTeamMembers] = useState([]); 
  const [imageFile, setImageFile] = useState(null); 
  const [isCreatingNew, setIsCreatingNew] = useState(false); 
  const [selectedTeamMember, setSelectedTeamMember] = useState(null); // Store the full team member object

  const fetchAllTeamMembers = async () => {
    try {
      const response = await axios.get(
        `https://localhost:7068/api/TeamMember/GetAllByCompany?projectId=${project.id}`,
        {
          headers: {
            authorization: `Bearer ${cookies.get('user')?.token}`,
          }
        }
      );
      setAllTeamMembers(response.data);
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

  const handleAddExistingTeamMember = async () => {
    try {
      if (selectedTeamMember) {
        const formData = new FormData();
      formData.append('Name', selectedTeamMember.name);
      formData.append('LastName', selectedTeamMember.lastName);
      formData.append('Email', selectedTeamMember.email);
      formData.append('Role', selectedTeamMember.role);
      formData.append('ProjectId', project.id);
      if (imageFile) {
        formData.append('Image', imageFile); 
      }
       // console.log(formData)

        await teamMemberService.add(formData);
        Swal.fire('Success', 'Team member has been added to the project!', 'success');
        setOpenDialog(false);
        const response = await projectService.getById(project.id);
        dispatch({ type: ProjectsActions.success, payload: response.data.teamMembers });
      }
    } catch (error) {
      console.error('Error adding team member:', error);
      Swal.fire('Error', 'Failed to add team member.', 'error');
    }
  };

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('LastName', values.lastName);
      formData.append('Email', values.email);
      formData.append('Role', values.role); // Ensure role is passed as an integer
      formData.append('ProjectId', project.id); // ProjectId as GUID
  
      if (imageFile) {
        formData.append('Image', imageFile); // Handle file upload correctly
      }
  
      const response = await axios.post('https://localhost:7068/api/TeamMember', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          authorization: `Bearer ${cookies.get('user')?.token}`,
        },
      });
  
      Swal.fire('Success', 'Team member has been created and added to the project!', 'success');
      resetForm();
      setOpenDialog(false);
  
      // Update the team members list
      const projectResponse = await projectService.getById(project.id);
      dispatch({ type: ProjectsActions.success, payload: projectResponse.data.teamMembers });
  
    } catch (error) {
      console.error('Error adding team member:', error.response || error.message);
      Swal.fire('Error', 'Failed to create team member.', 'error');
    } finally {
      setSubmitting(false);
    }
  };
  

  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'You won\'t be able to revert this!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
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

  const columns = [
    { field: 'name', headerName: 'Team Member Name', width: 200 },
    { field: 'createdBy', headerName: 'Added By', width: 200 },
    {
      field: 'role',
      headerName: 'Role',
      width: 150,
      renderCell: (params) => params.row.role,
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
      ),
    },
  ];

  return (
    <Box height={400}>
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        Add New Team Member
      </Button>
      
      <DataGrid
        rows={state.data || []}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.id}
      />

      {/* Modal dialog for adding team member */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} fullWidth>
        <DialogTitle>{isCreatingNew ? 'Create New Team Member' : 'Select Existing Team Member'}</DialogTitle>
        <DialogContent>
          {!isCreatingNew ? (
            <FormControl fullWidth margin="dense">
              <InputLabel>Select Team Member</InputLabel>
              <Select
                value={selectedTeamMember ? selectedTeamMember.id : ''}
                onChange={(e) => {
                  const selectedMember = allTeamMembers.find((member) => member.id === e.target.value);
                  setSelectedTeamMember(selectedMember); // Store full member data
                }}
              >
                {allTeamMembers.map((member) => (
                  <MenuItem key={member.id} value={member.id}>
                    {member.name} {member.lastName}
                  </MenuItem>
                ))}
              </Select>
              <Button
                variant="contained"
                color="primary"
                onClick={handleAddExistingTeamMember}
                disabled={!selectedTeamMember}
                sx={{ mt: 2 }}
              >
                Add to Project
              </Button>
              <Button onClick={() => setIsCreatingNew(true)} sx={{ mt: 2 }}>
                Or Create New Member
              </Button>
            </FormControl>
          ) : (
            <Formik
              initialValues={{
                name: '',
                lastName: '',
                email: '',
                role: '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleFormSubmit}
            >
              {({ setFieldValue, isSubmitting, errors, touched }) => (
                <Form>
                  <Field
                    as={TextField}
                    label="Name"
                    name="name"
                    fullWidth
                    margin="dense"
                    error={touched.name && !!errors.name}
                    helperText={touched.name && errors.name}
                  />
                  <Field
                    as={TextField}
                    label="Last Name"
                    name="lastName"
                    fullWidth
                    margin="dense"
                    error={touched.lastName && !!errors.lastName}
                    helperText={touched.lastName && errors.lastName}
                  />
                  <Field
                    as={TextField}
                    label="Email"
                    name="email"
                    fullWidth
                    margin="dense"
                    error={touched.email && !!errors.email}
                    helperText={touched.email && errors.email}
                  />
                  <Field
                    as={TextField}
                    label="Role"
                    name="role"
                    type="number"
                    fullWidth
                    margin="dense"
                    error={touched.role && !!errors.role}
                    helperText={touched.role && errors.role}
                  />
                  <input
                    type="file"
                    onChange={(event) => {
                      setImageFile(event.currentTarget.files[0]);
                      setFieldValue('image', event.currentTarget.files[0]);
                    }}
                    style={{ marginTop: '15px', marginBottom: '10px' }}
                  />
                  <DialogActions>
                    <Button onClick={() => setIsCreatingNew(false)}>Cancel</Button>
                    <Button type="submit" color="primary" variant="contained" disabled={isSubmitting}>
                      Create and Add Team Member
                    </Button>
                  </DialogActions>
                </Form>
              )}
            </Formik>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
