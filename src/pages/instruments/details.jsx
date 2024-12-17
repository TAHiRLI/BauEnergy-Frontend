import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Button, CircularProgress, ListItemText, TextField, FormControl, InputLabel, Checkbox, OutlinedInput, InputAdornment } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, IconButton, DialogActions, Select, MenuItem } from '@mui/material';
import { useParams, useLocation } from 'react-router-dom';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { instrumentHistoryService } from '../../APIs/Services/instrumentHistory.service';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import ShareIcon from '@mui/icons-material/Share';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Swal from 'sweetalert2';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import DeleteIcon from '@mui/icons-material/Delete';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { styled } from '@mui/material/styles';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import AddIcon from '@mui/icons-material/Add';
import { instrumentTagService } from '../../APIs/Services/instrumentTag.service';
import StatusButton from '../../components/common/statusBtn';
import HistoryIcon from '@mui/icons-material/History'; 
import AddDocumentsDialog from  '../../components/Dialogs/AddDocument'
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import html2canvas from "html2canvas";


const validationSchema = Yup.object().shape({
  name: Yup.string().required('Instrument name is required'),
  description: Yup.string().required('Description is required'),
  shortDesc: Yup.string().required('Short description is required'),
  instrumentType: Yup.string().required('Instrument type is required'),
  price: Yup.string().required('Price is required'),
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
  const [filteredInstrument, setfilteredInstrument] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [openUpdateModal, setOpenUpdateModal] = useState(false);
  const [refresh, setRefresh] = useState(false); 

  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [existingPdfs, setExistingPdfs] = useState([]);

  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState('');
  const [isFirstEffectComplete, setIsFirstEffectComplete] = useState(false);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);

  const [selectedImage, setSelectedImage] = useState(instrument?.image || null);

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [projectSearch, setProjectSearch] = useState('');
  const [statusSearch, setStatusSearch] = useState('');

  const [openAddDocumentDialog, setOpenAddDocumentDialog] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [qrImage, setQrImage] = useState("");

  const handleAddDocumentOpenDialog = () => setOpenAddDocumentDialog(true);
  const handleAddDocumentCloseDialog = () => setOpenAddDocumentDialog(false);
  const [triggerSearch, setTriggerSearch] = useState(true);
  const handleFileChange = (event) => {
    setSelectedFiles([...event.target.files]);
  };

  const qrWrapper = document.getElementById("qr-wrapper");
  if (qrWrapper) {
    const canvas =  html2canvas(qrWrapper);
    //const image = canvas?.toDataURL("image/png");

    const link = document.createElement("a");
    //link.href = image;
    link.download = `instrument_${instrument.name || instrument.id}.png`;
    link.click();
  }

  const location = useLocation(); // Extract query string from URL
  const [highlightedId, setHighlightedId] = useState(null);
  const [showQrHighlight, setShowQrHighlight] = useState(false);

  useEffect(() => {
    if (id) {
      setHighlightedId(parseInt(id)); // Highlight this ID
    }
    // Check if '/qr' is in the URL path
    const hasQr = location.pathname.includes("/qr");
    setShowQrHighlight(hasQr);
  }, [id, location]);

  const cookies = new Cookies();
  let user = cookies.get('user'); 
  let token = user?.token

  let decodedToken;
  try {
      decodedToken = jwtDecode(token);
  } catch (error) {
      console.error("Invalid token:", error);
  }
  const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || []; 
  const canViewPrice = userRoles.includes('Company_Owner') || userRoles.includes('Project_Manager');

  const handlePdfUpload = (e, setFieldValue) => {
    const files = Array.from(e.target.files);
    setUploadedFiles(prevFiles => [...prevFiles, ...files]);
    setFieldValue('files', files); 
  };

  const handleDocumentUpload = async (selectedFiles) => {
    if (selectedFiles?.length === 0) {
        Swal.fire('Error', 'Please select at least one file.', 'error');
        return;
    }

    const formData = new FormData();
    selectedFiles.forEach((file) => formData.append('Files', file));

    try {
        const response = await instrumentService.addDocument(instrument.id, selectedFiles); 

        if (response.status !== 200) {
            throw new Error(response.data.message || 'Failed to upload documents.');
        }

        Swal.fire('Success', 'Documents uploaded successfully!', 'success');
        handleAddDocumentCloseDialog();
        fetchInstrument();

    } catch (error) {
        console.error('Error details:', error.response || error.message || error);
        Swal.fire('Error', error.response?.data?.message || 'Failed to upload documents.', 'error');
    }
};

const fetchInstrument = async () => {
  try {
    const response = await instrumentService.getById(id);
    setInstrument(response.data);
    setIsFirstEffectComplete(true);
  } catch (error) {
    setError('Error fetching instrument details');
  } finally {
    setLoading(false);
  }
};

  useEffect(() => {
    fetchInstrument();
  }, [id, refresh]);

  const fetchInstrumentsByName = async () => {
      //setLoading(true);
      try {
          const response = await instrumentService.getByExactName(
              projectSearch,
              statusSearch,
              instrument.name,
              currentPage
          );

          const { instruments, totalPages } = response.data;

          setfilteredInstrument((prevInstruments) => {
            if (currentPage > 1) {
              return [
                ...(Array.isArray(prevInstruments) ? prevInstruments : []),
                ...instruments,
              ];
            }
            return instruments; 
          });
          setTotalPages(totalPages);
      } catch (error) {
          console.error("Error fetching instrument details", error);
      } finally {
          setLoading(false);
          setTriggerSearch(false); 
      }
  };
  useEffect(() => {

    if (!isFirstEffectComplete || !triggerSearch) return;
    

    fetchInstrumentsByName();
}, [triggerSearch, currentPage, projectSearch, statusSearch, instrument]);


const loadMoreInstruments = () => {
  if (currentPage < totalPages) {
    setTriggerSearch(true);
      setCurrentPage(prevPage => prevPage + 1);
  }
};

const instrumentStatusOptions = [
  { label: 'Available', value: 'Available' },
  { label: 'In Use', value: 'In_use' },
  { label: 'Under Maintenance', value: 'Under_maintenance' },
  { label: 'In Delivery', value: 'In_delivery' },
  { label: 'In Controlling', value: 'In_controlling' },
  { label: 'Controlled', value: 'Controlled' },
  { label: 'To Be Controlled', value: 'To_be_controlled' },
];

  
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
  

  function handleShowQR(instrument) {
    setInstrument(instrument);
    setQrImage(instrument.qrImage);
    setOpenQRDialog(true);
  }

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
      case 'Available':
        return 'green';
      case 'In_use':
        return 'blue';
      case 'Under_maintenance':
        return 'red';
      case 'In_delivery':
        return 'orange';
      case 'In_controlling':
        return 'purple';
      case 'Controlled':
        return 'teal';
      case 'To_be_controlled':
        return 'darkgoldenrod';
      default:
        return 'gray';
    }
  };

  const downloadQRCodeWithText = async () => {
  // Create a unique canvas instance
  const myCanvas = document.createElement("canvas");
  const context = myCanvas.getContext("2d");

  if (!context) {
    console.error("Failed to get 2D context");
    return;
  }

  // Create an image object
  const img = new Image();
  img.crossOrigin = "anonymous"; // Allow cross-origin
  img.src = `${process.env.REACT_APP_DOCUMENT_URL}${qrImage}`;

  img.onload = () => {
    const canvasWidth = 450; // Total canvas width
    const canvasHeight = 350; // Total canvas height
    const qrWidth = 200; // QR code width
    const qrHeight = 200; // QR code height
    myCanvas.width = canvasWidth;
    myCanvas.height = canvasHeight;

    context.fillStyle = "white";
    context.fillRect(0, 0, canvasWidth, canvasHeight);

    context.fillStyle = "black";
    context.font = "bold 22px Arial";
    context.textAlign = "center";
    context.fillText(`ID_${instrument.id}`, canvasWidth / 3, 55);

    const qrX = (canvasWidth / 4 - qrWidth / 2) + 30; 
    const qrY = (canvasHeight - qrHeight) / 2; 

    context.drawImage(img, qrX, qrY, qrWidth, qrHeight);

    context.fillStyle = "black";
    context.font = "italic bold 26px Arial";
    context.textAlign = "left";
    const textX = qrX + qrWidth + 50; 
    const textY = qrY + qrHeight / 3; 
    context.fillText("Scan me", textX + 10, textY + 5);

    const bauText = "Bau";
    const energyText = "Energy";

    context.font = "italic bold 26px Arial";
    context.fillText(bauText, textX - 10, textY + 50);

    const bauWidth = context.measureText(bauText).width; 
    context.font = "italic 26px Arial";
    context.fillText(energyText, textX - 10 + bauWidth, textY + 50);

    const dataURL = myCanvas.toDataURL("image/png");
    const link = document.createElement("a");
    link.href = dataURL;
    link.download = `instrument_${instrument.name || instrument.id}.png`;
    link.click();
  };

  img.onerror = () => {
    console.error("Image failed to load. Check the URL or CORS settings.");
  };
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

  const handleOpenUpdateModal = () => {
    setSelectedImage(instrument.image)
    setOpenUpdateModal(true);
    fetchTags();
  };

  const handleCloseUpdateModal = () => {
    setOpenUpdateModal(false);
  };
  const fetchTags = async () => {
    // if (!availableTags.length) { 
        try {
            const response = await instrumentTagService.getAll();
            //console.log(response)
            setAvailableTags(response.data);
        } catch (error) {
            console.error('Error fetching available tags:', error);
        }
    // }
};

  const handleTagChange = (event) => {
    const selectedTags = event.target.value;
    setInstrument((prevState) => ({
      ...prevState,
      tags: selectedTags
    }));
};

const handleAddNewTag = () => {
    if (tagInput.trim() && !instrument.tags.includes(tagInput)
    ) {
      setInstrument((prevState) => ({
        ...prevState,
        tags: [...prevState.tags, tagInput]
      }));

      setAvailableTags((prevTags) => [
        ...prevTags,
        { id: `new-${tagInput}`, title: tagInput } 
      ]);
      setTagInput("");
    }
};

const handleUpdateSubmit = async (values, { setSubmitting, resetForm }) => {
  const formData = new FormData();
  formData.append('Name', values.name);
  formData.append('Description', values.description);
  formData.append('ShortDesc', values.shortDesc);
  formData.append('InstrumentType', values.instrumentType);
  formData.append('Price', values.price);
  formData.append('Image', values.image);

  values.files?.forEach((file) => formData.append('Files', file));
  instrument.tags.forEach((tag) => formData.append('Tags', tag));

  try {
    const response = await instrumentService.edit(id, formData);
    if (response.status !== 200) throw new Error('Failed to submit data');
    
    Swal.fire('Success', 'Instrument has been updated!', 'success')
    // .then(() => {
    //   // Reload the page after the alert is closed
    //   window.location.reload();
    // });

    handleCloseUpdateModal();
    resetForm();
    setRefresh(!refresh);
  } catch (error) {
    handleCloseUpdateModal();
    Swal.fire('Error', 'Failed to edit instrument.', 'error');
  } finally {
    setSubmitting(false);
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

  const handleCloseHistoryDialog = () => setOpenHistoryDialog(false);

  const handleShowHistory = async (id) => {
    try {
      const response = await instrumentHistoryService.getById(id); 
      setHistory(response.data);
      //setInstrument(filteredInstrument.find(inst => inst.id === id))
      setOpenHistoryDialog(true);
    } catch (error) {
      console.error("Error fetching instrument history:", error);
    }
  };
  
  const handleDeletePdf = async (pdfId) => {
    try {
      // Show confirmation dialog
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
        // Proceed with deletion
        await instrumentService.removePdf(instrument.id, pdfId);
        setExistingPdfs(existingPdfs.filter(pdf => pdf.id !== pdfId));
        handleCloseUpdateModal();
        Swal.fire('Success', 'Document deleted successfully!', 'success');
        setRefresh(!refresh); 
      }
    } catch (error) {
      console.error("Failed to delete PDF:", error);
    }
  };
  
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: 'Do you want to delete this instrument? This action cannot be undone.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#1D34D8',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'Cancel',
    });
  
    if (result.isConfirmed) {
      try {
        const response = await instrumentService.remove(id);
        Swal.fire({
          icon: 'success',
          title: 'Instrument Deleted',
          text: response.data?.message || 'The instrument has been successfully deleted...',
        });
        setRefresh((prev) => !prev);
        fetchInstrumentsByName();

      } catch (err) {
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: err.response?.data?.message || 'Failed to delete the instrument. Please try again later.',
        });
        console.error('Error deleting instrument:', err);
      }
    }
  };
  

