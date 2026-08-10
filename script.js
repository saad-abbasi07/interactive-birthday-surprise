"use strict";

const SECRET_PASSCODE = "1508";
const screens = [...document.querySelectorAll(".screen")];
const dots = [...document.querySelectorAll("#pinDots span")];
const error = document.getElementById("passcodeError");
const confetti = document.getElementById("confettiLayer");
const floating = document.getElementById("floating");
const musicButton = document.getElementById("musicButton");

const passcodeMusic = document.getElementById("passcodeMusic");
const friendMusic = document.getElementById("friendMusic");
const birthdayMusic = document.getElementById("birthdayMusic");
const finalMusic = document.getElementById("finalMusic");
const revealSound = document.getElementById("revealSound");
const celebrationSound = document.getElementById("celebrationSound");
const musicTracks = [passcodeMusic, friendMusic, birthdayMusic, finalMusic];

let pin = "";
let currentMusic = null;
let soundEnabled = true;
let audioStarted = false;
let fadeTimer = null;

function updateDots() {
  dots.forEach((dot, i) => dot.classList.toggle("filled", i < pin.length));
}

function playSound(audio, volume = 0.58) {
  if (!soundEnabled || !audio) return;
  audio.currentTime = 0;
  audio.volume = volume;
  audio.play().catch(() => {});
}

function stopAllMusic() {
  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }
  musicTracks.forEach(audio => {
    audio.pause();
    audio.currentTime = 0;
  });
  currentMusic = null;
  audioStarted = false;
  musicButton.classList.remove("playing");
}

async function switchMusic(next) {
  if (!soundEnabled || !next) return;
  if (currentMusic === next && audioStarted) return;

  if (fadeTimer) {
    clearInterval(fadeTimer);
    fadeTimer = null;
  }

  musicTracks.forEach(audio => {
    if (audio !== next) {
      audio.pause();
      audio.currentTime = 0;
    }
  });

  currentMusic = next;
  next.currentTime = 0;
  next.volume = 0;

  try {
    await next.play();
    audioStarted = true;
    musicButton.classList.add("playing");

    let volume = 0;
    fadeTimer = setInterval(() => {
      volume += 0.06;
      next.volume = Math.min(0.34, volume);
      if (volume >= 0.34) {
        clearInterval(fadeTimer);
        fadeTimer = null;
      }
    }, 50);
  } catch (err) {
    audioStarted = false;
    musicButton.classList.remove("playing");
  }
}

function showScreen(id) {
  screens.forEach(screen => screen.classList.toggle("active", screen.id === id));

  if (id === "screen-passcode") {
    switchMusic(passcodeMusic);
  } else if (id === "screen-question" || id === "screen-no") {
    switchMusic(friendMusic);
  } else if (id === "screen-birthday") {
    switchMusic(birthdayMusic);
    playSound(revealSound, 0.65);
    launchConfetti(65);
  } else if (id === "screen-final") {
    switchMusic(finalMusic);
    playSound(celebrationSound, 0.7);
    launchConfetti(130);
  } else {
    switchMusic(friendMusic);
  }

  addScreenSparkles();
}

function startPasscodeMusic() {
  switchMusic(passcodeMusic);
}

function toggleSound() {
  soundEnabled = !soundEnabled;

  if (!soundEnabled) {
    stopAllMusic();
    [revealSound, celebrationSound].forEach(audio => {
      audio.pause();
      audio.currentTime = 0;
    });
    return;
  }

  const active = document.querySelector(".screen.active");
  if (!active) return;
  showScreen(active.id);
}

function addPin(number) {
  if (pin.length >= 4) return;
  pin += String(number);
  error.textContent = "";
  updateDots();

  if (pin.length === 4) {
    setTimeout(checkPin, 130);
  }
}

function clearPin() {
  pin = "";
  error.textContent = "";
  updateDots();
}

function deletePin() {
  pin = pin.slice(0, -1);
  error.textContent = "";
  updateDots();
}

