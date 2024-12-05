import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { IconButton } from "@mui/material";
import { FlashlightOff, FlashlightOn, FlipCameraAndroid } from "@mui/icons-material";

const QrReader = ({ onComplete }) => {
  console.log("🚀 ~ QrReader ~ onComplete:", onComplete);
  const scanner = useRef(null); // QR Scanner instance
  const videoEl = useRef(null); // Reference to the video element

  const [scannedResult, setScannedResult] = useState("");
  const [cameras, setCameras] = useState([]);
  const [currentCameraIndex, setCurrentCameraIndex] = useState(0);
  const [flashEnabled, setFlashEnabled] = useState(false);

  // Success callback for QR code scanning
  const onScanSuccess = (result) => {
    console.log("Scanned QR Code:", result?.data);
    setScannedResult(result?.data);
    onComplete(result?.data); // Trigger the callback with scanned data
  };

  // Error callback for QR code scanning
  const onScanFail = (error) => {
    console.warn("QR Scan Error:", error);
  };

  // Initialize QR scanner and fetch cameras
  useEffect(() => {
    const initializeScanner = async () => {
      try {
        const availableCameras = await QrScanner.listCameras();
        if (availableCameras.length === 0) {
          alert("No cameras found on this device.");
          return;
        }

        setCameras(availableCameras);
        setCurrentCameraIndex(0); // Default to the first camera

        // Initialize the scanner with the first camera
        scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
          onDecodeError: onScanFail,
          preferredCamera: availableCameras[0]?.id,
        });

        await scanner.current.start();
      } catch (error) {
        console.error("Failed to initialize QR scanner:", error);
        alert("Error initializing QR scanner. Check camera permissions.");
      }
    };

    initializeScanner();

    // Cleanup on unmount
    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current.destroy();
        scanner.current = null;
      }
    };
  }, []);

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
      alert("Unable to toggle flashlight.");
    }
  };

  // Flip the camera
  const flipCamera = async () => {
    if (cameras.length <= 1) {
      alert("No additional cameras available to flip.");
      return;
    }

    try {
      const nextCameraIndex = (currentCameraIndex + 1) % cameras.length;
      const nextCamera = cameras[nextCameraIndex];

      if (scanner.current) {
        await scanner.current.stop();
        await scanner.current.start({ deviceId: nextCamera.id });
      }

      setCurrentCameraIndex(nextCameraIndex);
    } catch (error) {
      console.error("Error flipping camera:", error);
      alert("Unable to switch cameras.");
    }
  };
  return (
    <>
    <div>{JSON.stringify(cameras)}</div>
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
        <IconButton
          onClick={toggleFlash}
          color="secondary"
          sx={{ backgroundColor: "#fff" }}
          className="!absolute top-5 right-5"
        >
          {flashEnabled ? <FlashlightOff color="primary" /> : <FlashlightOn color="primary" />}
        </IconButton>
        <IconButton onClick={flipCamera} sx={{ backgroundColor: "#fff" }} className="!absolute top-16 right-5">
          <FlipCameraAndroid color="primary" />
        </IconButton>
        <em></em>
        <span className="searcher"></span>
      </div>
    </>
  );
};

export default QrReader;
