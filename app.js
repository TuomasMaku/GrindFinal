/* ── STORAGE ── */
const store = {
  _m:{},
  get(k,d){ try{const v=localStorage.getItem(k);return v!==null?JSON.parse(v):d;}catch{return this._m[k]!==undefined?this._m[k]:d;} },
  set(k,v){ try{localStorage.setItem(k,JSON.stringify(v));}catch{} this._m[k]=v; }
};

const makeRankBadge = (label, bg, fg = "#000") => {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="18" fill="${bg}"/>
      <rect x="8" y="8" width="84" height="84" rx="14" fill="none" stroke="rgba(0,0,0,0.25)" stroke-width="4"/>
      <text x="50" y="60" text-anchor="middle" font-size="42" font-weight="900" font-family="Arial, sans-serif" fill="${fg}">${label}</text>
    </svg>
  `.trim();
  return "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(svg);
};

const RANK_IMGS = [
  makeRankBadge("R", "#a8ff78"),
  makeRankBadge("S", "#e8ff47"),
  makeRankBadge("W", "#ff6b35"),
  makeRankBadge("B", "#47c8ff"),
  makeRankBadge("M", "#ff47a3", "#fff"),
];

const todayStr = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const yesterdayStr = () => {
  const d = new Date(); d.setDate(d.getDate()-1);
  return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
};
const setTxt = (id,val) => { const el=document.getElementById(id); if(el) el.textContent=val; };
const setHTML = (id,val) => { const el=document.getElementById(id); if(el) el.innerHTML=val; };
const setW = (id,val) => { const el=document.getElementById(id); if(el) el.style.width=val; };

/* ── TAB ── */
function switchTab(name){
  document.querySelectorAll('.tab-content').forEach(t=>t.classList.remove('active'));
  document.querySelectorAll('.nav-btn').forEach(b=>b.classList.remove('active'));
  document.getElementById('tab-'+name).classList.add('active');
  document.getElementById('btn-'+name).classList.add('active');
  store.set('lastTab', name);
  if(name==='home') updateHome();
  if(name==='stats') renderStats();
  if(name==='run') renderRunTab();
}

/* ── DATA ── */
const days = [
  {num:1,weekday:"Lundi",   type:"push",  title:"Push",        tags:["Vélo"],      duration:"75 min",   intensity:"Haute",
   sections:[
    {title:"Push — Haut du corps",exercises:[
      {name:"Développé couché barre",sets:"4 × 6–8"},{name:"Développé incliné haltères",sets:"3 × 10"},
      {name:"Élévations latérales",sets:"4 × 12–15"},{name:"Développé militaire",sets:"3 × 8–10"},
      {name:"Pushdown triceps câble",sets:"3 × 12"},{name:"Dips lestés",sets:"3 × max"},
    ]},
    {title:"Cardio — Vélo",exercises:[
      {name:"Échauffement",sets:"5 min facile"},{name:"Zone 2 continu",sets:"25–30 min"},{name:"Récupération",sets:"5 min"},
    ]},
   ],note:"Le vélo post-push est récupération active. Maintenir Z2."},

  {num:2,weekday:"Mardi",   type:"pull",  title:"Pull",        tags:["Run"],       duration:"70 min",   intensity:"Haute",
   sections:[
    {title:"Pull — Dos & Biceps",exercises:[
      {name:"Tractions lestées",sets:"4 × 6–8"},{name:"Rowing barre",sets:"4 × 8"},
      {name:"Tirage poitrine câble",sets:"3 × 10–12"},{name:"Face pull",sets:"3 × 15"},
      {name:"Curl barre",sets:"3 × 10"},{name:"Curl marteau",sets:"3 × 12"},
    ]},
    {title:"Run — 5 km",exercises:[
      {name:"Échauffement marche",sets:"3 min"},{name:"Run pace modérée",sets:"5 km"},{name:"Cool-down + étirements",sets:"5 min"},
    ]},
   ],note:"Run post-pull. Pace confortable, pas de perf."},

  {num:3,weekday:"Mercredi",type:"cardio",title:"Cardio léger", tags:["Core"],      duration:"50 min",   intensity:"Moyenne",
   sections:[
    {title:"Cardio léger",exercises:[
      {name:"Corde à sauter",sets:"3 × 3 min"},{name:"Escaliers / Stair climber",sets:"15 min Z2"},{name:"SkiErg ou Rameur",sets:"10 min Z2"},
    ]},
    {title:"Core — Gainage",exercises:[
      {name:"Planche frontale",sets:"4 × 45–60 sec"},{name:"Planche latérale",sets:"3 × 30 sec /côté"},
      {name:"Ab wheel rollout",sets:"3 × 10"},{name:"Leg raises suspendu",sets:"3 × 12–15"},{name:"Russian twist lesté",sets:"3 × 20"},
    ]},
   ],note:"Journée de décharge. Cardio basse intensité, core prioritaire."},

  {num:4,weekday:"Jeudi",   type:"legs",  title:"Jambes",      tags:[],            duration:"80 min",   intensity:"Très haute",
   sections:[
    {title:"Jambes — Force & Volume",exercises:[
      {name:"Squat barre",sets:"5 × 5"},{name:"Leg press",sets:"4 × 10–12"},
      {name:"Romanian deadlift",sets:"4 × 8–10"},{name:"Fentes marchées haltères",sets:"3 × 10 /jambe"},
      {name:"Leg curl allongé",sets:"3 × 12"},{name:"Mollets debout",sets:"4 × 15–20"},
    ]},
   ],note:"Séance la plus lourde. Montée progressive avant les 5×5."},

  {num:5,weekday:"Vendredi",type:"push",  title:"Push",        tags:["Vélo"],      duration:"75 min",   intensity:"Haute",
   sections:[
    {title:"Push — Variation",exercises:[
      {name:"Développé couché haltères",sets:"4 × 10"},{name:"Écarté câble incliné",sets:"3 × 12"},
      {name:"Développé Arnold",sets:"4 × 10"},{name:"Élévations frontales",sets:"3 × 12"},
      {name:"Extension triceps overhead",sets:"3 × 12"},{name:"Pompes lestées",sets:"3 × max"},
    ]},
    {title:"Cardio — Vélo",exercises:[{name:"Zone 2 continu",sets:"30 min"}]},
   ],note:"Push variation du J1 — préférer haltères. Vélo Z2."},

  {num:6,weekday:"Samedi",  type:"pull",  title:"Pull",        tags:["Vélo"],      duration:"70 min",   intensity:"Haute",
   sections:[
    {title:"Pull — Variation",exercises:[
      {name:"Tractions prise neutre",sets:"4 × 8"},{name:"Rowing unilatéral haltère",sets:"4 × 10/côté"},
      {name:"Tirage horizontal câble",sets:"3 × 12"},{name:"Shrugs haltères",sets:"3 × 15"},
      {name:"Curl incliné haltères",sets:"3 × 12"},{name:"Curl concentré",sets:"3 × 12"},
    ]},
    {title:"Cardio — Vélo",exercises:[{name:"Zone 2 continu",sets:"25 min"}]},
   ],note:"Gérer la fatigue accumulée. Vélo facultatif si jambes lourdes."},

  {num:7,weekday:"Dimanche",type:"run",   title:"Run long",    tags:[],            duration:"60–75 min",intensity:"Moyenne",
   sections:[
    {title:"Endurance — Run long",exercises:[
      {name:"Échauffement marche/trot",sets:"5 min"},{name:"Run continu Z2",sets:"45–60 min"},
      {name:"Cool-down marche",sets:"5 min"},{name:"Étirements dynamiques",sets:"10 min"},
    ]},
   ],note:"Allure conversationnelle. Distance secondaire, durée principale."},

  {num:8,weekday:"Lundi",   type:"rest",  title:"Repos complet",tags:["Étirements"],duration:"20–30 min",intensity:"Faible",
   sections:[
    {title:"Récupération — Mobilité",exercises:[
      {name:"Hip flexors / pigeon",sets:"2 min /côté"},{name:"Ischio debout",sets:"2 min /jambe"},
      {name:"Thoracique foam roller",sets:"5 min"},{name:"Pecs contre mur",sets:"2 × 60 sec"},
      {name:"Rotation cervicales lentes",sets:"2 min"},
    ]},
   ],note:"Zéro intensité. Qualité de récupération = qualité du prochain cycle."},
];

const challenges = [
  {icon:"💪",name:"Pompes",       detail:"Prise large — poitrine au sol",         target:100,step:10,color:"orange"},
  {icon:"🦵",name:"Squats",       detail:"Sous les 90°, talon au sol, tempo lent", target:100,step:10,color:"accent"},
  {icon:"🔥",name:"Fentes",       detail:"Alternées — genou arrière proche du sol",target:60, step:10,color:"green"},
  {icon:"⚡",name:"Abdos",        detail:"Crunchs ou relevé de jambes",            target:60, step:10,color:"blue"},
  {icon:"🎯",name:"Gainage (sec)",detail:"Planche — corps droit, respire",         target:180,step:30,color:"pink"},
];

const CH_COLORS = ["var(--orange)","var(--accent)","var(--green)","var(--blue)","var(--pink)"];
const CIRC = 94;
const totalTarget = challenges.reduce((a,c)=>a+c.target,0);

/* ── STATE ── */
let progState    = store.get('progState', {});
let cycleStart   = store.get('cycleStart', null);
let cycleOffset  = store.get('cycleOffset', 0);
let dailyState   = store.get('dailyState', {date:'', reps:challenges.map(()=>0)});
let streakData   = store.get('streakData', {count:0, lastDate:'', best:0});
let historyData  = store.get('historyData', []);
let hardcoreMode = store.get('hardcoreMode', false);
let rankState    = store.get('rankState', {lastRank:''});
let chargesData  = store.get('chargesData', {});
let sessionNotes = store.get('sessionNotes', {});
let dayConfirms  = store.get('dayConfirms', {});
let lastOpenDate = store.get('lastOpenDate', null);

/* ── RUN STATE ── */
let runHistory = store.get('runHistory', []); // [{date,dist,timeSeconds,pace,zone,note}]

if(dailyState.date !== todayStr()){
  if(hardcoreMode && dailyState.date && dailyState.reps.some(v=>v>0)){
    const wasComplete = dailyState.reps.every((r,i)=>r>=challenges[i].target);
    if(!wasComplete){
      setTimeout(()=>triggerHardcoreFail(), 600);
    }
  }
  if(dailyState.date && dailyState.reps.some(v=>v>0)){
    const prevDate = dailyState.date;
    const reps = [...dailyState.reps];
    const pct = Math.round(reps.reduce((a,v)=>a+v,0)/totalTarget*100);
    const done = reps.every((r,i)=>r>=challenges[i].target);
    const existing = historyData.find(d=>d.date===prevDate);
    if(!existing||(!existing.done && existing.pct<pct)){
      historyData = historyData.filter(d=>d.date!==prevDate);
      historyData.unshift({date:prevDate,reps,pct,done});
      if(historyData.length>90) historyData=historyData.slice(0,90);
      store.set('historyData',historyData);
    }
  }
  dailyState={date:todayStr(), reps:challenges.map(()=>0)};
  store.set('dailyState',dailyState);
}

/* ── HISTORY ── */
function saveToHistory(){
  const reps = [...dailyState.reps];
  const total = reps.reduce((a,v)=>a+v,0);
  if(total===0) return;
  const pct = Math.round(total/totalTarget*100);
  const done = reps.every((r,i)=>r>=challenges[i].target);
  const existing = historyData.find(d=>d.date===todayStr());
  if(existing && (existing.done || existing.pct >= pct)) return;
  const entry = {date:todayStr(), reps, pct, done};
  historyData = historyData.filter(d=>d.date!==entry.date);
  historyData.unshift(entry);
  if(historyData.length>90) historyData = historyData.slice(0,90);
  store.set('historyData', historyData);
}

/* ── CURRENT DAY ── */
function getCurDayIdx(){
  if(!cycleStart) return -1;
  const start = new Date(cycleStart);
  const today = new Date(todayStr());
  const diff = Math.floor((today - start) / 86400000) + cycleOffset;
  return diff<0 ? -1 : diff%8;
}

function getCurDayIdxForDate(dateStr){
  if(!cycleStart) return -1;
  const start = new Date(cycleStart);
  const target = new Date(dateStr);
  const diff = Math.floor((target - start) / 86400000) + cycleOffset;
  return diff<0 ? -1 : diff%8;
}

/* ── WEIGHT TRACKING ── */
let weightModalExName = '';
let weightModalKey    = '';

function renderWeightBadge(exName, badgeEl){
  const entries = chargesData[exName] || [];
  if(!entries.length){
    badgeEl.textContent='+kg';
    badgeEl.style.color='#444';
    badgeEl.style.background='transparent';
    badgeEl.style.borderColor='#2a2a2a';
    badgeEl.title='';
    return;
  }
  const last = entries[entries.length-1];
  badgeEl.textContent = last.kg + 'kg';
  badgeEl.style.color='';
  badgeEl.style.background='';
  badgeEl.style.borderColor='';
  badgeEl.title = entries.slice(-5).map(e=>`${e.date} · ${e.kg}kg × ${e.reps}`).join('\n');
}

function openWeightModal(exName, exSets, key){
  weightModalExName = exName;
  weightModalKey    = key;
  setTxt('weightModalTitle', exName);
  setTxt('weightModalSets', exSets);
  const entries = chargesData[exName] || [];
  const histEl  = document.getElementById('weightHistory');
  if(histEl){
    if(entries.length === 0){
      histEl.innerHTML = '<div class="weight-no-history">Aucune entrée — première fois 💪</div>';
    } else {
      histEl.innerHTML = entries.slice().reverse().slice(0,5).map(e=>`
        <div class="weight-hist-row">
          <span class="wh-date">${e.date}</span>
          <span class="wh-val">${e.kg}<span class="wh-unit">kg</span> × ${e.reps}<span class="wh-unit">reps</span></span>
        </div>`).join('');
    }
  }
  const kgInput   = document.getElementById('weightKg');
  const repsInput = document.getElementById('weightReps');
  if(entries.length){
    const last = entries[entries.length-1];
    if(kgInput)   kgInput.value   = last.kg;
    if(repsInput) repsInput.value = last.reps;
  } else {
    if(kgInput)   kgInput.value   = '';
    if(repsInput) repsInput.value = '';
  }
  const modal = document.getElementById('weightModal');
  if(modal) modal.classList.add('show');
  setTimeout(()=>{ if(kgInput) kgInput.focus(); }, 150);
}

function closeWeightModal(){
  const modal = document.getElementById('weightModal');
  if(modal) modal.classList.remove('show');
}

function saveWeight(){
  const kg   = parseFloat(document.getElementById('weightKg').value);
  const reps = parseInt(document.getElementById('weightReps').value);
  if(isNaN(kg) || kg <= 0){ document.getElementById('weightKg').focus(); return; }
  if(isNaN(reps) || reps <= 0){ document.getElementById('weightReps').focus(); return; }
  if(!chargesData[weightModalExName]) chargesData[weightModalExName] = [];
  chargesData[weightModalExName] = chargesData[weightModalExName].filter(e=>e.date!==todayStr());
  chargesData[weightModalExName].push({date:todayStr(), kg, reps});
  if(chargesData[weightModalExName].length > 30) chargesData[weightModalExName].shift();
  store.set('chargesData', chargesData);
  const btn = document.querySelector(`.ex-kg-btn[data-key="${weightModalKey}"]`);
  if(btn){ const last = chargesData[weightModalExName].slice(-1)[0]; btn.textContent = last.kg+'kg'; btn.classList.add('has-data'); }
  closeWeightModal();
  if(navigator.vibrate) navigator.vibrate(60);
}

document.getElementById('weightModalCancel').addEventListener('click', closeWeightModal);
document.getElementById('weightModalConfirm').addEventListener('click', saveWeight);
document.getElementById('weightModal').addEventListener('click', e=>{
  if(e.target === document.getElementById('weightModal')) closeWeightModal();
});
document.getElementById('weightKg').addEventListener('keydown', e=>{ if(e.key==='Enter') document.getElementById('weightReps').focus(); });
document.getElementById('weightReps').addEventListener('keydown', e=>{ if(e.key==='Enter') saveWeight(); });

/* ── SMART REST ── */
function checkSmartRest(){
  const srCard = document.getElementById('smartRestCard');
  if(!srCard) return;
  if(!cycleStart){ srCard.style.display='none'; return; }
  const yd = yesterdayStr();
  if(dayConfirms[yd] !== undefined){ srCard.style.display='none'; return; }
  if(lastOpenDate === todayStr() && store.get('srCheckedToday', false)){ srCard.style.display='none'; return; }
  const ydDayIdx = getCurDayIdxForDate(yd);
  if(ydDayIdx < 0){ srCard.style.display='none'; return; }
  const day = days[ydDayIdx];
  const jours=['Dim','Lun','Mar','Mer','Jeu','Ven','Sam'];
  const d = new Date(yd);
  const shortDate = jours[d.getDay()] + ' ' + d.getDate();
  setHTML('srDayInfo', `<span class="sr-day-tag sr-${day.type}">J${day.num} — ${day.title}</span> <span class="sr-date">${shortDate}</span>`);
  srCard.style.display='block';
  srCard.classList.add('sr-appear');
}

function confirmDay(status){
  const srCard = document.getElementById('smartRestCard');
  const yd = yesterdayStr();
  dayConfirms[yd] = status;
  store.set('dayConfirms', dayConfirms);
  store.set('srCheckedToday', true);
  if(status === 'skipped'){
    if(hardcoreMode){ triggerHardcoreFail(); }
    else { cycleOffset++; store.set('cycleOffset', cycleOffset); refreshCurDay(); }
  }
  if(srCard){
    srCard.style.opacity='0'; srCard.style.transform='translateY(-8px)';
    setTimeout(()=>{ srCard.style.display='none'; srCard.style.opacity=''; srCard.style.transform=''; }, 300);
  }
  updateHome();
}

/* ── BUILD PROGRAMME ── */
const gridEl = document.getElementById('daysGrid');
const cardEls = [];

days.forEach((day,i)=>{
  const card = document.createElement('div');
  card.className = 'day-card';
  card.dataset.type = day.type;
  card.style.animationDelay = (i*0.05+0.1)+'s';
  cardEls.push(card);
  const totalExos = day.sections.reduce((a,s)=>a+s.exercises.length,0);
  const secTags = day.tags.map(t=>`<span class="tag tag-secondary">${t}</span>`).join('');
  const secHTML = day.sections.map((sec,si)=>
    `<div class="detail-section"><h3>${sec.title}</h3>${
      sec.exercises.map((ex,ei)=>{
        const key = `d${i}s${si}e${ei}`;
        const safeName = ex.name.replace(/"/g,'&quot;').replace(/'/g,'&#39;');
        const safeSets = ex.sets.replace(/"/g,'&quot;');
        return `<div class="ex-row" data-key="${key}">
          <span class="ex-name">${ex.name}</span>
          <span class="ex-sets">${ex.sets}</span>
          <button class="ex-kg-btn" data-key="${key}" data-exname="${safeName}" data-exsets="${safeSets}">+kg</button>
          <span class="ex-check">✓</span>
        </div>`;
      }).join('')
    }</div>`
  ).join('');
  const existingNote = sessionNotes[`d${i}`] || '';
  card.innerHTML = `
    <div class="day-header">
      <div class="day-badge">
        <div class="lbl">Jour</div>
        <div class="ring-wrap">
          <svg width="36" height="36" viewBox="0 0 36 36">
            <circle class="ring-bg" cx="18" cy="18" r="15"/>
            <circle class="ring-fill" id="ring-${i}" cx="18" cy="18" r="15"/>
          </svg>
          <div class="ring-num" id="rnum-${i}">${String(day.num).padStart(2,'0')}</div>
        </div>
        <div class="wd" id="daywd-${i}">${day.weekday}</div>
      </div>
      <div class="day-info">
        <div class="day-tags">
          <span class="tag tag-primary">${day.type.toUpperCase()}</span>
          ${secTags}
          <span class="cur-tag">Aujourd'hui</span>
        </div>
        <div class="day-title-text">${day.title}</div>
        <div class="day-meta-row">
          <span class="meta-item">⏱ ${day.duration}</span>
          <span class="meta-item">⚡ ${day.intensity}</span>
        </div>
      </div>
      <div class="chevron">▾</div>
    </div>
    <div class="day-detail">
      ${secHTML}
      <div class="note-box">${day.note}</div>
      <div class="session-note-wrap">
        <div class="session-note-label">📝 Note de séance</div>
        <textarea class="session-note-input" id="session-note-${i}" placeholder="Ressenti · Charge perçue · Points à améliorer...">${existingNote}</textarea>
        <div class="session-note-saved" id="note-saved-${i}"></div>
      </div>
    </div>`;
  card.querySelectorAll('.ex-row').forEach(row=>{ if(progState[row.dataset.key]) row.classList.add('done'); });
  card.querySelectorAll('.ex-kg-btn').forEach(btn=>{
    const entries = chargesData[btn.dataset.exname] || [];
    if(entries.length){ const last=entries[entries.length-1]; btn.textContent=last.kg+'kg'; btn.classList.add('has-data'); }
  });
  card.querySelector('.day-header').addEventListener('click',()=>{
    const open=card.classList.contains('open');
    document.querySelectorAll('.day-card.open').forEach(c=>c.classList.remove('open'));
    if(!open) card.classList.add('open');
  });
  card.addEventListener('click',e=>{
    if(e.target.closest('.ex-kg-btn')) return;
    if(e.target.closest('.session-note-wrap')) return;
    const row=e.target.closest('.ex-row');
    if(!row) return;
    e.stopPropagation();
    const wasDone = row.classList.contains('done');
    row.classList.toggle('done');
    row.classList.remove('just-checked','just-unchecked');
    void row.offsetWidth;
    row.classList.add(wasDone ? 'just-unchecked' : 'just-checked');
    row.addEventListener('animationend', ()=>{ row.classList.remove('just-checked','just-unchecked'); }, {once:true});
    if(navigator.vibrate) navigator.vibrate(wasDone ? 20 : 40);
    if(!wasDone) progState[row.dataset.key]=true;
    else delete progState[row.dataset.key];
    store.set('progState',progState);
    refreshRing(i,card,totalExos);
    updateHome();
  });
  card.querySelectorAll('.ex-kg-btn').forEach(btn=>{
    btn.addEventListener('click', e=>{
      e.stopPropagation();
      openWeightModal(btn.dataset.exname, btn.dataset.exsets, btn.dataset.key);
    });
  });
  const noteEl = document.getElementById(`session-note-${i}`);
  const noteSavedEl = document.getElementById(`note-saved-${i}`);
  if(noteEl){
    let noteTimer;
    noteEl.addEventListener('click', e=>e.stopPropagation());
    noteEl.addEventListener('input', ()=>{
      clearTimeout(noteTimer);
      if(noteSavedEl) noteSavedEl.textContent = '';
      noteTimer = setTimeout(()=>{
        sessionNotes[`d${i}`] = noteEl.value;
        store.set('sessionNotes', sessionNotes);
        if(noteSavedEl){ noteSavedEl.textContent = '✓ sauvegardé'; setTimeout(()=>{ if(noteSavedEl) noteSavedEl.textContent=''; }, 2000); }
      }, 700);
    });
  }
  gridEl.appendChild(card);
  refreshRing(i,card,totalExos);
});

function refreshRing(i,card,totalExos){
  const done=card.querySelectorAll('.ex-row.done').length;
  document.getElementById('ring-'+i).style.strokeDashoffset = CIRC-CIRC*(done/totalExos);
  document.getElementById('rnum-'+i).textContent = done===totalExos?'✓':String(i+1).padStart(2,'0');
}

const JOURS_SEMAINE = ['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];

function updateWeekdays(){
  if(!cycleStart){
    days.forEach((day,i)=>{ const el = document.getElementById('daywd-'+i); if(el) el.textContent = day.weekday; });
    return;
  }
  const start = new Date(cycleStart);
  days.forEach((day,i)=>{
    const d = new Date(start);
    d.setDate(start.getDate() + i + cycleOffset);
    const el = document.getElementById('daywd-'+i);
    if(el) el.textContent = JOURS_SEMAINE[d.getDay()].toUpperCase();
  });
}

function refreshCurDay(){
  updateWeekdays();
  const cur=getCurDayIdx();
  cardEls.forEach((c,i)=>{
    c.classList.toggle('cur-day-card',i===cur);
    if(i!==cur) c.classList.remove('open');
  });
  if(cur>=0 && cardEls[cur]) cardEls[cur].classList.add('open');
}

function isCurrentWorkoutDone(){
  const cur=getCurDayIdx();
  if(cur<0||!cardEls[cur]) return false;
  const rows=cardEls[cur].querySelectorAll('.ex-row');
  if(!rows.length) return false;
  return [...rows].every(r=>r.classList.contains('done'));
}

document.getElementById('resetProg').addEventListener('click',()=>{
  progState={}; cycleStart=null; cycleOffset=0;
  store.set('progState',progState); store.set('cycleStart',cycleStart); store.set('cycleOffset',cycleOffset);
  document.querySelectorAll('.ex-row.done').forEach(r=>r.classList.remove('done'));
  days.forEach((_,i)=>{
    document.getElementById('ring-'+i).style.strokeDashoffset=CIRC;
    document.getElementById('rnum-'+i).textContent=String(i+1).padStart(2,'0');
  });
  document.querySelectorAll('.day-card.open').forEach(c=>c.classList.remove('open'));
  refreshCurDay(); updateHome();
});

/* ── BUILD DÉFI ── */
document.getElementById('totalTarget').textContent = totalTarget;
const chCont = document.getElementById('challenges');

function updateGlobalRing(){
  const total = dailyState.reps.reduce((a,v)=>a+v,0);
  const pct = Math.round(total/totalTarget*100);
  document.getElementById('totalDone').textContent = total;
  document.getElementById('ringPct').textContent = pct+'%';
  document.getElementById('ringFill').style.strokeDashoffset = 188-(188*pct/100);
  const allDone = dailyState.reps.every((r,i)=>r>=challenges[i].target);
  if(allDone && streakData.lastDate!==todayStr()){
    const yd=new Date(); yd.setDate(yd.getDate()-1);
    const ydStr=yd.toISOString().slice(0,10);
    streakData.count = (streakData.lastDate===ydStr) ? streakData.count+1 : 1;
    streakData.best = Math.max(streakData.best||0, streakData.count);
    streakData.lastDate = todayStr();
    store.set('streakData',streakData);
    checkLevelUp();
  }
  store.set('dailyState',dailyState);
  saveToHistory(); updateHome();
}

challenges.forEach((ch,i)=>{
  const card=document.createElement('div');
  card.className='challenge-card'; card.dataset.color=ch.color;
  card.innerHTML=`
    <div class="ch-icon">${ch.icon}</div>
    <div class="ch-body">
      <div class="ch-name">${ch.name}</div>
      <div class="ch-detail">${ch.detail}</div>
      <div class="ch-bar-wrap"><div class="ch-bar" id="bar-${i}"></div></div>
    </div>
    <div class="ch-right">
      <div class="ch-count" id="cnt-${i}">0</div>
      <div class="ch-target">/ ${ch.target}${ch.name==='Gainage (sec)'?' sec':' reps'}</div>
    </div>
    <div class="done-badge">✓ Done</div>`;
  const btns=document.createElement('div'); btns.className='ch-btns';
  const minus=document.createElement('button'); minus.className='ch-btn minus'; minus.textContent='−'+ch.step;
  const plus=document.createElement('button'); plus.className='ch-btn primary'; plus.textContent='+'+ch.step;
  function renderCh(){
    const v=dailyState.reps[i]; const p=Math.min(v/ch.target*100,100);
    document.getElementById('cnt-'+i).textContent=v;
    document.getElementById('bar-'+i).style.width=p+'%';
    card.style.setProperty('--fill',p+'%');
    card.classList.toggle('completed',v>=ch.target);
  }
  plus.addEventListener('click',()=>{
    dailyState.reps[i]=Math.min(dailyState.reps[i]+ch.step,ch.target);
    const el=document.getElementById('cnt-'+i);
    el.classList.remove('pop'); void el.offsetWidth; el.classList.add('pop');
    renderCh(); updateGlobalRing();
  });
  minus.addEventListener('click',()=>{
    dailyState.reps[i]=Math.max(dailyState.reps[i]-ch.step,0);
    renderCh(); updateGlobalRing();
  });
  btns.appendChild(minus); btns.appendChild(plus);
  chCont.appendChild(card); chCont.appendChild(btns);
  renderCh();
});

document.getElementById('resetDefi').addEventListener('click',()=>{
  dailyState.reps=challenges.map(()=>0);
  store.set('dailyState',dailyState);
  challenges.forEach((_,i)=>{
    document.getElementById('cnt-'+i).textContent=0;
    document.getElementById('bar-'+i).style.width='0%';
    chCont.querySelectorAll('.challenge-card')[i].classList.remove('completed');
    chCont.querySelectorAll('.challenge-card')[i].style.setProperty('--fill','0%');
  });
  document.getElementById('totalDone').textContent=0;
  document.getElementById('ringPct').textContent='0%';
  document.getElementById('ringFill').style.strokeDashoffset=188;
  updateHome();
});

/* ── STATS PAGE ── */
function renderStats(){
  const heatEl = document.getElementById('heatmapGrid');
  if(heatEl){
    heatEl.innerHTML='';
    const today = new Date(todayStr());
    const startDay = new Date(today); startDay.setDate(today.getDate() - 89);
    const dow = startDay.getDay(); const toMonday = dow===0 ? 6 : dow-1;
    startDay.setDate(startDay.getDate() - toMonday);
    const histMap = {}; historyData.forEach(e=>{ histMap[e.date]=e; });
    let cur = new Date(startDay);
    while(cur <= today){
      const week = document.createElement('div'); week.className='heatmap-week';
      for(let d=0;d<7;d++){
        const cell = document.createElement('div');
        const dateStr = `${cur.getFullYear()}-${String(cur.getMonth()+1).padStart(2,'0')}-${String(cur.getDate()).padStart(2,'0')}`;
        if(cur > today){ cell.className='hm-cell empty'; }
        else { const entry = histMap[dateStr]; if(entry) cell.className='hm-cell '+(entry.done?'done':'partial'); else cell.className='hm-cell'; }
        if(dateStr===todayStr()) cell.classList.add('today');
        cell.title = dateStr; week.appendChild(cell); cur.setDate(cur.getDate()+1);
      }
      heatEl.appendChild(week);
    }
  }
  const totalDays = historyData.length;
  const perfectDays = historyData.filter(d=>d.done).length;
  const totalReps = historyData.reduce((a,d)=>a+((d.reps||[]).reduce((b,v)=>b+v,0)),0);
  const discScore = totalDays>0 ? Math.round((perfectDays/totalDays)*100) : 0;
  setTxt('statDaysDone', perfectDays);
  setTxt('statBestStreak', streakData.best||0);
  setTxt('statTotalReps', totalReps>=1000?(totalReps/1000).toFixed(1)+'k':totalReps);
  setTxt('statDiscipline', totalDays>0 ? discScore+'%' : '—');

  const exTotals = challenges.map((_,i)=> historyData.reduce((a,d)=>a+(((d.reps||[])[i])||0),0));
  const maxEx = Math.max(...exTotals, 1);
  const exEl = document.getElementById('exTotals'); exEl.innerHTML = '';
  challenges.forEach((ch,i)=>{
    const pct = Math.round(exTotals[i]/maxEx*100);
    const row = document.createElement('div'); row.className = 'ex-total-row';
    row.innerHTML = `
      <div class="ex-total-icon">${ch.icon}</div>
      <div class="ex-total-body">
        <div class="ex-total-name">${ch.name}</div>
        <div class="ex-total-bar-wrap"><div class="ex-total-bar" style="width:${pct}%;background:${CH_COLORS[i]}"></div></div>
      </div>
      <div class="ex-total-right">
        <div class="ex-total-val" style="color:${CH_COLORS[i]}">${exTotals[i]>=1000?(exTotals[i]/1000).toFixed(1)+'k':exTotals[i]}</div>
        <div class="ex-total-unit">${ch.name==='Gainage (sec)'?'sec':'reps'}</div>
      </div>`;
    exEl.appendChild(row);
  });
  renderChargesStats();

  const histEl = document.getElementById('historyList'); histEl.innerHTML = '';
  if(historyData.length===0){
    histEl.innerHTML = '<div class="history-empty">Aucune séance enregistrée.<br>Commence ton défi daily !</div>';
    return;
  }
  const mois=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  historyData.slice(0,60).forEach((entry,idx)=>{
    const d = new Date(entry.date);
    const chips = challenges.map((ch,i)=>{
      const v = entry.reps[i]||0; if(v===0) return '';
      return `<span class="hist-ex-chip">${ch.icon} ${v}</span>`;
    }).join('');
    const row = document.createElement('div');
    row.className = 'hist-row '+(entry.done?'full':'partial');
    row.style.animationDelay = (idx*0.04)+'s';
    row.innerHTML = `
      <div class="hist-date-block"><div class="hist-day">${d.getDate()}</div><div class="hist-month">${mois[d.getMonth()]}</div></div>
      <div class="hist-body"><div class="hist-exercises">${chips||'<span style="color:var(--muted);font-size:12px">—</span>'}</div><div class="hist-bar-wrap"><div class="hist-bar" style="width:${entry.pct}%"></div></div></div>
      <div class="hist-right"><div class="hist-pct">${entry.pct}%</div><div class="hist-badge">${entry.done?'✓ Complet':'En cours'}</div></div>`;
    histEl.appendChild(row);
  });
}

function renderChargesStats(){
  const el = document.getElementById('chargesStats'); if(!el) return; el.innerHTML='';
  const exNames = Object.keys(chargesData).filter(n=>chargesData[n].length>0);
  if(!exNames.length){ el.innerHTML='<div class="history-empty">Aucune charge enregistrée.<br>Tape sur le badge kg dans une séance 💪</div>'; return; }
  const keyLifts = ['Développé couché barre','Développé couché haltères','Squat barre','Romanian deadlift','Tractions lestées','Rowing barre','Développé militaire'];
  const ordered = [...keyLifts.filter(n=>exNames.includes(n)), ...exNames.filter(n=>!keyLifts.includes(n))];
  ordered.forEach(name=>{
    const entries = chargesData[name]; if(!entries||!entries.length) return;
    const sorted = entries.slice().sort((a,b)=>a.date.localeCompare(b.date));
    const maxKg = Math.max(...sorted.map(e=>e.kg));
    const last = sorted[sorted.length-1];
    const prev = sorted.length>1 ? sorted[sorted.length-2] : null;
    const delta = prev ? last.kg - prev.kg : 0;
    const deltaStr = delta>0 ? `<span class="charge-delta up">+${delta}kg</span>` : delta<0 ? `<span class="charge-delta down">${delta}kg</span>` : '';
    const row = document.createElement('div'); row.className='charges-row';
    row.innerHTML=`
      <div class="charges-name">${name}</div>
      <div class="charges-body"><div class="charges-bar-wrap">${sorted.map((e,idx)=>{
        const h = Math.round((e.kg/maxKg)*100); const isLast = idx===sorted.length-1;
        return `<div class="charges-bar-col" title="${e.date} · ${e.kg}kg × ${e.reps}"><div class="charges-bar-fill${isLast?' latest':''}" style="height:${h}%"></div></div>`;
      }).join('')}</div></div>
      <div class="charges-right"><div class="charges-max">${last.kg}<span class="charges-unit">kg</span></div><div class="charges-reps">× ${last.reps}${deltaStr}</div></div>`;
    el.appendChild(row);
  });
}

/* ══════════════════════════════════════════ */
/* ══          RUN TAB LOGIC              ══ */
/* ══════════════════════════════════════════ */

function formatPace(totalSeconds, distKm){
  if(!distKm || distKm <= 0 || !totalSeconds || totalSeconds <= 0) return '—';
  const paceSeconds = totalSeconds / distKm;
  const m = Math.floor(paceSeconds / 60);
  const s = Math.round(paceSeconds % 60);
  return `${m}'${String(s).padStart(2,'0')}"`;
}

function paceToSeconds(totalSeconds, distKm){
  if(!distKm || distKm <= 0 || !totalSeconds || totalSeconds <= 0) return Infinity;
  return totalSeconds / distKm;
}

function formatDuration(totalSeconds){
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${String(s).padStart(2,'0')}`;
}

// Live pace preview
const runDistEl = document.getElementById('runDist');
const runMinEl  = document.getElementById('runMin');
const runSecEl  = document.getElementById('runSec');
const runPaceEl = document.getElementById('runPaceVal');
const runPrevEl = document.getElementById('runPacePreview');

function updatePacePreview(){
  const dist = parseFloat(runDistEl.value) || 0;
  const mins = parseInt(runMinEl.value) || 0;
  const secs = parseInt(runSecEl.value) || 0;
  const total = mins * 60 + secs;
  if(dist > 0 && total > 0){
    runPaceEl.textContent = formatPace(total, dist);
    runPrevEl.classList.add('has-pace');
  } else {
    runPaceEl.textContent = '—';
    runPrevEl.classList.remove('has-pace');
  }
}

runDistEl.addEventListener('input', updatePacePreview);
runMinEl.addEventListener('input', updatePacePreview);
runSecEl.addEventListener('input', updatePacePreview);

// Save run
document.getElementById('runSaveBtn').addEventListener('click', ()=>{
  const dist = parseFloat(runDistEl.value);
  const mins = parseInt(runMinEl.value) || 0;
  const secs = parseInt(runSecEl.value) || 0;
  const totalSec = mins * 60 + secs;
  const zone = document.getElementById('runZone').value;
  const note = document.getElementById('runNote').value.trim();

  if(!dist || dist <= 0){ runDistEl.focus(); return; }
  if(totalSec <= 0){ runMinEl.focus(); return; }

  const entry = {
    date: todayStr(),
    dist: Math.round(dist * 100) / 100,
    timeSeconds: totalSec,
    pace: formatPace(totalSec, dist),
    paceSeconds: paceToSeconds(totalSec, dist),
    zone,
    note
  };

  runHistory.unshift(entry);
  if(runHistory.length > 200) runHistory = runHistory.slice(0, 200);
  store.set('runHistory', runHistory);

  // Reset form
  runDistEl.value = '';
  runMinEl.value = '';
  runSecEl.value = '';
  document.getElementById('runNote').value = '';
  runPaceEl.textContent = '—';
  runPrevEl.classList.remove('has-pace');

  if(navigator.vibrate) navigator.vibrate([80, 50, 80]);
  renderRunTab();
  updateHome();
});

// Delete a run
function deleteRun(idx){
  runHistory.splice(idx, 1);
  store.set('runHistory', runHistory);
  renderRunTab();
  updateHome();
}

// Render entire run tab
function renderRunTab(){
  const mois=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  const zoneLabels = {z2:'Z2 Easy', tempo:'Tempo', interval:'Interval', long:'Long Run'};
  const zoneCss    = {z2:'rh-zone-z2', tempo:'rh-zone-tempo', interval:'rh-zone-interval', long:'rh-zone-long'};
  const zoneColors = {z2:'var(--green)', tempo:'var(--orange)', interval:'var(--pink)', long:'var(--blue)'};

  // --- Cycle link ---
  const clEl = document.getElementById('runCycleLink');
  const clTxt = document.getElementById('runCycleLinkText');
  if(cycleStart){
    const cur = getCurDayIdx();
    if(cur >= 0){
      const day = days[cur];
      if(day.type === 'run' || day.tags.includes('Run')){
        clEl.style.display = 'flex';
        clTxt.textContent = `Aujourd'hui = J${day.num} ${day.title} — ${day.duration}`;
      } else { clEl.style.display = 'none'; }
    } else { clEl.style.display = 'none'; }
  } else { clEl.style.display = 'none'; }

  // --- Run streak (runs this week) ---
  const now = new Date();
  const mondayOffset = (now.getDay() + 6) % 7;
  const monday = new Date(now); monday.setDate(now.getDate() - mondayOffset);
  const mondayStr = `${monday.getFullYear()}-${String(monday.getMonth()+1).padStart(2,'0')}-${String(monday.getDate()).padStart(2,'0')}`;
  const weekRuns = runHistory.filter(r => r.date >= mondayStr).length;
  setTxt('runStreakNum', weekRuns);
  setTxt('runStreakSub', weekRuns === 0 ? 'Aucun run cette semaine' : weekRuns === 1 ? '1 run — continue !' : weekRuns + ' runs — belle régularité 🔥');

  // --- Stats ---
  const totalKm = runHistory.reduce((a, r) => a + r.dist, 0);
  const totalRuns = runHistory.length;
  const monthStr = todayStr().slice(0, 7);
  const monthKm = runHistory.filter(r => r.date.startsWith(monthStr)).reduce((a, r) => a + r.dist, 0);
  const avgPaceSec = totalRuns > 0 ? runHistory.reduce((a, r) => a + (r.paceSeconds || Infinity), 0) / totalRuns : 0;
  const bestPaceSec = totalRuns > 0 ? Math.min(...runHistory.map(r => r.paceSeconds || Infinity)) : 0;

  setTxt('runStatTotalKm', totalKm >= 100 ? Math.round(totalKm) : totalKm.toFixed(1));
  setTxt('runStatTotalRuns', totalRuns);
  setTxt('runStatMonthKm', monthKm.toFixed(1));
  setTxt('runStatWeekRuns', weekRuns);
  setTxt('runStatAvgPace', avgPaceSec > 0 && avgPaceSec < Infinity ? `${Math.floor(avgPaceSec/60)}'${String(Math.round(avgPaceSec%60)).padStart(2,'0')}"` : '—');
  setTxt('runStatBestPace', bestPaceSec > 0 && bestPaceSec < Infinity ? `${Math.floor(bestPaceSec/60)}'${String(Math.round(bestPaceSec%60)).padStart(2,'0')}"` : '—');

  // --- PR Board ---
  const prEl = document.getElementById('prBoard'); prEl.innerHTML = '';
  const prDefs = [
    {name:'Meilleur 5K', icon:'🏅', filter: r=>r.dist>=4.9 && r.dist<=5.5, metric:'pace', unit:'/km'},
    {name:'Meilleur 10K', icon:'🥇', filter: r=>r.dist>=9.5 && r.dist<=10.5, metric:'pace', unit:'/km'},
    {name:'Plus longue distance', icon:'📏', filter: r=>true, metric:'dist', unit:'km'},
    {name:'Plus long run (durée)', icon:'⏱', filter: r=>true, metric:'time', unit:''},
  ];
  prDefs.forEach(pr=>{
    const matching = runHistory.filter(pr.filter);
    let val = '—', detail = 'Pas encore de donnée', date = '', hasPr = false;
    if(matching.length > 0){
      hasPr = true;
      if(pr.metric === 'pace'){
        const best = matching.reduce((a, r) => (r.paceSeconds||Infinity) < (a.paceSeconds||Infinity) ? r : a);
        val = best.pace; detail = `${best.dist} km en ${formatDuration(best.timeSeconds)}`; date = best.date;
      } else if(pr.metric === 'dist'){
        const best = matching.reduce((a, r) => r.dist > a.dist ? r : a);
        val = best.dist.toFixed(1); detail = `en ${formatDuration(best.timeSeconds)} · ${best.pace}/km`; date = best.date;
      } else if(pr.metric === 'time'){
        const best = matching.reduce((a, r) => r.timeSeconds > a.timeSeconds ? r : a);
        val = formatDuration(best.timeSeconds); detail = `${best.dist} km · ${best.pace}/km`; date = best.date;
      }
    }
    const card = document.createElement('div');
    card.className = 'pr-card' + (hasPr ? ' has-pr' : '');
    card.innerHTML = `
      <div class="pr-icon">${pr.icon}</div>
      <div class="pr-body">
        <div class="pr-name">${pr.name}</div>
        <div class="pr-detail">${detail}</div>
      </div>
      <div class="pr-right">
        <div class="${hasPr?'pr-val':'pr-empty'}">${val}${hasPr && pr.unit ? `<span class="pr-val-unit">${pr.unit}</span>` : ''}</div>
        ${date ? `<div class="pr-date">${date}</div>` : ''}
      </div>`;
    prEl.appendChild(card);
  });

  // --- Pace sparkline ---
  const sparkSvg = document.getElementById('runSparkSvg');
  sparkSvg.innerHTML = '';
  const last20 = runHistory.slice(0, 20).reverse().filter(r => r.paceSeconds && r.paceSeconds < Infinity);
  if(last20.length >= 2){
    const minP = Math.min(...last20.map(r=>r.paceSeconds));
    const maxP = Math.max(...last20.map(r=>r.paceSeconds));
    const range = maxP - minP || 1;
    const w = 500, h = 60, pad = 4;
    const pts = last20.map((r, i) => {
      const x = pad + (i / (last20.length - 1)) * (w - pad * 2);
      const y = pad + ((r.paceSeconds - minP) / range) * (h - pad * 2);
      return {x, y};
    });
    // Note: lower pace = better, so we invert
    const ptsInv = pts.map(p => ({x: p.x, y: h - p.y}));
    const lineStr = ptsInv.map(p => `${p.x},${p.y}`).join(' ');
    const areaStr = `${ptsInv[0].x},${h} ${lineStr} ${ptsInv[ptsInv.length-1].x},${h}`;
    sparkSvg.innerHTML = `
      <polygon class="spark-area" points="${areaStr}"/>
      <polyline points="${lineStr}"/>
      <circle class="spark-dot" cx="${ptsInv[ptsInv.length-1].x}" cy="${ptsInv[ptsInv.length-1].y}" r="3"/>`;
  } else {
    sparkSvg.innerHTML = `<text x="250" y="35" text-anchor="middle" fill="#555" font-size="12" font-family="Barlow Condensed">Min 2 runs pour voir le graph</text>`;
  }

  // --- Zone distribution ---
  const zDistEl = document.getElementById('zoneDistrib'); zDistEl.innerHTML = '';
  const zoneCounts = {z2:0, tempo:0, interval:0, long:0};
  runHistory.forEach(r => { if(zoneCounts[r.zone] !== undefined) zoneCounts[r.zone]++; });
  const maxZone = Math.max(...Object.values(zoneCounts), 1);
  ['z2','tempo','interval','long'].forEach(z => {
    const cnt = zoneCounts[z];
    const h = Math.round((cnt / maxZone) * 100);
    const item = document.createElement('div'); item.className = 'zone-bar-item';
    item.innerHTML = `
      <div class="zone-bar-label">${zoneLabels[z]}</div>
      <div class="zone-bar-visual"><div class="zone-bar-fill-v" style="height:${h}%;background:${zoneColors[z]}"></div></div>
      <div class="zone-bar-count" style="color:${zoneColors[z]}">${cnt}</div>
      <div class="zone-bar-sub">runs</div>`;
    zDistEl.appendChild(item);
  });

  // --- History ---
  const histEl = document.getElementById('runHistoryList'); histEl.innerHTML = '';
  if(runHistory.length === 0){
    histEl.innerHTML = '<div class="history-empty">Aucun run enregistré.<br>Log ton premier run ci-dessus 🏃</div>';
    return;
  }
  runHistory.slice(0, 50).forEach((entry, idx) => {
    const d = new Date(entry.date);
    const row = document.createElement('div');
    row.className = 'run-hist-row';
    row.style.animationDelay = (idx * 0.03) + 's';
    row.innerHTML = `
      <div class="rh-date-block">
        <div class="rh-day">${d.getDate()}</div>
        <div class="rh-month">${mois[d.getMonth()]}</div>
      </div>
      <div class="rh-body">
        <div class="rh-top">
          <span class="rh-zone-tag ${zoneCss[entry.zone]||''}">${zoneLabels[entry.zone]||entry.zone}</span>
          <span class="rh-dist">${entry.dist} km</span>
        </div>
        ${entry.note ? `<div class="rh-note">${entry.note}</div>` : ''}
      </div>
      <div class="rh-right">
        <div class="rh-pace">${entry.pace}</div>
        <div class="rh-time">${formatDuration(entry.timeSeconds)}</div>
      </div>
      <button class="rh-delete" onclick="deleteRun(${idx})">✕</button>`;
    histEl.appendChild(row);
  });
}

