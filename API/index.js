const express = require("express");
const router = express.Router();

router.use("/user", require("./User"));

module.exports = router;
