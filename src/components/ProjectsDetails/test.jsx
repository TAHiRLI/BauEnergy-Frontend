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
        className='!bg-[#1D34D8] !rounded-3xl !normal-case !py-2'
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

    </Box>
  );
}
