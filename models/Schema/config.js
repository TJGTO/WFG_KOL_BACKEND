const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ConfigSchema = new Schema(
  {
    document_type: { type: String, required: true, unique: true },
    config: { type: Schema.Types.Mixed, required: true },
  },
  { timestamps: true }
);

const ConfigModel = mongoose.model("config", ConfigSchema, "config");

module.exports = { ConfigSchema, ConfigModel };
