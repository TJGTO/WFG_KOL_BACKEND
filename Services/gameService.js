const { ObjectId } = require("mongodb");
const R = require("ramda");
const TwilioService = require("./twillioService");
const AWSService = require("./amazonService");
const { gameModel } = require("../models/Schema/game");
const { UsersModel } = require("../models/Schema/users");
const logger = require("../utils/loggerConfig");
const GoogleDriveService = require("./gooleDriveService");
const Userservice = require("./userService");

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
            as: "Creator",
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
        const CreatorDetails = R.pathOr({}, ["Creator", 0], match);
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

  async registerForAMatch(req) {
    const userDetails = await this.userService.userDetails(req);

    const query = {
      $and: [{ _id: req.body.gameid }, { "players.player_id": req.user.id }],
    };
    const checkIfAlreadyRegistered = await this.gamesModel.findOne(query);
    if (checkIfAlreadyRegistered) {
      throw new Error("You have been already registered");
    }
    if (!userDetails.DOB || !userDetails.address) {
      throw new Error(
        "Date of birth and address is necessary for game registration"
      );
    }
    try {
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
      const player = await this.gamesModel.findByIdAndUpdate(
        { _id: new ObjectId(req.body.gameid) },
        { $push: { players: playerObj } }
      );

      return player;
    } catch (error) {
      throw new Error("Failed to register");
    }
  }

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
      this.twilioService.sendMessage(
        "+14155238886",
        data.body.phoneNo,
        message
      );
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
      };
      const setAllToTrue = R.map(R.T);
      const matchDetails = await this.matchDetails(data);
      const creatorId = new ObjectId(data.user.id);
      if (creatorId.equals(matchDetails.createdBy)) {
        const response = setAllToTrue(permissionMatrix);
        return response;
      } else {
        return permissionMatrix;
      }
    } catch (error) {
      throw new Error("Failed to get permission Matrix");
    }
  }
};
