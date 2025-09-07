let habits = JSON.parse(localStorage.getItem("habits")) || [];
let xp = parseInt(localStorage.getItem("xp") || "0");
let level = parseInt(localStorage.getItem("level") || "1");

const habitList = document.getElementById("habitList");
const habitInput = document.getElementById("habitInput");
const addHabitBtn = document.getElementById("addHabitBtn");
const xpFill = document.getElementById("xpFill");
const levelInfo = document.getElementById("levelInfo");
const message = document.getElementById("message");

function updateXPBar() {
  let xpForNext = level * 100;
  let percent = (xp / xpForNext) * 100;
  xpFill.style.width = percent + "%";
  levelInfo.textContent = `Level ${level} — XP: ${xp}/${xpForNext}`;
}

function renderHabits() {
  habitList.innerHTML = "";
  habits.forEach((h, i) => {
    const card = document.createElement("div");
    card.className = "habit-card" + (h.done ? " completed" : "");
    card.innerHTML = `
      <span>${h.name} ${h.streak > 0 ? "🔥" + h.streak : ""}</span>
      <button data-index="${i}">${h.done ? "Undo" : "Done"}</button>
    `;
    habitList.appendChild(card);
  });
  updateXPBar();
  localStorage.setItem("habits", JSON.stringify(habits));
  localStorage.setItem("xp", xp);
  localStorage.setItem("level", level);
}

function addHabit() {
  const name = habitInput.value.trim();
  if (!name) return;
  habits.push({ name, done: false, streak: 0 });
  habitInput.value = "";
  renderHabits();
}

function toggleHabit(index) {
  const h = habits[index];
  if (!h.done) {
    h.done = true;
    h.streak += 1;
    xp += 10;
    if (xp >= level * 100) {
      xp = xp - level * 100;
      level++;
      showMessage(`🎉 Level Up! You reached Level ${level}!`);
    } else {
      showMessage(`+10 XP for completing "${h.name}"!`);
    }
  } else {
    h.done = false;
    h.streak = Math.max(0, h.streak - 1);
  }
  renderHabits();
}

function showMessage(text) {
  message.textContent = text;
  setTimeout(() => (message.textContent = ""), 3000);
}

addHabitBtn.addEventListener("click", addHabit);
habitList.addEventListener("click", (e) => {
  if (e.target.tagName === "BUTTON") {
    const index = e.target.getAttribute("data-index");
    toggleHabit(index);
  }
});

renderHabits();
updateXPBar();

