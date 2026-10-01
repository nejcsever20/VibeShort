const Auth = {
    init() {
        this.bindEvents();
        this.checkSession();
    },

    bindEvents() {
        document.getElementById('btn-auth-mode-login').addEventListener('click', () => this.setAuthMode('login'));
        document.getElementById('btn-auth-mode-register').addEventListener('click', () => this.setAuthMode('register'));
        document.getElementById('auth-form').addEventListener('submit', (e) => this.handleAuthSubmit(e));
        document.getElementById('btn-verify-otp').addEventListener('click', () => this.verifyEmailOTP());
        document.getElementById('btn-finish-onboarding').addEventListener('click', () => this.finishOnboarding());
        document.getElementById('menu-item-logout').addEventListener('click', () => this.logout());
    },

    checkSession() {
        const modal = document.getElementById('auth-modal');
        if (!State.currentUser.isConfirmed) {
            modal.classList.remove('hidden');
        } else {
            modal.classList.add('hidden');
            this.updateUserUI();
        }
    },

    setAuthMode(mode) {
        const title = document.getElementById('auth-title');
        const submitBtn = document.getElementById('auth-submit-btn');
        const loginBtn = document.getElementById('btn-auth-mode-login');
        const regBtn = document.getElementById('btn-auth-mode-register');

        if (mode === 'register') {
            title.textContent = 'Create an Account';
            submitBtn.textContent = 'Register & Confirm Email';
            regBtn.classList.add('active');
            loginBtn.classList.remove('active');
        } else {
            title.textContent = 'Welcome Back';
            submitBtn.textContent = 'Sign In';
            loginBtn.classList.add('active');
            regBtn.classList.remove('active');
        }
    },

    handleAuthSubmit(e) {
        e.preventDefault();
        const email = document.getElementById('auth-email-input').value;
        State.currentUser.email = email;
        document.getElementById('confirm-email-target').textContent = email;

        document.getElementById('auth-step-form').classList.add('hidden');
        document.getElementById('auth-step-confirm').classList.remove('hidden');
    },

    verifyEmailOTP() {
        document.getElementById('auth-step-confirm').classList.add('hidden');
        document.getElementById('auth-step-displayname').classList.remove('hidden');
    },

    finishOnboarding() {
        const displayName = document.getElementById('onboard-display-name').value || 'Alex Rivera';
        const handle = document.getElementById('onboard-handle').value || 'alexrivera';

        State.currentUser.displayName = displayName;
        State.currentUser.handle = handle;
        State.currentUser.isConfirmed = true;

        document.getElementById('auth-modal').classList.add('hidden');
        this.updateUserUI();
    },

    updateUserUI() {
        document.getElementById('nav-avatar-img').src = State.currentUser.avatar;
        document.getElementById('dropdown-name-text').textContent = State.currentUser.displayName;
        document.getElementById('dropdown-handle-text').textContent = '@' + State.currentUser.handle;
    },

    logout() {
        State.currentUser.isConfirmed = false;
        document.getElementById('auth-step-displayname').classList.add('hidden');
        document.getElementById('auth-step-confirm').classList.add('hidden');
        document.getElementById('auth-step-form').classList.remove('hidden');
        document.getElementById('auth-modal').classList.remove('hidden');
    }
};