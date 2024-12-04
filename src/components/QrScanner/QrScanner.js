import { useEffect, useRef, useState } from "react";
import QrScanner from "qr-scanner";
import { IconButton } from "@mui/material";
import { FlashlightOff, FlashlightOn, FlipCameraAndroid } from "@mui/icons-material";

const QrReader = ({ocComplete}) => {
  // QR Scanner and video references
  const scanner = useRef(null);
  const videoEl = useRef(null);
  const [scannedResult, setScannedResult] = useState("");


  // States
  const [qrOn, setQrOn] = useState(false);
  const [cameras, setCameras] = useState([]);
  const [currentCamera, setCurrentCamera] = useState(null);
  const [flashEnabled, setFlashEnabled] = useState(false);

  // Success Callback
  const onScanSuccess = (result) => {
    setScannedResult(result?.data);
    ocComplete(result?.data) // Update scanned result state
  };

  // Error Callback
  const onScanFail = (err) => {
  };

  useEffect(() => {
    const initScanner = async () => {
      try {
        // Get available cameras
        const devices = await QrScanner.listCameras();
        setCameras(devices);

        if (devices.length > 0) {
          const defaultCamera = devices[0];
          setCurrentCamera(defaultCamera.id);

          // Initialize QR Scanner with the default camera
          scanner.current = new QrScanner(videoEl.current, onScanSuccess, {
            onDecodeError: onScanFail,
            preferredCamera: defaultCamera.id,
          });

          await scanner.current.start();
          setQrOn(true);
        } else {
          alert("No cameras found on this device.");
        }
      } catch (err) {
        alert("Failed to initialize QR scanner. Please check camera permissions.");
      }
    };

    initScanner();

    // Cleanup: Stop scanner on component unmount
    return () => {
      if (scanner.current) {
        scanner.current.stop();
        scanner.current.destroy();
        scanner.current = null;
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

      setCurrentCamera(nextCamera.id);

      if (scanner.current) {
        await scanner.current.stop();
        await scanner.current.start({ deviceId: nextCamera.id });
      }
    } else {
      alert("No additional cameras available to flip.");
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

        <IconButton
          onClick={toggleFlash}
          color="secondary"
          sx={{backgroundColor:"#fff"}}
          className="!absolute top-5 right-5"
        >
          {flashEnabled ? <FlashlightOff color="primary" /> : <FlashlightOn color="primary" />}
        </IconButton>
        <IconButton
          onClick={flipCamera}
          sx={{backgroundColor:"#fff"}}

          className="!absolute top-16 right-5"
        >
          <FlipCameraAndroid color="primary" />
        </IconButton>

        <em></em>
        <span className="searcher"></span>
     
    </div>
  );
};

export default QrReader;
