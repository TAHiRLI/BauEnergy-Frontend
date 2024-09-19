import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import Layout from "../../components/layout";
import LoginPage from "../login/";
import {Instruments} from "../instruments";
import { PrivateRoute } from "../../components/PrivateRoute";
import HomePage from "../HomePage";
import { Roles } from "../../context/authContext";
import ProjectPage from "../projects";


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

  //==================
  // Instruments
  {
    path: ROUTES.INSTRUMENTS,
    element:
    <PrivateRoute loginPath={ROUTES.INSTRUMENTS} //allowedRoles={[Roles.admin, Roles.superAdmin]}
    >
              <Layout>
                <Instruments />
              </Layout>
            </PrivateRoute>
  },
  //==================
  // Projects  
  {
    path: ROUTES.PROJECT_DETAILS,
    element:
    <PrivateRoute loginPath={ROUTES.PROJECT_DETAILS} //allowedRoles={[Roles.admin, Roles.superAdmin]}
    >
              <Layout>
                <ProjectPage />
              </Layout>
            </PrivateRoute>
  },
  {
    path: ROUTES.REMOVEINTRUMENTFROM_PROJECT,
    element:
    <PrivateRoute loginPath={ROUTES.REMOVEINTRUMENTFROM_PROJECT} //allowedRoles={[Roles.admin, Roles.superAdmin]}
    >
              <Layout>
                <ProjectPage />
              </Layout>
            </PrivateRoute>
  },
]);

export default ROUTES;
