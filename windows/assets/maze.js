/* ═══ ЛАБИРИНТ ЕНТ — побег из лабиринта ═══
   Ты против двух ботов-соперников. Поле 24 клетки: путь, препятствия,
   сокровища, испытания и порталы. Кто первый добрался до финиша — победил. */
var MZG=null;
var MZ_NAMES=['Айгерим','Ерлан','Дана','Марат','Камила','Сабина','Мадина','Тимур','Асель','Нурлан'];
var MZ_COLORS=['#ffd700','#00f5ff','#ff5fa2'];
var MZ_TYPES={
  path:{e:'🟢',c:'#97ce4c',n:'ПУТЬ'},
  wall:{e:'🔴',c:'#ff3355',n:'ПРЕПЯТСТВИЕ'},
  star:{e:'⭐',c:'#ffd700',n:'СОКРОВИЩЕ'},
  fire:{e:'🔥',c:'#ff6b35',n:'ИСПЫТАНИЕ'},
  portal:{e:'🔄',c:'#c47aff',n:'ПОРТАЛ'}
};
var MZ_BOT_OK=0.55; // шанс бота ответить верно

function mzShuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}

function mazeMenu(){
  showS('sMaze-menu');
  var w=+(localStorage.getItem('maze_wins')||0);
  var b=+(localStorage.getItem('maze_best')||0);
  document.getElementById('mz-best').innerHTML='ПОБЕД: '+w+(b?' · ЛУЧШИЙ ЗАБЕГ: '+b+'🪙':'');
}

function mazeStart(){
  var cells=[].concat(
    Array(8).fill('path'),Array(4).fill('wall'),
    Array(3).fill('star'),Array(3).fill('fire'),Array(4).fill('portal'));
  mzShuffle(cells);
  var board=[{k:'start'}];
  for(var i=0;i<22;i++)board.push({k:cells[i]});
  board.push({k:'finish'});
  var names=mzShuffle(MZ_NAMES.slice()).slice(0,2);
  MZG={on:true,board:board,turn:-1,busy:false,pend:null,
    players:[
      {name:'ТЫ',bot:false,pos:0,frozen:0,ok:0},
      {name:names[0],bot:true,pos:0,frozen:0,ok:0},
      {name:names[1],bot:true,pos:0,frozen:0,ok:0}]};
  showS('sMaze-game');
  mazeRender();
  mzFb('Побег начался! Первым ходит ТЫ.');
  setTimeout(mazeNext,600);
}

function mzFb(html){document.getElementById('mz-fb').innerHTML=html;}

function mazeRender(){
  if(!MZG)return;
  var g=document.getElementById('mz-board');
  var html='';
  for(var r=0;r<4;r++){
    html+='<div class="mz-row">';
    for(var c=0;c<6;c++){
      var idx=r*6+(r%2===0?c:5-c);
      var cell=MZG.board[idx];
      var e='▶',col='var(--dg)';
      if(MZ_TYPES[cell.k]){e=MZ_TYPES[cell.k].e;col=MZ_TYPES[cell.k].c;}
      else if(cell.k==='finish'){e='🏁';col='#97ce4c';}
      var toks='';
      for(var pi=0;pi<MZG.players.length;pi++){
        var p=MZG.players[pi];
        if(p.pos===idx)toks+='<span class="mz-tok" style="background:'+MZ_COLORS[pi]+';right:'+(2+pi*13)+'px;">'+(p.frozen?'❄':'')+'</span>';
      }
      html+='<div class="mz-cell" style="border-color:'+col+';">'+e+toks+'</div>';
    }
    html+='</div>';
  }
  g.innerHTML=html;
  var ph='';
  for(var i=0;i<MZG.players.length;i++){
    var p=MZG.players[i];
    var act=MZG.turn===i;
    ph+='<div style="display:flex;justify-content:space-between;align-items:center;padding:6px 10px;border:1px solid '+(act?MZ_COLORS[i]:'rgba(255,255,255,.08)')+';border-radius:8px;background:'+(act?'rgba(255,255,255,.05)':'transparent')+';">'
     +'<span style="color:'+MZ_COLORS[i]+';font-family:Orbitron,monospace;font-size:.72rem;">'+p.name+(p.frozen?' ❄':'')+'</span>'
     +'<span style="font-size:.7rem;color:#aab;">'+p.pos+'/23 · ✔'+p.ok+'</span></div>';
  }
  document.getElementById('mz-players').innerHTML=ph;
}

