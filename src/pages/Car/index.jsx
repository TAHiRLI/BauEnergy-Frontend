import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, useMediaQuery, IconButton, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from "react-i18next";
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/authContext';
import { carService } from '../../APIs/Services/car.service';
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from 'sweetalert2';
import EditIcon from "@mui/icons-material/Edit";
import EditCarPopup from '../../components/Dialogs/CarEditDialog';
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const Cars = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); 
    const decodedToken = user?.token ? jwtDecode(user.token) : null;
    const isAdmin = decodedToken?.["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]?.includes("Company_Owner");

    const isExtraSmall = useMediaQuery("(max-width:380px)");
    
    const [loading, setLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedCarId, setSelectedCarId] = useState(null);
    const [vehicleNumber, setVehicleNumber] = useState("");
    const [driverFullName, setDriverFullName] = useState("");
    const [note, setNote] = useState("");
    const [dialogError, setDialogError] = useState("");

    const fetchCars = async () => {
        try {
            const response = await carService.getAll(); 
            setCars(response.data);
        } catch (error) {
            console.error("Error fetching cars:", error);
        } finally {
            setLoading(false);
        }
    };
    
    useEffect(() => {
        fetchCars();
    }, []);

    const handleAddCar = async () => {
      if (!vehicleNumber.trim()) {
          setDialogError("Vehicle number is required.");
          return;
      }
  
      setLoading(true);
      setDialogError("");
  
      try {
          await carService.add({ vehicleNumber, driverFullName, note });
          fetchCars(); 
          setOpenPopup(false);
          setVehicleNumber("");
          setDriverFullName("");
          setNote("");
  
          Swal.fire({
              title: t('messages:Success'),
              text: t('messages:Car added successfully!'),
              icon: "success",
              confirmButtonColor: "#1D34D8",
          });
  
      } catch (error) {
          setDialogError(error.response?.data || "Failed to add car.");
          Swal.fire({
              title: "Error!",
              text: "Failed to add car.",
              icon: "error",
              confirmButtonColor: "#d33",
          });
      } finally {
          setLoading(false);
      }
  };
  

    const handleDeleteCar = async (id) => {
        Swal.fire({
            title: t('PopUp:Areyousure?'),
            text: t("messages:YouWon'tBeAbleToRevertThis!"),
            icon: "warning",
            showCancelButton: true,
            confirmButtonColor: "#1D34D8",
            cancelButtonColor: "#d33",
            confirmButtonText: t('PopUp:Yes,deleteit'),
            cancelButtonText: t('PopUp:Cancel')
        }).then(async (result) => {
            if (result.isConfirmed) {
                try {
                    await carService.remove(id);
                    Swal.fire("Deleted!", "The car has been deleted.", "success");
                    fetchCars(); 
                } catch (error) {
                    Swal.fire("Error!", "Failed to delete the car.", "error");
                }
            }
        });
    };

    const handleOpenEdit = (carId) => {
      setSelectedCarId(carId);
      setEditOpen(true);
    };
    
    const handleCloseEdit = () => {
      setEditOpen(false);
    };

    const columns = [
        { field: 'vehicleNumber', headerName: t("columns:VehicleNumber"), width: 150 },
        { field: 'driverFullName', headerName: t("columns:DriverName"), width: 180 },
        { field: 'note', headerName: t("columns:Note"), width: 200 },
        {
            field: "actions",
            headerName: t("columns:Actions"),
            width: 100,
            renderCell: (params) => (
              <>
                <div className="text-center">
                   <IconButton
                      size="small"
                      variant="contained"
                      onClick={() => handleOpenEdit(params.row.id)}
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
                    onClick={() => handleDeleteCar(params.row.id)}
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
                </div>
              </>
            ),
          },
    ];

    if (loading)
        return (
            <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                <CircularProgress />
            </Box>
        );  
    
    return (
        <>
          <Box sx={{ height: "auto", width: '100%' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="text-2xl sm:text-3xl font-semibold mb-4 mt-4 sm:my-0">{t("listOfCars")}</span>
                <div className={`flex ${isExtraSmall ? "flex-col" : "flex-row"} 
                    items-start gap-4 justify-between w-full sm:w-auto`}>
                    <Box className="flex w-full"
                        sx={{
                        flexDirection: { xs: "column", sm: "row" },
                        gap: 2,
                        }} >
    
                        {isAdmin && (
                        <Button
                            variant="contained"
                            className="!bg-[#1D34D8] !rounded-3xl !ml-0 md:!ml-3 !py-2 !w-full"
                            sx={{
                            width: { xs: "100%", sm: "48%" },
                            textTransform: "none",
                            }}
                            onClick={() => setOpenPopup(true)}
                            >
                            {t("addCar")}
                        </Button>
                        )}
                    </Box>
                </div>
            </div>
    
            <Paper
                  className='!mt-4 !sm:mt-0'
                      sx={{
                      width: '100%',
                      overflowX: 'hidden',
                      maxWidth: '100vw',
                      }}
                  >
                      <Box
                      sx={{
                          width: '100%',
                          //overflowX: { xs: 'auto', sm: 'hidden' },
                      }}
                      >
                      <DataGrid
                          className="!max-w-[80vw]"
                          rows={cars}
                          columns={columns}
                          initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
                          pageSizeOptions={[50, 100, 200]}
                          sx={{
                          border: 0,
                          minWidth: 200,
                          height: 'auto',
                          '& .MuiDataGrid-root': {
                              overflowX: 'auto',
                          },
                          '& .MuiDataGrid-cell': {
                              display: 'flex', 
                              alignItems: 'center', 
                              whiteSpace: 'nowrap',
                              overflow: 'hidden',
                              textOverflow: 'ellipsis',
                              textAlign: 'center', 
                          },
                          '& .MuiDataGrid-columnHeader': {
                              textAlign: 'center', 
                              justifyContent: 'center', 
                          },
                          '& .MuiDataGrid-footerContainer':{
                              justifyContent: 'flex-start'
                          }
                          }}
                          getRowId={(row) => row.id}
                      />
                      </Box>
            </Paper>
          </Box>

          <Dialog open={openPopup} onClose={() => setOpenPopup(false)} maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: 20,
          height: "390px",
          backgroundColor: "#fcfcfc",
        },
      }}>
      <DialogTitle>{t("addNewCar")}
        <IconButton
            className="!text-[#1D34D8]"
            aria-label="close"
            onClick={() => setOpenPopup(false)}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
      </DialogTitle>
      <DialogContent>
        <TextField
          label={t("columns:VehicleNumber")}
          fullWidth
          margin="dense"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          required
        />
        <TextField
          label={t("columns:DriverFullName")}
          fullWidth
          margin="dense"
          value={driverFullName}
          onChange={(e) => setDriverFullName(e.target.value)}
        />
        <TextField
          label={t("columns:Note")}
          fullWidth
          multiline
          rows={3}
          margin="dense"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {dialogError && <p style={{ color: "red" }}>{dialogError}</p>}
      </DialogContent>
      <DialogActions>
        <Button  onClick={() => setOpenPopup(false)}> {t("PopUp:Cancel")} </Button>
        <Button onClick={handleAddCar} variant="contained"
            className='!bg-[#1D34D8]'            
            disabled={loading}>
          {loading ? "Adding..." : t("addCar")}
        </Button>
      </DialogActions>
          </Dialog>

          <EditCarPopup open={editOpen} onClose={() => setEditOpen(false)} carId={selectedCarId} />
        </>
    );
};

export default Cars;
