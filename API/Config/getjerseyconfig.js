const Configservice = require("../../Services/configService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

const JERSEY_CONFIG_DOCUMENT_TYPE = "jersey_buy_2026";

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new Configservice().getConfigByType(
    JERSEY_CONFIG_DOCUMENT_TYPE
  );
  responseHandler(true, payload, res);
});
