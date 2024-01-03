const {gameModel} = require('../models/Schema/game');
const logger = require("../utils/loggerConfig");

module.exports = class Gameservice {
    constructor() {
        this.gamesModel = gameModel;
        this.logger = logger;
    }

    async createGame(data) {
        try {
            const result = await this.gamesModel.create(data);
            this.logger.info(result);
            return result;
        } catch (error) {
            throw new Error('Wrong data')
        }
    }

    async addUpdatePlayer(data){
        try {
            const player = await this.gamesModel.findByIdAndUpdate(
                { _id: data.gameid },
                { $push: { players: { $each: data.players } } }
              );
              return player;
        } catch (error) {
            throw new Error('Failed to add or update players')
        }
    }

    ///


}