const yup = require("yup");
//const PasswordRegex = /^(?=.*\d)(?=.*[!@#$%^&*_])(?=.*[a-zA-Z]).{6,}$/;
const createUserSchema = yup.object({
  body: yup.object({
    firstName: yup.string().required(),
    lastName: yup.string().required(),
    // email: yup
    //   .string()
    //   .required("Email is required")
    //   .email("Please send a valid email id"),
    // dob: yup.date().required(),
    // password: yup
    //   .string()
    //   .matches(PasswordRegex, "Password enter a strong password")
    //   .required("Password is missing"),
  }),
});

module.exports = { createUserSchema };
