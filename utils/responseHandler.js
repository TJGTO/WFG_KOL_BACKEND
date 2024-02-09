module.exports = (success, data, res, message, status) => {
  console.log(success);
  return res.status(status || 200).send({
    success: success,
    message: message || "Success",
    data: data,
  });
};