// Auto-select zone based on cycle
function autoSelectRunZone(){
  if(!cycleStart) return;
  const cur = getCurDayIdx();
  if(cur < 0) return;
  const day = days[cur];
  const zoneEl = document.getElementById('runZone');
  if(!zoneEl) return;
  if(day.type === 'run') zoneEl.value = 'long';
  else if(day.tags.includes('Run')) zoneEl.value = 'z2';
}

// Reset runs
document.getElementById('resetRuns').addEventListener('click', () => {
  document.getElementById('modalRunsOverlay').classList.add('show');
});
document.getElementById('modalRunsCancel').addEventListener('click', () => {
  document.getElementById('modalRunsOverlay').classList.remove('show');
});
document.getElementById('modalRunsConfirm').addEventListener('click', () => {
  document.getElementById('modalRunsOverlay').classList.remove('show');
  runHistory = [];
  store.set('runHistory', runHistory);
  renderRunTab();
  updateHome();
});

/* ── HOME ── */
function updateHome(){
  const now = new Date();
  const jours=['Dimanche','Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'];
  const mois=['Jan','Fév','Mar','Avr','Mai','Jun','Jul','Aoû','Sep','Oct','Nov','Déc'];
  setTxt('homeDate', jours[now.getDay()]+' '+now.getDate()+' '+mois[now.getMonth()]+' '+now.getFullYear());
  const h=now.getHours();
  const gr=h<12?'Bonjour':h<18?'Bon après-midi':'Bonsoir';
  setHTML('homeTitle', gr+'<span style="color:var(--accent)"> Thomas 💪</span>');
  const dayIndex = now.getDate() % phrases.length;
  const motiEl = document.getElementById('motiText');
  if(motiEl){ motiEl.textContent=phrases[dayIndex]; motiEl.className='moti-text active'; }
  const isPerfect = dailyState.reps.every((r,i)=>r>=challenges[i].target);
  const badge = document.getElementById('perfectBadge');
  if(badge){
    badge.className = isPerfect?'perfect-badge done':'perfect-badge progress';
    badge.textContent = isPerfect?'🟢 Jour clean':'🟠 En cours';
  }
  const totalDaysH = historyData.length;
  const perfectDaysH = historyData.filter(d=>d.done).length;
  const discScore = totalDaysH>0 ? Math.round(perfectDaysH/totalDaysH*100) : null;
  const discEl = document.getElementById('discScore');
  const discBar = document.getElementById('discBar');
  if(discEl) discEl.textContent = discScore!==null ? discScore+'%' : '—';
  if(discBar){
    discBar.style.width = discScore!==null ? discScore+'%' : '0%';
    discBar.style.background = discScore>=80?'var(--green)':discScore>=50?'var(--accent)':'var(--orange)';
  }
  const s=streakData.count;
  updateRank(s);
  const toggle = document.getElementById('hardcoreToggle');
  if(toggle) toggle.classList.toggle('on', hardcoreMode);
  setTxt('hardcoreSub', hardcoreMode ? '🔴 ACTIF — Skip ou daily incomplet = streak reset' : 'Skip = streak reset. Zéro pitié.');
  setTxt('streakNum', s);
  setTxt('streakSub', s===0?'Complète le défi daily pour commencer':s===1?'Bien démarré — continue demain':s+' jours sans faillir — keep going');
  setTxt('streakFire', s===0?'🌱':s<7?'🔥':s<30?'⚡':'🏆');
  const allExos=days.reduce((a,d)=>a+d.sections.reduce((b,s)=>b+s.exercises.length,0),0);
  const doneExos=Object.keys(progState).length;
  const cp=allExos>0?Math.round(doneExos/allExos*100):0;
  setTxt('homeCyclePct', cp+'%');
  setTxt('homeCycleSub', doneExos+' / '+allExos+' exos');
  const dailyTotal=dailyState.reps.reduce((a,v)=>a+v,0);
  const dp=Math.round(dailyTotal/totalTarget*100);
  setTxt('homeDailyPct', dp+'%');
  setW('homeDailyBar', dp+'%');

  // Run summary on home
  const monthStr = todayStr().slice(0, 7);
  const monthKm = runHistory.filter(r => r.date.startsWith(monthStr)).reduce((a, r) => a + r.dist, 0);
  setTxt('homeRunKm', monthKm.toFixed(1) + ' km');
  setTxt('homeRunSub', 'Ce mois · ' + runHistory.filter(r => r.date.startsWith(monthStr)).length + ' runs');

  const cur=getCurDayIdx();
  setTxt('cyclePctLabel', cur>=0?'J'+(cur+1):'Non démarré');
  const btn=document.getElementById('startCycleBtn');
  if(btn) btn.textContent = cycleStart ? '⟳ Redémarrer le cycle depuis aujourd\'hui' : '⟳ Démarrer un nouveau cycle aujourd\'hui';
  const skipBtn=document.getElementById('skipBtn');
  if(skipBtn) skipBtn.style.display = cycleStart ? 'block' : 'none';
  const dotsEl=document.getElementById('cycleDots');
  if(dotsEl){
    dotsEl.innerHTML='';
    for(let d=0;d<8;d++){
      const dot=document.createElement('div'); dot.className='cycle-dot';
      if(d<cur) dot.classList.add('done-day');
      else if(d===cur) dot.classList.add('cur-day');
      dotsEl.appendChild(dot);
    }
  }
  const ni=cur>=0?cur:0;
  const nd=days[ni];
  const tc={push:'var(--push)',pull:'var(--pull)',cardio:'var(--cardio)',legs:'var(--legs)',run:'var(--run)',rest:'var(--rest)'};
  const nc=document.getElementById('nextCard');
  if(nc) nc.style.borderLeftColor=tc[nd.type]||'var(--muted)';
  setHTML('nextTitle', `<span style="background:${tc[nd.type]};color:#000;padding:2px 8px;font-size:12px">${nd.type.toUpperCase()}</span> ${nd.title}`);
  const workoutDone = isCurrentWorkoutDone();
  setTxt('nextMeta', workoutDone
    ? '✅ Séance du jour terminée — bon boulot'
    : 'Jour '+nd.num+' · '+nd.weekday+' · ⏱ '+nd.duration+' · ⚡ '+nd.intensity
  );
  checkSmartRest();
}

