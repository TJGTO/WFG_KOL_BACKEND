const { ObjectId } = require("mongodb");
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
