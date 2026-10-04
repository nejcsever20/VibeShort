window.Auth = {
  pendingRegistration: null,
  generatedCode: null,

  // Fallback storage for parsed .env keys
  envKeys: {},

  // Fetch .env file at runtime for Live Server
  async loadEnv() {
    try {
      const response = await fetch('/.env');
      if (!response.ok) return;
      const text = await response.text();
      text.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          this.envKeys[key.trim()] = valueParts.join('=').trim();
        }
      });
    } catch (err) {
      console.warn('Could not load .env file:', err);
    }
  },

  get EMAILJS_SERVICE_ID() {
    return this.envKeys.EMAILJS_SERVICE_ID || "service_nejc";
  },
  get EMAILJS_TEMPLATE_ID() {
    return this.envKeys.EMAILJS_TEMPLATE_ID || "";
  },
  get EMAILJS_PUBLIC_KEY() {
    return this.envKeys.EMAILJS_PUBLIC_KEY || "";
  },

  async initTheme() {
    await this.loadEnv();

    // Initialize EmailJS with Public Key
    if (window.emailjs && this.EMAILJS_PUBLIC_KEY) {
      emailjs.init(this.EMAILJS_PUBLIC_KEY);
    }

    const checkbox = document.getElementById('theme-toggle-checkbox');
    if (checkbox) {
      checkbox.addEventListener('change', (e) => {
        const theme = e.target.checked ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', theme);
      });
    }
  },

  async checkSession() {
    const sessionUserId = localStorage.getItem('vibe_session_id');
    if (sessionUserId) {
      const user = await State.get('users', sessionUserId);
      if (user && user.displayName) {
        State.currentUser = user;
        this.renderHeaderUser();
        if (window.Friends && typeof Friends.renderDashboard === 'function') {
          Friends.renderDashboard();
        }
        return;
      }
    }
    this.renderHeaderUser();
    this.renderLoggedOutState();
  },

  renderHeaderUser() {
    const container = document.getElementById('header-user-section');
    if (!container) return;

    if (State.currentUser) {
      container.innerHTML = `
        <div class="header-profile" onclick="Auth.toggleDropdown()">
          <div class="avatar">${State.currentUser.displayName.charAt(0).toUpperCase()}</div>
          <span>${State.currentUser.displayName}</span>
          <i class="fa-solid fa-chevron-down"></i>
          <div class="profile-dropdown" id="profile-dropdown">
            <div class="dropdown-item" onclick="Auth.logout()"><i class="fa-solid fa-right-from-bracket"></i> Logout</div>
          </div>
        </div>
      `;
    } else {
      container.innerHTML = `
        <button class="btn btn-primary" onclick="Auth.openModal()">Login / Register</button>
      `;
    }
  },

  renderLoggedOutState() {
    const main = document.getElementById('app-content');
    if (!main) return;

    main.style.gridTemplateColumns = '1fr';
    main.innerHTML = `
      <div class="text-center" style="padding: 4rem 1rem;">
        <h1>Welcome to VibeShort</h1>
        <p class="text-muted mb-4">Please log in or register to check stories and messages!</p>
        <button class="btn btn-primary" onclick="Auth.openModal()">Get Started</button>
      </div>
    `;
  },

  toggleDropdown() {
    const drop = document.getElementById('profile-dropdown');
    if (drop) drop.classList.toggle('active');
  },

  openModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.add('active');
  },

  closeModal() {
    const modal = document.getElementById('auth-modal');
    if (modal) modal.classList.remove('active');
  },

  switchTab(tab) {
    const tabLogin = document.getElementById('tab-login');
    const tabRegister = document.getElementById('tab-register');
    const loginForm = document.getElementById('login-form');
    const registerForm = document.getElementById('register-form');

    if (tabLogin) tabLogin.classList.toggle('active', tab === 'login');
    if (tabRegister) tabRegister.classList.toggle('active', tab === 'register');
    if (loginForm) loginForm.classList.toggle('hidden', tab !== 'login');
    if (registerForm) registerForm.classList.toggle('hidden', tab !== 'register');
  },

  async handleRegister(e) {
    e.preventDefault();

    // Fix 1: Ensure .env file is loaded into memory before retrieving parameters
    await this.loadEnv();

    const emailEl = document.getElementById('reg-email');
    const passwordEl = document.getElementById('reg-password');
    if (!emailEl || !passwordEl) return;

    const email = emailEl.value.trim().toLowerCase();
    const password = passwordEl.value;

    // Fix 2: Duplicate Email Check
    const users = await State.getAll('users');
    if (users.some(u => u.email.toLowerCase() === email)) {
      alert('Email already registered! Please log in instead.');
      return;
    }

    // 1. Generate 6-digit verification code
    this.generatedCode = Math.floor(100000 + Math.random() * 900000).toString();

    this.pendingRegistration = {
      id: 'user_' + Date.now(),
      email,
      password,
      isConfirmed: false,
      displayName: ''
    };

    // 2. Send email via EmailJS
    try {
      if (!window.emailjs) {
        throw new Error('EmailJS SDK script tag missing in index.html');
      }

      // Re-initialize to guarantee key presence
      if (this.EMAILJS_PUBLIC_KEY) {
        emailjs.init(this.EMAILJS_PUBLIC_KEY);
      }

      await emailjs.send(
        this.EMAILJS_SERVICE_ID,
        this.EMAILJS_TEMPLATE_ID,
        {
          to_email: email,
          verification_code: this.generatedCode
        },
        this.EMAILJS_PUBLIC_KEY
      );
      console.log('Email sent successfully!');
    } catch (err) {
      console.error('EmailJS Error Details:', err);
      alert(`Failed to send email. Error: ${err.text || err.message || err}`);
      return;
    }

    // 3. Open code verification modal
    this.closeModal();
    const targetEmailEl = document.getElementById('confirm-target-email');
    if (targetEmailEl) targetEmailEl.innerText = email;

    const confirmModal = document.getElementById('confirm-email-modal');
    if (confirmModal) confirmModal.classList.add('active');
  },

  async confirmEmailStep(e) {
    if (e && e.preventDefault) e.preventDefault();

    const codeInput = document.getElementById('verification-code-input');
    const userEnteredCode = codeInput ? codeInput.value.trim() : '';

    if (userEnteredCode !== this.generatedCode) {
      alert('Invalid code! Check your email inbox for the 6-digit code.');
      return;
    }

    if (!this.pendingRegistration) return;
    this.pendingRegistration.isConfirmed = true;
    await State.put('users', this.pendingRegistration);

    const confirmModal = document.getElementById('confirm-email-modal');
    const onboardingModal = document.getElementById('onboarding-modal');

    if (confirmModal) confirmModal.classList.remove('active');
    if (onboardingModal) onboardingModal.classList.add('active');
  },

  async saveDisplayName(e) {
    e.preventDefault();
    const nameEl = document.getElementById('setup-display-name');
    const displayName = nameEl ? nameEl.value : '';
    if (!displayName || !this.pendingRegistration) return;

    this.pendingRegistration.displayName = displayName;
    await State.put('users', this.pendingRegistration);

    State.currentUser = this.pendingRegistration;
    localStorage.setItem('vibe_session_id', State.currentUser.id);
    this.pendingRegistration = null;

    const onboardingModal = document.getElementById('onboarding-modal');
    if (onboardingModal) onboardingModal.classList.remove('active');
    location.reload();
  },

  async handleLogin(e) {
    e.preventDefault();
    const emailEl = document.getElementById('login-email');
    const passwordEl = document.getElementById('login-password');
    if (!emailEl) return;

    const email = emailEl.value.trim().toLowerCase();
    const password = passwordEl ? passwordEl.value : '';

    const users = await State.getAll('users');
    const user = users.find(u => u.email.toLowerCase() === email);

    if (!user) {
      alert('User not found!');
      return;
    }

    // Fix 3: Added password check on login
    if (user.password && user.password !== password) {
      alert('Incorrect password!');
      return;
    }

    if (!user.isConfirmed) {
      alert('Please confirm your email address before logging in!');
      return;
    }

    State.currentUser = user;
    localStorage.setItem('vibe_session_id', user.id);
    this.closeModal();
    location.reload();
  },

  logout() {
    localStorage.removeItem('vibe_session_id');
    State.currentUser = null;
    location.reload();
  }
};