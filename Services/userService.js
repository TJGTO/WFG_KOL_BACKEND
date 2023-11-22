var jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const bcrypt = require("bcryptjs");
const { UsersModel } = require("../models/Schema/users");

module.exports = class Userservice {
  constructor() {
    this.userModel = UsersModel;
  }
  /**
   *create a user
   * @param {*} request
   * @returns
   */
  async createaUser(data) {
    try {
      const result = this.userModel.create(data);
      return result;
    } catch (err) {
      throw new Error("Wrong data");
    }
  }
};
