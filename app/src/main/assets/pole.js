/* ═══ ПОЛЕ ХРОНОСА — словесная игра в формате «Поле Чудес» ═══
   Угадай математический термин по определению: крути колесо очков,
   открывай буквы, берегись БАНКРОТА. 5 слов за забег. */

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

var WOF=null;
var WOF_KEYS='АБВГДЕЁЖЗИЙКЛМНОПРСТУФХЦЧШЩЪЫЬЭЮЯ';

function wofMenu(){
  showS('sPole-menu');
  var b=parseInt(localStorage.getItem('cag_pole_best')||'0');
  var e=document.getElementById('wof-best');
  if(e)e.textContent=b>0?('ЛУЧШИЙ РЕЗУЛЬТАТ: '+b+' монет за забег'):'КОЛЕСО ЖДЁТ ПЕРВОГО КРУПЬЕ';
}

function wofStart(){
  var pool=WOF_WORDS.slice();
  for(var s=pool.length-1;s>0;s--){var r=Math.floor(Math.random()*(s+1)),t=pool[s];pool[s]=pool[r];pool[r]=t;}
  WOF={words:pool.slice(0,5),idx:0,bank:0,wrong:0,maxw:3,used:{},spinVal:null,
       mult:false,spinning:false,rot:0,coins:0,opened:[],done:false};
  showS('sPole-game');
  wofWord();
}

function wofWord(){
  var w=WOF.words[WOF.idx];
  WOF.bank=0;WOF.wrong=0;WOF.used={};WOF.spinVal=null;WOF.mult=false;
  WOF.opened=[];WOF.spinning=false;
  document.getElementById('wof-over').classList.add('hidden');
  document.getElementById('wof-worddone').classList.add('hidden');
  wofRender();
}

function wofRender(){
  var w=WOF.words[WOF.idx];
  // слоты букв
  var h='';
  for(var i=0;i<w[0].length;i++){
    var known=WOF.opened.indexOf(i)>=0;
    h+='<div class="wof-slot">'+(known?w[0][i]:'')+'</div>';
  }
  document.getElementById('wof-slots').innerHTML=h;
  document.getElementById('wof-clue').textContent='«'+w[1]+'»';
  // подсказка-определение на экране всегда видна
  // клавиатура
  var kb='';
  for(var j=0;j<WOF_KEYS.length;j++){
    var L=WOF_KEYS[j],inWord=w[0].indexOf(L)>=0,got=WOF.used[L];
    var cls='wof-key'+(got?(inWord?' hit':' miss'):'');
    kb+='<button class="'+cls+'" '+(got?'disabled':'')+' onclick="wofLetter(\''+L+'\')">'+L+'</button>';
  }
  document.getElementById('wof-keys').innerHTML=kb;
  // HUD
  var hearts='';
  for(var k=0;k<WOF.maxw;k++)hearts+=(k<WOF.wrong?'💔':'❤');
  document.getElementById('wof-hud').innerHTML=
    '<div class="vl-hud-lbl">СЛОВО</div><div class="vl-hud-val" style="color:#00f5ff;">'+(WOF.idx+1)+'/5</div>'+
    '<div class="vl-hud-lbl">БАНК</div><div class="vl-hud-val" style="color:#ffd700;">'+WOF.bank+'</div>'+
    '<div class="vl-hud-lbl">ПРОМАХИ</div><div class="vl-hud-val" style="font-size:.8rem;">'+hearts+'</div>'+
    '<div class="vl-hud-lbl">МОНЕТЫ</div><div class="vl-hud-val" style="color:#97ce4c;">+'+WOF.coins+'🪙</div>';
  document.getElementById('wof-spinbtn').disabled=WOF.spinning;
  document.getElementById('wof-spinbtn').textContent=(WOF.spinVal===null&&!WOF.spinning)?'🎡 КРУТИТЬ':'...';
}

function wofSpin(){
  if(!WOF||WOF.spinning||WOF.spinVal!==null)return;
  WOF.spinning=true;
  wofRender();
  document.getElementById('wof-fb').textContent='Колесо вращается...';
  var si=Math.floor(Math.random()*12);
  var center=si*30+15;
  var jitter=(Math.random()*20-10);
  var target=(270-center-jitter)%360;
  // полный прогресс вращения: 4-6 оборотов + точный довод до сектора
  WOF.rot+=360*(4+Math.floor(Math.random()*3));
  var cur=((WOF.rot%360)+360)%360;
  WOF.rot+=(((target-cur)%360)+360)%360;
  var wheel=document.getElementById('wof-wheel');
  wheel.style.transform='rotate('+WOF.rot+'deg)';
  setTimeout(function(){
    WOF.spinning=false;
    var sec=WOF_SECTORS[si];
    if(sec.t==='bank'){WOF.bank=0;sfx('no');document.getElementById('wof-fb').innerHTML='<b style="color:#ff3355;">БАНКРОТ! Банк обнулён.</b>';}
    else if(sec.t==='prize'){sfx('ok');document.getElementById('wof-fb').innerHTML='<b style="color:#ffd700;">ПРИЗ! Одна буква откроется бесплатно.</b>';wofOpenFree();}
    else if(sec.t==='x2'){WOF.mult=true;sfx('ok');document.getElementById('wof-fb').innerHTML='<b style="color:#c47aff;">×2! Следующая буква даст двойные очки.</b>';}
    else{WOF.spinVal=sec.v;sfx('ok');document.getElementById('wof-fb').innerHTML='Сектор: <b style="color:#00f5ff;">'+sec.v+' очков</b>. Выбери букву!';}
    wofRender();
  },3000);
}

