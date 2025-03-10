import { useState } from "react";
import { carService } from "../../APIs/Services/car.service"; 
import { Dialog, DialogActions, DialogContent, DialogTitle, Button, TextField, IconButton } from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";

const AddCarPopup = ({ open, onClose, onCarAdded }) => {
  const [vehicleNumber, setVehicleNumber] = useState("");
  const [driverFullName, setDriverFullName] = useState("");
  const [note, setNote] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleAddCar = async () => {
    if (!vehicleNumber.trim()) {
      setError("Vehicle number is required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const newCar = {
        vehicleNumber,
        driverFullName,
        note,
      };

      await carService.add(newCar);
      onCarAdded(); 
      onClose();
    } catch (err) {
      setError(err.response?.data || "Failed to add car.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: 20,
          height: "390px",
          backgroundColor: "#fcfcfc",
        },
      }}>
      <DialogTitle>Add New Car
        <IconButton
            className="!text-[#1D34D8]"
            aria-label="close"
            onClick={onClose}
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
          label="Vehicle Number"
          fullWidth
          margin="dense"
          value={vehicleNumber}
          onChange={(e) => setVehicleNumber(e.target.value)}
          required
        />
        <TextField
          label="Driver Full Name"
          fullWidth
          margin="dense"
          value={driverFullName}
          onChange={(e) => setDriverFullName(e.target.value)}
        />
        <TextField
          label="Note"
          fullWidth
          multiline
          rows={3}
          margin="dense"
          value={note}
          onChange={(e) => setNote(e.target.value)}
        />
        {error && <p style={{ color: "red" }}>{error}</p>}
      </DialogContent>
      <DialogActions>
        <Button  onClick={onClose}> Cancel </Button>
        <Button onClick={handleAddCar} variant="contained"
            className='!bg-[#1D34D8]'            
            disabled={loading}>
          {loading ? "Adding..." : "Add Car"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default AddCarPopup;