const skipMessages = [
  { title:"Ah ouais t'es une zemel ?",   sub:"Tu skip une séance ? Bali va pas se payer tout seul frérot." },
  { title:"Sérieusement ?",              sub:"T'as même pas essayé. Le futur Thomas est déçu." },
  { title:"Une zemel de compét",         sub:"Même les jours de flemme on se présente. Mais bon..." },
  { title:"Ok le champion",              sub:"Discipline > motivation tu disais. Apparemment non." },
  { title:"Noted.",                      sub:"Séance skippée. La routine elle, elle skip pas." },
];

document.getElementById('skipBtn').addEventListener('click',()=>{
  if(!cycleStart) return;
  const msg = skipMessages[Math.floor(Math.random()*skipMessages.length)];
  document.getElementById('modalSkipTitle').textContent = msg.title;
  document.getElementById('modalSkipSub').textContent = msg.sub;
  document.getElementById('modalSkipOverlay').classList.add('show');
});
document.getElementById('modalSkipCancel').addEventListener('click',()=>{ document.getElementById('modalSkipOverlay').classList.remove('show'); });
document.getElementById('modalSkipConfirm').addEventListener('click',()=>{
  document.getElementById('modalSkipOverlay').classList.remove('show');
  if(hardcoreMode) triggerHardcoreFail();
  cycleOffset++; store.set('cycleOffset', cycleOffset);
  refreshCurDay(); updateHome();
});

