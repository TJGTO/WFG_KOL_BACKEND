var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { UsersModel } = require("../models/Schema/users");
const logger = require("../utils/loggerConfig");
const GoogleDriveService = require("./gooleDriveService");

module.exports = class Userservice {
  constructor() {
    this.userModel = UsersModel;
    this.logger = logger;
    this.googleDriveService = new GoogleDriveService();
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
    };
    if (response) {
      const token = await jwt.sign(payload, process.env.Secret);
      return {
        token: token,
        email: UserDetails.email,
        fullname: UserDetails.firstName + " " + UserDetails.lastName,
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
      const response = await this.googleDriveService.uploadFile(
        data.files.file,
        "profilepicture"
      );
      if (!response.isSuccess) {
        throw Error("Failed to update the Profile Picture");
      }

      await this.userModel.findOneAndUpdate(
        { _id: data.user.id },
        {
          profilePictureURL: `https://drive.google.com/uc?export=view&id=${response.data.id}`,
        }
      );

      return true;
    } catch (error) {
      throw new Error("Failed to fetch user profile details");
    }
  }
};
