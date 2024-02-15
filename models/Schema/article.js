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
  },
  { timestamps: true }
);

const articleModel = mongoose.model("articles", articleSchema);
module.exports = { articleSchema, articleModel };
