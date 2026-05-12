const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();

const server = http.createServer(app);

const io = new Server(server);

app.use(express.static("public"));

const categories = {

  history: [

    {
      q: "Кто был первым президентом США?",
      a: [
        "Вашингтон",
        "Линкольн",
        "Кеннеди",
        "Рузвельт"
      ],
      correct: 0
    },

    {
      q: "В каком году началась Вторая мировая война?",
      a: [
        "1939",
        "1941",
        "1914",
        "1922"
      ],
      correct: 0
    },

    {
      q: "Кто построил пирамиды?",
      a: [
        "Римляне",
        "Египтяне",
        "Греки",
        "Викинги"
      ],
      correct: 1
    }

  ],

  games: [

    {
      q: "Какая компания создала DOOM?",
      a: [
        "Valve",
        "id Software",
        "Ubisoft",
        "Nintendo"
      ],
      correct: 1
    },

    {
      q: "Кто создал Minecraft?",
      a: [
        "Notch",
        "Valve",
        "Rockstar",
        "EA"
      ],
      correct: 0
    },

    {
      q: "Какой движок использует C#?",
      a: [
        "Unity",
        "Godot",
        "CryEngine",
        "Source"
      ],
      correct: 0
    }

  ],

  music: [

    {
      q: "Кто был вокалистом Queen?",
      a: [
        "Фредди Меркьюри",
        "Майкл Джексон",
        "Оззи Осборн",
        "Дэвид Боуи"
      ],
      correct: 0
    },

    {
      q: "Кто написал музыку DOOM 2016?",
      a: [
        "Мик Гордон",
        "Ханс Циммер",
        "Кирилл",
        "Metallica"
      ],
      correct: 0
    },

    {
      q: "Какой жанр у Metallica?",
      a: [
        "Рэп",
        "Джаз",
        "Метал",
        "Техно"
      ],
      correct: 2
    }

  ]
};

let waitingPlayer = null;

const games = {};

function shuffle(array) {

  return array.sort(() =>
    Math.random() - 0.5
  );
}

io.on("connection", (socket) => {

  socket.on("findGame", (nick) => {

    socket.nick = nick;

    if (waitingPlayer === null) {

      waitingPlayer = socket;

      socket.emit("waiting");

    } else {

      const room =
        "room_" +
        socket.id +
        "_" +
        waitingPlayer.id;

      socket.join(room);

      waitingPlayer.join(room);

      const categoryNames =
        Object.keys(categories);

      const randomCategory =
        categoryNames[
          Math.floor(
            Math.random() *
            categoryNames.length
          )
        ];

      const shuffledQuestions =
        shuffle(
          [...categories[randomCategory]]
        ).slice(0, 10);

      shuffledQuestions.forEach((q, i) => {

        q.number = i + 1;

        q.total =
          shuffledQuestions.length;
      });

      const game = {

        room,

        category: randomCategory,

        players: [
          {
            id: waitingPlayer.id,
            nick: waitingPlayer.nick,
            score: 0
          },
          {
            id: socket.id,
            nick: socket.nick,
            score: 0
          }
        ],

        questionIndex: 0,

        answers: {},

        questions: shuffledQuestions
      };

      games[room] = game;

      io.to(room).emit("startGame", {

        room,

        players: game.players,

        category: randomCategory,

        question: game.questions[0]
      });

      waitingPlayer = null;
    }
  });

  socket.on("answer", (data) => {

    const game =
      games[data.room];

    if (!game) return;

    game.answers[socket.id] = {

      answer: data.answer,

      time: data.time
    };

    if (
      Object.keys(game.answers)
        .length < 2
    ) return;

    const p1 =
      game.players[0];

    const p2 =
      game.players[1];

    const a1 =
      game.answers[p1.id];

    const a2 =
      game.answers[p2.id];

    const correct =
      game.questions[
        game.questionIndex
      ].correct;

    function calc(
      answerData,
      otherData,
      player
    ) {

      const faster =
        answerData.time <
        otherData.time;

      const correctAnswer =
        answerData.answer ===
        correct;

      let points = 0;

      if (
        correctAnswer &&
        faster
      ) {

        points = 1.5;

      } else if (
        correctAnswer
      ) {

        points = 1;
      }

      player.score += points;

      return {

        faster,

        correct: correctAnswer,

        points
      };
    }

    const result1 =
      calc(a1, a2, p1);

    const result2 =
      calc(a2, a1, p2);

    io.to(game.room).emit(
      "result",
      {

        players: game.players,

        correctAnswer:
          game.questions[
            game.questionIndex
          ].a[correct],

        results: {
          [p1.id]: result1,
          [p2.id]: result2
        }
      }
    );

    game.answers = {};

    game.questionIndex++;

    setTimeout(() => {

      if (
        game.questionIndex >=
        game.questions.length
      ) {

        let winner = "draw";

        let winnerId = null;

        if (
          p1.score >
          p2.score
        ) {

          winner =
            p1.nick;

          winnerId =
            p1.id;
        }

        if (
          p2.score >
          p1.score
        ) {

          winner =
            p2.nick;

          winnerId =
            p2.id;
        }

        io.to(game.room).emit(
          "gameOver",
          {
            winner,
            winnerId
          }
        );

        delete games[game.room];

      } else {

        io.to(game.room).emit(
          "question",
          game.questions[
            game.questionIndex
          ]
        );
      }

    }, 5000);
  });

  socket.on("disconnect", () => {

    if (
      waitingPlayer === socket
    ) {

      waitingPlayer = null;
    }

    for (
      const room in games
    ) {

      const game =
        games[room];

      const playerInGame =
        game.players.find(
          p =>
            p.id === socket.id
        );

      if (playerInGame) {

        io.to(room).emit(
          "opponentLeft"
        );

        delete games[room];
      }
    }
  });
});

server.listen(
  process.env.PORT || 3000,
  () => {

    console.log(
      "server started"
    );
  }
);
