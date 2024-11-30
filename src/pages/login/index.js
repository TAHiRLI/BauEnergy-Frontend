import React, { useState } from 'react';
import * as yup from 'yup';
import { Formik, Form, Field } from 'formik';
import { useNavigate, useLocation } from 'react-router-dom';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import Cookies from 'universal-cookie';
import { AuthActions, useAuth } from '../../context/authContext';
import { loginService } from '../../APIs/Services/login.service';
import dayjs from 'dayjs';
import { ROUTES } from '../routes/routes';

const validationSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup
    .string()
    .required('Password is required')
    .min(3, 'Password is too short')
    .max(20, 'Password is too long'),
});

export const LoginPage = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const cookies = new Cookies();
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [token, setToken] = useState(false);
  const [renderReset, setRenderReset] = useState(false);
 
  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleLogin = async (values, { setFieldError }) => {
    dispatch({ type: AuthActions.start });
    try {
      let res = await loginService.login(values);
      if (res.statusCode === 200) {
        const user = {
          hasCompletedTutorial: res.hasCompletedTutorial,
          token: res.data.token,
          userId: res.data.userId,
          tokenType: 'Bearer',
          authState: res.userState,
        };

        cookies.set('user', JSON.stringify(user), {
          expires: new Date(dayjs(res.data.expiration)),
          path: '/',
        });

        dispatch({ type: AuthActions.success, payload: user });

        // Redirect to the original path if it exists, otherwise go to the home page
        const redirectPath = location.state?.from?.pathname || ROUTES.BASE;
        navigate(redirectPath, { replace: true });
      }
    } catch (err) {
      if (err.response?.status === 403) {
        setToken(err.response?.data?.resetToken);
        setErrorMessage(err.response?.data?.message || 'Password reset required.');
        setRenderReset(true);
      } else {
        setErrorMessage('Incorrect email or password');
      }

      dispatch({ type: AuthActions.failure, payload: err.message });
    }
  };

  const handlePasswordReset = () => {
    navigate(ROUTES.RESET_PASSWORD, { state: { token } });
  };
  

  return (
    <div className="flex flex-col-reverse sm:flex-row    sm:h-full bg-gray-100">
      {/* Left Section */}
      <div className="flex flex-col justify-start items-start w-full max-w-[100%] sm:max-w-[50%] pt-12 bg-white  shadow-md px-4 sm:px-[30px] md:px-[100px] xl:px-[150px] h-screen">
        <div className='hidden sm:flex justify-between items-end w-full mb-14'>
          <img src="/BauEnergy logo.png" alt="BauEnergy Login" className='w-[77px] h-[59px] ' />
          <img src="/Powered by logo.png" alt="BauEnergy Login" className='w-[174px] h-[35px]'/>
        </div>
        <div className='mt-1 sm:mt-5'>
          <h2 className="text-3xl font-bold mb-4 text-gray-800">Welcome</h2>
          <p className="mb-8 text-gray-600">
            You don't have an account? Please contact  
            <a 
              href="mailto:info@must-analytics.com" 
              className="text-blue-500 underline ml-1"
            >
              info@must-analytics.com
            </a>
          </p>
          <Formik
            initialValues={{ email: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleLogin}
          >
            {({ errors, submitCount, isSubmitting }) => (
              <Form className="w-full">
                {/* Email Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Email address</label>
                  <Field
                    type="email"
                    name="email"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  {submitCount > 0 && errors.email && (
                    <div className="text-red-500 text-sm mt-1">{errors.email}</div>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                  <div className="relative">
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name="password"
                      className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <div
                      className="absolute inset-y-0 right-3 flex items-center cursor-pointer text-gray-500"
                      onClick={handleClickShowPassword}
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </div>
                  </div>
                  {submitCount > 0 && errors.password && (
                    <div className="text-red-500 text-sm mt-1">{errors.password}</div>
                  )}
                </div>

                {/* Error Message */}
                {errorMessage && (
                  <div className="text-red-500 text-sm mb-4">{errorMessage}</div>
                )}

                {/* Submit Button */}
                <button
                  type="submit"
                  className="w-full !bg-[#1D34D8] text-white py-3 rounded-3xl hover:bg-blue-800 transition duration-200 mt-7"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Logging in...' : 'Continue'}
                </button>

                {renderReset && (
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="w-full bg-red-500 text-white p-2 rounded-3xl mt-4 hover:bg-red-600"
                >
                  Reset Password
                </button>
              )}
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
  );
};

export default LoginPage;
