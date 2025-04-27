import {
  Box,
  Button,
  Checkbox,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputAdornment,
  InputLabel,
  ListItemText,
  MenuItem,
  OutlinedInput,
  Paper,
  Select,
  TextField,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { InstrumentActions, useInstruments } from "../../context/instrumentContext";
import React, { useEffect, useMemo, useState } from "react";

import AddIcon from "@mui/icons-material/Add";
import AddInstrumentWithQr from "../../components/addInstrumentWithQr/addInstrumentWithQr";
import CancelOutlinedIcon from "@mui/icons-material/CancelOutlined";
import CloseIcon from "@mui/icons-material/Close";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import Cookies from "universal-cookie";
import { DataGrid } from "@mui/x-data-grid";
import DeleteIcon from "@mui/icons-material/Delete";
import { DocumentScanner } from "@mui/icons-material";
import InfoIcon from "@mui/icons-material/Info";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import QrCodeScannerIcon from "@mui/icons-material/QrCodeScanner";
import { useTranslation } from "react-i18next";
import ShareIcon from "@mui/icons-material/Share";
import Swal from "sweetalert2";
import { instrumentService } from "../../APIs/Services/instrument.service";
import { instrumentTagService } from "../../APIs/Services/instrumentTag.service";
import { jwtDecode } from "jwt-decode";
import { styled } from "@mui/material/styles";
import { useErrorModal } from "../../hooks/useErrorModal";
import { useLocation } from "react-router-dom";
import { useNavigate } from "react-router-dom";

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

export const Instruments = () => {
  const { t } = useTranslation();

  const [isUpdated, forceUpdate] = useState(false);
  const { state, dispatch } = useInstruments();
  const showError = useErrorModal();
  const [openModal, setOpenModal] = useState(false);
  const [openScanner, setOpenScanner] = useState(false);
  const [openQRDialog, setOpenQRDialog] = useState(false);
  const [qrImage, setQrImage] = useState(null);
  const [qrInstrumentName, setQrInstrumentName] = useState(null);
  const [imagePreviews, setImagePreviews] = useState(null);
  const [searchTerm, setSearchTerm] = useState(null);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagInput, setTagInput] = useState("");

  const [instruments, setInstruments] = useState([]);
  const [instrumentsByName, setInstrumentsByName] = useState([]);
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState("");
  const [viewMode, setViewMode] = useState("table");

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [selectedImage, setSelectedImage] = useState("/toolimage.png" || null);
  const [imageError, setImageError] = useState(null);

  const handleInstrumentClick = (id) => {
    navigate(`/instruments/details/${id}`);
  };
  const columns = useMemo(() => {
    return [
      {
        field: "name",
        headerName: t("columns:InstrumentName"),
        width: 200,
        renderCell: (params) => {
          return (
            <Box
              display="flex"
              alignItems="center"
              sx={{ cursor: "pointer" }}
              onClick={() => handleInstrumentClick(params.row.id)}
            >
              <img
                src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${params.row.image}`}
                alt={params.row.name}
                style={{ width: 50, height: 50, marginRight: 10 }}
              />

              <Typography>{params.row.name}</Typography>
            </Box>
          );
        },
      },
      {
        field: "availability",
        headerName: t("columns:Available"),
        width: 150,
        renderCell: (params) => {
          const count = params.row.count ?? 0;
          const usedCount = params.row.usedInstrumentsCount ?? 0;
          return `${count - usedCount}/${count}`;
        },
      },
      { field: "shortDesc", headerName: t("columns:Description"), width: 200 },
      {
        field: "actions",
        headerName: t("columns:Actions"),
        width: 170,
        sortable: false,
        renderCell: (params) => (
          <div className="flex gap-2 items-center mt-2">
            <IconButton
              onClick={() => handleInstrumentInfoSelect(params.row.id)}
              sx={{
                color: "gray",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                padding: "5px",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              <InfoIcon />
            </IconButton>
            {/* <IconButton
              onClick={() => handleShowQR(params.row.qrImage, params.row.name)}
              sx={{
                color: "gray",
                backgroundColor: "#f0f0f0",
                borderRadius: "8px",
                padding: "5px",
                "&:hover": {
                  backgroundColor: "#e0e0e0",
                },
              }}
            >
              <QrCodeScannerIcon />
            </IconButton> */}
          </div>
        ),
      },
    ];
  }, []);

  const handleViewChange = (mode) => {
    setViewMode(mode);
  };

  const isSmallScreen = useMediaQuery("(max-width:800px)");
  const isExtraSmall = useMediaQuery("(max-width:380px)");

  const [newInstrument, setNewInstrument] = useState({
    name: "",
    images: [],
    files: [],
    mainImageIndex: 0,
    description: "",
    shortDesc: "",
    instrumentTypeId: "",
    price: "",
    tags: [],
    count: 1,
  });

  const [instrument, setInstrument] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const handleInstrumentInfoSelect = async (id) => {
    try {
      const projectResponse = await instrumentService.getById(id);
      setInstrument(projectResponse.data);
      navigate(`/instruments/details/${id}`, { state: { instrument: projectResponse.data } });
    } catch (error) {
      console.error("Failed to fetch project details", error);
    }
  };
  const location = useLocation();
  // const searchInputRef = useRef(null);
  //console.log(location)

  const cookies = new Cookies();
  let user = cookies.get("user");
  let token = user?.token;

  let decodedToken;
  try {
    decodedToken = jwtDecode(token);
  } catch (error) {
    console.error("Invalid token:", error);
  }

  var isAdmin = false;
  const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
  if (userRoles.includes("Company_Owner")) {
    isAdmin = true;
  }

  const fetchInstruments = async (newSearch = false) => {
    if (newSearch) {
      setInstruments([]);
      setPage(1);
    }
    setLoading(true);
    try {
      const res = await instrumentService.getAll(searchTerm, page);
      const { instruments: newInstruments, totalCount } = res.data;
      setInstruments((prevInstruments) => (newSearch ? newInstruments : [...prevInstruments, ...newInstruments]));
      setTotalCount(totalCount);
      setHasMore(page * 16 < totalCount);
    } catch (err) {
      console.error("Error fetching instruments:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchInstrumentsByName = async (newSearch = false) => {
    setLoading(true);
    try {
      const res = await instrumentService.getAllByName(newSearch ? searchTerm : "");
      setInstrumentsByName(res);
    } catch (err) {
      console.error("Error fetching instruments:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(
    () => {
      fetchInstrumentsByName();
    },
    [],
    searchTerm
  );

  useEffect(() => {
    fetchInstruments(page === 1);
  }, [page]);

  const handleSearchChange = (event) => {
    const value = event.target.value;
    setSearchTerm(value);
    console.log(value);
    if (value.trim() === "") {
      setSearchTerm(value);

      setPage(1);
      fetchInstrumentsByName(false);
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      setPage(1);
      fetchInstrumentsByName(true);
    }
  };

  const handleClearSearch = () => {
    setSearchTerm("");
    setPage(1);
    fetchInstrumentsByName(false);
  };

  const loadMore = () => {
    setPage((prevPage) => prevPage + 1);
  };

  //
  useEffect(() => {
    //const searchParams = new URLSearchParams(location.search);
    //const focusSearch = searchParams.get('focusSearch');
    if (location.state === "true") {
      // Use document.getElementById to focus the input by its id
      const searchInput = document.getElementById("searchbtnax");
      if (searchInput) {
        searchInput.focus();
      }
    }
  }, [location.search]);

  useEffect(() => {
    (async () => {
      setLoading(true);
      dispatch({ type: InstrumentActions.start });
      try {
        const res = await instrumentService.getAll();
        dispatch({ type: InstrumentActions.success, payload: res.data });
      } catch (err) {
        console.error("Error fetching instruments:", err);
        dispatch({ type: InstrumentActions.failure, payload: err });
      } finally {
        setLoading(false);
      }
    })();
  }, [dispatch, isUpdated]);

  const handleDelete = async (id) => {
    try {
      await instrumentService.remove(id);
      forceUpdate((x) => !x);
    } catch (err) {
      console.error("Error deleting instrument:", err);
      showError();
    }
  };
  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Box>
    );
  }

  const fetchTags = async () => {
    if (!availableTags.length) {
      try {
        const response = await instrumentTagService.getAll();
        //console.log(response)
        setAvailableTags(response.data);
      } catch (error) {
        console.error("Error fetching available tags:", error);
      }
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
    fetchTags();
  };
  const handleCloseModal = () => {
    setOpenModal(false);
  };
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    //console.log(value)
    if (value === "+" || value === "-") {
      setError('Invalid input: Price cannot be just "+" or "-"');
      setNewInstrument((prev) => ({ ...prev, [name]: "" }));
    } else {
      setNewInstrument((prevState) => ({
        ...prevState,
        [name]: value,
      }));
    }
  };

  const handleTagChange = (event) => {
    const selectedTags = event.target.value;
    setNewInstrument((prevState) => ({
      ...prevState,
      tags: selectedTags,
    }));
  };

  const handleAddNewTag = () => {
    if (tagInput.trim() && !newInstrument.tags.includes(tagInput)) {
      setNewInstrument((prevState) => ({
        ...prevState,
        tags: [...prevState.tags, tagInput],
      }));

      setAvailableTags((prevTags) => [...prevTags, { id: `new-${tagInput}`, title: tagInput }]);
      setTagInput("");
    }
  };

  const handlePdfUpload = (event) => {
    const files = event.target.files;
    //(files)
    setUploadedFiles((prevFiles) => [...prevFiles, ...files]);
    setNewInstrument((prevInstrument) => ({
      ...prevInstrument,
      files: [...prevInstrument.files, ...files],
    }));
  };
  const handleDeleteFile = (indexToRemove) => {
    setUploadedFiles((prevFiles) => prevFiles.filter((_, index) => index !== indexToRemove));
    setNewInstrument((prevInstrument) => ({
      ...prevInstrument,
      files: prevInstrument.files.filter((_, index) => index !== indexToRemove),
    }));
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      setImagePreviews(imageUrl);
      setSelectedImage(file);
    }
  };

  
  const renderImage = () => {
    if (selectedImage.startsWith("blob:")) {
      return selectedImage;
    }
    return selectedImage;
  };

  
  const handleAddInstrument = async () => {
    if (!selectedImage || selectedImage === "/toolimage.png") {
      setImageError("Please upload an image before submitting.");
      return;
    }
    setImageError(null);

    try {
      setIsSubmitting(true);

      const { name, description, shortDesc, instrumentType, count, price, tags, files } = newInstrument;
      const formData = new FormData();
      formData.append("Name", name);
      formData.append("Description", description);
      formData.append("ShortDesc", shortDesc);
      formData.append("InstrumentType", instrumentType);
      formData.append("Count", count);
      formData.append("Price", price);
      formData.append("Image", selectedImage);

      tags?.forEach((tag) => {
        formData.append("Tags", tag);
      });
      console.log(files)

      files?.forEach((file) => {
        console.log(file)
        formData.append("Files", file);
      });

      await instrumentService.add(formData);
      forceUpdate((x) => !x);
      handleCloseModal();
      fetchInstrumentsByName();

      Swal.fire({
        icon: "success",
        title: t("messages:Success"),
        text: t("messages:Instrument added successfully."),
        confirmButtonText: "OK",
      });
    } catch (err) {
      console.error("Error adding instrument:", err);
      Swal.fire({
        icon: "error",
        title: t("messages:Success"),
        text: t("messsages:An error occurred while adding the instrument. Please try again."),
        confirmButtonText: "OK",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleShare = () => {
    const shareData = {
      url: window.location.href,
    };

    if (navigator.share) {
      navigator.share(shareData).catch((err) => {
        console.error("Error sharing:", err);
      });
    } else {
      Swal.fire({
        icon: "info",
        title: "Share Link",
        text: `Your browser doesn't support sharing. Please copy the link manually.`,
        footer: `<a href="${window.location.href}" target="_blank">Copy Link</a>`,
      });
    }
  };

  function handleShowQR(qrImage, instrumentName) {
    setQrImage(qrImage);
    setQrInstrumentName(instrumentName);
    setOpenQRDialog(true);
  }
  const handleCloseQRDialog = () => setOpenQRDialog(false);

  const rows = instruments.map((instrument) => ({
    id: instrument.id,
    name: instrument.name,
    isActive: instrument.isActive ? "Inactive" : "Active",
    shortDesc: instrument.shortDesc,
    image: instrument.image,

    status: instrument.status,
    qr: instrument.qrImage,
  }));
  const instrumentsFilteredByName = instrumentsByName.data?.map((instrument) => ({
    id: instrument.id,
    name: instrument.name,
    isActive: instrument.isActive ? "Inactive" : "Active",
    shortDesc: instrument.shortDesc,
    image: instrument.image,

    status: instrument.status,
    qr: instrument.qrImage,
    count: instrument.count,
    usedInstrumentCount: instrument.usedInstrumentsCount,
  }));

  const rowss = instrumentsByName.data?.map((instrument, index) => ({
    id: instrument.id || index,
    ...instrument,
  }));

  if (!state.data || state.data.length === 0) {
    return (
      <Box m={"20px"}>
        {isAdmin && (
          <Button
            variant="contained"
            className="!bg-[#1D34D8] !rounded-3xl !ml-0 md:!ml-3 !py-2"
            sx={{ width: "auto", textTransform: "none", padding: "10px 20px" }}
            onClick={handleOpenModal}
          >
            {t("AddInstrument")}
          </Button>
        )}
        {/* Add Instrument Modal */}
        <Dialog
          open={openModal}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            style: {
              borderRadius: 20,
              //height: "500px",
              backgroundColor: "#fcfcfc",
            },
          }}
        >
          <DialogTitle>
          {t("PopUp:Add New Instrument")}
            <IconButton
              className="!text-blue-700"
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CancelOutlinedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              {/* Display the selected image */}
              <img
                src={imagePreviews ?? "/toolimage.png"}
                alt="Instrument Preview"
                style={{
                  width: 250,
                  height: 200,
                  borderRadius: "10%",
                  objectFit: "cover",
                  marginBottom: 0,
                  marginTop: "20px",
                }}
              />
              {/* Upload button */}
              <Button
                variant="text"
                className="!text-[#1D34D8]"
                onClick={() => document.getElementById("profile-image-input").click()}
              >
                {t("PopUp:UploadImage")}
              </Button>
              <input
                id="profile-image-input"
                type="file"
                accept="image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              {/* Show error message */}
              {imageError  && (
                <Typography color="error" variant="body2" style={{ marginTop: 8 }}>
                  {imageError}
                </Typography>
              )}
            </Box>


            <TextField
              autoFocus
              margin="dense"
              name="name"
              label={t("columns:InstrumentName")}
              type="text"
              fullWidth
              value={newInstrument.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label={t("columns:Description")}
              type="text"
              fullWidth
              value={newInstrument.description}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="shortDesc"
              label={t("PopUp:ShortDescription")}
              type="text"
              fullWidth
              value={newInstrument.shortDesc}
              onChange={handleInputChange}
            />

            {/* Instrument Type */}
            <TextField
              margin="dense"
              name="instrumentType"
              label={t("PopUp:InstrumentType")}
              type="text"
              fullWidth
              value={newInstrument.instrumentType || ""}
              onChange={handleInputChange}
            />

            {/* Price Input */}
            <TextField
              margin="dense"
              name="price"
              label={t("PopUp:Price")}
              type="number"
              fullWidth
              value={newInstrument.price || ""}
              onChange={handleInputChange}
              inputProps={{ min: 0, step: "0.01" }}
              error={!!error}
              helperText={error}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>{t("PopUp:Tag")}</InputLabel>
              <Select
                multiple
                label="Tags"
                value={newInstrument.tags}
                onChange={handleTagChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {availableTags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.title}>
                    <Checkbox checked={newInstrument.tags.includes(tag.title)} />
                    <ListItemText primary={tag.title} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel htmlFor="add-new-tag">{t("PopUp:Addnewtag")}</InputLabel>
              <OutlinedInput
                id="add-new-tag"
                type="text"
                onChange={(e) => setTagInput(e.target.value)}
                value={tagInput}
                label="Add new tag (optional)"
                placeholder="Type a new tag"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleAddNewTag} edge="end">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <TextField
              label={t("PopUp:NumberofInstrumentstoAdd")}
              name="count"
              type="number"
              fullWidth
              value={newInstrument.count}
              onChange={handleInputChange}
              margin="normal"
              inputProps={{ min: 1 }}
            />

            {/* PDF Upload */}
            <StyledBox>
              <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              {t("PopUp:UploadFiles")}
                <VisuallyHiddenInput type="file" onChange={handlePdfUpload} multiple accept="" />
              </Button>
            </StyledBox>

            {/* Display uploaded PDF files */}
            <Box mt={2}>
              {uploadedFiles.length > 0 ? (
                <Grid container spacing={1}>
                  {uploadedFiles.map((file, index) => (
                    <Grid item xs={12} key={index} display="flex" alignItems="center">
                      <PictureAsPdfIcon color="error" />
                      <Typography variant="body2" ml={1} flexGrow={1}>
                        {file.name}
                      </Typography>
                      <IconButton color="error" onClick={() => handleDeleteFile(index)}>
                        <DeleteIcon />
                      </IconButton>
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
          <DialogActions className="!px-10">
            <Button onClick={handleCloseModal} className="!text-[#1D34D8] ">
            {t("PopUp:Cancel")}
            </Button>
            {/* <Button type="submit" onClick={handleAddInstrument} variant="contained" className='!bg-[#1D34D8]'>Submit</Button> */}
            <Button
              type="submit"
              onClick={handleAddInstrument}
              variant="contained"
              className="!bg-[#1D34D8]"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("PopUp:Submitting") : t("PopUp:Submit")}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    );
  }

  return (
    <Box m={{ xs: "0px", sm: "20px" }} mt={{ xs: "10px", sm: "20px" }}>
      <div className="flex flex-col sm:flex-row justify-between items-center">
        <span className="text-2xl sm:text-3xl font-semibold mb-4 sm:mb-0">{t("PopUp:ListofInstruments")}</span>
        <div
          className={`flex ${
            isExtraSmall ? "flex-col" : "flex-row"
          } items-start gap-4 justify-between w-full sm:w-auto`}
        >
          <Box
            className="flex w-full"
            sx={{
              flexDirection: { xs: "column", sm: "row" },
              gap: 2,
            }}
          >

          <TextField
            id="searchbtnax"
            variant="outlined"
            placeholder={t("columns:SearchInstruments")}
            value={searchTerm}
            onChange={handleSearchChange}
            onKeyDown={handleKeyDown}
            InputProps={{
              endAdornment: searchTerm && (
                <InputAdornment position="end">
                  <IconButton onClick={handleClearSearch}>
                    <CloseIcon />
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              minWidth: "190px",
              width: { xs: "100%", sm: isAdmin ? "100%" : "50%" },
              boxShadow: "0 2px 5px rgba(0, 0, 0, 0.1)",
              borderRadius: "30px",
              "& .MuiOutlinedInput-root": { borderRadius: "30px" },
              "& .MuiOutlinedInput-input": { padding: "10px 15px" },
            }}
          />


            {isAdmin && (
              <Button
                variant="contained"
                className="!bg-[#1D34D8] !rounded-3xl !ml-0 md:!ml-3 !py-2 !w-full"
                sx={{
                  width: { xs: "100%", sm: "48%" },
                  textTransform: "none",
                }}
                onClick={handleOpenModal}
              >
                {t("AddInstrument")}
              </Button>
            )}
          </Box>

          {/* Switch to toggle between Card and Table views */}
          <div className={`flex items-center border rounded-full p-1 ${!isSmallScreen ? "gap-2" : ""}`}>
            <button
              className={`flex items-center px-4 py-[6px] rounded-full ${
                viewMode === "table" ? "bg-blue-100 text-blue-700 font-medium" : "bg-transparent text-gray-600"
              }`}
              onClick={() => handleViewChange("table")}
            >
              <span>{t("Table")}</span>
            </button>
            <button
              className={`flex items-center px-4 py-[6px] rounded-full ${
                viewMode === "card" ? "bg-blue-100 text-blue-700 font-medium" : "bg-transparent text-gray-600"
              }`}
              onClick={() => handleViewChange("card")}
            >
              <span>{t("Card")}</span>
            </button>
          </div>
        </div>
      </div>

      <p className="mt-4 text-sm sm:text-base"></p>

      {viewMode === "card" ? (
        <Grid container spacing={2} sx={{ marginTop: "20px" }}>
          {instrumentsFilteredByName?.map((row) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={row.id}>
              <Box p={2} boxShadow={2} className="rounded-lg">
                <img
                  src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/images/instruments/${row.image}`}
                  alt={row.name}
                  style={{ width: "100%", height: "200px", marginBottom: "10px", objectFit: "cover" }}
                  className="rounded-lg"
                />
                <Typography className="!text-lg !mt-1 !whitespace-nowrap !overflow-hidden !text-ellipsis">
                  {row.name}
                </Typography>
                <div className="flex justify-between items-center">
                  <div>{t("PopUp:Availableinstruments")}:</div>
                  <Typography className="!text-base !mt-1 !whitespace-nowrap !overflow-hidden !text-ellipsis">
                    {row.count - row.usedInstrumentCount}/{row.count}
                  </Typography>
                </div>
                <Typography
                  variant="body2"
                  color="textSecondary"
                  sx={{
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                  }}
                >
                  {row.shortDesc}
                </Typography>
                <div className="flex justify-between mt-1">
                  <Button
                    variant="outlined"
                    startIcon={<InfoIcon />}
                    sx={{ marginRight: "10px", borderColor: "blue", color: "blue" }}
                    onClick={() => handleInstrumentInfoSelect(row.id)}
                  >
                    {t("PopUp:info")}
                  </Button>
                  <Button
                    onClick={() => handleShowQR(row.qr, row.name)}
                    className="!underline !text-[#1D34D8] !rounded-xl"
                  >
                    {t("PopUp:ScanQRCode")}
                  </Button>
                </div>
              </Box>
            </Grid>
          ))}

          {loading && <CircularProgress />}
        </Grid>
      ) : (
        <Paper
          className="!mt-4 !sm:mt-0"
          sx={{
            width: "100%",
            overflowX: "hidden",
            maxWidth: "100vw",
          }}
        >
          <Box
            sx={{
              width: "100%",
              //overflowX: { xs: 'auto', sm: 'hidden' },
            }}
          >
            <DataGrid
              className="max-w-[80vw]"
              rows={rowss}
              columns={columns}
              initialState={{ pagination: { paginationModel: { pageSize: 50 } } }}
              pageSizeOptions={[50, 100, 200]}
              sx={{
                border: 0,
                minWidth: 200,
                height: "auto",
                "& .MuiDataGrid-root": {
                  overflowX: "auto",
                },
                "& .MuiDataGrid-cell": {
                  display: "flex",
                  alignItems: "center",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  textAlign: "center",
                },
                "& .MuiDataGrid-columnHeader": {
                  textAlign: "center",
                  justifyContent: "center",
                },
                "& .MuiDataGrid-footerContainer": {
                  justifyContent: "flex-start",
                },
              }}
              getRowId={(row) => row.id}
            />
          </Box>
        </Paper>
      )}

      {/* {!loading && hasMore && (
                <div className='text-center mt-5 px-2'>
                    <Button onClick={loadMore} variant="contained" sx={{ marginTop: 2 }} className="!bg-[#1D34D8] !rounded-3xl !py-2 !px-8">
                        Load More
                    </Button>
                </div>
            )} */}

      {/* QR Modal */}
      <Dialog
        open={openQRDialog}
        onClose={handleCloseQRDialog}
        PaperProps={{
          style: {
            borderRadius: 20,
            //height: "500px",
            width: "400px"
          },
        }}
      >
        <DialogTitle>
        {t("PopUp:QrInstrument")}
          <IconButton
            className="!text-blue-700"
            aria-label="close"
            onClick={handleCloseQRDialog}
            sx={{
              position: "absolute",
              right: 8,
              top: 8,
              color: (theme) => theme.palette.grey[500],
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent>
          <div className="flex justify-between items-center">
            <Typography variant="body1"> {t("PopUp:Instrument details")}:</Typography>

            <Button className="!text-blue-700" startIcon={<ShareIcon />} onClick={handleShare}>
            {t("PopUp:Share")}
            </Button>
          </div>

          {/* QR Code Image */}
          {qrImage && (
            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              p={2}
              mt={2}
              border={1}
              borderColor="grey.300"
              borderRadius="12px"
            >
              <Typography variant="h6" align="center" gutterBottom style={{ fontWeight: "bold" }}>
                {qrInstrumentName}
              </Typography>

              <Typography variant="body2" color="textSecondary" align="center" gutterBottom>
              {t("PopUp:Scan Qr to get more information")}
              </Typography>

              <img
                className="border-[30px] border-gray-200 rounded-xl"
                src={`${process.env.REACT_APP_DOCUMENT_URL}/${qrImage}`}
                alt="QR Code"
                style={{
                  width: "200px",
                  height: "200px",
                  margin: "10px 0",
                }}
              />
            </Box>
          )}
        </DialogContent>
      </Dialog>

      {/* Add Instrument Modal */}
      <Dialog
          open={openModal}
          onClose={handleCloseModal}
          fullWidth
          maxWidth="sm"
          PaperProps={{
            style: {
              borderRadius: 20,
              //height: "500px",
              backgroundColor: "#fcfcfc",
            },
          }}
        >
          <DialogTitle>
          {t("PopUp:Add New Instrument")}
            <IconButton
              className="!text-blue-700"
              aria-label="close"
              onClick={handleCloseModal}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CancelOutlinedIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                marginBottom: 2,
              }}
            >
              {/* Display the selected image */}
              <img
                src={imagePreviews ?? "/toolimage.png"}
                alt="Instrument Preview"
                style={{
                  width: 250,
                  height: 200,
                  borderRadius: "10%",
                  objectFit: "cover",
                  marginBottom: 0,
                  marginTop: "20px",
                }}
              />
              {/* Upload button */}
              <Button
                variant="text"
                className="!text-[#1D34D8]"
                onClick={() => document.getElementById("profile-image-input").click()}
              >
                {t("PopUp:UploadImage")}
              </Button>
              <input
                id="profile-image-input"
                type="file"
                capture="environment"
                accept="image/jpeg,image/png,image/jpg,image/heic,image/heif,image/webp,image/*"
                style={{ display: "none" }}
                onChange={handleImageUpload}
              />
              {/* Show error message */}
              {imageError  && (
                <Typography color="error" variant="body2" style={{ marginTop: 8 }}>
                  {imageError}
                </Typography>
              )}
            </Box>


            <TextField
              autoFocus
              margin="dense"
              name="name"
              label={t("columns:InstrumentName")}
              type="text"
              fullWidth
              value={newInstrument.name}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="description"
              label={t("columns:Description")}
              type="text"
              fullWidth
              value={newInstrument.description}
              onChange={handleInputChange}
            />
            <TextField
              margin="dense"
              name="shortDesc"
              label={t("PopUp:ShortDescription")}
              type="text"
              fullWidth
              value={newInstrument.shortDesc}
              onChange={handleInputChange}
            />

            {/* Instrument Type */}
            <TextField
              margin="dense"
              name="instrumentType"
              label={t("PopUp:InstrumentType")}
              type="text"
              fullWidth
              value={newInstrument.instrumentType || ""}
              onChange={handleInputChange}
            />

            {/* Price Input */}
            <TextField
              margin="dense"
              name="price"
              label={t("PopUp:Price")}
              type="number"
              fullWidth
              value={newInstrument.price || ""}
              onChange={handleInputChange}
              inputProps={{ min: 0, step: "0.01" }}
              error={!!error}
              helperText={error}
            />

            <FormControl fullWidth margin="dense">
              <InputLabel>{t("PopUp:Tag")}</InputLabel>
              <Select
                multiple
                label="Tags"
                value={newInstrument.tags}
                onChange={handleTagChange}
                renderValue={(selected) => selected.join(", ")}
              >
                {availableTags.map((tag) => (
                  <MenuItem key={tag.id} value={tag.title}>
                    <Checkbox checked={newInstrument.tags.includes(tag.title)} />
                    <ListItemText primary={tag.title} />
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl fullWidth margin="dense" variant="outlined">
              <InputLabel htmlFor="add-new-tag">{t("PopUp:Addnewtag")}</InputLabel>
              <OutlinedInput
                id="add-new-tag"
                type="text"
                onChange={(e) => setTagInput(e.target.value)}
                value={tagInput}
                label="Add new tag (optional)"
                placeholder="Type a new tag"
                endAdornment={
                  <InputAdornment position="end">
                    <IconButton onClick={handleAddNewTag} edge="end">
                      <AddIcon />
                    </IconButton>
                  </InputAdornment>
                }
              />
            </FormControl>

            <TextField
              label={t("PopUp:NumberofInstrumentstoAdd")}
              name="count"
              type="number"
              fullWidth
              value={newInstrument.count}
              onChange={handleInputChange}
              margin="normal"
              inputProps={{ min: 1 }}
            />

            {/* PDF Upload */}
            <StyledBox>
              <Button component="label" variant="contained" startIcon={<CloudUploadIcon />}>
              {t("PopUp:UploadFiles")}
                <VisuallyHiddenInput type="file" onChange={handlePdfUpload} multiple accept="" />
              </Button>
            </StyledBox>

            {/* Display uploaded PDF files */}
            <Box mt={2}>
              {uploadedFiles.length > 0 ? (
                <Grid container spacing={1}>
                  {uploadedFiles.map((file, index) => (
                    <Grid item xs={12} key={index} display="flex" alignItems="center">
                      <PictureAsPdfIcon color="error" />
                      <Typography variant="body2" ml={1} flexGrow={1}>
                        {file.name}
                      </Typography>
                      <IconButton color="error" onClick={() => handleDeleteFile(index)}>
                        <DeleteIcon />
                      </IconButton>
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
          <DialogActions className="!px-10">
            <Button onClick={handleCloseModal} className="!text-[#1D34D8] ">
            {t("PopUp:Cancel")}
            </Button>
            {/* <Button type="submit" onClick={handleAddInstrument} variant="contained" className='!bg-[#1D34D8]'>Submit</Button> */}
            <Button
              type="submit"
              onClick={handleAddInstrument}
              variant="contained"
              className="!bg-[#1D34D8]"
              disabled={isSubmitting}
            >
              {isSubmitting ? t("PopUp:Submitting") : t("PopUp:Submit")}
            </Button>
          </DialogActions>
        </Dialog>
    </Box>
  );
};
