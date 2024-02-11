const { StateModel } = require("../models/Schema/State");

module.exports = class Stateservice {
  constructor() {
    this.stateModel = StateModel;
  }
  /**
   * get all states
   * @param {*} request
   * @returns
   */
  //
  async getAllStates() {
    try {
      const allStates = await this.stateModel.find({});
      return allStates;
    } catch (err) {
      throw new Error("Failed to fetch states");
    }
  }
};
