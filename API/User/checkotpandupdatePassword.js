const userService = require("../../Services/userService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let result = await new userService().checkOTPandupdatepassword(req);

  if (result.success) {
    responseHandler(true, result, res);
  } else {
    responseHandler(false, result, res, result.message, 500);
  }
});
