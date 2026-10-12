/* ═══ ПОЛЕ ХРОНОСА — настоящее «Поле Чудес» ═══
   3 игрока: ты и два бота с реальными именами. ЕНТ-термины по определениям.
   Угадал букву — крути дальше. Промах — ход сопернику. БАНКРОТ — банк сгорает.
   3 слова за игру. Кнопки: ПОДСКАЗКА (-25 монет) и ВЫХОД. */

var WOF_WORDS=[
 ['УРАВНЕНИЕ','Равенство, содержащее неизвестное'],
 ['ПРОЦЕНТ','Сотая часть числа'],
 ['ПРОПОРЦИЯ','Равенство двух отношений'],
 ['ВЕРОЯТНОСТЬ','Мера случайности события'],
 ['ГИПОТЕНУЗА','Сторона напротив прямого угла'],
 ['БИССЕКТРИСА','Луч, делящий угол пополам'],
 ['ПРОГРЕССИЯ','Последовательность чисел по закону'],
 ['ЛОГАРИФМ','Показатель степени: а в степени икс равно б'],
 ['ПРОИЗВОДНАЯ','Скорость изменения функции'],
 ['ПЕРИМЕТР','Сумма длин всех сторон фигуры'],
 ['ПЛОЩАДЬ','Величина поверхности фигуры'],
 ['ТРЕУГОЛЬНИК','Три вершины и три стороны'],
 ['ОКРУЖНОСТЬ','Все точки равноудалены от центра'],
 ['РАДИУС','Отрезок от центра до окружности'],
 ['ДИАМЕТР','Хорда, проходящая через центр'],
 ['ФУНКЦИЯ','Зависимость переменной от переменной'],
 ['НЕРАВЕНСТВО','Со знаком больше или меньше'],
 ['ДРОБЬ','Числитель и знаменатель'],
 ['КОРЕНЬ','Значение неизвестного, при котором верно'],
 ['СТЕПЕНЬ','Произведение равных множителей'],
 ['ТЕОРЕМА','Утверждение, требующее доказательства'],
 ['АКСИОМА','Принимается без доказательства'],
 ['ВЕКТОР','Отрезок с направлением'],
 ['СИММЕТРИЯ','Зеркальное отражение фигуры'],
 ['ПАРАЛЛЕЛОГРАММ','Противоположные стороны параллельны'],
 ['ТРАПЕЦИЯ','Две параллельные, две — нет'],
 ['КОНУС','Тело вращения треугольника'],
 ['ЦИЛИНДР','Тело вращения прямоугольника'],
 ['ПИРАМИДА','Основание и треугольные грани'],
 ['МЕДИАНА','Отрезок к середине стороны'],
 ['ВЫСОТА','Перпендикуляр к основанию'],
 ['ДИАГОНАЛЬ','Соединяет несоседние вершины'],
 ['МАСШТАБ','Отношение карты к местности'],
 ['КОСИНУС','Прилежащий катет к гипотенузе'],
 ['ТАНГЕНС','Синус, делённый на косинус'],
 ['ХОРДА','Отрезок двух точек окружности'],
 ['КАСАТЕЛЬНАЯ','Одна общая точка с окружностью'],
 ['АРГУМЕНТ','Независимая переменная'],
 ['ЧАСТНОЕ','Результат деления'],
 ['ПРОИЗВЕДЕНИЕ','Результат умножения'],
 ['ИНТЕГРАЛ','Первообразная, площадь под графиком']
];

/* 12 секторов колеса */
var WOF_SECTORS=[
 {t:'v',v:50,c:'#1a3a6b',l:'50'},
 {t:'v',v:100,c:'#16325f',l:'100'},
 {t:'x2',v:0,c:'#4a1f6f',l:'×2'},
 {t:'v',v:150,c:'#1a3a6b',l:'150'},
 {t:'bank',v:0,c:'#7a1f2b',l:'БАНКРОТ'},
 {t:'v',v:100,c:'#16325f',l:'100'},
 {t:'prize',v:0,c:'#8a6d1f',l:'ПРИЗ'},
 {t:'v',v:250,c:'#1a3a6b',l:'250'},
 {t:'v',v:50,c:'#16325f',l:'50'},
 {t:'v',v:200,c:'#1a3a6b',l:'200'},
 {t:'v',v:100,c:'#16325f',l:'100'},
 {t:'v',v:150,c:'#1a3a6b',l:'150'}
];

