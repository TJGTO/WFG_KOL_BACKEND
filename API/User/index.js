const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const { createUserSchema } = require("./validationSchema");

router.post(
  "/createUser",
  requestValidator(createUserSchema),
  require("./createUser")
);

module.exports = router;
