// import React, { useEffect, useState } from 'react';
// import { Card, CardContent, Typography, Grid, CardActions, Button, CardActionArea, Chip, Box, Divider, Modal, Dialog, DialogTitle, IconButton, DialogContent, TextField, InputAdornment, FormControl, Select, InputLabel, MenuItem, DialogActions } from '@mui/material';
// import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// import { projectService } from '../../APIs/Services/project.service';
// import Swal from 'sweetalert2';
// import { ProjectsActions, useProjects } from '../../context/projectContext';
// import { instrumentHistoryService } from '../../APIs/Services/instrumentHistory.service';
// import { Add as AddIcon, Share as ShareIcon } from '@mui/icons-material';
// import InstrumentStatusModal from '../common/actionsBtn/InstrumentUpdateButton';
// import { instrumentService } from '../../APIs/Services/instrument.service';
// import { teamMemberService } from '../../APIs/Services/teammember.service';
// import AddInstrumentWithQr from '../addInstrumentWithQr/addInstrumentWithQr';
// import FormHelperText from '@mui/material/FormHelperText';
// import StatusButton from "../common/statusBtn";
// import { useTranslation } from "react-i18next";

// const InstrumentTabResponsive = ({ project }) => {
//   const { state, dispatch } = useProjects();
//   const [openDialog, setOpenDialog] = useState(false);
//   //const [openQRDialog, setOpenQRDialog] = useState(false); 
//   const [allInstruments, setAllInstruments] = useState([]);
//   const [instrument, setInstrument] = useState('');
//   const [searchType, setSearchType] = useState('');
//   const [searchDate, setSearchDate] = useState('');
//   const [searchStatus, setSearchStatus] = useState([]); 
//   const [filteredInstruments, setFilteredInstruments] = useState([]);
//   const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
//   const [instrumentHistory, setInstrumentHistory] = useState([]);
//   const [refresh, setRefresh] = useState(false);
//   const [projectManagers, setProjectManagers] = useState([]);
//   const [selectedManager, setSelectedManager] = useState('');
  
//   const [instrumentError, setInstrumentError] = useState(false);
//   const [managerError, setManagerError] = useState(false);

//     const [editOpen, setEditOpen] = useState(false);
//     const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
//     const [selectedInstrumentStatus, setSelectedInstrumentStatus] = useState("");
//     const [instrumentCount, setInstrumentCount] = useState(1);

//     const { t } = useTranslation();
//     // Function to open the edit dialog
//     const handleEditOpen = (instrumentId, currentStatus) => {
//       setSelectedInstrumentId(instrumentId);
//       setSelectedInstrumentStatus(currentStatus);
//       setEditOpen(true);
//     };
//     const handleEditClose = () => {
//       setEditOpen(false);
//       setRefresh(prev => !prev);
//     };
  
//     const handleDelete = async (id) => {
//       try {
//         const result = await Swal.fire({
//           title: 'Are you sure?',
//           text: 'You won\'t be able to revert this!',
//           icon: 'warning',
//           showCancelButton: true,
//           confirmButtonColor: '#1D34D8',
//           cancelButtonColor: '#d33',
//           confirmButtonText: 'Yes, delete it!',
//         });
  
//         if (result.isConfirmed) {
//           const body = { projectId: project.id, instrumentId: id }; 
//           await projectService.removeInstrumentFromProject(body);
          
//           Swal.fire({
//             title: 'Deleted!',
//             text: 'Instrument has been removed from the project.',
//             icon: 'success',
//             timer: 2000,
//           });
  
//           const response = await projectService.getById(project.id);
//           dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
//           setFilteredInstruments(response.data.instruments);  
//         }
//       } catch (error) {
//         console.error('Error deleting instrument:', error.message);
//         Swal.fire({
//           title: 'Error!',
//           text: 'Failed to remove instrument.', 
//           icon: 'error',
//           timer: 2000,
//         });
//       }
//     }; 
  
//     const handleAddInstrument = async () => {
//     // Reset errors
//     setInstrumentError(false);
//     setManagerError(false);
  
//     if (!selectedInstrumentId) {
//       setInstrumentError(true);
//     }
//     if (!selectedManager) {
//       setManagerError(true);
//     }
  
//     if (!selectedInstrumentId || !selectedManager) {
//       Swal.fire("Error!", "Please select an instrument and a project manager.", "error");
//       return;
//     }
  
