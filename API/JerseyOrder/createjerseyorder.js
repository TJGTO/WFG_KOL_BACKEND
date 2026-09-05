const JerseyOrderService = require("../../Services/jerseyOrderService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new JerseyOrderService().createOrder(req.body);
  responseHandler(true, payload, res);
});
