async function loadPositions() {
    try {
        const { data } = await API.getPositions();
        const container = document.getElementById('positions-list');
        container.innerHTML = data.map(p => `
            <tr class="hover:bg-slate-800/30 transition">
                <td class="px-6 py-4 font-medium">${escapeHTML(p.trading_symbol)}</td>
                <td class="px-6 py-4 text-right">${p.quantity}</td>
                <td class="px-6 py-4 text-right">₹${p.avg_price.toFixed(2)}</td>
                <td class="px-6 py-4 text-right font-bold text-blue-400">₹${p.net_value.toFixed(2)}</td>
            </tr>
        `).join('') || '<tr><td colspan="4" class="px-6 py-4 text-center text-slate-500">No open positions</td></tr>';
        document.getElementById('stat-positions-count').innerText = data.length;
    } catch (e) { console.error(e); }
}

async function loadOrders() {
    try {
        const { data } = await API.getOrders();
        const container = document.getElementById('orders-list');
        container.innerHTML = data.map(o => `
            <tr class="hover:bg-slate-800/30 transition text-xs">
                <td class="px-6 py-4 font-medium">${escapeHTML(o.trading_symbol)}</td>
                <td class="px-6 py-4"><span class="px-2 py-0.5 rounded ${o.transaction_type === 'B' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}">${o.transaction_type === 'B' ? 'BUY' : 'SELL'}</span></td>
                <td class="px-6 py-4 text-right">${o.quantity}</td>
                <td class="px-6 py-4 text-right">₹${o.price.toFixed(2)}</td>
                <td class="px-6 py-4"><span class="text-slate-400">${escapeHTML(o.status)}</span></td>
            </tr>
        `).join('') || '<tr><td colspan="5" class="px-6 py-4 text-center text-slate-500">No recent orders</td></tr>';
    } catch (e) { console.error(e); }
}

async function loadRisk() {
    try {
        const risk = await API.getRisk();
        document.getElementById('risk-max-loss').value = risk.max_daily_loss;
        const btn = document.getElementById('kill-switch-btn');
        if (risk.kill_switch_enabled) {
            btn.classList.replace('bg-slate-700', 'bg-red-600');
            btn.querySelector('span').classList.replace('left-1', 'left-7');
        } else {
            btn.classList.replace('bg-red-600', 'bg-slate-700');
            btn.querySelector('span').classList.replace('left-7', 'left-1');
        }
    } catch (e) { console.error(e); }
}

async function toggleKillSwitch() {
    const current = document.getElementById('kill-switch-btn').classList.contains('bg-red-600');
    await API.updateRisk({ kill_switch_enabled: !current });
    loadRisk();
}

async function saveRiskSettings() {
    const maxLoss = document.getElementById('risk-max-loss').value;
    await API.updateRisk({ max_daily_loss: parseFloat(maxLoss) });
    alert('Risk settings updated');
}

function updateMarketWatch() {
    const container = document.getElementById('market-watch');
    const symbols = [
        { s: 'NIFTY 50', p: 25123.45, c: 45.20 },
        { s: 'BANK NIFTY', p: 52340.10, c: -120.30 },
        { s: 'RELIANCE', p: 2540.00, c: 12.50 }
    ];
    container.innerHTML = symbols.map(s => `
        <div class="flex justify-between items-center p-3 bg-slate-800/50 rounded-lg">
            <div>
                <p class="text-sm font-bold">${s.s}</p>
                <p class="text-xs ${s.c >= 0 ? 'text-green-400' : 'text-red-400'}">${s.c >= 0 ? '+' : ''}${s.c.toFixed(2)}</p>
            </div>
            <p class="text-sm font-mono font-bold">₹${s.p.toLocaleString()}</p>
        </div>
    `).join('');
}
