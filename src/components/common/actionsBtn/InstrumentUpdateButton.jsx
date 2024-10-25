import React, { useState } from "react";
import { IconButton, Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import { instrumentService } from "../../../APIs/Services/instrument.service";

const InstrumentStatusButton = ({ instrumentId, currentStatus }) => {
  const [open, setOpen] = useState(false);
  const [status, setStatus] = useState(currentStatus);

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const statusMap = {
    "Available": 0,
    "In use": 1,
    "Under maintenance": 2,
  };

  const statuses = Object.keys(statusMap);

  const handleStatusChange = (event) => {
    setStatus(event.target.value);
  };

  const handleSubmit = async () => {
    try {
      const statusValue = statusMap[status];
  
      // Construct the payload for the request body with correct field names
      const payload = { 
        status: statusValue // Use lowercase 'status' as expected by the backend
      };
  
      const response = await instrumentService.updateStatus(instrumentId, payload);
      console.log(response);
      
      // Check response status correctly
      if (response.status === 200) {
        console.log("Status updated successfully.");

        setOpen(false); // Close the modal on success
      } else {
        console.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Error while updating status:", error);
    }

    
  };

  return (
    <>
      <IconButton
        onClick={handleClickOpen}
        sx={{
          backgroundColor: "#f5f5f5",
          borderRadius: "20%",
          padding: "5px",
          border: "1px solid #e0e0e0",
          "&:hover": { backgroundColor: "#e0e0e0" },
          marginRight: "8px"
        }}
      >
        <EditIcon sx={{ color: "#424242" }} />
      </IconButton>

      <Dialog open={open} onClose={handleClose} PaperProps={{
          style: {
            borderRadius: 20,
            //height: "500px",
            backgroundColor: "#fcfcfc"  
          },
        }}>
        <DialogTitle>Change Instrument Status</DialogTitle>
        <DialogContent>
          <FormControl fullWidth margin="dense">
            <InputLabel id="status-label">Change Instrument Status</InputLabel>
            <Select
              labelId="status-label"
              value={status}
              onChange={handleStatusChange}
              label="Change Instrument Status"
            >
              {statuses.map((statusOption) => (
                <MenuItem key={statusOption} value={statusOption}>
                  {statusOption}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions className="!px-6">
        <Button onClick={handleClose} className='!text-[#1D34D8] '>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" className='!bg-[#1D34D8] '>
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default InstrumentStatusButton;
