const JerseyOrderService = require("../../Services/jerseyOrderService");
const catchAsync = require("../../utils/catchAsync");

module.exports = catchAsync(async (req, res, next) => {
  const buffer = await new JerseyOrderService().exportOrdersExcel();
  res.setHeader(
    "Content-Type",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
  );
  res.setHeader("Content-Disposition", "attachment; filename=jersey_orders.xlsx");
  res.send(buffer);
});
