const JerseyOrderService = require("../../Services/jerseyOrderService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  const result = await new JerseyOrderService().uploadPaymentScreenshot(
    req.files?.file
  );
  if (!result.isSuccess) {
    responseHandler(false, null, res, result.error, 400);
  } else {
    responseHandler(true, result.data, res);
  }
});
