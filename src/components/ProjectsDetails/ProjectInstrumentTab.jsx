import React, { useEffect, useState } from "react";
import { DataGrid } from "@mui/x-data-grid";
import {
  IconButton,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Typography,
  TextField,
  FormHelperText,
  Chip,
  Paper,
  useMediaQuery,
  Autocomplete
} from "@mui/material";
import Swal from "sweetalert2";
import DeleteIcon from "@mui/icons-material/Delete";
import HistoryIcon from "@mui/icons-material/History";
import { useProjects, ProjectsActions } from "../../context/projectContext";
import { projectService } from "../../APIs/Services/project.service";
import { instrumentService } from "../../APIs/Services/instrument.service";
import { instrumentHistoryService } from "../../APIs/Services/instrumentHistory.service";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import { Add as AddIcon, Share as ShareIcon } from "@mui/icons-material";
import InstrumentStatusModal from "../common/actionsBtn/InstrumentUpdateButton";
import EditIcon from "@mui/icons-material/Edit";
import { teamMemberService } from "../../APIs/Services/teammember.service";
import AddInstrumentWithQr from "../addInstrumentWithQr/addInstrumentWithQr";
import CloseIcon from '@mui/icons-material/Close';
import StatusButton from "../common/statusBtn";
import InstrumentTabResponsive from "./InstrumentTabResponsive";
import { useTranslation } from "react-i18next";
import CarSelectDropdown from "../common/CarSelectDropdown";
import { carService } from "../../APIs/Services/car.service";
import LocalShippingOutlinedIcon from '@mui/icons-material/LocalShippingOutlined';

