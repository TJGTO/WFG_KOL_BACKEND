const AWS = require("aws-sdk");

module.exports = class AWSService {
  constructor(awsConfig, bucketName) {
    this.s3 = new AWS.S3(awsConfig);
    this.bucketName = bucketName;
  }
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
