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

};