var WOF_BOTS=['Айгерим','Ерлан','Дана','Марат','Асель','Тимур','Мадина','Санжар','Алия','Нурлан','Асхат','Камила','Ержан','Сабина','Данияр','Камила'];

var WOF=null;
var WOF_KEYS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';
var WOF_HINT_COST=25;

function wofMenu(){
  showS('sPole-menu');
  var b=parseInt(localStorage.getItem('cag_pole_best')||'0');
  var e=document.getElementById('wof-best');
  if(e)e.textContent=b>0?('ЛУЧШИЙ РЕЗУЛЬТАТ: '+b+' монет за забег'):'КОЛЕСО ЖДЁТ ПЕРВОГО ИГРОКА';
}

function wofStart(){
  var pool=WOF_WORDS.slice();
  for(var s=pool.length-1;s>0;s--){var r=Math.floor(Math.random()*(s+1)),t=pool[s];pool[s]=pool[r];pool[r]=t;}
  var bots=WOF_BOTS.slice();
  for(var s2=bots.length-1;s2>0;s2--){var r2=Math.floor(Math.random()*(s2+1)),t2=bots[s2];bots[s2]=bots[r2];bots[r2]=t2;}
  WOF={words:pool.slice(0,3),idx:0,turn:0,used:{},opened:[],spinVal:null,
       mult:false,spinning:false,rot:0,coins:0,over:false,timers:[],exitArmed:0,
       players:[
         {name:'ТЫ',bot:false,bank:0,total:0,wins:0},
         {name:bots[0],bot:true,bank:0,total:0,wins:0},
         {name:bots[1],bot:true,bank:0,total:0,wins:0}
       ]};
  showS('sPole-game');
  wofWord();
}

function wofLater(fn,ms){ // таймеры забега, чистятся при выходе
  var id=setTimeout(fn,ms);
  WOF.timers.push(id);
  return id;
}
function wofClearTimers(){ if(!WOF)return; WOF.timers.forEach(clearTimeout); WOF.timers=[]; }

function wofWord(){
  var w=WOF.words[WOF.idx];
  WOF.used={};WOF.opened=[];WOF.spinVal=null;WOF.mult=false;WOF.spinning=false;
  for(var i=0;i<3;i++)WOF.players[i].bank=0;
  WOF.turn=WOF.idx%3; // стартовый игрок меняется от слова к слову
  document.getElementById('wof-over').classList.add('hidden');
  document.getElementById('wof-worddone').classList.add('hidden');
  wofRender();
  wofTurnMsg();
  if(WOF.players[WOF.turn].bot)wofLater(wofBotTurn,1200);
}

function wofCur(){return WOF.players[WOF.turn];}

function wofTurnMsg(){
  var p=wofCur();
  var fb=document.getElementById('wof-fb');
  if(p.bot)fb.innerHTML='<b style="color:#c47aff;">'+p.name+'</b> думает над буквой...';
  else fb.innerHTML='Твой ход! Крути колесо 🎡';
  document.getElementById('wof-spinbtn').disabled=p.bot||WOF.spinning;
  var hb=document.getElementById('wof-hintbtn');
  hb.disabled=p.bot||SAVE.coins<WOF_HINT_COST||WOF.over;
  hb.textContent='💡 ПОДСКАЗКА (−'+WOF_HINT_COST+'🪙)';
}

