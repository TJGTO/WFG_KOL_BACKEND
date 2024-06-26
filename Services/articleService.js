const { default: mongoose } = require("mongoose");
const { articleModel } = require("../models/Schema/article");
const { ObjectId } = require("mongodb");
const R = require("ramda");
const formatDate = require("../utils/functions");

module.exports = class Articleservice {
  constructor() {
    this.articleModel = articleModel;
  }
  /**
   * Creates a new article.
   *
   * @param {object} data The article data to be created.
   * @returns {object} The created article.
   */
  async createArticle(data) {
    try {
      data.body.createdBy = new ObjectId(data.user.id);
      const createdArticle = await this.articleModel.create(data.body);
      return createdArticle;
    } catch (error) {
      throw new Error("Failed to create article");
    }
  }
  /**
   * Updates an article.
   *
   * @param {object} data The request body.
   * @param {string} data.body.articleId The ID of the article to be updated.
   * @param {string} data.body.createdBy The ID of the user who created the article.
   * @param {string} data.user.id The ID of the currently logged in user.
   * @returns {object} A success or error message.
   */
  async updateArticle(data) {
    const isValiduser = data.body.createdBy === data.user.id ? true : false;
    try {
      if (isValiduser) {
        const updatedArticle = await this.articleModel.findOneAndUpdate(
          { _id: data.body.articleId },
          data.body
        );
      } else {
        return {
          success: false,
          message: "You are not authorised to update this article",
        };
      }
      return {
        success: true,
        message: "Article succesfully updated",
      };
    } catch (error) {
      throw new Error("Unable to update article");
    }
  }
  /**
   * Fetches all active articles, including user information for the author.
   *
   * @returns {object} An object containing the success status, a message, and the articles data.
   */
  async activeArticle() {
    try {
      const activeArtciles = await this.articleModel.aggregate([
        {
          $match: {
            isActive: true,
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
          $sort: {
            createdAt: -1,
          },
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
            likesCount: { $size: "$likes" },
            dislikesCount: { $size: "$dislikes" },
            likes: 1,
            dislikes: 1,
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
        {
          $match: {
            _id: new ObjectId(articleId),
          },
        },
        {
          $unwind: "$comments",
        },
        {
          $lookup: {
            from: "users",
            localField: "comments.commentBy",
            foreignField: "_id",
            as: "commentBy",
          },
        },
        {
          $unwind: "$commentBy",
        },
        {
          $unwind: {
            path: "$comments.replyComments",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "comments.replyComments.commentBy",
            foreignField: "_id",
            as: "comments.replyComments.commentBy",
          },
        },
        {
          $unwind: {
            path: "$comments.replyComments.commentBy",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            commentId: "$comments.commentId",
            text: "$comments.text",
            "commentBy._id": "$commentBy._id",
            "commentBy.profilePictureURL": "$commentBy.profilePictureURL",
            "commentBy.fullName": {
              $concat: ["$commentBy.firstName", " ", "$commentBy.lastName"],
            },
            "replyComments.commentId": "$comments.replyComments.commentId",
            "replyComments.text": "$comments.replyComments.text",
            "replyComments.commentBy._id":
              "$comments.replyComments.commentBy._id",
            "replyComments.commentBy.profilePictureURL":
              "$comments.replyComments.commentBy.profilePictureURL",
            "replyComments.commentBy.fullName": {
              $concat: [
                "$comments.replyComments.commentBy.firstName",
                " ",
                "$comments.replyComments.commentBy.lastName",
              ],
            },
          },
        },
      ]);
      const groupByCommentId = R.reduceBy(
        (acc, current) =>
          R.evolve(
            {
              text: R.always(current.text),
              commentId: R.always(current.commentId),
              commentBy: R.always(current.commentBy),
              replyComments: R.append(current.replyComments),
            },
            acc
          ),
        { text: "", commentBy: {}, commentId: "", replyComments: [] },
        R.prop("commentId")
      );

      const groupedData = R.compose(
        R.values,
        R.map((group) =>
          R.evolve(
            { replyComments: R.reject(R.propEq("text", undefined)) },
            group
          )
        )
      )(groupByCommentId(commentsWithUserInfo));

      return {
        success: true,
        message: "Successfull",
        data: groupedData,
      };
    } catch (error) {
      console.error("Error fetching article comments:", error);
      throw error;
    }
  }
  /**
   * Checks the permissions of a user for a given article.
   *
   * @param {object} data The request body.
   * @param {string} data.user.id The ID of the currently logged in user.
   * @returns {object} A permission matrix for the user.
   */
  async checkGamePermission(data) {
    try {
      let permissionMatrix = {
        editArticle: false,
        approveOrReject: false,
      };
      const setAllToTrue = R.map(R.T);
      const articleDetails = await this.individualArticle(data);
      if (articleDetails.likes.includes(data.user.id)) {
        permissionMatrix.liked = true;
      }
      if (articleDetails.dislikes.includes(data.user.id)) {
        permissionMatrix.disliked = true;
      }
      const creatorId = new ObjectId(data.user.id);
      if (creatorId.equals(articleDetails.creator._id)) {
        const response = setAllToTrue(permissionMatrix);
        return response;
      } else {
        return permissionMatrix;
      }
    } catch (error) {
      console.log(error);
      throw new Error("Failed to get permission Matrix");
    }
  }
  /**
   * Updates the likes or dislikes of an article.
   *
   * @param {Object} data The request body.
   * @param {string} data.body.articleId The ID of the article.
   * @param {string} data.body.flag The flag indicating whether to like or dislike the article.
   * @param {Object} data.user The user object.
   * @param {string} data.user.id The ID of the user.
   * @returns {string} A success message.
   */
  async likeorDislikeapost(data) {
    try {
      let filterObj = {
        _id: new ObjectId(data.body.articleId),
      };
      let pullObj = {};
      let pushObj = {};
      if (data.body.flag == "dislike") {
        filterObj = {
          ...filterObj,
          dislikes: { $ne: data.user.id },
        };
        pullObj = {
          ...pullObj,
          likes: data.user.id,
        };
        pushObj = {
          ...pushObj,
          dislikes: data.user.id,
        };
      }

      if (data.body.flag == "like") {
        filterObj = {
          ...filterObj,
          likes: { $ne: data.user.id },
        };
        pullObj = {
          ...pullObj,
          dislikes: data.user.id,
        };
        pushObj = {
          ...pushObj,
          likes: data.user.id,
        };
      }

      if (data.body.flag == "outlike") {
        filterObj = {
          ...filterObj,
          likes: { $eq: data.user.id },
        };
        pullObj = {
          ...pullObj,
          likes: data.user.id,
        };
      }
      if (data.body.flag == "outdislike") {
        filterObj = {
          ...filterObj,
          dislikes: { $eq: data.user.id },
        };
        pullObj = {
          ...pullObj,
          dislikes: data.user.id,
        };
      }

      const updatedArticle = await this.articleModel.findOneAndUpdate(
        filterObj,
        {
          $pull: pullObj,
          $push: pushObj,
        },
        { new: true }
      );
      if (updatedArticle) {
        return {
          success: true,
          likesCount: updatedArticle.likes.length,
          dislikesCount: updatedArticle.dislikes.length,
          message: "updated successfully",
        };
      } else {
        return {
          success: false,
          message: "Nothing to update",
        };
      }
    } catch (error) {
      console.log(error);
      throw new Error("Failed to update");
    }
  }
};
