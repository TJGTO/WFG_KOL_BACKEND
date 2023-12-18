const express = require("express");
const router = express.Router();

router.get(
    "/states",
    require("./getAllStates")
  );

  module.exports = router;