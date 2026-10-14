/* ═══ ЛАБИРИНТ ЕНТ — настоящий лабиринт ═══
   7×9 клеток, стены, развилки. Ход выбираешь сам: тап по соседней клетке.
   Клетка, в которую вошёл, задаёт событие: вопрос, испытание, портал.
   Ты и два бота бегут к выходу из лабиринта. Первый вышел — победил. */
var MZG=null;
var MZ_COLORS=['#ffd700','#00f5ff','#ff5fa2'];
var MZ_NAMES=['Айгерим','Ерлан','Дана','Марат','Камила','Сабина','Мадина','Тимур','Асель','Нурлан'];
var MZ_T={path:{e:'🟢',c:'#97ce4c',n:'ПУТЬ'},
          wall:{e:'🔴',c:'#ff3355',n:'ПРЕПЯТСТВИЕ'},
          star:{e:'⭐',c:'#ffd700',n:'СОКРОВИЩЕ'},
          fire:{e:'🔥',c:'#ff6b35',n:'ИСПЫТАНИЕ'},
          portal:{e:'🔄',c:'#c47aff',n:'ПОРТАЛ'}};
var MZ_W=7,MZ_H=9;
var MZ_BOT={path:.65,wall:.40,star:.60,fire:.50,portal:.55};

/* ── генерация лабиринта (recursive backtracker) ── */
function mzGen(){
  var g=[],x,y;
  for(y=0;y<MZ_H;y++){g.push([]);for(x=0;x<MZ_W;x++)g[y].push({n:1,s:1,e:1,w:1,v:0,t:'path'});}
  var st=[[0,0]];g[0][0].v=1;
  while(st.length){
    var c=st[st.length-1];x=c[0];y=c[1];var nb=[];
    if(y>0&&!g[y-1][x].v)nb.push([x,y-1,'n','s']);
    if(y<MZ_H-1&&!g[y+1][x].v)nb.push([x,y+1,'s','n']);
    if(x>0&&!g[y][x-1].v)nb.push([x-1,y,'w','e']);
    if(x<MZ_W-1&&!g[y][x+1].v)nb.push([x+1,y,'e','w']);
    if(!nb.length){st.pop();continue;}
    var m=nb[Math.floor(Math.random()*nb.length)];
    g[y][x][m[2]]=0;g[m[1]][m[0]][m[3]]=0;
    g[m[1]][m[0]].v=1;st.push([m[0],m[1]]);
  }
  // типы событий на клетках (кроме старта и выхода)
  for(y=0;y<MZ_H;y++)for(x=0;x<MZ_W;x++){
    if((x===0&&y===0)||(x===MZ_W-1&&y===MZ_H-1))continue;
    var r=Math.random();
    g[y][x].t=r<.50?'path':r<.62?'wall':r<.72?'star':r<.85?'fire':'portal';
  }
  return g;
}

/* ── расстояния BFS от точки (для кратчайших путей) ── */
function mzDist(g,tx,ty){
  var d=[],q=[],x,y;
  for(y=0;y<MZ_H;y++){d.push([]);for(x=0;x<MZ_W;x++)d[y].push(-1);}
  d[ty][tx]=0;q.push([tx,ty]);
  while(q.length){
    var c=q.shift();x=c[0];y=c[1];
    var st=function(nx,ny){if(d[ny][nx]<0){d[ny][nx]=d[y][x]+1;q.push([nx,ny]);}};
    if(!g[y][x].n)st(x,y-1);
    if(!g[y][x].s)st(x,y+1);
    if(!g[y][x].w)st(x-1,y);
    if(!g[y][x].e)st(x+1,y);
  }
  return d;
}

function mzShuffle(a){for(var i=a.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=a[i];a[i]=a[j];a[j]=t;}return a;}
function mzOpen(g,x,y,nx,ny){
  if(Math.abs(nx-x)+Math.abs(ny-y)!==1)return false;
  if(nx<0||ny<0||nx>=MZ_W||ny>=MZ_H)return false;
  if(nx>x)return!g[y][x].e;
  if(nx<x)return!g[y][x].w;
  if(ny>y)return!g[y][x].s;
  return !g[y][x].n;
}

