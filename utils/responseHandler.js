module.exports = (success, data, res, message, status) => {
  return res.status(status || 200).send({
    success: success || true,
    message: message || "Success",
    data: data,
  });
};
