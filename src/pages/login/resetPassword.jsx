import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, IconButton, InputAdornment, TextField, styled, Container, Box, Typography, Paper } from '@mui/material';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AuthActions, useAuth } from '../../context/authContext';
import { useNavigate, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { loginService } from '../../APIs/Services/login.service';
import { ROUTES } from '../routes/routes';
import dayjs from 'dayjs';

const ResetPassword = () => {
  const location = useLocation();  
  const token = location.state?.token;
  console.log("🚀 ~ ResetPassword ~ token:", token)

  const { t } = useTranslation();

  // Validation Schema
  const validationSchema = yup.object().shape({
    email: yup.string().required(t('requiredField')).max(50, t('EmailMax')),
    password: yup.string().required(t('requiredField')).min(3, t("passwordMin")).max(20, t("passwordMax")),
  });

  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const cookies = new Cookies();

  const handleFormSubmit = async (values, { setFieldError }) => {
    dispatch({ type: AuthActions.start });
    try {
      let res = await loginService.resetPassword(values);
      console.log("🚀 ~ handleFormSubmit ~ res:", res)
      if (res.status === 200) {
        const user = {
          hasCompletedTutorial: res.data?.hasCompletedTutorial,
          token: res.data.token,
          tokenType: "Bearer",
          authState: res.data.userState,
        };
        cookies.set('user', JSON.stringify(user), { expires: new Date(dayjs(res.data.expiresIn)), path: '/' });
        dispatch({ type: AuthActions.success, payload: user });
        navigate(ROUTES.BASE, { replace: true });
      }
    } catch (err) {
      console.log("🚀 ~ handleFormSubmit ~ err:", err)
      setFieldError("email", t("Incorrect Email"));
      setFieldError("password", t("Incorrect Password"));
      dispatch({ type: AuthActions.failure, payload: err });
    }
  };

  const [showPassword, setShowPassword] = useState(false);

  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const CssTextField = styled(TextField)({
    '& .MuiInput-underline:after': { borderBottomColor: '#117c77' },
    '& .MuiOutlinedInput-root': {
      '& fieldset': { borderColor: '#117c77' },
      '&:hover fieldset': { borderColor: '#117c77' },
      '&.Mui-focused fieldset': { borderColor: '#117c77' },
    },
  });

  return (
    <Box 
      display="flex" 
      justifyContent="center" 
      alignItems="center" 
      minHeight="100vh"
    >
      <Container maxWidth="sm">
        <Paper elevation={3} sx={{ p: 4, borderRadius: 3 }}>
          <Box textAlign="center" mb={3}>
            <Typography variant="h4" gutterBottom className='!text-[#1D34D8]'>
              {t("Reset Password")}
            </Typography>
            {/* <Typography variant="body1" color="textSecondary">
              {t("ResetPasswordMessage")}
            </Typography> */}
          </Box>

          <Formik
            initialValues={{ email: '', password: '', token: token }}
            onSubmit={handleFormSubmit}
            validationSchema={validationSchema}
            enableReinitialize={true}
          >
            {({ values, errors, touched, handleChange, handleBlur, handleSubmit, isSubmitting }) => (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <CssTextField
                  label={t("Email")}
                  required
                  variant="outlined"
                  type="text"
                  name="email"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.email}
                  error={!!touched.email && !!errors.email}
                  helperText={errors.email && touched.email && errors.email}
                  fullWidth
                  margin="normal"
                />

                <CssTextField
                  label={t("New Password")}
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  onChange={handleChange}
                  onBlur={handleBlur}
                  value={values.password}
                  error={!!touched.password && !!errors.password}
                  helperText={errors.password && touched.password && errors.password}
                  required
                  fullWidth
                  margin="normal"
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton onClick={handleClickShowPassword} onMouseDown={handleMouseDownPassword} edge="end">
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />

                <Button 
                  variant="contained"
                  className='!bg-[#1D34D8]' 
                  type="submit" 
                  disabled={isSubmitting} 
                  fullWidth 
                  sx={{
                    mt: 3,
                    py: 1.5,
                    borderRadius: 2,
                    fontWeight: 'bold',
                    fontSize: '1rem'
                  }}
                >
                  {t("Submit")}
                </Button>
              </form>
            )}
          </Formik>
        </Paper>
      </Container>
    </Box>
  );
};

export default ResetPassword;