/* ── меню/старт ── */
function mazeMenu(){
  showS('sMaze-menu');
  var w=+(localStorage.getItem('maze_wins')||0);
  var b=+(localStorage.getItem('maze_best')||0);
  document.getElementById('mz-best').innerHTML='ПОБЕД: '+w+(b?' · ЛУЧШИЙ ЗАБЕГ: '+b+'🪙':'');
}
function mzFb(html){document.getElementById('mz-fb').innerHTML=html;}

function mazeStart(){
  var g=mzGen();
  var names=mzShuffle(MZ_NAMES.slice()).slice(0,2);
  MZG={g:g,turn:2,await:false,busy:false,pend:null,
    dExit:mzDist(g,MZ_W-1,MZ_H-1),
    dStart:mzDist(g,0,0),
    players:[
      {name:'ТЫ',bot:false,x:0,y:0,px:0,py:0,frozen:0,ok:0,extra:false},
      {name:names[0],bot:true,x:0,y:0,px:0,py:0,frozen:0,ok:0,extra:false},
      {name:names[1],bot:true,x:0,y:0,px:0,py:0,frozen:0,ok:0,extra:false}]};
  showS('sMaze-game');
  mazeRender();
  mzFb('Лабиринт создан. Найди выход 🏁 в правом нижнем углу! Первым ходит ТЫ.');
  setTimeout(mazeNext,800);
}

/* ── отрисовка ── */
function mzLit(x,y){
  for(var i=0;i<MZG.players.length;i++){
    var p=MZG.players[i];
    var r=(i===0)?2:1;
    if(Math.abs(p.x-x)+Math.abs(p.y-y)<=r)return true;
  }
  return false;
}
function mazeRender(){
  if(!MZG)return;
  var p=MZG.players[MZG.turn];
  var humanNow=MZG.turn===0&&MZG.await;
  var html='<div style="display:inline-grid;grid-template-columns:repeat('+MZ_W+',1fr);background:#04050c;border-radius:8px;padding:4px;">';
  for(var y=0;y<MZ_H;y++)for(var x=0;x<MZ_W;x++){
    var c=MZG.g[y][x];
    var isStart=(x===0&&y===0),isExit=(x===MZ_W-1&&y===MZ_H-1);
    var lit=mzLit(x,y)||isExit;
    var wal=function(k){return c[k]?(lit?'3px solid #3a3f5c':'2px solid #0d1020'):'1px solid rgba(255,255,255,'+(lit?'.06':'.02')+')';};
    var bg=lit?'rgba(255,255,255,.03)':'#04050c';
    var e='';
    if(isStart)e='▶';
    else if(isExit){e='🏁';bg='rgba(151,206,76,.22)';}
    else e=MZ_T[c.t].e;
    var op=lit?1:.06;
    var toks='';
    for(var pi=0;pi<MZG.players.length;pi++){
      var q=MZG.players[pi];
      if(q.x===x&&q.y===y)toks+='<span class="mz-tok" style="background:'+MZ_COLORS[pi]+';right:'+(3+pi*16)+'px;">'+(pi===0?'😀':'🤖')+'</span>';
    }
    var can=humanNow&&lit&&mzOpen(MZG.g,p.x,p.y,x,y);
    var cur=humanNow&&p.x===x&&p.y===y;
    html+='<div class="'+(can?'mz-can':'')+'" style="position:relative;height:42px;border-top:'+wal('n')+';border-bottom:'+wal('s')+';border-left:'+wal('w')+';border-right:'+wal('e')+';background:'+(cur?'rgba(255,215,0,.12)':bg)+';display:flex;align-items:center;justify-content:center;font-size:.95rem;'+(can?'cursor:pointer;':'')+'opacity:1;" '+(can?'onclick="mzGo('+x+','+y+')"':'')+'>'
      +(e?'<span style="opacity:'+op+';">'+e+'</span>':'')+toks+'</div>';
  }
  html+='</div>';
  document.getElementById('mz-board').innerHTML=html;
  var ph='';
  for(var i=0;i<MZG.players.length;i++){
    var u=MZG.players[i];
    var act=MZG.turn===i;
    var dist=MZG.dExit[u.y][u.x];
    ph+='<div style="display:flex;justify-content:space-between;align-items:center;padding:5px 10px;border:1px solid '+(act?MZ_COLORS[i]:'rgba(255,255,255,.08)')+';border-radius:8px;background:'+(act?'rgba(255,255,255,.05)':'transparent')+';">'
     +'<span style="color:'+MZ_COLORS[i]+';font-family:Orbitron,monospace;font-size:.7rem;">'+u.name+(u.frozen?' ❄':'')+'</span>'
     +'<span style="font-size:.66rem;color:#aab;">до выхода: '+dist+' · ✔'+u.ok+'</span></div>';
  }
  document.getElementById('mz-players').innerHTML=ph;
}