function doStartCycle(){
  cycleStart=todayStr(); cycleOffset=0; progState={};
  store.set('cycleStart',cycleStart); store.set('cycleOffset',cycleOffset); store.set('progState',progState);
  document.querySelectorAll('.ex-row.done').forEach(r=>r.classList.remove('done'));
  days.forEach((_,i)=>{
    document.getElementById('ring-'+i).style.strokeDashoffset=CIRC;
    document.getElementById('rnum-'+i).textContent=String(i+1).padStart(2,'0');
  });
  document.querySelectorAll('.day-card.open').forEach(c=>c.classList.remove('open'));
  refreshCurDay(); updateHome();
}

document.getElementById('startCycleBtn').addEventListener('click',()=>{
  if(cycleStart){ document.getElementById('modalCycleOverlay').classList.add('show'); }
  else { doStartCycle(); }
});
document.getElementById('modalCycleCancel').addEventListener('click',()=>{ document.getElementById('modalCycleOverlay').classList.remove('show'); });
document.getElementById('modalCycleConfirm').addEventListener('click',()=>{ document.getElementById('modalCycleOverlay').classList.remove('show'); doStartCycle(); });

document.getElementById('resetStats').addEventListener('click',()=>{ document.getElementById('modalStatsOverlay').classList.add('show'); });
document.getElementById('modalStatsCancel').addEventListener('click',()=>{ document.getElementById('modalStatsOverlay').classList.remove('show'); });
document.getElementById('modalStatsConfirm').addEventListener('click',()=>{
  document.getElementById('modalStatsOverlay').classList.remove('show');
  historyData=[]; streakData={count:0,lastDate:'',best:0};
  store.set('historyData',historyData); store.set('streakData',streakData);
  renderStats(); updateHome();
});

