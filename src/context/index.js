import React from 'react';
//import { ColorModeProvider } from './colorMode.context';
import { AuthProvider } from './authContext';
import { InstrumentProvider } from './instrumentContext';
import { ProjectProvider } from './projectContext';
import { DocumentsProvider } from './documentsContext';


export const Providers = ({ children }) => {
    return (
        <>
            <AuthProvider>
                <ProjectProvider>
                    <InstrumentProvider>
                        <DocumentsProvider>
                            {children}
                        </DocumentsProvider>
                    </InstrumentProvider>
                </ProjectProvider>
            </AuthProvider>
        </>
    );
};