const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const validateToken = require("../../utils/middlewares/validateToken");
const roleValidator = require("../../utils/middlewares/roleValidator");

const {
  createArticleSchema,
  updateArticleSchema,
} = require("./validationschema");

router.post(
  "/create",
  validateToken,
  roleValidator(
    ["Content Creator", "Admin"],
    "You don't have permission to write article on WFG Kol"
  ),
  requestValidator(createArticleSchema),
  require("./createArticle")
);
router.post(
  "/update",
  validateToken,
  requestValidator(updateArticleSchema),
  require("./updateArticle")
);
router.get("/allArticles", require("./activeArticle"));
router.get("/allArticles/:articleId", require("./individualArticle"));
router.get("/comments/:articleId", require("./getComments"));
router.post("/updateComment", validateToken, require("./updateComment"));
router.get(
  "/permissionMatrix/:articleId",
  validateToken,
  require("./permissionMatrix")
);

module.exports = router;
