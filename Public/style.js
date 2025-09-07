let habits = [];
let xp = 0;
let level = 1;

const form = document.getElementById('habitForm');
const input = document.getElementById('habitInput');
const list = document.getElementById('habitList');
const xpFill = document.getElementById('xpFill');
const levelText = document.getElementById('levelText');

form.addEventListener('submit', (e) => {
  e.preventDefault();
  const habit = input.value.trim();
  if (habit) {
    habits.push({ text: habit, done: false });
    input.value = '';
    render();
  }
});

function toggleHabit(index) {
  habits[index].done = !habits[index].done;
  if (habits[index].done) {
    xp += 10;
    if (xp >= level * 50) {
      level++;
    }
  } else {
    xp -= 10;
    if (xp < 0) xp = 0;
  }
  render();
}

function render() {
  list.innerHTML = '';
  habits.forEach((h, i) => {
    const li = document.createElement('li');
    li.innerHTML = `<span>${h.text}</span> <button onclick="toggleHabit(${i})">${h.done ? 'Undo' : 'Done'}</button>`;
    list.appendChild(li);
  });
  const xpPercent = (xp % (level * 50)) / (level * 50) * 100;
  xpFill.style.width = xpPercent + '%';
  levelText.textContent = `Level ${level} — XP: ${xp}`;
}

render();