//     try {
//       const body = {
//         projectId: project.id,
//         instrumentId: selectedInstrumentId,
//         projectManagerId: selectedManager,
//         count: instrumentCount, 
//       };
  
//       await projectService.addInstrumentToProject(body);
//       setOpenDialog(false);
  
//       Swal.fire({
//         title: "Added!",
//         text: "Instrument has been added to the project.",
//         icon: "success",
//         timer: 2000,
//       });
  
//       const response = await projectService.getById(project.id);
//       dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
//       setFilteredInstruments(response.data.instruments);
//       setSelectedInstrumentId("");
//       setInstrumentCount(1);
//       setOpenDialog(false);
//     } catch (error) {
//       console.error("Error adding instrument:", error);
//       setOpenDialog(false);
  
//       Swal.fire("Error!", error.response.data, "error");
//     }
//     };
    
//     const handleCloseHistoryDialog = () => setOpenHistoryDialog(false);
  
//     const handleShowHistory = async (id) => {
//       try {
//         const response = await instrumentHistoryService.getById(id); 
//         setInstrumentHistory(response.data);
//         const foundInstrument = allInstruments.find(inst => inst.id === id);
//         setInstrument(foundInstrument);
//         console.log(instrument)
//         setOpenHistoryDialog(true);
//       } catch (error) {
//         console.error("Error fetching instrument history:", error);
//       }
//     };

//     const handleSearch = () => {
//       let filtered = allInstruments; 
//       if (searchType) {
//         filtered = filtered.filter((instrument) => 
//           instrument.ame.toLowerCase().includes(searchType.toLowerCase())
//         );
//       }

      
//       if (searchStatus) {
//         filtered = filtered.filter(instrument => instrument.status.split('_').join(' ').includes(searchStatus));
//       }
  
//       setFilteredInstruments(filtered);
//     };

//     useEffect(() => {
//       const fetchProjectManagers = async () => {
//           try {
//             const response = await teamMemberService.getAllProjectManagers(project.id)
//             //const data = await response.json();
//             setProjectManagers(response.data);
//             if (response.data && response.data.length > 0 && response?.data[0]?.id) {
//               setSelectedManager(response?.data[0]?.id); // Set first manager's ID as the default
//           }} catch (error) {
//               console.error("Failed to fetch project managers:", error);
//           }
//       };
  
//       if (openDialog) {
//           fetchProjectManagers();
//       }
//   }, [openDialog]);
  
//   const handleManagerChange = (event) => {
//       setSelectedManager(event.target.value);
//   };
  
//     useEffect(() => {
//       setFilteredInstruments(state.project?.instruments || []);
//     }, [state.project?.instruments]);
  
//     useEffect(() => {
//       handleSearch();
//     }, [searchType, searchDate, searchStatus]); 
  
//     const statuses = ["In use", "Under maintenance", "In controlling", "Controlled", "To be controlled"];
//     const handleStatusChange = (event) => {
//       const {
//         target: { value },
//       } = event;
//       setSearchStatus(typeof value === 'string' ? value.split(',') : value);
//     };
  
//     const fetchAllInstruments = async () => {
//       try {
//         const response = await instrumentService.getAllByName();
//         setAllInstruments(response.data);
//         //console.log(response.data)
//       } catch (error) {
//         console.error("Error fetching available instruments:", error);
//       }
//     };
  
//     useEffect(() => {
//       const fetchInstruments = async () => {
//         dispatch({ type: ProjectsActions.start });
//         try {
//           const response = await projectService.getById(project.id);
//           setAllInstruments(response.data.instruments); 
//           setFilteredInstruments(response.data.instruments)
//           //console.log(response.data.instruments)
//           dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
//         } catch (error) {
//           console.error('Error fetching instruments:', error);
//           dispatch({ type: ProjectsActions.failure, payload: error });
//         }
//       };
    
//       fetchInstruments();
//     }, [dispatch, project.id,refresh]);
    
  
//     useEffect(() => {
//       if (openDialog) {
//         fetchAllInstruments(); 
//       }
//     }, [openDialog]);
  
//     const formatDate = (date) => {
//       if (!date) {
//         return 'N/A'; 
//       }
      
//       try {
//         return new Intl.DateTimeFormat('en-GB', {
//           year: 'numeric',
//           month: 'numeric',
//           day: 'numeric',
//         }).format(new Date(date));
//       } catch (error) {
//         console.error('Error formatting date:', error);
//         return 'Invalid date'; 
//       }
//     };

