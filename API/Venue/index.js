const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const validateToken = require("../../utils/middlewares/validateToken");

router.get("/venueList", validateToken, require("./venueDetails"));

module.exports = router;
