const express = require("express");
const router = express.Router();
const requestValidator = require("../../utils/middlewares/requestValidator");
const validateToken = require("../../utils/middlewares/validateToken");

router.post("/create", validateToken, require("./createArticle"));
router.get("/allArticles", require("./activeArticle"));
router.get("/allArticles/:articleId", require("./individualArticle"));

module.exports = router;
