import React, { useEffect, useState } from 'react';
import { Dialog, DialogTitle, DialogContent, DialogActions, TextField, Button,Typography, IconButton, Box, Grid, FormControlLabel, Radio, CircularProgress, FormControl, InputLabel, Select, MenuItem, Checkbox, ListItemText, OutlinedInput, InputAdornment, Paper, TableContainer, Table, TableHead, TableRow, TableCell, TableBody, Switch, useMediaQuery,} from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import { instrumentService } from '../../APIs/Services/instrument.service';
import { useInstruments, InstrumentActions } from '../../context/instrumentContext';
import { useErrorModal } from '../../hooks/useErrorModal';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import Swal from 'sweetalert2';
import InfoIcon from '@mui/icons-material/Info'; 
import { useNavigate } from 'react-router-dom';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { styled } from '@mui/material/styles';
import { useLocation } from 'react-router-dom';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import Cookies from 'universal-cookie';
import { jwtDecode } from 'jwt-decode';
import { instrumentTagService } from '../../APIs/Services/instrumentTag.service';
import AddIcon from '@mui/icons-material/Add';
import { DataGrid } from '@mui/x-data-grid';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';

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

export const Instruments = () => {

    const [isUpdated, forceUpdate] = useState(false);
    const { state, dispatch } = useInstruments();
    const showError = useErrorModal();
    const [openModal, setOpenModal] = useState(false);
    const [openQRDialog, setOpenQRDialog] = useState(false); 
    const [qrImage, setQrImage] = useState(null); 
    const [qrInstrumentName, setQrInstrumentName] = useState(null);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [searchTerm, setSearchTerm] = useState(''); 
    const [uploadedFiles, setUploadedFiles] = useState([]);
    const [availableTags, setAvailableTags] = useState([]);
    const [tagInput, setTagInput] = useState('');


    const [instruments, setInstruments] = useState([]);
    const [instrumentsByName, setInstrumentsByName] = useState([]);
    const [page, setPage] = useState(1);
    const [totalCount, setTotalCount] = useState(0);
    const [hasMore, setHasMore] = useState(true);
    const [error, setError] = useState('');
    const [viewMode, setViewMode] = useState("table"); 


    const handleViewChange = (mode) => {
        setViewMode(mode); // Update the state with the selected mode ("card" or "table")
      };

    const isSmallScreen = useMediaQuery('(max-width:800px)');
    const isExtraSmall = useMediaQuery('(max-width:380px)');


    const [newInstrument, setNewInstrument] = useState({
        name: '',
        images: [],
        files: [], 
        mainImageIndex: 0,
        description: '',
        shortDesc: '',
        instrumentTypeId: '',
        price: '',
        tags: [],
        count: 1
    });
    const [instrument, setInstrument] = useState(null)
    const [loading, setLoading] = useState(true); 
    const navigate = useNavigate();
    const handleInstrumentInfoSelect = async (id) => {
        try {
            const projectResponse = await instrumentService.getById(id);
            setInstrument(projectResponse.data); 
            navigate(`/instruments/details/${id}`, { state: { instrument: projectResponse.data } }); 
            } catch (error) {
            console.error("Failed to fetch project details", error);
        }
    };
    const location = useLocation();
    // const searchInputRef = useRef(null); 
    //console.log(location)

    const cookies = new Cookies();
    let user = cookies.get('user'); 
    let token = user?.token

    let decodedToken;
    try {
        decodedToken = jwtDecode(token);
    } catch (error) {
        console.error("Invalid token:", error);
    }

    var isAdmin = false
    const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || []; 
    if (userRoles.includes("Company_Owner")) {
        isAdmin = true;
    }

    const fetchInstruments = async (newSearch = false) => {
        if (newSearch) {
            setInstruments([]);
            setPage(1);
        }
        setLoading(true);
        try {
            const res = await instrumentService.getAll(searchTerm, page);
            const { instruments: newInstruments, totalCount } = res.data;
            setInstruments(prevInstruments => 
                newSearch ? newInstruments : [...prevInstruments, ...newInstruments]
            );
            setTotalCount(totalCount);
            setHasMore((page * 16) < totalCount);
        } catch (err) {
            console.error('Error fetching instruments:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchInstrumentsByName = async (newSearch = false) => {
        setLoading(true);
        try {
            const res = await instrumentService.getAllByName(searchTerm);
            setInstrumentsByName(res)
            //console.log(res)
        } catch (err) {
            console.error('Error fetching instruments:', err);
        } finally {
            setLoading(false);
        }
    };
    useEffect(() => {
        fetchInstrumentsByName();
    }, []);
    

    useEffect(() => {
        fetchInstruments(page === 1);
    }, [page]);

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
    };

    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            setPage(1);
            fetchInstrumentsByName(true);
        }
    };

    const loadMore = () => {
        setPage(prevPage => prevPage + 1);
    };

    //
    useEffect(() => {
        //const searchParams = new URLSearchParams(location.search);
        //const focusSearch = searchParams.get('focusSearch');        
        if (location.state === 'true') {
          // Use document.getElementById to focus the input by its id
          const searchInput = document.getElementById('searchbtnax');
          if (searchInput) {
            searchInput.focus();
          }
        }
    }, [location.search]);
    
    useEffect(() => {
        (async () => {
            setLoading(true); 
            dispatch({ type: InstrumentActions.start });
            try {
                const res = await instrumentService.getAll();
                dispatch({ type: InstrumentActions.success, payload: res.data });
            } catch (err) {
                console.error('Error fetching instruments:', err);
                dispatch({ type: InstrumentActions.failure, payload: err });
            }finally {
                setLoading(false);
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
    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );
    }

    const fetchTags = async () => {
            if (!availableTags.length) { 
                try {
                    const response = await instrumentTagService.getAll();
                    //console.log(response)
                    setAvailableTags(response.data);
                } catch (error) {
                    console.error('Error fetching available tags:', error);
                }
            }
    };        

    const handleOpenModal = () => {
        setOpenModal(true);
        fetchTags();
    }
    const handleCloseModal = () => {
        setOpenModal(false);
    }
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        //console.log(value)
        if (value === '+' || value === '-') {
            setError('Invalid input: Price cannot be just "+" or "-"');
            setNewInstrument((prev) => ({ ...prev, [name]: '' })); // Clear invalid input
          }else{
        setNewInstrument((prevState) => ({
        ...prevState,
        [name]: value,
        }));
    }
    };

    const handleTagChange = (event) => {
        const selectedTags = event.target.value;
        setNewInstrument((prevState) => ({
          ...prevState,
          tags: selectedTags
        }));
    };

    const handleAddNewTag = () => {
        if (tagInput.trim() && !newInstrument.tags.includes(tagInput)
        ) {
          setNewInstrument((prevState) => ({
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
    
    const handlePdfUpload = (event) => {
        const files = event.target.files;
        setUploadedFiles(prevFiles => [...prevFiles, ...files]);
        setNewInstrument(prevInstrument => ({
          ...prevInstrument,
          files: [...prevInstrument.files, ...files]
        }));
      };

    const handleImageUpload = (event) => {
        const file = event.target.files[0]; // Get the first (and only) file
        if (file) {

          const imageUrl = URL.createObjectURL(file); 
          setImagePreviews(imageUrl); 
          setNewInstrument((prevInstrument) => ({
            ...prevInstrument,
            image: [file], 
          }));
        }
      };
    const handleMainImageChange = (event) => {
        setNewInstrument((prevState) => ({
        ...prevState,
        mainImageIndex: parseInt(event.target.value, 10),
        }));
    };

    const handleAddInstrument = async () => {
        const { name, image, files, description, shortDesc, projectId, instrumentType, count, price, tags } = newInstrument;
        console.log(image)
        const formData = new FormData();
    
        formData.append('Name', name);
        formData.append('Description', description);
        formData.append('ShortDesc', shortDesc);
        formData.append('ProjectId', projectId || '');
        formData.append('InstrumentType', instrumentType);
        formData.append('Count', count);
        formData.append('Price', price); 
        formData.append('Image', image[0]);


    
        files?.forEach((file) => {
            formData.append('Files', file);
        });
    
        newInstrument.tags?.forEach((tag) => {
            formData.append('Tags', tag);
          });
    
        try {
            await instrumentService.add(formData);
            forceUpdate((x) => !x);
            handleCloseModal();
            fetchInstrumentsByName();
        } catch (err) {
            console.error('Error adding instrument:', err);
            if (err.response && err.response.status === 403) {
                Swal.fire({
                    icon: 'error',
                    title: 'Access Denied',
                    text: 'You do not have permission to perform this action.',
                    confirmButtonText: 'OK'
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'An error occurred while adding the instrument. Please try again.',
                    confirmButtonText: 'OK'
                });
            }
            handleCloseModal();
        }
    };

    const handleShare = () => {
        const shareData = {
          //title: project.name,
          //text: `Check out this project: ${project.name}`,
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

    const handleShowQR = (qrImage, instrumentName) => {
        setQrImage(qrImage);
        setQrInstrumentName(instrumentName);
        setOpenQRDialog(true);
    };
    const handleCloseQRDialog = () => setOpenQRDialog(false);

    if (!state.data || state.data.length === 0) {
        return (
            <Box m={"20px"}>
                {isAdmin && (
                <Button
                variant="contained"
                className="!bg-[#1D34D8] !rounded-3xl !ml-0 md:!ml-3 !py-2"
                sx={{ width: "auto", textTransform: "none", padding: "10px 20px" }}
                onClick={handleOpenModal}
              >
                Add Instrument
              </Button>
                )}
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm" PaperProps={{
                style: {
                    borderRadius: 20,
                    //height: "500px",
                    backgroundColor: "#fcfcfc"  
                },
                }}>
                    <DialogTitle>Add New Instrument
                        <IconButton
                                className="!text-blue-700"
                                aria-label="close"
                                onClick={handleCloseModal}
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

                        {/* Instrument Type */}
                        <TextField
                            margin="dense"
                            name="instrumentType"
                            label="Instrument Type"
                            type="text"
                            fullWidth
                            value={newInstrument.instrumentType || ''}
                            onChange={handleInputChange}
                        />

                        {/* Price Input */}
                        <TextField
                            margin="dense"
                            name="price"
                            label="Price"
                            type="number"
                            fullWidth
                            value={newInstrument.price || ''}
                            onChange={handleInputChange}
                            inputProps={{ min: 0, step: "0.01" }}
                            error={!!error} 
                            helperText={error}
                        />

                        <FormControl fullWidth margin="dense">
                        <InputLabel>Tags</InputLabel>
                        <Select
                            multiple
                            label="Tags"
                            value={newInstrument.tags}
                            onChange={handleTagChange}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {availableTags.map((tag) => (
                            <MenuItem key={tag.id} value={tag.title}>
                                <Checkbox checked={newInstrument.tags.includes(tag.title)} />
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

                        <TextField
                            label="Number of Instruments to Add"
                            name="count"
                            type="number"
                            fullWidth
                            value={newInstrument.count}
                            onChange={handleInputChange}
                            margin="normal"
                            inputProps={{ min: 1 }}
                        />
                        {/* Image upload */}
                        <StyledBox>
                            <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            >
                            Upload Images
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            </Button>
                        </StyledBox>

                        {/* Image Previews and Main Image Selection */}
                        {imagePreviews && imagePreviews != '' && (
                            <Box mt={2}>
                                <Typography variant="h6">Uploaded Image:</Typography>
                                <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <img
                                    src={imagePreviews}
                                    alt="Uploaded Preview"
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '10px',
                                    }}
                                    />
                                </Grid>
                                </Grid>
                            </Box>
                            )}

                        {/* PDF Upload */}
            <StyledBox>
            <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
            >
                Upload files
                <VisuallyHiddenInput
                type="file"
                onChange={handlePdfUpload}
                multiple
                accept="application/pdf"
                />
            </Button>
            </StyledBox>

            {/* Display uploaded PDF files */}
            <Box mt={2}>
                {uploadedFiles.length > 0 ? (

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
                        
                    </DialogContent>
                    <DialogActions className='!px-10'>
                    <Button onClick={handleCloseModal} className='!text-[#1D34D8] '>Cancel</Button>
                    <Button type="submit" onClick={handleAddInstrument} variant="contained" className='!bg-[#1D34D8]'>Submit</Button>
                    </DialogActions>
            </Dialog>
            </Box>
        );
    }

    const rows = instruments.map((instrument) => ({
        id: instrument.id,
        name: instrument.name,
        isActive: instrument.isActive ? 'Inactive' : 'Active',
        shortDesc: instrument.shortDesc,
        image: instrument.image,
        status: instrument.status,
        qr : instrument.qrImage
    }));
    const instrumentsFilteredByName = instrumentsByName.data?.map((instrument) => ({
        id: instrument.id,
        name: instrument.name,
        isActive: instrument.isActive ? 'Inactive' : 'Active',
        shortDesc: instrument.shortDesc,
        image: instrument.image,
        status: instrument.status,
        qr : instrument.qrImage,
        count: instrument.count,
        usedInstrumentCount: instrument.usedInstrumentsCount
    }));


    const rowss = instrumentsByName.data?.map((instrument, index) => ({
        id: instrument.id || index,
        ...instrument,
    })); 

    const columns = [
        {
            field: 'name',
            headerName: 'Instrument Name',
            width: 200,
            renderCell: (params) => {
              return (
                <Box display="flex" alignItems="center" sx={{ cursor: 'pointer' }} onClick={() => handleShowQR(params.row)}>
                    <img
                      src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${params.row.image}`}
                      alt={params.row.name}
                      style={{ width: 50, height: 50, marginRight: 10 }}
                    />
                  <Typography>{params.row.name}</Typography>
                </Box>
              );
            },
        },
        {
            field: "availability",
            headerName: "Available",
            flex: 0.5,
            renderCell: (params) => {
                const count = params.row.count ?? 0; // Use 0 if undefined
                const usedCount = params.row.usedInstrumentsCount ?? 0; // Use 0 if undefined
                return `${count - usedCount}/${count}`;
            },
        },
        { field: "shortDesc", headerName: "Description", flex: 2 },
        {
            field: "actions",
            headerName: "Actions",
            flex: 1,
            sortable: false,
            renderCell: (params) => (
                <div className="flex gap-2 items-center mt-2">
                    <IconButton
                        onClick={() => handleInstrumentInfoSelect(params.row.id)}
                        sx={{
                            color: 'gray',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '8px',
                            padding: '5px',
                            '&:hover': {
                                backgroundColor: '#e0e0e0',
                            },
                        }}
                    >
                        <InfoIcon />
                    </IconButton>
                    <IconButton
                        onClick={() => handleShowQR(params.row.qrImage, params.row.name)}
                        sx={{
                            color: 'gray',
                            backgroundColor: '#f0f0f0',
                            borderRadius: '8px',
                            padding: '5px',
                            '&:hover': {
                                backgroundColor: '#e0e0e0',
                            },
                        }}
                    >
                        <QrCodeScannerIcon />
                    </IconButton>
                </div>
            ),
        }
        
    ];


    return (
        <Box m={{ xs: "0px", sm: "20px" }} mt={{ xs: "10px", sm: "20px" }}>
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-0">
                    List of Instruments
                </span>
                <div className={`flex ${isExtraSmall ? "flex-col" : "flex-row"
                    } items-center gap-4 justify-between w-full sm:w-auto`}>
                    <TextField
                        id="searchbtnax"
                        variant="outlined"
                        placeholder="Search Instruments..."
                        value={searchTerm}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        sx={{
                            minWidth: "190px",
                            width: { xs: '100%', sm: isAdmin ? "100%" : "50%" },
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                            borderRadius: '30px',
                            '& .MuiOutlinedInput-root': { borderRadius: '30px' },
                            '& .MuiOutlinedInput-input': { padding: '10px 15px' },
                        }}
                    />
                    {isAdmin && (
                        <Button
                            variant="contained"
                            className="!bg-[#1D34D8] !rounded-3xl !ml-0 md:!ml-3 !py-2 !w-full"
                            sx={{ width: { xs: '100%', sm: '48%' }, textTransform: "none" }}
                            onClick={handleOpenModal}
                        >
                            Add Instrument
                        </Button>
                    )}
                    {/* Switch to toggle between Card and Table views */}
                    <div className={`flex items-center border rounded-full p-1 ${!isSmallScreen ? 'gap-2' : ''}`}>
                    <button
                        className={`flex items-center px-4 py-[6px] rounded-full ${
                        viewMode === "table" ? "bg-blue-100 text-blue-700 font-medium" : "bg-transparent text-gray-600"
                        }`}
                        onClick={() => handleViewChange("table")}
                    >
                        <span>Table</span>
                    </button>
                    <button
                        className={`flex items-center px-4 py-[6px] rounded-full ${
                        viewMode === "card" ? "bg-blue-100 text-blue-700 font-medium" : "bg-transparent text-gray-600"
                        }`}
                        onClick={() => handleViewChange("card")}
                    >
                        <span>Card</span>
                    </button>
                    </div>
                </div>
            </div>

            <p className="mt-4 text-sm sm:text-base">
            </p>

            {viewMode === "card" ? (
                <Grid container spacing={2} sx={{ marginTop: '20px' }}>
                    {instrumentsFilteredByName?.map((row) => (
                        <Grid item xs={12} sm={6} md={4} lg={3} key={row.id}>
                            <Box p={2} boxShadow={2} className="rounded-lg">
                                <img
                                    src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${row.image}`}
                                    alt={row.name}
                                    style={{ width: '100%', height: '200px', marginBottom: '10px', objectFit: 'cover' }}
                                    className="rounded-lg"
                                />
                                <Typography className="!text-lg !mt-1 !whitespace-nowrap !overflow-hidden !text-ellipsis">
                                    {row.name}
                                </Typography>
                                <div className='flex justify-between items-center'>
                                    <div>Available instruments:</div>
                                    <Typography className="!text-base !mt-1 !whitespace-nowrap !overflow-hidden !text-ellipsis">
                                        {row.count - row.usedInstrumentCount}/{row.count}
                                    </Typography>
                                </div>
                                <Typography
                                    variant="body2"
                                    color="textSecondary"
                                    sx={{
                                        whiteSpace: 'nowrap',
                                        overflow: 'hidden',
                                        textOverflow: 'ellipsis',
                                    }}
                                >
                                    {row.shortDesc}
                                </Typography>
                                <div className='flex justify-between mt-1'>
                                    <Button 
                                        variant="outlined"  
                                        startIcon={<InfoIcon />} 
                                        sx={{ marginRight: '10px', borderColor: 'blue', color: 'blue' }}
                                        onClick={() => handleInstrumentInfoSelect(row.id)}
                                    >
                                        Info
                                    </Button>
                                    <Button 
                                        onClick={() => handleShowQR(row.qr, row.name)} 
                                        className='!underline !text-[#1D34D8] !rounded-xl' 
                                    >
                                        Scan QR code
                                    </Button>
                                </div>
                            </Box>
                        </Grid>
                    ))}

                    {loading && <CircularProgress />}
                </Grid>
                
            ) : (
                <Box sx={{ marginTop: "20px", height: 500, width: "100%" }}>
                    <DataGrid
                        rows={rowss || []}
                        columns={columns}
                        pageSize={10}
                        rowsPerPageOptions={[10, 20, 50]}
                        loading={loading}
                        disableSelectionOnClick
                        autoHeight
                    />
                </Box>
            )}

            {/* {!loading && hasMore && (
                <div className='text-center mt-5 px-2'>
                    <Button onClick={loadMore} variant="contained" sx={{ marginTop: 2 }} className="!bg-[#1D34D8] !rounded-3xl !py-2 !px-8">
                        Load More
                    </Button>
                </div>
            )} */}

            {/* QR Modal */}
            <Dialog open={openQRDialog} onClose={handleCloseQRDialog}
                PaperProps={{
                    style: {
                    borderRadius: 20,
                    //height: "500px",  
                    },
                }}>
                    <DialogTitle>
                        Qr Instrument
                        <IconButton
                            className="!text-blue-700"
                            aria-label="close"
                            onClick={handleCloseQRDialog}
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
                            className="!text-blue-700"
                            startIcon={<ShareIcon />}
                            onClick={handleShare}
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
                                className='border-[30px] border-gray-200 rounded-xl'
                                    src={`${process.env.REACT_APP_DOCUMENT_URL}/${qrImage}`}
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
            <Dialog open={openModal} onClose={handleCloseModal} fullWidth maxWidth="sm" PaperProps={{
                style: {
                    borderRadius: 20,
                    //height: "500px",
                    backgroundColor: "#fcfcfc"  
                },
                }}>
                    <DialogTitle>Add New Instrument
                        <IconButton
                                className="!text-blue-700"
                                aria-label="close"
                                onClick={handleCloseModal}
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

                        {/* Instrument Type */}
                        <TextField
                            margin="dense"
                            name="instrumentType"
                            label="Instrument Type"
                            type="text"
                            fullWidth
                            value={newInstrument.instrumentType || ''}
                            onChange={handleInputChange}
                        />

                        {/* Price Input */}
                        <TextField
                            margin="dense"
                            name="price"
                            label="Price"
                            type="number"
                            fullWidth
                            value={newInstrument.price || ''}
                            onChange={handleInputChange}
                            inputProps={{ min: 0, step: "0.01" }}
                            error={!!error} 
                            helperText={error}
                        />

                        <FormControl fullWidth margin="dense">
                        <InputLabel>Tags</InputLabel>
                        <Select
                            multiple
                            label="Tags"
                            value={newInstrument.tags}
                            onChange={handleTagChange}
                            renderValue={(selected) => selected.join(', ')}
                        >
                            {availableTags.map((tag) => (
                            <MenuItem key={tag.id} value={tag.title}>
                                <Checkbox checked={newInstrument.tags.includes(tag.title)} />
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

                        <TextField
                            label="Number of Instruments to Add"
                            name="count"
                            type="number"
                            fullWidth
                            value={newInstrument.count}
                            onChange={handleInputChange}
                            margin="normal"
                            inputProps={{ min: 1 }}
                        />
                        {/* Image upload */}
                        <StyledBox>
                            <Button
                            component="label"
                            variant="contained"
                            startIcon={<CloudUploadIcon />}
                            >
                            Upload Images
                            <VisuallyHiddenInput
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                            />
                            </Button>
                        </StyledBox>

                        {/* Image Previews and Main Image Selection */}
                        {imagePreviews && imagePreviews != '' && (
                            <Box mt={2}>
                                <Typography variant="h6">Uploaded Image:</Typography>
                                <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <img
                                    src={imagePreviews}
                                    alt="Uploaded Preview"
                                    style={{
                                        width: '200px',
                                        height: '200px',
                                        objectFit: 'cover',
                                        borderRadius: '10px',
                                    }}
                                    />
                                </Grid>
                                </Grid>
                            </Box>
                            )}

                        {/* PDF Upload */}
            <StyledBox>
            <Button
                component="label"
                variant="contained"
                startIcon={<CloudUploadIcon />}
            >
                Upload files
                <VisuallyHiddenInput
                type="file"
                onChange={handlePdfUpload}
                multiple
                accept="application/pdf"
                />
            </Button>
            </StyledBox>

            {/* Display uploaded PDF files */}
            <Box mt={2}>
                {uploadedFiles.length > 0 ? (

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
                        
                    </DialogContent>
                    <DialogActions className='!px-10'>
                    <Button onClick={handleCloseModal} className='!text-[#1D34D8] '>Cancel</Button>
                    <Button type="submit" onClick={handleAddInstrument} variant="contained" className='!bg-[#1D34D8]'>Submit</Button>
                    </DialogActions>
            </Dialog>
        </Box>
    );
};