//     const getStatusColor = (status) => {
//       switch (status) {
//         case 'Available':
//           return 'green';
//         case 'In_use':
//           return 'blue';
//         case 'Under_maintenance':
//           return 'red';
//         case 'In_delivery':
//           return 'orange';
//         case 'In_controlling':
//           return 'purple';
//         case 'Controlled':
//           return 'teal';
//         case 'To_be_controlled':
//           return 'darkgoldenrod';
//         default:
//           return 'gray';
//       }
//     };
//   const renderStatus = (status) => {
//     let chipProps = {};
//     switch (status) {
//       case "Available":
//         chipProps = { label: "Available", style: { borderColor: "green", color: "green" }, variant: "outlined" };
//         break;
//       case "In use":
//         chipProps = { label: "In use", style: { borderColor: "blue", color: "blue" }, variant: "outlined" };
//         break;
//       case "Under maintenance":
//         chipProps = { label: "Under maintenance", style: { borderColor: "red", color: "red" }, variant: "outlined" };
//         break;
//       case "In delivery":
//         chipProps = { label: "In delivery", style: { borderColor: "orange", color: "orange" }, variant: "outlined" };
//         break;
//       case "In controlling":
//         chipProps = { label: "In controlling", style: { borderColor: "purple", color: "purple" }, variant: "outlined" };
//         break;
//       case "Controlled":
//         chipProps = { label: "Controlled", style: { borderColor: "teal", color: "teal" }, variant: "outlined" };
//         break;
//       case "To be controlled":
//         chipProps = { label: "To be controlled", style: { borderColor: "darkgoldenrod", color: "darkgoldenrod" }, variant: "outlined" };
//         break;
//       default:
//         chipProps = { label: "Unknown", style: { borderColor: "grey", color: "grey" }, variant: "outlined" };
//         break;
//     }
//     return <Chip {...chipProps} />;
//   };
  
//     if (state.loading) {
//       return <div>Loading...</div>;
//     }
  
//     if (state.error) {
//       return <div>Error loading instruments</div>;
//     }

//   return (
//     <Grid container spacing={2}>
//           <div className="flex flex-col justify-center my-5 w-full ml-4">
//             <div className="flex flex-col gap-3 sm:flex-row ">
//               <TextField
//                 label= {t("PopUp:Name")}
//                 variant="outlined"
//                 onChange={(e) => setSearchType(e.target.value)}
//                 value={searchType}
//                 className="rounded-3xl w-full sm:w-auto"
//               />
//               <FormControl variant="outlined" className="w-full sm:w-48">
//                 <InputLabel>{t("columns:Status")}</InputLabel>
//                 <Select
//                   label="Status"
//                   value={searchStatus}
//                   onChange={handleStatusChange}
//                   className="rounded-3xl"
//                 >
//                   {statuses.map((status) => (
//                     <MenuItem key={status} value={status}>
//                       {status}
//                     </MenuItem>
//                   ))}
//                 </Select>
//               </FormControl>
//             </div>
    
//             <Button
//               className='!bg-[#1D34D8] !rounded-3xl !normal-case !py-2 !my-4 !sm:my-0'
//               startIcon={<AddIcon />}
//               variant="contained"
//               onClick={() => setOpenDialog(true)}
//               aria-hidden
//             >
//               {t("PopUp:AddNewInstrument")}
//             </Button>
//           </div>
    
