import { createContext, useContext, useReducer } from "react";
import Cookies from "universal-cookie";

const cookies = new Cookies();

const INITIAL_STATE = {
  user: cookies.get("user") || null,
  loading: false,
  error: null,
};

export const AuthActions = {
  start: 'LOGIN_START',
  success: 'LOGIN_SUCCESS',
  failure: 'LOGIN_FAILURE',
  logout: 'LOGOUT'
};

export const Roles = {
  admin: 'Admin',
  user: 'User', 
  projectManager: 'ProjectManager',
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
    case AuthActions.success:
      return {
        user: action.payload,
        loading: false,
        error: null,
      };
    case AuthActions.failure:
      return {
        user: null,
        loading: false,
        error: action.payload,
      };
    case AuthActions.logout:
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