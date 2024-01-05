const express = require("express");
const globalErrorHandler = require("./utils/middlewares/globalErrorHandler");
const { connectDB } = require("./utils/dbConfig");
const fileupload = require("express-fileupload");
const cors = require("cors");

require("dotenv").config();

const app = express();

connectDB();

app.use(cors());

app.use(fileupload());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ extended: true, limit: "50mb" }));

app.use(require("./API"));

app.get("/", (req, res) => {
  res.send("Welcome");
});

app.use(globalErrorHandler);

app.listen(8000, () => console.log("connected"));
