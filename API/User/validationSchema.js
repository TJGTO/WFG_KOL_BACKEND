const yup = require("yup");
const phoneRegex = /^(?:(?:0|91)?[6789]\d{9})$/
const createUserSchema = yup.object({
  body: yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    password: yup
      .string()
      .required("Please enter a password")
      .min(8, "Password length should be minimum 8 characters"),
    phone_no: yup.string().matches(phoneRegex, 'Phone no is not valid').min(10).max(10),
    email: yup
      .string()
      .required("Email is required")
      .email("Please send a valid email id"),
  }),
});
const loginvalidationschema = yup.object({
  body: yup.object({
    email: yup.string().required("Please enter email"),
    password: yup.string().required("Please enter password"),
  }),
});

module.exports = { createUserSchema, loginvalidationschema };
