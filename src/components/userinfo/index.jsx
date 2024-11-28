import React, { useEffect, useState } from "react";
import { Avatar, Typography } from "@mui/material";
import {userSerivce} from "../../APIs/Services/user.service"; 
import {jwtDecode} from "jwt-decode";
import { useAuth } from "../../context/authContext";


const UserInfo = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userData, setUserData] = useState(null); 
  const { user } = useAuth();

  const decodedToken = user?.token ? jwtDecode(user.token) : null;
  const userEmail = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  
    useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await userSerivce.getByEmail(userEmail); 
        const updatedUser = response.data;
        setUserData(updatedUser);

      } catch (err) {
        console.error("Error fetching user data:", err);
        setError("Failed to load user data.");
      } finally {
        setLoading(false);
      }
    };

    if (userEmail) {
      fetchUserData();
    }
  }, [userEmail]);

  if (loading) {
    return <Typography className="text-sm text-gray-500">Loading...</Typography>;
  }

  if (error) {
    return <Typography className="text-sm text-red-500">{error}</Typography>;
  }

  if (!userData) {
    return <Typography className="text-sm text-gray-500">No user data found</Typography>;
  }


  return (
    <div className="flex items-center space-x-2">
      <Avatar className="bg-gray-200" />
      <div>
        {/* Display the user's full name */}
        <Typography className="font-bold text-black">{userData.fullName}</Typography>
        {/* Display the user's role */}
        <Typography className="text-sm text-gray-500">
                {Array.isArray(userData.role) 
          ? userData.role.map(role => role.replace(/_/g, ' ')).join(", ") 
          : userData.role.replace(/_/g, ' ')}        
        </Typography>
      </div>
    </div>
  );
};

export default UserInfo;
