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
      const response = await this.aboutusModel.find();
      if (response && response.length > 0) {
        return response[response.length - 1];
      }
      return response;
    } catch (err) {
      throw new Error("Failed to fetch states");
    }
  }
};
