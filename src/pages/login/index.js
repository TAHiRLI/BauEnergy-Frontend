import React, { useState } from 'react';
import * as yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginService } from '../../APIs/Services/login.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { AuthActions, useAuth } from '../../context/authContext';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';
import ResetPassword from './resetPassword';

const validationSchema = yup.object().shape({
  email: yup.string().email('Invalid email').required('Email is required'),
  password: yup.string().required('Password is required').min(3, 'Password is too short').max(20, 'Password is too long'),
});

export const LoginPage = () => {
  const { dispatch } = useAuth();
  const navigate = useNavigate();
  const cookies = new Cookies();
  const [renderReset, setRenderReset] = useState(false);
  const [token, setToken] = useState(false);
  const [errorMessage, setErrorMessage] = useState(''); // New state for error message

  const handleLogin = async (values, { setFieldError }) => {
    dispatch({ type: AuthActions.start });
    try {
      let res = await loginService.login(values);

      if (res.statusCode === 200) {
        const user = {
          token: res.data.token,
          tokenType: "Bearer",
          authState: res.data.userState,
        };

        cookies.set('user', JSON.stringify(user), { expires: new Date(dayjs(res.data.expiration)), path: '/' });
        
        dispatch({ type: AuthActions.success, payload: user });

        navigate(ROUTES.BASE, { replace: true });
      }
    } catch (err) {
      console.log(err.response);
      
      if (err.response?.status === 403) {
        setToken(err.response?.data?.resetToken);
        setErrorMessage(err.response?.data?.message || 'Password reset required.'); // Set error message from response
        setRenderReset(true);
      } else {
        setFieldError('email', 'Incorrect email or password');
        setFieldError('password', 'Incorrect email or password');
        setErrorMessage('Incorrect email or password'); // Set generic error message
      }

      dispatch({ type: AuthActions.failure, payload: err.message });
    }
  };

  const handlePasswordReset = () => {
    navigate(ROUTES.RESET_PASSWORD, { state: { token } });
    console.log(token)
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Formik
        initialValues={{ email: '', password: '' }}
        validationSchema={validationSchema}
        onSubmit={(values, actions) => handleLogin(values, actions)}
      >
        {({ isSubmitting }) => (
          <Form className="bg-white p-6 rounded shadow-md w-full max-w-sm">
            <h2 className="text-2xl font-bold mb-4">Login</h2>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Email</label>
              <Field
                type="email"
                name="email"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="email"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Password</label>
              <Field
                type="password"
                name="password"
                className="w-full p-2 border border-gray-300 rounded"
              />
              <ErrorMessage
                name="password"
                component="div"
                className="text-red-500 text-sm"
              />
            </div>

            {errorMessage && ( // Show error message if available
              <div className="mb-4 text-red-500 text-sm">{errorMessage}</div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>

            {/* Show reset password button if the reset password is required */}
            {renderReset && (
              <button
                type="button"
                onClick={handlePasswordReset}
                className="w-full bg-red-500 text-white p-2 rounded mt-4 hover:bg-red-600"
              >
                Reset Password
              </button>
            )}
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginPage;
