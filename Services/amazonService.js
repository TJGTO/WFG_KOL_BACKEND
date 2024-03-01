const AWS = require("aws-sdk");

module.exports = class AWSService {
  constructor(awsConfig, bucketName) {
    this.s3 = new AWS.S3(awsConfig);
    this.bucketName = bucketName;
  }
  /**
   * Uploads a file to an S3 bucket.
   *
   * @param {Object} fileObject The file object to upload.
   * @param {string} folderName The name of the folder to upload the file to.
   * @returns {Promise<{isSuccess: boolean, data: {publicUrl: string, fileName: string} | Error}>} A promise that resolves to an object containing the public URL of the uploaded file and the file name, or an error if the upload failed.
   */
  async uploadFile(fileObject, folderName) {
    try {
      const { datePart, timePart } = this.getDateandTimeforFileName();
      const params = {
        Bucket: this.bucketName,
        Key: folderName + (fileObject.name + "_" + datePart + "_" + timePart),
        Body: fileObject.data,
      };

      const data = await this.uploadToS3(params);
      const publicUrl = data.Location;
      const fileName = this.getonlyFileNameAfterUpload(publicUrl, folderName);
      return {
        isSuccess: true,
        data: { publicUrl, fileName },
      };
    } catch (error) {
      return {
        isSuccess: false,
        error: error,
      };
    }
  }
  uploadToS3(params) {
    return new Promise((resolve, reject) => {
      this.s3.upload(params, (err, data) => {
        if (err) {
          reject(err);
        } else {
          resolve(data);
        }
      });
    });
  }
  getDateandTimeforFileName() {
    const currentDateISOString = new Date().toISOString();
    const [datePart, timePart] = currentDateISOString.split("T");
    return {
      datePart,
      timePart,
    };
  }
  getonlyFileNameAfterUpload(publicUrl, folderName) {
    return publicUrl.split(folderName)[1];
  }
};
