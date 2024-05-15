const { MembershipRecordModel } = require("../models/Schema/membershipHIstory");
const { ObjectId } = require("mongodb");
const R = require("ramda");
const formatDate = require("../utils/functions");
const logger = require("../utils/loggerConfig");

module.exports = class MembershipRecordservice {
  constructor() {
    this.membershipHistoryModel = MembershipRecordModel;
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
      list.forEach((x) => {
        x.validto = formatDate(x.validto, "DD MMM YYYY");
        x.validfrom = formatDate(x.validfrom, "DD MMM YYYY");
      });
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
      const createmembershipArray = data.users.map((item) => {
        return {
          membershipId: data.membershipId,
          membershipName: data.membershipName,
          validfrom: new Date(data.validfrom),
          validto: new Date(data.validto),
          ...item,
        };
      });

      const result = await this.membershipHistoryModel.insertMany(
        createmembershipArray
      );
      return result;
    } catch (err) {
      this.logger.info(err);
      throw new Error("Failed to create the record");
    }
  }
};
