import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import Layout from "../../components/layout";
import LoginPage from "../login/";
import {Instruments} from "../instruments";
import { PrivateRoute } from "../../components/PrivateRoute";
import HomePage from "../HomePage";
import { Roles } from "../../context/authContext";
import ProjectPage from "../projects";
import RegistrationView from "../Register";
import ResetPassword from "../login/resetPassword";


export const router = createBrowserRouter([
  {
      path: ROUTES.BASE,
      element: <PrivateRoute loginPath={ROUTES.LOGIN}>
                  <Layout>
                    <HomePage />
                  </Layout>
                </PrivateRoute>,
  },
  {
      path: ROUTES.LOGIN,
      element: <LoginPage />
  },
  {
    path: ROUTES.REGISTER,
    element: <RegistrationView />
  },
  {
    path: ROUTES.RESET_PASSWORD,
    element: <ResetPassword />
  },
  //==================
  // Instruments
  {
    path: ROUTES.INSTRUMENTS,
    element:
    <PrivateRoute loginPath={ROUTES.BASE} allowedRoles={[Roles.admin, Roles.superAdmin, Roles.projectManager]}
    >
              <Layout>
                <Instruments />
              </Layout>
            </PrivateRoute>
  },
  {
    path: ROUTES.AVIABLEINSTRUMENTS,
    element:
    <PrivateRoute loginPath={ROUTES.AVIABLEINSTRUMENTS} //allowedRoles={[Roles.admin, Roles.superAdmin]}
    >
              <Layout>
                <ProjectPage />
              </Layout>
            </PrivateRoute>
  },
  //==================
  // Projects   
  {
    path: ROUTES.PROJECT_DETAILS,
    element:
    <PrivateRoute loginPath={ROUTES.PROJECT_DETAILS} allowedRoles={[Roles.admin, Roles.superAdmin, Roles.projectManager]}
    >
              <Layout>
                <ProjectPage />
              </Layout>
            </PrivateRoute>
  },

  //==================
  // TeamMemmbers
  {
    path: ROUTES.ADD_TEAMMEMBERS,
    element:
    <PrivateRoute loginPath={ROUTES.ADD_TEAMMEMBERS} allowedRoles={[Roles.admin, Roles.superAdmin]}
    >
              <Layout>
                <ProjectPage />
              </Layout>
            </PrivateRoute>
  },
]);

export default ROUTES;
