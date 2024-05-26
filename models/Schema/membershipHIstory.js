const mongoose = require("mongoose");
const { number } = require("yup");
const Schema = mongoose.Schema;

const MembershipRecordSchema = new Schema(
  {
    membershipId: { type: Schema.Types.ObjectId, required: true },
    membershipName: { type: String, required: true },
    membershipCardId: { type: String, required: true },
    userId: { type: Schema.Types.ObjectId, required: true },
    userName: { type: String, required: true },
    amount: { type: String },
    profilePictureURL: { type: String },
    validfrom: { type: Date, required: true },
    validto: { type: Date, required: true },
  },
  { timestamps: true }
);

const MembershipRecordModel = mongoose.model(
  "membershipRecord",
  MembershipRecordSchema
);

module.exports = { MembershipRecordSchema, MembershipRecordModel };
