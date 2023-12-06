const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const { createUserSchema } = require("./validationSchema");
const loginvalidationschema = require("./loginValidationSchema");

router.post(
  "/create",
  requestValidator(createUserSchema),
  require("./createUser")
);

router.post('/login',
requestValidator(loginvalidationschema),
require('./loginuser')
);



module.exports = router;