document.getElementById('resetAll').addEventListener('click',()=>{ document.getElementById('modalOverlay').classList.add('show'); });
document.getElementById('modalCancel').addEventListener('click',()=>{ document.getElementById('modalOverlay').classList.remove('show'); });
document.getElementById('modalConfirm').addEventListener('click',()=>{
  document.getElementById('modalOverlay').classList.remove('show');
  progState={}; cycleStart=null;
  dailyState={date:todayStr(), reps:challenges.map(()=>0)};
  streakData={count:0,lastDate:'',best:0};
  historyData=[]; chargesData={}; sessionNotes={}; dayConfirms={};
  runHistory = [];
  store.set('progState',progState); store.set('cycleStart',cycleStart);
  store.set('dailyState',dailyState); store.set('streakData',streakData);
  store.set('historyData',historyData); store.set('chargesData',chargesData);
  store.set('sessionNotes',sessionNotes); store.set('dayConfirms',dayConfirms);
  store.set('runHistory', runHistory);
  document.querySelectorAll('.ex-row.done').forEach(r=>r.classList.remove('done'));
  days.forEach((_,i)=>{
    document.getElementById('ring-'+i).style.strokeDashoffset=CIRC;
    document.getElementById('rnum-'+i).textContent=String(i+1).padStart(2,'0');
    const noteEl=document.getElementById(`session-note-${i}`); if(noteEl) noteEl.value='';
  });
  document.querySelectorAll('.ex-kg-btn').forEach(b=>{ b.textContent='+kg'; b.classList.remove('has-data'); });
  document.querySelectorAll('.day-card.open').forEach(c=>c.classList.remove('open'));
  document.querySelectorAll('.day-card.cur-day-card').forEach(c=>c.classList.remove('cur-day-card'));
  challenges.forEach((_,i)=>{
    document.getElementById('cnt-'+i).textContent=0;
    document.getElementById('bar-'+i).style.width='0%';
    chCont.querySelectorAll('.challenge-card')[i].classList.remove('completed');
    chCont.querySelectorAll('.challenge-card')[i].style.setProperty('--fill','0%');
  });
  document.getElementById('totalDone').textContent=0;
  document.getElementById('ringPct').textContent='0%';
  document.getElementById('ringFill').style.strokeDashoffset=188;
  updateHome();
});

