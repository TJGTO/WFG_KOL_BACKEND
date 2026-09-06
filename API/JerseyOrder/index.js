const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const validateToken = require("../../utils/middlewares/validateToken");
const { createJerseyOrderSchema, updateJerseyOrderStatusSchema } = require("./validationSchema");

// Public — the jersey product page has no login, so this is intentionally
// not behind validateToken.
router.post(
  "/create",
  requestValidator(createJerseyOrderSchema),
  require("./createjerseyorder")
);

router.post("/uploadscreenshot", require("./uploadscreenshot"));

// Behind auth — the dashboard exposes customer names, phone numbers and
// order totals, so only a logged-in user can reach these.
router.get("/dashboard", validateToken, require("./getdashboard"));

router.patch(
  "/:id/status",
  validateToken,
  requestValidator(updateJerseyOrderStatusSchema),
  require("./updatestatus")
);

module.exports = router;
