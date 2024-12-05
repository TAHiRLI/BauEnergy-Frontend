import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { IconButton } from "@mui/material";
import { FlashlightOff, FlashlightOn, FlipCameraAndroid } from "@mui/icons-material";

const QrReader = ({ ocComplete }) => {
  const scanner = useRef(null);
  const videoEl = useRef(null);

  const [scannedResult, setScannedResult] = useState("");
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  const onScanSuccess = (result) => {
    setScannedResult(result?.data);
    ocComplete(result?.data); // Callback with scanned result
  };

  const onScanFail = (err) => {
  };

  useEffect(() => {
    const initScanner = async () => {
      try {
        const devices = await QrScanner.listCameras();
        console.log("🚀 ~ initScanner ~ devices:", devices)
        if (devices.length > 0) {
          setCameras(devices);
          setCurrentCamera(devices[0].id);

          scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
            onDecodeError: onScanFail,
            preferredCamera: devices[0].id,
          });

          await scanner.current.start();
        } else {
          alert("No cameras found on this device.");
        }
      } catch (err) {
        console.error("Failed to initialize QR scanner:", err);
        alert("Error initializing QR scanner. Check camera permissions.");
      }
    };

    initScanner();

    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current.destroy();
      }
    };
  }, []);

  const toggleFlash = async () => {
    if (scanner.current && scanner.current.hasFlash()) {
      try {
        if (flashEnabled) {
          await scanner.current.turnOffFlash();
        } else {
          await scanner.current.turnOnFlash();
        }
        setFlashEnabled(!flashEnabled);
      } catch (err) {
        console.error("Flashlight Error:", err);
        alert("Flashlight is not supported on this device.");
      }
    } else {
      alert("Flashlight is not available on this device or camera.");
    }
  };

  const flipCamera = async () => {
    if (cameras.length > 1) {
      const currentIndex = cameras.findIndex((camera) => camera.id === currentCamera);
      const nextCamera = cameras[(currentIndex + 1) % cameras.length];

      try {
        setCurrentCamera(nextCamera.id);
        if (scanner.current) {
          await scanner.current.stop();
          await scanner.current.start({ deviceId: nextCamera.id });
        }
      } catch (err) {
        console.error("Error flipping camera:", err);
        alert("Unable to switch cameras.");
      }
    } else {
      alert("No additional cameras available to flip.");
    }
  };

  return (
    <div className="qr-reader relative p-3 qrScannerContainer">
      <video
        ref={videoEl}
        className="scanner"
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
      <IconButton
        onClick={flipCamera}
        sx={{ backgroundColor: "#fff" }}
        className="!absolute top-16 right-5"
      >
        <FlipCameraAndroid color="primary" />
      </IconButton>
    </div>
  );
};

export default QrReader;
