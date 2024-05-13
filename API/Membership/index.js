const express = require("express");
const router = express.Router();
const validateToken = require("../../utils/middlewares/validateToken");

router.get(
  "/getmembershiprecords",
  validateToken,
  require("./getmembershipecords")
);

router.get(
  "/getmembershiprecords/:flag",
  validateToken,
  require("./getmembershipecords")
);
router.post(
  "/createmembershiprecord",
  validateToken,
  require("./createmembershiprecord")
);

module.exports = router;
