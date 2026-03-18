const lines = [
  "[  OK  ] Initializing system",
  "[  OK  ] Loading modules",
  "[  OK  ] Starting services",
  "[  OK  ] Connecting DB",
  "[  OK  ] Rendering UI",
  "[ DONE ] Portfolio Ready",
  "ajith@portfolio:~$ system ready ✔"
];

let bootText;
let progressBar;
let progressText;

let lineIndex = 0;
let charIndex = 0;
let progress = 0;

function updateProgress() {
  if (!progressBar || !progressText) return;
  progress = Math.min(100, progress + Math.random() * 10);
  progressBar.style.width = progress + "%";
  progressText.innerText = Math.floor(progress) + "%";
}

function typeLine() {
  if (!bootText) return;

  if (lineIndex >= lines.length) {
    if (progressBar) progressBar.style.width = "100%";
    if (progressText) progressText.innerText = "100%";
    setTimeout(endBoot, 800);
    return;
  }
  const currentLine = lines[lineIndex];

  if (charIndex < currentLine.length) {
    bootText.innerHTML += currentLine.charAt(charIndex);
    charIndex++;
    setTimeout(typeLine, 10);
  } else {
    bootText.innerHTML += "\n";
    lineIndex++;
    charIndex = 0;

    updateProgress(); // update progress per line
    setTimeout(typeLine, 200);
  }
}

function endBoot() {
  const loader = document.getElementById("boot-loader");
  loader.style.opacity = "0";

  setTimeout(() => {
    loader.style.display = "none";
    document.body.style.overflow = "auto";
  }, 500);
}

function init() {
  bootText = document.getElementById("boot-text");
  progressBar = document.getElementById("progress-bar");
  progressText = document.getElementById("progress-text");

  if (!bootText || !progressBar || !progressText) {
    // If DOM elements are missing, skip the animation to avoid errors.
    return;
  }

  typeLine();
  setTimeout(() => {
    window.location.href = "./scroll-index.html";
  }, 3500);
}

window.addEventListener("DOMContentLoaded", init);
