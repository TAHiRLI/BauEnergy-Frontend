import React, { useEffect, useState } from 'react';
import { Box, Typography, Grid, Card, CardMedia, CardContent, Button, CircularProgress, List, ListItem, ListItemText, Divider } from '@mui/material';
import { Dialog, DialogTitle, DialogContent, IconButton } from '@mui/material';
import { useParams } from 'react-router-dom';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { instrumentHistoryService } from '../../APIs/Services/instrumentHistory.service';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import StatusButton from '../../components/common/statusBtn';
import ShareIcon from '@mui/icons-material/Share';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Swal from 'sweetalert2';

const InstrumentDetails = () => {
  const { id } = useParams();
  const [instrument, setInstrument] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [openQRDialog, setOpenQRDialog] = useState(false);


  useEffect(() => {
    const fetchInstrument = async () => {
      try {
        const response = await instrumentService.getById(id);
        setInstrument(response.data);
        setLoading(false); // Stop loading once instrument data is set
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
  
    // Only fetch history after instrument data has been fetched
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
    //console.log("Downloading file from URL:", url); 

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
  const getStatusColor = (status) => {
    switch (status) {
        case 'Under_maintance':
            return 'red';
        case 'In_use':
            return 'blue';
        case 'Available':
            return 'green';
        case 'Aviable':
            return 'green';
        default:
            return 'gray';
    }
};
  const mainImage = instrument?.images?.find((img) => img.isMain);
  const otherImages = instrument?.images?.filter((img) => !img.isMain);

  return (
    <Box p={2}>
      {/* Instrument Card */}
      <Card sx={{ boxShadow: 5, borderRadius: 4, overflow: 'hidden', mb: 5 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4}>
            {mainImage && (
              <CardMedia
                component="img"
                height="auto"
                width="100%"
                image={`${process.env.REACT_APP_DOCUMENT_URL}${mainImage.image}`}
                alt={instrument.name}
                sx={{ borderRadius: '12px', m: 3, boxShadow: 3 }}
              />
            )}

            {/* Secondary Images */}
            <Grid container spacing={1} sx={{ justifyContent: 'center' }}>
              {otherImages &&
                otherImages.map((img, index) => (
                  <Grid item xs={6} key={index}>
                    <CardMedia
                      component="img"
                      height="120"
                      image={`${process.env.REACT_APP_DOCUMENT_URL}${img.image}`}
                      alt={`${instrument.name} image ${index + 1}`}
                      sx={{ borderRadius: '8px', m: 1, boxShadow: 2 }}
                    />
                  </Grid>
                ))}
            </Grid>
          </Grid>

          {/* Instrument Details */}
          <Grid item xs={12} sm={3}>
            <CardContent sx={{ px: 5, py: 4 }}>
              <Typography variant="h4" component="div" gutterBottom sx={{ fontWeight: 'bold', color: '#1D4ED8' }}>
                {instrument.name}
              </Typography>
              <Typography variant="subtitle1" color="textSecondary" gutterBottom>
                Status: <StatusButton text={instrument.status.split('_').join(' ')} color={getStatusColor(instrument.status)} />

              </Typography>
              <Typography variant="body1" sx={{ my: 2, color: '#4B5563' }}>
                {instrument.shortDesc}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
                {instrument.description}
              </Typography>
              <Grid item xs={6}>
                <Typography variant="body2" color="textSecondary">
                  Instrument Type: <span style={{ fontWeight: 'bold', color: '#1D34D8' }}>{instrument.instrumentType}</span>
                </Typography>
              </Grid>

              <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
                Project: {instrument.projectName}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ my: 2 }}>
                Added to project: <span style={{ fontWeight: 'bold', color: '#1D4ED8' }}>{new Date(instrument.addedProjectDate).toLocaleDateString()}</span>
              </Typography>

              <Box mt={3}>
                <Button
                  className='!rounded-3xl'
                  onClick={handleShowQR}
                  sx={{ backgroundColor: '#1D4ED8', color: '#fff', textTransform: 'none', borderRadius: 2, px: 4 }}
                >
                  Scan QR Code
                </Button>
              </Box>
            </CardContent>
          </Grid>
        </Grid>
      </Card>

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




