const responseHandler = require("../responseHandler");
const userService = require("../../Services/userService");
const { intersection, isEmpty } = require("ramda");

const roleValidator = (requiredRoles, message) => async (req, res, next) => {
  if (!req.user) {
    responseHandler(false, { message: "Invalid token" }, res, "failed", 401);
    return;
  }

  if (req.user) {
    let payload = await new userService().userDetails(req);
    let roles = payload.roles;
    const hasAllowedRole = !isEmpty(intersection(roles, requiredRoles));
    if (!hasAllowedRole) {
      responseHandler(false, { message: message }, res, message, 403);
      return;
    }
  }

  next();
};

module.exports = roleValidator;
