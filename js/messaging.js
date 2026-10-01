const Messaging = {
    init() {
        this.bindEvents();
        this.renderThreads();
    },

    bindEvents() {
        document.querySelectorAll('.filter-chip').forEach(btn => {
            btn.addEventListener('click', (e) => {
                document.querySelectorAll('.filter-chip').forEach(c => c.classList.remove('active'));
                e.target.classList.add('active');
                this.renderThreads(e.target.dataset.filter);
            });
        });
    },

    renderThreads(filter = 'all') {
        const container = document.getElementById('chat-threads-container');
        container.innerHTML = '';

        State.chats.forEach(chat => {
            const partner = State.networkUsers.find(u => u.id === chat.userId);
            if (!partner) return;

            if (filter === 'friends' && partner.relationship === 'follower') return;
            if (filter === 'requests' && !chat.isRequest) return;

            const lastMsg = chat.messages[chat.messages.length - 1];

            const threadHtml = `
                <div class="chat-thread-item" onclick="Messaging.openConversation('${partner.id}')">
                    <img src="${partner.avatar}" class="chat-thread-avatar">
                    <div class="chat-thread-meta">
                        <div class="thread-row">
                            <span class="thread-name">${partner.name}</span>
                            <span class="thread-time">${lastMsg ? lastMsg.time : ''}</span>
                        </div>
                        <div class="thread-preview">${lastMsg ? lastMsg.text : 'Start conversation...'}</div>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', threadHtml);
        });
    },

    openConversation(userId) {
        State.activeChatUserId = userId;
        const partner = State.networkUsers.find(u => u.id === userId);
        let chat = State.chats.find(c => c.userId === userId);

        if (!chat) {
            chat = { id: 'c_' + Date.now(), userId: userId, unread: false, isRequest: partner.relationship === 'follower', isAccepted: partner.relationship !== 'follower', messages: [] };
            State.chats.push(chat);
        }

        const header = document.getElementById('chat-header');
        header.innerHTML = `
            <img src="${partner.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
            <div>
                <div style="font-weight:700; font-size:13px;">${partner.name}</div>
                <div style="font-size:10px; color:var(--brand-primary);">Active now</div>
            </div>
        `;

        const banner = document.getElementById('chat-type-banner');
        const inputArea = document.getElementById('chat-input-area');

        if (partner.relationship === 'follower' && chat.isRequest && !chat.isAccepted) {
            banner.classList.remove('hidden');
            inputArea.innerHTML = `<button onclick="Messaging.acceptRequest('${userId}')" class="btn-primary-block" style="margin:0;">Accept Message Request</button>`;
        } else {
            banner.classList.add('hidden');
            inputArea.innerHTML = `
                <input type="text" id="chat-text-input" placeholder="Type a message..." class="chat-text-input">
                <button onclick="Messaging.sendMessage()" class="btn-primary-sm" style="padding: 8px 12px;"><i class="fa-solid fa-paper-plane"></i></button>
            `;
        }

        this.renderLog();
        document.getElementById('chat-conversation-pane').classList.remove('hidden');
    },

    acceptRequest(userId) {
        const chat = State.chats.find(c => c.userId === userId);
        if (chat) {
            chat.isAccepted = true;
            chat.isRequest = false;
            this.openConversation(userId);
        }
    },

    sendMessage() {
        const input = document.getElementById('chat-text-input');
        if (!input || !input.value.trim()) return;

        const chat = State.chats.find(c => c.userId === State.activeChatUserId);
        if (chat) {
            chat.messages.push({ sender: 'user_me', text: input.value.trim(), time: 'Just now' });
            input.value = '';
            this.renderLog();
            this.renderThreads();
        }
    },

    renderLog() {
        const container = document.getElementById('chat-messages-log');
        container.innerHTML = '';

        const chat = State.chats.find(c => c.userId === State.activeChatUserId);
        if (!chat) return;

        chat.messages.forEach(msg => {
            const isMe = msg.sender === 'user_me';
            const html = `
                <div class="message-bubble-wrapper ${isMe ? 'mine' : 'other'}">
                    <div class="message-bubble">${msg.text}</div>
                    <span class="message-time">${msg.time}</span>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });

        container.scrollTop = container.scrollHeight;
    }
};