import React from 'react';
//import { ColorModeProvider } from './colorMode.context';
import { AuthProvider } from './authContext';
import { InstrumentProvider } from './instrumentContext';
import { ProjectProvider } from './projectContext';

export const Providers = ({ children }) => {
    return (
        <>
            <AuthProvider>
                <ProjectProvider>
                    <InstrumentProvider>
                        {children}
                    </InstrumentProvider>
                </ProjectProvider>
            </AuthProvider>
        </>
    );
};