function checkPin() {
  if (pin.length !== 4) {
    error.textContent = "Enter all 4 numbers.";
    return;
  }

  if (pin === SECRET_PASSCODE) {
    error.textContent = "Unlocked.";
    startPasscodeMusic();
    setTimeout(() => showScreen("screen-question"), 320);
  } else {
    error.textContent = "That is not it. Try again.";
    const card = document.querySelector(".passcode-card");
    card.classList.remove("shake");
    void card.offsetWidth;
    card.classList.add("shake");
    pin = "";
    updateDots();
  }
}

function launchConfetti(amount) {
  if (!confetti) return;
  const colors = ["#f39a35", "#ffc36f", "#6ec77b", "#a6e0ab", "#fff9ee"];

  for (let i = 0; i < amount; i++) {
    const piece = document.createElement("span");
    piece.className = "confetti-piece";
    piece.style.left = Math.random() * 100 + "%";
    piece.style.background = colors[Math.floor(Math.random() * colors.length)];
    piece.style.animationDuration = 2.2 + Math.random() * 2.5 + "s";
    piece.style.animationDelay = Math.random() * 0.7 + "s";
    piece.style.transform = `rotate(${Math.random() * 90}deg)`;
    confetti.appendChild(piece);
    setTimeout(() => piece.remove(), 5600);
  }
}

function createFloating() {
  if (!floating) return;
  const symbols = ["✦", "·", "✧", "•"];
  for (let i = 0; i < 28; i++) {
    const span = document.createElement("span");
    span.className = "float-dot";
    span.textContent = symbols[Math.floor(Math.random() * symbols.length)];
    span.style.left = Math.random() * 100 + "%";
    span.style.fontSize = 10 + Math.random() * 14 + "px";
    span.style.animationDuration = 7 + Math.random() * 8 + "s";
    span.style.animationDelay = -Math.random() * 12 + "s";
    floating.appendChild(span);
  }
}

function replay() {
  stopAllMusic();
  clearPin();
  showScreen("screen-passcode");
}

function addScreenSparkles() {
  const card = document.querySelector(".screen.active .card");
  if (!card) return;

  card.querySelectorAll(".micro-spark").forEach(item => item.remove());
  for (let i = 0; i < 7; i++) {
    const spark = document.createElement("span");
    spark.className = "micro-spark";
    spark.textContent = "✦";
    spark.style.left = 8 + Math.random() * 84 + "%";
    spark.style.top = 5 + Math.random() * 88 + "%";
    spark.style.animationDelay = Math.random() * 1.8 + "s";
    card.appendChild(spark);
  }
}

document.querySelectorAll("[data-number]").forEach(button => {
  button.addEventListener("click", () => addPin(button.dataset.number));
});

document.getElementById("clearPin").addEventListener("click", clearPin);
document.getElementById("deletePin").addEventListener("click", deletePin);
document.getElementById("unlockButton").addEventListener("click", checkPin);

document.getElementById("showSurpriseButton").addEventListener("click", () => {
  showScreen("screen-birthday");
});

document.getElementById("noButton").addEventListener("click", () => showScreen("screen-no"));
document.getElementById("tryAgainButton").addEventListener("click", () => showScreen("screen-question"));
document.getElementById("replayButton").addEventListener("click", replay);
musicButton.addEventListener("click", toggleSound);

document.querySelectorAll("[data-next]").forEach(button => {
  button.addEventListener("click", () => showScreen(button.dataset.next));
});

document.querySelectorAll(".final-choice").forEach(button => {
  button.addEventListener("click", () => showScreen("screen-final"));
});

document.addEventListener("keydown", event => {
  if (!document.getElementById("screen-passcode").classList.contains("active")) return;
  if (/^\d$/.test(event.key)) addPin(event.key);
  if (event.key === "Backspace") deletePin();
  if (event.key === "Escape") clearPin();
  if (event.key === "Enter") checkPin();
});

createFloating();
updateDots();
showScreen("screen-passcode");