/* ── ходовая механика ── */
function mazeNext(){
  if(!MZG)return;
  MZG.turn=(MZG.turn+1)%3;
  mazeTurn();
}
function mazeTurn(){
  if(!MZG)return;
  var p=MZG.players[MZG.turn];
  mazeRender();
  if(p.frozen>0){
    p.frozen--;
    mzFb('❄ <b style="color:'+MZ_COLORS[MZG.turn]+';">'+p.name+'</b> пропускает ход.');
    setTimeout(mazeNext,1000);return;
  }
  if(p.bot){
    mzFb('Ход <b style="color:'+MZ_COLORS[MZG.turn]+';">'+p.name+'</b>…');
    setTimeout(function(){mzBotStep(p,1);},1100);
  } else {
    MZG.await=true;
    mazeRender();
    mzFb('<b style="color:#ffd700;">Твой ход.</b> Тапни соседнюю клетку, куда пойти.');
  }
}

function mzGo(x,y){
  if(!MZG||!MZG.await||MZG.turn!==0)return;
  var p=MZG.players[0];
  if(!mzOpen(MZG.g,p.x,p.y,x,y))return;
  MZG.await=false;
  p.extra=false;
  mzStep(p,x,y);
}

function mzStep(p,x,y){
  p.px=p.x;p.py=p.y;p.x=x;p.y=y;
  mazeRender();
  if(x===MZ_W-1&&y===MZ_H-1){setTimeout(function(){mazeWin(p);},400);return;}
  var t=MZG.g[y][x].t;
  var who='<b style="color:'+MZ_COLORS[MZG.players.indexOf(p)]+';">'+p.name+'</b> на клетке <b style="color:'+MZ_T[t].c+';">'+MZ_T[t].n+'</b>.';
  mzFb(who);
  if(t==='path')mzAskQ(p,1,'🟢 ПУТЬ');
  else if(t==='wall')mzAskQ(p,3,'🔴 ПРЕПЯТСТВИЕ');
  else if(t==='star')mzAsk3(p);
  else if(t==='fire')mzAskTerm(p);
  else if(t==='portal')mzAskQ(p,2,'🔄 ПОРТАЛ');
}

