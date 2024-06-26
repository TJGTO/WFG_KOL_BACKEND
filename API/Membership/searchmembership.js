const MembershipRecordservice = require("../../Services/membershipHisService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new MembershipRecordservice().searchrecords(req.body);
  responseHandler(true, payload, res);
});
