import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress, List, ListItem, ListItemText, Divider, TextField, FormControlLabel, Radio } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Select, MenuItem } from '@mui/material';
import { useParams } from 'react-router-dom';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { instrumentHistoryService } from '../../APIs/Services/instrumentHistory.service';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import StatusButton from '../../components/common/statusBtn';
import ShareIcon from '@mui/icons-material/Share';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Swal from 'sweetalert2';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';

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
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    shortDesc: '',
    status: ''
  });

  const [imagePreviews, setImagePreviews] = useState([]);
  const [newInstrument, setNewInstrument] = useState({ mainImageIndex: null });
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleMainImageChange = (e) => {
    setNewInstrument({ ...newInstrument, mainImageIndex: parseInt(e.target.value) });
  };

  const handlePdfUpload = (e) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(files);
  };


  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const response = await instrumentService.getById(id);
        setInstrument(response.data);
        setFormData({
          name: response.data.name,
          description: response.data.description,
          status: response.data.status
        });
        setLoading(false);
      } catch (error) {
        setError('Error fetching instrument details');
        setLoading(false);
      }
    };
  
    fetchInstrument();
  }, [id]);
  
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

  const handleFormChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleUpdateSubmit = async () => {
    try {
      await instrumentService.edit(id, formData);
      Swal.fire({
        icon: 'success',
        title: 'Instrument updated successfully',
        timer: 1500,
        showConfirmButton: false
      });
      setOpenUpdateModal(false);
    } catch (error) {
      console.error('Error updating instrument:', error);
      Swal.fire({
        icon: 'error',
        title: 'Error updating instrument',
        text: error.message,
      });
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

  return (
    <Box p={2}>
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

            <div className="mt-4">
              <button
                onClick={handleShowQR}
                className="bg-blue-600 text-white font-semibold rounded-3xl px-6 py-2 transition hover:bg-blue-500"
              >
                Scan QR Code
              </button>
              <button
                onClick={handleOpenUpdateModal}
                className="ml-4 bg-blue-600 text-white font-semibold rounded-3xl px-6 py-2 transition hover:bg-blue-500"
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
        <DialogTitle>Add New Instrument
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
        <TextField
          autoFocus
          margin="dense"
          name="name"
          label="Instrument Name"
          type="text"
          fullWidth
          value={formData.name}
          onChange={handleFormChange}
        />
        <TextField
          margin="dense"
          name="description"
          label="Description"
          type="text"
          fullWidth
          value={formData.description}
          onChange={handleFormChange}
        />
        <TextField
          margin="dense"
          name="shortDesc"
          label="Short Description"
          type="text"
          fullWidth
          value={formData.shortDesc}
          onChange={handleFormChange}
        />
        <Select
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleFormChange}
          fullWidth
          margin="normal"
        >
          <MenuItem value="Under_maintenance">Under Maintenance</MenuItem>
          <MenuItem value="In_use">In Use</MenuItem>
          <MenuItem value="Available">Available</MenuItem>
        </Select>

        {/* Image Upload */}
        <Box mt={2}>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Upload Images
            <input
              type="file"
              multiple
              accept="image/*"
              onChange={handleImageUpload}
              hidden
            />
          </Button>
        </Box>

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
                      checked={newInstrument.mainImageIndex === index}
                      onChange={handleMainImageChange}
                      value={index}
                      name="mainImage"
                    />}
                    label="Main"
                  />
                </Grid>
              ))}
            </Grid>
          </Box>
        )}

        {/* PDF Upload */}
        <Box mt={2}>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
            Upload PDFs
            <input
              type="file"
              onChange={handlePdfUpload}
              multiple
              accept="application/pdf"
              hidden
            />
          </Button>
        </Box>

        {/* Display Uploaded PDF files */}
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
      </DialogContent>

        <DialogActions className='!px-10'>
          <Button onClick={handleCloseUpdateModal} className='!text-[#1D34D8] '>Cancel</Button>
          <Button type="submit" onClick={handleUpdateSubmit} variant="contained" className='!bg-[#1D34D8]'>Update</Button>
        </DialogActions>
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
