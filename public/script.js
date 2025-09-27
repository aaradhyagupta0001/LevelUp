// === Achievements/Badges ===
const BADGES = [
  { id: 'xp100', label: '100 XP', icon: '🏅', desc: 'Earn 100 XP', check: () => xp >= 100 },
  { id: 'xp500', label: '500 XP', icon: '🥈', desc: 'Earn 500 XP', check: () => xp >= 500 },
  { id: 'streak3', label: '3 Day Streak', icon: '🔥', desc: '3 days streak', check: () => loadStreak() >= 3 },
  { id: 'streak7', label: '7 Day Streak', icon: '🌟', desc: '7 days streak', check: () => loadStreak() >= 7 },
];

function getUnlockedBadges() {
  return JSON.parse(localStorage.getItem('badges') || '[]');
}

function unlockBadge(id) {
  let unlocked = getUnlockedBadges();
  if (!unlocked.includes(id)) {
    unlocked.push(id);
    localStorage.setItem('badges', JSON.stringify(unlocked));
    showBadgePopup(id);
  }
}

function showBadges() {
  const unlocked = getUnlockedBadges();
  const badgesDiv = document.getElementById('badges-container');
  if (!badgesDiv) return;
  badgesDiv.innerHTML = BADGES.map(b => unlocked.includes(b.id) ? `<span title="${b.desc}" style="font-size:2em;">${b.icon}</span>` : '').join('');
}

function checkAchievements() {
  BADGES.forEach(b => { if (b.check()) unlockBadge(b.id); });
  showBadges();
}

function showBadgePopup(id) {
  const badge = BADGES.find(b => b.id === id);
  if (!badge) return;
  const div = document.createElement('div');
  div.className = 'achievement';
  div.innerHTML = `<span style="font-size:2em;">${badge.icon}</span> <b>${badge.label}</b> unlocked!`;
  document.getElementById('achievement-container').appendChild(div);
  setTimeout(()=>div.remove(),2200);
}

// Show badges on page load
document.addEventListener('DOMContentLoaded', showBadges);
// === Streak Tracker ===
function getTodayDateStr() {
  const d = new Date();
  return d.getFullYear() + '-' + (d.getMonth()+1) + '-' + d.getDate();
}

function loadStreak() {
  let streak = parseInt(localStorage.getItem('streak') || '0');
  let lastDate = localStorage.getItem('streakLastDate') || '';
  const today = getTodayDateStr();
  if (lastDate !== today) {
    // If lastDate is yesterday, increment streak, else reset
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const ystr = yesterday.getFullYear() + '-' + (yesterday.getMonth()+1) + '-' + yesterday.getDate();
    if (lastDate === ystr) {
      streak++;
    } else {
      streak = 1;
    }
    localStorage.setItem('streak', streak);
    localStorage.setItem('streakLastDate', today);
  }
  return streak;
}

function showStreak() {
  const streak = loadStreak();
  const streakDiv = document.getElementById('streak-container');
  if (streakDiv) {
    streakDiv.innerHTML = `🔥 Daily Streak: <span style="color:#ff0;font-size:1.3em;">${streak}</span> day${streak>1?'s':''}`;
  }
}

// Call on page load
document.addEventListener('DOMContentLoaded', showStreak);

// Optionally, call showStreak() after any XP-earning action for real-time update
const sidebarButtons=document.querySelectorAll('.sidebar button');
const mainContent=document.querySelector('.main-content');
sidebarButtons.forEach(btn=>{ btn.addEventListener('click',()=>{ showTab(btn.dataset.tab); setXPBarAlignment(btn.dataset.tab); }); });

// XP bar alignment logic
function setXPBarAlignment(tab) {
  if (!mainContent) return;
  if (tab === 'login') {
    mainContent.classList.add('center-xp-bar');
  } else {
    mainContent.classList.remove('center-xp-bar');
  }
}

// Set initial alignment (default to login/signup)
setXPBarAlignment('login');

let xp=0;
function addXP(amount){
  xp+=amount;
  const xpFill=document.getElementById('xpFill');
  if(xpFill) xpFill.style.width=Math.min(xp,100)+'%';
  spawnParticles(10);
  showFloatingXP(amount);
  showStreak();
  checkAchievements();
  updateMiniXPBar();
  syncUserProgress(); // Sync XP change
}
function showFloatingXP(amount){ const div=document.createElement('div'); div.className='floating-xp'; div.textContent='+'+amount+' XP'; div.style.left=(Math.random()*window.innerWidth*0.8)+'px'; div.style.top=(window.innerHeight*0.7 + Math.random()*50)+'px'; document.body.appendChild(div); setTimeout(()=>div.remove(),1000); }
function spawnParticles(count){ const container=document.getElementById('particle-container'); for(let i=0;i<count;i++){ const p=document.createElement('div'); p.style.position='absolute'; p.style.width='6px'; p.style.height='6px'; p.style.background='radial-gradient(#0ff,#f0f,#ff0)'; p.style.borderRadius='50%'; p.style.left=Math.random()*window.innerWidth+'px'; p.style.top=Math.random()*window.innerHeight+'px'; p.style.opacity=1; container.appendChild(p); let dx=(Math.random()-0.5)*10; let dy=(Math.random()-0.5)*10; const animate=setInterval(()=>{ const top=parseFloat(p.style.top); const left=parseFloat(p.style.left); p.style.top=top+dy+'px'; p.style.left=left+dx+'px'; p.style.opacity-=0.02; if(p.style.opacity<=0){ p.remove(); clearInterval(animate); } },30); } }
function showAchievement(text){ const div=document.createElement('div'); div.className='achievement'; div.textContent=text; document.getElementById('achievement-container').appendChild(div); setTimeout(()=>div.remove(),2000); }

