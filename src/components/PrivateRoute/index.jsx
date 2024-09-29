import { jwtDecode } from "jwt-decode";
import { Navigate } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';

export const PrivateRoute = ({ loginPath, children, allowedRoles }) => {

    const cookies = new Cookies();
    let user = cookies.get('user'); 
    //console.log(user)
    let token = user?.token

    if (!token)
        return (<Navigate to={loginPath} replace />);

    let decodedToken;
    try {
        decodedToken = jwtDecode(token);
        console.log("Decoded token:", decodedToken);
    } catch (error) {
        console.error("Invalid token:", error);
        return (<Navigate to={loginPath} replace />);
    }

    const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || []; 
    console.log(userRoles)
    if (!!allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
        Swal.fire({
            title: 'Unauthorized!',
            text: `Only ${allowedRoles.join(', ')} can access this page.`,
            icon: 'warning',
            showConfirmButton: true,
            timer: 2000
        });
        cookies.remove('token', { path: '/' });
        return (<Navigate to={loginPath} replace />);
    }

    return (
        <>
            {children}
        </>
    );
};
