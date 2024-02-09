module.exports = (req, res, next) => {
  err.statusCode = err.statusCode || 200;
  err.status = err.status || "error";

  res.status(err.statusCode).json({
    success: false,
    status: err.status,
    statusCode: err.statusCode,
    message: err.message,
  });
};
