import React from 'react';
import { router } from './pages/routes/router';
import { RouterProvider } from "react-router-dom";
import './i18n';
import { Providers } from './context';

export const App = () => {
    return (    
            <Providers>
                <RouterProvider router={router} />
            </Providers>    
    );
};
export default App