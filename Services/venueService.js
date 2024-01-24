const { venueModel } = require("../models/Schema/venues");

const logger = require("../utils/loggerConfig");

module.exports = class Venueservice {
  constructor() {
    this.venueModel = venueModel;
  }

  async venueDetails() {
    const allVenues = await this.venueModel.find({});
    return allVenues;
  }
};
