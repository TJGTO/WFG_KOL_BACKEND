const MembershipRecordservice = require("../../Services/membershipHisService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");

module.exports = catchAsync(async (req, res, next) => {
  let flag = req.params.flag || "";
  let payload = await new MembershipRecordservice().getAllActiveMembershipList(
    flag
  );
  responseHandler(true, payload, res);
});
