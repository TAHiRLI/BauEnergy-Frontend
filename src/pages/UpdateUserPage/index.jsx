import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Paper,
} from "@mui/material";
import { jwtDecode } from "jwt-decode";
import { useAuth } from "../../context/authContext";
import { userSerivce } from "../../APIs/Services/user.service";
import { Field, Form, Formik } from "formik";
import * as Yup from "yup";
import Swal from "sweetalert2";
import Cookies from "universal-cookie";

const UpdateUserPage = () => {
  const { user } = useAuth();
  const decodedToken = user?.token ? jwtDecode(user.token) : null;
  const userEmail = decodedToken["http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress"];
  const cookies = new Cookies();

  const [userData, setUserData] = useState({
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
  });
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    phoneNumber: Yup.string()
      .matches(/^\+?[1-9]\d{1,14}$/, "Phone number is not valid")
      .required("Phone number is required"),
    birthDate: Yup.date().required("Birthdate is required"),
  });

  

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await userSerivce.getByEmail(userEmail);
  
        const fullName = response.data.fullName?.trim() || "";
        const [firstName = "", ...lastNameParts] = fullName.split(" ");
        const lastName = lastNameParts.join(" ");
        const formattedBirthDate = response.data.birthDate
          ? new Date(response.data.birthDate).toLocaleDateString('en-CA')
          : "";
  
        setUserData({
          name: firstName,
          lastName: lastName || "",
          email: response.data.email,
          phoneNumber: response.data.phoneNumber,
          birthDate: formattedBirthDate,
        });
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setLoading(false);
      }
    };
  
    fetchUserData();
  }, [userEmail]);
  

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUserData((prevState) => ({ ...prevState, [name]: value }));
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    console.log(values)
    setLoading(true);
  
    const formData = new FormData();
    formData.append("Name", values.name);
    formData.append("LastName", values.lastName);
    //formData.append("Email", values.email);
    formData.append("PhoneNumber", values.phoneNumber);
    formData.append("BirthDate", new Date(values.birthDate).toISOString().split("T")[0]); 
    try {
      var response = await userSerivce.edit(userEmail, formData);
      console.log(response)
      if (response.data.token) {
        cookies.remove("user", { path: "/" });
        const newToken = response.data.token;
        cookies.set("user", { token: newToken }, { path: "/" });
        window.location.reload();
      }
      Swal.fire('Success', 'User information has been updated!', 'success');
    } catch (error) {
      console.error("Error updating user:", error);
      Swal.fire('Error', 'Failed to add project.', 'error');
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };
  


  return (
    <Box
      sx={{
        padding: 4,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100%",
        backgroundColor: "#f9f9f9",
      }}
    >
      <Paper
        sx={{
          padding: 4,
          maxWidth: "600px",
          width: "100%",
          borderRadius: "14px",
        }}
      >
        <Typography
          variant="h5"
          sx={{
            fontWeight: "bold",
            marginBottom: 3,
            textAlign: "center",
            color: "#1D34D8",
          }}
        >
          User Information
        </Typography>
        {loading ? (
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              height: "200px",
            }}
          >
            <CircularProgress />
          </Box>
        ) : (
          <Formik
            initialValues={userData}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
            enableReinitialize
          >
            {({ errors, touched }) => (
              <Form>
                <Field
                  as={TextField}
                  label="First Name"
                  name="name"
                  fullWidth
                  margin="dense"
                  onChange={(e) => {
                    handleChange(e);  
                  }}
                  error={touched.name && !!errors.name}
                  helperText={touched.name && errors.name}
                />
                <Field
                  as={TextField}
                  label="Last Name"
                  name="lastName"
                  fullWidth
                  margin="dense"
                  onChange={(e) => {
                    handleChange(e);  
                  }}
                  error={touched.lastName && !!errors.lastName}
                  helperText={touched.lastName && errors.lastName}
                />
                <Field
                  as={TextField}
                  label="Email"
                  name="email"
                  fullWidth
                  margin="dense"
                  onChange={(e) => {
                    handleChange(e);  
                  }}
                  disabled
                />
                <Field
                  as={TextField}
                  label="Phone Number"
                  name="phoneNumber"
                  fullWidth
                  margin="dense"
                  onChange={(e) => {
                    handleChange(e);  
                  }}
                  error={touched.phoneNumber && !!errors.phoneNumber}
                  helperText={touched.phoneNumber && errors.phoneNumber}
                />
                <Field
                  as={TextField}
                  label="Birthdate"
                  name="birthDate"
                  type="date"
                  fullWidth
                  margin="dense"
                  onChange={(e) => {
                    handleChange(e); 
                  }}
                  error={touched.birthDate && !!errors.birthDate}
                  helperText={touched.birthDate && errors.birthDate}
                  InputLabelProps={{ shrink: true }}
                />

                <Button
                  variant="contained"
                  type="submit"
                  sx={{
                    backgroundColor: "#1D34D8",
                    textTransform: "none",
                    marginTop: 3,
                    padding: "10px 20px",
                  }}
                >
                  Update
                </Button>
              </Form>
            )}
          </Formik>
        )}
      </Paper>
    </Box>
  );
};

export default UpdateUserPage;
