import { createContext, useContext, useReducer } from "react";

const DocumentsContext = createContext();

const initialValues = {
    data:null,
    loading:false,
    error:false
}

 export const DocumentsActions =  {
    start: 'START',
    success: 'SUCCESS',
    failure: 'FAILURE',
  };

export const DocumentsReducer = (state, action) => {
    switch (action.type) {
      case DocumentsActions.start:
        return {
          data: null,
          loading: true,
          error: null,
        };
      case DocumentsActions.success:
        return {
          data: action.payload,
          loading: false,
          error: null,
        };
      case DocumentsActions.failure:
        return {
          data: null,
          loading: false,
          error: action.payload,
        };
   
      default:
        return state;
    }
  };
  
export const DocumentsProvider = ({children}) => {

    const [state, dispatch] = useReducer(DocumentsReducer, initialValues);

  return (
    <DocumentsContext.Provider value={{state, dispatch}}>
        {children}
    </DocumentsContext.Provider>
  )
}

export const useDocuments = ()=> useContext(DocumentsContext)