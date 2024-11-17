import React, { useEffect, useState } from 'react';
import { instrumentDocumentsService } from '../../APIs/Services/instrumetnDocuments.service';
import {
  Box, Grid, IconButton, Typography, Button, Dialog, DialogTitle,
  DialogContent, DialogActions
} from '@mui/material';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import DescriptionIcon from '@mui/icons-material/Description';
import DeleteIcon from '@mui/icons-material/Delete';
import CancelOutlinedIcon from '@mui/icons-material/CancelOutlined';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { useDropzone } from 'react-dropzone';

export default function ProjectDocuments({ project }) {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (project?.id) {
      fetchProjectDocuments(project.id);
    }
  }, [project]);

  const fetchProjectDocuments = async (projectId) => {
    setLoading(true);
    setError(null);
    try {
      const response = await instrumentDocumentsService.getAll(projectId);
      setDocuments(response.data);
    } catch (err) {
      setError('Failed to load documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = (url) => {
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', '');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const formatFileName = (fileName) => {
    const parts = fileName?.split(' ');
    return parts?.slice(1).join('');
  };

  const handleDelete = async (documentId) => {
    try {
      await instrumentDocumentsService.remove(documentId);
      setDocuments((prevDocuments) => prevDocuments.filter((doc) => doc.id !== documentId));
    } catch (err) {
      console.error("Failed to delete document:", err);
    }
  };


  const validationSchema = Yup.object().shape({
    Files: Yup.mixed().required("A file is required"),
  });

  // Dropzone Component
  const DropzoneField = ({ setFieldValue, values }) => {
    const { getRootProps, getInputProps, isDragActive } = useDropzone({
      onDrop: (acceptedFiles) => setFieldValue("Files", acceptedFiles[0]),
      accept: "application/pdf",
    });

    return (
      <Box
        {...getRootProps()}
        sx={{
          border: '2px dashed gray',
          borderRadius: '8px',
          p: 6,
          textAlign: 'center',
          bgcolor: isDragActive ? 'blue.50' : 'grey.100',
          transition: 'background-color 0.2s ease',
          cursor: 'pointer',
          height: '200px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <input {...getInputProps()} />
        <Typography variant="body2" color="textSecondary">
          {values.Files ? `Selected file: ${values.Files.name}` : (isDragActive ? "Drop the file here..." : "Drag and drop a file here, or click to select")}
        </Typography>
      </Box>
    );
  };

  const handleAddDocument = async (values, { resetForm }) => {
    const formData = new FormData();
    formData.append("Files", values.Files);
    console.log(values)
    try {
      const response = await instrumentDocumentsService.add(project.id, formData);
      setDocuments((prevDocuments) => [...prevDocuments, response.data]);
      resetForm();
      setOpen(false);
    } catch (error) {
      console.error("Error uploading document:", error);
      alert("An error occurred while uploading the document.");
    }
  };
  return (
    <Box mt={1} p={3} sx={{ backgroundColor: '#ffffff', borderRadius: 3, boxShadow: 2 }}>
        <div className='flex justify-between items-center'>
            <Typography variant="h5" sx={{ fontWeight: 'bold', color: '#1D34D8', mb: 2 }}>
                Project documents
            </Typography>
            <Button variant="contained"  onClick={() => setOpen(true)} className="mt-4 !bg-[#1D34D8] !rounded-3xl "   sx={{ textTransform: 'none' }} >
                Add Document
            </Button>
        </div>

      <Grid container spacing={2}>
        {documents?.length > 0 ? (
          documents.map((doc, index) => (
            <Grid item xs={6} sm={6} key={index}>
              <Box display="flex" alignItems="center" sx={{ padding: 1 }}>
                {doc.fileType === 'pdf' ? (
                  <PictureAsPdfIcon sx={{ fontSize: 50, color: '#D32F2F' }} />
                ) : (
                  <DescriptionIcon sx={{ fontSize: 50 }} />
                )}
                <Typography
                  variant="body1"
                  sx={{ marginLeft: '10px', cursor: 'pointer', color: '#1D34D8', fontWeight: 'bold' }}
                  onClick={() => handleDownload(`${process.env.REACT_APP_DOCUMENT_URL}/assets/projectpdf/${doc.fileName}`)}
                >
                  {formatFileName(doc.fileName)}
                </Typography>
                <IconButton onClick={() => handleDelete(doc.id)} className="!ml-5">
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Grid>
          ))
        ) : (
          <Typography variant="body2" color="textSecondary" className='!pl-4'>
            No documents found for this project.
          </Typography>
        )}
      </Grid>


      {/* Modal for Adding Document */}
      <Dialog open={open} onClose={() => setOpen(false)} PaperProps={{
        style: {
          borderRadius: 20,
          backgroundColor: "#fcfcfc"
        },
      }}>
        <DialogTitle>
          Add New Document
          <IconButton
            className="!text-[#1D34D8]"
            aria-label="close"
            onClick={() => setOpen(false)}
            sx={{
              position: 'absolute',
              right: 8,
              top: 8,
            }}
          >
            <CancelOutlinedIcon />
          </IconButton>
        </DialogTitle>
        <Formik
          initialValues={{ Files: null }}
          validationSchema={validationSchema}
          onSubmit={handleAddDocument}
        >
          {({ setFieldValue, errors, touched, values }) => (
            <Form>
              <DialogContent>
                <DropzoneField setFieldValue={setFieldValue} values={values} />
                {touched.Files && errors.Files && (
                  <Typography color="error" variant="body2" mt={2}>
                    {errors.Files}
                  </Typography>
                )}
              </DialogContent>
              <DialogActions className='!px-6 !py-4'>
                <Button onClick={() => setOpen(false)} className='!text-[#1D34D8]'>Cancel</Button>
                <Button type="submit" variant="contained" className='!bg-[#1D34D8]'>Add Document</Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    </Box>
  );
}
