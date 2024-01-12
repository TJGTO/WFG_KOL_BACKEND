const { ObjectId } = require("mongodb");
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
  }

  /**
   *Create a game
   * @param {*} data
   * @returns - returns a game
   */
  async createGame(data) {
    try {
      const result = await this.gamesModel.create(data);
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
      return activeMatches;
    } catch (error) {
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
      const match = await this.gamesModel.findById({ _id: req.params.gameid });
      const gameId = match._id;
      delete match._id;
      match.gameId = gameId;
      return match;
    } catch (error) {
      throw new Error("Failed to fetch game details");
    }
  }

  async registerForAMatch(req) {
    try {
      const userDetails = await this.userService.userDetails(req);
      const response = await this.googleDriveService.uploadFile(
        req.files.file,
        "gamePayment"
      );
      if (!response.isSuccess) {
        throw Error("Failed to upload the picture");
      }

      const playerObj = {};
      playerObj.player_id = new ObjectId(req.user.id);
      playerObj.paymentImageurl = `https://drive.google.com/uc?export=view&id=${response.data.id}`;
      playerObj.profilepictureurl = userDetails.profilePictureURL;
      playerObj.phoneNumber = userDetails.phone_no;
      playerObj.name = userDetails.firstName + " " + userDetails.lastName;
      playerObj.position = req.body.position;
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
};
