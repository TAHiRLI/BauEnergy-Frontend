import React, { useEffect, useState } from "react";
import { carService } from "../../APIs/Services/car.service";
import { Card, CardContent, Typography, CircularProgress, Button, Box, Dialog, DialogTitle, DialogContent, ListItem, ListItemText, List,  IconButton,
} from "@mui/material";
import { useProjects } from "../../context/projectContext";
import { projectService } from "../../APIs/Services/project.service";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import Swal from "sweetalert2";

export default function CarTab( ) {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const { carId, setCarId } = useState(null);
    const {selectedProject, setSelectedProject} = useProjects();
    const [openCarDialog, setOpenCarDialog] = useState(false);
    const [selectedCarInstruments, setSelectedCarInstruments] = useState([]);

    
    useEffect(() => {
        const formattedInstruments = selectedProject.instruments.map(i => ({
            id: i.id,
            name: i.name || "",
            description: i.description || "",
            shortDesc: i.shortDesc || "",
            status: i.status || "",
            qrImage: i.qrImage || "",
            approvalStatus: i.approvalStatus || null,
            price: i.price || 0,
            count: i.count || 0,
            usedInstrumentsCount: i.usedInstrumentsCount || 0,
            addedProjectDate: i.addedProjectDate || null,
            projectId: i.projectId || null,
            projectName: i.projectName || "",
            instrumentType: i.instrumentType || "",
            image: i.image || "",
            carId: i.carId || null,
        
            documents: i.documents ? i.documents : [], 
            tags: i.tags ? i.tags : [],
        }));

        const fetchDistinctCarIds = async () => {
            // if (!project?.instruments || project.instruments.length === 0) {
            //     console.error("No instruments available to send.");
            //     setLoading(false);
            //     return;
            // }
    
            try {
                const response = await carService.getDistinctCarIds(formattedInstruments);
                setCars(response.data);

            } catch (error) {
                console.error("Error fetching distinct car IDs:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchDistinctCarIds();
    }, [selectedProject]);
    
    const handleUnassign = async (carId) => {
        if (!carId) return;

        setLoading(true);
        try {
            const response = await carService.unassignInstruments(carId);
            const projectResponse = await projectService.getById(selectedProject.id);
            setSelectedProject(projectResponse.data); 

            Swal.fire({
                title: "Success!",
                text: "All instruments have been unloaded from the car.",
                icon: "success",
                confirmButtonText: "OK",
            });
        } catch (error) {
            console.error("Error unassigning instruments:", error);
            alert(error.response?.data || "Failed to unassign instruments.");
        } finally {
            setLoading(false);
        }
    };

    const handleShowInstruments = (instruments) => {
        setSelectedCarInstruments(instruments);
        setOpenCarDialog(true);
    };

    return (
        <div style={{ padding: "16px" }}>
            <Typography variant="h5">Used cars</Typography>
            {loading ? (
                <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
                    <CircularProgress />
                </Box>
            ) : (
                cars.length > 0 ? (
                    cars.map((car) => (
                        <Card key={carId} style={{ marginBottom: "8px", padding: "5px", backgroundColor: "#f9f9f9", borderRadius: "15px" }}>
                            <CardContent className="!flex items-center justify-between">
                                <Typography variant="h6">Car: {car.vehicleNumber}</Typography>
                                <Box>
                                    <Button
                                        className="!bg-[#1D34D8] !rounded-3xl !normal-case !py-2 !my-2 !sm:my-0 !mr-3 !min-w-40"
                                        //startIcon={<AddIcon />}
                                        variant="contained"
                                        onClick={() => handleShowInstruments(car.instruments)}                                    
                                        aria-hidden
                                        >
                                        Show instruments
                                    </Button>
                                    <Button
                                        className="!bg-red-600 !rounded-3xl !normal-case !py-2 !my-2 !sm:my-0 !mr-3 !min-w-40"
                                        //startIcon={<AddIcon />}
                                        variant="contained"
                                        onClick={() => handleUnassign(car.id)}
                                        aria-hidden
                                        >
                                        Unload
                                    </Button>
                                </Box>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography>No car found in this project.</Typography>
                )
            )}

            {/* Car instrument Dialog */}
            <Dialog open={openCarDialog} onClose={() => setOpenCarDialog(false)}
                 fullWidth
                 maxWidth="xs"
                 PaperProps={{
                   style: {
                     borderRadius: 20,
                     height: "400px",
                     backgroundColor: "#fcfcfc",
                   },
                 }}>
                <DialogTitle>
                    <Typography>
                        Instruments in Selected Car
                        <IconButton
                            className="!text-[#1D34D8]"
                            aria-label="close"
                            onClick={() => setOpenCarDialog(false) }
                            sx={{
                            position: "absolute",
                            right: 8,
                            top: 8,
                            }}
                        >
                            <CancelOutlinedIcon />
                        </IconButton>
                    </Typography>
                </DialogTitle>
                <DialogContent>
                    <List>
                        {selectedCarInstruments.map((instrument) => (
                        <ListItemText primary={`(ID_${instrument.id}) ${instrument.name}`} secondary={instrument.description} 
                        />
                        ))}
                    </List>
                </DialogContent>
            </Dialog>
        </div>
    );
}
