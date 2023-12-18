const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
  DOB : { type : String},
  phone_no: {type : String},
  email: {type: String},
  password: {type: String},
  facebook: {type: String},
  instagram: {type: String},
  youtube: {type: String},
  salt: {type: String}
});

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = { usersSchema, UsersModel };
 