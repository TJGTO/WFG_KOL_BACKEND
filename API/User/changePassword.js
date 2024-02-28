const userService = require("../../Services/userService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new userService().changePassword(req);
  if (payload.success) {
    responseHandler(true, payload, res);
  } else {
    responseHandler(false, payload, res, payload.message, 400);
  }
});