function mzCellName(idx){var k=MZG.board[idx].k;return MZ_TYPES[k]?MZ_TYPES[k].n:(k==='finish'?'ФИНИШ':'СТАРТ');}

function mazeNext(){
  if(!MZG||!MZG.on)return;
  MZG.turn=(MZG.turn+1)%3;
  mazeRender();
  setTimeout(mazeTurn,450);
}

function mazeTurn(){
  if(!MZG||!MZG.on)return;
  var p=MZG.players[MZG.turn];
  if(p.frozen>0){
    p.frozen--;
    mzFb('❄ <b style="color:#00f5ff;">'+p.name+'</b> пропускает ход.');
    setTimeout(mazeNext,1100);return;
  }
  var nxt=p.pos+1;
  if(nxt>=23){mzFb('<b style="color:'+MZ_COLORS[MZG.turn]+';">'+p.name+'</b> выходит на финишную клетку!');mzMove(p,1);return;}
  var type=MZG.board[nxt].k;
  mzFb('<b style="color:'+MZ_COLORS[MZG.turn]+';">'+p.name+'</b> на клетке «<b style="color:'+MZ_TYPES[type].c+';">'+MZ_TYPES[type].n+'</b>».');
  if(type==='path')mzAskQ(p,1,'🟢 ПУТЬ');
  else if(type==='wall')mzAskQ(p,3,'🔴 ПРЕПЯТСТВИЕ');
  else if(type==='portal')mzAskQ(p,2,'🔄 ПОРТАЛ');
  else if(type==='star')mzAsk3(p);
  else if(type==='fire')mzAskTerm(p);
}

/* ── вопросы из ЕНТ-банка ── */
function mzPick(diff){
  var pool=ENT_BANK.filter(function(q){return q.d===diff;});
  if(!pool.length)pool=ENT_BANK.slice();
  var q=pool[Math.floor(Math.random()*pool.length)];
  var pairs=q.o.map(function(t,i){return {t:t,ok:i===q.c};});
  mzShuffle(pairs);
  return {q:q.q,opts:pairs,s:q.s,t:q.t};
}

function mzShowQ(p,label,qq){
  var box=document.getElementById('mz-q');
  document.getElementById('mz-qlabel').innerHTML='<span style="color:#889;font-size:.62rem;letter-spacing:1px;">'+label+' · '+qq.t+'</span>';
  document.getElementById('mz-qt').textContent=qq.q;
  var obox=document.getElementById('mz-qo');
  obox.innerHTML='';
  var opts=qq.opts;
  var cols=['#97ce4c','#00f5ff','#ffd700','#ff5fa2','#c47aff'];
  for(var i=0;i<opts.length;i++){
    obox.innerHTML+='<button class="btn mz-opt" style="border-color:'+cols[i%5]+';color:'+cols[i%5]+';width:100%;margin:4px 0;font-size:.8rem;'+(p.bot?'opacity:.85;':'')+'" '+(p.bot?'disabled':'')+' data-ok="'+(opts[i].ok?1:0)+'" onclick="mzAns(this)">'+opts[i].t+'</button>';
  }
  box.classList.remove('hidden');
}

function mzAns(btn){
  if(!MZG||!MZG.busy)return;
  var ok=btn.getAttribute('data-ok')==='1';
  MZG.busy=false;
  mzHighlight(btn,ok);
  setTimeout(function(){mzResolve(MZG.players[MZG.turn],ok);},1000);
}