function wofRender(){
  if(!WOF)return;
  var w=WOF.words[WOF.idx];
  // слоты — белые, как в телешоу
  var h='';
  for(var i=0;i<w[0].length;i++){
    var known=WOF.opened.indexOf(i)>=0;
    h+='<div class="wof-slot">'+(known?w[0][i]:'')+'</div>';
  }
  document.getElementById('wof-slots').innerHTML=h;
  document.getElementById('wof-clue').textContent='«'+w[1]+'»';
  // клавиатура: активна только в твой ход со спином
  var canPlay=!WOF.players[WOF.turn].bot&&WOF.spinVal!==null&&!WOF.spinning&&!WOF.over;
  var kb='';
  for(var j=0;j<WOF_KEYS.length;j++){
    var L=WOF_KEYS[j],inWord=w[0].indexOf(L)>=0,got=WOF.used[L];
    var cls='wof-key'+(got?(inWord?' hit':' miss'):'');
    kb+='<button class="'+cls+'" '+((got||!canPlay)?'disabled ':'')+'onclick="wofLetter(\''+L+'\')">'+L+'</button>';
  }
  document.getElementById('wof-keys').innerHTML=kb;
  // панель игроков
  var ph='';
  WOF.players.forEach(function(p,i){
    var act=i===WOF.turn;
    ph+='<div class="wof-pl'+(act?' active':'')+'">'+
        '<div style="font-size:.62rem;color:'+(p.bot?'#c47aff':'#00f5ff')+';">'+(act?'▶ ':'')+p.name+'</div>'+
        '<div style="font-size:.8rem;color:#ffd700;font-family:Orbitron,monospace;">'+p.bank+'</div>'+
        '<div style="font-size:.5rem;color:#678;">∑'+p.total+' · '+p.wins+'★</div></div>';
  });
  document.getElementById('wof-players').innerHTML=ph;
  // HUD
  document.getElementById('wof-hud').innerHTML=
    '<div class="vl-hud-lbl">СЛОВО</div><div class="vl-hud-val" style="color:#00f5ff;">'+(WOF.idx+1)+'/3</div>'+
    '<div class="vl-hud-lbl">ОТКРЫТО</div><div class="vl-hud-val" style="color:#97ce4c;">'+WOF.opened.length+'/'+w[0].length+'</div>'+
    '<div class="vl-hud-lbl">МОНЕТЫ</div><div class="vl-hud-val" style="color:#ffd700;">'+SAVE.coins+'🪙</div>';
}

/* ── колесо ── */
function wofSpin(){
  if(!WOF||WOF.spinning||WOF.spinVal!==null||WOF.over)return;
  WOF.spinning=true;
  wofRender();
  document.getElementById('wof-fb').textContent='Колесо вращается...';
  var si=Math.floor(Math.random()*12);
  var center=si*30+15;
  var jitter=(Math.random()*20-10);
  var target=(270-center-jitter)%360;
  WOF.rot+=360*(4+Math.floor(Math.random()*3));
  var cur=((WOF.rot%360)+360)%360;
  WOF.rot+=(((target-cur)%360)+360)%360;
  var wheel=document.getElementById('wof-wheelinner');
  wheel.style.transform='rotate('+WOF.rot+'deg)';
  wofLater(function(){
    if(!WOF||WOF.over)return;
    WOF.spinning=false;
    var sec=WOF_SECTORS[si],p=wofCur();
    if(sec.t==='bank'){
      p.bank=0;sfx('no');
      document.getElementById('wof-fb').innerHTML='<b style="color:#ff3355;">БАНКРОТ! Банк '+(p.bot?p.name:'твой')+' сгорел.</b>';
      wofRender();
      wofLater(wofNextTurn,1400);
    } else if(sec.t==='prize'){
      sfx('ok');
      document.getElementById('wof-fb').innerHTML='<b style="color:#ffd700;">ПРИЗ! Буква откроется бесплатно.</b>';
      wofOpenFree();
    } else if(sec.t==='x2'){
      WOF.mult=true;sfx('ok');
      document.getElementById('wof-fb').innerHTML='<b style="color:#c47aff;">×2! Следующая буква '+(p.bot?'у '+p.name:'у тебя')+' даст двойные очки. Крути ещё раз!</b>';
      WOF.spinVal=null;
      wofRender();
      if(p.bot)wofLater(wofBotTurn,900);
      else wofTurnMsg();
    } else {
      WOF.spinVal=sec.v;sfx('ok');
      document.getElementById('wof-fb').innerHTML='Сектор: <b style="color:#00f5ff;">'+sec.v+' очков</b>. '+(p.bot?p.name+', буква?':'Выбирай букву!');
      wofRender();
      if(p.bot)wofLater(wofBotGuess,900);
      else wofTurnMsg();
    }
  },1700);
}

