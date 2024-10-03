import React, { useEffect, useState } from 'react';
import { Box, Button, Dialog, DialogActions, DialogContent, DialogTitle, TextField, Grid, Typography, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ShareIcon from '@mui/icons-material/Share';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { useInstruments, InstrumentActions } from '../../context/instrumentContext';
import { useErrorModal } from '../../hooks/useErrorModal';
import StatusButton from '../../components/common/statusBtn';

export const Instruments = () => {
    const [isUpdated, forceUpdate] = useState(false);
    const { state, dispatch } = useInstruments();
    const showError = useErrorModal();
    const [openModal, setOpenModal] = useState(false);
    const [openQRDialog, setOpenQRDialog] = useState(false); 
    const [qrImage, setQrImage] = useState(null); 
    const [qrInstrumentName, setQrInstrumentName] = useState(null);
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
                console.error('Error fetching instruments:', err);
                dispatch({ type: InstrumentActions.failure, payload: err });
            }
        })();
    }, [dispatch, isUpdated]);

    const handleDelete = async (id) => {
        try {
            await instrumentService.remove(id);
            forceUpdate((x) => !x);
        } catch (err) {
            console.error('Error deleting instrument:', err);
            showError();
        }
    };

    const handleOpenModal = () => setOpenModal(true);
    const handleCloseModal = () => setOpenModal(false);

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setNewInstrument((prevState) => ({
            ...prevState,
            [name]: value,
        }));
    };

    const handleImageUpload = (e) => {
        console.log()
        setNewInstrument((prevState) => ({
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
            await instrumentService.add(formData);
            forceUpdate((x) => !x);
            handleCloseModal();
        } catch (err) {
            console.error('Error adding instrument:', err);
            showError();
        }
    };

    const handleShowQR = (qrImage, instrumentName) => {
        setQrImage(qrImage);
        setQrInstrumentName(instrumentName);
        setOpenQRDialog(true);
    };

    const handleCloseQRDialog = () => setOpenQRDialog(false);

    if (!state.data || state.data.length === 0) {
        return (
            <Box m={"20px"}>
                <Button variant="contained" color="primary" onClick={handleOpenModal}>
                    Add Instrument
                </Button>
                <div>No instruments found</div>
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

    const rows = state.data.map((instrument) => ({
        id: instrument.id,
        name: instrument.name,
        isActive: instrument.isActive ? 'Inactive' : 'Active',
        shortDesc: instrument.shortDesc,
        image: instrument.images.find((image) => image.isMain),
        status: instrument.status,
        qr : instrument.qrImage
    }));

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
    rows.map((rowww) =>(
        console.log(rowww.image)
    ))

    return (
        <Box m={"20px"}>
            <div className='flex justify-between'>
                <span className='text-3xl font-semibold'>List of instruments</span>
                <Button variant="contained" color="primary" onClick={handleOpenModal}>
                    Add Instrument
                </Button>
            </div>
            <p className='mt-4'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. </p>

            <Grid container spacing={2} sx={{ marginTop: '20px' }}>
                {rows.map((row) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={row.id}>
                        <Box p={2} boxShadow={2} className='rounded-lg'>
                            <img 
                                src={`${process.env.REACT_APP_DOCUMENT_URL}${row.image?.image}`} 
                                alt={row.name} 
                                style={{ width: '100%', height: 'auto', marginBottom: '10px' }}
                                className='rounded-lg'
                            />
                            <StatusButton text={row.status.split('_').join(' ')} color={getStatusColor(row.status)} />
                            <Typography className="!text-lg !mt-1">{row.name}</Typography>
                            <Typography variant="body2" color="textSecondary">{row.shortDesc}</Typography>
                            <Button 
                                onClick={() => handleShowQR(row.qr, row.name)} 
                                sx={{ marginTop: '10px' }}
                                className='!underline' >
                                Scan QR code
                            </Button>
                        </Box>
                    </Grid>
                ))}
            </Grid>

            {/* QR Modal */}
            <Dialog open={openQRDialog} onClose={handleCloseQRDialog}>
                <DialogTitle>
                    Qr Instrument
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
            //onClick={handleShareQR}
        >
            Share
        </Button>

        </div>

        {/* QR Code Image */}
        {qrImage && (
            <Box
                display="flex"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                p={2}
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
                    {qrInstrumentName}
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
                    src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/qrcodes/${qrImage}`}
                    alt="QR Code"
                    style={{
                        width: '200px',
                        height: '200px',
                        margin: '10px 0',
                    }}
                />
            </Box>
        )}
                </DialogContent>

            </Dialog>


            {/* Add Instrument Modal */}
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
