import './styles/index.css';
import Canvas from './Canvas.js';
import paintGameTypes from './GameTypes.js';
import "regenerator-runtime/runtime";

const serverAddress = 'localhost:8999';
let status = {};
let canvas;
let socket;

async function getStatus() {
  const response = await fetch(`http://${serverAddress}/status`);
  const json = await response.json();
  status = json;
  if (status.isPlaying) {
    document.getElementById('status').innerText = `Игра ${status.gameType} начата`;
  } else {
    document.getElementById('status').innerText = `Игра не начата`;
    canvas.makeNoise();
  }
}

async function startGame(gameType, numberGames, playerAddresses) {
  const response = await fetch(`http://${serverAddress}/start`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: JSON.stringify({
      gameType,
      numberGames,
      playerAddresses,
    }),
  });
  const json = await response.json();
  if (response.ok && json.created) {
    getStatus();
  } else {
  }
}

async function stopGame() {
  const response = await fetch(`http://${serverAddress}/stop`, {
    headers: {
      'Content-Type': 'application/json',
    },
    method: 'POST',
    body: '{}',
  });
  const json = await response.json();
  if (response.ok && json.stopped) {
    getStatus();
  } else {
  }
}

function connectWebSocketServer() {
  socket = new WebSocket(`ws://${serverAddress}/`);  
  socket.onmessage = function(e) {
    const data = JSON.parse(e.data);
    const type = data.type;
    switch (type) {
      case 'worldInfo':
        const gameType = data.gameType;
        if (paintGameTypes[gameType] !== undefined && canvas !== undefined) {
          paintGameTypes[gameType](data.world, canvas);
        }
        document.getElementById('world-info').innerText = `
          Сделано ходов: ${data.gameTime}
        `;
        break;
      case 'gameInfo':
        document.getElementById('game-info').innerText = `
          Сыграно игр: ${data.playedNumberGames}/${data.numberGames}
        `;
        break;
      case 'winnerInfo':
        const wins = data.wins;
        let winsText = '';
        console.log(wins);
        for (let winIdx in wins) {
          winsText += `Побед игрока ${winIdx}: ${wins[winIdx]}<br>`;
        }
        document.getElementById('wins-info').innerHTML = winsText;
        break;
      case 'stopInfo':
        document.getElementById('wins-info').innerHTML += '<br>В прошлой игре';
        getStatus();
        break;
    }
  }
}

function initInterfaceListeners() {
  document.getElementById('start-game').onclick = (event) => {
    const gameType = document.getElementById('game-type').value;
    const numberGames = document.getElementById('number-games-input').value;
    const player1Address = document.getElementById('player-server-1').value;
    const player2Address = document.getElementById('player-server-2').value;
    startGame(gameType, numberGames, [player1Address, player2Address]);
  };
  document.getElementById('stop-game').onclick = (event) => {
    stopGame();
  };
  document.getElementById('number-games-input').onchange = (event) => {
    document.getElementById('number-games-label').innerText = `Количество игр: ${event.target.value}`;
  }
  document.getElementById('frame-delay-input').onchange = (event) => {
    document.getElementById('frame-delay-label').innerText = `Задержка кадра: ${event.target.value}`;
  }
  document.getElementById('frame-delay-apply').onclick = (event) => {
    socket.send(JSON.stringify({
      type: 'setFrameDelay',
      frameDelay: document.getElementById('frame-delay-input').value,
    }));
  }
}

async function init() {
  canvas = new Canvas('game', 500, 500);
  getStatus();
  connectWebSocketServer();
  initInterfaceListeners();
}

init();