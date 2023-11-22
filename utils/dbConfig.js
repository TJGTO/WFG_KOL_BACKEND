const mongoose = require("mongoose");

function connectDB() {
  const url =
    "mongodb+srv://prac-dev:OK9q7tGDvlAAWVJb@cluster0.j9dfvp2.mongodb.net/wfgKol?retryWrites=true&w=majority";

  try {
    mongoose.connect(url, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
  const dbConnection = mongoose.connection;
  dbConnection.once("open", (_) => {
    console.log(`Database connected: ${url}`);
  });

  dbConnection.on("error", (err) => {
    console.error(`connection error: ${err}`);
  });
  return;
}

module.exports = { connectDB };
