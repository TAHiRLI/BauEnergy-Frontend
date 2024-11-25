import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, IconButton, Typography, FormHelperText, Paper } from '@mui/material';
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
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false); // For the edit modal
  const [teamMemberToEdit, setTeamMemberToEdit] = useState(null);

  const fetchAllTeamMembers = async () => {
    try {
      const response = await teamMemberService.getAllByCompany(project.id); // Pass the projectId to the service
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

  const validationSchema = Yup.object({
    name: Yup.string().required('Required'),
    lastName: Yup.string().required('Required'),
    role: Yup.number().required('Required'),
    image: Yup.mixed().nullable(),
    birthDate: Yup.date()
      .required('Birth Date is required')
      .max(new Date(), 'Birth Date cannot be in the future'),
    // phoneNumber: Yup.string()
    //   .required('Phone number is required')
    //   .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid'),
  });
  
  const RoleEnum = {
    User: 1,
    Project_Manager: 2,
  };



  const handleImageUpload = (event) => {
    const files = event.target.files;
    if (files.length > 0) {
      const selectedFile = files[0];
      setImageFile(selectedFile);
    }
  };

  const handleEdit = (teamMember) => {
    setTeamMemberToEdit(teamMember); 
    setIsEditDialogOpen(true);  
  };


  const handleAddExistingTeamMember = async () => {
    try {
      if (selectedTeamMember) {
        const formData = new FormData();
        const roleEnumValue = RoleEnum[selectedTeamMember.role];

      formData.append('Name', selectedTeamMember.name);
      formData.append('LastName', selectedTeamMember.lastName);
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

  const handleFormSubmit = async (values, { setSubmitting, resetForm }) => {
    try {
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('LastName', values.lastName);
      formData.append('Email', values.email);
      formData.append('Role', values.role);
      formData.append('BirthDate', values.birthDate);
      formData.append('PhoneNumber', values.phoneNumber);
      formData.append('Image', values.image);
      formData.append('ProjectId', project.id); 
  
      // if (imageFile) {
      //   formData.append('Image', imageFile); 
      // }
  
      const response = await teamMemberService.add(formData);
  
      Swal.fire('Success', 'Team member has been created and added to the project!', 'success');
      resetForm();
      setOpenDialog(false);
      fetchTeamMembersForProject();

      // const projectResponse = await projectService.getById(project.id);
      // dispatch({ type: ProjectsActions.success, payload: projectResponse.data.teamMembers });
  
    } catch (error) {
      console.error('Error adding team member:', error.response || error.message);
      setOpenDialog(false)
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

  const handleUpdateTeamMember = async (values) => {
    console.log("adasda")
    try {
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('LastName', values.lastName);
      formData.append('Role', values.role);
      formData.append('TeamMemberId', teamMemberToEdit.id); 

      if (values.image) {
        formData.append('Image', values.image); 
      } 
  
      await teamMemberService.edit(teamMemberToEdit.id, formData);
  
      setIsEditDialogOpen(false);
      Swal.fire('Success', 'Team member has been updated!', 'success');
  
      const projectResponse = await projectService.getById(project.id);
      dispatch({ type: ProjectsActions.success, payload: projectResponse.data.teamMembers });
  
    } catch (error) {
      console.error('Error updating team member:', error.response || error.message);
      setIsEditDialogOpen(false);
      Swal.fire('Error', 'Failed to update team member.', 'error');
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
            onClick={() => handleEdit(params.row)}
            sx={{
              backgroundColor: "#f5f5f5",  
              borderRadius: "20%",         
              padding: "5px",               
              border: "1px solid #e0e0e0", "&:hover": {backgroundColor: "#e0e0e0"},
              marginRight: "8px"
            }}>
            <EditIcon sx={{ color: "#424242" }} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            sx={{
              backgroundColor: "#f5f5f5",  
              borderRadius: "20%",         
              padding: "5px",               
              border: "1px solid #e0e0e0", "&:hover": {backgroundColor: "#e0e0e0"},
              marginRight: "8px"
            }}>            
            <DeleteIcon sx={{ color: "#424242" }} />
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
        //height: '600px',
        width: '100%',
        overflowX: 'hidden',
        maxWidth: '100vw', // Restrict Paper width to viewport
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
          {!isCreatingNew ? (
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
                {member.name} {member.lastName}
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
          <Button
            onClick={() => setIsCreatingNew(true)}
            sx={{
              color: '#1D34D8',
              mt: 2,
            }}
          >
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
              image: null,
              birthDate: '',
              phoneNumber: '',
            }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ setFieldValue, errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  fullWidth
                  margin="normal"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />

                <Field
                  as={TextField}
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  margin="normal"
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                />

                <Field
                  as={TextField}
                  name="email"
                  label="Email"
                  fullWidth
                  margin="normal"
                  error={touched.email && Boolean(errors.email)}
                  helperText={touched.email && errors.email}
                />
                <Field
                  as={TextField}
                  name="birthDate"
                  label="Birth Date"
                  type="date"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={touched.birthDate && Boolean(errors.birthDate)}
                  helperText={touched.birthDate && errors.birthDate}
                  onChange={(e) => {
                    setFieldValue("birthDate", e.target.value); // Manually set the value
                    console.log("Selected Date:", e.target.value); // Debugging
                    selectedTeamMember.birthDate = e.target.value
                  }}
                />


                <Field
                  as={TextField}
                  name="phoneNumber"
                  label="Phone Number"
                  fullWidth
                  margin="normal"
                  error={touched.phoneNumber && Boolean(errors.phoneNumber)}
                  helperText={touched.phoneNumber && errors.phoneNumber}
                />

                <Field name="role">
                  {({ field, form }) => (
                    <FormControl fullWidth margin="normal" error={form.touched.role && Boolean(form.errors.role)}>
                      <InputLabel id="role-label">Role</InputLabel>
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

                <StyledBox>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        handleImageUpload(event);
                        setFieldValue('image', event.currentTarget.files[0]);
                      }}
                    />
                  </Button>
                </StyledBox>
                <DialogActions>
                <Button onClick={() => setIsCreatingNew(false)} className='!text-[#1D34D8]'>Cancel</Button>
                {/* <Button type="submit" onClick={() => setIsCreatingNew(false)} disabled={isSubmitting} variant="contained" className='!bg-[#1D34D8]'>Submit</Button> */}
                <Button type="submit" disabled={isSubmitting} variant="contained" className='!bg-[#1D34D8]'>Submit</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={isEditDialogOpen} onClose={() => setIsEditDialogOpen(false)} fullWidth PaperProps={{
          style: {
            borderRadius: 20,
            backgroundColor: "#fcfcfc"
          },
        }}
      >
        <DialogTitle className="!font-semibold">
          Edit Team Member
          <IconButton
            className="!text-[#1D34D8]"
            aria-label="close"
            onClick={() => setIsEditDialogOpen(false)}
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
              name: teamMemberToEdit?.name || '',
              lastName: teamMemberToEdit?.lastName || '',
              birthDate: teamMemberToEdit?.birthDate
              ? new Date(teamMemberToEdit?.birthDate).toLocaleDateString('en-CA')
              : "",
              role: teamMemberToEdit?.role === 'Project_Manager' ? RoleEnum.Project_Manager : RoleEnum.User,
              image: teamMemberToEdit?.image,
            }}
            validationSchema={validationSchema}
            onSubmit={async (values, { setSubmitting }) => {
              await handleUpdateTeamMember(values);
              setSubmitting(false);
            }}
          >
            {({ setFieldValue, errors, touched, isSubmitting }) => (
              <Form>
                <Field
                  as={TextField}
                  name="name"
                  label="Name"
                  fullWidth
                  margin="normal"
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />

                <Field
                  as={TextField}
                  name="lastName"
                  label="Last Name"
                  fullWidth
                  margin="normal"
                  error={touched.lastName && Boolean(errors.lastName)}
                  helperText={touched.lastName && errors.lastName}
                />

                <Field
                  as={TextField}
                  type="date"
                  name="birthDate"
                  label="Birthdate"
                  fullWidth
                  margin="normal"
                  InputLabelProps={{ shrink: true }}
                  error={touched.birthdate && Boolean(errors.birthdate)}
                  helperText={touched.birthdate && errors.birthdate}
                />

                <Field name="role">
                  {({ field, form }) => (
                    <FormControl fullWidth margin="normal" error={form.touched.role && Boolean(form.errors.role)}>
                      <InputLabel id="role-label">Role</InputLabel>
                      <Select
                        {...field}
                        labelId="role-label"
                        label="Role"
                        value={field.value}
                        onChange={(event) => {
                          setFieldValue('role', event.target.value);
                        }}
                      >
                        {Object.entries(RoleEnum).map(([key, value]) => (
                          <MenuItem key={value} value={value}>
                            {key.split('_').join(' ')}
                          </MenuItem>
                        ))}
                      </Select>
                      {form.touched.role && form.errors.role && (
                        <FormHelperText>{form.errors.role}</FormHelperText>
                      )}
                    </FormControl>
                  )}
                </Field>

                <StyledBox>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload Image
                    <VisuallyHiddenInput
                      type="file"
                      accept="image/*"
                      onChange={(event) => {
                        handleImageUpload(event);
                        setFieldValue('image', event.currentTarget.files[0]);
                      }}
                    />
                  </Button>
                </StyledBox>

                <DialogActions>
                  <Button onClick={() => setIsEditDialogOpen(false)} className="!text-[#1D34D8]">Cancel</Button>
                  <Button type="submit" disabled={isSubmitting} variant="contained" className="!bg-[#1D34D8]">Update</Button>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>

    </Box>
  );
}
