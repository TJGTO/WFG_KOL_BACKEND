const gameService = require("../../Services/gameService");
const catchAsync = require("../../utils/catchAsync");
const responseHandler = require("../../utils/responseHandler");
const fs = require("fs");
const Exceljs = require("exceljs");
module.exports = catchAsync(async (req, res, next) => {
  let payload = await new gameService().exportplayersDetails(req);
  if (payload != undefined) {
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      "attachment; filename=players_data.xlsx"
    );
    res.send(payload);
  } else {
    responseHandler(false, payload, res, payload.message, 404);
  }
});
