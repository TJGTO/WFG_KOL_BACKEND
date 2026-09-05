const { JerseyOrderModel } = require("../models/Schema/jerseyOrder");

module.exports = class JerseyOrderService {
  constructor() {
    this.jerseyOrderModel = JerseyOrderModel;
  }
  /**
   * create a jersey order
   * @param {*} data - customer, product selection, pickup and payment details
   * @returns - the saved order document
   */
  async createOrder(data) {
    try {
      const order = await this.jerseyOrderModel.create(data);
      return order;
    } catch (err) {
      throw new Error("Failed to save jersey order");
    }
  }
};
