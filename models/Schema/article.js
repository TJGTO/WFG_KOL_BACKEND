const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const articleSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    comments: [
      {
        commentId: {
          type: String,
          required: true,
        },
        text: {
          type: String,
          required: true,
        },
        commentBy: {
          type: Schema.Types.ObjectId,
          required: true,
        },
        replyComments: [
          {
            commentId: {
              type: String,
              required: true,
            },
            text: {
              type: String,
              required: true,
            },
            commentBy: {
              type: Schema.Types.ObjectId,
              required: true,
            },
          },
        ],
      },
    ],
    likes: {
      type: [String],
      required: true,
    },
    dislikes: {
      type: [String],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },

  { timestamps: true }
);

const articleModel = mongoose.model("articles", articleSchema);
module.exports = { articleSchema, articleModel };
