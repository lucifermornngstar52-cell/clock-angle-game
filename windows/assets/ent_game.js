/* ═══ ЭКЗАМЕН ХРОНОСА — бесконечная башня заданий ЕНТ ═══
   Формат: вопросы ЕНТ по математике, но таймер — это стрелка часов,
   которая делает оборот за всё меньшее время. Стрелка дошла до 12 — минус
   «час»-жизнь. Каждые 4 этажа — выбор перка. Бесконечно, до 0 жизней. */

var ENTG=null;

/* ── перки ── */
var ENT_PERKS=[
  {id:'slow',  ic:'🐌', n:'ЗАМЕДЛЕНИЕ',     d:'Стрелка Хроноса медленнее на 3 этажа'},
  {id:'hour',  ic:'⏳', n:'+1 ЧАС',         d:'Восстановить одну потерянную жизнь'},
  {id:'fifty', ic:'✂️', n:'50/50',          d:'Убрать 2 неверных ответа на 2 вопроса'},
  {id:'dbl',   ic:'💰', n:'ДВОЙНЫЕ МОНЕТЫ', d:'Монеты x2 на 5 этажей'},
  {id:'shield',ic:'🛡', n:'ЩИТ ХРОНОСА',    d:'Следующая ошибка не отнимет жизнь'}
];

function entMenu(){
  showS('sEnt-menu');
  var b=parseInt(localStorage.getItem('cag_ent_best')||'0');
  var f=parseInt(localStorage.getItem('cag_ent_floor')||'0');
  var e=document.getElementById('ent-best');
  if(e)e.textContent=f>0?('ЛУЧШИЙ РЕЗУЛЬТАТ: '+b+' очков · этаж '+f):'БАШНЯ ЖДЁТ ПЕРВОГО ХРОНОКИПЕРА';
}
function entRules(){showS('sEnt-rules');}

/* ── старт ── */
function entStart(){
  ENTG={on:true,floor:0,lives:3,maxlives:5,score:0,coins:0,streak:0,
        corr:0,total:0,perks:{slow:0,fifty:0,dbl:0,shield:0},
        q:null,timer:null,t0:0,revms:0,used:[],locked:false};
  showS('sEnt-game');
  entNext();
}

/* ── следующий этаж ── */
function entNext(){
  if(!ENTG)return;
  ENTG.floor++;
  // перк-рулетка каждые 4 этажа
  if(ENTG.floor>1&&ENTG.floor%4===0){entOfferPerks();return;}
  entQuestion();
}

function entPickQ(){
  var fl=ENTG.floor;
  var d=fl<4?1:(fl<9?2:(Math.random()<0.35?2:3));
  var pool=window.ENT_BY_D[d];
  for(var tries=0;tries<50;tries++){
    var q=pool[Math.floor(Math.random()*pool.length)];
    if(ENTG.used.indexOf(q.q)<0){ENTG.used.push(q.q);if(ENTG.used.length>24)ENTG.used.shift();return q;}
  }
  return pool[Math.floor(Math.random()*pool.length)];
}

function entQuestion(){
  var q=ENTG.q=entPickQ();
  // скорость оборота: с этажом быстрее, перк slow замедляет
  var rev=Math.max(15,60-3*(ENTG.floor-1));
  if(ENTG.perks.slow>0){rev=Math.round(rev*1.35);ENTG.perks.slow--;}
  ENTG.revms=rev*1000;
  entRenderHud();
  entRenderQ(q);
  entTickStart();
}

/* ── HUD ── */
function entRenderHud(){
  var lives='';
  for(var i=0;i<ENTG.maxlives;i++)lives+=(i<ENTG.lives?'⏳':'🕯');
  document.getElementById('ent-hud').innerHTML=
    '<div class="ent-hud-cell"><div class="vl-hud-lbl">ЭТАЖ</div><div class="vl-hud-val" style="color:#00f5ff;">'+ENTG.floor+'</div></div>'+
    '<div class="ent-hud-cell"><div class="vl-hud-lbl">ЖИЗНИ</div><div class="vl-hud-val" style="color:#ffd700;font-size:.8rem;">'+lives+'</div></div>'+
    '<div class="ent-hud-cell"><div class="vl-hud-lbl">ОЧКИ</div><div class="vl-hud-val" style="color:#97ce4c;">'+ENTG.score+'</div></div>'+
    '<div class="ent-hud-cell"><div class="vl-hud-lbl">СЕРИЯ</div><div class="vl-hud-val" style="color:#ff6b35;">'+(ENTG.streak>0?'🔥x'+ENTG.streak:'—')+'</div></div>'+
    '<div class="ent-hud-cell"><div class="vl-hud-lbl">ЗА ЗАБЕГ</div><div class="vl-hud-val" style="color:#ffd700;">+'+ENTG.coins+'🪙</div></div>';
  // активные перки
  var pr='';
  if(ENTG.perks.fifty>0)pr+='✂️×'+ENTG.perks.fifty+' ';
  if(ENTG.perks.dbl>0)pr+='💰×'+ENTG.perks.dbl+' ';
  if(ENTG.perks.shield>0)pr+='🛡 ';
  if(ENTG.perks.slow>0)pr+='🐌×'+ENTG.perks.slow+' ';
  document.getElementById('ent-perks-row').textContent=pr;
}

