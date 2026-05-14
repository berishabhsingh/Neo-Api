const API = {
    async request(url, options = {}) {
        const res = await fetch(url, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            }
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.detail || 'Request failed');
        return data;
    },

    login(payload) { return this.request('/api/login', { method: 'POST', body: JSON.stringify(payload) }); },
    verify(payload) { return this.request('/api/verify', { method: 'POST', body: JSON.stringify(payload) }); },
    getPositions() { return this.request('/api/positions'); },
    getOrders() { return this.request('/api/orders'); },
    getStrategies() { return this.request('/api/strategies'); },
    createStrategy(payload) { return this.request('/api/strategies', { method: 'POST', body: JSON.stringify(payload) }); },
    toggleStrategy(id) { return this.request(`/api/strategies/${id}/toggle`, { method: 'POST' }); },
    getRisk() { return this.request('/api/risk'); },
    updateRisk(payload) { return this.request('/api/risk', { method: 'POST', body: JSON.stringify(payload) }); },
    getLogs() { return this.request('/api/logs'); },
    getHealth() { return this.request('/api/health'); }
};
