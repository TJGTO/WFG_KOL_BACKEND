const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const venueSchema = new Schema(
  {
    fieldName: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    images: {
      type: Array,
      default: [],
    },
  },
  { timestamps: true }
);

const venueModel = mongoose.model("venue", venueSchema);
module.exports = { venueSchema, venueModel };
