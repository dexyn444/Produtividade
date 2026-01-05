let habits = JSON.parse(localStorage.getItem('ff_zen_habits')) || ["Meditação", "Treino"];
let history = JSON.parse(localStorage.getItem('ff_zen_history')) || {};
let xp = parseInt(localStorage.getItem('ff_zen_xp')) || 0;
let activeDay = new Date().getDate();
const today = new Date();

let focusTimer;
let secondsLeft = 1500;

const quotes = [
    { text: "Tudo posso naquele que me fortalece.", author: "Filipenses 4:13" },
    { text: "O Senhor é o meu pastor, nada me faltará.", author: "Salmo 23:1" },
    { text: "Não fui eu que ordenei? Seja forte e corajoso!", author: "Josué 1:9" },
    { text: "A fé não torna as coisas fáceis, torna as possíveis.", author: "Reflexão" }
];

const badges = [
    { id: 'first', name: 'Início', icon: '🌱', goal: 1 },
    { id: 'week', name: '7 Dias', icon: '🔥', goal: 7 },
    { id: 'master', name: 'Mestre', icon: '👑', goal: 30 }
];

function init() {
    renderCalendar();
    renderHabits();
    updateUI();
    newQuote();
}

function updateUI() {
    const level = Math.floor(xp / 100) + 1;
    document.getElementById('rank-title').innerText = `Nível ${level} | BioHacker`;
    document.getElementById('xp-fill').style.width = `${xp % 100}%`;
    document.getElementById('full-date').innerText = today.toLocaleDateString('pt-BR', {day:'numeric', month:'long'});

    const doneToday = (history[activeDay] || []).length;
    const pc = habits.length > 0 ? (doneToday / habits.length) * 100 : 0;
    document.getElementById('insight-msg').innerText = pc >= 100 ? "Dia Perfeito!" : "Foque no próximo passo.";
}

function newQuote() {
    const q = quotes[Math.floor(Math.random() * quotes.length)];
    document.getElementById('quote-text').innerText = `"${q.text}"`;
    document.getElementById('quote-author').innerText = q.author;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const week = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for(let i=1; i<=31; i++) {
        const dObj = new Date(today.getFullYear(), today.getMonth(), i);
        grid.innerHTML += `
            <div class="day-pill ${i===activeDay?'active':''}" onclick="setDay(${i})">
                <span>${week[dObj.getDay()]}</span><b>${i}</b>
            </div>`;
    }
}

function setDay(d) { activeDay = d; renderCalendar(); renderHabits(); updateUI(); }

function renderHabits() {
    const stack = document.getElementById('habit-stack');
    stack.innerHTML = '';
    habits.forEach(h => {
        const done = (history[activeDay] || []).includes(h);
        stack.innerHTML += `
            <div class="habit-card ${done?'done':''}">
                <b onclick="enterDeepFocus('${h}')">${h} <small style="color:var(--accent)">⏱️</small></b>
                <div class="check-trigger" onclick="toggleHabit('${h}')">${done?'✓':''}</div>
            </div>`;
    });
}

function toggleHabit(h) {
    if (!history[activeDay]) history[activeDay] = [];
    const idx = history[activeDay].indexOf(h);
    if (idx > -1) { history[activeDay].splice(idx, 1); xp = Math.max(0, xp-15); }
    else { 
        history[activeDay].push(h); xp += 20; 
        if(history[activeDay].length === habits.length) confetti({particleCount:100, origin:{y:0.8}});
    }
    save();
}

function enterDeepFocus(h) {
    document.getElementById('focus-item-name').innerText = h;
    document.getElementById('deep-focus').style.display = 'flex';
    secondsLeft = 1500;
    focusTimer = setInterval(() => {
        secondsLeft--;
        const m = Math.floor(secondsLeft/60), s = secondsLeft%60;
        document.getElementById('focus-timer').innerText = `${m}:${s<10?'0':''}${s}`;
        if(secondsLeft<=0) { clearInterval(focusTimer); xp+=50; save(); exitDeepFocus(); }
    }, 1000);
}

function exitDeepFocus() { clearInterval(focusTimer); document.getElementById('deep-focus').style.display='none'; }

function showBadges() {
    document.getElementById('modal-badges').style.display='block';
    const container = document.getElementById('badges-container');
    const days = Object.keys(history).length;
    container.innerHTML = badges.map(b => `
        <div class="badge-item ${days >= b.goal ? 'unlocked' : ''}">
            <span>${b.icon}</span><br><small>${b.name}</small>
        </div>`).join('');
}

function closeBadges() { document.getElementById('modal-badges').style.display='none'; }

function shareProgress() {
    const text = `Meu progresso FocusFlow: ${(history[activeDay]||[]).length} hábitos feitos hoje! 🚀`;
    if(navigator.share) navigator.share({title:'FocusFlow', text: text});
    else alert("Progresso copiado!");
}

function openModal() { document.getElementById('modal').style.display='block'; renderManage(); }
function closeModal() { document.getElementById('modal').style.display='none'; }
function addHabit() { const i = document.getElementById('new-habit'); if(i.value.trim()){ habits.push(i.value.trim()); i.value=''; save(); renderManage(); } }
function renderManage() {
    document.getElementById('manage-list').innerHTML = habits.map((h,i) => `
        <div style="display:flex; justify-content:space-between; padding:10px 0;">
            <input type="text" value="${h}" onchange="habits[${i}]=this.value; save();" style="background:none; border:none; color:#fff;">
            <button onclick="habits.splice(${i},1); save(); renderManage();" style="color:red; background:none; border:none;">✕</button>
        </div>`).join('');
}

function save() {
    localStorage.setItem('ff_zen_habits', JSON.stringify(habits));
    localStorage.setItem('ff_zen_history', JSON.stringify(history));
    localStorage.setItem('ff_zen_xp', xp);
    renderHabits(); renderCalendar(); updateUI();
}

window.onload = init;
