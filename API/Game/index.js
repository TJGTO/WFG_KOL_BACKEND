const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const {
  createGameSchema,
  addUpdatePlayerSchema,
} = require("./validationschema");

router.post(
  "/create",
  requestValidator(createGameSchema),
  require("./creategame")
);

router.post(
  "/addUpdate",
  requestValidator(addUpdatePlayerSchema),
  require("./addUpdatePlayer")
);

router.delete("/removePlayer", require("./removeplayer"));

module.exports = router;
