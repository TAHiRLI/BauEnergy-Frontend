import React from 'react';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Box, Button, TextField, MenuItem, Select, FormControl, InputLabel } from '@mui/material';
import Swal from 'sweetalert2';
import { teamMemberService } from '../../APIs/Services/teammember.service';
import { useNavigate } from 'react-router-dom';

export default function AddTeamMember({ projectId }) {
  const navigate = useNavigate();

  const formik = useFormik({
    initialValues: {
      name: '',
      lastName: '',
      email: '',
      role: '',
      image: null,
      projectId: projectId,
    },
    validationSchema: Yup.object({
      name: Yup.string()
        .required('Name is required')
        .min(2, 'Name must be at least 2 characters'),
      lastName: Yup.string()
        .required('Last Name is required')
        .min(2, 'Last Name must be at least 2 characters'),
      email: Yup.string()
        .email('Invalid email address')
        .required('Email is required'),
      role: Yup.number()
        .required('Role is required')
        .integer('Role must be a valid integer'),
      image: Yup.mixed().nullable().test('fileSize', 'File too large', (value) => {
        return value ? value.size <= 2000000 : true;
      }),
    }),
    onSubmit: async (values) => {
      try {
        const formData = new FormData();
        formData.append('name', values.name);
        formData.append('lastName', values.lastName);
        formData.append('email', values.email);
        formData.append('role', values.role);
        if (values.image) formData.append('image', values.image);
        formData.append('projectId', values.projectId);

        await teamMemberService.addTeamMember(formData);

        Swal.fire({
          title: 'Success!',
          text: 'Team member added successfully!',
          icon: 'success',
          timer: 2000,
        });

        navigate(`/project/${projectId}`); // Redirect to project page after adding
      } catch (error) {
        console.error('Error adding team member:', error);
        Swal.fire({
          title: 'Error!',
          text: 'Failed to add team member.',
          icon: 'error',
          timer: 2000,
        });
      }
    },
  });

  return (
    <Box component="form" onSubmit={formik.handleSubmit} sx={{ width: '100%', maxWidth: 600, mx: 'auto' }}>
      <TextField
        fullWidth
        margin="normal"
        label="Name"
        name="name"
        value={formik.values.name}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.name && Boolean(formik.errors.name)}
        helperText={formik.touched.name && formik.errors.name}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Last Name"
        name="lastName"
        value={formik.values.lastName}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.lastName && Boolean(formik.errors.lastName)}
        helperText={formik.touched.lastName && formik.errors.lastName}
      />
      <TextField
        fullWidth
        margin="normal"
        label="Email"
        name="email"
        value={formik.values.email}
        onChange={formik.handleChange}
        onBlur={formik.handleBlur}
        error={formik.touched.email && Boolean(formik.errors.email)}
        helperText={formik.touched.email && formik.errors.email}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel>Role</InputLabel>
        <Select
          name="role"
          value={formik.values.role}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          error={formik.touched.role && Boolean(formik.errors.role)}
        >
          <MenuItem value={1}>Admin</MenuItem>
          <MenuItem value={2}>Developer</MenuItem>
          <MenuItem value={3}>Designer</MenuItem>
        </Select>
        {formik.touched.role && formik.errors.role && <div style={{ color: 'red' }}>{formik.errors.role}</div>}
      </FormControl>
      <Button
        fullWidth
        variant="contained"
        component="label"
        sx={{ marginTop: 2 }}
      >
        Upload Image
        <input
          type="file"
          name="image"
          accept="image/*"
          onChange={(event) => formik.setFieldValue('image', event.target.files[0])}
          hidden
        />
      </Button>
      {formik.errors.image && formik.touched.image && (
        <div style={{ color: 'red', marginTop: '5px' }}>{formik.errors.image}</div>
      )}
      <Button
        fullWidth
        type="submit"
        variant="contained"
        color="primary"
        sx={{ marginTop: 2 }}
      >
        Add Team Member
      </Button>
    </Box>
  );
}
