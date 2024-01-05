const { AboutUsModel } = require("../models/Schema/aboutUs");

module.exports = class Aboutservice {
  constructor() {
    this.aboutusModel = AboutUsModel;
  }
  /**
   * get about us
   * @param {*} request
   * @returns
   */
  async getAboutUs() {
    try {
      const response = await this.aboutusModel
        .find()
        .sort({ timestamp: -1 })
        .limit(1)
        .toArray();
      return response;
    } catch (err) {
      throw new Error("Failed to fetch states");
    }
  }
};
