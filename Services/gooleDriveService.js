const stream = require("stream");
const path = require("path");
const { google } = require("googleapis");

module.exports = class GoogleDriveService {
  constructor() {
    this.scope = ["https://www.googleapis.com/auth/drive"];
    this.keyFilePath = path.join(__dirname, "googleapi.json");
    this.version = "v3";
  }
  createAuthObject() {
    const gauth = new google.auth.GoogleAuth({
      keyFile: this.keyFilePath,
      scopes: this.scope,
    });
    return gauth;
  }
  getFolderDetais(folderName) {
    switch (folderName) {
      case "profilepicture":
        return [process.env.profilepicture];
      case "gamePayment":
        return [process.env.gamePayment];
    }
  }
  async uploadFile(fileObject, folderName) {
    try {
      const bufferStream = new stream.PassThrough();
      bufferStream.end(fileObject.data);
      const { data } = await google
        .drive({ version: this.version, auth: this.createAuthObject() })
        .files.create({
          media: {
            body: bufferStream,
            mimeType: fileObject.mimeType,
          },
          requestBody: {
            name: fileObject.name,
            parents: this.getFolderDetais(folderName),
          },
          fields: "id,name",
        });

      return {
        isSuccess: true,
        data: data,
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error,
      };
    }
  }
  async deleteFile(fileId) {
    try {
      const drive = google.drive({
        version: this.version,
        auth: this.createAuthObject(),
      });

      await drive.files.delete({
        fileId: fileId,
      });

      return {
        isSuccess: true,
        message: "File deleted successfully",
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error.message || "Error deleting file",
      };
    }
  }
};
