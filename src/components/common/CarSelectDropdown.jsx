import React, { useEffect, useState } from "react";
import { FormControl, MenuItem, Select, InputLabel, CircularProgress, Box } from "@mui/material";
import { carService } from "../../APIs/Services/car.service";
 
const CarDropdown = ({ onSelectCar }) => {
  const [availableCars, setAvailableCars] = useState([]);
  const [selectedCar, setSelectedCar] = useState("");
  const [loading, setLoading] = useState(true);


  useEffect(() => {
    const fetchAvailableCars = async () => {
      try {
        const response = await carService.getAllAvailable();
        setAvailableCars(response.data);
      } catch (error) {
        console.error("Error fetching cars:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAvailableCars();
  }, []);

  const handleChange = (event) => {
    const selectedCar = event.target.value;
    setSelectedCar(selectedCar);
    onSelectCar(selectedCar);
  };

  return (
    <FormControl >
      <InputLabel>Select Car</InputLabel>
      {loading ? (
        <Box display="flex" justifyContent="center" alignItems="center" height={50}>
          <CircularProgress size={24} />
        </Box>
      ) : (
        <Select value={selectedCar} onChange={handleChange} className="min-w-40" label="Select Car"
>
          {availableCars.length > 0 ? (
            availableCars.map((car) => (
              <MenuItem key={car.id} value={car}>
                {car.vehicleNumber}
              </MenuItem>
            ))
          ) : (
            <MenuItem disabled>No Cars Available</MenuItem>
          )}
        </Select>
      )}
    </FormControl>
  );
};

export default CarDropdown;
