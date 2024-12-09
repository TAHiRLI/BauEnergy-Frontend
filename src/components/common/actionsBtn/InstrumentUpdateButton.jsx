import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { instrumentService } from "../../../APIs/Services/instrument.service";

const InstrumentStatusModal = ({ instrumentId, currentStatus, open, onClose }) => {
  const statusMap = {
    //"Available": 0,
    "In use": 1,
    "Under maintenance": 2,
    //"In Delivery": 3,
    "In controlling": 4,
    "Controlled": 5,
    "To be controlled": 6,
  };

  const statuses = Object.keys(statusMap);
  const [status, setStatus] = useState(statuses.includes(currentStatus.split("_").join(" ")) ? currentStatus.split("_").join(" ") : statuses[0]);

  useEffect(() => {
    if (statuses.includes(currentStatus)) {
      setStatus(currentStatus);
    }
  }, [currentStatus]);

  const handleStatusChange = (event) => {
    const newStatus = event.target.value;
    setStatus(newStatus);
  };

  const handleSubmit = async () => {
    try {
      const statusValue = statusMap[status];
      const payload = { status: statusValue };
      const response = await instrumentService.updateStatus(instrumentId, payload);
      if (response.status === 200) {
        console.log("Status updated successfully.");
        onClose();
      } else {
        console.error("Failed to update status.");
      }
    } catch (error) {
      console.error("Error while updating status:", error);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      PaperProps={{
        style: {
          borderRadius: 20,
          backgroundColor: "#fcfcfc",
        },
      }}
    >
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
        <Button onClick={onClose} className="!text-[#1D34D8]">
          Cancel
        </Button>
        <Button onClick={handleSubmit} variant="contained" className="!bg-[#1D34D8]">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstrumentStatusModal;
