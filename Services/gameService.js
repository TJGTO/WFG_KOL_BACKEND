const { gameModel } = require("../models/Schema/game");
const { UsersModel } = require("../models/Schema/users");
const logger = require("../utils/loggerConfig");

module.exports = class Gameservice {
  constructor() {
    this.gamesModel = gameModel;
    this.usersModel = UsersModel;
    this.logger = logger;
  }

  async createGame(data) {
    try {
      const result = await this.gamesModel.create(data);
      this.logger.info(result);
      return result;
    } catch (error) {
      throw new Error("Wrong data");
    }
  }

  async addUpdatePlayer(data) {
    try {
      const player = await this.gamesModel.findByIdAndUpdate(
        { _id: data.gameid },
        { $push: { players: { $each: data.players } } }
      );
      return player;
    } catch (error) {
      throw new Error("Failed to add or update players");
    }
  }

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
};
