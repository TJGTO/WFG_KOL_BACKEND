var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { UsersModel } = require("../models/Schema/users");
const logger = require("../utils/loggerConfig");

module.exports = class Userservice {
  constructor() {
    this.userModel = UsersModel;
    this.logger = logger;
  }
  /**
   *create a user
   * @param {*} request
   * @returns
   */
  async createUser(data) {
    try {
      const hashsalt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(data.password, hashsalt);
      data.salt = hashsalt;
      data.password = hashedPassword;
      const result = await this.userModel.create(data);
      this.logger.info(result);
      return result;
    } catch (err) {
      throw new Error("Wrong data");
    }
  }

  async loginuser(data) {
    const UserDetails = await this.userModel.findOne({ email: data.email });
    if (!UserDetails) {
      throw Error("User not found");
    }
    const response = await bcrypt
      .compare(data.password, UserDetails.password)
      .then((res) => res)
      .catch((err) => false);

    if (response) {
      const token = jwt.sign({ foo: "bar" }, process.env.Secret);
      return {
        token: token,
      };
    } else {
      throw Error("Password doesn't match");
    }
  }
};