/* ── вопрос ── */
function entRenderQ(q){
  var box=document.getElementById('ent-qcard');
  var fifty=ENTG.perks.fifty>0;
  var hidden=[];
  if(fifty){
    ENTG.perks.fifty--;
    var wrongIdx=[];
    for(var i=0;i<5;i++)if(i!==q.c)wrongIdx.push(i);
    for(var s=wrongIdx.length-1;s>0;s--){var r=Math.floor(Math.random()*(s+1)),t=wrongIdx[s];wrongIdx[s]=wrongIdx[r];wrongIdx[r]=t;}
    hidden=wrongIdx.slice(0,2);
  }
  var LET=['А','Б','В','Г','Д'];
  var h='<div style="font-size:.55rem;color:#ff6b35;letter-spacing:2px;font-family:Orbitron,monospace;margin-bottom:6px;">// '+q.t.toUpperCase()+' · ЭТАЖ '+ENTG.floor+' //</div>'+
        '<div style="font-size:.85rem;line-height:1.45;margin-bottom:12px;">'+q.q+'</div><div id="ent-opts">';
  for(var j=0;j<5;j++){
    h+='<button class="ent-opt" '+(hidden.indexOf(j)>=0?'disabled style="opacity:.15;"':'')+' onclick="entResolve('+j+')">'+
       '<span class="ent-opt-l">'+LET[j]+'</span>'+q.o[j]+'</button>';
  }
  h+='</div><div id="ent-sol" class="hidden"></div>';
  box.innerHTML=h;
  box.style.borderColor='#1a2a4a';
}

/* ── таймер-стрелка ── */
function entTickStart(){
  clearInterval(ENTG.timer);
  ENTG.t0=Date.now();
  ENTG.locked=false;
  entDrawClock(0);
  ENTG.timer=setInterval(function(){
    if(!ENTG||!ENTG.on||ENTG.locked)return;
    var p=(Date.now()-ENTG.t0)/ENTG.revms;
    if(p>=1){entDrawClock(1);clearInterval(ENTG.timer);entResolve(-1);return;}
    entDrawClock(p);
  },40);
}
function entDrawClock(p){
  var hand=document.getElementById('ent-hand');
  if(!hand)return;
  var ang=Math.floor(p*360);
  hand.setAttribute('transform','rotate('+ang+' 100 100)');
  hand.setAttribute('stroke',p>0.75?'#ff3355':'#00f5ff');
  var secs=Math.max(0,Math.ceil((ENTG.revms*(1-p))/1000));
  var t=document.getElementById('ent-secs');
  t.textContent=secs;
  t.setAttribute('fill',p>0.75?'#ff3355':'#00f5ff');
}

/* ── ответ ── */
function entResolve(k){
  if(!ENTG||ENTG.locked)return;
  ENTG.locked=true;
  clearInterval(ENTG.timer);
  var q=ENTG.q,ok=(k===q.c);
  ENTG.total++;
  var opts=document.querySelectorAll('#ent-opts .ent-opt');
  for(var i=0;i<opts.length;i++){opts[i].disabled=true;}
  var correctBtn=opts[q.c];
  if(correctBtn)correctBtn.style.borderColor='#97ce4c';
  var sol=document.getElementById('ent-sol');
  var left=Math.max(0,Math.ceil((ENTG.revms-(Date.now()-ENTG.t0))/1000));
  if(ok){
    ENTG.corr++;ENTG.streak++;
    var gain=100+left*5+(ENTG.streak-1)*10;
    ENTG.score+=gain;
    var c=ENTG.perks.dbl>0?6:3;
    if(ENTG.perks.dbl>0)ENTG.perks.dbl--;
    if(ENTG.streak>0&&ENTG.streak%5===0)c+=10;
    ENTG.coins+=c;
    if(sol){sol.className='';sol.style.color='#97ce4c';sol.innerHTML='✅ ВЕРНО! +'+gain+' очков · +'+c+'🪙<br><span style="color:#889;font-size:.7rem;">'+q.s+'</span>';}
    sfx('ok');
    entRenderHud();
    setTimeout(function(){if(ENTG&&ENTG.on)entNext();},1500);
  } else {
    ENTG.streak=0;
    if(k>=0){var wrongBtn=opts[k];if(wrongBtn){wrongBtn.style.borderColor='#ff3355';wrongBtn.style.color='#ff3355';}}
    var shieldMsg='';
    if(ENTG.perks.shield>0){
      ENTG.perks.shield--;shieldMsg='<br><b style="color:#00f5ff;">🛡 ЩИТ ХРОНОСА СРАБОТАЛ — жизнь сохранена!</b>';
    } else {
      ENTG.lives--;
    }
    var out=ENTG.lives<=0;
    if(sol){sol.className='';sol.style.color='#ff3355';
      sol.innerHTML='❌ '+(k<0?'ВРЕМЯ ВЫШЛО!':'НЕВЕРНО!')+' Правильный ответ: '+q.o[q.c]+
        '<br><span style="color:#889;font-size:.7rem;">'+q.s+'</span>'+shieldMsg;}
    sfx('no');
    entRenderHud();
    setTimeout(function(){
      if(!ENTG||!ENTG.on)return;
      if(out)entOver();else entNext();
    },2600);
  }
}