/* ── TIMER ── */
let timerInterval = null;
let timerRemaining = 0;
function startTimer(seconds){
  stopTimer(); timerRemaining = seconds;
  const disp = document.getElementById('timerDisplay'); disp.className = 'timer-display running';
  renderTimer();
  timerInterval = setInterval(()=>{
    timerRemaining--;
    if(timerRemaining <= 0){
      timerRemaining = 0; clearInterval(timerInterval); timerInterval = null;
      disp.className = 'timer-display done'; disp.textContent = 'OK !';
      if(navigator.vibrate) navigator.vibrate([200,100,200]);
      setTimeout(()=>{ disp.textContent='00:00'; disp.className='timer-display'; },2000);
      return;
    }
    renderTimer();
  },1000);
}
function stopTimer(){
  if(timerInterval){ clearInterval(timerInterval); timerInterval=null; }
  timerRemaining=0;
  const disp=document.getElementById('timerDisplay'); disp.textContent='00:00'; disp.className='timer-display';
}
function renderTimer(){
  const m=Math.floor(timerRemaining/60); const s=timerRemaining%60;
  document.getElementById('timerDisplay').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
}

/* ── MOTIVATION PHRASES ── */
const phrases = [
  "T'es en train de devenir une machine",
  "Même fatigué tu bosses",
  "Personne ne va le faire à ta place",
  "Chaque jour compte",
  "Discipline > motivation",
  "Le futur Thomas te remercie",
  "Un set de plus que hier",
  "Les excuses changent rien au résultat",
  "Process > résultat",
  "Bali se mérite",
];

