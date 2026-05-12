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
      q: "В каком году началась Вторая мировая война?",
      a: ["1914", "1939", "1945", "1920"],
      correct: 1
    },
    {
      q: "Кто был первым президентом США?",
      a: ["Линкольн", "Вашингтон", "Джефферсон", "Рузвельт"],
      correct: 1
    },
    {
      q: "Где были построены пирамиды?",
      a: ["Греция", "Египет", "Рим", "Китай"],
      correct: 1
    },
    {
      q: "Кто открыл Америку?",
      a: ["Магеллан", "Колумб", "Васко да Гама", "Кук"],
      correct: 1
    },
    {
      q: "Где находился центр Римской империи?",
      a: ["Афины", "Рим", "Париж", "Лондон"],
      correct: 1
    },
    {
      q: "Когда была Французская революция?",
      a: ["1789", "1812", "1600", "1905"],
      correct: 0
    },
    {
      q: "Кто был Наполеон?",
      a: ["Король Англии", "Французский император", "Сенатор Рима", "Царь России"],
      correct: 1
    },
    {
      q: "Где появилась демократия?",
      a: ["Рим", "Греция", "Египет", "Индия"],
      correct: 1
    },
    {
      q: "Что такое Средневековье?",
      a: ["Будущее", "Исторический период", "Война", "Империя"],
      correct: 1
    },
    {
      q: "Кто изобрёл печатный станок?",
      a: ["Гутенберг", "Ньютон", "Да Винчи", "Галилей"],
      correct: 0
    },
    {
      q: "Когда пала Римская империя?",
      a: ["476", "1066", "1492", "1200"],
      correct: 0
    },
    {
      q: "Кто был Юлий Цезарь?",
      a: ["Учёный", "Римский политик", "Художник", "Фараон"],
      correct: 1
    },
    {
      q: "Где находится Великая Китайская стена?",
      a: ["Япония", "Китай", "Корея", "Индия"],
      correct: 1
    },
    {
      q: "Что такое холодная война?",
      a: ["Война без оружия", "Конфликт США и СССР", "Средневековая война", "Гражданская война"],
      correct: 1
    },
    {
      q: "Кто был Гитлер?",
      a: ["Президент США", "Лидер Германии", "Король Англии", "Учёный"],
      correct: 1
    },
    {
      q: "Когда человек впервые полетел в космос?",
      a: ["1955", "1961", "1970", "1980"],
      correct: 1
    },
    {
      q: "Где началась индустриальная революция?",
      a: ["Франция", "Англия", "США", "Германия"],
      correct: 1
    },
    {
      q: "Что такое колонизация?",
      a: ["Торговля", "Захват земель", "Религия", "Наука"],
      correct: 1
    },
    {
      q: "Кто открыл теорию относительности?",
      a: ["Ньютон", "Эйнштейн", "Галилей", "Тесла"],
      correct: 1
    },
    {
      q: "Кто был первым римским императором?",
      a: ["Август", "Нерон", "Цезарь", "Траян"],
      correct: 0
    }

  ],

  games: [

    {
      q: "Кто создал Minecraft?",
      a: ["Notch", "Valve", "Rockstar", "EA"],
      correct: 0
    },
    {
      q: "В какой игре есть Creeper?",
      a: ["Fortnite", "Minecraft", "Roblox", "Terraria"],
      correct: 1
    },
    {
      q: "Что такое FPS?",
      a: ["Жанр", "Кадры в секунду", "Оружие", "Карта"],
      correct: 1
    },
    {
      q: "Какая компания сделала GTA?",
      a: ["Ubisoft", "Rockstar Games", "EA", "Valve"],
      correct: 1
    },
    {
      q: "Что такое RPG?",
      a: ["Графика", "Жанр", "Мод", "Карта"],
      correct: 1
    },
    {
      q: "В какой игре есть Ender Dragon?",
      a: ["Minecraft", "Skyrim", "PUBG", "CS:GO"],
      correct: 0
    },
    {
      q: "Что такое NPC?",
      a: ["Игрок", "Неигровой персонаж", "Оружие", "Карта"],
      correct: 1
    },
    {
      q: "Что делает игровой движок?",
      a: ["Музыку", "Создаёт игры", "Интернет", "Только графику"],
      correct: 1
    },
    {
      q: "Что такое лаг?",
      a: ["Ошибка графики", "Задержка", "Урон", "Мод"],
      correct: 1
    },
    {
      q: "Какая игра Battle Royale?",
      a: ["CS:GO", "Fortnite", "Minecraft", "Sims"],
      correct: 1
    },
    {
      q: "Что такое DLC?",
      a: ["Ошибка", "Доп. контент", "Режим", "Карта"],
      correct: 1
    },
    {
      q: "В какой игре есть лутбоксы?",
      a: ["Overwatch", "Tetris", "Doom", "Pac-Man"],
      correct: 0
    },
    {
      q: "Что такое сервер?",
      a: ["Компьютер", "Хост игры", "Мод", "Графика"],
      correct: 1
    },
    {
      q: "Что такое скин?",
      a: ["Карта", "Внешний вид", "Оружие", "Ошибка"],
      correct: 1
    },
    {
      q: "Кто делает PlayStation?",
      a: ["Microsoft", "Sony", "Nintendo", "Sega"],
      correct: 1
    },
    {
      q: "Что такое sandbox игра?",
      a: ["Линейная", "Открытый мир", "Стратегия", "Шутер"],
      correct: 1
    },
    {
      q: "Что такое hitbox?",
      a: ["Музыка", "Зона попадания", "Карта", "Мод"],
      correct: 1
    },
    {
      q: "Что делает AI в играх?",
      a: ["Музыку", "Поведение врагов", "Графику", "Интернет"],
      correct: 1
    },
    {
      q: "Какая компания создала DOOM?",
      a: ["Valve", "id Software", "Ubisoft", "Nintendo"],
      correct: 1
    },
    {
      q: "Что такое Unity?",
      a: ["Игра", "Движок", "Консоль", "Мод"],
      correct: 1
    }

  ],

  music: [

    {
      q: "Кто написал Bohemian Rhapsody?",
      a: ["The Beatles", "Queen", "Led Zeppelin", "Pink Floyd"],
      correct: 1
    },
    {
      q: "Инструмент Джими Хендрикса?",
      a: ["Бас", "Скрипка", "Гитара", "Саксофон"],
      correct: 2
    },
    {
      q: "Жанр Metallica?",
      a: ["Pop", "Jazz", "Metal", "Reggae"],
      correct: 2
    },
    {
      q: "Сколько нот в октаве?",
      a: ["5", "7", "8", "12"],
      correct: 3
    },
    {
      q: "Кто написал Moonlight Sonata?",
      a: ["Моцарт", "Бетховен", "Бах", "Шопен"],
      correct: 1
    },
    {
      q: "Стиль DOOM OST?",
      a: ["EDM", "Jazz", "Industrial Metal", "Classical"],
      correct: 2
    },
    {
      q: "Что такое BPM?",
      a: ["Бас", "Темп", "Инструмент", "Микрофон"],
      correct: 1
    },
    {
      q: "Высокий женский голос?",
      a: ["Бас", "Тенор", "Альт", "Сопрано"],
      correct: 3
    },
    {
      q: "DAW программа?",
      a: ["Photoshop", "FL Studio", "Blender", "Unity"],
      correct: 1
    },
    {
      q: "Что такое реверберация?",
      a: ["Инструмент", "Эхо эффект", "Нота", "Темп"],
      correct: 1
    },
    {
      q: "Стиль Led Zeppelin?",
      a: ["Punk", "Rock", "Techno", "Disco"],
      correct: 1
    },
    {
      q: "Сколько струн у гитары?",
      a: ["4", "5", "6", "12"],
      correct: 2
    },
    {
      q: "Что такое аккорд?",
      a: ["Нота", "Набор нот", "Темп", "Эффект"],
      correct: 1
    },
    {
      q: "Кто написал Imagine?",
      a: ["John Lennon", "Elvis", "Mercury", "Cobain"],
      correct: 0
    },
    {
      q: "Что такое бит?",
      a: ["Тон", "Ритм", "Эффект", "Октава"],
      correct: 1
    },
    {
      q: "Инструмент в оркестре?",
      a: ["Гитара", "Скрипка", "Синтезатор", "Барабаны ПК"],
      correct: 1
    },
    {
      q: "Что такое тональность?",
      a: ["Громкость", "Лад", "Эхо", "Ритм"],
      correct: 1
    },
    {
      q: "Рок-группа?",
      a: ["Daft Punk", "Nirvana", "Skrillex", "Avicii"],
      correct: 1
    },
    {
      q: "Что делает компрессор?",
      a: ["Громкость ↑", "Сжимает динамику", "Эхо", "Темп"],
      correct: 1
    },
    {
      q: "Что такое MIDI?",
      a: ["Видео", "Музыкальный протокол", "Микрофон", "Эффект"],
      correct: 1
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
