const { ObjectId } = require("mongodb");
const R = require("ramda");
const TwilioService = require("./twillioService");
const AWSService = require("./amazonService");
const { gameModel } = require("../models/Schema/game");
const { UsersModel } = require("../models/Schema/users");
const logger = require("../utils/loggerConfig");
const GoogleDriveService = require("./gooleDriveService");
const Userservice = require("./userService");
const EmailService = require("./emailService");
const { approvedSlotEmail } = require("../templates/emailtemp");
const formatDate = require("../utils/functions");
const ExcelJS = require("exceljs");

module.exports = class Gameservice {
  constructor() {
    this.gamesModel = gameModel;
    this.usersModel = UsersModel;
    this.logger = logger;
    this.googleDriveService = new GoogleDriveService();
    this.userService = new Userservice();
    this.awsService = new AWSService(
      {
        accessKeyId: process.env.accessKeyId,
        secretAccessKey: process.env.secretAccessKey,
      },
      process.env.bucketName
    );
    this.twilioService = new TwilioService(
      process.env.twilioaccountSid,
      process.env.twilioAuthtoken
    );
  }

  /**
   *Create a game
   * @param {*} data
   * @returns - returns a game
   */
  async createGame(data) {
    try {
      data.body.createdBy = data.user.id;
      const result = await this.gamesModel.create(data.body);
      this.logger.info(result);
      return result;
    } catch (error) {
      throw new Error("Wrong data");
    }
  }

  /**
   *Add or update a player in a previously created game
   * @param {*} data
   * @returns - returns a game with updated players list
   */

  async addUpdatePlayer(data) {
    try {
      const playersData = data.players.map((x) => {
        x.player_id = new ObjectId(x.player_id);
        return x;
      });
      const player = await this.gamesModel.findByIdAndUpdate(
        { _id: data.gameid },
        { $push: { players: { $each: playersData } } }
      );
      return player;
    } catch (error) {
      throw new Error("Failed to add or update players");
    }
  }

  /**
   *Remove a player from a previously created game
   * @param {*} data
   * @returns - returns a game with updated players list
   */

  async removePlayer(data) {
    try {
      const removePlayer = await this.gamesModel.updateOne(
        { _id: data.gameid },
        { $pull: { players: { player_id: { $in: data.playersId } } } }
      );
      return removePlayer;
    } catch (error) {
      throw new Error("Failed to remove player");
    }
  }

  /**
   *Get active matches available
   * @param {*} data
   * @returns - returns active matches list
   */

  async activeMatches() {
    try {
      const currentDate = new Date();
      currentDate.setHours(0, 0, 0, 0);
      const storedDate = new Date(currentDate - 48 * 3600 * 1000);
      const activeMatches = await this.gamesModel.aggregate([
        {
          $addFields: {
            convertedDate: {
              $dateFromString: { dateString: "$date", format: "%d/%m/%Y" },
            },
            gameId: "$_id",
          },
        },
        {
          $match: {
            convertedDate: {
              $gte: storedDate,
            },
          },
        },
        {
          $lookup: {
            from: "venues",
            localField: "venue",
            foreignField: "_id",
            as: "venueDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "Creator",
          },
        },
        {
          $project: {
            players: 0,
            createdAt: 0,
            updatedAt: 0,
            _id: 0,
            __v: 0,
            convertedDate: 0,
          },
        },
      ]);

      ///venueDetails will be an array , using ramda to make the array an object
      //before venueDetails : [{...}] after venueDetails:{} fnfmm

      const processedMatches = activeMatches.map((match) => {
        const venueDetails = R.pathOr({}, ["venueDetails", 0], match);
        const updatedVenueDetails = R.omit(["location"], venueDetails);
        const CreatorDetails = R.pathOr({}, ["Creator", 0], match);
        const UpdatedCreatorDetails = R.omit(
          ["DOB", "address", "roles", "__v", "salt"],
          CreatorDetails
        );
        return {
          ...match,
          venueDetails: updatedVenueDetails,
          creator: UpdatedCreatorDetails,
        };
      });

      return processedMatches;
    } catch (error) {
      console.log(error);
      throw new Error("Failed to fetch active matches");
    }
  }

  /**
   *Fetch a particular matche detail
   * @param {*} data
   * @returns - returns the requested match details
   */

  async matchDetails(req) {
    try {
      const match = await this.gamesModel.aggregate([
        {
          $match: {
            _id: new ObjectId(req.params.gameid),
          },
        },
        {
          $lookup: {
            from: "venues",
            localField: "venue",
            foreignField: "_id",
            as: "venueDetails",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "createdBy",
            foreignField: "_id",
            as: "creator",
          },
        },
        {
          $addFields: {
            gameId: "$_id",
          },
        },
        {
          $project: {
            _id: 0,
            createdAt: 0,
            updatedAt: 0,
            __v: 0,
            convertedDate: 0,
          },
        },
      ]);

      if (match.length === 0) {
        throw new Error("Game not found");
      }
      const processedMatches = match.map((match) => {
        const venueDetails = R.pathOr({}, ["venueDetails", 0], match);
        const CreatorDetails = R.pathOr({}, ["creator", 0], match);
        const UpdatedCreatorDetails = R.omit(
          ["DOB", "address", "roles", "__v", "salt"],
          CreatorDetails
        );
        return { ...match, venueDetails, creator: UpdatedCreatorDetails };
      });
      return processedMatches[0];
    } catch (error) {
      console.log(error.message);
      throw new Error("Failed to fetch game details");
    }
  }
  /**
   * Registers a user for a game.
   *
   * @param {Object} req The request object.
   * @returns {Promise<Object>} The registered player object.
   * @throws {Error} If the user is already registered, or if the user's date of birth or address is not provided.
   */
  async registerForAMatch(req) {
    try {
      const userDetails = await this.userService.userDetails(req);

      const query = {
        $and: [{ _id: req.body.gameid }, { "players.player_id": req.user.id }],
      };
      const checkIfAlreadyRegistered = await this.gamesModel.findOne(query);
      if (checkIfAlreadyRegistered) {
        return {
          success: false,
          message: "You have been already registered",
        };
      }
      if (!userDetails.DOB) {
        return {
          success: false,
          message: "Date of birth is necessary for registration",
        };
      }
      if (!userDetails.address) {
        return {
          success: false,
          message: "Address is necessary for registration",
        };
      }
      if (
        !userDetails.profilePictureURL &&
        req.body.matchType == "Tournament"
      ) {
        return {
          success: false,
          message: "Profile Picture is necessary for tournament registration",
        };
      }
      const response = await this.awsService.uploadFile(
        req.files.file,
        "paymentpictures/"
      );
      if (!response.isSuccess) {
        throw Error("Failed to upload the picture");
      }

      const playerObj = {};
      playerObj.player_id = new ObjectId(req.user.id);
      playerObj.paymentImageurl = [response.data.fileName];
      playerObj.profilepictureurl = userDetails.profilePictureURL;
      playerObj.phoneNumber = userDetails.phone_no;
      playerObj.name = userDetails.firstName + " " + userDetails.lastName;
      playerObj.position = req.body.position;
      playerObj.status = "Paid";
      playerObj.age = this.userService.calculateAge(userDetails.DOB);
      if (req.body.matchType && req.body.matchType == "Tournament") {
        playerObj.foodtype = req.body.foodtype;
        playerObj.player_type = req.body.player_type;
      }
      const player = await this.gamesModel.findByIdAndUpdate(
        { _id: new ObjectId(req.body.gameid) },
        { $push: { players: playerObj } }
      );

      return {
        success: true,
        message: "Registration is successfull",
        data: player,
      };
    } catch (error) {
      throw new Error("Failed to register");
    }
  }
  /**
   * Registers new players in a game.
   *
   * @param {object} data The request body containing the game ID and player data.
   * @returns {object} A success or error message.
   */
  async registerInGroup(data) {
    try {
      const game = await this.gamesModel.findById(data.body.gameid);
      const playerIds = [];
      let count = 0;
      for (let i = 0; i <= game.players.length - 1; i++) {
        playerIds.push(game.players[i].player_id.toString());
      }

      data.body.players.forEach((x) => {
        if (!playerIds.includes(x._id)) {
          x.player_id = x._id;
          x.age = this.userService.calculateAge(x.DOB);
          game.players.push(x);
          count++;
        }
      });
      if (count == 0) {
        return {
          success: false,
          message: "There is no new player to be added",
        };
      }
      await game.save();
      return {
        success: true,
        message: "Success",
      };
    } catch (error) {
      throw new Error("Unable to register in group");
    }
  }
  /**
   * Updates the payment snap after it has been added by the admin.
   *
   * @param {object} data The request data.
   * @param {string} data.body.gameid The game ID.
   * @param {string} data.body.player_id The player ID.
   * @param {string} data.body.position The position of the player.
   * @param {object} data.files.file The payment picture file.
   *
   * @returns {object} The response object.
   */
  async updatePaymentsSnapAfterAddedByAdmin(data) {
    try {
      const { gameid, player_id, position, matchType, foodtype, player_type } =
        data.body;
      const game = await this.gamesModel.findById(gameid);

      if (!game) {
        return {
          success: false,
          message: "Not able to find the Game",
        };
      }

      const playerIndex = game.players.findIndex(
        (x) => x.player_id == player_id
      );
      if (playerIndex < 0) {
        return {
          success: false,
          message: "Not able to find the Player in the game",
        };
      }

      const response = await this.awsService.uploadFile(
        data.files.file,
        "paymentpictures/"
      );
      if (!response.isSuccess) {
        return {
          success: false,
          message: "Not able to upload the payment picture",
        };
      }
      game.players[playerIndex].position = position;
      game.players[playerIndex].status = "Paid";
      game.players[playerIndex].paymentImageurl = [
        response.data.fileName,
        ...game.players[playerIndex].paymentImageurl,
      ];
      if (matchType && matchType == "Tournament") {
        game.players[playerIndex].foodtype = foodtype;
        game.players[playerIndex].player_type = player_type;
      }
      await game.save();
      return {
        success: true,
        message: "Updated successfully",
      };
    } catch (error) {
      throw new Error("Failed to upload");
    }
  }
  /**
   * Updates a game's details.
   *
   * @param {object} data The request body containing the game's details.
   * @returns {string} A success message.
   */
  async updateGame(data) {
    try {
      const updateDetails = await this.gamesModel.findOneAndUpdate(
        { _id: data.body.gameid },
        data.body
      );
      return "details updated";
    } catch (error) {
      throw new Error("Failed to update game");
    }
  }

  /**
   *Update player status
   * @param {*} data request body
   * @returns - return updates status
   */
  async updatePlayerInGameStatus(data) {
    try {
      const query = {
        $and: [
          { _id: data.body.gameId },
          { "players.player_id": data.body.playerId },
        ],
      };
      const update = {
        $set: {
          "players.$.status": data.body.status,
        },
      };
      const gameDetails = await this.matchDetails({
        params: { gameid: data.body.gameId },
      });
      const playerStatus = await this.gamesModel.findOneAndUpdate(
        query,
        update
      );
      let message = "";
      switch (data.body.status) {
        case "Approved":
          message = `The game moderator has approved your slot of ${gameDetails.venueDetails.fieldName}`;
          break;
        case "Rejected":
          message = `The game moderator has approved your slot ${gameDetails.venueDetails.fieldName}`;
          break;
        case "Removed":
          message = `The game moderator has removed you from the game of ${gameDetails.venueDetails.fieldName}`;
          break;
        default:
          message = `In Game status has been changed by moderator of ${gameDetails.venueDetails.fieldName}`;
      }
      // this.twilioService.sendMessage(
      //   "+14155238886",
      //   data.body.phoneNo,
      //   message
      // );
      if (
        gameDetails.matchType == "Tournament" &&
        data.body.status == "Approved"
      ) {
        this.sendEmailtoUser(
          data.body.playerId,
          "CarnageCup 1.0",
          gameDetails.date
        );
      }

      return playerStatus;
    } catch (error) {
      throw new Error("Failed to update in game player status");
    }
  }
  /**
   *Update Teams name for each player
   * @param {*} data request body
   * @returns - if success return operation status
   */
  async updateTeamsDetais(data) {
    const { gameId, teams, number_of_teams } = data.body;
    const game = await this.gamesModel.findById(gameId);

    if (!game) {
      throw new Error("Game not found");
    }
    try {
      teams.forEach(async (team) => {
        const { player_id, team: newTeam } = team;

        // Find the player in the game's players array
        const playerIndex = game.players.findIndex(
          (player) => player.player_id.toString() === player_id
        );

        if (playerIndex !== -1) {
          // Update the team for the player
          game.players[playerIndex].team = newTeam;
        }
      });
      game.number_of_teams = number_of_teams;
      const updatedGame = await game.save();

      return "Update SUccessfull";
    } catch (error) {
      throw new Error("Failed to update Teams Details");
    }
  }

  /**
   *check and send permission matrix to frontend
   * @param {*} data request body
   * @returns - if success return operation matrix
   */
  async checkGamePermission(data) {
    try {
      let permissionMatrix = {
        editSetting: false,
        approveOrReject: false,
        editTeam: false,
        excelDownload: false,
      };
      const setAllToTrue = R.map(R.T);
      const matchDetails = await this.matchDetails(data);
      const creatorId = new ObjectId(data.user.id);
      let response;
      if (creatorId.equals(matchDetails.createdBy)) {
        response = setAllToTrue(permissionMatrix);
      } else {
        response = JSON.parse(JSON.stringify(permissionMatrix));
      }
      const index = matchDetails.players.findIndex(
        (x) => x.player_id == data.user.id
      );
      if (index >= 0) {
        response.player_id = data.user.id;
      }

      return response;
    } catch (error) {
      throw new Error("Failed to get permission Matrix");
    }
  }
  /**
   * Creates an SMTP configuration object for sending emails.
   *
   * @returns {{host: string, port: number, secure: boolean, auth: {user: string, pass: string}}} An SMTP configuration object.
   */
  createSmtpConfigforEmail() {
    const envpassword = process.env.adminEmailPassword;
    const modifiedPass = envpassword.split("_").join(" ");
    return {
      host: "smtp.gmail.com",
      port: 587,
      secure: false, // Use `true` for port 465, `false` for all other ports
      auth: {
        user: process.env.adminEmailId,
        pass: modifiedPass,
      },
    };
  }
  /**
   * Sends an email to the user with the specified user ID, match name, and date.
   *
   * @param {string} userId The ID of the user to send the email to.
   * @param {string} matchname The name of the match.
   * @param {string} date The date of the match.
   */
  async sendEmailtoUser(userId, matchname, date) {
    if (userId) {
      let userDetails = await this.usersModel.findById(userId);
      if (userDetails.email) {
        let smtpConfig = this.createSmtpConfigforEmail();
        const emailService = new EmailService(smtpConfig);
        const emailOptions = {
          from: process.env.adminEmailId,
          to: userDetails.email,
          subject: approvedSlotEmail.subject.replace(
            "{{matchName}}",
            matchname
          ),
          text: "",
          html: approvedSlotEmail.html
            .replace("{{firstName}}", userDetails.firstName)
            .replace("{{date}}", date),
        };
        try {
          await emailService.sendEmail(emailOptions);
        } catch (error) {
          console.log(error);
          this.logger.info(error);
        }
      }
    }
  }

  /**
   * This function exports player details from a database to Excel files.
   *
   * @param {Object} data The request data containing the game ID.
   * @returns {Object} An object containing the file paths of the generated Excel files.
   */
  async exportplayersDetails(data) {
    try {
      const playersData = await this.gamesModel.findById(data.params.gameid);
      const workbook = new ExcelJS.Workbook();

      const keeperSheet = workbook.addWorksheet("Keepers");
      const defenderSheet = workbook.addWorksheet("Defenders");
      const midfielderSheet = workbook.addWorksheet("Midfielders");
      const attackerSheet = workbook.addWorksheet("Attackers");

      const headers = [
        "Name",
        "Position",
        "Age",
        "Status",
        "Food_type",
        "Player_type",
        "Profile_picture",
        "Payment_Image",
      ];

      keeperSheet.addRow(headers);
      defenderSheet.addRow(headers);
      midfielderSheet.addRow(headers);
      attackerSheet.addRow(headers);

      playersData.players.forEach((player) => {
        const {
          name,
          position,
          age,
          status,
          foodtype,
          player_type,
          profilepictureurl,
          paymentImageurl,
        } = player;
        if (player.status != "Approved") {
          return;
        }
        const row = [
          name,
          position,
          age,
          status,
          foodtype,
          player_type,
          `https://wfgimagebucket.s3.amazonaws.com/profilepictures/${profilepictureurl}`,
          `https://wfgimagebucket.s3.amazonaws.com/paymentpictures/${
            paymentImageurl[paymentImageurl.length - 1]
          }`,
        ];
        switch (player.position.toLowerCase()) {
          case "keeper":
            keeperSheet.addRow(row);
            break;
          case "defence":
            defenderSheet.addRow(row);
            break;
          case "midfield":
            midfielderSheet.addRow(row);
            break;
          case "attack":
            attackerSheet.addRow(row);
            break;
          default:
            break;
        }
      });
      const highlightStyleforOwners = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FF0000" },
      };
      const highlightStyleforHeaders = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: "FFFF00" },
      };
      const colortherows = (worksheet) => {
        worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
          if (rowNumber == 1) {
            row.eachCell({ includeEmpty: true }, (cell) => {
              cell.fill = highlightStyleforHeaders;
            });
          }
          if (rowNumber > 1) {
            const rowData = row.values;

            if (
              rowData[6] == "Regular Owner" ||
              rowData[6] == "Non-Regular Owner"
            ) {
              row.eachCell({ includeEmpty: true }, (cell) => {
                cell.fill = highlightStyleforOwners;
              });
            }
          }
        });
      };
      [attackerSheet, keeperSheet, midfielderSheet, defenderSheet].forEach(
        (worksheet) => {
          worksheet.eachRow((row) => {
            row.eachCell((cell) => {
              cell.border = {
                top: { style: "thin" },
                left: { style: "thin" },
                bottom: { style: "thin" },
                right: { style: "thin" },
              };
            });
          });
        }
      );
      colortherows(attackerSheet);
      colortherows(keeperSheet);
      colortherows(midfielderSheet);
      colortherows(defenderSheet);
      const buffer = await workbook.xlsx.writeBuffer();
      return buffer;
    } catch (error) {
      this.logger.info(error);
      throw new Error("Failed to create the excel");
    }
  }
};
