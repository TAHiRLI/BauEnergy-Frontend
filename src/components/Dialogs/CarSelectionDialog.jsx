import React, { useEffect, useState } from 'react';
import { Modal, Box, Button, Typography } from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { carService } from '../../APIs/Services/car.service';
import { t } from 'i18next';

const CarSelectionPopup = ({ open, onClose, onSelectCar, projectId }) => {
    const [cars, setCars] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedCar, setSelectedCar] = useState(null);

    useEffect(() => {
        if (open) {
            fetchCars();
        }
    }, [open]);

    const fetchCars = async () => {
        try {
            const response = await carService.getAllAvailable();
            setCars(response.data);
        } catch (error) {
            console.error("Error fetching cars:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelect = (car) => {
        setSelectedCar(car); 

        const payload = {
            projectId: projectId, 
        };

        console.log(car)
        console.log(payload)
        setLoading(true);
        try {
        const response = carService.edit(car.id, payload )
        } catch (error) {
            console.error("Error updating car:", error);
        } finally {
            setLoading(false);
        }

    };

    return (
        <Modal open={open} onClose={onClose}>
            <Box
                sx={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    width: 600,
                    bgcolor: 'background.paper',
                    boxShadow: 24,
                    p: 4,
                    borderRadius: 2,
                }}
            >
                <Typography variant="h6" mb={2}>
                    {t("selectCar")}
                </Typography>

                {loading ? (
                    <Typography>{t("Loading")}</Typography>
                ) : (
                    cars.map((car) => (
                        <Button
                            key={car.id}
                            variant="outlined"
                            fullWidth
                            sx={{ mb: 1 }}
                            onClick={() => handleSelect(car)}
                        >
                            {car.vehicleNumber}
                        </Button>
                    ))
                )}

                <Box mt={2} display="flex" justifyContent="space-between">
                    <Button onClick={onClose} variant="outlined">{t("PopUp:Cancel")}</Button>
                    <Button onClick={handleSelect} variant="contained" disabled={!selectedCar}>
                        {t("selectCar")}
                    </Button>
                </Box>
            </Box>
        </Modal>
    );
};

export default CarSelectionPopup;
