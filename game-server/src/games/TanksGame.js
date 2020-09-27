import { getRandomColor } from "../Utils";

const tankSize = 50;
const tankSpeed = 5;
const bulletSpeed = 10;
const bulletSize = 10;
const maxActions = 1000;

const tankActions = [
  (tank) => {
    tank.axis = true;
    tank.direction = true;
    tank.x += tankSpeed;
  },
  (tank) => {
    tank.axis = true;
    tank.direction = false;
    tank.x -= tankSpeed;
  },
  (tank) => {
    tank.axis = false;
    tank.direction = true;
    tank.y += tankSpeed;
  },
  (tank) => {
    tank.axis = false;
    tank.direction = false;
    tank.y -= tankSpeed;
  },
  (tank, world) => {
    if (tank.power == 100) {
      const bullet = new Bullet(tank);
      world.bullets.push(bullet);
      tank.power = 0;
    }
  }
];

const getSides = (obj, width, height) => {
  return {
    x1: obj.x - width / 2,
    x2: obj.x + width / 2,
    y1: obj.y - height / 2,
    y2: obj.y + height / 2,
  };
};

const checkRectRectCollision = (sides1, sides2) => {
  const x2Casting = (sides1.x2 > sides2.x1 && sides1.x2 <= sides2.x2);
  const x1Casting = (sides1.x1 >= sides2.x1 && sides1.x1 < sides2.x2);
  const y2Casting = (sides1.y2 > sides2.y1 && sides1.y2 <= sides2.y2);
  const y1Casting = (sides1.y1 >= sides2.y1 && sides1.y1 < sides2.y2);
  const xCasting = x2Casting || x1Casting;
  const yCasting = y2Casting || y1Casting;
  if (xCasting && yCasting) {
    const dx1 = sides2.x1 - sides1.x2;
    const dx2 = sides2.x2 - sides1.x1;
    const dy1 = sides2.y1 - sides1.y2;
    const dy2 = sides2.y2 - sides1.y1;
    const ds = [dx1, dx2, dy1, dy2];
    let minDIdx = 0;
    for (let dIdx in ds) {
      if (Math.abs(ds[dIdx]) < Math.abs(ds[minDIdx])) {
        minDIdx = dIdx;
      }
    }
    if (minDIdx < 2) {
      return {
        dx: ds[minDIdx],
        dy: 0,
      };
    } else {
      return {
        dx: 0,
        dy: ds[minDIdx],
      };
    }
  }
  return {
    dx: 0,
    dy: 0,
  }
};

const checkTankWallCollision = (tank, wall) => {
  const tankSides = getSides(tank, tankSize, tankSize);
  const wallSides = getSides(wall, wall.width, wall.height);
  const dxdy = checkRectRectCollision(tankSides, wallSides);
  tank.x += dxdy.dx;
  tank.y += dxdy.dy;
};

const checkTankTankCollision = (tank1, tank2) => {
  const tankSides1 = getSides(tank1, tankSize, tankSize);
  const tankSides2 = getSides(tank2, tankSize, tankSize);
  const dxdy = checkRectRectCollision(tankSides1, tankSides2);
  tank1.x += dxdy.dx / 2;
  tank2.x -= dxdy.dx / 2;
  tank1.y += dxdy.dy / 2;
  tank2.y -= dxdy.dy / 2;
};

const checkBulletWallCollision = (bullet, wall) => {
  const bulletSides = getSides(bullet, bulletSize, bulletSize);
  const wallSides = getSides(wall, wall.width, wall.height);
  const dxdy = checkRectRectCollision(bulletSides, wallSides);
  if (dxdy.dx !== 0 || dxdy.dy !== 0) {
    return true;
  }
  return false;
};

const checkBulletTankCollision = (bullet, tank) => {
  const bulletSides = getSides(bullet, bulletSize, bulletSize);
  const tankSides = getSides(tank, tankSize, tankSize);
  const dxdy = checkRectRectCollision(bulletSides, tankSides);
  if (dxdy.dx !== 0 || dxdy.dy !== 0) {
    return true;
  }
  return false;
};

class Bullet {
  constructor(tank) {
    this.owner = tank;
    this.x = tank.x;
    this.y = tank.y;
    this.axis = tank.axis;
    this.direction = tank.direction;
  }

  live() {
    if (this.axis) {
      if (this.direction) {
        this.x += bulletSpeed;
      } else {
        this.x -= bulletSpeed;
      }
    } else {
      if (this.direction) {
        this.y += bulletSpeed;
      } else {
        this.y -= bulletSpeed;
      }
    }
  }
}

class Tank {
  constructor(x, y, axis, direction, color) {
    this.health = 100;
    this.power = 100;
    this.x = x;
    this.y = y;
    this.color = getRandomColor();
    if (color !== undefined) {
      this.color = color;
    }
    this.axis =axis;
    this.direction = direction;
  }

  do(actions, world) {
    let moved = false;
    let shoot = false;
    for (let action of actions) {
      if (tankActions[action] !== undefined) {
        if (action < 4 && !moved) {
          tankActions[action](this, world);
          moved = true;
        }
        if (action === 4 && !shoot) {
          tankActions[action](this, world);
          shoot = true;
        }
      }
    }
  }
};

class TanksGame {
  constructor(send, players, frameDelay) {
    this.frameDelay = frameDelay;
    this.send = send;
    let playerId = 0;
    for (let player of players) {
      player.id = playerId;
      playerId += 1;
    }
    this.allPlayers = players.slice();
    this.players = players;
    this.stopped = false;
    this.world = {
      walls: [],
      tanks: [],
      bullets: [],
    };
    this.actionId = 0;
    this.initWalls();
    this.initTanks();
  }