export default function InstrumentTab({ project }) {
  const { t } = useTranslation();

  const { state, dispatch, fetchProject, selectedProject, setSelectedProject } = useProjects();
  const [openDialog, setOpenDialog] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [allInstruments, setAllInstruments] = useState([]);
  const [selectedInstrumentId, setSelectedInstrumentId] = useState("");
  const [instrument, setInstrument] = useState("");
  const [qrImage, setQrImage] = useState("");
  const [qrInstrumentName, setQrInstrumentName] = useState("");
  const [searchType, setSearchType] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [searchStatus, setSearchStatus] = useState([]);
  const [filteredInstruments, setFilteredInstruments] = useState([]);
  const [openHistoryDialog, setOpenHistoryDialog] = useState(false);
  const [instrumentHistory, setInstrumentHistory] = useState([]);
  const [refresh, setRefresh] = useState(false);
  const [projectManagers, setProjectManagers] = useState([]);
  const [selectedManager, setSelectedManager] = useState("");
  const [instrumentCount, setInstrumentCount] = useState(1);

  const [instrumentError, setInstrumentError] = useState(false);
  const [managerError, setManagerError] = useState(false);

  const [editOpen, setEditOpen] = useState(false);
  const [selectedInstrumentStatus, setSelectedInstrumentStatus] = useState("");
  const [selectedInstrumentIds, setSelectedInstrumentIds] = useState([]);
  const [selectedCar, setSelectedCar] = useState(null);

  const isSmallScreen = useMediaQuery('(max-width:800px)');
  
  const handleDelete = async (id) => {
    try {
      const result = await Swal.fire({
        title: t("PopUp:Areyousure?"),
        text: t("messages:YouWon'tBeAbleToRevertThis!"),
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1D34D8",
        cancelButtonColor: "#d33",
        confirmButtonText: t("PopUp:Yes,deleteit"),
        cancelButtonText: t("PopUp:Cancel")
      });

      if (result.isConfirmed) {
        const body = { projectId: project.id, instrumentId: id };
        await projectService.removeInstrumentFromProject(body);

        Swal.fire({
          title: t("messages:Deleted"),
          text: t("messages:Instrument has been removed from the project."),
          icon: "success",
          timer: 2000,
        });

        const response = await projectService.getById(project.id);
        dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
        setFilteredInstruments(response.data.instruments);
      }
    } catch (error) {
      console.error("Error deleting instrument:", error.message);
      Swal.fire({
        title: t("messages:Error"),
        text: t("messages:Failedtodelete"),
        icon: "error",
        timer: 2000,
      });
    }
  };

  const handleAddInstrument = async () => {
    // Reset errors
    setInstrumentError(false);
    setManagerError(false);
  
    if (!selectedInstrumentId) {
      setInstrumentError(true);
    }
    if (!selectedManager) {
      setManagerError(true);
    }
  
    if (!selectedInstrumentId || !selectedManager) {
      Swal.fire("Error!", "Please select an instrument and a project manager.", "error");
      return;
    }
  
    try {
      const body = {
        projectId: project.id,
        instrumentId: selectedInstrumentId,
        projectManagerId: selectedManager,
        count: instrumentCount, 
      };
  
      await projectService.addInstrumentToProject(body);
      setOpenDialog(false);
  
      Swal.fire({
        title: "Added!",
        text: "Instrument has been added to the project.",
        icon: "success",
        timer: 2000,
      });
  
      const response = await projectService.getById(project.id);
      dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
      setFilteredInstruments(response.data.instruments);
      setSelectedInstrumentId("");
      setInstrumentCount(1);
      setOpenDialog(false);
    } catch (error) {
      console.error("Error adding instrument:", error);
      setOpenDialog(false);
  
      Swal.fire("Error!", error.response.data, "error");
    }
  };

  const handleCloseHistoryDialog = () => setOpenHistoryDialog(false);

  const handleShowHistory = async (id) => {
    try {
      const response = await instrumentHistoryService.getById(id);
      setInstrumentHistory(response.data);
      setInstrument(allInstruments.find((inst) => inst.id === id));
      setOpenHistoryDialog(true);
    } catch (error) {
      console.error("Error fetching instrument history:", error);
    }
  };

  const handleSearch = () => {
    let filtered = allInstruments;
    if (searchType) {
      filtered = filtered.filter((instrument) =>
        instrument.name.toLowerCase().includes(searchType.toLowerCase())
      );
    }

    if (searchStatus) {
      filtered = filtered.filter((instrument) => instrument.status.split("_").join(" ").includes(searchStatus));
    }

    setFilteredInstruments(filtered);
  };

  useEffect(() => {
    const fetchProjectManagers = async () => {
      try {
        const response = await teamMemberService.getAllProjectManagers(project.id);
        //const data = await response.json();
        setProjectManagers(response.data);
        if (response.data && response.data.length > 0) {
          setSelectedManager(response.data[0].id); 
        }
      } catch (error) {
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

  useEffect(() => {
    setFilteredInstruments(selectedProject?.instruments || []);
  }, [selectedProject?.instruments]);
  // console.log(state)

  useEffect(() => {
    handleSearch();
  }, [searchType, searchDate, searchStatus]);

  const statuses = ["In use", "Under maintenance", "In controlling", "Controlled", "To be controlled"];
  const handleStatusChange = (event) => {
    const {
      target: { value },
    } = event;
    setSearchStatus(typeof value === "string" ? value.split(",") : value);
  };
  const fetchAllInstruments = async () => {
    try {
      const response = await instrumentService.getAllByName();
      setAllInstruments(response.data);
      //console.log(response.data)
    } catch (error) {
      console.error("Error fetching available instruments:", error);
    }
  };

  const fetchInstruments = async () => {
    dispatch({ type: ProjectsActions.start });
    try {
      const response = await projectService.getById(project.id);
      // console.log(response)
      setAllInstruments(response.data.instruments);
      setFilteredInstruments(response.data.instruments);
      //console.log(response.data.instruments)
      dispatch({ type: ProjectsActions.success, payload: response.data.instruments });
    } catch (error) {
      console.error("Error fetching instruments:", error);
      dispatch({ type: ProjectsActions.failure, payload: error });
    }
  };
  useEffect(() => {

    fetchInstruments();
  }, [dispatch, project.id, refresh]);

  const handleClearStatus = () => {
    setSearchStatus("");
    fetchInstruments(); 
  };

  useEffect(() => {
    if (openDialog) {
      fetchAllInstruments();
    }
  }, [openDialog]);

  function handleShowQR(instrument) {
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
      return "N/A";
    }

    try {
      return new Intl.DateTimeFormat("en-GB", {
        year: "numeric",
        month: "numeric",
        day: "numeric",
      }).format(new Date(date));
    } catch (error) {
      console.error("Error formatting date:", error);
      return "Invalid date";
    }
  };
const renderStatus = (status, t) => {
  let chipProps = {};
  switch (status) {
    case "Available":
      chipProps = { label: t("Statuses:Available"), style: { borderColor: "green", color: "green" }, variant: "outlined" };
      break;
    case "In use":
      chipProps = { label: t("Statuses:In use"), style: { borderColor: "blue", color: "blue" }, variant: "outlined" };
      break;
    case "Under maintenance":
      chipProps = { label: t("Statuses:Under maintenance"), style: { borderColor: "red", color: "red" }, variant: "outlined" };
      break;
    case "In delivery":
      chipProps = { label: t("Statuses:In delivery"), style: { borderColor: "orange", color: "orange" }, variant: "outlined" };
      break;
    case "In controlling":
      chipProps = { label: t("Statuses:In controlling"), style: { borderColor: "purple", color: "purple" }, variant: "outlined" };
      break;
    case "Controlled":
      chipProps = { label: t("Statuses:Controlled"), style: { borderColor: "teal", color: "teal" }, variant: "outlined" };
      break;
    case "To be controlled":
      chipProps = { label: t("Statuses:To be controlled"), style: { borderColor: "darkgoldenrod", color: "darkgoldenrod" }, variant: "outlined" };
      break;
    default:
      chipProps = { label: t("Statuses:Unknown"), style: { borderColor: "grey", color: "grey" }, variant: "outlined" };
      break;
  }
  return <Chip {...chipProps} />;
};


  const getStatusColor = (status) => {
    switch (status) {
      case 'Available':
        return 'green';
      case 'In_use':
        return 'blue';
      case 'Under_maintenance':
        return 'red';
      case 'In_delivery':
        return 'orange';
      case 'In_controlling':
        return 'purple';
      case 'Controlled':
        return 'teal';
      case 'To_be_controlled':
        return 'darkgoldenrod';
      default:
        return 'gray';
    }
  };
  
  const handleShare = () => {
    const shareData = {
      title: instrument.name,
      text: `Check out this project: ${project.name}`,
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.error("Error sharing:", err);
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "Share Link",
        text: `Your browser doesn't support sharing. Please copy the link manually.`,
        footer: `<a href="${window.location.href}" target="_blank">Copy Link</a>`,
      });
    }
  };

  const handleEditOpen = (instrumentId, currentStatus) => {
    setSelectedInstrumentId(instrumentId);
    setSelectedInstrumentStatus(currentStatus);
    setEditOpen(true);
  };

  const handleEditClose = () => {
    setEditOpen(false);
    setRefresh((prev) => !prev);
  };

  const mobileColumns = [
    {
      field: "name",
      headerName: t("columns:InstrumentName"),
      width: 200,
      renderCell: (params) => `(ID_${params.row.id}) ${params.row.name}`,
    },
    {
      field: "actions",
      headerName: t("columns:Actions"),
      width: 180,
      renderCell: (params) => (
        <div className="text-center">
          <IconButton
            size="small"
            variant="contained"
            onClick={() => handleEditOpen(params.row.id, params.row.status)}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "20%",
              padding: "5px",
              border: "1px solid #e0e0e0",
              "&:hover": { backgroundColor: "#e0e0e0" },
              marginRight: "8px",
            }}
          >
            <EditIcon style={{ color: "#424242" }} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "20%",
              padding: "5px",
              border: "1px solid #e0e0e0",
              "&:hover": { backgroundColor: "#e0e0e0" },
              marginRight: "8px",
            }}
          >
            <DeleteIcon className="text-[#d33]" />
          </IconButton>
  
          <IconButton
            onClick={() => handleShowHistory(params.row.id)}
            color="primary"
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "20%",
              padding: "5px",
              border: "1px solid #e0e0e0",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <HistoryIcon sx={{ color: "#424242" }} />
          </IconButton>
        </div>
      ),
    },
    {
      field: "status",
      headerName: t("columns:Status"),
      width: 160,
      renderCell: (params) => renderStatus(params.row.status.split("_").join(" "), t),
    },
    {
      field: "addedProjectDate",
      headerName: t("columns:DateAdded"),
      width: 150,
      renderCell: (params) => formatDate(params.row.addedProjectDate),
    },    { field: "instrumentType", headerName: t("columns:Type"), width: 150 },
  ];
  
  const desktopColumns = [
    {
      field: "name",
      headerName: t("columns:InstrumentName"),
      width: 200,
      renderCell: (params) => `(ID_${params.row.id}) ${params.row.name}`, // Updated formatting
    },
    {
      field: "addedProjectDate",
      headerName: t("columns:DateAdded"),
      width: 150,
      renderCell: (params) => formatDate(params.row.addedProjectDate),
    },    { field: "instrumentType", headerName: t("columns:Type"), width: 150 },
    {
      field: "status",
      headerName: t("columns:Status"),
      width: 160,
      renderCell: (params) => renderStatus(params.row.status.split("_").join(" "), t),
    },
    {
      field: "actions",
      headerName: t("columns:Actions"),
      width: 180,
      renderCell: (params) => (
        <div className="text-center">
          <IconButton
            size="small"
            variant="contained"
            onClick={() => handleEditOpen(params.row.id, params.row.status)}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "20%",
              padding: "5px",
              border: "1px solid #e0e0e0",
              "&:hover": { backgroundColor: "#e0e0e0" },
              marginRight: "8px",
            }}
          >
            <EditIcon style={{ color: "#424242" }} />
          </IconButton>
          <IconButton
            onClick={() => handleDelete(params.row.id)}
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "20%",
              padding: "5px",
              border: "1px solid #e0e0e0",
              "&:hover": { backgroundColor: "#e0e0e0" },
              marginRight: "8px",
            }}
          >
            <DeleteIcon className="text-[#d33]" />
          </IconButton>
  
          <IconButton
            onClick={() => handleShowHistory(params.row.id)}
            color="primary"
            sx={{
              backgroundColor: "#f5f5f5",
              borderRadius: "20%",
              padding: "5px",
              border: "1px solid #e0e0e0",
              "&:hover": { backgroundColor: "#e0e0e0" },
            }}
          >
            <HistoryIcon sx={{ color: "#424242" }} />
          </IconButton>
        </div>
      ),
    },
  ];

  const columns = isSmallScreen ? mobileColumns : desktopColumns;

  useEffect(() => {
    if (project.id) {
        dispatch({ type: ProjectsActions.START });
        fetchProject(project.id); 
    }
}, [project.id]);