function wofOpenFree(){
  var w=WOF.words[WOF.idx];
  var hidden=[];
  for(var i=0;i<w[0].length;i++)if(WOF.opened.indexOf(i)<0)hidden.push(i);
  if(hidden.length===0)return;
  var pick=hidden[Math.floor(Math.random()*hidden.length)];
  WOF.opened.push(pick);
  var L=w[0][pick];
  // призная буква приносит по 100 за вхождение, ход остаётся у игрока
  var cnt=0;
  for(var j=0;j<w[0].length;j++)if(w[0][j]===L&&WOF.opened.indexOf(j)<0){WOF.opened.push(j);cnt++;}
  var p=wofCur();p.bank+=100*Math.max(1,cnt);
  sfx('ok');
  if(WOF.opened.length>=w[0].length){wofRender();wofLater(function(){wofRoundEnd();},600);return;}
  WOF.spinVal=null;
  wofRender();
  if(p.bot)wofLater(wofBotTurn,700);
  else wofLater(wofTurnMsg,400);
}

/* ── ход бота ── */
function wofBotTurn(){
  if(!WOF||WOF.over||!wofCur().bot)return;
  wofSpin();
}
function wofBotGuess(){
  if(!WOF||WOF.over||!wofCur().bot)return;
  var w=WOF.words[WOF.idx];
  // 65% бот назовёт верную букву
  var L;
  if(Math.random()<0.65){
    var good=[];
    for(var i=0;i<w[0].length;i++){var c=w[0][i];if(!WOF.used[c]&&good.indexOf(c)<0)good.push(c);}
    if(good.length>0)L=good[Math.floor(Math.random()*good.length)];
  }
  if(!L){
    var bad=[];
    for(var j=0;j<WOF_KEYS.length;j++){var k=WOF_KEYS[j];if(w[0].indexOf(k)<0&&!WOF.used[k])bad.push(k);}
    L=bad.length>0?bad[Math.floor(Math.random()*bad.length)]:WOF_KEYS[0];
  }
  wofLetter(L);
}

/* ── буква ── */
function wofLetter(L){
  if(!WOF||WOF.over||WOF.spinning)return;
  var p=wofCur();
  if(!p.bot&&WOF.spinVal===null)return;
  if(p.bot&&WOF.spinVal===null)return;
  if(WOF.used[L])return;
  var w=WOF.words[WOF.idx];
  WOF.used[L]=1;
  var idxs=[];
  for(var i=0;i<w[0].length;i++)if(w[0][i]===L)idxs.push(i);
  var fb=document.getElementById('wof-fb');
  if(idxs.length>0){
    var gain=WOF.spinVal*idxs.length*(WOF.mult?2:1);
    WOF.mult=false;
    p.bank+=gain;
    for(var j=0;j<idxs.length;j++)WOF.opened.push(idxs[j]);
    sfx('ok');
    fb.innerHTML='Есть такая буква! <b style="color:#97ce4c;">'+p.name+' +'+gain+' очков</b>';
    WOF.spinVal=null;
    if(WOF.opened.length>=w[0].length){wofRender();wofLater(function(){wofRoundEnd();},900);return;}
    wofRender();
    // угадал — крутит снова
    if(p.bot)wofLater(wofBotTurn,900);else wofTurnMsg();
  } else {
    WOF.mult=false;
    sfx('no');
    fb.innerHTML='<b style="color:#ff3355;">Нет такой буквы!</b> Ход переходит дальше.';
    WOF.spinVal=null;
    wofRender();
    wofLater(wofNextTurn,1100);
  }
}