//           {filteredInstruments && filteredInstruments.map((instrument) => (
//             <Grid item xs={12} sm={6} md={4} key={instrument.id}>
//               <Card sx={{ maxWidth: { xs: '100%', sm: 345 }, borderRadius: 2, boxShadow: 4, overflow: 'hidden', p: 2 }}>
//                 <CardActionArea sx={{ position: 'relative' }}>
//                   <Box
//                     component="img"
//                     loading='lazy'
//                     src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${instrument.image}`}
//                     alt={instrument.name}
//                     sx={{
//                       width: '100%',
//                       height: 200,
//                       objectFit: 'cover',
//                       borderRadius: 2
//                     }}
//                   />
//                 </CardActionArea>
//                 <CardContent>
//                   <Box sx={{ bottom: 0, width: '100%', padding: 1, color: '#fff', textAlign: 'center' }}>
//                     <Typography variant="h6" fontWeight="bold" color='black'>
//                       (ID_{instrument.id}) {instrument.name}
//                     </Typography>
//                   </Box>
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
//                     <Typography variant="body2" color="text.secondary">
//                       {t("Instrument_Type")}:
//                     </Typography>
//                     <Box component="span" className='font-semibold'>
//                       {instrument.instrumentType}
//                     </Box>
//                   </Box>
//                   <Divider variant="middle" sx={{ my: 1 }} />
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
//                     <Typography variant="body2" color="text.secondary">
//                     {t("columns:DateAdded")}:
//                     </Typography>
//                     <Box component="span" className='font-semibold'>
//                       {formatDate(instrument.addedProjectDate)}
//                     </Box>
//                   </Box>
//                   <Divider variant="middle" sx={{ my: 1 }} />
//                   <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
//                     <Typography variant="body2" color="text.secondary">
//                     {t("columns:Status")}:
//                     </Typography>
//                     <Box component="span">
//                       {renderStatus(instrument.status.split('_').join(' '))}
//                     </Box>
//                   </Box>
//                 </CardContent>
//                 <CardActions sx={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 2 }}>
//                   <Button size="small" className='!border-[#1D34D8] text-[#1D34D8]' variant="outlined" sx={{ textTransform: 'none', mr: 'auto' }} onClick={() => handleShowHistory(instrument.id)}>
//                   {t("ShowHistory")}
//                   </Button>
//                   <Button size="small" className='!bg-[#1D34D8]' variant="contained" sx={{ textTransform: 'none' }} onClick={() => handleEditOpen(instrument.id, instrument.status)}>
//                   {t("PopUp:Edit")}:
//                   </Button>
//                   <Button size="small" color="error" variant="contained" sx={{ textTransform: 'none', ml: 1 }} onClick={() => handleDelete(instrument.id)}>
//                   {t("Remove")}
//                   </Button>
//                 </CardActions>
//               </Card>
//             </Grid>
//           ))}
    
//             <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog}
//               fullWidth
//               maxWidth="sm"
//               PaperProps={{
//                 style: {
//                   borderRadius: 20,
//                   height: "500px",
//                   backgroundColor: "#fcfcfc"  
//                 },
//               }}
//             >
//               <DialogTitle>
//               {t("PopUp:InstrumentHistory")}
//                 <IconButton
//                   className="!text-blue-700"
//                   aria-label="close"
//                   onClick={handleCloseHistoryDialog}
//                   sx={{
//                     position: "absolute",
//                     right: 8,
//                     top: 8,
//                   }}
//                 >
//                   <CancelOutlinedIcon />
//                 </IconButton>
//               </DialogTitle>
      
//               <DialogContent
//                 className="!border !border-gray-300 rounded-xl !p-2 !m-6 !mt-0 bg-white"
//                 sx={{
//                   display: "flex",
//                   flexDirection: "column",
//                   justifyContent: instrumentHistory && instrumentHistory.length > 0 ? "flex-start" : "center",
//                   alignItems: instrumentHistory && instrumentHistory.length > 0 ? "flex-start" : "center",
//                   overflowY: "auto",
//                   overflowX: "hidden",  
//                   maxHeight: "calc(100% - 64px)",  
//                   paddingRight: "8px" 
//                 }}
//               >
//                 {instrumentHistory && instrumentHistory.length > 0 ? (
//                   <>
//                     <Box display="flex" gap={2} mb={2} >
//                       {instrument?.images?.slice(0, 3).map((img, index) => (
//                         <img
//                           key={index}
//                           src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${img.image}`}
//                           alt="Instrument"
//                           style={{
//                             flexGrow: 1, 
//                             width: '32%', 
//                             height: 100,
//                             borderRadius: 8,
//                             objectFit: 'cover' 
//                           }}
//                         />
//                       ))}
//                     </Box> 
//                     <Box mb={2} p={2} sx={{ borderRadius: 3 }} className="block sm:!hidden !w-full !p-0">
//                     <Typography variant="h6" className=" block sm:!hidden">
//                     {t("columns:Status")}: <StatusButton text={instrument.status.split('_').join(' ')} color={getStatusColor(instrument.status)} />
//                     </Typography>
//                     </Box>
      
