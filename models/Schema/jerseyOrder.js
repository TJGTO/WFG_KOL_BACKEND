const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const JerseyOrderSchema = new Schema(
  {
    name: { type: String, required: true },
    jerseyName: { type: String },
    jerseyNumber: { type: String },
    phone: { type: String, required: true },
    referralCode: { type: String },
    referrer: { type: String },
    color: { type: String, required: true },
    fabric: { type: String, required: true },
    size: { type: String, required: true },
    quantity: { type: Number, required: true },
    pickupLabel: { type: String, required: true },
    total: { type: Number, required: true },
    // No file-storage integration yet — paymentScreenshotUrl is a static
    // placeholder link until real upload (S3/Drive) is wired up.
    paymentScreenshotUrl: { type: String },
    paymentScreenshotFileName: { type: String },
    status: { type: String, default: "pending_verification" },
  },
  { timestamps: true }
);

const JerseyOrderModel = mongoose.model(
  "jerseyOrder",
  JerseyOrderSchema,
  "jerseyOrders"
);

module.exports = { JerseyOrderSchema, JerseyOrderModel };