function wofNextTurn(){
  if(!WOF||WOF.over)return;
  WOF.turn=(WOF.turn+1)%3;
  WOF.spinVal=null;
  wofRender();
  wofTurnMsg();
  if(wofCur().bot)wofLater(wofBotTurn,900);
}

/* ── подсказка ── */
function wofHint(){
  if(!WOF||WOF.over||wofCur().bot)return;
  if(SAVE.coins<WOF_HINT_COST){showFb('Недостаточно монет!','err');return;}
  var w=WOF.words[WOF.idx];
  var hidden=[];
  for(var i=0;i<w[0].length;i++)if(WOF.opened.indexOf(i)<0)hidden.push(i);
  if(hidden.length===0)return;
  SAVE.coins-=WOF_HINT_COST;
  saveData();
  var pick=hidden[Math.floor(Math.random()*hidden.length)];
  var L=w[0][pick];
  var idxs=[];
  for(var j=0;j<w[0].length;j++)if(w[0][j]===L&&WOF.opened.indexOf(j)<0)idxs.push(j);
  for(var k=0;k<idxs.length;k++)WOF.opened.push(idxs[k]);
  WOF.used[L]=1;
  sfx('ok');
  document.getElementById('wof-fb').innerHTML='💡 Подсказка: буква <b style="color:#ffd700;">'+L+'</b> открыта!';
  if(WOF.opened.length>=w[0].length){wofRender();wofLater(function(){wofRoundEnd();},700);return;}
  wofRender();
  wofTurnMsg();
}

/* ── конец слова ── */
function wofRoundEnd(){
  var w=WOF.words[WOF.idx];
  var p=wofCur();
  p.total+=p.bank;p.wins++;
  var yourWin=!p.bot;
  var box=document.getElementById('wof-worddone');
  box.innerHTML='<div style="font-size:1.1rem;font-family:Orbitron,monospace;color:'+(yourWin?'#97ce4c':'#ff3355')+';">СЛОВО ОТКРЫТО!</div>'+
    '<div style="font-size:.7rem;color:#889;margin-top:4px;">его угадал(а): <b style="color:'+(yourWin?'#00f5ff':'#c47aff')+';">'+p.name+'</b></div>'+
    '<div style="font-size:1.3rem;color:#00f5ff;font-family:Orbitron,monospace;margin:10px 0;letter-spacing:3px;">'+w[0]+'</div>'+
    '<div style="font-size:.7rem;color:#889;margin-bottom:8px;">'+w[1]+'</div>'+
    '<div style="font-size:.8rem;color:#ffd700;">+'+p.bank+' очков в зачёт '+p.name+'</div>'+
    '<button class="btn btn-gold" style="margin-top:14px;" onclick="wofNextWord()">[ '+(WOF.idx>=2?'ИТОГИ':'ДАЛЬШЕ →')+' ]</button>';
  box.classList.remove('hidden');
  sfx(yourWin?'up':'no');
}

function wofNextWord(){
  WOF.idx++;
  if(WOF.idx>=3){wofOver();return;}
  wofWord();
}

