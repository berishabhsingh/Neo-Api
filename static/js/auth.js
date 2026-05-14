async function handleLogin() {
    const payload = {
        mobile_number: document.getElementById('mobile').value,
        ucc: document.getElementById('ucc').value,
        totp: document.getElementById('totp').value
    };

    try {
        await API.login(payload);
        document.getElementById('totp-step').classList.add('hidden');
        document.getElementById('mpin-step').classList.remove('hidden');
        document.getElementById('auth-error').classList.add('hidden');
    } catch (e) {
        showAuthError(e.message);
    }
}

async function handleVerifyMpin() {
    const payload = { mpin: document.getElementById('mpin').value };
    try {
        await API.verify(payload);
        document.getElementById('auth-view').classList.add('hidden');
        document.getElementById('dashboard-view').classList.remove('hidden');
        document.getElementById('nav-status').classList.remove('hidden');
        initDashboard();
    } catch (e) {
        showAuthError(e.message);
    }
}

function showAuthError(msg) {
    const err = document.getElementById('auth-error');
    err.innerText = msg;
    err.classList.remove('hidden');
}

function handleLogout() {
    window.location.reload();
}
