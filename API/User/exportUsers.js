const userService = require("../../Services/userService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
const fs = require("fs");
const Exceljs = require("exceljs");

module.exports = catchAsync(async (req, res, next) => {
  let payload = await new userService().exportUser();
  if (payload != undefined) {
    const workbook = new Exceljs.Workbook();

    await Promise.all([
      workbook.xlsx.readFile(payload.filePathWithDOB),
      workbook.xlsx.readFile(payload.filePathWithoutDOB),
    ]);

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=users_data.xlsx"
    );

    await workbook.xlsx.write(res);

    fs.unlinkSync(payload.filePathWithDOB);
    fs.unlinkSync(payload.filePathWithoutDOB);
  } else {
    responseHandler(false, payload, res, payload.message, 404);
  }
});