/* ── BACKUP / RESTORE ── */
function exportData(){
  const data = { progState, cycleStart, cycleOffset, dailyState, streakData, historyData, chargesData, sessionNotes, dayConfirms, runHistory };
  const json = JSON.stringify(data, null, 2);
  const d = new Date();
  const filename = `training-backup-${d.getFullYear()}${String(d.getMonth()+1).padStart(2,'0')}${String(d.getDate()).padStart(2,'0')}.json`;
  try {
    const blob = new Blob([json], {type:'application/json'});
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(()=>URL.revokeObjectURL(url), 1000);
  } catch(e) {
    const a = document.createElement('a');
    a.href = 'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
  }
}

function importData(file){
  const reader = new FileReader();
  reader.onload = function(e){
    try {
      const data = JSON.parse(e.target.result);
      if(data.progState && typeof data.progState==='object') store.set('progState', data.progState);
      if(typeof data.cycleStart==='string' || data.cycleStart===null) store.set('cycleStart', data.cycleStart);
      if(typeof data.cycleOffset==='number') store.set('cycleOffset', data.cycleOffset);
      if(data.dailyState && Array.isArray(data.dailyState.reps)) store.set('dailyState', data.dailyState);
      if(data.streakData && typeof data.streakData==='object') store.set('streakData', {
        count: Number(data.streakData.count||0), lastDate: data.streakData.lastDate||'', best: Number(data.streakData.best||0)
      });
      if(Array.isArray(data.historyData)) store.set('historyData', data.historyData);
      if(data.chargesData && typeof data.chargesData==='object') store.set('chargesData', data.chargesData);
      if(data.sessionNotes && typeof data.sessionNotes==='object') store.set('sessionNotes', data.sessionNotes);
      if(data.dayConfirms && typeof data.dayConfirms==='object') store.set('dayConfirms', data.dayConfirms);
      if(Array.isArray(data.runHistory)) store.set('runHistory', data.runHistory);
      location.reload();
    } catch(err) {
      alert("Fichier invalide — vérifie que c'est bien un backup training-app.");
    }
  };
  reader.readAsText(file);
}

