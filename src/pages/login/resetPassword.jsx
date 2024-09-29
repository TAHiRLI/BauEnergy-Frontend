import { Visibility, VisibilityOff } from '@mui/icons-material';
import { Button, Checkbox, FormControlLabel, IconButton, InputAdornment, TextField, styled } from '@mui/material';
import { Formik } from 'formik';
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { AuthActions, useAuth } from '../../context/authContext';
import { useNavigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import { loginService } from '../../APIs/Services/login.service';
import { ROUTES } from '../routes/routes';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';

const ResetPassword = () => {
    const location = useLocation();  // Get the location object
    const token = location.state?.token;  // Access the token from the state

  //========================
  // Handle Translation
  //========================
  const { t } = useTranslation();

    
  //========================
  // Form validation
  //========================

  const validationSchema = yup.object().shape({
    email: yup.string().required(t('requiredField')).max(50, t('messages:EmailMax')),
    password: yup.string().required(t('requiredField')).min(3, t("messages:passwordMin")).max(20, t("messages:passwordMax")),
    
  });

  //========================
  // Handle Form submit
  //========================
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const cookies = new Cookies();
  console.log(token)

    const handleFormSubmit = async (values, { setFieldError }) => {
        dispatch({ type: AuthActions.start });
        try {
            console.log('Form Values:', values); // Will include token here
            let res = await loginService.resetPassword(values);
          console.log(res)
          if (res.status === 200) {
            const user = {
              token: res.data.token,
              tokenType: "Bearer",
              authState: res.data.userState,
    
            };
            cookies.set('user', JSON.stringify(user), { expires: new Date(dayjs(res.data.expiresIn)), path: '/' });
    
            dispatch({ type: AuthActions.success, payload: user });
    
            navigate(ROUTES.BASE, { replace: true });
          }
       
    
        } catch (err) {
       
          setFieldError("email", t("messages:incorrectPassword"));
          setFieldError("password", t("messages:incorrectPassword"));
          dispatch({ type: AuthActions.failure, payload: err });
    
        }
    
      };

    //========================
    // Handle password show/hide 
    //========================
    const [showPassword, setShowPassword] = useState(false);

    const handleClickShowPassword = () => setShowPassword((show) => !show);

    const handleMouseDownPassword = (event) => {
        event.preventDefault();
    };

//========================
  // Styling 
  //========================
  const CssTextField = styled(TextField)({

    '& .MuiInput-underline:after': {
      borderBottomColor: '#117c77',
    },
    '& .MuiOutlinedInput-root': {
      '& fieldset': {
        borderColor: '#117c77',
      },
      '&:hover fieldset': {
        borderColor: '#117c77',
      },
      '&.Mui-focused fieldset': {
        borderColor: '#117c77',
      },
    },
  });

    return (
        <>
            <h2>{t("ResetPassword")}</h2>
            <p className='text-sm my-3'>{t("ResetPasswordMessage")}</p>

            <Formik
                initialValues={{ email: '', password: '', token: token}}
                onSubmit={handleFormSubmit}
                validationSchema={validationSchema}
            >
                {({
                    values,
                    errors,
                    touched,
                    handleChange,
                    handleBlur,
                    handleSubmit,
                    isSubmitting,
                    /* and other goodies */
                }) => (
                    <form onSubmit={handleSubmit} className='flex flex-col grow gap-5 justify-evenly'>

                        <CssTextField
                            id="outlined-basic"
                            label={t("Email")}
                            required
                            variant="outlined"
                            type="text"
                            name="email"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.email}
                            error={!!touched.email && !!errors.email}
                            helperText={errors.email && touched.email && errors.email}
                        />



                        <CssTextField
                            fullWidth
                            type={showPassword ? 'text' : 'password'}
                            label={t("New Password")}
                            id="password"
                            name="password"
                            onChange={handleChange}
                            onBlur={handleBlur}
                            defaultValue={values.password}
                            error={!!touched.password && !!errors.password}
                            helperText={errors.password && touched.password && errors.password}
                            required
                            InputProps={{
                                endAdornment: <InputAdornment
                                    position="end"
                                    aria-label="toggle password visibility"
                                    onClick={handleClickShowPassword}
                                    onMouseDown={handleMouseDownPassword}
                                    role="button"
                                    edge="end">
                                    <IconButton>
                                        {showPassword ? <VisibilityOff /> : <Visibility />}
                                    </IconButton>
                                </InputAdornment>,
                            }}

                        />

                        <Button variant='contained' type="submit" disabled={isSubmitting}>
                            {t("Submit")}
                        </Button>
                    </form>
                )}

            </Formik>
        </>
        
    );
};

export default ResetPassword;