import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, Typography, InputAdornment, TextField, Checkbox, ListItemText, Chip, Divider} from '@mui/material';
import Swal from 'sweetalert2';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import HistoryIcon from '@mui/icons-material/History'; 
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { instrumentHistoryService } from '../../APIs/Services/instrumentHistory.service';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Add as AddIcon, Share as ShareIcon } from '@mui/icons-material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy'; 
import InstrumentStatusButton from '../common/actionsBtn/InstrumentUpdateButton';


export default function InstrumentTab({ project }) {
  const { state, dispatch } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false); 
  const [allInstruments, setAllInstruments] = useState([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
  const [instrument, setInstrument] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [qrInstrumentName, setQrInstrumentName] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchStatus, setSearchStatus] = useState([]); 
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [instrumentHistory, setInstrumentHistory] = useState([]);

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
        const body = { projectId: project.id, instrumentId: id }; 
        await projectService.removeInstrumentFromProject(body);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'Instrument has been removed from the project.',
          icon: 'success',
          timer: 2000,
        });

        const response = await projectService.getById(project.id);
        dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
        setFilteredInstruments(response.data.instruments);  
      }
    } catch (error) {
      console.error('Error deleting instrument:', error.message);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to remove instrument.', 
        icon: 'error',
        timer: 2000,
      });
    }
  };

  

  const handleAddInstrument = async () => {
    try {
      const body = { projectId: project.id, instrumentId: selectedInstrumentId };
      await projectService.addInstrumentToProject(body);
      
      Swal.fire({
        title: 'Added!',
        text: 'Instrument has been added to the project.',
        icon: 'success',
        timer: 2000,
      });
  
      const response = await projectService.getById(project.id);
      dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
      setFilteredInstruments(response.data.instruments);
      setSelectedInstrumentId(''); 
      setOpenDialog(false); 
  
    } catch (error) {
      setOpenDialog(false); 
      console.error('Error adding instrument:', error);
      
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add instrument.',
        icon: 'error',
        timer: 2000,
      });
      setOpenDialog(false); 
    }
  };
  
  const handleCloseHistoryDialog = () => setOpenHistoryDialog(false);

  const handleShowHistory = async (id) => {
    try {
      const response = await instrumentHistoryService.getById(id); 
      setInstrumentHistory(response.data);
      setInstrument(allInstruments.find(inst => inst.id === id))
      setOpenHistoryDialog(true);
    } catch (error) {
      console.error("Error fetching instrument history:", error);
    }
  };

  const handleSearch = () => {
    let filtered = allInstruments; 
    if (searchType) {
      filtered = filtered.filter((instrument) => 
        instrument.instrumentType.toLowerCase().includes(searchType.toLowerCase())
      );
    }
    if (searchDate) {
      filtered = filtered.filter((instrument) => {
        const instrumentDate = new Date(instrument.addedProjectDate);
    
        const formattedInstrumentDate = instrumentDate.toISOString().split('T')[0]; 
        const formattedSearchDate = new Date(searchDate).toISOString().split('T')[0]; 
    
        return formattedInstrumentDate === formattedSearchDate;
      });
    }
    
    if (searchStatus) {
      filtered = filtered.filter(instrument => instrument.status.split('_').join(' ').includes(searchStatus));
    }

    setFilteredInstruments(filtered);
  };

  useEffect(() => {
    setFilteredInstruments(state.project?.instruments || []);
  }, [state.project?.instruments]);

  useEffect(() => {
    handleSearch();
  }, [searchType, searchDate, searchStatus]); 

  const statuses = ['In use', 'Under maintenance'];
  const handleStatusChange = (event) => {
    const {
      target: { value },
    } = event;
    setSearchStatus(typeof value === 'string' ? value.split(',') : value);
  };


  const fetchAllInstruments = async () => {
    try {
      const response = await instrumentService.getAviableInstruments(); 
      setAllInstruments(response.data);
      //console.log(response.data)
    } catch (error) {
      console.error('Error fetching available instruments:', error);
    }
  };

  useEffect(() => {
    const fetchInstruments = async () => {
      dispatch({ type: ProjectsActions.start });
      try {
        const response = await projectService.getById(project.id);
        setAllInstruments(response.data.instruments); 
        setFilteredInstruments(response.data.instruments)
        //console.log(response.data.instruments)
        dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
      } catch (error) {
        console.error('Error fetching instruments:', error);
        dispatch({ type: ProjectsActions.failure, payload: error });
      }
    };
  
    fetchInstruments();
  }, [dispatch, project.id]);
  

  useEffect(() => {
    if (openDialog) {
      fetchAllInstruments(); 
    }
  }, [openDialog]);

  const handleShowQR = (instrument) => {
    setInstrument(instrument);
    setQrImage(instrument.qrImage); 
    setQrInstrumentName(instrument.name);
    setOpenQRDialog(true);
  };

  const handleCloseQRDialog = () => {
    setOpenQRDialog(false);
  };

  const handlePrint = () => {
    window.print();
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
  const renderStatus = (status) => {
    let chipProps = {};
    switch (status) {
      case 'Available':
        chipProps = { label: 'Available', style: { borderColor: 'green', color: 'green' }, variant: 'outlined' };
        break;
      case 'In use':
        chipProps = { label: 'In use', style: { borderColor: 'blue', color: 'blue' }, variant: 'outlined' };
        break;
      case 'Under maintance':
        chipProps = { label: 'Under maintance', style: { borderColor: 'red', color: 'red' }, variant: 'outlined' };
        break;
      default:
        chipProps = { label: 'Unknown', style: { borderColor: 'grey', color: 'grey' }, variant: 'outlined' };
        break;
    }
    return <Chip {...chipProps} />;
  };
  const handleShare = () => {
    const shareData = {
      title: instrument.name,
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

  const columns = [
    {
      field: 'name',
      headerName: 'Instrument Name',
      width: 300,
      renderCell: (params) => {
        const mainImage = params.row.images?.find(img => img.isMain);
        return (
          <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => handleShowQR(params.row)}>
            {mainImage && (
              <img
                src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${mainImage.image}`}
                alt={params.row.name}
                style={{ width: 50, height: 50, marginRight: 10 }}
              />
            )}
            <Typography>{params.row.name}</Typography>
          </Box>
        );
      },
    },
    { field: 'addedProjectDate', headerName: 'Date Added', width: 200, renderCell: (params) => formatDate(params.row.addedProjectDate) },
    { field: 'instrumentType', headerName: 'Type', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => renderStatus(params.row.status.split('_').join(' ')), 
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
        <div className='text-center'>
          <InstrumentStatusButton instrumentId={params.row.id} currentStatus={params.row.status}/>

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

          <IconButton onClick={() => handleShowHistory(params.row.id)} color="primary"
            sx={{
              backgroundColor: "#f5f5f5",  
              borderRadius: "20%",         
              padding: "5px",               
              border: "1px solid #e0e0e0", "&:hover": {backgroundColor: "#e0e0e0"},
            }}>            
            
            <HistoryIcon sx={{ color: "#424242" }} />
          </IconButton>
        </div>
        </>
      ),
    },
  ];

  if (state.loading) {
    return <div>Loading...</div>;
  }

  if (state.error) {
    return <div>Error loading instruments</div>;
  }

  return (
    <Box height={400} px={0} className='!px-0'>
      <div className='flex justify-between items-center mb-5'>
      <div>
        <Box display="flex" gap={1}>

          {/* Type input */}
          <TextField
            label="Type"
            variant="outlined"
            onChange={(e) => setSearchType(e.target.value)}
            value={searchType}
            className='!rounded-3xl'
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <DateRangeIcon /> 
                </InputAdornment>
              ),
            }}
          />

          {/* Date input */}
          <TextField
          label="Search by Date"
          type="date"
          InputLabelProps={{
            shrink: true,
          }}
          variant="outlined"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <DateRangeIcon />
              </InputAdornment>
            ),
          }}
        />

          {/* Status input */}
          <FormControl variant="outlined" sx={{ minWidth: 200 }}>
            <InputLabel>Status</InputLabel>
            <Select
              label="Status"
              value={searchStatus}
              onChange={handleStatusChange}
            >
              {statuses.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </div>

      <Button
        className='!bg-[#1D34D8] !rounded-2xl'
        startIcon={<AddIcon />}
        variant="contained"
        onClick={() => setOpenDialog(true)}
        aria-hidden
      >
        Add New Instrument
      </Button>

      </div>

      <DataGrid
        rows={filteredInstruments}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.id}
      />

      {/* Dialog for Adding New Instrument */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} PaperProps={{
          style: {
            borderRadius: 20,
            //height: "500px",
            backgroundColor: "#fcfcfc"  
          },
        }}>
        <DialogTitle className='!font-medium'>Select instrument for adding project</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel>Select Instrument</InputLabel>
            <Select
              value={selectedInstrumentId}
              onChange={(e) => setSelectedInstrumentId(e.target.value)}
              label="Select Instrument"
            >
              {allInstruments.map((instrument) => (
                <MenuItem key={instrument.id} value={instrument.id}>
                  {instrument.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className='!px-6'>
          <Button onClick={() => setOpenDialog(false)} className='!text-[#1D34D8] '>Cancel</Button>
          <Button onClick={handleAddInstrument} variant="contained" className='!bg-[#1D34D8] '>
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={openQRDialog} onClose={handleCloseQRDialog} fullWidth maxWidth="xs" PaperProps={{
          style: {
            borderRadius: 20,
            //height: "500px",
            backgroundColor: "#fcfcfc"  
          },
        }}>
        <DialogTitle>
    Instrument info
    <IconButton
      className="!text-[#1D34D8]"
      aria-label="close"
      onClick={handleCloseQRDialog}
      sx={{
        position: 'absolute',
        right: 8,
        top: 8,
      }}
    >
      <CancelOutlinedIcon />
    </IconButton>
    <div className='text-sm text-gray-500 mt-3'> 
      Scan Qr to get more information about the history of instrument you want
    </div>
        </DialogTitle>

        <DialogContent>
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Typography variant="body1">Instrument details:</Typography>

            <Button
              className='!text-[#1D34D8] !rounded-xl'
              startIcon={<ShareIcon />}
              onClick={handleShare}
              sx={{ textTransform: 'none', fontWeight: 'bold' }} 
            >
              Share
            </Button>
          </Box>
            <Box my={2}>
              <div className='border rounded-xl px-3'>
                <div className='grid grid-cols-2'>
                  <div className='flex flex-col justify-between ' >
                    <div className='flex flex-col text-start'>
                      <h5 className='mt-2 text-gray-500 font-medium'> 
                        Instrument QR:
                      </h5>
                      <p className='mt-2 text-gray-500'>
                        Scan Qr to get more information
                      </p>                    
                    </div>
                    <div className=''>
                      <Button
                        className='!rounded-3xl !m-3 !text-black'
                        onClick={handlePrint}
                        sx={{
                          fontWeight: 'bold',
                          textTransform: 'none',
                          border: '2px solid black',      
                          borderRadius: '30px',    
                          padding: '8px 16px',     
                        }}>
                         Print QR Code
                      </Button>
                    </div>
                  </div>

                  <div className='flex justify-center items-center'>
                    <img
                      className='border-[25px] rounded-xl my-5'
                      src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/qrcodes/${qrImage}`}
                      alt="Instrument QR Code"
                      style={{ width: 170, height: 170 }} 
                    />
                  </div>
                </div>
              
       
              {/* Print Button */}
              

              </div>

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
      justifyContent: instrumentHistory && instrumentHistory.length > 0 ? "flex-start" : "center",
      alignItems: instrumentHistory && instrumentHistory.length > 0 ? "flex-start" : "center",
      overflowY: "auto",
      overflowX: "hidden",  
      maxHeight: "calc(100% - 64px)",  
      paddingRight: "8px" 
    }}
  >
    {instrumentHistory && instrumentHistory.length > 0 ? (
      <>
        <Typography variant="h6">Photos</Typography>

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
        <Typography variant="h6" dividers>Details</Typography>
        <div className='border-b border-slate-300 w-full my-2'></div>
        {instrumentHistory.map((entry, index) => (
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
    </Box>
  );
}
