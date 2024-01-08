const yup = require("yup");

const createGameSchema = yup.object({
  body: yup.object({
    venue: yup.string().required("Venue is required"),
    date: yup.string().required("Date is required"),
    start_time: yup.string().required("Start time is required"),
    end_time: yup.string().required("End time is required"),
    number_of_players: yup
      .number()
      .required("Please enter number of players")
      .min(1, "At least one player slot should be there"),
    price: yup.number().required("Price is required"),
  }),
});

const playerSchema = yup.object({
  name: yup.string().required("Name is required"),
  player_id: yup.string().required("Player id is required"),
  age: yup
    .number()
    .positive()
    .max(100)
    .required("Age should be a positive number"),
  profilepictureurl: yup
    .string()
    .required("Please provide a valid profile picture"),
});
const addUpdatePlayerSchema = yup.object({
  body: yup.object({
    gameid: yup.string().required(),
    players: yup
      .array()
      .of(playerSchema)
      .min(1, "At least one player is required"),
  }),
});

const removePlayerSchema = yup.object({
  body: yup.object({
    gameid: yup.string().required(),
    playersid: yup
      .array()
      .of(yup.string().required().min(1, "You can't pass empty string"))
      .min(1, "Minimum one player id is required"),
  }),
});

module.exports = {
  createGameSchema,
  addUpdatePlayerSchema,
  removePlayerSchema,
};
