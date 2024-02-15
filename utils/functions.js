const moment = require("moment");

function formatCreatedAt(article) {
  article.forEach((item) => {
    item.createdAt = moment(item.createdAt).format("DD MMM YYYY");
  });
}

module.exports = formatCreatedAt;
