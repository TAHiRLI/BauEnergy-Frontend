import { Avatar, Typography } from "@mui/material";
import { jwtDecode } from 'jwt-decode';
import { useAuth } from "../../context/authContext";

const UserInfo = () => {
  const { user } = useAuth(); 

  const decodedToken = user?.token ? jwtDecode(user.token) : null;

  //console.log("Decoded Token:", decodedToken);

  if (!decodedToken) {
    return <Typography className="text-sm text-gray-500">No user logged in</Typography>;
  }

  const fullName = decodedToken.FullName || decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name"];
  const email = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"]?.[0]; // Assuming email is in an array
  const role = decodedToken["http://schemas.microsoft.com/ws/2008/06/identity/claims/role"]; // Assuming role is in an array

  
  return (
    <div className="flex items-center space-x-2">
      <Avatar className="bg-gray-200" />
      <div>
        {/* <Typography className="text-sm text-gray-500">{email}</Typography>*/}
        <Typography className="font-bold text-black">
          {fullName || 'Team Construction'} 
        </Typography>
        <Typography className="text-sm text-gray-500">{role}</Typography> 
      </div>
    </div>
  );
};

export default UserInfo;


