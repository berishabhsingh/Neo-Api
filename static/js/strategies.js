async function loadStrategies() {
    try {
        const strats = await API.getStrategies();
        const container = document.getElementById('strategies-list');
        container.innerHTML = strats.map(s => `
            <div class="glass-card p-6 rounded-xl border-t-2 ${s.is_active ? 'border-green-500' : 'border-slate-600'}">
                <div class="flex justify-between items-start mb-4">
                    <div>
                        <h4 class="font-bold text-lg">${escapeHTML(s.name)}</h4>
                        <p class="text-xs text-slate-400">${escapeHTML(s.symbol)}</p>
                    </div>
                    <button onclick="toggleStrategy(${s.id})" class="px-3 py-1 rounded text-xs font-bold transition ${s.is_active ? 'bg-red-900/40 text-red-400 hover:bg-red-900/60' : 'bg-green-900/40 text-green-400 hover:bg-green-900/60'}">
                        ${s.is_active ? 'STOP' : 'START'}
                    </button>
                </div>
                <div class="space-y-2 text-sm text-slate-300">
                    <p><i class="fas fa-sign-in-alt text-blue-400 mr-2 w-4"></i> ${escapeHTML(s.entry_condition)}</p>
                    <p><i class="fas fa-shield-virus text-yellow-400 mr-2 w-4"></i> SL: ${s.stop_loss}%</p>
                </div>
            </div>
        `).join('');
    } catch (e) { console.error(e); }
}

function showCreateStrategyModal() {
    document.getElementById('strategy-modal').classList.remove('hidden');
}

function closeStrategyModal() {
    document.getElementById('strategy-modal').classList.add('hidden');
}

async function saveStrategy() {
    const payload = {
        name: document.getElementById('strat-name').value,
        symbol: document.getElementById('strat-symbol').value,
        entry_condition: document.getElementById('strat-entry').value,
        exit_condition: "Auto",
        stop_loss: parseFloat(document.getElementById('strat-sl').value),
        take_profit: 0
    };

    try {
        await API.createStrategy(payload);
        closeStrategyModal();
        loadStrategies();
    } catch (e) { alert(e.message); }
}

async function toggleStrategy(id) {
    try {
        await API.toggleStrategy(id);
        loadStrategies();
    } catch (e) { alert(e.message); }
}
