const MembershipRecordservice = require("../../Services/membershipHisService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new MembershipRecordservice().removeMembership(req.body);
  responseHandler(true, payload, res);
});
