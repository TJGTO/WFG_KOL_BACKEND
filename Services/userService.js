var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const { UsersModel } = require("../models/Schema/users");
const logger = require("../utils/loggerConfig");
const AWSService = require("./amazonService");
const GoogleDriveService = require("./gooleDriveService");

module.exports = class Userservice {
  constructor() {
    this.userModel = UsersModel;
    this.logger = logger;
    this.googleDriveService = new GoogleDriveService();
    this.awsService = new AWSService(
      {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
      },
      process.env.bucketName
    );
  }
  /**
   *create a user
   * @param {*} data - it has registration details of user
   * @returns - it returns a user after registartion
   */
  async createUser(data) {
    try {
      const hashsalt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(data.password, hashsalt);
      data.salt = hashsalt;
      data.password = hashedPassword;
      const result = await this.userModel.create(data);
      this.logger.info(result);
      return result;
    } catch (err) {
      if (err.code == 11000) {
        throw new Error("User already exists, please log in");
      }
      throw new Error("Wrong data");
    }
  }

  /**
   *login a user
   * @param {*} data - it has login credentials of user
   * @returns - it returns token, email and full name
   */

  async loginuser(data) {
    const UserDetails = await this.userModel.findOne({ email: data.email });
    if (!UserDetails) {
      throw Error("User not found,Please register first");
    }
    const response = await bcrypt
      .compare(data.password, UserDetails.password)
      .then((res) => res)
      .catch((err) => false);

    const payload = {
      id: UserDetails.id,
      email: UserDetails.email,
      roles: UserDetails.roles,
    };
    if (response) {
      const token = await jwt.sign(payload, process.env.Secret);
      return {
        token: token,
        email: UserDetails.email,
        fullname: UserDetails.firstName + " " + UserDetails.lastName,
        roles: UserDetails.roles,
        profilePictureUrl: UserDetails.profilePictureURL
          ? UserDetails.profilePictureURL
          : null,
      };
    } else {
      throw Error("Password doesn't match");
    }
  }

  /**
   *update a user
   * @param {*} data
   * @returns - After update operation it returns user object
   */
  async updateuser(data) {
    try {
      const availableUser = await this.userModel.findOneAndUpdate(
        { _id: data.user.id },
        data.body
      );
      return "update is successful";
    } catch (error) {
      throw new Error("failed to update user");
    }
  }

  /**
   *Get a user details
   * @param {*} data
   * @returns - returns a particular user profile details
   */
  async userDetails(data) {
    try {
      const user = await this.userModel.findById({ _id: data.user.id });
      if (!user) {
        throw Error("User profile not found");
      }
      const userObj = JSON.parse(JSON.stringify(user));
      delete userObj.password;
      delete userObj.salt;
      return userObj;
    } catch (error) {
      throw new Error("Failed to fetch user profile details");
    }
  }

  /**
   *update user Profile picture
   * @param {*} data
   * @returns - upload it one google drive and save image URL into DB
   */
  async updateProfilePicture(data) {
    try {
      //get the user data details first
      const userDetails = await this.userDetails(data);
      //upload the file in drive
      let fileObject = data.files.file;

      fileObject.name = userDetails.firstName + "_" + userDetails.lastName;
      const response = await this.awsService.uploadFile(
        fileObject,
        process.env.profilePictureFolderName
      );
      if (!response.isSuccess) {
        throw Error("Failed to update the Profile Picture");
      }
      //get the current profile picture Url
      const profileUrl = userDetails.profilePictureURL
        ? userDetails.profilePictureURL
        : "";
      //update the recently uploaded file link in db
      await this.userModel.findOneAndUpdate(
        { _id: data.user.id },
        {
          profilePictureURL: response.data.fileName,
        }
      );
      //if old profile picture was there then get the id and delete it from drive
      // if (profileUrl) {
      //   let fileId = profileUrl.split("=")[2];
      //   await this.googleDriveService.deleteFile(fileId);
      // }

      return true;
    } catch (error) {
      throw new Error("Failed to update the Profile Picture");
    }
  }
  /**
   *Seach users by username , searching done on fullname , and not case sensitive
   * @param {*} data
   * @returns - search results
   */
  async searchUserByName(data) {
    try {
      let searchResults = await this.userModel.aggregate([
        {
          $project: {
            fullName: { $concat: ["$firstName", " ", "$lastName"] },
            firstName: 1,
            lastName: 1,
            profilePictureURL: 1,
            phone_no: 1,
          },
        },
        {
          $match: {
            fullName: { $regex: data.userName, $options: "i" },
          },
        },
      ]);
      return searchResults;
    } catch (error) {
      throw new Error("Failed to fetch the users");
    }
  }

  calculateAge(dateOfBirth) {
    const dob = moment(dateOfBirth, "YYYY-MM-DD");
    const currentDate = moment();
    const age = currentDate.diff(dob, "years");
    return age;
  }
};