const handleAssignInstruments = async () => {
  if (!selectedCar?.id || selectedInstrumentIds.length === 0) {
      console.error("Please select a car and at least one instrument.");
      return;
  }

  try {
      await carService.assignInstrumentsToCar(selectedCar.id, selectedInstrumentIds);
      const projectResponse = await projectService.getById(selectedProject.id);
      setSelectedProject(projectResponse.data); 
      //window.location.reload();

      Swal.fire({
        title: 'Instruments Loaded Successfully!',
        html: `
        <style>
      @media (max-width: 1024px) {
        .swal-container {
          width: 90% !important;
        }
      }
      @media (min-width: 1025px) {
        .swal-container {
          width: 40% !important;
        }
      }
    </style>
          <div style="display: flex; flex-direction:column; justify-content: center; align-items: center;">
            <h3>Car has been loaded with selected instruments! 🎉</h3>
            <div style="margin-top: 20px;">
              <video width="100%" height="auto" autoplay loop muted>
                <source src="/vecteezy_a-truck-moving-in-the-middle-of-a-city_54049303.mp4" type="video/mp4">
                Your browser does not support the video tag.
              </video>
            </div>
          </div>
        `,
        customClass: {
          popup: 'swal-container' 
        },
        padding: '20px',
        background: '#fff',
        confirmButtonText: "OK",

      });
      

  } catch (error) {
      console.error("Error assigning instruments:", error);
      console.log(error)
      Swal.fire({
        title: t("messages:Error"),
        text: error.response.data.message,
        icon: "error",
        timer: 2000,
      });
      // dispatch({ type: ProjectsActions.FAILURE, payload: error.message });
  }
};

