const express = require("express");
const globalErrorHandler = require("./utils/middlewares/globalErrorHandler");
const { connectDB } = require("./utils/dbConfig");
require("dotenv").config();

const app = express();

connectDB();

app.use(express.json({ limit: "100mb" }));

app.use(require("./API"));

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use(globalErrorHandler);

app.listen(8000, () => console.log("connected"));
