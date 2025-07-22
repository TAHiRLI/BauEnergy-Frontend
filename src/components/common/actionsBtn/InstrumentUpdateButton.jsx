import React, { useState, useEffect } from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel } from "@mui/material";
import { instrumentService } from "../../../APIs/Services/instrument.service";
import Swal from "sweetalert2";
import { useTranslation } from "react-i18next";

const InstrumentStatusModal = ({ instrumentId, currentStatus, open, onClose }) => {

  const { t } = useTranslation();

  const statusMap = {
    //"Available": 0,
    "In use": 1,
    "Under maintenance": 2,
    //"In Delivery": 3,
    "In controlling": 4,
    "Controlled": 5,
    "To be controlled": 6,
  };

const errorTranslationMap = {
  "Status cannot be changed when instrument is in Delivery.": "messages:statusInDelivery",
  // Add more mappings as needed
};
  const showErrorAlert = (error) => {
    const errorMessage = error?.response?.data?.message || "";

    const errorMap = {
      "Status cannot be changed when the instrument is In Delivery.": "errors.statusInDelivery"
    };

    const translatedMessage = t(errorMap[errorMessage] || "errors.default");

    Swal.fire({
      title: t("Warning"),
      text: translatedMessage,
      icon: "warning"
    });
  };

function getTranslatedErrorMessage(message, t) {
  const translationKey = errorTranslationMap[message];
  return translationKey ? t(translationKey) : message;
}


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
      console.error("Error while updating status:", error.response.data);
      showErrorAlert(error);
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
      <DialogTitle>{t("PopUp:ChangeInstrumentStatus")}</DialogTitle>
      <DialogContent>
        <FormControl fullWidth margin="dense">
          <InputLabel id="status-label">{t("PopUp:ChangeInstrumentStatus")}</InputLabel>
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
          {t("PopUp:Cancel")}
        </Button>
        <Button onClick={handleSubmit} variant="contained" className="!bg-[#1D34D8]">
          {t("PopUp:Save")}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default InstrumentStatusModal;
