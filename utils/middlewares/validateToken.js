const jwt = require("jsonwebtoken");
const responseHandler = require("../responseHandler");

function validateToken(req, res, next) {
  const token = req.headers.token;

  if (!token) {
    responseHandler(false, { message: "No token provided" }, res, 401);
    return;
  }

  jwt.verify(token, process.env.Secret, (err, decoded) => {
    if (err) {
      responseHandler(false, { message: "Invalid token" }, res, 401);
      return;
    }
    req.user = decoded;
    next();
  });
}

module.exports = validateToken;
