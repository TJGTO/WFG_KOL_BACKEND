const mongoose = require("mongoose");
const { date } = require("yup");
const Schema = mongoose.Schema;

const gameSchema = new Schema(
  {
    venue: {
      type: String,
      required: true,
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
    upi_id: {
      type: String,
    },
    players: [
      {
        name: {
          type: String,
        },
        player_id: {
          type: Schema.Types.ObjectId,
        },
        age: {
          type: String,
        },
        profilepictureurl: {
          type: String,
        },
      },
    ],
  },
  { timestamps: true }
);

const gameModel = mongoose.model("games", gameSchema);
module.exports = { gameSchema, gameModel };