function mzHighlight(btn,ok){
  btn.style.borderColor=ok?'#97ce4c':'#ff3355';
  btn.style.color=ok?'#97ce4c':'#ff3355';
  var sol=document.getElementById('mz-sol');
  var qq=MZG.pend;
  sol.innerHTML=ok?'<span style="color:#97ce4c;">✅ ВЕРНО!</span>'+(qq&&qq.s?'<br><span style="color:#889;font-size:.68rem;">'+qq.s+'</span>':''):'<span style="color:#ff3355;">❌ МИМО!</span>'+(qq&&qq.s?'<br><span style="color:#889;font-size:.68rem;">'+qq.s+'</span>':'');
  sol.classList.remove('hidden');
}

function mzCloseQ(){document.getElementById('mz-q').classList.add('hidden');document.getElementById('mz-sol').classList.add('hidden');}

function mzAskQ(p,diff,label){
  MZG.busy=!p.bot;
  var qq=mzPick(diff);
  MZG.pend=qq;
  mzShowQ(p,label,qq,false);
  if(p.bot){
    setTimeout(function(){
      if(!MZG||!MZG.on){mzCloseQ();return;}
      var ok=Math.random()<MZ_BOT_OK;
      var opts=document.querySelectorAll('#mz-qo .mz-opt');
      var good=[],bad=[];
      for(var i=0;i<opts.length;i++){
        if(opts[i].getAttribute('data-ok')==='1')good.push(opts[i]);else bad.push(opts[i]);
      }
      var pick=ok?good[0]:bad[Math.floor(Math.random()*bad.length)]||opts[0];
      mzHighlight(pick,ok);
      mzFb('<b style="color:#00f5ff;">'+p.name+'</b> '+(ok?'отвечает верно!':'ошибается…'));
      setTimeout(function(){mzCloseQ();mzResolve(p,ok);},1400);
    },1400);
  }
}

function mzAsk3(p){
  MZG.busy=!p.bot;
  var qq=mzPick(1);
  var right=qq.opts.filter(function(o){return o.ok;})[0];
  var wrong=mzShuffle(qq.opts.filter(function(o){return !o.ok;})).slice(0,2);
  qq.opts=mzShuffle([right].concat(wrong));
  MZG.pend=qq;
  mzShowQ(p,'⭐ СОКРОВИЩЕ (3 варианта)',qq);
  if(p.bot){
    setTimeout(function(){
      if(!MZG||!MZG.on){mzCloseQ();return;}
      var ok=Math.random()<MZ_BOT_OK;
      var opts=document.querySelectorAll('#mz-qo .mz-opt');
      var pick=opts[0];
      for(var i=0;i<opts.length;i++){var isOk=opts[i].getAttribute('data-ok')==='1';if(ok===isOk){pick=opts[i];break;}}
      mzHighlight(pick,ok);
      setTimeout(function(){mzCloseQ();mzResolve(p,ok,'star');},1300);
    },1400);
  }
}

/* ── испытание: термин по определению ── */
function mzAskTerm(p){
  MZG.busy=!p.bot;
  var w=WOF_WORDS[Math.floor(Math.random()*WOF_WORDS.length)];
  MZG.pend={term:w[0],def:w[1]};
  var box=document.getElementById('mz-term');
  document.getElementById('mz-termdef').textContent=w[1];
  if(p.bot){
    var inp=document.getElementById('mz-terminp');
    inp.value='';
    inp.style.display='none';
    document.getElementById('mz-termhint').textContent=p.name+' печатает термин…';
    box.classList.remove('hidden');
    setTimeout(function(){
      if(!MZG||!MZG.on){mzCloseTerm();return;}
      var ok=Math.random()<MZ_BOT_OK;
      document.getElementById('mz-termhint').innerHTML=ok?'<span style="color:#97ce4c;">✅ «'+w[0]+'» — верно!</span>':'<span style="color:#ff3355;">❌ мимо!</span>';
      setTimeout(function(){mzCloseTerm();mzResolve(p,ok,'fire');},1200);
    },1500);
  } else {
    document.getElementById('mz-terminp').style.display='block';
    document.getElementById('mz-terminp').value='';
    document.getElementById('mz-termhint').textContent='введи термин целиком';
    box.classList.remove('hidden');
    setTimeout(function(){try{document.getElementById('mz-terminp').focus();}catch(e){}},80);
  }
}

