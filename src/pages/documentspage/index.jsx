import React, { useEffect, useState } from 'react';
import {
  Box, Grid, IconButton, Typography, CircularProgress
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import { projectDocumentsService } from '../../APIs/Services/projectDocuments.service';
import { instrumentDocumentsService } from '../../APIs/Services/instrumentDocument.service';
import DeleteIcon from '@mui/icons-material/Delete';


export const Documents = () => {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchAllProjectDocuments();
  }, []);

  const fetchAllProjectDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await projectDocumentsService.getAllDeleted();
      setDocuments((prevDocuments) => [...prevDocuments, ...response.data]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllInstrumentDocuments();
  }, []);

  const fetchAllInstrumentDocuments = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await instrumentDocumentsService.getAllDeleted();
      setDocuments((prevDocuments) => [...prevDocuments, ...response.data]);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };


  const handleDelete = async (documentId) => {
    try {
      await projectDocumentsService.hardDelete(documentId);
      setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Failed to delete document:", err);
      alert("An error occurred while deleting the document.");
    }
  };

  const formatFileName = (fileName) => {
    const parts = fileName?.split(' ');
    return parts?.slice(1).join('');
  };

  return (
    <Box mt={2} p={3} sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 2 }}>
      <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D34D8', mb: 2 }}>
        Documents
      </Typography>

      {loading ? (
        <Box display="flex" justifyContent="center" mt={4}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Typography color="error">{error}</Typography>
      ) : (
        <Grid container spacing={2}>
          {documents.length > 0 ? (
            documents.map((doc) => (
              <Grid item xs={12} sm={6} key={doc.id}>
                <Box display="flex" alignItems="center" sx={{ padding: 1, border: '1px solid #e0e0e0', borderRadius: 2 }}>
                  {doc.fileType === 'pdf' ? (
                    <PictureAsPdfIcon sx={{ fontSize: 40, color: '#D32F2F' }} />
                  ) : (
                    <DescriptionIcon sx={{ fontSize: 40 }} />
                  )}
                  <Typography
                    variant="body1"
                    sx={{ marginLeft: '10px', cursor: 'pointer', color: '#1D34D8', fontWeight: 'bold' }}
                    onClick={() => window.open(`${process.env.REACT_APP_DOCUMENT_URL}/assets/projectpdf/${doc.fileName}`, '_blank')}
                  >
                  {formatFileName(doc.fileName)}
                  </Typography>
                  <IconButton onClick={() => handleDelete(doc.id)} sx={{ marginLeft: 'auto' }}>
                    <DeleteIcon className='text-[#d33]' />
                  </IconButton>
                </Box>
              </Grid>
            ))
          ) : (
            <Typography variant="body2" color="textSecondary">
            </Typography>
          )}
        </Grid>
      )}
    </Box>
  );
}
