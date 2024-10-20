import { createContext, useContext, useReducer } from "react";

const ProjectContext = createContext();

const initialValues = {
    data:null,
    loading:false,
    error:false
}

 export const ProjectsActions =  {
    start: 'START',
    success: 'SUCCESS',
    failure: 'FAILURE',
  };

export const ProjectReducer = (state, action) => {
    switch (action.type) {
      case ProjectsActions.start:
        return {
          data: null,
          loading: true,
          error: null,
        };
      case ProjectsActions.success:
        return {
          data: action.payload,
          loading: false,
          error: null,
        };
      case ProjectsActions.failure:
        return {
          data: null,
          loading: false,
          error: action.payload,
        };
   
      default:
        return state;
    }
  };
  
export const ProjectProvider = ({children}) => {

    const [state, dispatch] = useReducer(ProjectReducer, initialValues);

  return (
    <ProjectContext.Provider value={{state, dispatch}}>
        {children}
    </ProjectContext.Provider>
  )
}

export const useProjects = ()=> useContext(ProjectContext)