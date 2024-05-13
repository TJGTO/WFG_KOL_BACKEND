const {
  MembershipHistoryModel,
} = require("../models/Schema/membershipHIstory");
const { ObjectId } = require("mongodb");
const R = require("ramda");
const logger = require("../utils/loggerConfig");

module.exports = class MembershipHistoryservice {
  constructor() {
    this.membershipHistoryModel = MembershipHistoryModel;
    this.logger = logger;
  }
  /**
   * Get all active membership list.
   *
   * @param {string} flag - The flag to filter the membership list.
   * @returns {Promise<Array<Object>>} The list of active memberships.
   */
  async getAllActiveMembershipList(flag) {
    try {
      let filter = {};
      if (flag == "active") {
        filter = {
          validto: {
            $gt: new Date(),
          },
        };
      }
      if (flag == "inactive") {
        filter = {
          validto: {
            $lt: new Date(),
          },
        };
      }
      const list = await this.membershipHistoryModel.aggregate([
        {
          $match: filter,
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            _id: 0,
            __v: 0,
          },
        },
      ]);

      return list;
    } catch (err) {
      throw new Error("Failed to fetch the membership list");
    }
  }

  /**
   * Creates a new membership record.
   *
   * @param {Object} data The data to create the record with.
   * @param {string} data.membershipId The membership ID.
   * @param {string} data.userId The user ID.
   * @param {Date} data.validfrom The valid from date.
   * @param {Date} data.validto The valid to date.
   * @returns {Promise<Object>} The created record.
   */
  async createMembershipRecord(data) {
    try {
      data.membershipId = new ObjectId(data.membershipId);
      data.userId = new ObjectId(data.userId);
      data.validfrom = new Date(data.validfrom);
      data.validto = new Date(data.validto);
      const result = await this.membershipHistoryModel.create(data);
      return result;
    } catch (err) {
      this.logger.info(err);
      throw new Error("Failed to create the record");
    }
  }
};
