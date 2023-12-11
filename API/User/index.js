const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const {
  createUserSchema,
  loginvalidationschema,
} = require("./validationSchema");
const { route } = require(".");

router.post(
  "/create",
  requestValidator(createUserSchema),
  require("./createUser")
);

router.post(
  "/login",
  requestValidator(loginvalidationschema),
  require("./loginuser")
);

router.patch(
  "/update",
  require("./updateuser")
);

module.exports = router;
