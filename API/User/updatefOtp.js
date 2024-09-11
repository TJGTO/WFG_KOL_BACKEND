const userService = require("../../Services/userService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
const { generatePIN } = require("../../utils/library");
const emailService = require("../../Services/emailService");

module.exports = catchAsync(async (req, res, next) => {
  const fotp = generatePIN();
  const timeforfotp = new Date().getTime();
  let reqbody = {
    email: req.body.email,
    body: {
      fotp,
      timeforfotp,
    },
  };
  let payload = await new userService().updatOtp(reqbody);

  if (!payload)
    responseHandler(false, payload, res, "Failed to send the email", 500);

  let result = await new emailService().emailTemplates(
    "forgotPassword",
    req.body.email,
    {
      verifyLink: `https://weekendfootballkolkata.com/forgotpassword/${fotp}_${timeforfotp}?email=${req.body.email}`,
    }
  );
  if (result) {
    responseHandler(true, payload, res);
  } else {
    responseHandler(false, payload, res, "Failed to send the email", 500);
  }
});
