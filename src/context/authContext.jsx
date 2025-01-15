import { createContext, useContext, useReducer } from "react";

import Cookies from 'universal-cookie';
import dayjs from 'dayjs';

const cookies = new Cookies();

const INITIAL_STATE = {
  user: cookies.get("user") || null,
  loading: false,
  error: null,
};

export const AuthActions = {
  start: "LOGIN_START",
  success: "LOGIN_SUCCESS",
  failure: "LOGIN_FAILURE",
  logout: "LOGOUT",
  completedTutorial: "completedTutorial",
  hasCompletedTest: "HasCompletedTest",
};

export const Roles = {
  admin: "Company_Owner",
  user: "User",
  projectManager: "Project_Manager",
};

export const AuthContext = createContext(INITIAL_STATE);

const AuthReducer = (state, action) => {
  
  switch (action.type) {
    case AuthActions.start:
      return {
        user: null,
        loading: true,
        error: null,
      };
    case AuthActions.success: {
      console.log("🚀 ~ AuthReducer ~   action.payload:",   action.payload)
      const user = {
        hasCompletedTest: action.payload.hasCompletedTest,
        hasCompletedTutorial: action.payload.hasCompletedTutorial,
        token: action.payload.token,
        userId: action.payload.userId,
        tokenType: 'Bearer',
        authState: action.payload.userState,
      };

    

      return {
        user,
        loading: false,
        error: null,
      };
    }
    case AuthActions.completedTutorial: {
      const updatedUser = {
        ...state.user,
        hasCompletedTutorial: true,
      };

     

      return {
        ...state,
        user: updatedUser,
      };
    }
    case AuthActions.hasCompletedTest: {
      const updatedUser = {
        ...state.user,
        hasCompletedTutorial: true,
        hasCompletedTest: true,
      };

      

      return {
        ...state,
        user: updatedUser,
      };
    }
    case AuthActions.failure:
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case AuthActions.logout:
      cookies.remove('user', { path: '/' });
      return {
        user: null,
        loading: false,
        error: null,
      };
    default:
      return state;
  }
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(AuthReducer, INITIAL_STATE);
  console.log("🚀 ~ AuthProvider ~ state:", state)

  return (
    <AuthContext.Provider
      value={{
        user: state.user,
        loading: state.loading,
        error: state.error,
        dispatch,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
