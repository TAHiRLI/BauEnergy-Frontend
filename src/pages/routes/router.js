import { createBrowserRouter } from "react-router-dom";
import { ROUTES } from "./routes";
import Layout from "../../components/layout";
import LoginPage from "../login/";
import Products from "../products";
import { PrivateRoute } from "../../components/PrivateRoute";
import HomePage from "../HomePage";
import { Roles } from "../../context/authContext";


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
  // Products
  {
    path: ROUTES.PRODUCTS,
    element:
    //<PrivateRoute loginPath={ROUTES.PRODUCTS} allowedRoles={[Roles.admin, Roles.superAdmin]}>
              <Layout>
                <Products />
              </Layout>
           // </PrivateRoute>
  },
]);

export default ROUTES;
