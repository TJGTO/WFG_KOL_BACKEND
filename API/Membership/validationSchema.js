const yup = require("yup");

const createMemberShipRecordSchema = yup.object({
  body: yup.object({
    membershipId: yup.string().required(),
    membershipName: yup.string().required(),
    userId: yup.string().required(),
    userName: yup.string().required(),
    profilePictureURL: yup.string().required(),
    validfrom: yup.string().required(),
    validto: yup.string().required(),
  }),
});

module.exports = { createMemberShipRecordSchema };
