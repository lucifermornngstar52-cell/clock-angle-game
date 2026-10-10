// ═══ ОБЩИЙ ПРОФИЛЬ АККАУНТА (мини-игры / Хранители / Матополи) ═══
// Чип в правом верхнем углу + панель профиля, как на главной странице Numbra.
(function(){
  var SUPA='https://usulgiwtqdxmgonqhpck.supabase.co';
  var SKEY='sb_publishable_8aX2OBxUMsOKWTiGum8dcA_z8-peLRM';
  function em(){try{return localStorage.getItem('game_email')||'';}catch(e){return '';}}
  function usr(){try{return JSON.parse(localStorage.getItem('game_user')||'null');}catch(e){return null;}}
  function authorized(){var e=em();return !!e&&e!=='guest';}
  function H(){return {'apikey':SKEY,'Authorization':'Bearer '+SKEY};}
  function fmt(sec){var h=Math.floor(sec/3600),m=Math.floor(sec%3600/60);return (h?h+' ч ':'')+m+' мин';}
  function row(l,v){return '<div style="background:#101d33;border:1px solid #223;border-radius:8px;padding:8px;display:flex;justify-content:space-between;font-size:.65rem;"><span style="color:#556;">'+l+'</span><span style="color:#ffd700;">'+v+'</span></div>';}

  function inject(){
    // чип
    if(!document.getElementById('acc-btn')){
    var b=document.createElement('button');
    b.id='acc-btn';
    b.setAttribute('style','display:none;position:fixed;top:10px;right:10px;z-index:150;background:rgba(13,26,46,.9);border:1px solid rgba(0,245,255,.5);border-radius:20px;padding:6px 12px;color:#0ff;font-family:Orbitron,monospace;font-size:.6rem;cursor:pointer;max-width:45vw;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;');
    b.textContent='👤 Игрок';
    b.addEventListener('click',openProfile);
    document.body.appendChild(b);
    }
    if(document.getElementById('profile-modal'))return;

    var m=document.createElement('div');
    m.id='profile-modal';
    m.setAttribute('style','display:none;position:fixed;inset:0;z-index:200;background:rgba(0,0,0,.78);align-items:center;justify-content:center;padding:16px;');
    m.innerHTML='<div style="background:#0d1a2e;border:1px solid rgba(0,245,255,.4);border-radius:14px;padding:18px;max-width:340px;width:100%;max-height:85vh;overflow-y:auto;-webkit-overflow-scrolling:touch;font-family:Orbitron,monospace;color:#cde;">'
      +'<div style="text-align:center;color:#00f5ff;letter-spacing:3px;font-size:.8rem;">// ПРОФИЛЬ //</div>'
      +'<div id="pr-name" style="text-align:center;color:#fff;font-size:1rem;margin:8px 0 2px;"></div>'
      +'<div id="pr-email" style="text-align:center;color:#9ab;font-size:.7rem;margin-bottom:8px;word-break:break-all;"></div>'
      +'<div id="pr-rank" style="text-align:center;color:#ffd700;font-size:.6rem;margin-bottom:12px;"></div>'
      +'<div id="pr-stats"></div>'
      +'<div style="margin:12px 0 6px;color:#00f5ff;font-size:.6rem;letter-spacing:2px;">ДОСТИЖЕНИЯ <span id="pr-achcnt" style="color:#ffd700;"></span></div>'
      +'<div id="pr-ach" style="font-size:.6rem;color:#556;text-align:center;">Достижения отображаются в главной игре NUMBRA</div>'
      +'<div style="display:flex;gap:8px;margin-top:14px;">'
      +'<button id="pr-logout" style="flex:1;background:rgba(255,80,80,.15);border:1px solid rgba(255,80,80,.6);border-radius:8px;padding:9px;color:#ff6b6b;font-size:.6rem;cursor:pointer;font-family:inherit;">ВЫЙТИ ИЗ АККАУНТА</button>'
      +'<button id="pr-close" style="flex:1;background:rgba(0,245,255,.1);border:1px solid rgba(0,245,255,.5);border-radius:8px;padding:9px;color:#0ff;font-size:.6rem;cursor:pointer;font-family:inherit;">ЗАКРЫТЬ</button>'
      +'</div></div>';
    m.addEventListener('click',function(e){if(e.target===m)m.style.display='none';});
    m.querySelector('#pr-logout').addEventListener('click',function(){
      localStorage.removeItem('game_email');localStorage.removeItem('game_user');
      location.reload();
    });
    m.querySelector('#pr-close').addEventListener('click',function(){m.style.display='none';});
    document.body.appendChild(m);
  }

  function upd(){
    inject();
    var b=document.getElementById('acc-btn');if(!b)return;
    var on=authorized();
    b.style.display=on?'':'none';
    if(on){var u=usr();b.textContent='👤 '+((u&&(u.full_name||u.email))||em());}
  }

  async function openProfile(){
    inject();
    var u=usr()||{},e=em();
    document.getElementById('pr-name').textContent=u.full_name||e;
    document.getElementById('pr-email').textContent='📧 '+e;
    document.getElementById('pr-rank').textContent=u.current_rank?('🎖 '+u.current_rank):'';
    var sec=parseInt(localStorage.getItem('cag_playtime')||'0')||0;
    var coins=parseInt(localStorage.getItem('cag_coins')||'0')||0;
    document.getElementById('pr-stats').innerHTML='<div style="display:flex;flex-direction:column;gap:6px;">'
      +row('💰 Монеты',coins)
      +row('⚙ Шестерни',u.total_gears||0)
      +row('🏅 Победы',u.total_wins||0)
      +row('⭐ Очки','...')
      +row('⏱ В игре',fmt(sec))
      +'</div>';
    var ac=document.getElementById('pr-achcnt');if(ac)ac.textContent='';
    document.getElementById('profile-modal').style.display='flex';
    upd();
    try{
      var r=await fetch(SUPA+'/rest/v1/leaderboard?user_email=eq.'+encodeURIComponent(e)+'&select=score,total_gears,total_wins',{headers:H()}).then(function(r){return r.json();});
      var urow=await fetch(SUPA+'/rest/v1/users?email=eq.'+encodeURIComponent(e)+'&select=total_gears,total_wins',{headers:H()}).then(function(r){return r.json();});
      if(r&&r.length&&urow&&urow.length){
        var ug=urow[0].total_gears||0;
        var wins=Math.max(r[0].total_wins||0,urow[0].total_wins||0);
        var gears=Math.max(r[0].total_gears||0,ug);
        var score=gears+wins*10;
        if((r[0].total_gears||0)<ug||(r[0].score||0)!==score){
          try{await fetch(SUPA+'/rest/v1/leaderboard?user_email=eq.'+encodeURIComponent(e),{method:'PATCH',headers:{'apikey':SKEY,'Authorization':'Bearer '+SKEY,'Content-Type':'application/json'},body:JSON.stringify({total_gears:gears,total_wins:wins,score:score})});}catch(e2){}
        }
        var sl=document.getElementById('pr-stats');
        if(sl)sl.innerHTML='<div style="display:flex;flex-direction:column;gap:6px;">'
          +row('💰 Монеты',coins)
          +row('⚙ Шестерни',gears)
          +row('🏅 Победы',wins)
          +row('⭐ Очки',score)
          +row('⏱ В игре',fmt(sec))
          +'</div>';
      }
    }catch(e2){}
    try{
      var a=await fetch(SUPA+'/rest/v1/game_progress?user_email=eq.'+encodeURIComponent(e)+'&minigame=like.'+encodeURIComponent('ДОСТИЖЕНИЕ')+'*&select=minigame',{headers:H()}).then(function(r){return r.json();});
      var cnt=(a||[]).length;
      var ac2=document.getElementById('pr-achcnt');if(ac2)ac2.textContent='(' +cnt+')';
    }catch(e3){}
  }

  window.accProfileUpd=function(){upd();};
  if(document.readyState==='complete'){upd();}
  else{window.addEventListener('load',function(){upd();});}
  // чип живёт постоянно: следим, чтобы не пропадал
  setInterval(function(){upd();},3000);
})();
