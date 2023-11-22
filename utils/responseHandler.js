module.exports = (success, data, res, message) => {
  return res.status(200).send({
    success: success || true,
    message: message || "Success",
    data: data,
  });
};
