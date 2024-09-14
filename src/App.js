import React from 'react';
import { router } from './pages/routes/router';
import { RouterProvider } from "react-router-dom";

export const App = () => {
    return (
        <RouterProvider router={router} />
    );
};
export default App