//import React, { useEffect } from 'react';
import { Navigate } from 'react-router-dom';
//import { useAuth } from '../../context/authContext';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';

export const PrivateRoute = ({ loginPath, children, allowedRoles }) => {

    const cookies = new Cookies();
    let user = cookies.get('user');

    if (!user)
        return (<Navigate to={loginPath} replace />);


    if(!!allowedRoles && !allowedRoles.some(role => user?.authState?.roles?.includes(role))){
        console.log(user)
        Swal.fire({
            title: 'Unauthorized!',
            text: `Only ${allowedRoles.join(', ')} can join`,
            icon: 'warning',
            showConfirmButton: true,
            timer: 2000
          })
          cookies.remove('user', {path:'/'})
          return (<Navigate to={loginPath} replace />);
    }

    return (
        <>
            {children}
        </>
    );
};