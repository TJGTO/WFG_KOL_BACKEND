const moment = require("moment");

function formatDate(date, outputFormatdate) {
  const formattedDate = moment(date).format(outputFormatdate);
  return formattedDate;
}

module.exports = formatDate;
