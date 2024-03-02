const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const {
  createUserSchema,
  loginvalidationschema,
  updateuserschema,
  changePasswordSchema,
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
router.post("/search", validateToken, require("./searchUsers"));

router.post(
  "/changePassword",
  requestValidator(changePasswordSchema),
  require("./changePassword")
);

router.get("/exportUsersDetails", require("./exportUsers"));

module.exports = router;
