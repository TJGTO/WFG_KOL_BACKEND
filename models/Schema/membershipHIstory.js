const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const MembershipRecordSchema = new Schema(
  {
    membershipId: { type: Schema.Types.ObjectId },
    membershipName: { type: String },
    userId: { type: Schema.Types.ObjectId },
    userName: { type: String },
    profilePictureURL: { type: String },
    validfrom: { type: Date },
    validto: { type: Date },
  },
  { timestamps: true }
);

const MembershipRecordModel = mongoose.model(
  "membershipRecord",
  MembershipRecordSchema
);

module.exports = { MembershipRecordSchema, MembershipRecordModel };
