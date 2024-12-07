import { FlashlightOff, FlashlightOn, FlipCameraAndroid } from "@mui/icons-material";
import { IconButton, MenuItem, Select } from "@mui/material";
import { useEffect, useRef, useState } from "react";

import QrScanner from "qr-scanner";

const QrReader = ({ onComplete }) => {
  const scanner = useRef(null); // QrScanner instance
  const videoEl = useRef(null); // Reference to the video element

  const [cameras, setCameras] = useState([]); // List of available cameras
  const [selectedCamera, setSelectedCamera] = useState(""); // Selected camera ID
  const [flashEnabled, setFlashEnabled] = useState(false);

  // Success callback for QR code scanning
  const onScanSuccess = (result) => {
    console.log("Scanned QR Code:", result?.data);
    onComplete(result?.data); // Pass result to parent
  };

  const onScanFail = (error) => {
    console.warn("QR Scan Error:", error);
  };

  // Initialize scanner with a specific camera
  const initializeScanner = async (cameraId) => {
    try {
      // Stop and clean up the existing scanner
      if (scanner.current) {
        await scanner.current.stop();
        scanner.current.destroy();
        scanner.current = null;
      }

      // Ensure the video element is ready
      if (videoEl.current) {
        videoEl.current.srcObject = null; // Reset video element source
      }

      // Create a new scanner instance
      scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
        onDecodeError: onScanFail,
        preferredCamera: cameraId,
      });

      await scanner.current.start();
      console.log("Scanner initialized with camera:", cameraId);
    } catch (error) {
      console.error("Failed to initialize QR scanner:", error);
      alert("Error initializing QR scanner. Check camera permissions.");
    }
  };

  // Fetch camera list on mount
  useEffect(() => {
    const fetchCameras = async () => {
      const availableCameras = await QrScanner.listCameras();
      setCameras(availableCameras);

      if (availableCameras.length > 0) {
        setSelectedCamera(availableCameras[0].id);
        initializeScanner(availableCameras[0].id);
      } else {
        alert("No cameras found on this device.");
      }
    };

    fetchCameras();

    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current.destroy();
      }
    };
  }, []);

  // Handle camera selection
  const handleCameraChange = (event) => {
    const cameraId = event.target.value;
    setSelectedCamera(cameraId);
    initializeScanner(cameraId); // Reinitialize scanner with selected camera
  };

  // Toggle flashlight
  const toggleFlash = async () => {
    if (!scanner.current) return;

    try {
      if (await scanner.current.hasFlash()) {
        if (flashEnabled) {
          await scanner.current.turnFlashOff();
        } else {
          await scanner.current.turnFlashOn();
        }
        setFlashEnabled(!flashEnabled);
      } else {
        alert("Flashlight is not available on this device.");
      }
    } catch (error) {
      console.error("Error toggling flashlight:", error);
    }
  };

  return (
    <div className="qr-reader relative p-3 qrScannerContainer">
      <video
        className="scanner"
        ref={videoEl}
        style={{
          width: "100%",
          maxWidth: "500px",
          aspectRatio: 1,
          height: "auto",
          borderRadius: "3px",
        }}
      ></video>

      {/* Flashlight Button */}
      <IconButton
        onClick={toggleFlash}
        color="secondary"
        sx={{ backgroundColor: "#fff" }}
        className="!absolute top-5 right-5"
      >
        {flashEnabled ? <FlashlightOff color="primary" /> : <FlashlightOn color="primary" />}
      </IconButton>

      {/* Camera Selection */}
      <Select
        value={selectedCamera}
        onChange={handleCameraChange}
        displayEmpty
        fullWidth
        sx={{
          backgroundColor: "#fff",
          borderRadius: "4px",
          minWidth: "200px",
        }}
      >
        {cameras.length > 0 ? (
          cameras.map((camera) => (
            <MenuItem key={camera.id} value={camera.id}>
              {camera.label || "Camera"}
            </MenuItem>
          ))
        ) : (
          <MenuItem disabled>No Cameras Found</MenuItem>
        )}
      </Select>
      
      <em></em>
      <span className="searcher"></span>
    </div>
  );
};

export default QrReader;