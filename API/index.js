const express = require("express");
const router = express.Router();

router.use("/user", require("./User"));
router.use(require("./States"));
router.use(require("./AboutUs"));
router.use("/game", require("./Game"));

module.exports = router;
