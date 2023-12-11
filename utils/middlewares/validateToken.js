const jwt = require("jsonwebtoken");
const responseHandler = require("../responseHandler");

function validateToken(req, res, next) {
  let token =
    req.body.token ||
    req.query.token ||
    req.headers["x-access-token"] ||
    req.headers["authorization"];

  if (!token) {
    responseHandler(false, { message: "No token provided" }, res,'failed', 401);
    return;
  }

  const tokenArr = token.split(" ");
  if(tokenArr.length == 2) token = tokenArr[1]
  else token = tokenArr[0]

  jwt.verify(token, process.env.Secret, (err, decoded) => {
    if (err) {
      responseHandler(false, { message: "Invalid token" }, res, 'failed',401);
      return;
    }
    req.user = decoded;
    next();
  });
}

module.exports = validateToken;
