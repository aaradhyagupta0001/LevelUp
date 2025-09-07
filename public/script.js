// ===== Tab Switching =====
const sidebarButtons = document.querySelectorAll('.sidebar button');
const mainContent = document.querySelector('.main-content');

sidebarButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    const tab = btn.dataset.tab;
    showTab(tab);
  });
});

// ===== XP & Habit Logic =====
let xp = 0;
function addXP(amount) {
  xp += amount;
  const xpFill = document.getElementById('xpFill');
  if(xpFill) xpFill.style.width = Math.min(xp,100) + '%';
  spawnParticles(10);
}

// ===== Particle Effect =====
function spawnParticles(count) {
  const container = document.getElementById('particle-container');
  for(let i=0;i<count;i++){
    const particle = document.createElement('div');
    particle.className = 'particle';
    particle.style.position='absolute';
    particle.style.width='6px';
    particle.style.height='6px';
    particle.style.background='radial-gradient(#0ff,#f0f,#ff0)';
    particle.style.borderRadius='50%';
    particle.style.left = Math.random()*window.innerWidth+'px';
    particle.style.top = Math.random()*window.innerHeight+'px';
    particle.style.opacity=1;
    container.appendChild(particle);

    let dx=(Math.random()-0.5)*10;
    let dy=(Math.random()-0.5)*10;
    const animate = setInterval(()=>{
      const top=parseFloat(particle.style.top);
      const left=parseFloat(particle.style.left);
      particle.style.top=top+dy+'px';
      particle.style.left=left+dx+'px';
      particle.style.opacity-=0.02;
      if(particle.style.opacity<=0){
        particle.remove();
        clearInterval(animate);
      }
    },30);
  }
}

// ===== Dynamic Tab Content =====
function showTab(tab){
  mainContent.innerHTML=''; // clear previous content

  if(tab==='login'){
    mainContent.innerHTML=`
      <h1>Login / SignUp</h1>
      <input type="text" placeholder="Username" id="username"><br><br>
      <input type="password" placeholder="Password" id="password"><br><br>
      <button id="loginBtn">Login</button>
      <button id="signupBtn">Sign Up</button>
      <p id="loginMsg"></p>
    `;
    document.getElementById('loginBtn').addEventListener('click',()=>{
      document.getElementById('loginMsg').textContent='Logged in! 🎉';
      addXP(10);
    });
    document.getElementById('signupBtn').addEventListener('click',()=>{
      document.getElementById('loginMsg').textContent='Signed Up! 🚀';
      addXP(10);
    });
  }

  else if(tab==='walk'){
    mainContent.innerHTML=`
      <h1>Walk Steps Tracker</h1>
      <p>Daily Steps Goal: 10,000</p>
      <input type="number" id="stepsInput" placeholder="Enter steps walked today">
      <button id="addStepsBtn">Add Steps</button>
      <p id="stepsMsg"></p>
      <div class="xp-bar"><div id="xpFill"></div></div>
    `;
    let totalSteps=0;
    document.getElementById('addStepsBtn').addEventListener('click',()=>{
      const steps=parseInt(document.getElementById('stepsInput').value);
      if(!isNaN(steps)){
        totalSteps+=steps;
        document.getElementById('stepsMsg').textContent=`Total Steps: ${totalSteps}`;
        addXP(Math.min(steps/100,50));
        if(totalSteps>=10000) document.getElementById('stepsMsg').textContent+=' 🎯 Goal Achieved!';
      }
    });
  }

  else if(tab
