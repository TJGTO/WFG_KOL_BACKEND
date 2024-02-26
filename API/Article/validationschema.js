const yup = require("yup");

const createArticleSchema = yup.object({
  body: yup.object({
    title: yup.string().required("Title of article is required"),
    description: yup.string().required("Description of article is required"),
  }),
});

const updateArticleSchema = yup.object({
  body: yup.object({
    articleId: yup.string().required("Airticle Id is required"),
    title: yup.string().required("Title of article is required"),
    description: yup.string().required("Description of article is required"),
    createdBy: yup.string().required("createdBy is required"),
  }),
});
module.exports = {
  createArticleSchema,
  updateArticleSchema,
};
