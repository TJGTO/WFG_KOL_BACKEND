const gameService = require("../../Services/gameService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
const fs = require("fs");
const Exceljs = require("exceljs");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new gameService().exportplayersDetails(req);
  // let newPayload = JSON.stringify(payload);
  if (payload != undefined) {
    // const workbook = new Exceljs.Workbook();

    // await Promise.all([
    //   workbook.xlsx.readFile(payload.filePathWithKeeper),
    //   workbook.xlsx.readFile(payload.filePathWithDefender),
    //   workbook.xlsx.readFile(payload.filePathWithMidfielder),
    //   workbook.xlsx.readFile(payload.filePathWithAttacker),
    // ]);

    // const buffer = await workbook.xlsx.writeBuffer();

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=players_data.xlsx"
    );

    // responseHandler(true, buffer, res, "Success", 200);
    res.send(payload);
    // await workbook.xlsx.write(res);
    // fs.unlinkSync(payload.filePathWithKeeper);
    // fs.unlinkSync(payload.filePathWithDefender);
    // fs.unlinkSync(payload.filePathWithMidfielder);
    // fs.unlinkSync(payload.filePathWithAttacker);
  } else {
    responseHandler(false, payload, res, payload.message, 404);
  }
});
