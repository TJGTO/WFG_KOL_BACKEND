const articleService = require("../../Services/articleService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new articleService().likeorDislikeapost(req);
  if (!payload.success) {
    responseHandler(false, payload, res, payload.message, 400);
  } else {
    responseHandler(true, payload, res, payload.message, 200);
  }
});
