const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  DOB: { type: String },
  academic: { type: String, enum: ["Working Professional", "Student"] },
  phone_no: { type: String },
  email: { type: String },
  profilePictureURL: { type: String },
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
});

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = { usersSchema, UsersModel };
