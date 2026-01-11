/**
 * FocusFlow Evolution Pro - Clean Code & Reward System
 */

const State = {
    habits: JSON.parse(localStorage.getItem('evolve_v3_habits')) || ["Treino", "Estudo", "Leitura"],
    history: JSON.parse(localStorage.getItem('evolve_v3_history')) || {},
    xp: parseInt(localStorage.getItem('evolve_v3_xp')) || 0,
    today: new Date().getDate(),
    activeDay: new Date().getDate(),

    save() {
        localStorage.setItem('evolve_v3_habits', JSON.stringify(this.habits));
        localStorage.setItem('evolve_v3_history', JSON.stringify(this.history));
        localStorage.setItem('evolve_v3_xp', this.xp);
        UI.refresh();
    }
};

const AudioSystem = {
    playVictory() {
        const sfx = document.getElementById('victory-sfx');
        sfx.currentTime = 0;
        sfx.play().catch(e => console.log("Áudio aguardando interação do usuário."));
    }
};

const Coach = {
    messages: [
        "Foco absoluto! Estás no caminho certo.",
        "A tua disciplina é o teu superpoder!",
        "1% melhor a cada dia. Continua!",
        "Não pares até te orgulhares de ti mesmo.",
        "O sucesso é o resultado da tua constância."
    ],
    celebrate(isFullDay) {
        AudioSystem.playVictory();
        
        const msg = isFullDay ? "DOMINAÇÃO! Todos os objetivos concluídos! 🏆" : this.messages[Math.floor(Math.random() * this.messages.length)];
        document.getElementById('evo-message').innerText = msg;

        confetti({
            particleCount: isFullDay ? 180 : 60,
            spread: 70,
            origin: { y: 0.8 },
            colors: ['#6366f1', '#10b981', '#ffffff']
        });
    }
};

const UI = {
    refresh() {
        this.renderCalendar();
        this.renderHabits();
        this.updateStats();
    },

    updateStats() {
        const level = Math.floor(State.xp / 100) + 1;
        const doneToday = (State.history[State.activeDay] || []).length;
        const pc = State.habits.length > 0 ? (doneToday / State.habits.length) * 100 : 0;

        document.getElementById('rank-title').innerText = `Nível ${level} | Evolução Constante`;
        document.getElementById('xp-bar-fill').style.width = `${State.xp % 100}%`;
        document.getElementById('daily-fill').style.width = `${pc}%`;
        document.getElementById('insight-text').innerText = pc === 100 ? "Elite: Missão Cumprida!" : "Mantém o foco no objetivo.";
    },

    renderCalendar() {
        const grid = document.getElementById('calendar-grid');
        grid.innerHTML = '';
        const lastDay = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();

        for (let i = 1; i <= lastDay; i++) {
            const done = (State.history[i] || []).length;
            const isComplete = State.habits.length > 0 && done === State.habits.length;
            
            const div = document.createElement('div');
            div.className = `day-pill ${i === State.activeDay ? 'active' : ''} ${isComplete ? 'completed' : ''}`;
            div.onclick = () => { State.activeDay = i; this.refresh(); };
            div.innerHTML = `<b>${i}</b><div class="status-dot"></div>`;
            grid.appendChild(div);
        }
    },

    renderHabits() {
        const container = document.getElementById('habit-list');
        container.innerHTML = '';
        const isToday = State.activeDay === State.today;

        State.habits.forEach(h => {
            const isDone = (State.history[State.activeDay] || []).includes(h);
            const card = document.createElement('div');
            card.className = `habit-card ${isDone ? 'done' : ''}`;
            card.style.opacity = isToday ? '1' : '0.4';
            
            card.innerHTML = `
                <b>${h}</b>
                <div class="check-circle" onclick="App.toggleTask('${h}')">
                    ${isDone ? '✓' : ''}
                </div>
            `;
            container.appendChild(card);
        });
    },

    toggleSettings() {
        const modal = document.getElementById('modal-settings');
        modal.style.display = modal.style.display === 'block' ? 'none' : 'block';
        if(modal.style.display === 'block') this.renderManageList();
    },

    renderManageList() {
        const list = document.getElementById('manage-list');
        list.innerHTML = State.habits.map((h, i) => `
            <div style="display:flex; justify-content:space-between; padding:12px 0; border-bottom:1px solid #111;">
                <span>${h}</span>
                <button onclick="App.removeHabit(${i})" style="color:#ff4444; background:none; border:none; cursor:pointer;">✕</button>
            </div>
        `).join('');
    }
};

const App = {
    toggleTask(h) {
        if (State.activeDay !== State.today) return alert("Só podes marcar o dia de hoje!");

        if (!State.history[State.today]) State.history[State.today] = [];
        const dayHistory = State.history[State.today];
        const index = dayHistory.indexOf(h);

        if (index === -1) {
            dayHistory.push(h);
            State.xp += 25;
            Coach.celebrate(dayHistory.length === State.habits.length);
        } else {
            dayHistory.splice(index, 1);
            State.xp = Math.max(0, State.xp - 15);
        }
        State.save();
    },

    addHabit() {
        const input = document.getElementById('new-habit-input');
        if (input.value.trim()) {
            State.habits.push(input.value.trim());
            input.value = '';
            State.save();
            UI.renderManageList();
        }
    },

    removeHabit(index) {
        State.habits.splice(index, 1);
        State.save();
        UI.renderManageList();
    }
};

window.onload = () => UI.refresh();
