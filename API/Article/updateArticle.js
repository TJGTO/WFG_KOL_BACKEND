const articleService = require("../../Services/articleService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new articleService().updateArticle(req);
  if (payload.success) {
    responseHandler(true, payload, res);
  } else {
    responseHandler(false, payload, res, payload.message, 401);
  }
});
