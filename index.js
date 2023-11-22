const express = require("express");
const globalErrorHandler = require("./utils/middlewares/globalErrorHandler");
const { connectDB } = require("./utils/dbConfig");

const app = express();

require("dotenv").config();

connectDB();

app.use(express.json({ limit: "100mb" }));

app.use(require("./API"));

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use(globalErrorHandler);

app.listen(8000, () => console.log("connected"));
