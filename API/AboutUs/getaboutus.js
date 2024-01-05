const Aboutservice = require("../../Services/aboutusService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new Aboutservice().getAboutUs();
  responseHandler(true, payload, res);
});
