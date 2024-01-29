const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const validateToken = require("../../utils/middlewares/validateToken");

router.get("/venueList", require("./venueDetails"));

module.exports = router;