const handleImageUpload = (event) => {
  const file = event.target.files[0];
  if (file) {
    const objectUrl = URL.createObjectURL(file);
    setSelectedImage(objectUrl); 
  }
};

  
  return (
    <Box p={1}>
      {/* Instrument Card */}
      <div className="bg-white shadow-lg rounded-2xl overflow-hidden mb-5">
        <div className="flex flex-col sm:flex-row">
        <div className="sm:w-1/4 p-4">
            
                    <img
                      src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${instrument.image}`}
                      alt={`${instrument.name} image`}

                      className="rounded-lg w-full h-auto shadow-md"
                      style={{
                        objectFit: "contain",
                        maxHeight: "430px",
                      }}
                    />
          </div>
          <div className="sm:w-2/3 p-5">
            <div className="text-2xl font-bold text-blue-600 mb-2">
              {instrument.name}
            </div>

            <p className="text-gray-700 my-2">{instrument.shortDesc}</p>
            <p className="text-gray-600 mb-2">{instrument.description}</p>
            <div className="text-gray-600">
              Instrument Type: <span className="font-bold text-blue-700">{instrument.instrumentType}</span>
            </div>
            {canViewPrice && (
              <div className="text-gray-600 my-2">
                Price: {instrument.price.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </div>            
            )}
            <div className="mt-4 flex gap-4">
              {/* <button
                onClick={handleShowQR}
                className="bg-blue-600 text-white font-semibold rounded-3xl px-6 py-2 transition hover:bg-blue-500"
              >
                QR Code
              </button> */}
              <button
                onClick={handleOpenUpdateModal}
                className="bg-[#1D34D8] text-white font-semibold rounded-3xl px-6 py-2 transition hover:shadow-lg"
              >
                Edit Instrument
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Document Section */}
      <Box mt={5} p={3} sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 2 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
          <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D34D8' }}>
            Documents
          </Typography>
          <IconButton onClick={handleAddDocumentOpenDialog}>
            <AddIcon sx={{ fontSize: 30, color: '#1D34D8' }} />
          </IconButton>
        </Box>

        <Grid container spacing={2}>
          {instrument.documents?.length > 0 ? (
            instrument.documents.map((doc, index) => (
              <Grid item xs={12} sm={6} key={index}>
                <Box display="flex" alignItems="center" sx={{ padding: 1 }}>
                  {doc.fileType === 'pdf' ? (
                    <PictureAsPdfIcon sx={{ fontSize: 50, color: '#D32F2F' }} />
                  ) : (
                    <DescriptionIcon sx={{ fontSize: 50 }} />
                  )}
                  <Typography
                    variant="body1"
                    sx={{
                      marginLeft: '10px',
                      cursor: 'pointer',
                      color: '#1D34D8',
                      fontWeight: 'bold',
                    }}
                    onClick={() =>
                      handleDownload(`${process.env.REACT_APP_DOCUMENT_URL}/assets/pdf/${doc.fileName}`)
                    }
                  >
                    {formatFileName(doc.fileName)}
                  </Typography>
                  <IconButton
                          color="error"
                          onClick={() => handleDeletePdf(doc.id)}
                        >
                          <DeleteIcon />
                        </IconButton>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary" className='!ml-4'>
              No documents available for this instrument.
            </Typography>
          )}
        </Grid>
      </Box>

      {/* All Instruments */}
      <Box mt={5} p={3} sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 2 }}>
              <Box mt={3} mb={3} className='!flex !gap-2 sm:!flex-row !flex-col'>
        <TextField
          label="Search by Project"
          value={projectSearch}
          onChange={(e) => {
              const value = e.target.value;
              setProjectSearch(value);

              if (value.trim() === "") {
                  setCurrentPage(1); 
                  setProjectSearch(value); 
                  setTriggerSearch(true); 
              }
          }}
          onKeyDown={(e) => {
              if ( e.key === "Enter" && projectSearch.trim() !== "") {
                  setCurrentPage(1); 
                  setfilteredInstrument([]); 
                  setTriggerSearch(true); 
              }
          }}
          fullWidth
        />


          <FormControl fullWidth>
            <InputLabel>Search by Status</InputLabel>
            <Select
              label="Search by Status"
              value={statusSearch || ''}
              onChange={(e) => {
                setStatusSearch(e.target.value);
                setCurrentPage(1);  
                setfilteredInstrument([]);  
                setTriggerSearch(true); 
              }}
            >
              {instrumentStatusOptions.map((status) => (
                <MenuItem key={status.value} value={status.value}>
                  {status.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* <div>
          {filteredInstrument?.map((instrument, index) => (
            <Box
              key={instrument.id}
              mb={3}
              sx={{ backgroundColor: '#f9f9f9', borderRadius: 3, p: 2, boxShadow: 1 }}
              className="!flex !gap-5 justify-between items-center"
            >
              <div className="flex gap-1 sm:gap-5 xl:gap-10 items-center flex-col sm:flex-row">
                <Typography sx={{ flexShrink: 0, fontWeight: 'bold' }}>
                  (ID_{instrument.id}) {instrument.name}
                </Typography>

                <Typography sx={{ color: 'text.secondary' }} className="sm:w-[240px] hidden sm:block">
                  Status: <StatusButton text={instrument.status.split('_').join(' ')} color={getStatusColor(instrument.status)} />
                </Typography>
                <Typography sx={{ color: 'text.secondary' }} className='!text-[14px]'>
                  Project: {instrument.projectName || 'Not assigned'}
                </Typography>
              </div>

              <Box className="!flex gap-2 sm:gap-4 sm:mr-8">
                <IconButton
              onClick={() => handleShowQR(instrument)}
              sx={{
                color: "gray",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                padding: "5px",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              <QrCodeScannerIcon />
            </IconButton>
                <IconButton
                  onClick={() => handleDelete(instrument.id)}
                  sx={{
                    color: "#d333",
                    backgroundColor: "#f5f5f5",
                    borderRadius: "20%",
                    padding: "5px",
                    border: "1px solid #e0e0e0",
                    "&:hover": { backgroundColor: "#e0e0e0" },
                  }}
                >
                  <DeleteIcon sx={{ color: "#d33" }} />
                </IconButton>

                <IconButton
                  onClick={() => handleShowHistory(instrument.id)}
                  color="primary"
                  sx={{
                    backgroundColor: "#f5f5f5",
                    borderRadius: "20%",
                    padding: "5px",
                    border: "1px solid #e0e0e0",
                    "&:hover": { backgroundColor: "#e0e0e0" },
                  }}
                >
                  <HistoryIcon sx={{ color: "#424242" }} />
                </IconButton>
              </Box>
            </Box>
          ))}

          {currentPage < totalPages && (
            <Box mt={3} textAlign="center">
              <Button
              className='!rounded-3xl'
                variant="contained"
                onClick={loadMoreInstruments}
                disabled={loading}
                sx={{
                  backgroundColor: loading ? '#e0e0e0' : '#1D34D8',
                  color: '#ffffff',
                  "&:hover": {
                    backgroundColor: loading ? '#e0e0e0' : '#1 64cb8',
                  },
                }}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            </Box>
          )}
        </div> */}

<div>
      {filteredInstrument?.map((instrument) => (
        <Box
          key={instrument.id}
          mb={3}
          sx={{
            backgroundColor: instrument.id === highlightedId && showQrHighlight
            ? "#C8D1FA" // Highlight yellow if 'qr' is true
            : "#f9f9f9",
            borderRadius: 3,
            p: 2,
            boxShadow: 1,
          }}
          className="!flex !gap-5 justify-between items-center"
        >
          <div className="flex gap-1 sm:gap-5 xl:gap-10 sm:items-center flex-col sm:flex-row">
            {/* Instrument Name */}
            <Typography
              sx={{
                flexShrink: 0,
                fontWeight: "bold",
                
              }}
            >
              (ID_{instrument.id}) {instrument.name}
            </Typography>

            {/* Status */}
            <Typography
              sx={{ color: "text.secondary" }}
              className="sm:w-[240px] hidden sm:block"
            >
              Status:{" "}
              <StatusButton
                text={instrument.status.split("_").join(" ")}
                color={getStatusColor(instrument.status)}
              />
            </Typography>

            {/* Project */}
            <Typography sx={{ color: "text.secondary" }} className="!text-[14px]">
              Project: {instrument.projectName || "Not assigned"}
            </Typography>
          </div>

          {/* Action Buttons */}
          <Box className="!flex gap-2 sm:gap-4 sm:mr-8">
            <IconButton
              onClick={() => handleShowQR(instrument)}
              sx={{
                color: "gray",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                padding: "5px",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              <QrCodeScannerIcon />
            </IconButton>

            <IconButton
              onClick={() => handleDelete(instrument.id)}
              sx={{
                color: "#d333",
                backgroundColor: "#f5f5f5",
                borderRadius: "20%",
                padding: "5px",
                border: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              <DeleteIcon sx={{ color: "#d33" }} />
            </IconButton>

            <IconButton
              onClick={() => handleShowHistory(instrument.id)}
              color="primary"
              sx={{
                backgroundColor: "#f5f5f5",
                borderRadius: "20%",
                padding: "5px",
                border: "1px solid #e0e0e0",
                "&:hover": { backgroundColor: "#e0e0e0" },
              }}
            >
              <HistoryIcon sx={{ color: "#424242" }} />
            </IconButton>
          </Box>
        </Box>
      ))}

      {/* Load More Button */}
      {currentPage < totalPages && (
        <Box mt={3} textAlign="center">
          <Button
            className="!rounded-3xl"
            variant="contained"
            onClick={loadMoreInstruments}
            disabled={loading}
            sx={{
              backgroundColor: loading ? "#e0e0e0" : "#1D34D8",
              color: "#ffffff",
              "&:hover": {
                backgroundColor: loading ? "#e0e0e0" : "#164cb8",
              },
            }}
          >
            {loading ? "Loading..." : "Load More"}
          </Button>
        </Box>
      )}
    </div>
      </Box>

      {/* Edit Instrument Modal */}
      <Dialog open={openUpdateModal} onClose={handleCloseUpdateModal} fullWidth maxWidth="sm" PaperProps={{
      style: {
          borderRadius: 20,
          //height: "500px",
          backgroundColor: "#fcfcfc"  
      },
      }}>
        <DialogTitle>Edit Instrument
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
            image: instrument.image || null,
            files: instrument.files || null,
            tags: instrument.tags || [],
            price: instrument.price || ''
          }}
          validationSchema={validationSchema}
          onSubmit={handleUpdateSubmit}
        >
          {({values, setFieldValue, errors, touched }) => (
            <Form>
              <Box display="flex" flexDirection="column" alignItems="center" marginBottom={3}>
                <Box
                  sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    marginBottom: 2,
                  }}
                >
                  {/* Instrument Image */}
                  <img
                  src={
                    selectedImage?.startsWith("blob:") 
                      ? selectedImage
                      : `${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${selectedImage}`
                  }
                  alt="Profile"
                    style={{
                      width: 250,
                      height: 200,
                      borderRadius: '10%',
                      objectFit: 'cover',
                      marginBottom: 0,
                      marginTop: '20px'
                    }}
                  />
                </Box>
                
                  <Button
                    variant="text"
                    className="!text-[#1D34D8]"
                    onClick={() => document.getElementById('profile-image-input').click()}
                  >
                    Edit Image
                  </Button>
                  <input
                    id="profile-image-input"
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={(event) => {
                      handleImageUpload(event);
                      setFieldValue('image', event.currentTarget.files[0]);
                    }}
                  />
              </Box>

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
              <Box mb={2}>
                <Field
                  as={TextField}
                  name="price"
                  label="Price"
                  fullWidth
                  error={touched.price && !!errors.price}
                  helperText={touched.price && errors.price}
                  type="number"
                  InputProps={{ inputProps: { min: 0 , step: "0.01"} }} 
                />
              </Box>

              <FormControl fullWidth margin="dense">
                    <InputLabel>Tags</InputLabel>
                    <Select
                        multiple
                        label="Tags"
                        value={instrument.tags}
                        onChange={handleTagChange}
                        renderValue={(selected) => selected.join(', ')}
                    >
                        {availableTags.map((tag) => (
                        <MenuItem key={tag.id} value={tag.title}>
                            <Checkbox checked={instrument.tags.includes(tag.title)} />
                            <ListItemText primary={tag.title} />
                        </MenuItem>
                        ))}
                    </Select>
              </FormControl>

              <FormControl fullWidth margin="dense" variant="outlined">
                    <InputLabel htmlFor="add-new-tag">Add new tag (optional)</InputLabel>
                    <OutlinedInput
                        id="add-new-tag"
                        type="text"
                        onChange={(e) => setTagInput(e.target.value)}
                        value={tagInput}
                        label="Add new tag (optional)"
                        placeholder="Type a new tag"
                        endAdornment={
                        <InputAdornment position="end">
                            <IconButton onClick={handleAddNewTag} edge="end">
                            <AddIcon />
                            </IconButton>
                        </InputAdornment>
                        }
                    />
              </FormControl>



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
                      accept=""
                    />
                  </Button>
              </StyledBox>
              {/* Display uploaded PDF files */}
              <Box mt={2}>

                    {uploadedFiles?.length > 0 ? (

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

              {/* PDF Display and Delete */}
              {instrument.documents?.length > 0 && (

                <Box mt={2}>
                  <Typography variant="h6">PDFs:</Typography>
                  <Grid container spacing={1}>
                    {instrument.documents.map((pdf, index) => (
                      <Grid item xs={12} key={index} display="flex" alignItems="center">
                        <PictureAsPdfIcon color="error" />
                        <Typography variant="body2" ml={1} flexGrow={1}>
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
                  Save
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

                  {/* <Box
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

                    <div className="flex justify-flex items-center gap-6">
                      <div className="flex flex-col items-center">
                        <Typography
                          variant="body1"
                          style={{
                            fontWeight: "bold",
                            textAlign: "center",
                            marginBottom: "5px",
                          }}
                        >
                          (ID_{instrument.id}) {instrument.name}
                        </Typography>
                        <img
                          className="border-[30px] border-gray-200 rounded-xl"
                          src={`${process.env.REACT_APP_DOCUMENT_URL}/${qrImage}`}
                          alt="QR Code"
                          style={{
                            width: "200px",
                            height: "200px",
                            margin: "10px 0",
                          }}
                        />
                      </div>
                      <div className="flex flex-col items-center text-2xl font-bold italic">
                        <p>Scan me</p>
                        <p>BauEnergy</p>
                      </div>
                    </div>
                  </Box> */}

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
                        style={{ fontWeight: "bold" }}
                      >
                        (ID_{instrument.id}) {instrument.name}
                      </Typography>

                      <div
                        id="qr-wrapper"
                        className="flex justify-center flex-col sm:flex-row items-center gap-6"
                        style={{ background: "white", padding: "10px", borderRadius: "12px" }}
                      >
                        {/* QR Code with Text */}
                        <img
                          src={`${process.env.REACT_APP_DOCUMENT_URL}/${qrImage}`}
                          alt="QR Code"
                          style={{
                            width: "200px",
                            height: "200px",
                          }}
                        />
                        <div className="flex flex-col items-center text-xl font-bold italic">
                          <p>Scan me</p>
                          <p>BauEnergy</p>
                        </div>
                      </div>

                      {/* Download Button */}
                      <button
                        onClick={downloadQRCodeWithText}
                        className="bg-[#1D34D8] text-white px-4 py-2 rounded-3xl mt-4"
                      >
                        Download QR Code
                      </button>
                    </Box>

                </DialogContent>
      </Dialog>

      {/* Instrument History Dialog */}
      <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          style: {
            borderRadius: 20,
            height: "500px",
            backgroundColor: "#fcfcfc"  
          },
        }}
      >
        <DialogTitle>
          Instrument History
          <IconButton
            className="!text-blue-700"
            aria-label="close"
            onClick={handleCloseHistoryDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent
          className="!border !border-gray-300 rounded-xl !p-2 !m-6 !mt-0 bg-white"
          sx={{
            display: "flex",
            flexDirection: "column",
            justifyContent: history && history.length > 0 ? "flex-start" : "center",
            alignItems: history && history.length > 0 ? "flex-start" : "center",
            overflowY: "auto",
            overflowX: "hidden",  
            maxHeight: "calc(100% - 64px)",  
            paddingRight: "8px" 
          }}
        >
          {history && history.length > 0 ? (
            <>
              <Box display="flex" gap={2} mb={2} >
                {instrument?.images?.slice(0, 3).map((img, index) => (
                  <img
                    key={index}
                    src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${img.image}`}
                    alt="Instrument"
                    style={{
                      flexGrow: 1, 
                      width: '32%', 
                      height: 100,
                      borderRadius: 8,
                      objectFit: 'cover' 
                    }}
                  />
                ))}
              </Box> 
              <Box mb={2} p={2} sx={{ borderRadius: 3 }} className="block sm:!hidden !w-full !p-0">
              <Typography variant="h6" className=" block sm:!hidden">
                Status: <StatusButton text={instrument.status.split('_').join(' ')} color={getStatusColor(instrument.status)} />
              </Typography>
              </Box>

              <Typography variant="h6" dividers>Details</Typography>
              <div className='border-b border-slate-300 w-full my-2'></div>
              {history.map((entry, index) => (
                <Box key={index} mb={2} width="100%">
                  <div className="flex justify-between items-center">
                    <Typography variant="subtitle1" className='!font-medium'>{entry.title}</Typography>
                    <Typography variant="subtitle2" color="textSecondary">
                      {formatDate(entry.eventDate)}
                    </Typography>
                  </div>
                  <Typography variant="body2" className='!text-gray-500 !ml-1'>{entry.description}</Typography>
                </Box>
              ))}
            </>
          ) : (
            <Typography variant="body2" className='text-gray-500'>Nothing here yet...</Typography>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Documents Dialog */}
      <AddDocumentsDialog
        open={openAddDocumentDialog}
        handleClose={handleAddDocumentCloseDialog}
        handleFileChange={handleFileChange}
        handleDocumentUpload={handleDocumentUpload}
      />
    </Box>
  );
};

export default InstrumentDetails;
