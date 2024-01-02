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
        .drive({ version: this.version, auth: createAuthObject() })
        .files.create({
          media: {
            body: bufferStream,
            mimeType: fileObject.mimeType,
          },
          requestBody: {
            name: fileObject.name,
            parents: getFolderDetais(folderName),
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
};
