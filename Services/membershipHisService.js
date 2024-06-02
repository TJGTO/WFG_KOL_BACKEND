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
  async getAllActiveMembershipList(data) {
    try {
      let filter = {};
      if (data.flag == "active") {
        filter = {
          validto: {
            $gt: new Date(),
          },
        };
      }
      if (data.flag == "inactive") {
        filter = {
          validto: {
            $lt: new Date(),
          },
        };
      }
      if (data.searchString) {
        filter = {
          ...filter,
          $or: [
            { userName: { $regex: data.searchString, $options: "i" } },
            { membershipCardId: { $regex: data.searchString, $options: "i" } },
          ],
        };
      }
      const countTotalDocs = await this.membershipHistoryModel.countDocuments(
        filter
      );
      const list = await this.membershipHistoryModel.aggregate([
        {
          $match: filter,
        },
        {
          $addFields: {
            cardId: "$_id",
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            _id: 0,
            __v: 0,
          },
        },
        // {
        //   $sort: { updatedAt: -1 },
        // },
        {
          $skip: data.skip,
        },
        {
          $limit: data.limit,
        },
        {
          $sort: { createdAt: 1 },
        },
      ]);
      list.forEach((x) => {
        x.validto = formatDate(x.validto, "DD MMM YYYY");
        x.validfrom = formatDate(x.validfrom, "DD MMM YYYY");
      });
      return {
        totalCount: countTotalDocs,
        cards: list,
      };
    } catch (err) {
      throw new Error("Failed to fetch the membership list");
    }
  }

  /**
   * Creates a new membership record.
   *
   * @param {object} data The data to create the membership record with.
   * @param {string} data.membershipId The membership ID.
   * @param {string} data.membershipName The membership name.
   * @param {string} data.validfrom The valid from date.
   * @param {string} data.validto The valid to date.
   * @param {array} data.users The users to create the membership record for.
   * @returns {object} The created membership record.
   */
  async createMembershipRecord(data) {
    try {
      const count = (await this.membershipHistoryModel.countDocuments({})) + 1;

      const createmembershipArray = data.users.map((item, index) => {
        return {
          membershipId: data.membershipId,
          membershipName: data.membershipName,
          membershipCardId: `WFG_${new Date().getFullYear()}_${(count + index)
            .toString()
            .padStart(4, "0")}`,
          validfrom: new Date(data.validfrom),
          validto: new Date(data.validto),
          amount: data.amount,
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
  /**
   * Extends the membership validity period.
   * @param {Object} data - The data containing the card ID, valid from date, and valid to date.
   * @returns {Promise<string>} - A promise that resolves to a string indicating the success of the operation.
   * @throws {Error} - If there is an error extending the membership.
   */
  async extendMembership(data) {
    try {
      const membership = await this.membershipHistoryModel.findById(
        data.cardId
      );
      membership.validfrom = new Date(data.validfrom);
      membership.validto = new Date(data.validto);
      membership.amount = data.amount;
      await membership.save();
      let response = JSON.parse(JSON.stringify(membership));
      response.validto = formatDate(response.validto, "DD MMM YYYY");
      response.validfrom = formatDate(response.validfrom, "DD MMM YYYY");
      return response;
    } catch (err) {
      this.logger.info(err);
      throw new Error("Failed to extend the membership");
    }
  }

  async removeMembership(data) {
    try {
      // const membership = await this.membershipHistoryModel.findOneAndDelete({
      //   _id: new ObjectId(data.cardId),
      // });
      // return membership;
      return "success";
    } catch (err) {
      this.logger.info(err);
      throw new Error("Failed to extend the membership");
    }
  }

  /**
   * Searches for records based on the provided search criteria.
   * @param {Object} data - The search criteria.
   * @param {string} data.searchString - The string to search for in the userName and membershipCardId fields.
   * @param {number} data.skip - The number of records to skip.
   * @param {number} data.limit - The maximum number of records to return.
   * @returns {Promise<Array>} - A promise that resolves to an array of search results.
   * @throws {Error} - If there is an error fetching the search results.
   */
  async searchrecords(data) {
    try {
      let searchResults = await this.membershipHistoryModel.aggregate([
        {
          $match: {
            $or: [
              { userName: { $regex: data.searchString, $options: "i" } },
              {
                membershipCardId: { $regex: data.searchString, $options: "i" },
              },
            ],
          },
        },
        {
          $addFields: {
            cardId: "$_id",
          },
        },
        {
          $project: {
            createdAt: 0,
            updatedAt: 0,
            _id: 0,
            __v: 0,
          },
        },
        {
          $skip: data.skip,
        },
        {
          $limit: data.limit,
        },
        {
          $sort: { createdAt: 1 },
        },
      ]);
      searchResults.forEach((x) => {
        x.validto = formatDate(x.validto, "DD MMM YYYY");
        x.validfrom = formatDate(x.validfrom, "DD MMM YYYY");
      });
      return searchResults;
    } catch (error) {
      throw new Error("Failed to fetch the search results");
    }
  }
};
