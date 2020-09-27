const tankSize = 50;
const bulletSize = 10;

const paintWall = (wall, canvas) => {
  canvas.fillRect(wall.x, wall.y, wall.width, wall.height, "red");
}

const paintTank = (tank, canvas) => {
  canvas.fillRect(tank.x, tank.y, tankSize, tankSize, tank.color);
  if (tank.axis) {
    if (tank.direction) {
      canvas.fillRect(tank.x + tankSize / 2, tank.y, tankSize / 2, tankSize / 8, "black");
    } else {
      canvas.fillRect(tank.x - tankSize / 2, tank.y, tankSize / 2, tankSize / 8, "black");
    }
  } else {
    if (tank.direction) {
      canvas.fillRect(tank.x, tank.y + tankSize / 2, tankSize / 8, tankSize / 2, "black");
    } else {
      canvas.fillRect(tank.x, tank.y - tankSize / 2, tankSize / 8, tankSize / 2, "black");
    }
  }
}

const paintBullet = (bullet, canvas) => {
  canvas.fillRect(bullet.x, bullet.y, bulletSize, bulletSize, "#666");
}

const paint = (world, canvas) => {
  canvas.clear();
  for (let wall of world.walls) {
    paintWall(wall, canvas);
  }
  for (let bullet of world.bullets) {
    paintBullet(bullet, canvas);
  }
  for (let tank of world.tanks) {
    paintTank(tank, canvas);
  }
};

export default paint;