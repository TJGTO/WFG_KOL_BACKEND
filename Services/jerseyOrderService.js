const sharp = require("sharp");
const { JerseyOrderModel } = require("../models/Schema/jerseyOrder");
const { supabase } = require("../utils/supabaseClient");

const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5MB — checked before compression
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/jpg", "image/webp"];
const ORDER_STATUSES = ["pending_verification", "verified", "rejected"];
// Payment screenshots are mostly text/UI, not photos — a wide max width and
// moderate JPEG quality keeps transaction details readable while cutting
// file size drastically (PNG screenshots in particular shrink a lot).
const MAX_IMAGE_DIMENSION = 1600;
const JPEG_QUALITY = 75;

module.exports = class JerseyOrderService {
  constructor() {
    this.jerseyOrderModel = JerseyOrderModel;
  }
  /**
   * create a jersey order
   * @param {*} data - customer, product selection, pickup and payment details
   * @returns - the saved order document
   */
  async createOrder(data) {
    try {
      const order = await this.jerseyOrderModel.create(data);
      return order;
    } catch (err) {
      throw new Error("Failed to save jersey order");
    }
  }

  /**
   * dashboard stats — units sold (total + by fabric + by design), revenue,
   * and the order list for the table
   * @returns
   */
  async getDashboardStats() {
    try {
      const orders = await this.jerseyOrderModel.find().sort({ createdAt: -1 }).lean();

      const soldByDesign = {};
      const totals = orders.reduce(
        (acc, order) => {
          acc.totalSold += order.quantity;
          if (order.fabric === "Premium") acc.premiumSold += order.quantity;
          if (order.fabric === "Standard") acc.standardSold += order.quantity;
          acc.totalRevenue += order.total;
          if (order.design) {
            soldByDesign[order.design] = (soldByDesign[order.design] || 0) + order.quantity;
          }
          return acc;
        },
        { totalSold: 0, premiumSold: 0, standardSold: 0, totalRevenue: 0 }
      );

      return {
        ...totals,
        soldByDesign,
        totalOrders: orders.length,
        orders,
      };
    } catch (err) {
      throw new Error("Failed to fetch dashboard stats");
    }
  }

  /**
   * approve or reject a payment screenshot
   * @param {*} orderId
   * @param {*} status - "verified" or "rejected"
   * @returns - the updated order document
   */
  async updateOrderStatus(orderId, status) {
    if (!ORDER_STATUSES.includes(status)) {
      throw new Error("Invalid status");
    }
    try {
      const order = await this.jerseyOrderModel.findByIdAndUpdate(
        orderId,
        { status },
        { new: true }
      );
      if (!order) {
        throw new Error("Order not found");
      }
      return order;
    } catch (err) {
      throw new Error(err.message || "Failed to update order status");
    }
  }

  /**
   * upload a payment screenshot to Supabase Storage
   * @param {*} fileObject - the file from req.files.file (express-fileupload)
   * @returns {Promise<{isSuccess: boolean, data?: {publicUrl: string, fileName: string}, error?: string}>}
   */
  async uploadPaymentScreenshot(fileObject) {
    if (!supabase) {
      return {
        isSuccess: false,
        error: "Screenshot storage is not configured yet",
      };
    }
    if (!fileObject) {
      return { isSuccess: false, error: "No file was uploaded" };
    }
    if (!ALLOWED_MIME_TYPES.includes(fileObject.mimetype)) {
      return { isSuccess: false, error: "Only image files are allowed" };
    }
    if (fileObject.size > MAX_FILE_SIZE_BYTES) {
      return { isSuccess: false, error: "Image must be smaller than 5MB" };
    }

    try {
      let uploadBuffer = fileObject.data;
      let contentType = fileObject.mimetype;
      try {
        uploadBuffer = await sharp(fileObject.data)
          .resize({
            width: MAX_IMAGE_DIMENSION,
            height: MAX_IMAGE_DIMENSION,
            fit: "inside",
            withoutEnlargement: true,
          })
          .jpeg({ quality: JPEG_QUALITY })
          .toBuffer();
        contentType = "image/jpeg";
      } catch (compressionErr) {
        // Fall back to the original file rather than failing the upload
        // outright — a slightly larger file beats a rejected payment proof.
        uploadBuffer = fileObject.data;
        contentType = fileObject.mimetype;
      }

      const extension = contentType === "image/jpeg" ? "jpg" : fileObject.name.split(".").pop();
      const filePath = `payment-screenshots/${Date.now()}-${fileObject.name.replace(/\.[^.]+$/, "")}.${extension}`;
      const { data, error } = await supabase.storage
        .from(process.env.SUPABASE_JERSEY_BUCKET)
        .upload(filePath, uploadBuffer, {
          contentType,
        });

      if (error) {
        return { isSuccess: false, error: error.message };
      }

      const {
        data: { publicUrl },
      } = supabase.storage
        .from(process.env.SUPABASE_JERSEY_BUCKET)
        .getPublicUrl(data.path);

      return {
        isSuccess: true,
        data: { publicUrl, fileName: fileObject.name },
      };
    } catch (err) {
      return { isSuccess: false, error: "Failed to upload screenshot" };
    }
  }
};
