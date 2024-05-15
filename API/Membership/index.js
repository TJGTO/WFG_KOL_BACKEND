const express = require("express");
const router = express.Router();
const validateToken = require("../../utils/middlewares/validateToken");
const { createMemberShipRecordSchema } = require("./validationSchema");
const requestValidator = require("../../utils/middlewares/requestValidator");

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
  // requestValidator(createMemberShipRecordSchema),
  require("./createmembershiprecord")
);

module.exports = router;
