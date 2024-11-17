import { jwtDecode } from "jwt-decode";
import { Navigate, useLocation } from 'react-router-dom';
import Cookies from 'universal-cookie';
import Swal from 'sweetalert2';

export const PrivateRoute = ({ loginPath, children, allowedRoles }) => {
    const cookies = new Cookies();
    const location = useLocation();
    let user = cookies.get('user');
    let token = user?.token;

    if (!token) {
        // Redirect to login with the current location to return to after login
        return <Navigate to={loginPath} replace state={{ from: location }} />;
    }

    let decodedToken;
    try {
        decodedToken = jwtDecode(token);
    } catch (error) {
        console.error("Invalid token:", error);
        // Redirect to login if the token is invalid
        return <Navigate to={loginPath} replace state={{ from: location }} />;
    }

    const userRoles = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"] || [];
    
    if (allowedRoles && !allowedRoles.some(role => userRoles.includes(role))) {
        // Show unauthorized alert and clear token
        Swal.fire({
            title: 'Unauthorized!',
            text: `Only ${allowedRoles.join(', ')} can access this page.`,
            icon: 'warning',
            showConfirmButton: true,
            timer: 2000
        });
        cookies.remove('user', { path: '/' });
        return <Navigate to={loginPath} replace state={{ from: location }} />;
    }

    return <>{children}</>;
};
