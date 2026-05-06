const socket = io();

let currentRoom = null;

let answered = false;

let thinkingMusic = null;

let selectedButton = null;

const menuMusic =
  new Audio("MainMenu.mp3");

menuMusic.volume = 1.0;

window.addEventListener("click", () => {

  menuMusic.play().catch(() => {});

}, { once: true });

function stopThinkingMusic() {

  if (thinkingMusic) {

    thinkingMusic.pause();

    thinkingMusic.currentTime = 0;

    thinkingMusic = null;
  }
}

function shuffle(array) {

  return array.sort(() => Math.random() - 0.5);
}

function findGame() {

  const nick =
    document.getElementById("nick")
      .value
      .trim();

  if (!nick) {

    alert("Введите ник");

    return;
  }

  document.getElementById("status")
    .innerText =
      "Поиск соперника...";

  socket.emit("findGame", nick);
}

socket.on("waiting", () => {

  document.getElementById("status")
    .innerText =
      "Ожидание второго игрока...";
});

socket.on("startGame", (data) => {

  menuMusic.pause();

  currentRoom = data.room;

  document.getElementById("menu")
    .style.display = "none";

  document.getElementById("game")
    .style.display = "block";

  document.getElementById("player1")
    .innerText =
      `${data.players[0].nick}: 0`;

  document.getElementById("player2")
    .innerText =
      `${data.players[1].nick}: 0`;

  nextQuestion(data.question);
});

function nextQuestion(q) {

  answered = false;

  selectedButton = null;

  stopThinkingMusic();

  document.getElementById("question")
    .innerText = q.q;

  document.getElementById("questionNumber")
    .innerText =
      `Вопрос ${q.number} / ${q.total}`;

  document.getElementById("answers")
    .innerHTML = "";

  document.getElementById("result")
    .innerHTML = "";

  document.getElementById("waitingText")
    .innerHTML = "";

  setTimeout(() => {

    const track =
      Math.random() > 0.5
      ? "THINKING1.mp3"
      : "THINKING2.mp3";

    thinkingMusic = new Audio(track);

    thinkingMusic.loop = true;

    thinkingMusic.volume = 0.7;

    thinkingMusic.play()
      .catch(() => {

        console.log(
          "Ошибка воспроизведения:",
          track
        );
      });

    const answers =
      shuffle([...q.a]);

    answers.forEach((answer) => {

      const btn =
        document.createElement("button");

      btn.className = "answerBtn";

      btn.innerText = answer;

      btn.onclick = () => {

        if (answered) return;

        answered = true;

        selectedButton = btn;

        btn.classList.add("selectedAnswer");

        document
          .querySelectorAll(".answerBtn")
          .forEach(b => {

            if (b !== btn) {

              b.disabled = true;
            }
          });

        document
          .getElementById("waitingText")
          .innerText =
            "Ждём ответа соперника...";

        socket.emit("answer", {

          room: currentRoom,

          answer:
            q.a.indexOf(answer),

          time: Date.now()
        });
      };

      document
        .getElementById("answers")
        .appendChild(btn);
    });

  }, 3000);
}

socket.on("question", (q) => {

  nextQuestion(q);
});

socket.on("result", (data) => {

  stopThinkingMusic();

  document.getElementById(
    "waitingText"
  ).innerHTML = "";

  const myResult =
    data.results[socket.id];

  if (myResult.correct) {

    new Audio("RIGHT.mp3").play();

  } else {

    new Audio("WRONG.mp3").play();
  }

  document.getElementById("player1")
    .innerText =
      `${data.players[0].nick}: ${data.players[0].score}`;

  document.getElementById("player2")
    .innerText =
      `${data.players[1].nick}: ${data.players[1].score}`;

  let pointsText = "";

  if (myResult.points > 0) {

    pointsText =
      `+${myResult.points} очков`;

  } else {

    pointsText =
      `${myResult.points} очков`;
  }

  document.getElementById("result")
    .innerHTML = `

      Правильный ответ:
      ${data.correctAnswer}

      <br><br>

      Ваш ответ:
      ${
        myResult.correct
        ? "Правильный"
        : "Неправильный"
      }

      <br>

      ${
        myResult.faster
        ? "Вы ответили быстрее"
        : "Вы ответили позже"
      }

      <br><br>

      Получено:
      ${pointsText}
    `;
});

socket.on("gameOver", (data) => {

  stopThinkingMusic();

  const myId = socket.id;

  let endSound;

  if (data.winner === "draw") {

    endSound =
      new Audio("RIGHT.mp3");

    alert("Ничья!");

  } else if (
    data.winnerId === myId
  ) {

    endSound =
      new Audio("RIGHT.mp3");

    alert("Вы победили!");

  } else {

    endSound =
      new Audio("WRONG.mp3");

    alert("Вы проиграли!");
  }

  endSound.play();

  setTimeout(() => {

    location.reload();

  }, 4000);
});

socket.on("opponentLeft", () => {

  stopThinkingMusic();

  alert("Соперник отключился");

  location.reload();
});

function goMenu() {

  stopThinkingMusic();

  location.reload();
}
