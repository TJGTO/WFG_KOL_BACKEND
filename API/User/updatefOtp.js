const userService = require("../../Services/userService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
const { generatePIN } = require("../../utils/library");

module.exports = catchAsync(async (req, res, next) => {
  let reqbody = {
    email: req.body.email,
    body: {
      fotp: generatePIN(),
      timeforfotp: new Date().getTime(),
    },
  };
  let payload = await new userService().updatOtp(reqbody);
  if (payload) {
    responseHandler(true, payload, res);
  } else {
    responseHandler(false, payload, res, "Failed to send the email", 500);
  }
});
