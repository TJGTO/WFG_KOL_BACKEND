const stateService = require("../../Services/stateService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new stateService().getAllStates();
  responseHandler(true, payload, res);
});