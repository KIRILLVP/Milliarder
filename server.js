const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

let waitingPlayer = null;
let rooms = {};

const questions = [
  {
    q: "Столица Франции?",
    a: ["Париж", "Берлин", "Рим", "Мадрид"],
    correct: 0
  },
  {
    q: "2+2?",
    a: ["3", "4", "5", "6"],
    correct: 1
  },
  // 👉 добавь ещё (всего 20)
];

function shuffle(array) {
  return array.sort(() => Math.random() - 0.5);
}

io.on("connection", (socket) => {
  console.log("player connected");

  socket.on("findGame", (nick) => {
    socket.nick = nick;

    if (waitingPlayer) {
      const room = "room_" + socket.id + "_" + waitingPlayer.id;

      rooms[room] = {
        players: [socket, waitingPlayer],
        scores: [0, 0],
        answers: [],
        questionIndex: 0,
        questionSet: shuffle([...questions]).slice(0, 20)
      };

      socket.join(room);
      waitingPlayer.join(room);

      io.to(room).emit("startGame", {
        players: [socket.nick, waitingPlayer.nick]
      });

      waitingPlayer = null;
    } else {
      waitingPlayer = socket;
    }
  });

  socket.on("answer", ({ room, answer, time }) => {
    const game = rooms[room];
    if (!game) return;

    game.answers.push({ socket, answer, time });

    if (game.answers.length === 2) {
      const [p1, p2] = game.answers;

      const correct = game.questionSet[game.questionIndex].correct;

      function calc(p, opponent, index) {
        let score = 0;
        const faster = p.time < opponent.time;

        if (faster && p.answer === correct) score = 2;
        if (faster && p.answer !== correct) score = -2;
        if (!faster && p.answer === correct) score = 1;
        if (!faster && p.answer !== correct) score = -1;

        game.scores[index] += score;

        return {
          correct: p.answer === correct,
          faster
        };
      }

      const r1 = calc(p1, p2, 0);
      const r2 = calc(p2, p1, 1);

      io.to(room).emit("result", {
        correct,
        results: [r1, r2],
        scores: game.scores
      });

      game.answers = [];
      game.questionIndex++;

      setTimeout(() => {
        if (game.questionIndex >= game.questionSet.length) {
          io.to(room).emit("gameOver", game.scores);
          delete rooms[room];
        } else {
          io.to(room).emit("nextQuestion",
            game.questionSet[game.questionIndex]
          );
        }
      }, 4000);
    }
  });

  socket.on("disconnect", () => {
    console.log("disconnect");

    if (waitingPlayer === socket) {
      waitingPlayer = null;
    }

    for (let room in rooms) {
      const game = rooms[room];
      if (game.players.includes(socket)) {
        io.to(room).emit("opponentLeft");
        delete rooms[room];
      }
    }
  });
});

server.listen(3000, () => console.log("Server running"));