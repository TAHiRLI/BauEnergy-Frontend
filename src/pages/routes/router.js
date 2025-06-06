import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import Layout from "../../components/layout";
import LoginPage from "../auth/login";
import {Instruments} from "../instruments";
import { PrivateRoute } from "../../components/PrivateRoute";
import HomePage from "../HomePage";
import { Roles } from "../../context/authContext";
import ProjectPage from "../projects";
import RegistrationView from "../Register";
import ResetPassword from "../auth/resetPassword";
import InstrumentDetails from "../instruments/details" ;
import { Documents } from "../documentspage" ;
import SettingsAndTeams from "../SettingsAndTeams";
import TutorialPage from "../Tutorial/Tutorial";
import UpdateUserPage from "../UpdateUserPage";
import Cars from "../Car";

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
    <PrivateRoute loginPath={ROUTES.BASE} allowedRoles={[Roles.admin, Roles.user, Roles.projectManager]}
    >
      <Layout>
        <Instruments />
      </Layout>
    </PrivateRoute>
  },
  {
    path: ROUTES.INSTRUMENTS_DETAILS,
    element:
    <PrivateRoute loginPath={ROUTES.BASE} //allowedRoles={[Roles.admin, Roles.superAdmin, Roles.projectManager]}
    >
      <Layout>
        <InstrumentDetails />
      </Layout>
    </PrivateRoute>
  },
  {
    path: ROUTES.AVIABLEINSTRUMENTS,
    element:
    <PrivateRoute loginPath={ROUTES.BASE} //allowedRoles={[Roles.admin, Roles.superAdmin]}
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
    <PrivateRoute loginPath={ROUTES.BASE} allowedRoles={[Roles.admin, Roles.user, Roles.projectManager]}
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
    <PrivateRoute loginPath={ROUTES.ADD_TEAMMEMBERS} allowedRoles={[Roles.admin, Roles.projectManager]}
    >
              <Layout>
                <ProjectPage />
              </Layout>
            </PrivateRoute>
  },

  {
    path: ROUTES.DOCUMENTS,
    element:
    <PrivateRoute loginPath={ROUTES.BASE} allowedRoles={[Roles.admin, Roles.projectManager]}
    >
              <Layout>
                <Documents />
              </Layout>
            </PrivateRoute>
  },
  {
    path: ROUTES.SETTINGSANDTEAMS,
    element:
    <PrivateRoute loginPath={ROUTES.BASE} allowedRoles={[Roles.admin]}
    >
              <Layout>
                <SettingsAndTeams/>
              </Layout>
            </PrivateRoute>
  },

  // ======================
  // Cars
  {
    path: ROUTES.CARS,
    element: <PrivateRoute loginPath={ROUTES.BASE} allowedRoles={[Roles.admin]}>
              <Layout>
                <Cars />
              </Layout>
            </PrivateRoute>,
  },

  // ======================
  // Certificates
  {
    path: ROUTES.CERTIFICATE,
    element: <PrivateRoute loginPath={ROUTES.LOGIN}>
                <Layout>
                  <TutorialPage />
                </Layout>
              </PrivateRoute>,
  },

  // ======================
  // UpdateUser
  {
    path: ROUTES.UPDATEUSERPAGE,
    element: <PrivateRoute loginPath={ROUTES.LOGIN}>
                <Layout>
                  <UpdateUserPage />
                </Layout>
              </PrivateRoute>,
  },

]);

export default ROUTES;
