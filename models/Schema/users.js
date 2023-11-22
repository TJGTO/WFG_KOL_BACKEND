const mongoose = require("mongoose");
const { Schema } = mongoose;

const usersSchema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String },
});

const UsersModel = mongoose.model("Users", usersSchema);

module.exports = { usersSchema, UsersModel };
