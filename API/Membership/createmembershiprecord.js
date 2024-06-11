const MembershipRecordservice = require("../../Services/membershipHisService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new MembershipRecordservice().createMembershipRecord(
    req.body
  );
  if (!payload.success) {
    responseHandler(false, payload.data, res, payload.message, 404);
  } else {
    responseHandler(true, payload.data, res, payload.message, 200);
  }
});
