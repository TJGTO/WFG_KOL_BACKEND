const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const {
  createUserSchema,
  loginvalidationschema,
  updateuserschema,
} = require("./validationSchema");
const validateToken = require("../../utils/middlewares/validateToken");

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
  validateToken,
  requestValidator(updateuserschema),
  require("./updateuser")
);

router.get("/userdetails", validateToken, require("./userDetails"));

router.patch(
  "/userPrfoilePicture",
  validateToken,
  require("./uploadProfilePicture")
);

module.exports = router;
