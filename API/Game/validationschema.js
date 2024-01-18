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

// const registerPlayerSchema = yup.object({
//   body: yup.object({
//     position: yup
//       .string()
//       .oneOf(["Defence", "Midfield", "Attack", "Keeper"])
//       .required("You must select a position"),
//     gameid: yup.string().required(),
//   }),
//   files: yup.object({
//     file: yup.mixed().test("isBlob", "Must be a Blob", (value) => {
//       if (!(value instanceof Blob)) {
//         return false;
//       }
//     }),
//   }),
// });

const upiIdPattern = "^[0-9A-Za-z.-]{2,256}@[A-Za-z]{2,64}$";
const phoneRegex = /^(?:(?:0|91)?[6789]\d{9})$/;
const updateGameSchema = yup.object({
  body: yup.object({
    gameid: yup.string().required("Please provide a valid game id"),
    upiId: yup.string().matches(upiIdPattern, "Please enter a valid upi id"),
    paymentNo: yup
      .string()
      .matches(phoneRegex, "Please provide a valid payment number")
      .min(10)
      .max(10),
  }),
});

const updatePlayerInGameStatusSchema = yup.object({
  body: yup.object({
    gameId: yup.string().required("Please provide valid game id"),
    playerId: yup.string().required("Please provide valid player id"),
    status: yup.string().required("Please provide valid status"),
  }),
});

module.exports = {
  createGameSchema,
  addUpdatePlayerSchema,
  removePlayerSchema,
  // registerPlayerSchema,
  updateGameSchema,
  updatePlayerInGameStatusSchema,
};
