const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const {
  createGameSchema,
  addUpdatePlayerSchema,
  removePlayerSchema,
} = require("./validationschema");

const validateToken = require("../../utils/middlewares/validateToken");

router.post(
  "/create",
  validateToken,
  requestValidator(createGameSchema),
  require("./creategame")
);

router.post(
  "/addUpdate",
  validateToken,
  requestValidator(addUpdatePlayerSchema),
  require("./addUpdatePlayer")
);

router.delete(
  "/removePlayer",
  validateToken,
  requestValidator(removePlayerSchema),
  require("./removeplayer")
);

module.exports = router;
