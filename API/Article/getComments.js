const articleService = require("../../Services/articleService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new articleService().fetchArticleComments(
    req.params.articleId
  );
  if (!payload.success) {
    responseHandler(false, payload, res, payload.message, 404);
  } else {
    responseHandler(true, payload.data, res, payload.message, 200);
  }
});
