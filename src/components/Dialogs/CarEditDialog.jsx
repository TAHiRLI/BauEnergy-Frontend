import React, { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  CircularProgress,
  Typography,
  IconButton,
} from "@mui/material";
import Swal from "sweetalert2";
import { carService } from "../../APIs/Services/car.service";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const EditCarPopup = ({ open, onClose, carId }) => {
        
  const [carData, setCarData] = useState({
    vehicleNumber: "",
    driverFullName: "",
    note: "",
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && carId) {
      fetchCarDetails();
    }
  }, [open, carId]);

  const fetchCarDetails = async () => {
    setLoading(true);
    try {
      const response = await carService.getById(carId);
      setCarData({
        vehicleNumber: response.data.vehicleNumber,
        driverFullName: response.data.driverFullName,
        note: response.data.note || "",
      });
    } catch (error) {
      console.error("Error fetching car details:", error);
      Swal.fire("Error", "Failed to fetch car details", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCarData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await carService.edit(carId, carData);
      Swal.fire({
        title: "Success!",
        text: "Car updated successfully!",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        window.location.reload();
      });
    } catch (error) {
      console.error("Error updating car:", error);
      Swal.fire("Error", error.response?.data || "Failed to update car", "error");
    } finally {
      setLoading(false);
    }
  };
  

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm"
    PaperProps={{
        style: {
          borderRadius: 20,
          height: "420px",
          backgroundColor: "#fcfcfc",
        },
      }}>
      <DialogTitle>
      <Typography>
        Edit Car
        <IconButton
                className="!text-[#1D34D8]"
                aria-label="close"
                onClick={() => onClose() }
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
        {loading ? (
          <CircularProgress />
        ) : (
          <form onSubmit={handleSubmit}>
            <TextField
              label="Vehicle Number"
              name="vehicleNumber"
              value={carData.vehicleNumber}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Driver Full Name"
              name="driverFullName"
              value={carData.driverFullName}
              onChange={handleChange}
              fullWidth
              required
              margin="normal"
            />
            <TextField
              label="Note"
              name="note"
              value={carData.note}
              onChange={handleChange}
              fullWidth
              multiline
              rows={3}
              margin="normal"
            />
          </form>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" className='!bg-[#1D34D8]' disabled={loading}>
          {loading ? "Updating..." : "Update"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditCarPopup;
