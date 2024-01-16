const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const {
  createGameSchema,
  addUpdatePlayerSchema,
  removePlayerSchema,
  // registerPlayerSchema,
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

router.get("/activematch", require("./activematches"));

router.get("/details/:gameid", require("./matchdetails"));

router.post(
  "/register",
  validateToken,
  // requestValidator(registerPlayerSchema),
  require("./registerInGame")
);

router.post("/updateGame", validateToken, require("./updateGame"));

module.exports = router;
