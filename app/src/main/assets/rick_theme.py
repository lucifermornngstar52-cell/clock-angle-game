# -*- coding: utf-8 -*-
"""Ретема Numbra в стиле Рика и Морти (чистый юмор, без мата)."""
import re, io

files = ["index.html", "mathopoly.html", "minigames.html", "chronokeepers.html"]

PALETTE = [
    ("#00ff41", "#97ce4c"), ("#00FF41", "#97ce4c"),
    ("rgba(0,255,65", "rgba(151,206,76"),
    ("#008f11", "#4a7027"),
    ("#0a0a0a", "#070b23"),
    ("rgba(0,18,0", "rgba(9,14,44"),
    ("#00ff88", "#97ce4c"),
]

def patch(fname, pairs, must=True):
    with io.open(fname, encoding="utf-8") as f:
        s = f.read()
    for a, b in pairs:
        if a not in s:
            if must:
                raise SystemExit(f"НЕ НАЙДЕНО в {fname}: {a[:70]}")
            continue
        s = s.replace(a, b)
    with io.open(fname, "w", encoding="utf-8") as f:
        f.write(s)
    print("ok:", fname)

# ── Палитра во всех файлах ──
for f in files:
    patch(f, PALETTE, must=False)

# ── index.html: тематические правки ──
IDX = [
    # Интро в стиле Рика и Морти
    ("<div class=\"intro-badge\">// СЕКРЕТНЫЙ ФАЙЛ — УРОВЕНЬ ДОСТУПА: МАКСИМАЛЬНЫЙ //</div>",
     "<img src=\"rm.png\" style=\"width:68%;max-width:200px;border-radius:10px;border:1px solid #97ce4c;margin:0 auto 12px;display:block;\">\n"
     "<div class=\"intro-badge\">// ЗАПИСЬ ИЗ ИЗМЕРЕНИЯ C-137 — СЕКРЕТНО //</div>"),
    ("<div class=\"intro-title\">⏱ МАШИНА ВРЕМЕНИ<br>ОБНАРУЖЕНА</div>",
     "<div class=\"intro-title\">🌀 МАШИНА ВРЕМЕНИ<br>ОБНАРУЖЕНА</div>"),
    ("Вы — <span>помощник учёного</span>. Пока профессор отлучился, вы обнаружили в его лаборатории странную машину с мерцающим циферблатом.<br><br>",
     "Ты — <span>Морти</span>. Рик отлучился в другое измерение за соусом и оставил тебя в лаборатории одного. Ну, почти одного.<br><br>"),
    ("Система заблокирована. Чтобы <span>получить доступ</span> — нужно решить серию задач на определение углов между стрелками часов.<br><br>",
     "В лаборатории гудит машина времени с мерцающим циферблатом. Чтобы <span>открыть портал</span> — реши задачи на углы между стрелками часов.<br><br>"),
    ("Четыре уровня, четыре эпохи. <span>История ждёт вас.</span><br><br>Удачи, хакер.<span class=\"intro-cursor\"></span>",
     "Четыре уровня, четыре измерения. <span>Не паникуй, Морти.</span><br><br>Паника — враг точных вычислений.<span class=\"intro-cursor\"></span>"),
    ("[ НАЧАТЬ ВЗЛОМ ]", "[ ОТКРЫТЬ ПОРТАЛ ]"),
    # Меню
    ("<div class=\"msub\">// CLOCK ANGLE CRACKER //</div>",
     "<div class=\"msub\">// МУЛЬТИВСЕЛЕННАЯ УГЛОВ //</div>"),
    # Реплики Рика и Морти в фидбек
    ("/* ══ МАТРИЦА ══ */",
     "/* ══ ПОРТАЛЬНЫЙ ШУМ ══ */"),
    ("const ch='アイウエオ01αβ∑∏∞#@$%&(){}<>?\\\\|'.split('');",
     "const ch='∑∏∞ΔΩψ≈⧖×÷αβθ01<C137>'.split('');"),
    # Результат уровня
    ("document.getElementById('rt').textContent=LVS[ST.lv].title+' ВЗЛОМАН!';",
     "document.getElementById('rt').textContent=LVS[ST.lv].title+' — ПОРТАЛ ОТКРЫТ!';"),
    # Гейм-овер
    ("ВЗЛОМ ПРОВАЛЕН</div>", "ПОРТАЛ СХЛОПНУЛСЯ</div>"),
    # Победа
    ("// ВЗЛОМ ЗАВЕРШЁН — ДОСТУП ПОЛУЧЕН //", "// ПОРТАЛ ОТКРЫТ — ДОСТУП ПОЛУЧЕН //"),
    ("🚀 МАШИНА ВРЕМЕНИ<br>ЗАПУЩЕНА!", "🌀 ПОРТАЛ ОТКРЫТ!<br>МАШИНА ВРЕМЕНИ ЗАПУЩЕНА!"),
    ("`Система взломана. Координаты установлены.<br><br>",
     "`Рик будет гордиться. Наверное. Координаты установлены.<br><br>"),
    ("Оглядитесь. История открыта перед вами. 😏`;",
     "Не паникуй и оглядись: <span class='yr'>история</span> открыта перед тобой, Морти. *уэрп*`;"),
    # Кнопки
    ("[ СЛЕДУЮЩИЙ УРОВЕНЬ ]", "[ СЛЕДУЮЩЕЕ ИЗМЕРЕНИЕ ]"),
    # Подсказки
    ("showFb('💡 Правильный ответ выделен!','hint')", "showFb('💡 Рик подсветил правильный ответ!','hint')"),
    ("showFb('💡 Один из правильных выделен!','hint')", "showFb('💡 Рик подсветил один из них!','hint')"),
    ("showFb('Выбери хотя бы один ответ!','hint')", "showFb('Морти, выбери хотя бы один ответ!','hint')"),
]
patch("index.html", IDX)

