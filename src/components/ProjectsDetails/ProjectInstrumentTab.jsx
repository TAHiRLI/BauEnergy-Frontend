import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { IconButton, Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel, Typography, InputAdornment, TextField } from '@mui/material';
import Swal from 'sweetalert2';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit'; 
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';
import { instrumentService } from '../../APIs/Services/instrument.service';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import PrintIcon from '@mui/icons-material/Print'; // Import Print Icon

export default function InstrumentTab({ project }) {
  const { state, dispatch } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false); 
  const [allInstruments, setAllInstruments] = useState([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');
  const [instrument, setInstrument] = useState('');
  const [qrImage, setQrImage] = useState('');
  const [qrInstrumentName, setQrInstrumentName] = useState('');

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

      setOpenDialog(false); 
      setSelectedInstrumentId(''); 
    } catch (error) {
      setOpenDialog(false); 
      console.error('Error adding instrument:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to add instrument.',
        icon: 'error',
        timer: 2000,
      });
    }
  };

  const fetchAllInstruments = async () => {
    try {
      const response = await instrumentService.getAviableInstruments(); 
      setAllInstruments(response.data);
    } catch (error) {
      console.error('Error fetching available instruments:', error);
    }
  };

  useEffect(() => {
    const fetchInstruments = async () => {
      dispatch({ type: ProjectsActions.start });
      try {
        const response = await projectService.getById(project.id);
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
    { field: 'dateAdded', headerName: 'Date Added', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
    },
    { field: 'instrumentType', headerName: 'Type', width: 200 },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <>
          <IconButton
            className='!text-red-600'
            onClick={() => handleDelete(params.row.id)}
            sx={{ mr: 1 }}
          >
            <DeleteIcon />
          </IconButton>
          <IconButton
            color="primary"
          >
            <EditIcon />
          </IconButton>
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
    <Box height={400}>

      <div>
      <Box display="flex" gap={1}>

      {/* Type input */}
      <TextField
        label="Type"
        variant="outlined"
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
        label="Date"
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <DateRangeIcon />
            </InputAdornment>
          ),
        }}
      />

      {/* Status input */}
      <TextField
        label="Status"
        variant="outlined"
        InputProps={{
          endAdornment: (
            <InputAdornment position="end">
              <ArrowDropDownIcon />
            </InputAdornment>
          ),
        }}
      />
    </Box>
      </div>
      
      <Button
        variant="contained"
        color="primary"
        onClick={() => setOpenDialog(true)}
        sx={{ mb: 2 }}
      >
        Add New Instrument
      </Button>
      <DataGrid
        rows={state.data || []}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.id}
      />

      {/* Dialog for Adding New Instrument */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Select Instrument to Add</DialogTitle>
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
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleAddInstrument} color="primary" variant="contained">
            Add
          </Button>
        </DialogActions>
      </Dialog>

      {/* QR Code Dialog */}
      <Dialog open={openQRDialog} onClose={handleCloseQRDialog}>
        <DialogTitle>
          QR Instrument
          <IconButton
            aria-label="close"
            onClick={handleCloseQRDialog}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          <div className='flex justify-between items-center'>
            <Typography variant="body1" gutterBottom>
              Instrument details:
            </Typography>

            <Button
              color="primary"
              startIcon={<ShareIcon />}
            >
              Share
            </Button>
          </div>

          {/* QR Code Image */}
          {qrImage && (
            <Box textAlign="center" my={2}>
              <Typography variant="h6">{qrInstrumentName}</Typography>
              <img
                src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/qrcodes/${qrImage}`}
                alt="Instrument QR Code"
                style={{ width: 200, height: 200 }}
              />

              {/* Print Button */}
              <Button
                color="primary"
                startIcon={<PrintIcon />}
                onClick={handlePrint}
                sx={{ mt: 2 }}
              >
                Print QR Code
              </Button>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
}
