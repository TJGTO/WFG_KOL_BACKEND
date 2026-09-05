const yup = require("yup");

const createJerseyOrderSchema = yup.object({
  body: yup.object({
    name: yup.string().trim().required("Name is required"),
    jerseyName: yup.string().trim().required("Name on jersey is required"),
    jerseyNumber: yup
      .string()
      .trim()
      .matches(/^[0-9]{1,2}$/, "Enter a valid jersey number (0-99)")
      .required("Number on jersey is required"),
    phone: yup
      .string()
      .matches(/^[6-9]\d{9}$/, "Please enter a valid 10-digit phone number")
      .required("Phone number is required"),
    referralCode: yup.string().trim(),
    referrer: yup.string().trim(),
    color: yup.string().required("Color is required"),
    fabric: yup.string().required("Fabric is required"),
    size: yup.string().required("Size is required"),
    quantity: yup.number().required("Quantity is required").min(1),
    pickupLabel: yup.string().required("Pickup location is required"),
    total: yup.number().required("Total is required").min(0),
    paymentScreenshotUrl: yup.string(),
    paymentScreenshotFileName: yup.string(),
  }),
});

module.exports = { createJerseyOrderSchema };