function mzTermCheck(){
  if(!MZG||!MZG.busy)return;
  MZG.busy=false;
  var guess=(document.getElementById('mz-terminp').value||'').toUpperCase().trim();
  var ok=guess!==''&&guess===MZG.pend.term;
  document.getElementById('mz-termhint').innerHTML=ok?'<span style="color:#97ce4c;">✅ ВЕРНО!</span>':'<span style="color:#ff3355;">❌ Правильно было: '+MZG.pend.term+'</span>';
  setTimeout(function(){mzCloseTerm();mzResolve(MZG.players[MZG.turn],ok,'fire');},1500);
}
function mzCloseTerm(){document.getElementById('mz-term').classList.add('hidden');}

/* ── результат клетки ── */
function mzResolve(p,ok,type){
  if(!MZG||!MZG.on)return;
  var who='<b style="color:'+MZ_COLORS[MZG.turn]+';">'+p.name+'</b>';
  if(ok){
    p.ok++;
    if(!p.bot){SAVE.coins+=2;saveData();updMenuCoins();}
    if(type==='fire'){mzFb(who+' проходит испытание! +1 шаг'+(!p.bot?' · +2🪙':''));mzMove(p,1);return;}
    if(type==='star'){mzFb(who+' забирает сокровище! <b style="color:#ffd700;">Бонус: +2 шага!</b>'+(!p.bot?' · +2🪙':''));mzMove(p,2);return;}
    if(type==='portal'){mzPortal(p);return;}
    mzFb(who+' отвечает верно — идёт дальше.'+(!p.bot?' +2🪙':''));
    mzMove(p,1);
  } else {
    if(type==='wall'){p.frozen=1;mzFb(who+' не справился с препятствием — <b style="color:#00f5ff;">пропустит следующий ход</b>.');}
    else if(type==='fire'){p.pos=Math.max(0,p.pos-1);mzFb(who+' провалил испытание — <b style="color:#ff3355;">шаг назад!</b>');}
    else if(type==='portal'){mzFb(who+' не открыл портал.');}
    else{mzFb(who+' отвечает неверно — стоит на месте.');}
    mazeRender();
    setTimeout(mazeNext,1200);
  }
}

function mzPortal(p){
  var rivals=[];
  for(var i=0;i<3;i++)if(MZG.players[i]!==p)rivals.push(MZG.players[i]);
  var leader=rivals[0].pos>=rivals[1].pos?rivals[0]:rivals[1];
  if(p.bot){
    var push=leader.pos>=2&&leader.pos>p.pos;
    setTimeout(function(){
      if(push){leader.pos=Math.max(0,leader.pos-2);mzFb('<b style="color:#c47aff;">Портал!</b> '+p.name+' отправляет '+leader.name+' на 2 клетки назад! 😈');}
      else{mzFb('<b style="color:#c47aff;">Портал!</b> '+p.name+' прыгает на 2 клетки вперёд!');p.pos=Math.min(22,p.pos+2);}
      mazeRender();setTimeout(mazeNext,1300);
    },400);
    return;
  }
  MZG.pend.leader=leader;
  MZG.busy=true;
  document.getElementById('mz-portal').classList.remove('hidden');
  mzFb('<b style="color:#c47aff;">Портал открыт!</b> Выбери: прыжок себе или пакость сопернику.');
}

