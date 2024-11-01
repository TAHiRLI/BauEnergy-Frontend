import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress, List, ListItem, ListItemText, Divider, TextField, FormControlLabel, Radio } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Select, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { instrumentHistoryService } from '../../APIs/Services/instrumentHistory.service';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ShareIcon from '@mui/icons-material/Share';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Swal from 'sweetalert2';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import axios from 'axios';
import DeleteIcon from '@mui/icons-material/Delete';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { styled } from '@mui/material/styles';

const validationSchema = Yup.object().shape({
  name: Yup.string().required('Instrument name is required'),
  description: Yup.string().required('Description is required'),
  shortDesc: Yup.string().required('Short description is required'),
  instrumentType: Yup.string().required('Instrument type is required'),
  //status: Yup.string().required('Status is required'),
});

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

const InstrumentDetails = () => {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [refresh, setRefresh] = useState(false); // Step 1: Define refresh state

  const [imagePreviews, setImagePreviews] = useState([]);
  const [newInstrument, setNewInstrument] = useState({ mainImageIndex: null });
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [existingPdfs, setExistingPdfs] = useState([]);

  const handleImageUpload = (e, setFieldValue) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
    setFieldValue('images', files); // Set the files in Formik's values
  };

  // const handleMainImageChange = (e, setFieldValue) => {
  //   setNewInstrument({ ...newInstrument, mainImageIndex: parseInt(e.target.value) });
  //   console.log(e.target.value)
  //       setFieldValue('mainImageIndex', parseInt(e.target.value)); // Set the files in Formik's values
  // };

  const handleMainImageChange = (e, setFieldValue) => {
    const selectedIndex = parseInt(e.target.value);
    setFieldValue('mainImageIndex', selectedIndex); // Update Formik's mainImageIndex value
  };

  const handlePdfUpload = (e, setFieldValue) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    setFieldValue('files', files); // Set the files in Formik's values
  };


  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const response = await instrumentService.getById(id);
        setInstrument(response.data);
        // setFormData({
        //   name: response.data.name,
        //   description: response.data.description,
        //   status: response.data.status
        // });
        setLoading(false);
      } catch (error) {
        setError('Error fetching instrument details');
        setLoading(false);
      }
    };
  
    fetchInstrument();
  }, [id,refresh]);
  
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await instrumentHistoryService.getById(id);
        setHistory(response.data);
      } catch (error) {
        console.error('Error fetching instrument history:', error);
      }
    };
  
    if (instrument) {
      fetchHistory();
    }
  }, [id, instrument]);
  
  const handleShowQR = () => {
    setOpenQRDialog(true);
  };

  const handleCloseShowQR = () => {
    setOpenQRDialog(false);
  };

  const handleShare = () => {
    const shareData = {
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

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileName = (fileName) => {
    const parts = fileName.split(' ');
    return parts.slice(1).join('');
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Under_maintenance':
        return 'red';
      case 'In_use':
        return 'blue';
      case 'Available':
      case 'Aviable':
        return 'green';
      default:
        return 'gray';
    }
  };

  const handleOpenUpdateModal = () => {
    setOpenUpdateModal(true);
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
  };

  const handleUpdateSubmit = async (values, { setSubmitting, resetForm }) => {
    console.log(values);
    const formData = new FormData();
    formData.append('Name', values.name);
    formData.append('Description', values.description);
    formData.append('ShortDesc', values.shortDesc);
    formData.append('InstrumentType', values.instrumentType);
    if (values?.mainImageIndex != null) {
      formData.append('MainImageIndex', values.mainImageIndex);
    }    
    values.images?.forEach((image) => formData.append(`Images`, image));
    values.files?.forEach((file) => formData.append(`Files`, file));
    console.log(formData);
    
    try {
      const response = await instrumentService.edit(id, formData);
      if (response.status !== 200) throw new Error('Failed to submit data');
      Swal.fire('Success', 'Instrument has been updated!', 'success');
      handleCloseUpdateModal();
      resetForm();
      setRefresh(!refresh); 

      console.log('Data submitted successfully');
    } catch (error) {
      handleCloseUpdateModal();
      Swal.fire('Error', 'Failed to update instrument.', 'error');
      console.error('Error submitting data:', error);
    }
  };
  
  

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <Typography color="error">{error}</Typography>
      </Box>
    );
  }
  const mainImage = instrument?.images?.find((img) => img.isMain);
  const otherImages = instrument?.images?.filter((img) => !img.isMain);

  const handleDeleteImage = async (imageId) => {
    try {
      await instrumentService.removeImage(instrument.id, imageId)
      // Update state to remove deleted image from UI
      setExistingImages(existingImages.filter(image => image.id !== imageId));
      handleCloseUpdateModal();
      Swal.fire('Success', 'Document deleted successfully!', 'success');
      setRefresh(!refresh); 
    } catch (error) {
      console.error("Failed to delete image:", error);
    }
  };
  
  const handleDeletePdf = async (pdfId) => {
    try {
      await instrumentService.removePdf(instrument.id, pdfId)
      // Update state to remove deleted PDF from UI
      setExistingPdfs(existingPdfs.filter(pdf => pdf.id !== pdfId));
      handleCloseUpdateModal();
      Swal.fire('Success', 'Document deleted successfully!', 'success');
      setRefresh(!refresh); 

    } catch (error) {
      console.error("Failed to delete PDF:", error);
    }
  };
  
  return (
    <Box p={1}>
      {/* Instrument Card */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-5">
        <div className="flex flex-col sm:flex-row">
          <div className="sm:w-1/3 p-4">
            {mainImage && (
              <img
                src={`${process.env.REACT_APP_DOCUMENT_URL}${mainImage.image}`}
                alt={instrument.name}
                className="rounded-lg w-full h-auto shadow-md mb-3"
              />
            )}

            {/* Secondary Images */}
            <div className="grid grid-cols-2 gap-2">
              {otherImages &&
                otherImages.map((img, index) => (
                  <img
                    key={index}
                    src={`${process.env.REACT_APP_DOCUMENT_URL}${img.image}`}
                    alt={`${instrument.name} image ${index + 1}`}
                    className="rounded-md shadow-sm"
                  />
                ))}
            </div>
          </div>
          <div className="sm:w-2/3 p-5">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {instrument.name}
            </div>
            <div className="text-gray-600 mb-2">
              Status:{" "}
              <span className="font-bold" style={{ color: getStatusColor(instrument.status) }}>
                {instrument.status.split('_').join(' ')}
              </span>
            </div>
            <p className="text-gray-700 my-2">{instrument.shortDesc}</p>
            <p className="text-gray-600 mb-2">{instrument.description}</p>
            <div className="text-gray-600">
              Instrument Type: <span className="font-bold text-blue-700">{instrument.instrumentType}</span>
            </div>
            <div className="text-gray-600 my-2">Project: {instrument.projectName}</div>
            <div className="text-gray-600 my-2">
              Added to project:{" "}
              <span className="font-bold text-blue-600">
                {new Date(instrument.addedProjectDate).toLocaleDateString()}
              </span>
            </div>

            <div className="mt-4 flex gap-4">
              <button
                onClick={handleShowQR}
                className="bg-blue-600 text-white font-semibold rounded-3xl px-6 py-2 transition hover:bg-blue-500"
              >
                Scan QR Code
              </button>
              <button
                onClick={handleOpenUpdateModal}
                className="bg-blue-600 text-white font-semibold rounded-3xl px-6 py-2 transition hover:bg-blue-500"
              >
                Update Instrument
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Section */}
      <Box mt={5} p={3} sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D34D8', mb: 2 }}>
          Documents
        </Typography>

        <Grid spacing={2}>
          {instrument.documents?.length > 0 ? (
            instrument.documents.map((doc, index) => (
              <Grid item xs={6} sm={3} key={index}>
                <Box display="flex" alignItems="center" sx={{ padding: 1 }}>
                  {doc.fileType === 'pdf' ? <PictureAsPdfIcon sx={{ fontSize: 50, color: '#D32F2F' }} /> : <DescriptionIcon sx={{ fontSize: 50 }} />}
                  <Typography
                    variant="body1"
                    sx={{ marginLeft: '10px', cursor: 'pointer', color: '#1D34D8', fontWeight: 'bold' }}
                    onClick={() => handleDownload(`${process.env.REACT_APP_DOCUMENT_URL}/assets/pdf/${doc.fileName}`)}
                  >
                    {formatFileName(doc.fileName)}
                  </Typography>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
              No documents available for this instrument.
            </Typography>
          )}
        </Grid>
      </Box>

      {/* Instrument History */}
      <Box mt={5} p={3} sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 2 }}>
        <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D34D8', mb: 2 }}>
          Instrument History
        </Typography>

        {history.length > 0 ? (
          <List>
            {history.map((event, index) => (
              <React.Fragment key={index}>
                <ListItem className="!px-0">
                  <ListItemText
                    primary={`Event: ${event.description}`}
                    secondary={`Date: ${new Date(event.eventDate).toLocaleDateString()}`}
                  />
                </ListItem>
                {index < history.length - 1 && <Divider />}
              </React.Fragment>
            ))}
          </List>
        ) : (
          <Typography variant="body2" color="textSecondary">
            No history available for this instrument.
          </Typography>
        )}
      </Box>

      {/* Update Instrument Modal */}
      <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal} fullWidth maxWidth="sm" PaperProps={{
      style: {
          borderRadius: 20,
          //height: "500px",
          backgroundColor: "#fcfcfc"  
      },
      }}>
        <DialogTitle>Update Instrument
          <IconButton
                          className="!text-blue-700"
                          aria-label="close"
                          onClick={handleCloseUpdateModal}
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
            name: instrument?.name || '',
            description: instrument?.description || '',
            shortDesc: instrument?.shortDesc || '',
            instrumentType: instrument?.instrumentType || '',
            images: instrument.images || null,
            files: instrument.files || null,
            mainImageIndex: instrument.mainImageIndex || null,
          }}
          validationSchema={validationSchema}
          onSubmit={handleUpdateSubmit}
        >
          {({ setFieldValue, errors, touched }) => (
            <Form>
              <Box my={2}>
                <Field
                  as={TextField}
                  name="name"
                  label="Instrument Name"
                  fullWidth
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
              </Box>
              <Box mb={2}>
                <Field
                  as={TextField}
                  name="description"
                  label="Description"
                  fullWidth
                  error={touched.description && !!errors.description}
                  helperText={touched.description && errors.description}
                />
              </Box>
              <Box mb={2}>
                <Field
                  as={TextField}
                  name="shortDesc"
                  label="Short Description"
                  fullWidth
                  error={touched.shortDesc && !!errors.shortDesc}
                  helperText={touched.shortDesc && errors.shortDesc}
                />
              </Box>
              <Box mb={2}>
                <Field
                  as={TextField}
                  name="instrumentType"
                  label="Instrument Type"
                  fullWidth
                  error={touched.instrumentType && !!errors.instrumentType}
                  helperText={touched.instrumentType && errors.instrumentType}
                />
              </Box>

              {/* Image upload */}
              <StyledBox>
                <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
                >
                Upload Images
                <VisuallyHiddenInput
                  name="images"
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, setFieldValue)}
                />
                </Button>
              </StyledBox>
               {/* Image Previews and Main Image Selection */}
              {imagePreviews.length > 0 && (
                <Box mt={2}>
                  <Typography variant="h6">Select Main Image:</Typography>
                  <Grid container spacing={2}>
                      {imagePreviews.map((image, index) => (
                      <Grid item xs={4} key={index}>
                          <img src={image} alt={`Preview ${index}`} style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '10px' }} />
                          <FormControlLabel
                          control={<Radio
                              checked={newInstrument?.mainImageIndex === index}
                              onChange={(e) => handleMainImageChange(e, setFieldValue)}
                              value={index}
                              name="mainImageIndex"
                          />}
                          label="Main"
                          />
                      </Grid>
                      ))}
                  </Grid>
                  
                </Box>
              )}

              {/* PDF Upload */}
              <StyledBox>
                  <Button
                    component="label"
                    variant="contained"
                    startIcon={<CloudUploadIcon />}
                  >
                    Upload files
                    <VisuallyHiddenInput
                      name="files"
                      type="file"
                      onChange={(e) => handlePdfUpload(e, setFieldValue)}
                      multiple
                      accept="application/pdf"
                    />
                  </Button>
              </StyledBox>
              {/* Display uploaded PDF files */}
              <Box mt={2}>
                    {uploadedFiles.length > 0 ? (

                      <Grid container spacing={1}>
                        {uploadedFiles.map((file, index) => (
                          <Grid item xs={12} key={index} display="flex" alignItems="center">
                            <PictureAsPdfIcon color="error" />
                            <Typography variant="body2" ml={1}>
                              {file.name}
                            </Typography>
                          </Grid>
                        ))}
                      </Grid>
                    ) : (
                      <Typography variant="body2" color="textSecondary">No files uploaded</Typography>
                    )}          
              </Box>

              {instrument.images.length > 0 && (
                <Box mt={2}>
                  <Typography variant="h6">Images:</Typography>
                  <Grid container spacing={2}>
                    {instrument.images.map((image, index) => (
                      <Grid item xs={4} key={index}>
                        <img
                          src={`${process.env.REACT_APP_DOCUMENT_URL}${image.image}`}
                          alt={`Image ${index}`}
                          style={{ width: '100%', height: '100px', objectFit: 'cover', borderRadius: '10px' }}
                          loading='lazy'
                        />
                        <IconButton
                          color="error"
                          onClick={() => handleDeleteImage(image.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              {/* PDF Display and Delete */}
              {instrument.documents.length > 0 && (
                <Box mt={2}>
                  <Typography variant="h6">PDFs:</Typography>
                  <Grid container spacing={1}>
                    {instrument.documents.map((pdf, index) => (
                      <Grid item xs={12} key={index} display="flex" alignItems="center">
                        <PictureAsPdfIcon color="error" />
                        <Typography variant="body2" ml={1}>
                          {formatFileName(pdf.fileName)}
                        </Typography>
                        <IconButton
                          color="error"
                          onClick={() => handleDeletePdf(pdf.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}

              <DialogActions className='!px-0'>
              <Button variant="outlined" className='!text-[#1D34D8]' onClick={handleCloseUpdateModal}>
                  Cancel
                </Button>
                <Button type="submit" variant="contained" className='!bg-[#1D34D8]'>
                  Update
                </Button>
        </DialogActions>
            </Form>
          )}
  
        </Formik>

      </DialogContent>

        {/* <DialogActions className='!px-10'>
          <Button onClick={handleCloseUpdateModal} className='!text-[#1D34D8] '>Cancel</Button>
          <Button type="submit" onSubmit={(values) => {
      console.log('Submitting values:', values);  // Check values here
      handleUpdateSubmit(values);
    }} variant="contained" className='!bg-[#1D34D8]'>Update</Button>
        </DialogActions> */}
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={openQRDialog} onClose={handleCloseShowQR}
            PaperProps={{
                style: {
                  borderRadius: 20,
                  //height: "500px",  
                },
              }}>
                <DialogTitle>
                    Qr Instrument
                    <IconButton
                        className="!text-[#1D34D8]"
                        aria-label="close"
                        onClick={handleCloseShowQR}
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

                <DialogContent >
                  <div className='flex justify-between items-center'>
                    <Typography variant="body1" >
                        Instrument details:
                    </Typography>
                    <Button
                      className='!text-[#1D34D8] !rounded-xl'
                      startIcon={<ShareIcon />}
                      onClick={handleShare}
                    >
                      Share
                    </Button>
                  </div>

                    <Box
                          display="flex"
                          flexDirection="column"
                          alignItems="center"
                          justifyContent="center"
                          p={2}
                          mt={2}
                          border={1}
                          borderColor="grey.300"
                          borderRadius="12px"
                      >
                          <Typography
                              variant="h6"
                              align="center"
                              gutterBottom
                              style={{ fontWeight: 'bold' }}
                          >
                              {instrument.name}
                          </Typography>

                          <Typography
                              variant="body2"
                              color="textSecondary"
                              align="center"
                              gutterBottom
                          >
                              Scan QR to get more information about instrument's history
                          </Typography>

                          <img
                          className='border-[30px] border-gray-200 rounded-xl'
                              src={`${process.env.REACT_APP_DOCUMENT_URL}/${instrument.qrImage}`}
                              alt="QR Code"
                              style={{
                                  width: '200px',
                                  height: '200px',
                                  margin: '10px 0',
                              }}
                          />
                    </Box>
                </DialogContent>
      </Dialog>
    </Box>
  );
};

export default InstrumentDetails;
