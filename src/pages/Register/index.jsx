import React from 'react';
import { Formik, Form, Field } from 'formik';
import { Box, Button, TextField, InputAdornment, IconButton } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userSerivce } from '../../APIs/Services/user.service';
import { useTranslation } from "react-i18next";
import * as yup from 'yup';
import { Visibility, VisibilityOff } from "@mui/icons-material";
import Swal from 'sweetalert2';

const validationSchema = yup.object({
  FirstName: yup.string().required('FirstName is required'),
  LastName: yup.string().required('LastName is required'),
  BirthDate: yup.date().required('BirthDate is required'),
  Email: yup.string().email('Invalid email').required('Email is required'),
  // PhoneNumber: yup.string()
  //   .matches(/^\+?[1-9]\d{1,14}$/, 'Phone number is not valid (must include country code)')
  //   .required('Phone number is required'),
  Password: yup.string().min(6, 'Password must be at least 6 characters').required('Password is required'),
  PasswordConfirm: yup.string()
  .oneOf([yup.ref('Password'), null], 'Passwords must match')
  .required('Confirm Password is required'),
});

const RegistrationView = () => {
  const { t } = useTranslation();
  const [serverError, setServerError] = useState(null);
  const [registrationSuccess, setRegistrationSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate(); 

  const handleRegister = async (values, { setSubmitting }) => {
    try {
      console.log('Register values:', values);
      
      const res = await userSerivce.register(values)

      console.log('Response:', res);
      setRegistrationSuccess(true);
      
      Swal.fire({
        title: "Success!",
        text: "res.data.message",
        icon: "success",
        confirmButtonText: "OK",
      }).then(() => {
        navigate("/"); 
      });
    } catch (error) {
      console.log(error.response.data.error)
      console.error('Error:', error.response);
      Swal.fire({
        title: "Error!",
        text: error.response.data.error,
        icon: "error",
        confirmButtonText: "OK",
      })

      setServerError(error.response?.data?.message || 'Registration failed.');
    } finally {
      setSubmitting(false);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <>
    <div className="flex flex-col-reverse sm:flex-row sm:h-full bg-gray-100">
      {/* Left Section */}
      <div className="flex flex-col justify-start items-start w-full max-w-[100%] sm:max-w-[50%] pt-8 bg-white  shadow-md px-4 sm:px-[30px] md:px-[100px] xl:px-[150px] h-screen">
        <div className='hidden sm:flex justify-between items-end w-full mb-6'>
          <img src="/BauEnergy logo.png" alt="BauEnergy Login" className='w-[77px] h-[59px] ' />
          <img src="/Powered by logo.png" alt="BauEnergy Login" className='w-[174px] h-[35px]'/>
        </div>
        <div className='mt-1  w-full'>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome</h2>
          <Formik
initialValues={{
//Email: '',
//PhoneNumber: '', 
//Password: '',
//PasswordConfirm: '',
}}
validationSchema={validationSchema}
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
      error={touched.FirstName && !!errors.FirstName}
      helperText={touched.FirstName && errors.FirstName}
    />  

    <Field
      as={TextField}
      label="Last Name"
      name="LastName"
      type="text"
      fullWidth
      margin="dense"
      error={touched.LastName && !!errors.LastName}
      helperText={touched.LastName && errors.LastName}
    />

    <Field
      as={TextField}
      label="Email"
      name="Email"
      type="email"
      fullWidth
      margin="dense"
      error={touched.Email && !!errors.Email}
      helperText={touched.Email && errors.Email}
    />

    {/* <Field
      as={TextField}
      label="Phone Number (with country code)"
      name="PhoneNumber"
      fullWidth
      margin="dense"
      error={touched.PhoneNumber && !!errors.PhoneNumber}
      helperText={touched.PhoneNumber && errors.PhoneNumber}
    /> */}

    <Field
      as={TextField}
      label={t("PopUp:BirthDate")}
      name="BirthDate"
      type="date"
      fullWidth
      margin="dense"
      error={touched.BirthDate && !!errors.BirthDate}
      helperText={touched.BirthDate && errors.BirthDate}
      InputLabelProps={{ shrink: true }}
    />

    <Field
      as={TextField}
      label="Password"
      name="Password"
      type={showPassword ? "text" : "password"}
      fullWidth
      margin="dense"
      error={touched.Password && !!errors.Password}
      helperText={touched.Password && errors.Password}
      InputProps={{
        endAdornment: (
          <InputAdornment position="end">
            <IconButton onClick={togglePasswordVisibility} edge="end">
              {showPassword ? <VisibilityOff /> : <Visibility />}
            </IconButton>
          </InputAdornment>
        ),
      }}
    />

  <Field as={TextField} 
    label="Confirm Password" 
    name="PasswordConfirm" 
    type={showConfirmPassword ? "text" : "password"} 
    fullWidth 
    margin="dense"
    error={touched.PasswordConfirm && !!errors.PasswordConfirm}
    helperText={touched.PasswordConfirm && errors.PasswordConfirm}
    InputProps={{
      endAdornment: (
        <InputAdornment position="end">
          <IconButton onClick={() => setShowConfirmPassword(!showConfirmPassword)} edge="end">
            {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
          </IconButton>
        </InputAdornment>
      ),
    }}
    />


  <Box mt={2}>
    <Button type="submit" fullWidth disabled={isSubmitting}
      className="w-full !bg-[#1D34D8] !text-white !font-medium !py-3 !rounded-3xl !hover:bg-blue-800 !transition !duration-200"
    >
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
    </>
  );
};

export default RegistrationView;