//                     <Typography variant="h6" dividers>{t("PopUp:Details")}</Typography>
//                     <div className='border-b border-slate-300 w-full my-2'></div>
//                     {instrumentHistory.map((entry, index) => (
//                       <Box key={index} mb={2} width="100%">
//                         <div className="flex justify-between items-center">
//                           <Typography variant="subtitle1" className='!font-medium'>{entry.title}</Typography>
//                           <Typography variant="subtitle2" color="textSecondary">
//                             {formatDate(entry.eventDate)}
//                           </Typography>
//                         </div>
//                         <Typography variant="body2" className='!text-gray-500 !ml-1'>{entry.description}</Typography>
//                       </Box>
//                     ))}
//                   </>
//                 ) : (
//                   <Typography variant="body2" className='text-gray-500'> {t("messages:Nothing here yet...")}</Typography>
//                 )}
//               </DialogContent>
//             </Dialog>
    
//             {/* Dialog for Adding New Instrument */}
//             <Dialog
//               open={openDialog}
//               onClose={() => setOpenDialog(false)}
//               PaperProps={{
//                 style: {
//                   borderRadius: 20,
//                   backgroundColor: "#fcfcfc",
//                 },
//               }}
//             >
//               <DialogTitle className="!font-medium">{t("PopUp:Select instrument for adding project")}</DialogTitle>
//               <DialogContent>
//               <FormControl fullWidth margin="dense" error={instrumentError}>
//               <InputLabel>{t("PopUp:SelectInstrument")}</InputLabel>
//               <Select
//                 value={selectedInstrumentId}
//                 onChange={(e) => {
//                   setSelectedInstrumentId(e.target.value);
//                   setInstrumentError(false);
//                 }}
//                 label="Select Instrument"
//               >
//                 {allInstruments.map((instrument) => (
//                   <MenuItem key={instrument.id} value={instrument.id}>
//                     {instrument.name}
//                   </MenuItem>
//                 ))}
//               </Select>
//                 {instrumentError && <FormHelperText>{t("Please select an instrument.")}</FormHelperText>}
//               </FormControl>
      
//               <FormControl fullWidth margin="dense" error={managerError}>
//                 <InputLabel id="project-manager-label">{t("Project_Manager")}</InputLabel>
//                 <Select
//                   labelId="project-manager-label"
//                   value={selectedManager}
//                   onChange={(e) => {
//                     setSelectedManager(e.target.value);
//                     setManagerError(false);
//                   }}
//                   label={t("Project_Manager")}
//                 >
//                   {projectManagers.map((manager) => (
//                     <MenuItem key={manager.id} value={manager.id}>
//                       {manager.name} {manager.lastName}
//                     </MenuItem>
//                   ))}
//                 </Select>
//                 {managerError && <FormHelperText>{t("Please select a project manager.")}</FormHelperText>}
//               </FormControl>
      
      
//                 {/* Count Input */}
//                 <FormControl fullWidth margin="dense">
//                   <TextField
//                     type="number"
//                     label={t("PopUp:InstrumentCount")}
//                     value={instrumentCount}
//                     onChange={(e) => setInstrumentCount(e.target.value)}
//                     inputProps={{ min: 1 }}
//                   />
//                 </FormControl>
      
//                 <AddInstrumentWithQr
//                   onComplete={(instrumentId) => {
//                     if (!allInstruments?.find((x) => x?.id == instrumentId)) {
//                       Swal.fire(`Not Found ${instrumentId}`, `Invalid QR Code ${JSON.stringify(allInstruments)}, `);
//                       return;
//                     }
//                     setSelectedInstrumentId(instrumentId);
//                   }}
//                 />
//               </DialogContent>
//               <DialogActions className="!px-6">
//                 <Button onClick={() => setOpenDialog(false)} className="!text-[#1D34D8]">
//                   {t("PopUp:Cancel")}
//                 </Button>
//                 <Button onClick={handleAddInstrument} variant="contained" className="!bg-[#1D34D8]">
//                   {t("PopUp:Add")}
//                 </Button>
//               </DialogActions>
//             </Dialog>
    
//             <InstrumentStatusModal
//                 instrumentId={selectedInstrumentId} 
//                 currentStatus={selectedInstrumentStatus} 
//                 open={editOpen} 
//                 onClose={handleEditClose} 
//             />
//         </Grid>
//   );
// };
// export default InstrumentTabResponsive;


// // import React from 'react';
// // import {
// //   Grid,
// //   TextField,
// //   FormControl,
// //   InputLabel,
// //   Select,
// //   MenuItem,
// //   Button,
// //   Card,
// //   CardActionArea,
// //   CardContent,
// //   CardActions,
// //   Typography,
// //   Divider,
// //   Dialog,
// //   DialogTitle,
// //   DialogContent,
// //   DialogActions,
// //   IconButton,
// //   Box,
// //   FormHelperText,
// // } from '@mui/material';
// // import AddIcon from '@mui/icons-material/Add';
// // import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
// // import StatusButton from "../common/statusBtn";
// // import InstrumentStatusModal from '../common/actionsBtn/InstrumentUpdateButton';
// // import { useTranslation } from "react-i18next";
// // import Swal from 'sweetalert2';