function mzPortalChoice(jump){
  if(!MZG||MZG.busy)return;
  MZG.busy=false;
  document.getElementById('mz-portal').classList.add('hidden');
  var p=MZG.players[MZG.turn];
  if(jump){
    p.pos=Math.min(22,p.pos+2);
    mzFb('<b style="color:#c47aff;">Портал!</b> Ты прыгаешь на 2 клетки вперёд!');
  } else {
    var L=MZG.pend.leader;
    L.pos=Math.max(0,L.pos-2);
    mzFb('<b style="color:#c47aff;">Портал!</b> Ты отправляешь '+L.name+' на 2 клетки назад! 😈');
  }
  mazeRender();
  setTimeout(mazeNext,1300);
}

function mzMove(p,steps){
  var step=function(){
    p.pos++;
    mazeRender();
    if(p.pos>=23){mazeWin(p);return;}
    steps--;
    if(steps>0)setTimeout(step,400);
    else setTimeout(mazeNext,700);
  };
  step();
}

function mazeWin(p){
  MZG.on=false;
  var wi=MZG.players.indexOf(p);
  var html='<div style="font-size:2.2rem;">'+(p.bot?'🤖':'🏆')+'</div>';
  html+='<div style="font-family:Orbitron,monospace;font-size:1.05rem;color:'+(p.bot?'#ff3355':'#97ce4c')+';">'+(p.bot?p.name+' ПОБЕЖДАЕТ':'ТЫ ВЫРВАЛСЯ ИЗ ЛАБИРИНТА!')+'</div>';
  var sorted=MZG.players.slice().sort(function(a,b){return b.pos-a.pos;});
  html+='<div style="margin:12px 0;font-size:.78rem;color:#aab;">';
  for(var i=0;i<sorted.length;i++){
    html+=(i+1)+'. <span style="color:'+MZ_COLORS[MZG.players.indexOf(sorted[i])]+';">'+sorted[i].name+'</span> — '+sorted[i].pos+'/23 · ✔'+sorted[i].ok+'<br>';
  }
  html+='</div>';
  if(!p.bot){
    var me=MZG.players[0];
    var coins=me.ok*2+20;
    SAVE.coins+=20;saveData();updMenuCoins();
    var w=+(localStorage.getItem('maze_wins')||0)+1;
    localStorage.setItem('maze_wins',w);
    var best=+(localStorage.getItem('maze_best')||0);
    if(coins>best)localStorage.setItem('maze_best',coins);
    html+='<div style="font-size:.9rem;color:#97ce4c;font-family:Orbitron,monospace;">+'+coins+' 🪙 ('+me.ok+'×2 за ответы +20 за победу)</div>';
  } else {
    var me2=MZG.players[0];
    if(me2.ok>0)html+='<div style="font-size:.8rem;color:#ffd700;">+'+(me2.ok*2)+' 🪙 за верные ответы — уже зачислено</div>';
  }
  html+='<div style="display:flex;gap:10px;margin-top:14px;"><button class="btn btn-gold" onclick="mzCloseOver();mazeStart();">[ 🔁 СНОВА ]</button><button class="btn" style="border-color:var(--dg);color:var(--dg);" onclick="mzCloseOver();mazeMenu();">[ ← В МЕНЮ ]</button></div>';
  document.getElementById('mz-over').innerHTML=html;
  document.getElementById('mz-over').classList.remove('hidden');
  sfx('ok');
}
function mzCloseOver(){document.getElementById('mz-over').classList.add('hidden');MZG=null;}

function mazeExit(){
  if(MZG&&MZG.on&&!MZG.players[0].bot){
    if(!confirm('Выйти из лабиринта? Монеты за верные ответы сохранены.'))return;
    MZG.on=false;MZG=null;
    mzCloseQ();mzCloseTerm();document.getElementById('mz-portal').classList.add('hidden');mzCloseOver();
    mazeMenu();
  }
}
