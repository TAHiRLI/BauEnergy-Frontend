// import { createContext, useContext, useReducer } from "react";

// const ProjectContext = createContext();

// const initialValues = {
//     data:null,
//     loading:false,
//     error:false
// }

//  export const ProjectsActions =  {
//     start: 'START',
//     success: 'SUCCESS',
//     failure: 'FAILURE',
//   };

// export const ProjectReducer = (state, action) => {
//     switch (action.type) {
//       case ProjectsActions.start:
//         return {
//           data: null,
//           loading: true,
//           error: null,
//         };
//       case ProjectsActions.success:
//         return {
//           data: action.payload,
//           loading: false,
//           error: null,
//         };
//       case ProjectsActions.failure:
//         return {
//           data: null,
//           loading: false,
//           error: action.payload,
//         };
   
//       default:
//         return state;
//     }
//   };
  
// export const ProjectProvider = ({children}) => {

//     const [state, dispatch] = useReducer(ProjectReducer, initialValues);

//   return (
//     <ProjectContext.Provider value={{state, dispatch}}>
//         {children}
//     </ProjectContext.Provider>
//   )
// }

// export const useProjects = ()=> useContext(ProjectContext)

import { createContext, useContext, useReducer, useState } from "react";
import { projectService } from "../APIs/Services/project.service"; 

const ProjectContext = createContext();

const initialState = {
    data: null,
    loading: false,
    error: null,
};

export const ProjectsActions = {
    START: "START",
    SUCCESS: "SUCCESS",
    FAILURE: "FAILURE",
    RESET: "RESET",
};

const ProjectReducer = (state, action) => {
    switch (action.type) {
        case ProjectsActions.START:
            return { ...state, loading: true, error: null };
        case ProjectsActions.SUCCESS:
            return { data: action.payload, loading: false, error: null };
        case ProjectsActions.FAILURE:
            return { ...state, loading: false, error: action.payload };
        case ProjectsActions.RESET:
            return initialState;
        default:
            return state;
    }
};

export const ProjectProvider = ({ children }) => {
    const [state, dispatch] = useReducer(ProjectReducer, initialState);
    const [projects, setProjects] = useState([])
    const [selectedProject, setSelectedProject] = useState(null)

    // Fetch project by ID and update state
    const fetchProject = async (projectId) => {
        dispatch({ type: ProjectsActions.START });
        try {
            const response = await projectService.getById(projectId);
            dispatch({ type: ProjectsActions.SUCCESS, payload: response.data });
        } catch (error) {
            console.error("Error fetching project:", error);
            dispatch({ type: ProjectsActions.FAILURE, payload: error.message });
        }
    };

    // Reset project state
    const resetProject = () => {
        dispatch({ type: ProjectsActions.RESET });
    };

    return (
        <ProjectContext.Provider value={{ state, dispatch, fetchProject, resetProject, projects, setProjects,selectedProject, setSelectedProject }}>
            {children}
        </ProjectContext.Provider>
    );
};

// Custom hook to use the ProjectContext
export const useProjects = () => useContext(ProjectContext);
