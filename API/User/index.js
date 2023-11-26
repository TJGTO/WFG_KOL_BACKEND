const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const { createUserSchema } = require("./validationSchema");

router.post(
  "/create",
  requestValidator(createUserSchema),
  require("./createUser")
);

module.exports = router;
