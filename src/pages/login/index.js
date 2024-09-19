// import React, { useState } from 'react';
// import { loginService } from '../../APIs/Services/login.service'; // Adjust the import path as necessary
// import { useNavigate } from 'react-router-dom';

// const LoginPage = () => {
//     const [email, setEmail] = useState('');
//     const [password, setPassword] = useState('');
//     const [error, setError] = useState(null);
//     const navigate = useNavigate();

//     const handleLogin = async (event) => {
//         event.preventDefault();
//         setError(null);
        
//         try {
//             const body = { email, password };
//             const user = await loginService.login(body);
            
//             console.log(user)
//             navigate('/products'); 
//         } catch (error) {
//             setError('Invalid credentials or server error');
//         }
//     };

//     return (
//         <div className="flex items-center justify-center min-h-screen bg-gray-100">
//             <form className="bg-white p-6 rounded shadow-md w-full max-w-sm" onSubmit={handleLogin}>
//                 <h2 className="text-2xl font-bold mb-4">Login</h2>

//                 {error && <div className="text-red-500 mb-4">{error}</div>}

//                 <div className="mb-4">
//                     <label className="block text-sm font-medium mb-2">Email</label>
//                     <input
//                         type="email"
//                         className="w-full p-2 border border-gray-300 rounded"
//                         value={email}
//                         onChange={(e) => setEmail(e.target.value)}
//                         required
//                     />
//                 </div>

//                 <div className="mb-4">
//                     <label className="block text-sm font-medium mb-2">Password</label>
//                     <input
//                         type="password"
//                         className="w-full p-2 border border-gray-300 rounded"
//                         value={password}
//                         onChange={(e) => setPassword(e.target.value)}
//                         required
//                     />
//                 </div>

//                 <button
//                     type="submit"
//                     className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
//                 >
//                     Login
//                 </button>
//             </form>
//         </div>
//     );
// };

// export default LoginPage;

import React, { useState } from 'react';
import * as yup from 'yup';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { loginService } from '../../APIs/Services/login.service';
import { useNavigate } from 'react-router-dom';
import { ROUTES } from '../routes/routes';
import { AuthActions, useAuth } from '../../context/authContext';
import Cookies from 'universal-cookie';
import dayjs from 'dayjs';

// Define validation schema using Yup
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

  const handleLogin = async (values, { setFieldError }) => {
    dispatch({ type: AuthActions.start });
    try {
      let res = await loginService.login(values);
      console.log("🚀 ~ handleLogin ~ res:", res);

      if (res.status === 200) {
        const user = {
          token: res.data.token,
          tokenType: "Bearer",
          authState: res.data.userState,
        };

        // Set the token and user data in cookies
        cookies.set('user', JSON.stringify(user), { expires: new Date(dayjs(res.data.expiresIn)), path: '/' });

        // Dispatch success action
        dispatch({ type: AuthActions.success, payload: user });

        // Navigate to the base route after successful login
        navigate(ROUTES.BASE, { replace: true });
      }
    } catch (err) {
      // Check if the error is a 403 and display a reset token if needed
      if (err.response?.status === 403) {
        setToken(err.response?.data?.resetToken);
        setRenderReset(true);
      }

      // Set form field errors
      setFieldError('email', 'Incorrect email or password');
      setFieldError('password', 'Incorrect email or password');
      
      // Dispatch failure action
      dispatch({ type: AuthActions.failure, payload: err.message });
    }
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

            <button
              type="submit"
              className="w-full bg-blue-500 text-white p-2 rounded hover:bg-blue-600"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Logging in...' : 'Login'}
            </button>
          </Form>
        )}
      </Formik>
    </div>
  );
};

export default LoginPage;