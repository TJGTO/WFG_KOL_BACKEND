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
   * get all states
   * @param {*} request
   * @returns
   */
  //
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