  initTanks() {
    this.tankOwners = new Map();
    let tank1;
    let tank2;
    if (Math.random() > 0.5) {
      tank1 = new Tank(75, 250, true, true, 'blue');
      tank2 = new Tank(425, 250, true, false, 'red');
      this.tankOwners.set(this.players[0], tank1);
      this.tankOwners.set(this.players[1], tank2);
    } else {
      tank1 = new Tank(75, 250, true, true, 'red');
      tank2 = new Tank(425, 250, true, false, 'blue');
      this.tankOwners.set(this.players[1], tank1);
      this.tankOwners.set(this.players[0], tank2);
    }
    this.world.tanks.push(tank1);
    this.world.tanks.push(tank2);
  }

  initWalls() {
    this.world.walls.push({
      x: 250,
      y: 25,
      width: 500,
      height: 50,
    });
    this.world.walls.push({
      x: 250,
      y: 475,
      width: 500,
      height: 50,
    });
    this.world.walls.push({
      x: 25,
      y: 250,
      width: 50,
      height: 500,
    });
    this.world.walls.push({
      x: 475,
      y: 250,
      width: 50,
      height: 500,
    });
  }

  getEnvironment(player) {
    const originalTank = this.tankOwners.get(player);
    const tank = { ...originalTank };
    let enemy;
    const enemyBullets = [];
    for (let anotherTank of this.world.tanks) {
      if (anotherTank !== originalTank) {
        enemy = { ...anotherTank };
      }
    }
    for (let bullet of this.world.bullets) {
      if (bullet.owner !== originalTank) {
        const copyBullet = { ... bullet };
        copyBullet.owner = undefined;
        enemyBullets.push(copyBullet);
      }
    }
    tank.color = undefined;
    enemy.color = undefined;
    return {
      tank,
      enemy,
      enemyBullets,
    }
  }

  async liveTanks() {
    const decisions = await Promise.all(this.players.map(player => {
      return player.decide(this.getEnvironment(player), this.actionId, 5);
    }));
    for (let decisionIdx in decisions) {
      const actions = decisions[decisionIdx].actions;
      this.tankOwners.get(this.players[decisionIdx]).do(actions, this.world);
    }
    for (let tank of this.world.tanks) {
      tank.power += 5;
      if (tank.power > 100) {
        tank.power = 100;
      }
    }
    this.actionId += 1;
  }

  liveBullets() {
    for (let bullet of this.world.bullets) {
      bullet.live();
    }
  }

  updateView() {
    if (this.send !== undefined) {
      this.send(JSON.stringify({
        gameTime: this.actionId,
        world: this.world,
        type: 'worldInfo',
        gameType: 'Tanks',
      }));
    }
  }

  setFrameDelay(frameDelay) {
    this.frameDelay = frameDelay;
  }

  checkCollisions() {
    for (let tank of this.world.tanks) {
      for (let anotherTank of this.world.tanks) {
        if (anotherTank !== tank) {
          checkTankTankCollision(tank, anotherTank);
        }
      }
    }
    for (let tank of this.world.tanks) {
      for (let wall of this.world.walls) {
        checkTankWallCollision(tank, wall);
      }
    }
    const deadTanks = [];
    const deadBullets = [];
    for (let bullet of this.world.bullets) {
      for (let wall of this.world.walls) {
        const destroyed = checkBulletWallCollision(bullet, wall);
        if (destroyed) {
          deadBullets.push(bullet);
        }
      }
      for (let tank of this.world.tanks) {
        if (tank === bullet.owner) {
          continue;
        }
        const damaged = checkBulletTankCollision(bullet, tank);
        if (damaged) {
          deadBullets.push(bullet);
          tank.health -= 20;
          if (tank.health <= 0) {
            deadTanks.push(tank);
          }
        }
      }
    }
    for (let deadBullet of deadBullets) {
      const idx = this.world.bullets.indexOf(deadBullet);
      this.world.bullets.splice(idx, 1);
    }
    for (let deadTank of deadTanks) {
      const tankIdx = this.world.tanks.indexOf(deadTank);
      this.world.tanks.splice(tankIdx, 1);
      for (let playerIdx in this.players) {
        if (this.tankOwners.get(this.players[playerIdx]) === deadTank) {
          this.players.splice(playerIdx, 1);
        }
      }
    }
  }

  async live() {
    await this.liveTanks();
    this.liveBullets();
    this.checkCollisions();
    this.updateView();
    // stop condition
    if (!this.stopped && this.players.length > 1 && this.actionId < maxActions) {
      setTimeout(() => {
        this.live();
      }, this.frameDelay);
    } else {
      if (this.players.length > 1 && this.actionId < maxActions) {
        this.gameResolve(undefined);
      } else {
        const winner = this.players[0];
        if (winner === undefined || this.actionId >= maxActions) {
          for (let player of this.allPlayers) {
            player.defeat();
          }
          this.gameResolve(null);
        } else {
          winner.win();
          for (let player of this.allPlayers) {
            if (player !== winner) {
              player.defeat();
            }
          }
          this.gameResolve(winner.id);
        }
      }
    }
  }
  
  async start() {
    return new Promise(resolve => {
      this.gameResolve = resolve;
      this.live();
    });
  }

  stop() {
    this.stopped = true;
  }
}

export default TanksGame;