const socket = io();

let currentRoom = null;
let currentQuestion = null;
let answered = false;

const menuMusic = new Audio("MainMenu.mp3");
menuMusic.loop = true;
menuMusic.volume = 0.5;

window.addEventListener("click", () => {
  menuMusic.play().catch(() => {});
}, { once: true });

function findGame() {

  const nick = document.getElementById("nick").value.trim();

  if (!nick) {
    alert("Введите ник");
    return;
  }

  document.getElementById("status").innerText =
    "Поиск соперника...";

  socket.emit("findGame", nick);
}

socket.on("waiting", () => {
  document.getElementById("status").innerText =
    "Ожидание второго игрока...";
});

socket.on("startGame", (data) => {

  menuMusic.pause();

  currentRoom = data.room;

  document.getElementById("menu").style.display = "none";
  document.getElementById("game").style.display = "block";

document.getElementById("player1").innerText =
    `${data.players[0].nick}: 0`;

document.getElementById("player2").innerText =
    `${data.players[1].nick}: 0`;

  nextQuestion(data.question);
});

function nextQuestion(q) {

  answered = false;
  currentQuestion = q;

  document.getElementById("question").innerText = q.q;

  document.getElementById("answers").innerHTML = "";

  document.getElementById("result").innerText = "";

  setTimeout(() => {

    const thinkingMusic =
      Math.random() > 0.5
      ? new Audio("THINKING1.mp3")
      : new Audio("THINKING2.mp3");

    thinkingMusic.play();

    q.a.forEach((answer, index) => {

      const btn = document.createElement("button");

      btn.className = "answerBtn";

      btn.innerText = answer;

      btn.onclick = () => {

        if (answered) return;

        answered = true;

        socket.emit("answer", {
          room: currentRoom,
          answer: index,
          time: Date.now()
        });

        document.querySelectorAll(".answerBtn")
          .forEach(b => b.disabled = true);
      };

      document.getElementById("answers")
        .appendChild(btn);
    });

  }, 3000);
}

socket.on("question", (q) => {
  nextQuestion(q);
});

socket.on("result", (data) => {

  const myResult = data.results[socket.id];

  if (myResult.correct) {
    new Audio("RIGHT.mp3").play();
  } else {
    new Audio("WRONG.mp3").play();
  }

  document.getElementById("player1").innerText =
    `${data.players[0].nick}: ${data.players[0].score}`;

  document.getElementById("player2").innerText =
    `${data.players[1].nick}: ${data.players[1].score}`;

  document.getElementById("result").innerHTML = `
    Правильный ответ: ${data.correctAnswer}<br><br>

    Ваш ответ:
    ${myResult.correct ? "Правильный" : "Неправильный"}<br>

    ${
      myResult.faster
      ? "Вы ответили быстрее"
      : "Вы ответили позже"
    }
  `;
});

socket.on("gameOver", (data) => {

  let text = "";

  if (data.winner === "draw") {
    text = "Ничья!";
  } else {
    text = `Победил ${data.winner}`;
  }

  alert(text);

  location.reload();
});

socket.on("opponentLeft", () => {

  alert("Соперник отключился");

  location.reload();
});

function goMenu() {
  location.reload();
}
