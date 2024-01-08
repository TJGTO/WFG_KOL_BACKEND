const gameService = require("../../Services/gameService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new gameService().matchDetails(req);
  responseHandler(true, payload, res);
});
