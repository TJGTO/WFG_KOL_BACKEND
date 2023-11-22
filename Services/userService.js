var jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
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
  async createaUser(data) {
    try {
      const result = await this.userModel.create(data);
      this.logger.info(result);
      return result;
    } catch (err) {
      throw new Error("Wrong data");
    }
  }
};
