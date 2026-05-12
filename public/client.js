const socket = io();

let currentRoom = null;

let answered = false;

let thinkingMusic = null;

const menuMusic =
  new Audio("MainMenu.mp3");

menuMusic.volume = 1.0;

window.addEventListener("click", () => {

  menuMusic.play().catch(() => {});

}, { once: true });

function typeText(element, text, speed = 30) {

  element.innerHTML = "";

  let i = 0;

  const interval = setInterval(() => {

    element.innerHTML += text[i];

    i++;

    if (i >= text.length) {

      clearInterval(interval);
    }

  }, speed);
}

function stopThinkingMusic() {

  if (thinkingMusic) {

    thinkingMusic.pause();

    thinkingMusic.currentTime = 0;

    thinkingMusic = null;
  }
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

  document.getElementById("hostBox")
    .style.display = "flex";

  document.getElementById("player1")
    .innerText =
      `${data.players[0].nick}: 0`;

  document.getElementById("player2")
    .innerText =
      `${data.players[1].nick}: 0`;

  const hostText =
`Приветствую вас, уважаемые игроки! Вам попалась категория ${data.category}. Вам предстоит ответить на 10 вопросов! Желаю удачи!`;

  typeText(
    document.getElementById("hostText"),
    hostText,
    35
  );

  setTimeout(() => {

    document.getElementById("hostBox")
      .style.display = "none";

    nextQuestion(data.question);

  }, 10000);
});

function nextQuestion(q) {

  answered = false;

  stopThinkingMusic();

  document.getElementById("question")
    .innerHTML = "";

  document.getElementById("answers")
    .innerHTML = "";

  document.getElementById("result")
    .innerHTML = "";

  document.getElementById("waitingText")
    .innerHTML = "";

  document.getElementById("questionNumber")
    .innerText =
      `Вопрос ${q.number} / ${q.total}`;

  typeText(
    document.getElementById("question"),
    q.q,
    25
  );

  setTimeout(() => {

    const tracks = [
      "THINKING1.mp3",
      "THINKING2.mp3"
    ];

    const track =
      tracks[
        Math.floor(
          Math.random() * tracks.length
        )
      ];

    thinkingMusic = new Audio(track);

    thinkingMusic.loop = true;

    thinkingMusic.volume = 0.7;

    thinkingMusic.play();

    const answers =
      [...q.a].sort(() =>
        Math.random() - 0.5
      );

    answers.forEach((answer) => {

      const btn =
        document.createElement("button");

      btn.className = "answerBtn";

      btn.innerText = answer;

      btn.onclick = () => {

        if (answered) return;

        answered = true;

        btn.classList.add(
          "selectedAnswer"
        );

        document
          .querySelectorAll(".answerBtn")
          .forEach(b => {

            b.disabled = true;
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

  }, 5000);
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

  document.getElementById("result")
    .innerHTML = `

      Правильный ответ:
      ${data.correctAnswer}

      <br><br>

      ${
        myResult.correct
        ? "Ответ правильный"
        : "Ответ неправильный"
      }

      <br>

      ${
        myResult.faster
        ? "Вы ответили быстрее"
        : "Вы ответили позже"
      }

      <br><br>

      Получено очков:
      ${myResult.points}
    `;
});

socket.on("gameOver", (data) => {

  stopThinkingMusic();

  document.getElementById("hostBox")
    .style.display = "none";

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
