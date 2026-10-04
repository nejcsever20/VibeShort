window.Messaging = {
  activeTargetUser: null,

  async selectChat(targetUserId, type) {
    this.activeTargetUser = await State.get('users', targetUserId);
    this.renderChatWindow(type);
  },

  async renderChatWindow(type) {
    const container = document.getElementById('chat-window-container');
    if (!this.activeTargetUser) return;

    const messages = await State.getAll('messages');
    const conversation = messages.filter(m => 
      (m.fromId === State.currentUser.id && m.toId === this.activeTargetUser.id) ||
      (m.fromId === this.activeTargetUser.id && m.toId === State.currentUser.id)
    );

    const isFriend = type === 'FRIEND';

    container.innerHTML = `
      <div class="messaging-card">
        <div class="chat-header">
          <div class="avatar">${this.activeTargetUser.displayName.charAt(0)}</div>
          <div>
            <div><strong>${this.activeTargetUser.displayName}</strong></div>
            <span class="badge ${isFriend ? 'badge-friend' : 'badge-follower'}">
              ${isFriend ? 'Friend Chat' : 'Follower Direct Request'}
            </span>
          </div>
        </div>
        <div class="chat-messages" id="chat-messages-list">
          ${conversation.map(m => `
            <div class="message-bubble ${m.fromId === State.currentUser.id ? 'sent' : 'received'}">
              ${m.text}
            </div>
          `).join('')}
        </div>
        <div class="chat-input-area">
          <input type="text" id="chat-msg-input" placeholder="${isFriend ? 'Type a message...' : 'Send message request...'}">
          <button class="btn btn-primary" onclick="Messaging.sendMessage('${type}')">Send</button>
        </div>
      </div>
    `;
  },

  async sendMessage(type) {
    const input = document.getElementById('chat-msg-input');
    if (!input.value) return;

    const msg = {
      id: 'msg_' + Date.now(),
      fromId: State.currentUser.id,
      toId: this.activeTargetUser.id,
      text: input.value,
      timestamp: Date.now()
    };

    await State.put('messages', msg);
    input.value = '';
    this.renderChatWindow(type);
  }
};