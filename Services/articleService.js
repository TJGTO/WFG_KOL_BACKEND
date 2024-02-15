const { default: mongoose } = require("mongoose");
const { articleModel } = require("../models/Schema/article");
const { ObjectId } = require("mongodb");
const formatCreatedAt = require("../utils/functions");

module.exports = class Articleservice {
  constructor() {
    this.articleModel = articleModel;
  }

  async createArticle(data) {
    try {
      data.body.createdBy = new ObjectId(data.user.id);
      const createdArticle = await this.articleModel.create(data.body);
      return createdArticle;
    } catch (error) {
      throw new Error("Failed to create article");
    }
  }

  async activeArticle() {
    try {
      const activeArtciles = await this.articleModel.aggregate([
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $project: {
            _id: 1,
            title: 1,
            createdAt: "$createdAt",
            createdBy: {
              $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
            },
            profilePictureURL: "$userDetails.profilePictureURL",
          },
        },
      ]);
      formatCreatedAt(activeArtciles);

      return activeArtciles;
    } catch (error) {
      throw new Error("Unable to fetch article details");
    }
  }

  async individualArticle(data) {
    try {
      const article = await this.articleModel.aggregate([
        {
          $match: {
            _id: new ObjectId(data.params.articleId),
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "userDetails",
          },
        },
        {
          $unwind: "$userDetails",
        },
        {
          $project: {
            _id: 1,
            title: 1,
            description: 1,
            createdAt: "$createdAt",
            creator: {
              _id: "$userDetails._id",
              firstName: "$userDetails.firstName",
              lastName: "$userDetails.lastName",
              profilePictureURL: "$userDetails.profilePictureURL",
              about: "$userDetails.about",
            },
          },
        },
      ]);

      formatCreatedAt(article);

      return article;
    } catch (error) {
      throw new Error("Unable to fetch intended article");
    }
  }
};