// Helper: Load user profile from backend
async function loadUserProfile() {
  try {
    const res = await fetch('/api/profile');
    if (!res.ok) return null;
    const data = await res.json();
    if (data.username) {
      window.currentUser = data;
      xp = data.xp || 0;
      // Optionally: streak, avatar, goals, etc.
      return data;
    }
  } catch (e) {}
  return null;
}
// Helper: Save user profile to backend
async function saveUserProfile(updates) {
  try {
    await fetch('/api/profile', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates)
    });
  } catch (e) {}
}

// Update XP, streak, goals to backend after any change
async function syncUserProgress() {
  if(window.currentUser){
    await saveUserProfile({ xp, streak: loadStreak() });
  }
}

function showTab(tab){
  if(tab==='profile'){
    let uname = (window.currentUser && window.currentUser.username) || localStorage.getItem('profileName') || 'You';
    let avatar = (window.currentUser && window.currentUser.avatar) || localStorage.getItem('profileAvatar') || '🧑';
    mainContent.innerHTML+=
      `<h1>Profile</h1>
      <div style="margin:18px auto 12px auto;text-align:center;">
        <span id="profileAvatar" style="font-size:3em;cursor:pointer;">${avatar}</span>
      </div>
      <div style="margin:8px auto;text-align:center;">
        <input id="profileNameInput" type="text" value="${uname}" maxlength="12" style="font-size:1.1em;padding:6px 12px;border-radius:8px;border:none;">
        <button id="saveProfileBtn" style="margin-left:8px;">Save</button>
      </div>
      <div style="margin:8px auto;text-align:center;font-size:0.98em;color:#aaa;">Click avatar to change emoji</div>`;
    document.getElementById('profileAvatar').addEventListener('click',()=>{
      let emoji = prompt('Enter an emoji for your avatar:', avatar);
      if(emoji && emoji.length<=2){ document.getElementById('profileAvatar').textContent=emoji; }
    });
    document.getElementById('saveProfileBtn').addEventListener('click',async ()=>{
      let newName = document.getElementById('profileNameInput').value.trim() || 'You';
      let newAvatar = document.getElementById('profileAvatar').textContent;
      // Save to backend if logged in
      if(window.currentUser){
        await saveUserProfile({ avatar: newAvatar });
        window.currentUser.avatar = newAvatar;
        window.currentUser.username = newName;
        alert('Profile saved to server!');
      } else {
        localStorage.setItem('profileName', newName);
        localStorage.setItem('profileAvatar', newAvatar);
        alert('Profile saved locally!');
      }
    });
    return;
  }
  if(tab==='leaderboard'){
    let uname = (window.currentUser && window.currentUser.username) || localStorage.getItem('profileName') || 'You';
    let avatar = (window.currentUser && window.currentUser.avatar) || localStorage.getItem('profileAvatar') || '🧑';
    mainContent.innerHTML+=
      `<h1>Leaderboard</h1>
      <table style="margin:20px auto;width:100%;max-width:350px;background:rgba(0,0,0,0.18);border-radius:10px;box-shadow:0 2px 12px #00ffff33;">
        <thead><tr style="color:#0ff;"><th style="text-align:left;padding:8px;">Rank</th><th style="text-align:left;padding:8px;">User</th><th style="text-align:right;padding:8px;">XP</th></tr></thead>
        <tbody id="lbBody"></tbody>
      </table>`;
    let lb = [
      {name:uname, avatar:avatar, xp:xp},
      {name:'Alex', avatar:'👦', xp: 80},
      {name:'Sam', avatar:'👧', xp: 60},
      {name:'Riya', avatar:'🧕', xp: 40},
      {name:'Maya', avatar:'👩‍🎓', xp: 20}
    ];
    lb = lb.sort((a,b)=>b.xp-a.xp).slice(0,5);
    const lbBody = document.getElementById('lbBody');
    lb.forEach((u,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td style="padding:8px;">${i+1}</td><td style="padding:8px;"><span style="font-size:1.3em;">${u.avatar||'🧑'}</span> ${u.name}</td><td style="padding:8px;text-align:right;">${u.xp}</td>`;
      if(u.name===uname) tr.style.color='#ff0';
      lbBody.appendChild(tr);
    });
    return;
  }
  mainContent.innerHTML='';
  // Add mini progress bar at the top of every tab
  const miniXP = document.createElement('div');
  miniXP.className = 'mini-xp-section';
  miniXP.innerHTML = `
    <span class="mini-xp-label">Your Progress</span>
    <div class="mini-xp-bar"><div class="mini-xp-fill" id="miniXPFill"></div></div>
    <span class="mini-xp-percent" id="miniXPPercent"></span>
  `;
  mainContent.appendChild(miniXP);
  updateMiniXPBar();
  if(tab==='login'){
    mainContent.innerHTML+=
      `<h1>Login / SignUp</h1>
      <input type="text" placeholder="Username" id="username"><br><br>
      <input type="password" placeholder="Password" id="password"><br><br>
      <button id="loginBtn">Login</button>
      <button id="signupBtn">Sign Up</button>
      <p id="loginMsg"></p>`;
    async function handleAuth(type) {
      const username = document.getElementById('username').value.trim();
      const password = document.getElementById('password').value;
      if (!username || !password) {
        document.getElementById('loginMsg').textContent = 'Please enter username and password.';
        return;
      }
      document.getElementById('loginMsg').textContent = 'Please wait...';
      try {
        const res = await fetch(`/api/${type}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password })
        });
        const data = await res.json();
        if (data.success) {
          window.currentUser = data.user;
          xp = data.user.xp || 0;
          // Optionally: streak, avatar, goals, etc.
          document.getElementById('loginMsg').textContent = (type==='login' ? 'Logged in! 🎉' : 'Signed Up! 🚀');
          showAchievement(type==='login' ? 'Welcome! 🎊' : 'Account Created! 🎉');
          loadUserProfile(); // Load user data
        } else {
          document.getElementById('loginMsg').textContent = data.error || 'Error.';
        }
      } catch (e) {
        document.getElementById('loginMsg').textContent = 'Server error.';
      }
    }
    document.getElementById('loginBtn').addEventListener('click',()=>handleAuth('login'));
    document.getElementById('signupBtn').addEventListener('click',()=>handleAuth('register'));
  }
  else if(tab==='walk'){
    mainContent.innerHTML+=
      `<h1>Walk Steps Tracker</h1>
      <p>Daily Steps Goal: 10,000</p>
      <input type="number" id="stepsInput" placeholder="Enter steps walked today">
      <button id="addStepsBtn">Add Steps</button>
      <p id="stepsMsg"></p>`;
    let totalSteps=0;
    document.getElementById('addStepsBtn').addEventListener('click',()=>{
      let steps=parseInt(document.getElementById('stepsInput').value)||0;
      totalSteps+=steps;
      document.getElementById('stepsMsg').textContent='Total Steps: '+totalSteps;
      addXP(Math.floor(steps/1000));
      showAchievement('Walked '+steps+' steps!');
    });
  }
  else if(tab==='goals'){
    mainContent.innerHTML+=
      `<h1>Goals</h1>
      <input type="text" id="goalInput" placeholder="Enter new goal">
      <button id="addGoalBtn">Add Goal</button>
      <ul id="goalList"></ul>`;
    const goalList=document.getElementById('goalList');
    document.getElementById('addGoalBtn').addEventListener('click',()=>{
      let goal=document.getElementById('goalInput').value;
      if(goal){ let li=document.createElement('li'); li.textContent=goal; goalList.appendChild(li); document.getElementById('goalInput').value=''; addXP(5); showAchievement('New Goal Added!'); }
    });
  }
  else if(tab==='exercise'){
    mainContent.innerHTML+=
      `<h1>Exercise Tracker</h1>
      <input type="text" id="exerciseInput" placeholder="Enter exercise">
      <button id="addExerciseBtn">Add Exercise</button>
      <ul id="exerciseList"></ul>`;
    const exerciseList=document.getElementById('exerciseList');
    document.getElementById('addExerciseBtn').addEventListener('click',()=>{
      let ex=document.getElementById('exerciseInput').value;
      if(ex){ let li=document.createElement('li'); li.textContent=ex; exerciseList.appendChild(li); document.getElementById('exerciseInput').value=''; addXP(5); showAchievement('Exercise Added!'); }
    });
  }
}

// Update mini XP bar (called on tab change and XP update)
function updateMiniXPBar() {
  const fill = document.getElementById('miniXPFill');
  const percent = document.getElementById('miniXPPercent');
  if (fill && percent) {
    let pct = Math.min(xp, 100);
    fill.style.width = pct + '%';
    percent.textContent = pct + '%';
  }
}
