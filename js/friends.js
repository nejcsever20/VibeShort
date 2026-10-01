const Friends = {
    init() {
        this.bindEvents();
        this.renderNetwork();
    },

    bindEvents() {
        document.getElementById('menu-item-profile').addEventListener('click', () => this.openProfileCard());
        document.getElementById('menu-item-settings').addEventListener('click', () => this.openSettings());
        document.getElementById('btn-close-profile').addEventListener('click', () => this.closeProfileCard());
        document.getElementById('btn-close-settings').addEventListener('click', () => this.closeSettings());
        document.getElementById('btn-save-settings').addEventListener('click', () => this.saveSettings());
        document.getElementById('btn-edit-profile-from-card').addEventListener('click', () => {
            this.closeProfileCard();
            this.openSettings();
        });
    },

    renderNetwork() {
        const container = document.getElementById('network-users-list');
        container.innerHTML = '';

        State.networkUsers.forEach(user => {
            let badgeText = 'Follower';
            if (user.relationship === 'close_friend') badgeText = '★ Close Friend';
            else if (user.relationship === 'friend') badgeText = 'Mutual Friend';

            const html = `
                <div style="padding:12px; border:1px solid var(--border-color); border-radius:var(--radius-md); background:var(--bg-card); display:flex; justify-between; align-items:center; margin-bottom:10px;">
                    <div style="display:flex; align-items:center; gap:10px;">
                        <img src="${user.avatar}" style="width:40px; height:40px; border-radius:50%; object-fit:cover;">
                        <div>
                            <div style="font-weight:700; font-size:13px;">${user.name} <span style="font-size:10px; opacity:0.7;">(${badgeText})</span></div>
                            <div style="font-size:11px; color:var(--text-secondary);">@${user.handle}</div>
                        </div>
                    </div>
                    <button class="btn-secondary-sm" onclick="App.switchTab('messages'); Messaging.openConversation('${user.id}')">Chat</button>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    },

    openProfileCard() {
        document.getElementById('profile-dropdown').classList.add('hidden');
        document.getElementById('profile-card-avatar').src = State.currentUser.avatar;
        document.getElementById('profile-card-name').textContent = State.currentUser.displayName;
        document.getElementById('profile-card-handle').textContent = '@' + State.currentUser.handle;
        document.getElementById('profile-card-bio').textContent = State.currentUser.bio;

        document.getElementById('profile-modal').classList.remove('hidden');
    },

    closeProfileCard() {
        document.getElementById('profile-modal').classList.add('hidden');
    },

    openSettings() {
        document.getElementById('profile-dropdown').classList.add('hidden');
        document.getElementById('settings-input-name').value = State.currentUser.displayName;
        document.getElementById('settings-input-avatar').value = State.currentUser.avatar;
        document.getElementById('settings-input-bio').value = State.currentUser.bio;

        document.getElementById('settings-modal').classList.remove('hidden');
    },

    closeSettings() {
        document.getElementById('settings-modal').classList.add('hidden');
    },

    saveSettings() {
        State.currentUser.displayName = document.getElementById('settings-input-name').value || State.currentUser.displayName;
        State.currentUser.avatar = document.getElementById('settings-input-avatar').value || State.currentUser.avatar;
        State.currentUser.bio = document.getElementById('settings-input-bio').value || State.currentUser.bio;

        Auth.updateUserUI();
        this.closeSettings();
        Stories.renderTray();
        Stories.renderFeed();
    }
};