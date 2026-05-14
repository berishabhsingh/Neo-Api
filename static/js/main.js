// App Initialization
document.addEventListener('DOMContentLoaded', async () => {
    try {
        const health = await API.getHealth();
        if (health.authenticated) {
            document.getElementById('auth-view').classList.add('hidden');
            document.getElementById('dashboard-view').classList.remove('hidden');
            document.getElementById('nav-status').classList.remove('hidden');
            initDashboard();
        }
    } catch (e) {}
});

function initDashboard() {
    loadPositions();
    loadOrders();
    loadStrategies();
    loadRisk();
    loadLogs();
    updateMarketWatch();

    // Auto-refresh data every 10 seconds
    setInterval(() => {
        if (!document.getElementById('dashboard-view').classList.contains('hidden')) {
            loadPositions();
            loadOrders();
            loadLogs();
            updateMarketWatch();
        }
    }, 10000);
}

function escapeHTML(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

function switchTab(tab) {
    document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
    document.getElementById(`tab-${tab}`).classList.remove('hidden');

    document.querySelectorAll('.tab-btn').forEach(b => {
        b.classList.remove('border-blue-500', 'text-white');
        b.classList.add('border-transparent', 'text-slate-400');
    });
    event.target.classList.add('border-blue-500', 'text-white');
    event.target.classList.remove('border-transparent', 'text-slate-400');

    if (tab === 'logs') loadLogs();
}

async function loadLogs() {
    try {
        const logs = await API.getLogs();
        const container = document.getElementById('logs-container');
        container.innerHTML = logs.map(l => `
            <div class="flex space-x-4 py-1 border-b border-slate-800/50">
                <span class="text-slate-500 w-32">${new Date(l.timestamp).toLocaleTimeString()}</span>
                <span class="${l.level === 'ERROR' ? 'text-red-400' : l.level === 'WARNING' ? 'text-yellow-400' : 'text-blue-400'} font-bold w-16">${escapeHTML(l.level)}</span>
                <span class="text-slate-300 flex-1">${escapeHTML(l.message)}</span>
            </div>
        `).join('');
    } catch (e) {}
}
