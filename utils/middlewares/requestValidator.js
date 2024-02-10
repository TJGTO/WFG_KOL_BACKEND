const catchAsync = require("../catchAsync");
module.exports = (schema, validateParams) =>
  catchAsync(async (req, res, next) => {
    if (validateParams) {
      await schema.validate({
        params: req.params,
        abortEarly: false,
      });
    } else {
      await schema.validate({
        body: req.body,
        abortEarly: false,
      });
    }
    return next();
  });
