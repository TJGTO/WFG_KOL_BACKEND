var jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const moment = require("moment");
const R = require("ramda");
const formatDate = require("../utils/functions");
// const CsvParser = require("json2csv").Parser;
const Exceljs = require("exceljs");
const { UsersModel } = require("../models/Schema/users");
const logger = require("../utils/loggerConfig");
const AWSService = require("./amazonService");
const GoogleDriveService = require("./gooleDriveService");
const { ObjectId } = require("mongodb");

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
      let userid = "";
      let cansaveProfilePicture = false;
      if (data.params.userid) {
        userid = data.params.userid;
        if (data.params.userid == data.user.id) {
          cansaveProfilePicture = true;
        }
      } else {
        cansaveProfilePicture = true;
        userid = data.user.id;
      }
      //const user = await this.userModel.findById({ _id: userid });
      let user = await this.userModel.aggregate([
        {
          $match: {
            _id: new ObjectId(userid),
          },
        },
        {
          $lookup: {
            from: "membershiprecords",
            localField: "_id",
            foreignField: "userId",
            as: "membershipDetails",
          },
        },
        {
          $project: {
            password: 0,
            salt: 0,
            "membershipDetails._id": 0,
            "membershipDetails.__v": 0,
            "membershipDetails.createdAt": 0,
            "membershipDetails.updatedAt": 0,
            "membershipDetails.profilePictureURL": 0,
            __v: 0,
          },
        },
      ]);
      if (!user || user.length == 0) {
        throw Error("User profile not found");
      }
      const userObj = JSON.parse(JSON.stringify(user[0]));
      userObj.cansaveProfilePicture = cansaveProfilePicture;
      let currentDate = new Date();
      if (
        userObj.membershipDetails.length > 0 &&
        currentDate.getTime() <
          new Date(userObj.membershipDetails[0].validto).getTime()
      ) {
        userObj.activemembership = true;
      } else {
        userObj.activemembership = false;
      }
      userObj.membershipDetails.forEach((x) => {
        x.validto = formatDate(x.validto, "DD MMM YYYY");
        x.validfrom = formatDate(x.validfrom, "DD MMM YYYY");
      });
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
   * Searches for users by their name.
   *
   * @param {Object} data The search criteria.
   * @param {string} data.userName The name of the user to search for.
   * @returns {Promise<Array<Object>>} An array of users that match the search criteria.
   */
  async searchUserByName(data) {
    try {
      let searchResults = await this.userModel.aggregate([
        {
          $project: {
            _id: 1,
            name: { $concat: ["$firstName", " ", "$lastName"] },
            firstName: 1,
            lastName: 1,
            profilepictureurl: "$profilePictureURL",
            phoneNumber: "$phone_no",
            DOB: 1,
            address: 1,
          },
        },
        {
          $match: {
            name: { $regex: data.userName, $options: "i" },
            DOB: { $exists: true },
            address: { $exists: true },
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
  /**
   * Updates the password of a user.
   *
   * @param {object} data The request body containing the user's email and new password.
   * @returns {object} A response object indicating the success or failure of the operation.
   */
  async changePassword(data) {
    try {
      const user = await this.userModel.find({ email: data.body.email });
      if (!user || user.length == 0) {
        return {
          success: false,
          message: "User not found with this email",
        };
      }
      const response = await bcrypt
        .compare(data.body.oldpassword, user[0].password)
        .then((res) => true)
        .catch((err) => false);

      if (!response) {
        return {
          success: false,
          message: "Your entered the old password wrong",
        };
      }

      const hashsalt = bcrypt.genSaltSync(10);
      const hashedPassword = bcrypt.hashSync(data.body.newpassword, hashsalt);

      const result = await this.userModel.findOneAndUpdate(
        { email: data.body.email },
        {
          salt: hashsalt,
          password: hashedPassword,
        },
        {
          new: true,
        }
      );
      return {
        success: true,
        message: "Password Updated Successfully",
      };
    } catch (error) {
      throw new Error("Failed to update the password");
    }
  }
  async permissionsForProfile(data) {
    try {
      let permissionMatrix = {
        editProfile: false,
      };
      const setAllToTrue = R.map(R.T);
      if (data.user.id == data.params.userid) {
        const response = setAllToTrue(permissionMatrix);
        return response;
      } else {
        return permissionMatrix;
      }
    } catch (error) {
      console.log(error);
      throw new Error("Failed to get permission Matrix");
    }
  }
  async exportUser() {
    try {
      const usersWithDOB = [];
      const usersWithoutDOB = [];
      const usersData = await this.userModel.find({});
      usersData.forEach((user) => {
        const { firstName, lastName, phone_no, email, DOB } = user;
        if (DOB) {
          usersWithDOB.push({ firstName, lastName, phone_no, email, DOB });
        } else {
          usersWithoutDOB.push({ firstName, lastName, phone_no, email });
        }
      });

      const workBook = new Exceljs.Workbook();

      const workSheetWithDOB = workBook.addWorksheet("Users with DOB");
      const workSheetWithoutDOB = workBook.addWorksheet("Users without DOB");

      const headersWithDOB = [
        "First Name",
        "Last Name",
        "Phone Number",
        "Email",
        "DOB",
      ];

      const headersWithoutDOB = [
        "First Name",
        "Last Name",
        "Phone Number",
        "Email",
      ];

      workSheetWithDOB.addRow(headersWithDOB);
      workSheetWithoutDOB.addRow(headersWithoutDOB);

      usersWithDOB.forEach((user) =>
        workSheetWithDOB.addRow(Object.values(user))
      );
      usersWithoutDOB.forEach((user) =>
        workSheetWithoutDOB.addRow(Object.values(user))
      );

      const filePathWithDOB = "users_with_DOB";
      const filePathWithoutDOB = "users_without_DOB";

      await workBook.xlsx.writeFile(filePathWithDOB);
      await workBook.xlsx.writeFile(filePathWithoutDOB);

      return { filePathWithDOB, filePathWithoutDOB };
    } catch (error) {
      this.logger.info(error);
      throw new Error("Unable to export users details");
    }
  }
  /*
  db.users.updateMany({email:"tathagata5121@gmail.com"}, {
  $push: {
    badges: {
      title: "old Badge",
      level: 3,
      priority: 1,
    },
  },
})
  */
  // db.games.updateMany({_id: ObjectId("669b72fd7d8cdb2be0102bc2")}, {
  //   $push: {
  //     otherFormFields: {
  //       $each : [
  //         {
  //           name : "Position",
  //           type : "Dropdown",
  //           required: true,
  //           values : ["Gk","Defence","Midfield","Attack"]
  //         },
  //         {
  //           name : "Status",
  //           type : "Dropdown",
  //           required: true,
  //           values : ["Member","Non-member","Outsider","Residential"]
  //         },
  //         {
  //           name : "Team",
  //           type : "Dropdown",
  //           required: true,
  //           values : [
  // "BFA",
  // "Techie Tacklers",
  // "Morning legends",
  // "La Kolbicelestes",
  // "Newtown Fc",
  // "Fiiob Junos",
  // "Skyking Fc",
  // "Techie Tackler blues",
  // "Bengal Scousers",
  // "Legacy Fc",
  // "FIIOB",
  // "New Town Soccer Club",
  // "Legend Fc",
  // "CLFC",
  // "Underdogs",
  // "DUFC Jovenes",
  // "86/1",
  // "Airfeet Fc",
  // "WFG team 1",
  // "Morning legends Yellow"
  //           ]
  //         }
  //       ]

  //     },
  //   },
  // })
};
