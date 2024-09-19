import React, { useEffect } from 'react';
import { DataGrid } from '@mui/x-data-grid';
import { Box, Button } from '@mui/material';
import Swal from 'sweetalert2';
import { useProjects, ProjectsActions } from '../../context/projectContext';
import { projectService } from '../../APIs/Services/project.service';

export default function InstrumentTab({ project }) {
  const { state, dispatch } = useProjects();

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
        console.log(project.id, id)
        
        await projectService.removeInstrumentFromProject({projectId: project.id, instrumentId: id });

        Swal.fire({
          title: 'Deleted!',
          text: 'Instrument has been removed from the project.',
          icon: 'success',
          timer: 2000,
        });

        // Refetch instruments for the project
        const response = await projectService.getById(project.id, id);
        dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
      }
    } catch (error) {
      console.error('Error deleting instrument:', error);
      Swal.fire({
        title: 'Error!',
        text: 'Failed to remove instrument.',
        icon: 'error',
        timer: 2000,
      });
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
      <DataGrid
        rows={state.data || []}
        columns={columns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        getRowId={(row) => row.id}
      />
    </Box>
  );
}
