const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const { createJerseyOrderSchema } = require("./validationSchema");

// Public — the jersey product page has no login, so this is intentionally
// not behind validateToken.
router.post(
  "/create",
  requestValidator(createJerseyOrderSchema),
  require("./createjerseyorder")
);

module.exports = router;
