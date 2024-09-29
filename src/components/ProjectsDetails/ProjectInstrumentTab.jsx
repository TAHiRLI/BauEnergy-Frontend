import React, { useEffect, useState } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import Swal from 'sweetalert2';
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';
import { instrumentService } from '../../APIs/Services/instrument.service';

export default function InstrumentTab({ project }) {
  const { state, dispatch } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  const [allInstruments, setAllInstruments] = useState([]); 
  const [selectedInstrumentId, setSelectedInstrumentId] = useState('');

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
        console.log("Sending request with body:", body);

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
      console.log(body)
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
      console.error('Error fetching aviable instruments:', error);
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

  const columns = [
    { field: 'name', headerName: 'Instrument Name', width: 200 },
    { field: 'createdBy', headerName: 'Created By', width: 200 },
    {
      field: 'status',
      headerName: 'Status',
      width: 150,
      renderCell: (params) => (params.row.isActive ? 'Inactive' : 'Active'),
    },
    {
      field: 'actions',
      headerName: 'Actions',
      width: 150,
      renderCell: (params) => (
        <Button
          variant="contained"
          color="secondary"
          onClick={() => handleDelete(params.row.id)}
        >
          Delete
        </Button>
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
    </Box>
  );
}



