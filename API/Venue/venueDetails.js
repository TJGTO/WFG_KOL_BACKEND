const gameService = require("../../Services/venueService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new gameService().venueDetails();
  responseHandler(true, payload, res);
});