function handleImport(event){
  const file = event.target.files[0]; if(file) importData(file); event.target.value = '';
}

/* ── RANG SYSTÈME ── */
const RANKS = [
  { name:'Rookie',  imgIdx:0, min:0,   max:3,   color:'#a8ff78' },
  { name:'Soldier', imgIdx:1, min:4,   max:14,  color:'#e8ff47' },
  { name:'Warrior', imgIdx:2, min:15,  max:29,  color:'#ff6b35' },
  { name:'Beast',   imgIdx:3, min:30,  max:59,  color:'#47c8ff' },
  { name:'Monster', imgIdx:4, min:60,  max:999, color:'#ff47a3' },
];

function getRank(streak){ return RANKS.find(r => streak >= r.min && streak <= r.max) || RANKS[0]; }

function updateRank(streak){
  const rank = getRank(streak);
  const next = RANKS[RANKS.indexOf(rank)+1];
  const badgeEl = document.getElementById('rankBadge');
  if(badgeEl) badgeEl.innerHTML = `<img src="${RANK_IMGS[rank.imgIdx]}" style="width:100px;height:100px;image-rendering:pixelated;display:block;border-radius:4px">`;
  setTxt('rankName', rank.name);
  const rankBar = document.getElementById('rankBar');
  if(rankBar) rankBar.style.background = rank.color;
  if(next){
    const progress = Math.round(((streak - rank.min) / (next.min - rank.min)) * 100);
    setTxt('rankNext', `${streak - rank.min}/${next.min - rank.min} jours → ${next.name}`);
    if(rankBar) rankBar.style.width = Math.min(progress, 100)+'%';
  } else {
    setTxt('rankNext', 'Rang maximum atteint 🏆');
    if(rankBar) rankBar.style.width = '100%';
  }
}

/* ── LEVEL UP & HARDCORE ── */
function checkLevelUp(){
  const currentRank = getRank(streakData.count);
  if(!rankState.lastRank){ rankState.lastRank = currentRank.name; store.set('rankState', rankState); return; }
  if(rankState.lastRank !== currentRank.name){
    rankState.lastRank = currentRank.name; store.set('rankState', rankState);
    showLevelUpModal(currentRank);
  }
}

function showLevelUpModal(rank){
  const overlay = document.getElementById('levelUpOverlay');
  const rankEl  = document.getElementById('levelUpRank');
  const imgEl   = document.getElementById('levelUpImg');
  const subEl   = document.getElementById('levelUpSub');
  if(!overlay) return;
  rankEl.textContent = rank.name.toUpperCase();
  imgEl.src = RANK_IMGS[rank.imgIdx];
  imgEl.style.cssText = 'width:100px;height:100px;image-rendering:pixelated;display:block;margin:0 auto 16px;border-radius:4px';
  const subs = {
    Rookie: 'Le voyage commence. Prouve ce que tu vaux.',
    Soldier: 'T\'es plus un débutant. Continue à bosser.',
    Warrior: 'Mi-chemin vers le sommet. Lâche rien.',
    Beast: 'Peu de gens arrivent là. T\'en fais partie.',
    Monster: 'Niveau max atteint. Tu es une machine. 🧬'
  };
  subEl.innerHTML = (subs[rank.name]||'Niveau supérieur atteint.');
  overlay.classList.add('show');
  if(navigator.vibrate) navigator.vibrate([120,80,120,80,200]);
}

function closeLevelUpModal(){ const overlay = document.getElementById('levelUpOverlay'); if(overlay) overlay.classList.remove('show'); }

const hardcoreFailMessages = [
  { title:"T'as craqué.",         sub:"Streak reset. Recommence depuis zéro.\nLa discipline se construit dans la douleur." },
  { title:"Raté.",                 sub:"Un jour de relâche = retour à zéro.\nC'est le mode hardcore. T'as choisi ça." },
  { title:"Zemel.",                sub:"Même pas une journée complète.\nStreak à zéro. On recommence." },
  { title:"Pas assez.",            sub:"100% ou rien. T'as pas fini.\nStreak reset. Reviens quand t'es prêt." },
];

function toggleHardcore(){
  hardcoreMode = !hardcoreMode; store.set('hardcoreMode', hardcoreMode);
  const toggle = document.getElementById('hardcoreToggle');
  if(toggle) toggle.classList.toggle('on', hardcoreMode);
  setTxt('hardcoreSub', hardcoreMode ? '🔴 ACTIF — Skip ou daily incomplet = streak reset' : 'Skip = streak reset. Zéro pitié.');
}

function triggerHardcoreFail(){
  const msg = hardcoreFailMessages[Math.floor(Math.random()*hardcoreFailMessages.length)];
  setTxt('hcTitle', msg.title); setTxt('hcSub', msg.sub);
  streakData.count = 0; store.set('streakData', streakData);
  const overlay = document.getElementById('hardcoreOverlay');
  if(overlay) overlay.classList.add('show');
  if(navigator.vibrate) navigator.vibrate([300,100,300,100,300]);
}

function closeHardcoreFail(){ const overlay = document.getElementById('hardcoreOverlay'); if(overlay) overlay.classList.remove('show'); updateHome(); }

/* ── INIT ── */
refreshCurDay();
updateHome();
updateGlobalRing();
autoSelectRunZone();

store.set('lastOpenDate', todayStr());
store.set('srCheckedToday', false);

const lastTab = store.get('lastTab','home');
if(lastTab !== 'home') switchTab(lastTab);
const hcToggle = document.getElementById('hardcoreToggle');
if(hcToggle) hcToggle.classList.toggle('on', hardcoreMode);