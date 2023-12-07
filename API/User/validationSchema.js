const yup = require("yup");
const createUserSchema = yup.object({
  body: yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    password: yup
      .string()
      .required("Please enter a password")
      .min(8, "Password length should be minimum 8 characters"),
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
