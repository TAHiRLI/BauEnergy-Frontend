import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Box, Button, TextField, Typography, Paper } from '@mui/material';
import { Alert } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userSerivce } from '../../APIs/Services/user.service';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';

const validationSchema = yup.object({
  FirstName: yup.string().required('FirstName is required'),
  LastName: yup.string().required('LastName is required'),
  BirthDate: yup.date().required('BirthDate is required'),
  Email: yup.string().email('Invalid email').required('Email is required'),
  PhoneNumber: yup.string()
    .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid (must include country code)')
    .required('Phone number is required'),
  Password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),

});

const RegistrationView = () => {
  const { t } = useTranslation();
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
    <>
    <div className="flex flex-col-reverse sm:flex-row    sm:h-full bg-gray-100">
      {/* Left Section */}
      <div className="flex flex-col justify-start items-start w-full max-w-[100%] sm:max-w-[50%] pt-12 bg-white  shadow-md px-4 sm:px-[30px] md:px-[100px] xl:px-[150px] h-screen">
        <div className='hidden sm:flex justify-between items-end w-full mb-14'>
          <img src="/BauEnergy logo.png" alt="BauEnergy Login" className='w-[77px] h-[59px] ' />
          <img src="/Powered by logo.png" alt="BauEnergy Login" className='w-[174px] h-[35px]'/>
        </div>
        <div className='mt-1  w-full'>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome</h2>
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
    label="First Name"
    name="FirstName"
    type="text"
    fullWidth
    margin="dense"
    error={touched.email && !!errors.email}
    helperText={touched.email && errors.email}
  />  
  <Field
    as={TextField}
    label="Last Name"
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
    label={t("columns:BirthDate")}
    name="BirthDate"
    type="date"
    fullWidth
    margin="dense"
    // error={touched.password && !!errors.password}
    // helperText={touched.password && errors.password}
    InputLabelProps={{ shrink: true }}
    InputProps={{
      inputProps: { style: { cursor: 'pointer' } },
    }}
    onClick={(e) => {
      const inputElement = e.currentTarget.querySelector('input');
      if (inputElement) {
        inputElement.showPicker(); 
      }                  }}
    sx={{
      cursor: 'pointer',  
      '.MuiInputBase-input': { cursor: 'pointer' }, 
    }}                                  
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
        </div>
      </div>

      {/* Right Section */}
      <div className='w-full'>
        <div className='flex sm:hidden p-2 px-5 justify-between items-end w-full mb-3 '>
          <img src="/BauEnergy logo.png" alt="BauEnergy Login" className='w-[77px] h-[59px] ' />
          <img src="/Powered by logo.png" alt="BauEnergy Login" className='w-[174px] h-[35px]'/>
        </div>
        <div className="sm:flex flex-1 bg-blue-100 justify-center items-center w-full">
            <img src={`${process.env.REACT_APP_DOCUMENT_URL}/assets/videos/Construction.gif`}
 alt="BauEnergy Animation" className='w-full sm:h-screen h-[300px] ' loading='lazy'/>
          </div>
      </div>
    </div>

{/* <Paper elevation={3} sx={{ p: 3, maxWidth: 400 }}>
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
</Paper> */}
    </>
  );
};

export default RegistrationView;