if (state.loading) return <p>Loading project...</p>;
if (state.error) return <p>Error: {state.error}</p>;


  if (state.error) {
    return <div>Error loading instruments</div>;
  }

    return (
      <Box px={0} className="!px-0">
        <div className="flex flex-col lg:flex-row lg:justify-between lg:items-center mb-5">
          <div className="flex flex-row gap-2 sm:flex-row sm:gap-1">
            {/* Type Input */}
            <TextField
              label= {t("PopUp:Name")}
              variant="outlined"
              onChange={(e) => setSearchType(e.target.value)}
              value={searchType}
              className="rounded-3xl w-full sm:w-[200px]"
            />
  
            <FormControl
              variant="outlined"
              className="w-full sm:w-[200px]"
              sx={{
                display: "flex",
                flexDirection: "row",
                alignItems: "center",
                position: "relative",
              }}
            >
              <Autocomplete
                sx={{ width: 220 }}
                options={statuses}
                value={searchStatus}
                onChange={(event, newValue) => {
                  setSearchStatus(newValue);
                }}
                clearOnBlur
                handleHomeEndKeys
                renderInput={(params) => <TextField {...params} label={t("columns:Status")} />}
              />

            </FormControl>

          </div>

          <div className="flex items-center gap-3 justify-between">
            <CarSelectDropdown onSelectCar={(car) => setSelectedCar(car)} />

            <Button
              className="!bg-[#1D34D8] !rounded-3xl !normal-case !py-2 !my-4 !sm:my-0 sm:!mx-3 !min-w-40"
              startIcon={<AddIcon />}
              variant="contained"
              onClick={() => setOpenDialog(true)}
              aria-hidden
            >
              {t("PopUp:AddNewInstrument")}
            </Button>
          </div>
        </div>
        
        {selectedInstrumentIds.length > 0 && (
        <div className="flex justify-end h-12">
        <Button
        className="!rounded-3xl !normal-case !py-2 !my-1 !sm:my-0 !mr-3 w-full sm:w-auto"
        startIcon={<LocalShippingOutlinedIcon />}
          variant="contained"
          onClick={() => handleAssignInstruments()}
          disabled={!selectedCar || selectedInstrumentIds.length === 0}
          sx={{
            backgroundColor: !selectedCar || selectedInstrumentIds.length === 0 ? "#b0b0b0" : "#1D34D8",
            color: "white",
            "&:hover": {
            },
             cursor: !selectedCar || selectedInstrumentIds.length === 0 ? "not-allowed" : "pointer",
          }}
          aria-hidden
        >
          {t("loadToCar")}
        </Button>

        </div>
      )}

        <Paper
          className="!mt-4 !sm:mt-0 !h-full"
          sx={{
            overflowX: "hidden",
            maxWidth: "100vw",
            
          }}
        >
          <Box
            sx={{
              width: "100%",
            }}
          >
            <DataGrid
              className="max-w-[100vw]"
              rows={filteredInstruments}
              columns={columns}
              initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
              pageSizeOptions={[20, 40]}
              checkboxSelection
              disableSelectionOnClick
              isRowSelectable={(params) => !params.row.carId}
              onRowSelectionModelChange={(newSelection) => {
                setSelectedInstrumentIds(newSelection); 
                //console.log("Selected Instruments:", newSelection); 
              }}
              sx={{
                border: 0,
                minWidth: 200,
                overflowX: "auto",
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                },
                "& .MuiDataGrid-columnHeader": {
                  display: "flex",
                  alignItems: "center",
                },
              }}
              getRowId={(row) => row.id}
            />
          </Box>
        </Paper>
  
        {/* Dialog for Adding New Instrument */}
        <Dialog
          open={openDialog}
          onClose={() => setOpenDialog(false)}
          PaperProps={{
            style: {
              borderRadius: 20,
              backgroundColor: "#fcfcfc",
            },
          }}
        >
          <DialogTitle className="!font-medium">{t("PopUp:Select instrument for adding project")}</DialogTitle>
          <DialogContent>
          <FormControl fullWidth margin="dense" error={instrumentError}>
          <InputLabel>{t("PopUp:SelectInstrument")}</InputLabel>
          <Select
            value={selectedInstrumentId}
            onChange={(e) => {
              setSelectedInstrumentId(e.target.value);
              setInstrumentError(false);
            }}
            label="Select Instrument"
          >
            {allInstruments.map((instrument) => (
              <MenuItem key={instrument.id} value={instrument.id}>
                {instrument.name}
              </MenuItem>
            ))}
          </Select>
            {instrumentError && <FormHelperText>{t("Please select an instrument.")}</FormHelperText>}
          </FormControl>
  
          <FormControl fullWidth margin="dense" error={managerError}>
            <InputLabel id="project-manager-label">{t("Project_Manager")}</InputLabel>
            <Select
              labelId="project-manager-label"
              value={selectedManager}
              onChange={(e) => {
                setSelectedManager(e.target.value);
                setManagerError(false);
              }}
              label={t("Project_Manager")}
            >
              {projectManagers.map((manager) => (
                <MenuItem key={manager.id} value={manager.id}>
                  {manager.name} {manager.lastName}
                </MenuItem>
              ))}
            </Select>
            {managerError && <FormHelperText>{t("Please select a project manager.")}</FormHelperText>}
          </FormControl>
  
  
            {/* Count Input */}
            <FormControl fullWidth margin="dense">
              <TextField
                type="number"
                label={t("PopUp:InstrumentCount")}
                value={instrumentCount}
                onChange={(e) => setInstrumentCount(e.target.value)}
                inputProps={{ min: 1 }}
              />
            </FormControl>
  
            {/* <AddInstrumentWithQr
              onComplete={(instrumentId) => {
                console.log("asdsas")
                console.log(instrumentId)
                if (!allInstruments?.find((x) => x?.id == instrumentId)) {
                  Swal.fire(`Not Found ${instrumentId}`, `Invalid QR Code ${JSON.stringify(allInstruments)}, `);
                  return;
                }
                console.log(selectedInstrumentId)
                setSelectedInstrumentId(instrumentId);
              }}
            /> */}
          <AddInstrumentWithQr
            onComplete={(instrumentId) => {
              console.log("Scanned Instrument ID:", instrumentId);
              console.log("All Instruments List:", allInstruments);

              if (!Array.isArray(allInstruments)) {
                console.error("allInstruments is not an array:", allInstruments);
                Swal.fire("Error", "Instrument list is not available.", "error");
                return;
              }

              // if (!allInstruments?.find((x) => x?.id == instrumentId)) {
              //   Swal.fire(
              //     `Not Found: ${instrumentId}`,
              //     `Invalid QR Code. Instrument not found in the list.`,
              //     "error"
              //   );
              //   return;
              // }

              console.log("Setting selected instrument:", instrumentId);
              setSelectedInstrumentId(instrumentId);
            }}
          />

          </DialogContent>
          <DialogActions className="!px-6">
            <Button onClick={() => setOpenDialog(false)} className="!text-[#1D34D8]">
              {t("PopUp:Cancel")}
            </Button>
            <Button onClick={handleAddInstrument} variant="contained" className="!bg-[#1D34D8]">
              {t("PopUp:Add")}
            </Button>
          </DialogActions>
        </Dialog>
  
        {/* QR Code Dialog */}
        <Dialog
          open={openQRDialog}
          onClose={handleCloseQRDialog}
          fullWidth
          maxWidth="xs"
          PaperProps={{
            style: {
              borderRadius: 20,
              //height: "500px",
              backgroundColor: "#fcfcfc",
            },
          }}
        >
          <DialogTitle>
            {t("PopUp:InstrumentInfo")}
            <IconButton
              className="!text-[#1D34D8]"
              aria-label="close"
              onClick={handleCloseQRDialog}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
              }}
            >
              <CancelOutlinedIcon />
            </IconButton>
            <div className="text-sm text-gray-500 mt-3">
              {t("PopUp:Scan Qr to get more information about the history of instrument you want")}
            </div>
          </DialogTitle>
  
          <DialogContent>
            <Box display="flex" justifyContent="space-between" alignItems="center">
              <Typography variant="body1">{t("PopUp:Instrument details")}</Typography>
  
              <Button
                className="!text-[#1D34D8] !rounded-xl"
                startIcon={<ShareIcon />}
                onClick={handleShare}
                sx={{ textTransform: "none", fontWeight: "bold" }}
              >
                {t("PopUp:Share")}
              </Button>
            </Box>
            <Box my={2}>
              <div className="border rounded-xl px-3">
                <div className="grid grid-cols-2">
                  <div className="flex flex-col justify-between ">
                    <div className="flex flex-col text-start">
                      <h5 className="mt-2 text-gray-500 font-medium">{t("PopUp:Instrument QR:")}</h5>
                      <p className="mt-2 text-gray-500">{t("PopUp:Scan Qr to get more information")}</p>
                    </div>
                    <div className="">
                      <Button
                        className="!rounded-3xl !m-3 !text-black"
                        onClick={handlePrint}
                        sx={{
                          fontWeight: "bold",
                          textTransform: "none",
                          border: "2px solid black",
                          borderRadius: "30px",
                          padding: "8px 16px",
                        }}
                      >
                        {t("PopUp:Print QR Code")}
                      </Button>
                    </div>
                  </div>
  
                  <div className="flex justify-center items-center">
                    <img
                      className="border-[25px] rounded-xl my-5"
                      src={`${process.env.REACT_APP_DOCUMENT_URL}/${qrImage}`}
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
          {t("PopUp:InstrumentHistory")}
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
                <Box mb={2} p={2} sx={{ borderRadius: 3 }} className="block sm:!hidden !w-full !p-0">
                <Typography variant="h6" className=" block sm:!hidden">
                {t("columns:Status")}: <StatusButton text={instrument.status.split('_').join(' ')} color={getStatusColor(instrument.status)} />
                </Typography>
                </Box>
  
                <Typography variant="h6" dividers>{t("PopUp:Details")}</Typography>
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
              <Typography variant="body2" className='text-gray-500'> {t("messages:Nothing here yet...")}</Typography>
            )}
          </DialogContent>
        </Dialog>
  
        <InstrumentStatusModal
          instrumentId={selectedInstrumentId}
          currentStatus={selectedInstrumentStatus}
          open={editOpen}
          onClose={handleEditClose}
        />
      </Box>
    );
  }
// }