/* ── вопросы ── */
function mzPick(diff){
  var pool=ENT_BANK.filter(function(q){return q.d===diff;});
  if(!pool.length)pool=ENT_BANK.slice();
  var q=pool[Math.floor(Math.random()*pool.length)];
  var pairs=q.o.map(function(t,i){return {t:t,ok:i===q.c};});
  mzShuffle(pairs);
  return {q:q.q,opts:pairs,s:q.s,t:q.t};
}
function mzShowQ(p,label,qq){
  document.getElementById('mz-qlabel').innerHTML='<span style="color:#889;font-size:.62rem;letter-spacing:1px;">'+label+' · '+qq.t+'</span>';
  document.getElementById('mz-qt').textContent=qq.q;
  var obox=document.getElementById('mz-qo');
  obox.innerHTML='';
  var cols=['#97ce4c','#00f5ff','#ffd700','#ff5fa2','#c47aff'];
  for(var i=0;i<qq.opts.length;i++){
    obox.innerHTML+='<button class="btn mz-opt" style="border-color:'+cols[i%5]+';color:'+cols[i%5]+';width:100%;margin:4px 0;font-size:.8rem;'+(p.bot?'opacity:.85;':'')+'" '+(p.bot?'disabled':'')+' data-ok="'+(qq.opts[i].ok?1:0)+'" onclick="mzAns(this)">'+qq.opts[i].t+'</button>';
  }
  document.getElementById('mz-sol').classList.add('hidden');
  document.getElementById('mz-q').classList.remove('hidden');
}
function mzHighlight(btn,ok){
  btn.style.borderColor=ok?'#97ce4c':'#ff3355';
  btn.style.color=ok?'#97ce4c':'#ff3355';
  var qq=MZG.pend;
  document.getElementById('mz-sol').innerHTML=(ok?'<span style="color:#97ce4c;">✅ ВЕРНО!</span>':'<span style="color:#ff3355;">❌ МИМО!</span>')+(qq&&qq.s?'<br><span style="color:#889;font-size:.68rem;">'+qq.s+'</span>':'');
  document.getElementById('mz-sol').classList.remove('hidden');
}
function mzCloseQ(){document.getElementById('mz-q').classList.add('hidden');document.getElementById('mz-sol').classList.add('hidden');}
function mzAskQ(p,diff,label){
  MZG.busy=!p.bot;
  var qq=mzPick(diff);
  MZG.pend=qq;
  mzShowQ(p,label,qq);
  if(p.bot){
    setTimeout(function(){
      if(!MZG){mzCloseQ();return;}
      var ok=Math.random()<MZ_BOT[MZG.g[p.y][p.x].t];
      var opts=document.querySelectorAll('#mz-qo .mz-opt');
      var good=[],bad=[];
      for(var i=0;i<opts.length;i++){if(opts[i].getAttribute('data-ok')==='1')good.push(opts[i]);else bad.push(opts[i]);}
      var pick=ok?good[0]:(bad[Math.floor(Math.random()*bad.length)]||opts[0]);
      mzHighlight(pick,ok);
      mzFb('<b style="color:#00f5ff;">'+p.name+'</b> '+(ok?'отвечает верно!':'ошибается…'));
      setTimeout(function(){mzCloseQ();mzResolve(p,ok);},1400);
    },1400);
  }
}
function mzAns(btn){
  if(!MZG||!MZG.busy)return;
  MZG.busy=false;
  var ok=btn.getAttribute('data-ok')==='1';
  mzHighlight(btn,ok);
  setTimeout(function(){if(!MZG)return;mzCloseQ();mzResolve(MZG.players[0],ok);},1000);
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
      if(!MZG){mzCloseQ();return;}
      var ok=Math.random()<MZ_BOT.star;
      var opts=document.querySelectorAll('#mz-qo .mz-opt');
      var pick=opts[0];
      for(var i=0;i<opts.length;i++){if((opts[i].getAttribute('data-ok')==='1')===ok){pick=opts[i];break;}}
      mzHighlight(pick,ok);
      setTimeout(function(){mzCloseQ();mzResolve(p,ok);},1300);
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
    document.getElementById('mz-terminp').style.display='none';
    document.getElementById('mz-terminp').value='';
    document.getElementById('mz-termhint').textContent=p.name+' печатает термин…';
    box.classList.remove('hidden');
    setTimeout(function(){
      if(!MZG){mzCloseTerm();return;}
      var ok=Math.random()<MZ_BOT.fire;
      document.getElementById('mz-termhint').innerHTML=ok?'<span style="color:#97ce4c;">✅ «'+w[0]+'» — верно!</span>':'<span style="color:#ff3355;">❌ мимо!</span>';
      setTimeout(function(){mzCloseTerm();mzResolve(p,ok);},1200);
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
  setTimeout(function(){if(!MZG)return;mzCloseTerm();mzResolve(MZG.players[0],ok);},1500);
}
function mzCloseTerm(){document.getElementById('mz-term').classList.add('hidden');}

/* ── итог события клетки ── */
function mzResolve(p,ok){
  if(!MZG)return;
  var type=MZG.g[p.y][p.x].t;
  var i=MZG.players.indexOf(p);
  var who='<b style="color:'+MZ_COLORS[i]+';">'+p.name+'</b>';
  if(ok){
    p.ok++;
    if(!p.bot){SAVE.coins+=2;saveData();updMenuCoins();}
    if(type==='star'){
      p.extra=true;
      mzFb(who+' забирает сокровище! <b style="color:#ffd700;">Бесплатный второй ход!</b>'+(!p.bot?' +2🪙':''));
      if(p.bot)setTimeout(function(){if(MZG)mzBotStep(p,1);},1000);
      else{MZG.await=true;mazeRender();}
      return;
    }
    if(type==='portal'){
      mzFb(who+' открыл портал!'+(!p.bot?' +2🪙':''));
      mzPortal(p);
      return;
    }
    mzFb(who+' отвечает верно.'+(!p.bot?' +2🪙':''));
    setTimeout(mazeNext,900);
  } else {
    if(type==='wall'){p.frozen=1;mzFb(who+' не прошёл препятствие — <b style="color:#00f5ff;">пропустит ход</b>.');}
    else if(type==='fire'){
      mzFb(who+' провалил испытание — <b style="color:#ff3355;">отброшен назад!</b>');
      var t=p.x;p.x=p.px;p.px=t;t=p.y;p.y=p.py;p.py=t;
      mazeRender();
    }
    else mzFb(who+' отвечает неверно.');
    setTimeout(mazeNext,1100);
  }
}

/* ── портал: прыжок/толчок ── */
function mzNextCell(d){
  var p=arguments[1],best=null,bd=1e9;
  var dirs=[[0,-1,'n'],[0,1,'s'],[-1,0,'w'],[1,0,'e']];
  for(var k=0;k<4;k++){
    var nx=p.x+dirs[k][0],ny=p.y+dirs[k][1];
    if(mzOpen(MZG.g,p.x,p.y,nx,ny)&&d[ny][nx]>=0&&d[ny][nx]<bd){bd=d[ny][nx];best=[nx,ny];}
  }
  return best;
}
function mzPortal(p){
  var rivals=[];
  for(var k=0;k<3;k++)if(MZG.players[k]!==p)rivals.push(MZG.players[k]);
  var L=(MZG.dExit[rivals[0].y][rivals[0].x]<=MZG.dExit[rivals[1].y][rivals[1].x])?rivals[0]:rivals[1];
  if(p.bot){
    var push=MZG.dStart[L.y][L.x]>=2&&MZG.dExit[L.y][L.x]<MZG.dExit[p.y][p.x];
    setTimeout(function(){
      if(!MZG)return;
      if(push){
        mzPush(L,2);
        mzFb('<b style="color:#c47aff;">Портал!</b> '+p.name+' отбрасывает '+L.name+' на 2 клетки к старту! 😈');
        mazeRender();
        setTimeout(mazeNext,1300);
      } else {
        mzFb('<b style="color:#c47aff;">Портал!</b> '+p.name+' прыгает на 2 клетки к выходу!');
        mzJump(p,2);
      }
    },400);
    return;
  }
  MZG.pend=MZG.pend||{};
  MZG.pend.leader=L;
  MZG.busy=true;
  document.getElementById('mz-portal').classList.remove('hidden');
  mzFb('<b style="color:#c47aff;">Портал открыт!</b> Выбери: прыжок себе или пакость сопернику.');
}
function mzPortalChoice(jump){
  if(!MZG||!MZG.busy)return;
  MZG.busy=false;
  document.getElementById('mz-portal').classList.add('hidden');
  var p=MZG.players[MZG.turn];
  if(jump){
    mzFb('<b style="color:#c47aff;">Портал!</b> Ты прыгаешь на 2 клетки ближе к выходу!');
    mzJump(p,2);
  } else {
    var L=MZG.pend.leader;
    mzFb('<b style="color:#c47aff;">Портал!</b> Ты отбрасываешь '+L.name+' на 2 клетки к старту! 😈');
    mzPush(L,2);
    mazeRender();
    setTimeout(mazeNext,1200);
  }
}
function mzJump(p,n){
  var step=function(){
    var c=mzNextCell(MZG.dExit,p);
    if(c){p.px=p.x;p.py=p.y;p.x=c[0];p.y=c[1];mazeRender();}
    if(p.x===MZ_W-1&&p.y===MZ_H-1){mazeWin(p);return;}
    n--;
    if(n>0)setTimeout(step,450);
    else setTimeout(mazeNext,900);
  };
  step();
}
function mzPush(p,n){
  var step=function(){
    var c=mzNextCell(MZG.dStart,p);
    if(c){p.px=p.x;p.py=p.y;p.x=c[0];p.y=c[1];}
    n--;
    if(n>0)step();else mazeRender();
  };
  step();
}

/* ── бот ── */
function mzBotStep(p,steps){
  if(!MZG)return;
  var c=mzNextCell(MZG.dExit,p);
  if(!c){setTimeout(mazeNext,600);return;}
  mzStep(p,c[0],c[1]);
}

/* ── победа/выход ── */
function mazeWin(p){
  MZG.await=false;
  var wi=MZG.players.indexOf(p);
  var html='<div style="font-size:2.2rem;">'+(p.bot?'🤖':'🏆')+'</div>';
  html+='<div style="font-family:Orbitron,monospace;font-size:1.05rem;color:'+(p.bot?'#ff3355':'#97ce4c')+';">'+(p.bot?p.name.toUpperCase()+' НАШЁЛ ВЫХОД ПЕРВЫМ':'ТЫ ВЫШЕЛ ИЗ ЛАБИРИНТА ПЕРВЫМ!')+'</div>';
  var sorted=MZG.players.slice().sort(function(a,b){return MZG.dExit[a.y][a.x]-MZG.dExit[b.y][b.x];});
  html+='<div style="margin:12px 0;font-size:.78rem;color:#aab;">';
  for(var i=0;i<sorted.length;i++){
    html+=(i+1)+'. <span style="color:'+MZ_COLORS[MZG.players.indexOf(sorted[i])]+';">'+sorted[i].name+'</span> — осталось '+MZG.dExit[sorted[i].y][sorted[i].x]+' · ✔'+sorted[i].ok+'<br>';
  }
  html+='</div>';
  var me=MZG.players[0];
  if(!p.bot){
    var coins=me.ok*2+20;
    SAVE.coins+=20;saveData();updMenuCoins();
    var w=+(localStorage.getItem('maze_wins')||0)+1;
    localStorage.setItem('maze_wins',w);
    var best=+(localStorage.getItem('maze_best')||0);
    if(coins>best)localStorage.setItem('maze_best',coins);
    html+='<div style="font-size:.9rem;color:#97ce4c;font-family:Orbitron,monospace;">+'+coins+' 🪙 ('+me.ok+'×2 за ответы +20 за победу)</div>';
  } else if(me.ok>0){
    html+='<div style="font-size:.8rem;color:#ffd700;">+'+(me.ok*2)+' 🪙 за верные ответы — уже зачислено</div>';
  }
  html+='<div style="display:flex;gap:10px;margin-top:14px;"><button class="btn btn-gold" onclick="mzCloseOver();mazeStart();">[ 🔁 СНОВА ]</button><button class="btn" style="border-color:var(--dg);color:var(--dg);" onclick="mzCloseOver();mazeMenu();">[ ← В МЕНЮ ]</button></div>';
  document.getElementById('mz-over').innerHTML=html;
  document.getElementById('mz-over').classList.remove('hidden');
  sfx('ok');
}
function mzCloseOver(){document.getElementById('mz-over').classList.add('hidden');MZG=null;}

function mazeExit(){
  if(MZG){
    if(!confirm('Выйти из лабиринта? Монеты за верные ответы сохранены.'))return;
  }
  MZG=null;
  mzCloseQ();mzCloseTerm();
  document.getElementById('mz-portal').classList.add('hidden');
  document.getElementById('mz-over').classList.add('hidden');
  mazeMenu();
}
