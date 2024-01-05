const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const AboutUsSchema = new Schema(
  {
    titleText: { type: String },
    DescriptionText: { type: String },
    ImageUrl: { type: String },
  },
  { timestamps: true }
);

const AboutUsModel = mongoose.model("aboutUs", AboutUsSchema);

module.exports = { AboutUsSchema, AboutUsModel };