// // const InstrumentTabResponsive = ({
// //   searchType,
// //   setSearchType,
// //   searchStatus,
// //   handleStatusChange,
// //   filteredInstruments,
// //   statuses,
// //   openDialog,
// //   setOpenDialog,
// //   handleShowHistory,
// //   handleEditOpen,
// //   handleDelete,
// //   openHistoryDialog,
// //   handleCloseHistoryDialog,
// //   instrumentHistory,
// //   formatDate,
// //   renderStatus,
// //   allInstruments,
// //   setSelectedInstrumentId,
// //   selectedInstrumentId,
// //   projectManagers,
// //   setSelectedManager,
// //   instrumentError,
// //   managerError,
// //   instrumentCount,
// //   setInstrumentCount,
// //   handleAddInstrument,
// //   AddInstrumentWithQr,
// //   editOpen,
// //   handleEditClose,
// //   selectedInstrumentStatus,
// //   instrument,
// //   setInstrumentError,
// //   selectedManager,
// //   setManagerError
// // }) => {
// //   const { t } = useTranslation();

// //   const getStatusColor = (status) => {
// //     switch (status) {
// //       case 'Available':
// //         return 'green';
// //       case 'In_use':
// //         return 'blue';
// //       case 'Under_maintenance':
// //         return 'red';
// //       case 'In_delivery':
// //         return 'orange';
// //       case 'In_controlling':
// //         return 'purple';
// //       case 'Controlled':
// //         return 'teal';
// //       case 'To_be_controlled':
// //         return 'darkgoldenrod';
// //       default:
// //         return 'gray';
// //     }
// //   };
// //   return (
// //     <Grid container spacing={2}>
// //       <div className="flex flex-col justify-center my-5 w-full ml-4">
// //         <div className="flex flex-col gap-3 sm:flex-row ">
// //           <TextField
// //             label= {t("PopUp:Name")}
// //             variant="outlined"
// //             onChange={(e) => setSearchType(e.target.value)}
// //             value={searchType}
// //             className="rounded-3xl w-full sm:w-auto"
// //           />
// //           <FormControl variant="outlined" className="w-full sm:w-48">
// //             <InputLabel>{t("columns:Status")}</InputLabel>
// //             <Select
// //               label="Status"
// //               value={searchStatus}
// //               onChange={handleStatusChange}
// //               className="rounded-3xl"
// //             >
// //               {/* {statuses.map((status) => (
// //                 <MenuItem key={status} value={status}>
// //                   {status}
// //                 </MenuItem>
// //               ))} */}
// //             </Select>
// //           </FormControl>
// //         </div>

// //         <Button
// //           className='!bg-[#1D34D8] !rounded-3xl !normal-case !py-2 !my-4 !sm:my-0'
// //           startIcon={<AddIcon />}
// //           variant="contained"
// //           onClick={() => setOpenDialog(true)}
// //           aria-hidden
// //         >
// //           {t("PopUp:AddNewInstrument")}
// //         </Button>
// //       </div>

