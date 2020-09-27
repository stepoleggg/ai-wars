import WebSocket from 'websocket';

class Player {
  constructor(connection) {
    this.connection = connection;
    this.connection.on('message', message => {
      const obj = JSON.parse(message.utf8Data);
      if (this.waittingActions.has(obj.actionId)) {
        const resolve = this.waittingActions.get(obj.actionId);
        this.waittingActions.delete(obj.actionId);
        resolve(obj);
      }
      // console.log(`TIME: ${new Date() - this.now}`);
    });
    this.waittingActions = new Map();
    this.now = new Date();
  }

  static async connect(aiAddress) {
    const wsClient = new WebSocket.client();
    wsClient.connect(`ws://${aiAddress}/`);
    return new Promise(resolveConnection => {
      wsClient.on('connect', connection => {
        resolveConnection(connection);
      });
    });
  }

  static async create(aiAddress) {
    const connection = await Player.connect(aiAddress);
    const player = new Player(connection);
    return player;
  }

  async decide(environment, actionId, actionsNumber) {
    this.now = new Date();
    this.connection.sendUTF(JSON.stringify({
      environment,
      actionId,
      actionsNumber,
      playerId: this.id,
    }));
    return new Promise(resolve => {
      this.waittingActions.set(actionId, resolve);
    });
  }

  win() {
    this.connection.sendUTF(JSON.stringify({
      won: true,
      playerId: this.id,
    }));
  }

  defeat() {
    this.connection.sendUTF(JSON.stringify({
      won: false,
      playerId: this.id,
    }));
  }
}

export default Player;