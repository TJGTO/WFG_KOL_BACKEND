const AWS = require("aws-sdk");

module.exports = class AWSService {
  constructor(awsConfig, bucketName) {
    this.s3 = new AWS.S3(awsConfig);
    this.bucketName = bucketName;
  }
  async uploadFile(fileObject, folderName) {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: folderName + fileObject.name,
        Body: fileObject.data,
      };

      const data = await this.uploadToS3(params);
      const publicUrl = data.Location;
      return {
        isSuccess: true,
        data: { publicUrl },
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
};
