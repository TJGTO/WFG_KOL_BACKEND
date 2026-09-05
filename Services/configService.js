const { ConfigModel } = require("../models/Schema/config");

module.exports = class Configservice {
  constructor() {
    this.configModel = ConfigModel;
  }
  /**
   * get a config document by its document_type
   * @param {*} documentType
   * @returns
   */
  async getConfigByType(documentType) {
    try {
      const response = await this.configModel.findOne({
        document_type: documentType,
      });
      return response;
    } catch (err) {
      throw new Error("Failed to fetch config");
    }
  }
};
