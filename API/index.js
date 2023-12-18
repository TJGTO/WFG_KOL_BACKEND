const express = require("express");
const router = express.Router();

router.use("/user", require("./User"));
router.use(require("./States"));

module.exports = router;
