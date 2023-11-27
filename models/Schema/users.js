const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  DOB : { type : String},
  phone_no: {type : Number},
  email: {type: String},
  password: {type: String},
  salt: {type: String}
});

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = { usersSchema, UsersModel };
