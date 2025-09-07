const sidebarButtons=document.querySelectorAll('.sidebar button');
const mainContent=document.querySelector('.main-content');
sidebarButtons.forEach(btn=>{ btn.addEventListener('click',()=>{ showTab(btn.dataset.tab); }); });

let xp=0;
function addXP(amount){ xp+=amount; const xpFill=document.getElementById('xpFill'); if(xpFill) xpFill.style.width=Math.min(xp,100)+'%'; spawnParticles(10); showFloatingXP(amount); }
function showFloatingXP(amount){ const div=document.createElement('div'); div.className='floating-xp'; div.textContent='+'+amount+' XP'; div.style.left=(Math.random()*window.innerWidth*0.8)+'px'; div.style.top=(window.innerHeight*0.7 + Math.random()*50)+'px'; document.body.appendChild(div); setTimeout(()=>div.remove(),1000); }
function spawnParticles(count){ const container=document.getElementById('particle-container'); for(let i=0;i<count;i++){ const p=document.createElement('div'); p.style.position='absolute'; p.style.width='6px'; p.style.height='6px'; p.style.background='radial-gradient(#0ff,#f0f,#ff0)'; p.style.borderRadius='50%'; p.style.left=Math.random()*window.innerWidth+'px'; p.style.top=Math.random()*window.innerHeight+'px'; p.style.opacity=1; container.appendChild(p); let dx=(Math.random()-0.5)*10; let dy=(Math.random()-0.5)*10; const animate=setInterval(()=>{ const top=parseFloat(p.style.top); const left=parseFloat(p.style.left); p.style.top=top+dy+'px'; p.style.left=left+dx+'px'; p.style.opacity-=0.02; if(p.style.opacity<=0){ p.remove(); clearInterval(animate); } },30); } }
function showAchievement(text){ const div=document.createElement('div'); div.className='achievement'; div.textContent=text; document.getElementById('achievement-container').appendChild(div); setTimeout(()=>div.remove(),2000); }

function showTab(tab){
  mainContent.innerHTML='';
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
      document.getElementById('loginMsg').textContent='Logged in! 🎉'; addXP(10); showAchievement('Welcome! 🎊');
    });
    document.getElementById('signupBtn').addEventListener('click',()=>{
      document.getElementById('loginMsg').textContent='Signed Up! 🚀'; addXP(10); showAchievement('Account Created! 🎉');
    });
  }
  else if(tab==='walk'){
    mainContent.innerHTML=`
      <h1>Walk Steps Tracker</h1>
      <p>Daily Steps Goal: 10,000</p>
      <input type="number" id="stepsInput" placeholder="Enter steps walked today">
      <button id="addStepsBtn">Add Steps</button>
      <p id="stepsMsg"></p>
    `;
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
    mainContent.innerHTML=`
      <h1>Goals</h1>
      <input type="text" id="goalInput" placeholder="Enter new goal">
      <button id="addGoalBtn">Add Goal</button>
      <ul id="goalList"></ul>
    `;
    const goalList=document.getElementById('goalList');
    document.getElementById('addGoalBtn').addEventListener('click',()=>{
      let goal=document.getElementById('goalInput').value;
      if(goal){ let li=document.createElement('li'); li.textContent=goal; goalList.appendChild(li); document.getElementById('goalInput').value=''; addXP(5); showAchievement('New Goal Added!'); }
    });
  }
  else if(tab==='exercise'){
    mainContent.innerHTML=`
      <h1>Exercise Tracker</h1>
      <input type="text" id="exerciseInput" placeholder="Enter exercise">
      <button id="addExerciseBtn">Add Exercise</button>
      <ul id="exerciseList"></ul>
    `;
    const exerciseList=document.getElementById('exerciseList');
    document.getElementById('addExerciseBtn').addEventListener('click',()=>{
      let ex=document.getElementById('exerciseInput').value;
      if(ex){ let li=document.createElement('li'); li.textContent=ex; exerciseList.appendChild(li); document.getElementById('exerciseInput').value=''; addXP(5); showAchievement('Exercise Added!'); }
    });
  }
}
