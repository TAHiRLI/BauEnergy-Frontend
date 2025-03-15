// import { Button, IconButton } from "@mui/material";
// import React, { useEffect, useState } from "react";

// import { DocumentScannerSharp } from "@mui/icons-material";
// import QrReader from "../../components/QrScanner/QrScanner";

// const AddInstrumentWithQr = ({ onComplete, showInitialLoad }) => {
//   const [scannedResult, setScannedResult] = useState("");
//   const [showScanner, setShowScaner] = useState( showInitialLoad);

//   useEffect(() => {
//     if (!scannedResult) return;
//     const urlParts = scannedResult?.split("/");
//     const itemId = urlParts?.length > 2 ? urlParts[urlParts.length - 2] : null;
//     onComplete(itemId);
//     setShowScaner(false);
//   }, [scannedResult, onComplete]);

//   return (
//     <>
//       {showScanner ? (
//         <QrReader
//           onComplete={(id) => {
//             setScannedResult(id);
//             setShowScaner(false);
//           }}
//         />
//       ) : (
//         <IconButton
//           onClick={() => {
//             setShowScaner(true);
//           }}
//         >
//           <DocumentScannerSharp fontSize={"large"} color={"success"} />
//         </IconButton>
//       )}
//     </>
//   );
// };

// export default AddInstrumentWithQr;

import { IconButton } from "@mui/material";
import React, { useState } from "react";
import { DocumentScannerSharp } from "@mui/icons-material";
import QrReader from "../../components/QrScanner/QrScanner";

const AddInstrumentWithQr = ({ onComplete, showInitialLoad }) => {
  const [showScanner, setShowScaner] = useState(showInitialLoad);

  return (
    <>
      {showScanner ? (
        <QrReader
          onComplete={(id) => {
            const urlParts = id?.split("/");
            const itemId = urlParts?.length > 2 ? urlParts[urlParts.length - 2] : null;
            
            if (itemId) {
              onComplete(itemId);
            }
            setShowScaner(false);
          }}
        />
      ) : (
        <IconButton onClick={() => setShowScaner(true)}>
          <DocumentScannerSharp fontSize={"large"} color={"success"} />
        </IconButton>
      )}
    </>
  );
};

export default AddInstrumentWithQr;