# ── Реплики Рика на верно/неверно (пулы + подмена) ──
with io.open("index.html", encoding="utf-8") as f:
    s = f.read()

quips = """
/* ══ РЕПЛИКИ РИКА ══ */
const RICK_OK=['✓ ГЕНИАЛЬНО, МОРТИ!','✓ НАУКА ПОБЕДИЛА!','✓ РИК БЫ ГОРДИЛСЯ!','✓ ПОРТАЛ СТАБИЛЕН!','✓ ВОТ ЭТО ПО ДЕПОРТАЛЬНОМУ!'];
const RICK_NO=['✗ НЕВЕРНО, МОРТИ!','✗ НЕ ПАНИКУЙ, НО ЭТО НЕВЕРНО!','✗ РИК ТАК НЕ ОШИБАЕТСЯ!','✗ ПОРТАЛ ЗАШИПЕЛ!','✗ МОРТИ, ТЫ СНОВА ПАНИКУЕШЬ!'];
const pick=a=>a[Math.random()*a.length|0];
"""

s = s.replace("/* ══ ПОРТАЛЬНЫЙ ШУМ ══ */", quips + "\n/* ══ ПОРТАЛЬНЫЙ ШУМ ══ */", 1)

s = s.replace("sfx('no');showFb('✗ НЕВЕРНО!','bad');",
              "sfx('no');showFb(pick(RICK_NO),'bad');")
s = s.replace("showFb('✓ ВЕРНО! +'+LVS[ST.lv].cp+'🪙','ok');",
              "showFb(pick(RICK_OK)+' +'+LVS[ST.lv].cp+'🪙','ok');")
s = s.replace("let msg='✗ НЕВЕРНО!';",
              "let msg=pick(RICK_NO);")
s = s.replace("if(missed&&extra)msg='✗ Пропущенные и лишние!';",
              "if(missed&&extra)msg='✗ И пропустил, и лишку, Морти!';")
s = s.replace("else if(missed)msg='✗ Не все правильные!';",
              "else if(missed)msg='✗ Не все, Морти! Не все!';")
s = s.replace("else if(extra)msg='✗ Есть лишние!';",
              "else if(extra)msg='✗ Лишний ответ, Морти!';")

with io.open("index.html", "w", encoding="utf-8") as f:
    f.write(s)
print("реплики Рика добавлены")

# ── Матричный дождь → зелёный портальный (цвет уже заменён палитрой) ──
# ── Меню: арт под заголовком ──
with io.open("index.html", encoding="utf-8") as f:
    s = f.read()
s = s.replace('<div class="msub">// МУЛЬТИВСЕЛЕННАЯ УГЛОВ //</div>',
              '<div class="msub">// МУЛЬТИВСЕЛЕННАЯ УГЛОВ //</div>\n  '
              '<img src="rm.png" style="width:42%;max-width:150px;border-radius:12px;border:1px solid #97ce4c;margin:10px auto;display:block;">', 1)
with io.open("index.html", "w", encoding="utf-8") as f:
    f.write(s)
print("арт в меню добавлен")
