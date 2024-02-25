const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const roleValidator = require("../../utils/middlewares/roleValidator");
const {
  createGameSchema,
  addUpdatePlayerSchema,
  removePlayerSchema,
  // registerPlayerSchema,
  updateGameSchema,
  getPermissionSchema,
  updatePlayerInGameStatusSchema,
} = require("./validationschema");

const validateToken = require("../../utils/middlewares/validateToken");

router.post(
  "/create",
  validateToken,
  roleValidator(
    ["Match Moderator", "Admin"],
    "Currently, you do not have game moderator privileges. If you wish to become one, please send an email using your registered email ID for further assistance."
  ),
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

router.post("/registerInGroup", require("./registerIngroup"));

router.post(
  "/updateGame",
  validateToken,
  requestValidator(updateGameSchema),
  require("./updateGame")
);
router.post(
  "/updatePlayerInGameStatus",
  validateToken,
  requestValidator(updatePlayerInGameStatusSchema),
  require("./updatePlayerInGameStatus")
);

router.post(
  "/updateTeamDetails",
  validateToken,
  require("./updateTeamDetails")
);

router.get(
  "/getPermissionMatrix/:gameid",
  validateToken,
  requestValidator(getPermissionSchema, true),
  require("./getPermissionMatrix")
);
module.exports = router;
