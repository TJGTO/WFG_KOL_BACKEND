const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MembershipSchema = new Schema(
  {
    name: { type: String },
    DescriptionText: { type: String },
  },
  { timestamps: true }
);

const MembershipUsModel = mongoose.model("membership", MembershipSchema);

module.exports = { MembershipSchema, MembershipUsModel };
