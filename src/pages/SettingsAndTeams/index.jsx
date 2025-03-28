import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Paper,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  FormHelperText,
  DialogActions,
  TextField,

} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Delete';
import Swal from 'sweetalert2';
import { teamMemberService } from '../../APIs/Services/teammember.service';
import { userSerivce } from '../../APIs/Services/user.service'; 
import EditIcon from '@mui/icons-material/Edit'; 
import { Field, Form, Formik } from 'formik';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import * as Yup from 'yup';
import { jwtDecode } from 'jwt-decode';
import { useAuth } from "../../context/authContext";
import { useTranslation } from 'react-i18next';

const SettingsAndTeams = () => {
  const { t } = useTranslation();

  const [teamMembers, setTeamMembers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [teamMemberToEdit, setTeamMemberToEdit] = useState(null);
  const [selectedImage, setSelectedImage] = useState(teamMemberToEdit?.image || null);

  const { user } = useAuth(); 
  
  const decodedToken = user?.token ? jwtDecode(user.token) : null;
  const currentUserId = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier"];

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
  console.log(teamMembers)

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
        title: t("PopUp:Areyousure?"),
        text: t("PopUp:ThisactionwillpermanentlydeletetheuserDoyouwanttoproceed?"),
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#1D34D8',
        cancelButtonColor: '#d33',
        confirmButtonText: t('PopUp:Yes,deleteit'),
        cancelButtonText: t("PopUp:Cancel")
      });

      if (result.isConfirmed) {
        await teamMemberService.removeUser(id);
        setTeamMembers((prevMembers) =>
          prevMembers.filter((member) => member.id !== id)
        );
        Swal.fire(t('messages:Deleted'), t('messages:Teammemberhasbeenremoved.'), 'success');
      }
    } catch (error) {
      console.error('Error deleting team member:', error.message);
      Swal.fire(t('messages:Error!'), t('messages:Failedtoremoveteammember.'), 'error');
    }
  };

  const handleResetPassword = async (id) => {
    setIsEditDialogOpen(false)
    try {
      const confirmation = await Swal.fire({
        title: t("PopUp:Areyousure?"),
        text: t("messages:Doyouwanttoresetthepasswordforthisuser?"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1D34D8",
        cancelButtonColor: "#d33",
        confirmButtonText: t("messages:Yes,resetIt"),
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
        title: t("Error!"),
        text: t("Failedtoresetthepassword.Pleasetryagain."),
        icon: "error",
        confirmButtonColor: "#d33",
      });
    }
  };

  const RoleEnum = {
    Company_Owner: 0,
    User: 1,
    Project_Manager: 2,
  };



  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      // Generate a temporary object URL for the preview
      const objectUrl = URL.createObjectURL(file);
      setSelectedImage(objectUrl); // Set preview image as object URL
      // Optionally, store the file itself for upload
      //setUploadedFile(file);
    }
  };
  
  const handleEdit = (teamMember) => {
    setTeamMemberToEdit(teamMember); 
    setSelectedImage(teamMember.image)

    setIsEditDialogOpen(true);  
  };

  const validationSchema = Yup.object({
    name: Yup.string()
      .required(t('messages:Required'))
      .max(30, t('messages:Namemustbeatmost30characters')),
    lastName: Yup.string()
      .required(t('messages:Required'))
      .max(40, t('messages:Lastnamemustbeatmost40characters')),
    role: Yup.number()
      .required(t('messages:Required')),
    image: Yup.mixed().nullable(),
    birthDate: Yup.date()
      .required(t('messages:Required'))
      .max(new Date(), t('messages:BirthDatecannotbeinfuture')),
    phoneNumber: Yup.string()
      .matches(/^\+?[0-9]{10,15}$/, t('messages:InvalidphoneNumberFormat'))
      .required(t('messages:Required')),
    email: Yup.string()
      .email(t('messages:Invalidemailformat'))
      .required(t('messages:Required')), 
  });

  const handleUpdateTeamMember = async (values) => {
    try {
      const formData = new FormData();
      formData.append('Name', values.name);
      formData.append('LastName', values.lastName);
      formData.append('Role', values.role);
      formData.append('PhoneNumber', values.phoneNumber);
      formData.append('BirthDate', new Date(values.birthDate).toISOString().split('T')[0]);
      formData.append('Image', values.Image);
      formData.append('Email', values.email); 
  
      const response = await userSerivce.edit(teamMemberToEdit.email, formData);
      console.log(response)
  
      setIsEditDialogOpen(false);
  
      Swal.fire({
        title: t('messages:Success'),
        text: t('messages:Team member has been updated!'),
        icon: 'success',
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error('Error updating team member:', error.response || error.message);
      setIsEditDialogOpen(false);
      Swal.fire(t('messages:Error'), t('messages:Team member has been updated!'), 'error');
    }
  };
  
  const columns = [
    {
      field: 'name',
      headerName: t("columns:NameLastname"),
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
      headerName: t("columns:Email"),
      minWidth: 250,
      renderCell: (params) => (
        <Typography>{params.row?.email || 'N/A'}</Typography>
      ),
    },
    {
      field: 'phoneNumber',
      headerName: t('columns:Phonenumber'),
      minWidth: 150,
      renderCell: (params) => (
        <Typography>{params.row?.phoneNumber || 'N/A'}</Typography>
      ),
    },
    {
      field: 'role',
      headerName: t('columns:Role'),
      minWidth: 130,
      renderCell: (params) => {
        const role = params.row?.role;
        return t(role);
      },    },
    {
      field: 'dateAddedProject',
      headerName: t('columns:JoinedDate'),
      minWidth: 150,
      renderCell: (params) => formatDate(params.row?.addedTimeProject),
    },
    {
      field: 'actions',
      headerName: t('Actions'),
      minWidth: 150,
      renderCell: (params) => {
        const isCurrentUser = params.row.id === currentUserId;
    
        return (
          <div className="text-center">
            {!isCurrentUser && (
              <>
                {/* Edit button */}
                <IconButton
                  onClick={() => handleEdit(params.row)}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '20%',
                    padding: '5px',
                    border: '1px solid #e0e0e0',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                    marginRight: '8px',
                  }}
                >
                  <EditIcon sx={{ color: '#424242' }} />
                </IconButton>
                {/* Delete button */}
                <IconButton
                  onClick={() => handleDelete(params.row.id)}
                  sx={{
                    backgroundColor: '#f5f5f5',
                    borderRadius: '20%',
                    padding: '5px',
                    border: '1px solid #e0e0e0',
                    '&:hover': { backgroundColor: '#e0e0e0' },
                  }}
                >
                  <DeleteIcon sx={{ color: '#d33' }} />
                </IconButton>
              </>
            )}
          </div>
        );
      },
    },
  ];
  
  if (loading) return <Typography>{t("Loading")}</Typography>;

  return (
    <Box>
      <Paper
      className='!mt-4 !sm:mt-0'
        sx={{
          width: '100%',
          overflowX: 'hidden',
          maxWidth: '100vw',
        }}
      >
        <Box
          sx={{
            width: '100%',
            //overflowX: { xs: 'auto', sm: 'hidden' },
          }}
        >
          <DataGrid
            className="!max-w-[80vw]"
            rows={teamMembers}
            columns={columns}
            initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
            pageSizeOptions={[50, 100, 200]}
            sx={{
              border: 0,
              minWidth: 200,
              height: 'auto',
              '& .MuiDataGrid-root': {
                overflowX: 'auto',
              },
              '& .MuiDataGrid-cell': {
                display: 'flex', 
                alignItems: 'center', 
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                textAlign: 'center', 
              },
              '& .MuiDataGrid-columnHeader': {
                textAlign: 'center', 
                justifyContent: 'center', 
              },
              '& .MuiDataGrid-footerContainer':{
                justifyContent: 'flex-start'
              }
            }}
            getRowId={(row) => row.id}
          />
        </Box>
      </Paper>

      <Dialog
      open={isEditDialogOpen}
      onClose={() => setIsEditDialogOpen(false)}
      fullWidth
      PaperProps={{
        style: {
          borderRadius: 20,
          backgroundColor: '#fcfcfc',
        },
      }}
    >
      <DialogTitle className="!font-semibold">
        {t("PopUp:EditTeamMember")}
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
              : '',
            phoneNumber: teamMemberToEdit?.phoneNumber || '',
            role:
              teamMemberToEdit?.role && typeof teamMemberToEdit.role === 'string'
                ? RoleEnum[teamMemberToEdit.role] 
                : teamMemberToEdit?.role ?? RoleEnum.User, 
            image: teamMemberToEdit?.image,
            email: teamMemberToEdit?.email || '',
          }}
          validationSchema={validationSchema} 
          onSubmit={async (values, { setSubmitting }) => {
            await handleUpdateTeamMember({ ...values, image: selectedImage });
            setSubmitting(false);
          }}
      >
          {({ setFieldValue, errors, touched, isSubmitting }) => (
            <Form>
              {/* Profile Photo Section */}
              <Box display="flex" flexDirection="column" alignItems="center" marginBottom={3}>
              <Box
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  marginBottom: 3,
                }}
              >
                {/* Profile Image */}
                <img
                src={
                  selectedImage?.startsWith("blob:") 
                    ? selectedImage 
                    : `${process.env.REACT_APP_DOCUMENT_URL}/assets/images/teammembers/${selectedImage || "defaultUser.png"}`
                }
                            alt="Profile"
                  style={{
                    width: 150,
                    height: 150,
                    borderRadius: '50%',
                    objectFit: 'cover',
                    marginBottom: 0,
                  }}
                />
              </Box>
                <Button
                  variant="text"
                  className="!text-[#1D34D8]"
                  onClick={() => document.getElementById('profile-image-input').click()}
                >
                  {t("PopUp:EditImage")}
                </Button>
                <input
                  id="profile-image-input"
                  type="file"
                  accept="image/*"
                  style={{ display: 'none' }}
                  onChange={(event) => {
                    handleImageUpload(event);
                    setFieldValue('Image', event.currentTarget.files[0]);
                  }}
                />
              </Box>

              <Field
                as={TextField}
                name="name"
                label= {t("PopUp:Name")}
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
                label= {t("PopUp:BirthDate")}
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

              <DialogActions>
                <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                  <Button
                    onClick={() => handleResetPassword(teamMemberToEdit.id)}
                    className="!text-[#1D34D8]"
                  >
                    {t("ResetPassword")}
                  </Button>
                </Box>

                <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                  <Button
                    variant="outlined"
                    className="!text-[#1D34D8] !mr-2"
                    onClick={() => setIsEditDialogOpen(false)}
                  >
                    {t("PopUp:Cancel")}
                  </Button>
                  <Button type="submit" variant="contained" className="!bg-[#1D34D8]">
                    {t("PopUp:Save")}
                  </Button>
                </Box>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </DialogContent>
      </Dialog>
    </Box>

  );
};

export default SettingsAndTeams;