/* ── перки ── */
function entOfferPerks(){
  clearInterval(ENTG.timer);
  var modal=document.getElementById('ent-perk-modal');
  var copy=ENT_PERKS.slice();
  for(var s=copy.length-1;s>0;s--){var r=Math.floor(Math.random()*(s+1)),t=copy[s];copy[s]=copy[r];copy[r]=t;}
  var offers=copy.slice(0,3);
  var h='<div style="font-size:.55rem;color:#ffd700;letter-spacing:2px;font-family:Orbitron,monospace;margin-bottom:4px;">ЭТАЖ '+ENTG.floor+' · ДАР ХРОНОСА</div>'+
        '<div style="font-size:.8rem;color:#aab;margin-bottom:10px;">Выбери одно усиление:</div>';
  offers.forEach(function(p){
    h+='<button class="ent-perk" onclick="entTakePerk(\''+p.id+'\')">'+
       '<span style="font-size:1.3rem;">'+p.ic+'</span><b style="color:#ffd700;">'+p.n+'</b><br><span style="font-size:.6rem;color:#889;">'+p.d+'</span></button>';
  });
  modal.innerHTML=h;
  modal.classList.remove('hidden');
}
function entTakePerk(id){
  var modal=document.getElementById('ent-perk-modal');
  modal.classList.add('hidden');
  if(id==='hour'){ENTG.lives=Math.min(ENTG.maxlives,ENTG.lives+1);}
  else if(id==='slow'){ENTG.perks.slow+=3;}
  else if(id==='fifty'){ENTG.perks.fifty+=2;}
  else if(id==='dbl'){ENTG.perks.dbl+=5;}
  else if(id==='shield'){ENTG.perks.shield++;}
  sfx('ok');
  entQuestion();
}

/* ── конец забега ── */
function entOver(){
  ENTG.on=false;
  SAVE.coins+=ENTG.coins;
  saveData();
  var b=parseInt(localStorage.getItem('cag_ent_best')||'0');
  var f=parseInt(localStorage.getItem('cag_ent_floor')||'0');
  var rec=ENTG.score>b;
  if(rec){localStorage.setItem('cag_ent_best',String(ENTG.score));localStorage.setItem('cag_ent_floor',String(ENTG.floor));}
  var acc=ENTG.total?Math.round(ENTG.corr/ENTG.total*100):0;
  document.getElementById('ent-over').innerHTML=
    '<div style="font-size:1.4rem;font-family:Orbitron,monospace;color:#ff3355;">ЧАСЫ ОСТАНОВЛЕНЫ</div>'+
    '<div style="font-size:.6rem;color:#889;margin:6px 0 14px;letter-spacing:2px;">// ЭКЗАМЕН ХРОНОСА ОКОНЧЕН //</div>'+
    '<div style="font-size:.95rem;color:#00f5ff;font-family:Orbitron,monospace;">ЭТАЖ: '+ENTG.floor+'</div>'+
    '<div style="font-size:.95rem;color:#97ce4c;font-family:Orbitron,monospace;margin-top:4px;">ОЧКИ: '+ENTG.score+(rec?' <b style="color:#ffd700;">РЕКОРД!</b>':'')+'</div>'+
    '<div style="font-size:.75rem;color:#aab;margin-top:6px;">Верно: '+ENTG.corr+' из '+ENTG.total+' ('+acc+'%)</div>'+
    '<div style="font-size:.75rem;color:#ffd700;margin-top:2px;">+'+ENTG.coins+' 🪙 зачислено</div>'+
    '<button class="btn btn-gold" style="margin-top:16px;" onclick="entStart()">[ 🔁 СНОВА ]</button>'+
    '<button class="btn" onclick="goMenu()">[ ← В МЕНЮ ]</button>';
  document.getElementById('ent-over').classList.remove('hidden');
  if(rec)sfx('up');
}

function entQuit(){
  clearInterval(ENTG&&ENTG.timer);
  if(ENTG)ENTG.on=false;
  goMenu();
}
