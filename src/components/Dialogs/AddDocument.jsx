import React, { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
  IconButton,
  Grid,
} from "@mui/material";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import { styled } from "@mui/material/styles";
import { useTranslation } from "react-i18next";

const VisuallyHiddenInput = styled("input")({
  display: "none",
});

const StyledBox = styled(Box)(({ theme }) => ({
  border: "1px solid",
  borderColor: theme.palette.grey[400],
  padding: theme.spacing(1),
  marginTop: theme.spacing(1),
  borderRadius: theme.shape.borderRadius,
  "&:hover": {
    borderColor: theme.palette.common.black,
  },
}));

const AddDocumentsDialog = ({ open, handleClose, handleDocumentUpload }) => {
  const { t } = useTranslation();

  const [selectedFiles, setSelectedFiles] = useState([]);

  const handleFileChange = (event) => {
    const files = Array.from(event.target.files); 
    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    await handleDocumentUpload(selectedFiles);
    setSelectedFiles([]); 
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{
        style: {
          borderRadius: 20,
          height: "400px",
          backgroundColor: "#fcfcfc",
        },
      }}
    >
      <DialogTitle>
        <Typography variant="h6">
          {t("PopUp:UploadDocuments")}
          <IconButton
            className="!text-[#1D34D8]"
            aria-label="close"
            onClick={handleClose}
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
        <Typography variant="body1" gutterBottom>
          {t("PopUp:Select files to upload")}:
        </Typography>
        <StyledBox>
          <Button
            component="label"
            variant="contained"
            startIcon={<CloudUploadIcon />}
          >
          {t("PopUp:UploadFiles")}
            <VisuallyHiddenInput
              name="files"
              type="file"
              onChange={handleFileChange}
              multiple
              accept=""
            />
          </Button>
        </StyledBox>
        <Box mt={2}>
          {selectedFiles.length > 0 ? (
            <Grid container spacing={1}>
              {selectedFiles.map((file, index) => (
                <Grid
                  item
                  xs={12}
                  key={index}
                  display="flex"
                  alignItems="center"
                >
                  <PictureAsPdfIcon color="error" />
                  <Typography variant="body2" ml={1}>
                    {file.name}
                  </Typography>
                </Grid>
              ))}
            </Grid>
          ) : (
            <Typography variant="body2" color="textSecondary">
            {t("PopUp:Nofilesuploaded")}
          </Typography>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Box display="flex" justifyContent="flex-end" gap={2} width="100%">
          <Button variant="outlined" onClick={handleClose}>
          {t("PopUp:Cancel")}
          </Button>
          <Button
            variant="contained"
            className='!bg-[#1D34D8]'            
            onClick={handleUpload}
          >
          {t("PopUp:Upload")}
          </Button>
        </Box>
      </DialogActions>
    </Dialog>
  );
};

export default AddDocumentsDialog;
