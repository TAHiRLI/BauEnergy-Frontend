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
  const [selectedImage, setSelectedImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [userData, setUserData] = useState({
    name: "",
    lastName: "",
    email: "",
    phoneNumber: "",
    birthDate: "",
    image: ""
  });
  const [loading, setLoading] = useState(false);

  const validationSchema = Yup.object({
    name: Yup.string().required("First name is required"),
    lastName: Yup.string().required("Last name is required"),
    email: Yup.string()
    .trim()
    .email('Invalid email format')
    .required('Email is required'),
    phoneNumber: Yup.string()
    .matches(/^\+?[0-9]{10,15}$/, 'Invalid phone number format')
    .required('Phone Number is required'),
    birthDate: Yup.date().required("Birthdate is required"),
  });

  

  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      try {
        const response = await userSerivce.getByEmail(userEmail);
        console.log(response.data)
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
          image: response.data.image
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

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file); 
      setSelectedImage(imageUrl); 
      setImageFile(file); 
    }
  };

  const handleSubmit = async (values, { setSubmitting }) => {
    setLoading(true);
    console.log(imageFile); 
  
    const formData = new FormData();
    formData.append("Name", values.name);
    formData.append("LastName", values.lastName);
    formData.append("Email", values.email);
    formData.append("PhoneNumber", values.phoneNumber);
    formData.append(
      "BirthDate",
      new Date(values.birthDate).toISOString().split("T")[0]
    );
  
    if (imageFile) {
      formData.append("Image", imageFile); // Append the actual file
    }
  
    try {
      const result = await Swal.fire({
        title: "Are you sure?",
        text: "Do you want to update your information?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#1D34D8",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, update it!",
      });
  
      if (!result.isConfirmed) {
        setSubmitting(false);
        setLoading(false);
        return;
      }
  
      const response = await userSerivce.edit(userEmail, formData);
  
      if (response.data.token) {
        cookies.remove("user", { path: "/" });
        const newToken = response.data.token;
        cookies.set("user", { token: newToken }, { path: "/" });
  
        Swal.fire(
          "Success",
          "Your information has been updated successfully.",
          "success"
        ).then(() => {
          window.location.reload();
        });
      }
    } catch (error) {
      console.error("Error updating user:", error);
  
      await Swal.fire({
        title: "Error!",
        text: "Failed to update your information. Please try again later.",
        icon: "error",
        confirmButtonText: "OK",
      });
    } finally {
      setSubmitting(false);
      setLoading(false);
    }
  };
  console.log(userData)
  
  return (
    <Box
    className="!mt-6 "
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
                              {/* Profile Image Section */}
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    marginBottom: 3,
                  }}
                >
                  {/* Display Profile Image */}
                  <img
                    src={
                      selectedImage || 
                      (userData.image
                        ? `${process.env.REACT_APP_DOCUMENT_URL}/assets/images/teammembers/${userData.image}`
                        : `${process.env.REACT_APP_DOCUMENT_URL}/assets/images/teammembers/defaultUser.png`)
                    }
                    alt="Profile"
                    style={{
                      width: 150,
                      height: 150,
                      borderRadius: "50%",
                      objectFit: "cover",
                      marginBottom: 10,
                    }}
                  />
                  {/* Upload New Image */}
                  <Button
                    variant="outlined"
                    component="label"
                    sx={{
                      textTransform: "none",
                      padding: "6px 20px",
                      color: "#1D34D8",
                      borderColor: "#1D34D8",
                    }}
                  >
                    Edit Image
                    <input
                      type="file"
                      accept="image/*"
                      hidden
                      onChange={handleImageUpload}
                    />
                  </Button>
                </Box>
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
                  onBlur={(e) => {
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
                    padding: "6px 20px",
                  }}
                >
                  Edit
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
