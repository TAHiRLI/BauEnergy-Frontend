import { Button, IconButton } from "@mui/material";
import React, { useEffect, useState } from "react";

import { DocumentScannerSharp } from "@mui/icons-material";
import QrReader from "../../components/QrScanner/QrScanner";

const AddInstrumentWithQr = ({ onComplete, showInitialLoad }) => {
  const [scannedResult, setScannedResult] = useState("");
  const [showScanner, setShowScaner] = useState( showInitialLoad);

  useEffect(() => {
    if (!scannedResult) return;
    const itemId = scannedResult?.split("/")?.pop();
    onComplete(itemId);
    setShowScaner(false);
  }, [scannedResult]);

  return (
    <>
      {showScanner ? (
        <QrReader
          onComplete={(id) => {
            setScannedResult(id);
            setShowScaner(false);
          }}
        />
      ) : (
        <IconButton
          onClick={() => {
            setShowScaner(true);
          }}
        >
          <DocumentScannerSharp fontSize={"large"} color={"success"} />
        </IconButton>
      )}
    </>
  );
};

export default AddInstrumentWithQr;
