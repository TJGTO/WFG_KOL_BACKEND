const express = require("express");
const router = express.Router();

router.get("/aboutus", require("./getaboutus"));

module.exports = router;
