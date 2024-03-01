const express = require("express");
const nodemailer = require("nodemailer");
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

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use `true` for port 465, `false` for all other ports
  auth: {
    user: "tathagata5121@gmail.com",
    pass: process.env.mailPassword,
  },
});

app.get("/sendEmail", async (req, res) => {
  try {
    const info = await transporter.sendMail({
      from: "tathagata5121@gmail.com", // sender address
      to: "asamanjakasundi@gmail.com", // list of receivers
      subject: "Hello ✔", // Subject line
      text: "Hello world?", // plain text body
      html: "<b>Hello world?</b>", // html body
    });
    res.send(info.messageId);
  } catch (error) {
    console.log(error);
    res.send(`Failed ${process.env.mailPassword}`);
  }
});

app.use(globalErrorHandler);
app.listen(8000, () => console.log("connected"));
