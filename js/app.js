const App = {
    init() {
        this.bindThemeToggle();
        this.bindTabs();
        this.bindDropdown();

        // Initialize core controllers
        Auth.init();
        Stories.init();
        Messaging.init();
        Friends.init();
    },

    bindThemeToggle() {
        const toggle = document.getElementById('theme-slider');
        const label = document.getElementById('theme-label-text');

        toggle.addEventListener('change', (e) => {
            if (e.target.checked) {
                document.documentElement.classList.remove('dark');
                label.textContent = 'Light Mode';
                State.isDarkMode = false;
            } else {
                document.documentElement.classList.add('dark');
                label.textContent = 'Dark Mode';
                State.isDarkMode = true;
            }
        });
    },

    bindTabs() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const tab = e.currentTarget.dataset.tab;
                this.switchTab(tab);
            });
        });
    },

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));

        document.getElementById(`tab-btn-${tab}`).classList.add('active');
        document.getElementById(`view-${tab}`).classList.remove('hidden');
        State.activeTab = tab;
    },

    bindDropdown() {
        document.getElementById('btn-profile-dropdown').addEventListener('click', () => {
            document.getElementById('profile-dropdown').classList.toggle('hidden');
        });
    }
};

// Start application after DOM ready
window.addEventListener('DOMContentLoaded', () => {
    App.init();
});