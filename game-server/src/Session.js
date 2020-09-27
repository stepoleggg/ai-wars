import Player from './games/Player.js';

const frameDelay = 40;

class Session {
  constructor(numberGames, playerAddresses, gameType, Game, send) {
    this.frameDelay = frameDelay;
    this.numberGames = numberGames;
    this.playerAddresses = playerAddresses;
    this.Game = Game;
    this.send = send;
  }

  setFrameDelay(fd) {
    this.frameDelay = fd;
    this.game.setFrameDelay(fd);
  }

  sendGameInfo() {
    this.send(JSON.stringify({
      type: 'gameInfo',
      playedNumberGames: this.playedNumberGames,
      numberGames: this.numberGames,
    }));
  }

  sendWinnerInfo() {
    this.send(JSON.stringify({
      type: 'winnerInfo',
      wins: this.wins,
    }));
  }

  sendState(message) {
    this.send(message);
    this.sendGameInfo();
    this.sendWinnerInfo();
  }

  stop() {
    this.game.stop();
  }

  async start() {
    let players = [];
    this.playedNumberGames = 0;
    this.wins = [];
    for (let address of this.playerAddresses) {
      this.wins.push(0);
      players.push(await Player.create(address));
    }
    while (this.playedNumberGames < this.numberGames) {
      this.sendGameInfo();
      this.game = new this.Game(this.send, [
        await Player.create('localhost:8666'),
        await Player.create('localhost:8666'),
      ], this.frameDelay);
      const winnerId = await this.game.start();
      if (winnerId !== undefined) {
        if (winnerId !== null) {
          this.wins[winnerId] += 1;
        }
        this.playedNumberGames += 1;
      }
      this.sendGameInfo();
      this.sendWinnerInfo();
      if (winnerId === undefined) {
        return;
      }
    }
  }
}

export default Session;