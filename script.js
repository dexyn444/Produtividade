let habits = JSON.parse(localStorage.getItem('ff_zen_habits')) || ["Meditação", "Leitura", "Treino"];
let history = JSON.parse(localStorage.getItem('ff_zen_history')) || {};
let xp = parseInt(localStorage.getItem('ff_zen_xp')) || 0;
let activeDay = new Date().getDate();
const today = new Date();

function init() {
    renderCalendar();
    renderHabits();
    updateUI();
}

function updateUI() {
    const level = Math.floor(xp / 100) + 1;
    const progress = xp % 100;
    document.getElementById('rank-title').innerText = `Nível ${level} | BioHacker`;
    document.getElementById('xp-fill').style.width = `${progress}%`;
    document.getElementById('full-date').innerText = today.toLocaleDateString('pt-BR', {day:'numeric', month:'long'});

    // Corretor Zen
    const doneToday = history[activeDay]?.length || 0;
    const total = habits.length;
    const pc = total > 0 ? (doneToday / total) * 100 : 0;
    
    let msg = "";
    if (pc >= 100) msg = "A jornada de hoje está completa. Sua mente está em equilíbrio e sua disciplina foi absoluta.";
    else if (pc > 50) msg = "Você percorreu mais da metade do caminho. Respire fundo e finalize o que resta.";
    else if (pc > 0) msg = "O movimento foi iniciado. Mantenha a calma e foque no próximo passo, sem pressa.";
    else msg = "O silêncio do dashboard aguarda sua primeira ação. Comece pelo hábito mais leve.";
    
    document.getElementById('insight-msg').innerHTML = msg;
}

function renderCalendar() {
    const grid = document.getElementById('calendar-grid');
    grid.innerHTML = '';
    const week = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
    for(let i=1; i<=31; i++) {
        const dObj = new Date(2026, today.getMonth(), i);
        const hasData = history[i]?.length > 0;
        grid.innerHTML += `
            <div class="day-pill ${i===activeDay?'active':''} ${hasData?'has-data':''}" onclick="setDay(${i})">
                <span>${week[dObj.getDay()]}</span>
                <b>${i}</b>
            </div>`;
    }
}

function setDay(d) { activeDay = d; renderCalendar(); renderHabits(); updateUI(); }

function renderHabits() {
    const stack = document.getElementById('habit-stack');
    stack.innerHTML = '';
    habits.forEach(h => {
        const done = history[activeDay]?.includes(h);
        const card = document.createElement('div');
        card.className = `habit-card ${done?'done':''}`;
        card.innerHTML = `
            <b>${h}</b>
            <div class="check-trigger" onclick="toggleHabit('${h}')">${done?'✓':''}</div>
        `;
        stack.appendChild(card);
    });
}

function toggleHabit(h) {
    if (!history[activeDay]) history[activeDay] = [];
    const idx = history[activeDay].indexOf(h);
    if (idx > -1) {
        history[activeDay].splice(idx, 1);
        xp = Math.max(0, xp - 15);
    } else {
        history[activeDay].push(h);
        xp += 20;
        if (history[activeDay].length === habits.length) {
            confetti({ particleCount: 100, spread: 50, origin: { y: 0.8 }, colors: ['#6366f1', '#ffffff'] });
        }
    }
    save();
}

// Funções de Gestão
function openModal() { document.getElementById('modal').style.display='block'; renderManage(); }
function closeModal() { document.getElementById('modal').style.display='none'; }

function addHabit() {
    const i = document.getElementById('new-habit');
    if(i.value.trim()){ habits.push(i.value.trim()); i.value=''; save(); renderManage(); }
}

function renderManage() {
    const list = document.getElementById('manage-list');
    list.innerHTML = habits.map((h,i) => `
        <div style="display:flex; justify-content:space-between; padding:15px 0; border-bottom:1px solid #111">
            <input type="text" class="edit-input-zen" value="${h}" onchange="editHabit(${i}, this.value)">
            <button onclick="habits.splice(${i},1); save(); renderManage();" style="color:#ff4d4d; background:none; border:none;">✕</button>
        </div>`).join('');
}

function editHabit(index, newVal) {
    if(newVal.trim()){ habits[index] = newVal.trim(); save(); }
}

function save() {
    localStorage.setItem('ff_zen_habits', JSON.stringify(habits));
    localStorage.setItem('ff_zen_history', JSON.stringify(history));
    localStorage.setItem('ff_zen_xp', xp);
    renderHabits(); renderCalendar(); updateUI();
}

window.onload = init;