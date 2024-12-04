import { Button, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";
import QrReader from "../../components/QrScanner/QrScanner";
import { DocumentScannerSharp } from "@mui/icons-material";

const AddInstrumentWithQr = ({ onComplete }) => {
  const [scannedResult, setScannedResult] = useState("");
  const [showScanner, setShowScaner] = useState(false);

  useEffect(() => {
    if (!scannedResult) return;
    const itemId = scannedResult?.split("/")?.pop();
    onComplete(itemId); 
    setShowScaner(false)

  }, [scannedResult]);

  return (
    <>
     
      {showScanner ? <QrReader ocComplete={setScannedResult} />: <IconButton onClick={()=>{setShowScaner(true)}}><DocumentScannerSharp fontSize={"large"} color={"success"} /></IconButton> }
    </>
  );
};

export default AddInstrumentWithQr;
