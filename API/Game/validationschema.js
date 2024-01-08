const yup = require("yup");

const createGameSchema = yup.object({
  body: yup.object({
    venue: yup.string().required(),
    date: yup.string().required(),
    start_time: yup.string().required(),
    end_time: yup.string().required(),
    price: yup.string().required(),
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