// //       {filteredInstruments && filteredInstruments.map((instrument) => (
// //         <Grid item xs={12} sm={6} md={4} key={instrument.id}>
// //           <Card sx={{ maxWidth: { xs: '100%', sm: 345 }, borderRadius: 2, boxShadow: 4, overflow: 'hidden', p: 2 }}>
// //             <CardActionArea sx={{ position: 'relative' }}>
// //               <Box
// //                 component="img"
// //                 loading='lazy'
// //                 src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${instrument.image}`}
// //                 alt={instrument.name}
// //                 sx={{
// //                   width: '100%',
// //                   height: 200,
// //                   objectFit: 'cover',
// //                   borderRadius: 2
// //                 }}
// //               />
// //             </CardActionArea>
// //             <CardContent>
// //               <Box sx={{ bottom: 0, width: '100%', padding: 1, color: '#fff', textAlign: 'center' }}>
// //                 <Typography variant="h6" fontWeight="bold" color='black'>
// //                   (ID_{instrument.id}) {instrument.name}
// //                 </Typography>
// //               </Box>
// //               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
// //                 <Typography variant="body2" color="text.secondary">
// //                   {t("Instrument_Type")}:
// //                 </Typography>
// //                 <Box component="span" className='font-semibold'>
// //                   {instrument.instrumentType}
// //                 </Box>
// //               </Box>
// //               <Divider variant="middle" sx={{ my: 1 }} />
// //               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
// //                 <Typography variant="body2" color="text.secondary">
// //                 {t("columns:DateAdded")}:
// //                 </Typography>
// //                 <Box component="span" className='font-semibold'>
// //                   {formatDate(instrument.addedProjectDate)}
// //                 </Box>
// //               </Box>
// //               <Divider variant="middle" sx={{ my: 1 }} />
// //               <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mt: 1 }}>
// //                 <Typography variant="body2" color="text.secondary">
// //                 {t("columns:Status")}:
// //                 </Typography>
// //                 <Box component="span">
// //                   {renderStatus(instrument.status.split('_').join(' '))}
// //                 </Box>
// //               </Box>
// //             </CardContent>
// //             <CardActions sx={{ display: 'flex', justifyContent: 'flex-end', paddingBottom: 2 }}>
// //               <Button size="small" className='!border-[#1D34D8] text-[#1D34D8]' variant="outlined" sx={{ textTransform: 'none', mr: 'auto' }} onClick={() => handleShowHistory(instrument.id)}>
// //               {t("ShowHistory")}
// //               </Button>
// //               <Button size="small" className='!bg-[#1D34D8]' variant="contained" sx={{ textTransform: 'none' }} onClick={() => handleEditOpen(instrument.id, instrument.status)}>
// //               {t("PopUp:Edit")}:
// //               </Button>
// //               <Button size="small" color="error" variant="contained" sx={{ textTransform: 'none', ml: 1 }} onClick={() => handleDelete(instrument.id)}>
// //               {t("Remove")}
// //               </Button>
// //             </CardActions>
// //           </Card>
// //         </Grid>
// //       ))}

// //         <Dialog open={openHistoryDialog} onClose={handleCloseHistoryDialog}
// //           fullWidth
// //           maxWidth="sm"
// //           PaperProps={{
// //             style: {
// //               borderRadius: 20,
// //               height: "500px",
// //               backgroundColor: "#fcfcfc"  
// //             },
// //           }}
// //         >
// //           <DialogTitle>
// //           {t("PopUp:InstrumentHistory")}
// //             <IconButton
// //               className="!text-blue-700"
// //               aria-label="close"
// //               onClick={handleCloseHistoryDialog}
// //               sx={{
// //                 position: "absolute",
// //                 right: 8,
// //                 top: 8,
// //               }}
// //             >
// //               <CancelOutlinedIcon />
// //             </IconButton>
// //           </DialogTitle>
  
// //           <DialogContent
// //             className="!border !border-gray-300 rounded-xl !p-2 !m-6 !mt-0 bg-white"
// //             sx={{
// //               display: "flex",
// //               flexDirection: "column",
// //               justifyContent: instrumentHistory && instrumentHistory.length > 0 ? "flex-start" : "center",
// //               alignItems: instrumentHistory && instrumentHistory.length > 0 ? "flex-start" : "center",
// //               overflowY: "auto",
// //               overflowX: "hidden",  
// //               maxHeight: "calc(100% - 64px)",  
// //               paddingRight: "8px" 
// //             }}
// //           >
// //             {instrumentHistory && instrumentHistory.length > 0 ? (
// //               <>
// //                 <Box display="flex" gap={2} mb={2} >
// //                   {instrument?.images?.slice(0, 3).map((img, index) => (
// //                     <img
// //                       key={index}
// //                       src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${img.image}`}
// //                       alt="Instrument"
// //                       style={{
// //                         flexGrow: 1, 
// //                         width: '32%', 
// //                         height: 100,
// //                         borderRadius: 8,
// //                         objectFit: 'cover' 
// //                       }}
// //                     />
// //                   ))}
// //                 </Box> 
// //                 <Box mb={2} p={2} sx={{ borderRadius: 3 }} className="block sm:!hidden !w-full !p-0">
// //                 <Typography variant="h6" className=" block sm:!hidden">
// //                 {t("columns:Status")}: <StatusButton text={instrument.status.split('_').join(' ')} color={getStatusColor(instrument.status)} />
// //                 </Typography>
// //                 </Box>
  
