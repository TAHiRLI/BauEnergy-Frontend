import React, { useEffect, useState } from "react";
import { carService } from "../../APIs/Services/car.service";
import { Card, CardContent, Typography, CircularProgress, Button } from "@mui/material";
import { useProjects, ProjectsActions } from "../../context/projectContext";
import { Add as AddIcon, Share as ShareIcon } from "@mui/icons-material";

export default function CarTab( {project} ) {
    const [carIds, setCarIds] = useState([]);
    const [loading, setLoading] = useState(true);
    const [instruments, setInstruments] = useState([]); 
    const { carId, setCarId } = useState(null);

    const formattedInstruments = project.instruments.map(i => ({
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

    useEffect(() => {
        const fetchDistinctCarIds = async () => {
            if (!project?.instruments || project.instruments.length === 0) {
                console.error("No instruments available to send.");
                setLoading(false);
                return;
            }
    
            try {
                const response = await carService.getDistinctCarIds(formattedInstruments);
                setCarIds(response.data);
            } catch (error) {
                console.error("Error fetching distinct car IDs:", error.response?.data || error.message);
            } finally {
                setLoading(false);
            }
        };
    
        fetchDistinctCarIds();
    }, [project?.instruments]);
    
    const handleUnassign = async (carId) => {
        if (!carId) return;

        setLoading(true);
        try {
            const response = await carService.unassignInstruments(carId);
            alert(response.data.message); 
        } catch (error) {
            console.error("Error unassigning instruments:", error);
            alert(error.response?.data || "Failed to unassign instruments.");
        } finally {
            setLoading(false);
        }
    };
    return (
        <div style={{ padding: "16px" }}>
            <Typography variant="h5">Used cars</Typography>
            {loading ? (
                <CircularProgress />
            ) : (
                carIds.length > 0 ? (
                    carIds.map((carId) => (
                        <Card key={carId} style={{ marginBottom: "8px", padding: "5px", backgroundColor: "#f9f9f9" }}>
                            <CardContent className="!flex items-center justify-between">
                                <Typography variant="h6">Car Id: {carId}</Typography>
                                <Button
                                    className="!bg-[#1D34D8] !rounded-3xl !normal-case !py-2 !my-2 !sm:my-0 !mr-3 !min-w-40"
                                    //startIcon={<AddIcon />}
                                    variant="contained"
                                    onClick={() => handleUnassign(carId)}
                                    aria-hidden
                                    >
                                    Unload
                                    </Button>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <Typography>No distinct car IDs found.</Typography>
                )
            )}
        </div>
    );
}
