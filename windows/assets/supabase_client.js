// ═══════════════════════════════════════════════════
// SUPABASE API CLIENT — Хранители Времени
// Подключение к базе данных Supabase (бесплатно, 24/7)
// ═══════════════════════════════════════════════════

const SUPABASE_URL = 'https://usulgiwtqdxmgonqhpck.supabase.co';
const SUPABASE_KEY = 'sb_publishable_8aX2OBxUMsOKWTiGum8dcA_z8-peLRM'; // ← вставь anon public key

// ─── РЕГИСТРАЦИЯ / ВХОД ───
async function supabaseAuth(email, fullName) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/auth_user`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_email: email, p_name: fullName || null })
    });
    const data = await res.json();
    if (data.ok) {
      localStorage.setItem('game_email', email);
      localStorage.setItem('game_user', JSON.stringify(data.user));
    }
    return data;
  } catch (e) {
    console.error('Auth error:', e);
    return { ok: false, error: e.message };
  }
}

// ─── СОХРАНИТЬ ПРОГРЕСС МИНИ-ИГРЫ ───
async function supabaseSaveProgress(minigame, score, gears, completed) {
  const email = localStorage.getItem('game_email');
  if (!email) return { ok: false, error: 'Не авторизован' };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/save_progress`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        p_email: email,
        p_minigame: minigame,
        p_score: score || 0,
        p_gears: gears || 0,
        p_completed: completed || false
      })
    });
    return await res.json();
  } catch (e) {
    console.error('Save error:', e);
    return { ok: false, error: e.message };
  }
}

// ─── РЕГИСТРАЦИЯ ПОБЕДЫ ───
async function supabaseRegisterVictory() {
  const email = localStorage.getItem('game_email');
  if (!email) return { ok: false, error: 'Не авторизован' };

  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/rpc/register_victory`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ p_email: email })
    });
    return await res.json();
  } catch (e) {
    console.error('Victory error:', e);
    return { ok: false, error: e.message };
  }
}

// ─── ПОЛУЧИТЬ ПРОГРЕСС ───
async function supabaseGetProgress() {
  const email = localStorage.getItem('game_email');
  if (!email) return { ok: false, error: 'Не авторизован' };

  try {
    // Получаем пользователя
    const userRes = await fetch(`${SUPABASE_URL}/rest/v1/users?email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const userData = await userRes.json();

    // Получаем прогресс
    const progRes = await fetch(`${SUPABASE_URL}/rest/v1/game_progress?user_email=eq.${encodeURIComponent(email)}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const progress = await progRes.json();

    const totalGears = progress.reduce((s, p) => s + (p.gears_earned || 0), 0);
    const completedGames = progress.filter(p => p.completed).length;

    return {
      ok: true,
      user: userData[0] || null,
      progress: progress,
      stats: {
        total_gears: totalGears,
        completed_games: completedGames,
        rank: userData[0]?.current_rank || 'Новичок',
        wins: userData[0]?.total_wins || 0
      }
    };
  } catch (e) {
    console.error('Get progress error:', e);
    return { ok: false, error: e.message };
  }
}

// ─── ТАБЛИЦА ЛИДЕРОВ ───
async function supabaseGetLeaderboard(limit = 10) {
  try {
    const res = await fetch(`${SUPABASE_URL}/rest/v1/leaderboard?order=score.desc&limit=${limit}`, {
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`
      }
    });
    const data = await res.json();
    return {
      ok: true,
      leaderboard: data.map((p, i) => ({
        rank: i + 1,
        name: p.display_name,
        gears: p.total_gears,
        wins: p.total_wins,
        vl_wins: p.vl_wins,
        score: p.score
      }))
    };
  } catch (e) {
    console.error('Leaderboard error:', e);
    return { ok: false, error: e.message };
  }
}

// ─── МАТЧМЕЙКИНГ ───
async function supabaseFindMatch(displayName, peerId) {
  const email = localStorage.getItem('game_email');
  if (!email) return { ok: false, error: 'Не авторизован' };

  try {
    // Проверяем — есть ли уже матч
    const existingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/matchmaking?user_email=eq.${encodeURIComponent(email)}&status=in.(waiting,matched,playing)`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const existing = await existingRes.json();
    if (existing.length > 0) {
      return { ok: true, status: existing[0].status, match: existing[0] };
    }

    // Ищем соперника
    const waitingRes = await fetch(
      `${SUPABASE_URL}/rest/v1/matchmaking?status=eq.waiting&user_email=neq.${encodeURIComponent(email)}`,
      { headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` } }
    );
    const waiting = await waitingRes.json();

    if (waiting.length > 0) {
      const opp = waiting[0];
      const matchId = 'match_' + Date.now();

      await fetch(`${SUPABASE_URL}/rest/v1/matchmaking?id=eq.${opp.id}`, {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'matched', match_id: matchId, opponent_email: email })
      });

      await fetch(`${SUPABASE_URL}/rest/v1/matchmaking`, {
        method: 'POST',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          user_email: email,
          display_name: displayName || email.split('@')[0],
          status: 'matched',
          match_id: matchId,
          peer_id: peerId || '',
          opponent_email: opp.user_email,
          created_at: new Date().toISOString()
        })
      });

      return {
        ok: true,
        status: 'matched',
        match_id: matchId,
        opponent: {
          email: opp.user_email,
          name: opp.display_name,
          peer_id: opp.peer_id || ''
        }
      };
    }

    // Встаём в очередь
    await fetch(`${SUPABASE_URL}/rest/v1/matchmaking`, {
      method: 'POST',
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        user_email: email,
        display_name: displayName || email.split('@')[0],
        status: 'waiting',
        peer_id: peerId || '',
        created_at: new Date().toISOString()
      })
    });

    return { ok: true, status: 'waiting', message: 'Поиск соперника...' };
  } catch (e) {
    console.error('Matchmaking error:', e);
    return { ok: false, error: e.message };
  }
}

// ─── ЗАВЕРШИТЬ МАТЧ ───
async function supabaseFinishMatch(matchId, result) {
  const email = localStorage.getItem('game_email');
  if (!email) return { ok: false, error: 'Не авторизован' };

  try {
    await fetch(
      `${SUPABASE_URL}/rest/v1/matchmaking?user_email=eq.${encodeURIComponent(email)}&match_id=eq.${matchId}`,
      {
        method: 'PATCH',
        headers: {
          'apikey': SUPABASE_KEY,
          'Authorization': `Bearer ${SUPABASE_KEY}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status: 'finished' })
      }
    );

    if (result === 'win') {
      const v = await supabaseRegisterVictory();
      return v;
    }

    return { ok: true, result: result || 'lose' };
  } catch (e) {
    return { ok: false, error: e.message };
  }
}

// ─── ПРОВЕРКА АВТОРИЗАЦИИ ───
function isAuthorized() {
  return !!localStorage.getItem('game_email');
}

function getEmail() {
  return localStorage.getItem('game_email') || '';
}

function getUser() {
  try {
    return JSON.parse(localStorage.getItem('game_user') || 'null');
  } catch { return null; }
}

function logout() {
  localStorage.removeItem('game_email');
  localStorage.removeItem('game_user');
}