function wofOpenFree(){
  var w=WOF.words[WOF.idx];
  var hidden=[];
  for(var i=0;i<w[0].length;i++)if(WOF.opened.indexOf(i)<0)hidden.push(i);
  if(hidden.length>0){
    var pick=hidden[Math.floor(Math.random()*hidden.length)];
    WOF.opened.push(pick);
    if(WOF.opened.length>=w[0].length){setTimeout(function(){wofDone(true);},600);return;}
  }
}

function wofLetter(L){
  if(!WOF||WOF.spinning||WOF.spinVal===null||WOF.used[L])return;
  var w=WOF.words[WOF.idx];
  WOF.used[L]=1;
  var idxs=[];
  for(var i=0;i<w[0].length;i++)if(w[0][i]===L)idxs.push(i);
  if(idxs.length>0){
    var gain=WOF.spinVal*idxs.length*(WOF.mult?2:1);
    WOF.mult=false;
    WOF.bank+=gain;
    for(var j=0;j<idxs.length;j++)WOF.opened.push(idxs[j]);
    sfx('ok');
    document.getElementById('wof-fb').innerHTML='Есть такая буква! ×'+idxs.length+' → <b style="color:#97ce4c;">+'+gain+' очков</b>';
    WOF.spinVal=null;
    if(WOF.opened.length>=w[0].length){wofRender();setTimeout(function(){wofDone(true);},700);return;}
  } else {
    WOF.wrong++;WOF.mult=false;
    sfx('no');
    document.getElementById('wof-fb').innerHTML='<b style="color:#ff3355;">Нет такой буквы!</b> Промах '+WOF.wrong+' из '+WOF.maxw;
    WOF.spinVal=null;
    if(WOF.wrong>=WOF.maxw){wofRender();setTimeout(function(){wofDone(false);},900);return;}
  }
  wofRender();
}

function wofDone(ok){
  var w=WOF.words[WOF.idx];
  var got=0;
  if(ok){got=Math.floor(WOF.bank/2);WOF.coins+=got;}
  var box=document.getElementById('wof-worddone');
  box.innerHTML='<div style="font-size:1.1rem;font-family:Orbitron,monospace;color:'+(ok?'#97ce4c':'#ff3355')+';">'+(ok?'СЛОВО ОТКРЫТО!':'ПРОМАХОВ СЛИШКОМ МНОГО')+'</div>'+
    '<div style="font-size:1.3rem;color:#00f5ff;font-family:Orbitron,monospace;margin:8px 0;letter-spacing:3px;">'+w[0]+'</div>'+
    '<div style="font-size:.7rem;color:#889;margin-bottom:8px;">'+w[1]+'</div>'+
    '<div style="font-size:.8rem;color:#ffd700;">'+(ok?'+'+got+' 🪙':'+0 🪙')+'</div>'+
    '<button class="btn btn-gold" style="margin-top:14px;" onclick="wofNext()">[ '+(WOF.idx>=4?'ИТОГИ':'ДАЛЬШЕ →')+' ]</button>';
  box.classList.remove('hidden');
  sfx(ok?'up':'no');
}

function wofNext(){
  WOF.idx++;
  if(WOF.idx>=5){wofOver();return;}
  wofWord();
}

function wofOver(){
  SAVE.coins+=WOF.coins;saveData();
  var best=parseInt(localStorage.getItem('cag_pole_best')||'0');
  var rec=WOF.coins>best;
  if(rec)localStorage.setItem('cag_pole_best',String(WOF.coins));
  var words=WOF.words.map(function(w,i){return (i+1)+'. '+w[0];}).join('<br>');
  var box=document.getElementById('wof-over');
  box.innerHTML='<div style="font-size:1.2rem;font-family:Orbitron,monospace;color:#ffd700;">ИГРА ОКОНЧЕНА</div>'+
    '<div style="font-size:.75rem;color:#aab;margin:8px 0;">'+words+'</div>'+
    '<div style="font-size:1rem;color:#97ce4c;font-family:Orbitron,monospace;">+'+WOF.coins+' 🪙'+(rec?' <b style="color:#ffd700;">РЕКОРД!</b>':'')+'</div>'+
    '<button class="btn btn-gold" style="margin-top:14px;" onclick="wofStart()">[ 🔁 СНОВА ]</button>'+
    '<button class="btn" onclick="goMenu()">[ ← В МЕНЮ ]</button>';
  box.classList.remove('hidden');
  if(rec)sfx('up');
}

function wofQuit(){
  WOF=null;goMenu();
}

/* построение колеса */
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
  svg.innerHTML=h+'<svg id="wof-wheelinner" viewBox="0 0 200 200" style="width:100%;height:100%;transition:transform 3s cubic-bezier(.15,.9,.25,1);">'+s+'</svg>';
  svg.dataset.built='1';
  // вращение применяем к внутреннему svg
}
