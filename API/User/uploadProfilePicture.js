const userService = require("../../Services/userService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  if (!req.files) {
    throw new Error("Files are missing");
  }
  let payload = await new userService().updateProfilePicture(req);
  responseHandler(true, payload, res);
});
