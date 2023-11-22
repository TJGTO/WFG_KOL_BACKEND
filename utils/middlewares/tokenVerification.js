const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  const token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];
  if (!token) {
    throw new Error("Authentication Failed");
  }
  try {
    const bearerToken = token.split(" ")[1];
    const decoded = jwt.verify(bearerToken, process.env.PRIVATE_KEY);
    req.user = decoded;
  } catch (err) {
    throw new Error("Authentication Failed");
  }
  return next();
};
