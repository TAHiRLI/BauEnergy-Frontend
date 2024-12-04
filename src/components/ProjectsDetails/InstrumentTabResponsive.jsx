import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, Grid, CardMedia, CardActions, Button, CardActionArea, Chip, Box, Icon, Divider, Modal, Dialog, DialogTitle, IconButton, DialogContent, TextField, InputAdornment, FormControl, Select, InputLabel, MenuItem, DialogActions } from '@mui/material';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { projectService } from '../../APIs/Services/project.service';
import Swal from 'sweetalert2';
import { ProjectsActions, useProjects } from '../../context/projectContext';
import InstrumentStatusButton from '../common/actionsBtn/InstrumentUpdateButton';
import { instrumentHistoryService } from '../../APIs/Services/instrumentHistory.service';
import { Add as AddIcon, Share as ShareIcon } from '@mui/icons-material';
import InstrumentStatusModal from '../common/actionsBtn/InstrumentUpdateButton';
import DateRangeIcon from '@mui/icons-material/DateRange';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { teamMemberService } from '../../APIs/Services/teammember.service';
import AddInstrumentWithQr from '../addInstrumentWithQr/addInstrumentWithQr';

const InstrumentTabResponsive = ({ project }) => {
  const { state, dispatch } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  //const [openQRDialog, setOpenQRDialog] = useState(false); 
  const [allInstruments, setAllInstruments] = useState([]);
  const [instrument, setInstrument] = useState('');
  const [searchType, setSearchType] = useState('');
  const [searchDate, setSearchDate] = useState('');
  const [searchStatus, setSearchStatus] = useState([]); 
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [instrumentHistory, setInstrumentHistory] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [projectManagers, setProjectManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState('');

    const [editOpen, setEditOpen] = useState(false);
    const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
    const [selectedInstrumentStatus, setSelectedInstrumentStatus] = useState("");

    // Function to open the edit dialog
    const handleEditOpen = (instrumentId, currentStatus) => {
      setSelectedInstrumentId(instrumentId);
      setSelectedInstrumentStatus(currentStatus);
      setEditOpen(true);
    };
    const handleEditClose = () => {
      setEditOpen(false);
      setRefresh(prev => !prev);
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
        const body = { projectId: project.id, instrumentId: selectedInstrumentId, projectManagerId: selectedManager };
        console.log(selectedManager)
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
        const foundInstrument = allInstruments.find(inst => inst.id === id);
        setInstrument(foundInstrument);
        console.log(instrument)
        setOpenHistoryDialog(true);
      } catch (error) {
        console.error("Error fetching instrument history:", error);
      }
    };

    useEffect(() => {
      const fetchProjectManagers = async () => {
          try {
            const response = await teamMemberService.getAllProjectManagers(project.id)
            //const data = await response.json();
            setProjectManagers(response.data);
            if (response.data && response.data.length > 0 && response?.data[0]?.id) {
              setSelectedManager(response?.data[0]?.id); // Set first manager's ID as the default
          }} catch (error) {
              console.error("Failed to fetch project managers:", error);
          }
      };
  
      if (openDialog) {
          fetchProjectManagers();
      }
  }, [openDialog]);
  
  const handleManagerChange = (event) => {
      setSelectedManager(event.target.value);
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
    }, [dispatch, project.id,refresh]);
    
  
    useEffect(() => {
      if (openDialog) {
        fetchAllInstruments(); 
      }
    }, [openDialog]);
  
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
        case 'Under maintenance':
          chipProps = { label: 'Under maintenance', style: { borderColor: 'red', color: 'red' }, variant: 'outlined' };
          break;
        default:
          chipProps = { label: 'Unknown', style: { borderColor: 'grey', color: 'grey' }, variant: 'outlined' };
          break;
      }
      return <Chip {...chipProps} />;
    };
  
    if (state.loading) {
      return <div>Loading...</div>;
    }
  
    if (state.error) {
      return <div>Error loading instruments</div>;
    }

  return (
    <Grid container spacing={2}>

      <div className="flex flex-col justify-center my-5 w-full ml-4">
        <div className="flex flex-col gap-3 sm:flex-row ">
            {/* Type Input */}
            <TextField
              label="Type"
              variant="outlined"
              onChange={(e) => setSearchType(e.target.value)}
              value={searchType}
              className="rounded-3xl w-full sm:w-auto"
            />

            {/* Date Input */}
            <TextField
              label="Search by Date"
              type="date"
              InputLabelProps={{
                shrink: true,
              }}
              variant="outlined"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="rounded-3xl w-full sm:w-auto"
            />

            {/* Status Input */}
            <FormControl variant="outlined" className="w-full sm:w-48">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={searchStatus}
                onChange={handleStatusChange}
                className="rounded-3xl"
              >
                {statuses.map((status) => (
                  <MenuItem key={status} value={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
        </div>

        <Button
          className='!bg-[#1D34D8] !rounded-3xl !normal-case !py-2 !my-4 !sm:my-0'
          startIcon={<AddIcon />}
          variant="contained"
          onClick={() => setOpenDialog(true)}
          aria-hidden
        >
          Add New Instrument
        </Button>
      </div>

      {filteredInstruments && filteredInstruments.map((instrument) => {
        const mainImage = instrument.images?.find(img => img.isMain);
        return (
          <Grid item xs={12} sm={6} md={4} key={instrument.id}>
            <Card sx={{ maxWidth: { xs: '100%', sm: 345 }, borderRadius: 2, boxShadow: 4, overflow: 'hidden',p:2 }}>
                <CardActionArea sx={{ position: 'relative' }} 
                //onClick={() => handleShowQR(instrument)}
                >
                    {mainImage && (
                    <Box
                        component="img"
                        loading='lazy'
                        src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${mainImage.image}`}
                        alt={instrument.name}
                        sx={{
                        width: '100%',
                        height: 200,
                        objectFit: 'cover',
                        borderRadius: 2
                        }}
                    />
                    )}
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
                        {instrument.name}
                    </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        Instrument Type:
                    </Typography>
                    <Box component="span" className='font-semibold'>
                        {instrument.instrumentType}
                    </Box>
                    </Box>

                    <Divider variant="middle" sx={{ my: 1, mx:0 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        Date Added:
                    </Typography>
                    <Box component="span" className='font-semibold'>
                        {formatDate(instrument.addedProjectDate)}
                    </Box>
                    </Box>

                    <Divider variant="middle" sx={{ my: 1, mx:0 }} />

                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
                    <Typography variant="body2" color="text.secondary" sx={{ display: 'flex', alignItems: 'center' }}>
                        Status:
                    </Typography>
                    <Box component="span" >
                        {renderStatus(instrument.status.split('_').join(' '))}
                    </Box>
                    </Box>
                </CardContent>

                {/* Actions Section */}
                <CardActions sx={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 2 }}>
                    <Button size="small" className='!border-[#1D34D8] text-[#1D34D8]' variant="outlined" sx={{ textTransform: 'none', mr: 'auto' }} onClick={() => handleShowHistory(instrument.id)}
                    > Show History </Button>

                    <Button size="small" className='!bg-[#1D34D8]' variant="contained" sx={{ textTransform: 'none' }} onClick={() => handleEditOpen(instrument.id, instrument.status)}
                    > Edit </Button>

                    <Button size="small" color="error" variant="contained" sx={{ textTransform: 'none', ml: 1 }} onClick={() => handleDelete(instrument.id)}
                    >Remove</Button>
                </CardActions>
            </Card>
          </Grid>
        );
      })}

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
      
        {/* <Dialog open={openQRDialog} onClose={handleCloseQRDialog} fullWidth maxWidth="xs" PaperProps={{
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
                        src={`${process.env.REACT_APP_DOCUMENT_URL}/${qrImage}`}
                        alt="Instrument QR Code"
                        style={{ width: 170, height: 170 }} 
                        />
                    </div>
                    </div>
                </div>
                </Box>
            </DialogContent>
        </Dialog> */}

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
            <InputLabel >Select Instrument</InputLabel>
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

          {/* Project Manager Selection */}
          <FormControl fullWidth margin="dense">
            <InputLabel id="project-manager-label">Project Manager</InputLabel>
            <Select
              labelId="project-manager-label"
              value={selectedManager}
              onChange={handleManagerChange}
              label="Project Manager"
            >
              {projectManagers.map((manager) => (
                  <MenuItem key={manager.id} value={manager.id}>
                      {manager.name} {manager.lastName}
                  </MenuItem>
              ))}
            </Select>
          </FormControl>

          <AddInstrumentWithQr
            onComplete={(instrumentId) => {
              if (!allInstruments?.find((x) => x?.id == instrumentId)) {
                Swal.fire(`Not Found ${instrumentId}`, `Invalid QR Code ${JSON.stringify(allInstruments)}, `);
                return;
              }
              setSelectedInstrumentId(instrumentId);
            }}
          />
        </DialogContent>
        <DialogActions className='!px-6'>
          <Button onClick={() => setOpenDialog(false)} className='!text-[#1D34D8] '>Cancel</Button>
          <Button onClick={handleAddInstrument} variant="contained" className='!bg-[#1D34D8] '>
            Add
          </Button>
        </DialogActions>
      </Dialog>

        <InstrumentStatusModal
            instrumentId={selectedInstrumentId} 
            currentStatus={selectedInstrumentStatus} 
            open={editOpen} 
            onClose={handleEditClose} 
        />
    </Grid>
  );
};
export default InstrumentTabResponsive;