// //                 <Typography variant="h6" dividers>{t("PopUp:Details")}</Typography>
// //                 <div className='border-b border-slate-300 w-full my-2'></div>
// //                 {instrumentHistory.map((entry, index) => (
// //                   <Box key={index} mb={2} width="100%">
// //                     <div className="flex justify-between items-center">
// //                       <Typography variant="subtitle1" className='!font-medium'>{entry.title}</Typography>
// //                       <Typography variant="subtitle2" color="textSecondary">
// //                         {formatDate(entry.eventDate)}
// //                       </Typography>
// //                     </div>
// //                     <Typography variant="body2" className='!text-gray-500 !ml-1'>{entry.description}</Typography>
// //                   </Box>
// //                 ))}
// //               </>
// //             ) : (
// //               <Typography variant="body2" className='text-gray-500'> {t("messages:Nothing here yet...")}</Typography>
// //             )}
// //           </DialogContent>
// //         </Dialog>

// //         {/* Dialog for Adding New Instrument */}
// //         <Dialog
// //           open={openDialog}
// //           onClose={() => setOpenDialog(false)}
// //           PaperProps={{
// //             style: {
// //               borderRadius: 20,
// //               backgroundColor: "#fcfcfc",
// //             },
// //           }}
// //         >
// //           <DialogTitle className="!font-medium">{t("PopUp:Select instrument for adding project")}</DialogTitle>
// //           <DialogContent>
// //           <FormControl fullWidth margin="dense" error={instrumentError}>
// //           <InputLabel>{t("PopUp:SelectInstrument")}</InputLabel>
// //           <Select
// //             value={selectedInstrumentId}
// //             onChange={(e) => {
// //               setSelectedInstrumentId(e.target.value);
// //               setInstrumentError(false);
// //             }}
// //             label="Select Instrument"
// //           >
// //             {allInstruments.map((instrument) => (
// //               <MenuItem key={instrument.id} value={instrument.id}>
// //                 {instrument.name}
// //               </MenuItem>
// //             ))}
// //           </Select>
// //             {instrumentError && <FormHelperText>{t("Please select an instrument.")}</FormHelperText>}
// //           </FormControl>
  
// //           <FormControl fullWidth margin="dense" error={managerError}>
// //             <InputLabel id="project-manager-label">{t("Project_Manager")}</InputLabel>
// //             <Select
// //               labelId="project-manager-label"
// //               value={selectedManager}
// //               onChange={(e) => {
// //                 setSelectedManager(e.target.value);
// //                 setManagerError(false);
// //               }}
// //               label={t("Project_Manager")}
// //             >
// //               {projectManagers.map((manager) => (
// //                 <MenuItem key={manager.id} value={manager.id}>
// //                   {manager.name} {manager.lastName}
// //                 </MenuItem>
// //               ))}
// //             </Select>
// //             {managerError && <FormHelperText>{t("Please select a project manager.")}</FormHelperText>}
// //           </FormControl>
  
  
// //             {/* Count Input */}
// //             <FormControl fullWidth margin="dense">
// //               <TextField
// //                 type="number"
// //                 label={t("PopUp:InstrumentCount")}
// //                 value={instrumentCount}
// //                 onChange={(e) => setInstrumentCount(e.target.value)}
// //                 inputProps={{ min: 1 }}
// //               />
// //             </FormControl>
  
// //             <AddInstrumentWithQr
// //               onComplete={(instrumentId) => {
// //                 if (!allInstruments?.find((x) => x?.id == instrumentId)) {
// //                   Swal.fire(`Not Found ${instrumentId}`, `Invalid QR Code ${JSON.stringify(allInstruments)}, `);
// //                   return;
// //                 }
// //                 setSelectedInstrumentId(instrumentId);
// //               }}
// //             />
// //           </DialogContent>
// //           <DialogActions className="!px-6">
// //             <Button onClick={() => setOpenDialog(false)} className="!text-[#1D34D8]">
// //               {t("PopUp:Cancel")}
// //             </Button>
// //             <Button onClick={handleAddInstrument} variant="contained" className="!bg-[#1D34D8]">
// //               {t("PopUp:Add")}
// //             </Button>
// //           </DialogActions>
// //         </Dialog>

// //         <InstrumentStatusModal
// //             instrumentId={selectedInstrumentId} 
// //             currentStatus={selectedInstrumentStatus} 
// //             open={editOpen} 
// //             onClose={handleEditClose} 
// //         />
// //     </Grid>
// //   )
// // }
// // export default InstrumentTabResponsive;
