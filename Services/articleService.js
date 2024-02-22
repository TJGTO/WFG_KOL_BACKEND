const { default: mongoose } = require("mongoose");
const { articleModel } = require("../models/Schema/article");
const { ObjectId } = require("mongodb");
const formatDate = require("../utils/functions");

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
            createdAt: 1,
            createdBy: {
              $concat: ["$userDetails.firstName", " ", "$userDetails.lastName"],
            },
            profilePictureURL: "$userDetails.profilePictureURL",
          },
        },
      ]);
      activeArtciles.forEach((x) => {
        x.createdAt = formatDate(x.createdAt, "DD MMM YYYY");
      });
      return activeArtciles;
    } catch (error) {
      throw new Error("Unable to fetch article details");
    }
  }

  /**
   * Fetches and formats an individual article by ID.
   *
   * @param {object} data The request data containing the article ID.
   * @returns {object} The formatted article object.
   */
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
            createdAt: 1,
            updatedAt: 1,
            creator: {
              _id: "$userDetails._id",
              fullName: {
                $concat: [
                  "$userDetails.firstName",
                  " ",
                  "$userDetails.lastName",
                ],
              },
              firstName: "$userDetails.firstName",
              lastName: "$userDetails.lastName",
              profilePictureURL: "$userDetails.profilePictureURL",
              about: "$userDetails.about",
            },
          },
        },
      ]);

      if (article.length == 0) {
        throw new Error();
      }
      article.forEach((x) => {
        x.createdAt = formatDate(x.createdAt, "DD MMM YYYY");
        x.updatedAt = formatDate(x.createdAt, "DD MMM YYYY");
      });

      return article[0];
    } catch (error) {
      throw new Error("Unable to fetch intended article");
    }
  }

  /**
   * Adds a new comment to an article.
   *
   * @param {object} data The request data containing the article ID, comment text, and parent comment ID (if applicable).
   * @returns {string} A success message.
   */
  async addComments(data) {
    try {
      const { articleId, text, parentId } = data.body;
      const Article = await this.articleModel.findById(articleId);
      let commentObj = {
        text: text,
        commentBy: data.user.id,
      };
      if (parentId) {
        let CommentArrIdx = Article.comments.findIndex(
          (x) => x.commentId == parentId
        );
        if (Article.comments[CommentArrIdx].replyComments) {
          commentObj.commentId =
            Article.comments[CommentArrIdx].replyComments.length + 1;
        } else {
          commentObj.commentId = 1;
        }
        Article.comments[CommentArrIdx].replyComments.push(commentObj);
      } else {
        commentObj.commentId = Article.comments.length + 1;
        Article.comments.push(commentObj);
      }
      const updatedArticle = await Article.save();
      return "Success";
    } catch (error) {
      throw new Error("Failed tp update comments");
    }
  }
  /**
   * Fetches all comments for a given article, including user information for commenters and those who replied.
   *
   * @param {string} articleId The ID of the article to fetch comments for.
   * @returns {object} An object containing the success status, a message, and the comments data.
   */
  async fetchArticleComments(articleId) {
    try {
      const article = await this.articleModel.findById(articleId);
      if (!article) {
        return {
          success: false,
          message: "Article not found",
        };
      }

      const commentsWithUserInfo = await this.articleModel.aggregate([
        { $match: { _id: new ObjectId(articleId) } },
        { $unwind: "$comments" },
        {
          $lookup: {
            from: "users",
            localField: "comments.commentBy",
            foreignField: "_id",
            as: "commentBy",
          },
        },
        { $unwind: "$commentBy" },
        {
          $lookup: {
            from: "users",
            localField: "comments.replyComments.commentBy",
            foreignField: "_id",
            as: "replyCommentBy",
          },
        },
        {
          $addFields: {
            "comments.replyComments.commentBy": {
              $map: {
                input: "$replyCommentBy",
                as: "replyUser",
                in: {
                  _id: "$$replyUser._id",
                  fullName: {
                    $concat: [
                      "$$replyUser.firstName",
                      " ",
                      "$$replyUser.lastName",
                    ],
                  },
                  profilePictureURL: "$$replyUser.profilePictureURL",
                },
              },
            },
          },
        },
        {
          $project: {
            _id: "$comments._id",
            text: "$comments.text",
            commentId: "$comments.commentId",
            commentBy: {
              _id: "$commentBy._id",
              fullName: {
                $concat: ["$commentBy.firstName", " ", "$commentBy.lastName"],
              },
              profilePictureURL: "$commentBy.profilePictureURL",
            },
            replyComments: "$comments.replyComments",
          },
        },
      ]);

      return {
        success: true,
        message: "Successfull",
        data: commentsWithUserInfo,
      };
    } catch (error) {
      console.error("Error fetching article comments:", error);
      throw error;
    }
  }
};
