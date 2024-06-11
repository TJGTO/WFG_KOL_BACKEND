const yup = require("yup");

const createMemberShipRecordSchema = yup.object({
  body: yup.object({
    membershipId: yup.string().required(),
    membershipName: yup.string().required(),
    users: yup
      .array()
      .of(
        yup.object().shape({
          userId: yup.string().required(),
          userName: yup.string().required(),
          profilePictureURL: yup.string().required(),
        })
      )
      .min(1, "Users array must have at least 1 item"),
    amount: yup.string().required(),
    validfrom: yup.string().required(),
    validto: yup.string().required(),
  }),
});

const extendMemberShipRecordSchema = yup.object({
  body: yup.object({
    cardId: yup.string().required(),
    amount: yup.string().required(),
    validfrom: yup.string().required(),
    validto: yup.string().required(),
  }),
});
module.exports = { createMemberShipRecordSchema, extendMemberShipRecordSchema };
