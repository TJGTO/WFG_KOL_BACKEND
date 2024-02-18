const yup = require("yup");

const createArticleSchema = yup.object({
  body: yup.object({
    title: yup.string().required("Title of article is required"),
    description: yup.string().required("Description of article is required"),
  }),
});

module.exports = {
  createArticleSchema,
};
