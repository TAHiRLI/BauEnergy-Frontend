import React, { useEffect, useState } from 'react';
import { Box, Typography, CircularProgress, Paper, Button, useMediaQuery, IconButton, } from "@mui/material";
import { DataGrid } from '@mui/x-data-grid';
import { useTranslation } from "react-i18next";
import { jwtDecode } from 'jwt-decode';
import { useAuth } from '../../context/authContext';
import { carService } from '../../APIs/Services/car.service';
import AddCarPopup from "../../components/Dialogs/AddCarDialog";
import DeleteIcon from "@mui/icons-material/Delete";
import Swal from 'sweetalert2';
import { useProjects } from '../../context/projectContext';
import EditIcon from "@mui/icons-material/Edit";
import EditCarPopup from '../../components/Dialogs/CarEditDialog';

const Cars = () => {
    const { t } = useTranslation();
    const { user } = useAuth(); 
    const decodedToken = user?.token ? jwtDecode(user.token) : null;
    var isAdmin = false
    const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || []; 
    if (userRoles.includes("Company_Owner")) {
        isAdmin = true;}

    const isExtraSmall = useMediaQuery("(max-width:380px)");

    const [loading, setLoading] = useState(true);
    const [cars, setCars] = useState([]);
    const [openPopup, setOpenPopup] = useState(false);
    const [refresh, setRefresh] = useState(false);
    const [editOpen, setEditOpen] = useState(false);
    const [selectedCarId, setSelectedCarId] = useState(null);


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

    const columns = [
        { field: 'vehicleNumber', headerName: 'Vehicle Number', width: 150 },
        { field: 'driverFullName', headerName: 'Driver Name', width: 180 },
        { field: 'note', headerName: 'Note', width: 200 },
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

    const handleCarAdded = () => {
        setRefresh(!refresh); 
      };
    
    const handleDeleteCar = async (id) => {
        Swal.fire({
          title: "Are you sure?",
          text: "You won't be able to revert this!",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#1D34D8",
        cancelButtonColor: "#d33",
          confirmButtonText: "Yes, delete it!",
        }).then(async (result) => {
          if (result.isConfirmed) {
            try {
              await carService.remove(id);
              Swal.fire("Deleted!", "The car has been deleted.", "success");
              fetchCars(); 
            } catch (error) {
              Swal.fire("Error!", "Failed to delete the car.", "error");
              console.error("Error deleting car:", error);
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

    if (loading)
        return (
          <Box
            display="flex"
            justifyContent="center"
            alignItems="center"
            height="100vh"
          >
            <CircularProgress />
          </Box>
    );  
    

    return (
      <>
        <Box sx={{ height: 400, width: '100%' }}>
            <div className="flex flex-col sm:flex-row justify-between items-center">
                <span className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-0">List of Cars</span>
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
                            Add Car
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
    
            <AddCarPopup
                open={openPopup}
                onClose={() => setOpenPopup(false)}
                onCarAdded={handleCarAdded}
            />
        </Box>
    
        <EditCarPopup open={editOpen} onClose={handleCloseEdit} carId={selectedCarId} 
        //onCarUpdated={handleCarUpdated} 
        />
      </>
    );
  };
  
  export default Cars;