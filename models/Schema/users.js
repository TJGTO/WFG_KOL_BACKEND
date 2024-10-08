const mongoose = require("mongoose");
const { number } = require("yup");
const { Schema } = mongoose;

const usersSchema = new Schema(
  {
    firstName: { type: String, required: true },
    lastName: { type: String },
    DOB: { type: String },
    academic: { type: String, enum: ["Working Professional", "Student"] },
    phone_no: { type: String },
    email: { type: String },
    profilePictureURL: { type: String },
    roles: {
      type: [String],
      default: [],
      required: true,
    },
    address: {
      address_line_1: {
        type: String,
      },
      address_line_2: {
        type: String,
      },
      pincode: {
        type: String,
      },
      city: {
        type: String,
      },
      state: {
        state_id: {
          type: Schema.Types.ObjectId,
        },
        state_name: {
          type: String,
        },
      },
    },
    password: { type: String },
    facebook: { type: String },
    instagram: { type: String },
    youtube: { type: String },
    about: { type: String },
    salt: { type: String },
    fotp: { type: String },
    timeforfotp: { type: String },
    badges: [
      {
        title: {
          type: String,
        },
        level: {
          type: Number,
        },
        priority: {
          type: Number,
        },
      },
    ],
  },
  { timestamps: true }
);

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = { usersSchema, UsersModel };