function wofOver(){
  WOF.over=true;
  var me=WOF.players[0];
  var coins=Math.floor(me.total/2);
  WOF.coins=coins;
  SAVE.coins+=coins;
  saveData();
  var best=parseInt(localStorage.getItem('cag_pole_best')||'0');
  var rec=coins>best;
  if(rec)localStorage.setItem('cag_pole_best',String(coins));
  var sorted=WOF.players.slice().sort(function(a,b){return b.total-a.total;});
  var winner=sorted[0];
  var ph=sorted.map(function(p,i){return (i+1)+'. '+p.name+' — '+p.total+(p.wins?' ('+p.wins+'★)':'');}).join('<br>');
  var box=document.getElementById('wof-over');
  box.innerHTML='<div style="font-size:1.2rem;font-family:Orbitron,monospace;color:#ffd700;">ИГРА ОКОНЧЕНА</div>'+
    '<div style="font-size:.85rem;color:'+(winner.bot?'#ff3355':'#97ce4c')+';margin:8px 0;font-family:Orbitron,monospace;">ПОБЕДИТЕЛЬ: '+winner.name+'</div>'+
    '<div style="font-size:.72rem;color:#aab;margin:8px 0;line-height:1.6;">'+ph+'</div>'+
    '<div style="font-size:.9rem;color:#97ce4c;font-family:Orbitron,monospace;">+'+coins+' 🪙'+(rec?' <b style="color:#ffd700;">РЕКОРД!</b>':'')+'</div>'+
    '<button class="btn btn-gold" style="margin-top:14px;" onclick="wofStart()">[ 🔁 СНОВА ]</button>'+
    '<button class="btn" onclick="goMenu()">[ ← В МЕНЮ ]</button>';
  box.classList.remove('hidden');
  if(!winner.bot)sfx('up');
}

/* ── выход с подтверждением ── */
function wofExit(){
  if(!WOF)return;
  var btn=document.getElementById('wof-exitbtn');
  if(!WOF.exitArmed||Date.now()-WOF.exitArmed>3000){
    WOF.exitArmed=Date.now();
    btn.textContent='ТОЧНО ВЫЙТИ?';
    wofLater(function(){if(WOF&&btn)btn.textContent='ВЫХОД';},3000);
    return;
  }
  wofClearTimers();
  // монеты за завершённые слова зачитываем, банк текущего слова сгорает
  var coins=Math.floor(WOF.players[0].total/2);
  if(coins>0){SAVE.coins+=coins;saveData();}
  WOF=null;
  goMenu();
}
function wofQuit(){wofClearTimers();WOF=null;goMenu();}

/* ── построение колеса ── */
function wofBuildWheel(){
  var svg=document.getElementById('wof-wheel');
  if(!svg||svg.dataset.built)return;
  var h='<div class="wof-ptr">▼</div>';
  var s='';
  for(var i=0;i<12;i++){
    var a0=i*30-90,a1=(i+1)*30-90;
    var r=88;
    var x0=(100+r*Math.cos(a0*Math.PI/180)).toFixed(1),y0=(100+r*Math.sin(a0*Math.PI/180)).toFixed(1);
    var x1=(100+r*Math.cos(a1*Math.PI/180)).toFixed(1),y1=(100+r*Math.sin(a1*Math.PI/180)).toFixed(1);
    s+='<path d="M100,100 L'+x0+','+y0+' A'+r+','+r+' 0 0,1 '+x1+','+y1+' Z" fill="'+WOF_SECTORS[i].c+'" stroke="#0a0f20" stroke-width="1"/>';
    var am=(a0+a1)/2;
    var tx=(100+52*Math.cos(am*Math.PI/180)).toFixed(1),ty=(100+52*Math.sin(am*Math.PI/180)).toFixed(1);
    var isBig=WOF_SECTORS[i].t!=='v';
    s+='<text x="'+tx+'" y="'+ty+'" fill="'+(isBig?'#fff':'#8fd7ff')+'" font-size="'+(WOF_SECTORS[i].l.length>3?7:10)+'" text-anchor="middle" dominant-baseline="middle" font-family="Orbitron,monospace" transform="rotate('+(am+90)+' '+tx+' '+ty+')">'+WOF_SECTORS[i].l+'</text>';
  }
  s+='<circle cx="100" cy="100" r="16" fill="#0a0f20" stroke="#00f5ff" stroke-width="2"/>';
  svg.innerHTML=h+'<svg id="wof-wheelinner" viewBox="0 0 200 200" style="width:100%;height:100%;transition:transform 1.6s cubic-bezier(.15,.9,.25,1);">'+s+'</svg>';
  svg.dataset.built='1';
}
