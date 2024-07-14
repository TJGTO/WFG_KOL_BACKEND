const mongoose = require("mongoose");
const { date } = require("yup");
const Schema = mongoose.Schema;

const gameSchema = new Schema(
  {
    venue: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      required: true,
    },
    paymentNo: {
      type: String,
    },
    upiId: {
      type: String,
    },
    date: {
      type: String,
      required: true,
    },
    start_time: {
      type: String,
      required: true,
    },
    end_time: {
      type: String,
      required: true,
    },
    number_of_players: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: true,
    },
    number_of_teams: {
      type: Number,
    },
    status: {
      type: String,
      enum: ["Inactive", "Active", "Cancelled", "Removed", "Completed"],
      default: "Inactive",
      required: true,
    },
    matchType: {
      type: String,
      enum: ["Match", "Tournament"],
      required: true,
    },
    paymentOptions: [
      {
        paymentType: {
          type: String,
        },
        price: {
          type: Number,
        },
      },
    ],
    players: [
      {
        name: {
          type: String,
        },
        player_id: {
          type: Schema.Types.ObjectId,
        },
        team: { type: String },
        age: {
          type: String,
        },
        profilepictureurl: {
          type: String,
        },
        paymentImageurl: {
          type: [String],
        },
        rating: {
          type: Number,
        },
        status: {
          type: String,
          default: "Added",
          required: true,
          enum: [
            "Added",
            "Approved",
            "Rejected",
            "Withdrawn",
            "Removed",
            "Paid",
          ],
        },
        phoneNumber: {
          type: String,
        },
        position: {
          type: String,
          enum: ["Defence", "Midfield", "Attack", "Keeper"],
        },
        dynamicFields: [
          {
            name: { type: String, required: true },
            value: Schema.Types.Mixed,
          },
        ],
      },
    ],
    otherFormFields: [
      {
        name: { type: String, required: true },
        type: { type: String, required: true },
        required: { type: Boolean },
        values: { type: [String] },
      },
    ],
  },
  { timestamps: true }
);

const gameModel = mongoose.model("games", gameSchema);
module.exports = { gameSchema, gameModel };
