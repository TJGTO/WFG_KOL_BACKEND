const { createLogger, transports, format } = require("winston");
require("winston-mongodb");

const logger = createLogger({
  level: "info",
  format: format.json(),
  defaultMeta: { service: "user-service" },
  transports: [
    new transports.MongoDB({
      db: process.env.DATABASE_STREAM,
      collection: "logs",
      options: { useNewUrlParser: true, useUnifiedTopology: true },
    }),
  ],
});

module.exports = logger;
