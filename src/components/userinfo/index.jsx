// import React from 'react'
// import { List, ListItem, ListItemIcon, ListItemText, Collapse } from '@mui/material';
// import PersonOutlineOutlinedIcon from '@mui/icons-material/PersonOutlineOutlined';

// function UserInfo() {
//   return (
//     <>
//         <List>
//           <ListItem div>
//             <ListItemIcon style={{ minWidth: '20px' }} className="mr-3">
//               <PersonOutlineOutlinedIcon className="text-black" />
//             </ListItemIcon>
//             <div>
//                 <p>mirheyder@gmaiil.com</p>
//                 <p></p>
//             </div>

//           </ListItem>
//         </List>
//     </>
//   )
// }

// export default UserInfo


import { Avatar, Typography } from "@mui/material";

const UserInfo = () => {
  return (
    <div className="flex items-center space-x-2 ">
      <Avatar className="bg-gray-200 " />
      <div>
        <Typography className="text-sm text-gray-500">email@gmail.com</Typography>
        <p className="font-bold text-black  ">Team Construction</p>
      </div>
    </div>
  );
};

export default UserInfo;
