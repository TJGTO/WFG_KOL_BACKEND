const userService = require("../../Services/userService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new userService().permissionsForProfile(req);
  responseHandler(true, payload, res);
});
