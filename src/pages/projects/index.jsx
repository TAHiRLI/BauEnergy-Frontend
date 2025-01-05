import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import { useLocation, useNavigate } from 'react-router-dom';
import { IconButton, useMediaQuery } from '@mui/material';
import { Formik, Field, Form } from 'formik';
import * as Yup from 'yup';
import InstrumentTab from '../../components/ProjectsDetails/ProjectInstrumentTab';
import TeamMember from '../../components/ProjectsDetails/ProjectTeamMembers';
import ProjectOverview from '../../components/ProjectsDetails/ProjectOverviewTab';
import InstrumentTabResponsive from '../../components/ProjectsDetails/InstrumentTabResponsive';
import TeamMemberTabResponsive from '../../components/ProjectsDetails/TeamMemberTabResponsive';
import ProjectDocuments from '../../components/ProjectsDetails/ProjectDocuments';
import LocationOnIcon from '@mui/icons-material/LocationOn';
import { Share as ShareIcon } from '@mui/icons-material';
import Swal from 'sweetalert2';
import { projectService } from '../../APIs/Services/project.service';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { useTranslation } from "react-i18next";


function CustomTabPanel(props) {
  const { children, value, index } = props;

  return (
    <div role="tabpanel" hidden={value !== index} id={`simple-tabpanel-${index}`} aria-labelledby={`simple-tab-${index}`}>
      {value === index && <Box sx={{ p: 1, pt: 3 }}>{children}</Box>}
    </div>
  );
}

CustomTabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.number.isRequired,
  value: PropTypes.number.isRequired,
};

function a11yProps(index) {
  return {
    id: `simple-tab-${index}`,
    'aria-controls': `simple-tabpanel-${index}`,
  };
}

