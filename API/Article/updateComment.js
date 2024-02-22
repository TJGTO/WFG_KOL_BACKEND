const articleService = require("../../Services/articleService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new articleService().addComments(req);
  responseHandler(true, payload, res);
});
