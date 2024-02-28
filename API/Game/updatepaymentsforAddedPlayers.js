const gameService = require("../../Services/gameService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new gameService().updatePaymentsSnapAfterAddedByAdmin(
    req
  );
  if (payload.success) {
    responseHandler(true, payload, res, payload.message);
  } else {
    responseHandler(false, payload, res, payload.message, 400);
  }
});