export default function BasicTabs() {
  const { t } = useTranslation();
  
  const location = useLocation();
  const navigate = useNavigate();
  const [project, setProject] = useState(location.state?.project || "null");
  const [value, setValue] = useState(0);
  const [openEditDialog, setOpenEditDialog] = useState(false);

  useEffect(() => {
    if (location.state?.project) {
        setProject(location.state.project);
    }
}, [location.state]);

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const formatDate = (date) => {
    if (!date) return;
    return new Intl.DateTimeFormat('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date));
  };

  const handleShare = () => {
    const shareData = {
      title: project.name,
      text: `Check out this project: ${project.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.error('Error sharing:', err);
      });
    } else {
      Swal.fire({
        icon: 'info',
        title: 'Share Link',
        text: `Your browser doesn't support sharing. Please copy the link manually.`,
        footer: `<a href="${window.location.href}" target="_blank">Copy Link</a>`,
      });
    }
  };

  const validationSchema = Yup.object({
    name: Yup.string().required(t('messages:required')),
    startDate: Yup.date().required(t('messages:startDateRequired')),
    endDate: Yup.date()
      .required(t('messages:endDateRequired'))
      .min(Yup.ref('startDate'), t('messages:endDateMin')),
    address: Yup.string().required(t('messages:addressRequired')),
  });
  

  const handleEditDialogOpen = () => {
    setOpenEditDialog(true);
  };

  const handleEditDialogClose = () => {
    setOpenEditDialog(false);
  };

  const handleFormSubmit = async (values) => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append('Name', values.name);
      formDataToSend.append('Description', values.description);
      formDataToSend.append('StartDate', values.startDate);
      formDataToSend.append('EndDate', values.endDate);
      formDataToSend.append('Address', values.address);
      formDataToSend.append('Id', project.id);
      const response = await projectService.edit(project.id, formDataToSend);

      if (response.status === 200) {
        Swal.fire({
          icon: 'success',
          title: 'Project edited',
          text: response.data?.message || 'The project was successfully updated.',
        });
        setProject({ ...project, ...values });
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: response.data?.message || 'Failed to update the project. Please try again later.',
        });
      }
    } catch (error) {
      console.error('Error updating project:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      setOpenEditDialog(false); 
    }
  };

  const handleDelete = async () => {
    try {
      const confirmDelete = await Swal.fire({
        title: 'Are you sure?',
        text: `This action will permanently delete the project "${project?.name}". Do you want to proceed?`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Delete',
        confirmButtonColor: '#1D34D8',
        cancelButtonText: 'Cancel',
        cancelButtonColor: '#d33',
        allowOutsideClick: true,
        backdrop: true,
        didOpen: () => {
          const swalModal = document.querySelector('.swal2-container');
          if (swalModal) {
            swalModal.style.zIndex = '1500';
          }
        },
      });
  
      if (confirmDelete && confirmDelete.isConfirmed) {
        const response = await projectService.remove(project.id);
  
        if (response.status === 200) {
          setOpenEditDialog(false); 
          await Swal.fire({
            icon: 'success',
            title: 'Project Deleted',
            text: response.data?.message || 'The project was successfully deleted.',
          });
          navigate('/');
        } else {
          await Swal.fire({
            icon: 'error',
            title: 'Error',
            text: response.data?.message || 'Failed to delete the project. Please try again later.',
          });
        }
      }
    } catch (error) {
      console.error('Error deleting project:', error);
      await Swal.fire({
        icon: 'error',
        title: 'Error',
        text: error.response?.data?.message || 'An unexpected error occurred. Please try again later.',
      });
    } finally {
      //setOpenEditDialog(false); 
    }
  };
  
  
  const isSmallScreen = useMediaQuery('(max-width:800px)');

  return (
    <Box 
    className="!max-w-[90vw]"
    sx={{ width: '100%' }}
    >
      <div className="sm:flex sm:flex-row flex-col justify-between items-center pl-2 pr-6 pt-4 sm:pt-0">
        <div>
          <div className="text-2xl font-semibold">• {project?.name}</div>
          <div className="text-gray-600 text-sm mt-2">
            {formatDate(project?.startDate)} - {formatDate(project?.endDate)}
          </div>
        </div>
        <div className="flex items-center py-3 gap-3">
        <Button
            className="!rounded-2xl !bg-slate-200 !text-black !px-4 mr-0 sm:mr-1"
            startIcon={<ShareIcon />}
            variant="contained"
            sx={{
              textTransform: 'none',
            }}
            onClick={handleShare}
          >
            {t("PopUp:Shareprojectlink")}
          </Button>
          <Button
            className="!rounded-2xl !bg-[#1D34D8] !text-white !px-4 mr-0 sm:mr-1"
            variant="contained"
            sx={{
              textTransform: 'none',
            }}
            onClick={handleEditDialogOpen}
          >
              {t("PopUp:EditProject")}
            </Button>
        </div>
      </div>
      <div className="text-gray-500 text-lg mt-1">
        <LocationOnIcon /> {project?.address}
      </div>

      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          scrollButtons="auto"

          value={value}
          onChange={handleChange}
          aria-label="basic tabs example"
          variant="scrollable"
        >
          <Tab label={t('PopUp:Overview')} {...a11yProps(0)} />
          <Tab label={t('PopUp:UsedInstruments')} {...a11yProps(1)} />
          <Tab label={t('TeamMembers')} {...a11yProps(2)} />
          <Tab label={t('columns:Documents')} {...a11yProps(3)} />
        </Tabs>
      </Box>

      <CustomTabPanel value={value} index={0}>
        <ProjectOverview project={project} />
      </CustomTabPanel>
      <CustomTabPanel value={value} index={1}>
        {isSmallScreen ? <InstrumentTabResponsive project={project} /> : <InstrumentTab project={project} />}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={2}>
        {isSmallScreen ? <TeamMemberTabResponsive project={project} /> : <TeamMember project={project} />}
      </CustomTabPanel>
      <CustomTabPanel value={value} index={3}>
        <ProjectDocuments project={project} />
      </CustomTabPanel>

      {/* Edit Project Dialog */}
      <Dialog open={openEditDialog} onClose={handleEditDialogClose} PaperProps={{
      style: {
          borderRadius: 20,
          //height: "500px",
          backgroundColor: "#fcfcfc"  
      },
      }}>


        <DialogTitle>{t("PopUp:EditProject")}
          <IconButton
            className="!text-blue-700"
            aria-label="close"
            onClick={handleEditDialogClose}
            sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>        
        <DialogContent>
          <Formik
            initialValues={{
              name: project?.name || '',
              address: project?.address || '',
              description: project?.description || '',
              startDate: project?.startDate ? new Date(project.startDate).toLocaleDateString('en-CA') : "",
              endDate: project?.endDate ? new Date(project.endDate).toLocaleDateString('en-CA') : "",
            }}
            validationSchema={validationSchema}
            onSubmit={handleFormSubmit}
          >
            {({ values, handleChange, handleBlur, touched, errors }) => (
              <Form>
                <Field
                  as={TextField}
                  margin="dense"
                  label= {t("PopUp:ProjectName")}
                  type="text"
                  name="name"
                  fullWidth
                  variant="outlined"
                  value={values.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.name && Boolean(errors.name)}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  label={t("columns:Description")}
                  type="text"
                  name="description"
                  fullWidth
                  variant="outlined"
                  value={values.description}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.description && Boolean(errors.description)}
                  helperText={touched.description && errors.description}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  label= {t("PopUp:Address")}
                  type="text"
                  name="address"
                  fullWidth
                  variant="outlined"
                  value={values.address}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.address && Boolean(errors.address)}
                  helperText={touched.address && errors.address}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  label={t("columns:Start Date")}
                  type="date"
                  name="startDate"
                  fullWidth
                  variant="outlined"
                  value={values.startDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.startDate && Boolean(errors.startDate)}
                  helperText={touched.startDate && errors.startDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <Field
                  as={TextField}
                  margin="dense"
                  label={t("columns:End Date")}
                  type="date"
                  name="endDate"
                  fullWidth
                  variant="outlined"
                  value={values.endDate}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  error={touched.endDate && Boolean(errors.endDate)}
                  helperText={touched.endDate && errors.endDate}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
                <DialogActions sx={{ display: 'flex', justifyContent: 'space-between', padding: '0px', paddingTop: '10px' }}>
                  <Box sx={{ display: 'flex', justifyContent: 'flex-start', width: '100%' }}>
                    <Button onClick={handleDelete} color="error"> {t("PopUp:Delete")} </Button>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', width: '100%' }}>
                    <Button variant="outlined" className='!text-[#1D34D8] !mr-2' onClick={handleEditDialogClose}> {t("PopUp:Cancel")} </Button>
                    <Button type="submit" variant="contained" className='!bg-[#1D34D8]'> {t("PopUp:Edit")} </Button>
                  </Box>
                </DialogActions>
              </Form>
            )}
          </Formik>
        </DialogContent>
      </Dialog>
    </Box>
  );
}
