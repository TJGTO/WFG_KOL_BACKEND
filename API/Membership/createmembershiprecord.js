const MembershipHistoryservice = require("../../Services/membershipHisService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new MembershipHistoryservice().createMembershipRecord(
    req.body
  );
  responseHandler(true, payload, res);
});
