const express = require("express");
const { route } = require("./User");
const router = express.Router();

router.use("/user", require("./User"));
router.use(require("./States"));
router.use(require("./AboutUs"));
router.use("/game", require("./Game"));
router.use("/venue", require("./Venue"));
router.use("/article", require("./Article"));

module.exports = router;
