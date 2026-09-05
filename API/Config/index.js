const express = require("express");
const router = express.Router();

router.get("/jerseyconfig", require("./getjerseyconfig"));

module.exports = router;
