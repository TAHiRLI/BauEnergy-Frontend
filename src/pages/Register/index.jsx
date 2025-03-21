import React from 'react';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { Alert } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userSerivce } from '../../APIs/Services/user.service';

// Define validation schema with phone number
// const validationSchema = Yup.object({
//   Username: Yup.string().required('UserName is required'),
//   FullName: Yup.string().required('Name is required'),
//   Email: Yup.string().email('Invalid email').required('Email is required'),
//   PhoneNumber: Yup.string()
//     .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid (must include country code)')
//     .required('Phone number is required'),
//   Password: Yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
//   PasswordConfirm: Yup.string()
//     .oneOf([Yup.ref('Password'), null], 'Passwords must match') // Use 'Password' instead of 'password'
//     .required('Password confirmation is required'),
// 
// });

const RegistrationView = () => {
  const [serverError, setServerError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const navigate = useNavigate(); 

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      console.log('Register values:', values);
      
      const res = userSerivce.register(values)

      console.log('Response:', res);
      setRegistrationSuccess(true);
      
      navigate("/"); 
    } catch (error) {
      console.error('Error:', error.response);
      setServerError(error.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh" bgcolor="#f5f5f5">
      <Paper elevation={3} sx={{ p: 3, maxWidth: 400 }}>
        <Typography variant="h5" gutterBottom>
          Register
        </Typography>
        {serverError && <Alert severity="error">{serverError}</Alert>}
        {registrationSuccess && <Alert severity="success">Registration completed successfully!</Alert>}

        <Formik
          initialValues={{
            Email: '',
            //PhoneNumber: '', 
            Password: '',
            //PasswordConfirm: '',
          }}
          //validationSchema={validationSchema}
          onSubmit={handleRegister}
        >
          {({ isSubmitting, errors, touched }) => (
            <Form>    

              <Field
                as={TextField}
                label="FirstName"
                name="FirstName"
                type="text"
                fullWidth
                margin="dense"
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />  
              <Field
                as={TextField}
                label="LastName"
                name="LastName"
                type="text"
                fullWidth
                margin="dense"
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />
              <Field
                as={TextField}
                label="Email"
                name="Email"
                type="email"
                fullWidth
                margin="dense"
                error={touched.email && !!errors.email}
                helperText={touched.email && errors.email}
              />


              <Field
                as={TextField}
                label="Phone Number (with country code)"
                name="PhoneNumber"
                fullWidth
                margin="dense"
                error={touched.phoneNumber && !!errors.phoneNumber}
                helperText={touched.phoneNumber && errors.phoneNumber}
              />

              <Field
                as={TextField}
                label="BirthdDate"
                name="BirthdDate"
                type="date"
                fullWidth
                margin="dense"
                error={touched.password && !!errors.password}
                helperText={touched.password && errors.password}
              />

              <Field
                as={TextField}
                label="Password"
                name="Password"
                type="password"
                fullWidth
                margin="dense"
                error={touched.passwordConfirm && !!errors.passwordConfirm}
                helperText={touched.passwordConfirm && errors.passwordConfirm}
              />

              <Box mt={2}>
                <Button type="submit" variant="contained" color="primary" fullWidth disabled={isSubmitting}>
                  {isSubmitting ? 'Registering...' : 'Register'}
                </Button>
              </Box>
            </Form>
          )}
        </Formik>
      </Paper>
    </Box>
  );
};

export default RegistrationView;
