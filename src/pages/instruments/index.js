import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, MenuItem } from '@mui/material';
import { DataGrid, GridActionsCellItem } from '@mui/x-data-grid';
import { InstrumentActions, useInstruments } from '../../context/instrumentContext';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { useErrorModal } from '../../hooks/useErrorModal';
import DeleteIcon from '@mui/icons-material/Delete';

export const Instruments = () => {
    const [isUpdated, forceUpdate] = useState(false);
    const { state, dispatch } = useInstruments();
    const showError = useErrorModal();

    const [openModal, setOpenModal] = useState(false);
    const [newInstrument, setNewInstrument] = useState({
        name: '',
        images: [],
        mainImageIndex: 0,
        description: '',
        shortDesc: '',
        projectId: '',
        instrumentTypeId: 0,
    });

    useEffect(() => {
        (async () => {
            dispatch({ type: InstrumentActions.start });
            try {
                const res = await instrumentService.getAll();
                dispatch({ type: InstrumentActions.success, payload: res.data });
            } catch (err) {
                console.error("Error fetching instruments:", err);
                dispatch({ type: InstrumentActions.failure, payload: err });
            }
        })();
    }, [dispatch, isUpdated]);

    const handleDelete = async (id) => {
        try {
            console.log(id);
            await instrumentService.remove(id);
            console.log("remove")

            forceUpdate(x => !x);
        } catch (err) {
            console.error("Error deleting instrument:", err);
            showError();
        }
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInstrument(prevState => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        setNewInstrument(prevState => ({
            ...prevState,
            images: Array.from(e.target.files),
        }));
    };

    const handleAddInstrument = async () => {
        const { name, images, mainImageIndex, description, shortDesc, projectId, instrumentTypeId } = newInstrument;
        const formData = new FormData();
        formData.append('Name', name);
        images.forEach((file) => formData.append('Images', file));
        formData.append('MainImageIndex', mainImageIndex);
        formData.append('Description', description);
        formData.append('ShortDesc', shortDesc);
        formData.append('ProjectId', projectId || '');
        formData.append('InstrumentTypeId', instrumentTypeId);

        try {
            await instrumentService.add(formData); // Adjust as per your service API
            forceUpdate(x => !x);
            handleCloseModal();
        } catch (err) {
            console.error("Error adding instrument:", err);
            showError();
        }
    };

    if (!state.data || state.data.length === 0) {
        return (
            <Box m={"20px"}>
                <Button variant="contained" color="primary" onClick={handleOpenModal}>
                    Add Instrument
                </Button>
                <div>No instruments found</div>

                {/* Modal for adding instrument */}
                <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                    <DialogTitle>Add New Instrument</DialogTitle>
                    <DialogContent>
                        <TextField
                            autoFocus
                            margin="dense"
                            name="name"
                            label="Instrument Name"
                            type="text"
                            fullWidth
                            value={newInstrument.name}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            name="description"
                            label="Description"
                            type="text"
                            fullWidth
                            value={newInstrument.description}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            name="shortDesc"
                            label="Short Description"
                            type="text"
                            fullWidth
                            value={newInstrument.shortDesc}
                            onChange={handleInputChange}
                        />
                        <input
                            accept="image/*"
                            type="file"
                            multiple
                            onChange={handleImageUpload}
                        />
                        <TextField
                            margin="dense"
                            name="mainImageIndex"
                            label="Main Image Index"
                            type="number"
                            fullWidth
                            value={newInstrument.mainImageIndex}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            name="projectId"
                            label="Project ID (optional)"
                            type="text"
                            fullWidth
                            value={newInstrument.projectId || ''}
                            onChange={handleInputChange}
                        />
                        <TextField
                            margin="dense"
                            name="instrumentTypeId"
                            label="Instrument Type ID"
                            type="number"
                            fullWidth
                            value={newInstrument.instrumentTypeId}
                            onChange={handleInputChange}
                        />
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseModal} color="secondary">
                            Cancel
                        </Button>
                        <Button onClick={handleAddInstrument} color="primary">
                            Add
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        );
    }

    const rows = state.data.map(instrument => ({
        id: instrument.id,
        name: instrument.name,
        isActive: instrument.isActive ? 'Inactive' : 'Active',
        shortDesc: instrument.shortDesc,
        image: instrument.images.find(image => image.isMain),
    }));
    console.log(rows)
    const columns = [
        { field: 'id', headerName: 'ID', flex: 0.5, disableColumnMenu: true },
        {
            field: 'mainImage',
            headerName: 'Main Image',
            flex: 1,
            disableColumnMenu: true,
            renderCell: (params) => (
                <img 
                    src={`${process.env.REACT_APP_DOCUMENT_URL}${params.row.image.image}`} 
                    alt={params.row.name} 
                    style={{ width: '100%', height: 'auto' }} 
                />
            ),
        },
        { field: 'name', headerName: 'Name', flex: 1, disableColumnMenu: true },
        { field: 'isActive', headerName: 'Status', flex: 0.5, disableColumnMenu: true },
        { field: 'shortDesc', headerName: 'Description', flex: 2, disableColumnMenu: true },
        {
            field: 'actions',
            headerName: 'Actions',
            type: 'actions',
            flex: 0.5,
            disableColumnMenu: true,
            getActions: (params) => [
                <GridActionsCellItem
                    icon={<DeleteIcon />}
                    label="Delete"
                    onClick={() => handleDelete(params.id)}
                />,
            ],
        },
    ];

    return (
        <Box m={"20px"}>
            <Button variant="contained" color="primary" onClick={handleOpenModal}>
                Add Instrument
            </Button>

            <div style={{ width: '100%', overflowX: 'auto', marginTop: '20px' }}>
                <div style={{ minWidth: 1000 }}>
                    <DataGrid
                        sx={{ minWidth: 200 }}
                        density='standard'
                        rowCount={state.data?.totalItems}
                        rows={rows}
                        columns={columns}
                        getRowId={(param) => param.id}
                        checkboxSelection={false}
                        disableColumnSelector
                        disableRowSelectionOnClick
                        autoHeight
                        autoWidth
                    />
                </div>
            </div>

            {/* Modal for adding instrument */}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm">
                <DialogTitle>Add New Instrument</DialogTitle>
                <DialogContent>
                    <TextField
                        autoFocus
                        margin="dense"
                        name="name"
                        label="Instrument Name"
                        type="text"
                        fullWidth
                        value={newInstrument.name}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="description"
                        label="Description"
                        type="text"
                        fullWidth
                        value={newInstrument.description}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="shortDesc"
                        label="Short Description"
                        type="text"
                        fullWidth
                        value={newInstrument.shortDesc}
                        onChange={handleInputChange}
                    />
                    <input
                        accept="image/*"
                        type="file"
                        multiple
                        onChange={handleImageUpload}
                    />
                    <TextField
                        margin="dense"
                        name="mainImageIndex"
                        label="Main Image Index"
                        type="number"
                        fullWidth
                        value={newInstrument.mainImageIndex}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="projectId"
                        label="Project ID (optional)"
                        type="text"
                        fullWidth
                        value={newInstrument.projectId || ''}
                        onChange={handleInputChange}
                    />
                    <TextField
                        margin="dense"
                        name="instrumentTypeId"
                        label="Instrument Type ID"
                        type="number"
                        fullWidth
                        value={newInstrument.instrumentTypeId}
                        onChange={handleInputChange}
                    />
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseModal} color="secondary">
                        Cancel
                    </Button>
                    <Button onClick={handleAddInstrument} color="primary">
                        Add
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};
