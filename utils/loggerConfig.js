const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  level: "info",
  format: format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.MongoDB({
      db: "mongodb+srv://prac-dev:OK9q7tGDvlAAWVJb@cluster0.j9dfvp2.mongodb.net/wfgKol?retryWrites=true&w=majority",
      collection: "logs",
      options: { useNewUrlParser: true, useUnifiedTopology: true },
    }),
  ],
});

module.exports = logger;
