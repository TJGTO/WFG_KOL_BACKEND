const catchAsync = require("../catchAsync");
module.exports = (schema) =>
  catchAsync(async (req, res, next) => {
    await schema.validate({
      body: req.body,
    });
    return next();
  });
