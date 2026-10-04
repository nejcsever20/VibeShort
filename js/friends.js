window.Friends = {
  async renderDashboard() {
    const main = document.getElementById('app-content');
    main.style.gridTemplateColumns = '280px 1fr 320px';

    const users = await State.getAll('users');
    const otherUsers = users.filter(u => u.id !== State.currentUser.id);
    const stories = await State.getAll('stories');

    main.innerHTML = `
      <!-- Left Sidebar: Friends & Followers -->
      <aside>
        <h3>Connections</h3>
        <div class="text-muted text-sm mb-4">Click to open chat</div>
        <div id="connections-list">
          ${otherUsers.map(u => `
            <div class="header-profile mb-4" onclick="Messaging.selectChat('${u.id}', 'FRIEND')">
              <div class="avatar">${u.displayName.charAt(0)}</div>
              <div>
                <div><strong>${u.displayName}</strong></div>
                <span class="badge badge-friend">Friend</span>
              </div>
            </div>
          `).join('')}
        </div>
      </aside>

      <!-- Center Content: Stories -->
      <section>
        <div class="stories-bar">
          <div class="story-ring-item" onclick="Stories.openCreateModal()">
            <div class="story-create-btn"><i class="fa-solid fa-plus"></i></div>
            <span class="text-sm">Add Story</span>
          </div>
          ${stories.map(s => `
            <div class="story-ring-item" onclick="Stories.openViewer('${s.id}')">
              <div class="ring-wrapper ${s.audience === 'CLOSE_FRIENDS' ? 'close-friend' : ''}">
                <div class="avatar">${s.caption.charAt(0)}</div>
              </div>
              <span class="text-sm">Story</span>
            </div>
          `).join('')}
        </div>

        <div id="chat-window-container">
          <div class="messaging-card text-center" style="justify-content: center; color: var(--text-secondary);">
            Select a contact to start messaging
          </div>
        </div>
      </section>

      <!-- Right Sidebar: Close Friends & Suggestions -->
      <aside>
        <h3>Close Friends</h3>
        <p class="text-muted text-sm mb-4">Exclusive story circle</p>
        <div>
          ${otherUsers.slice(0, 2).map(u => `
            <div class="header-profile mb-4">
              <div class="avatar">${u.displayName.charAt(0)}</div>
              <div>
                <div><strong>${u.displayName}</strong></div>
                <span class="badge badge-close">Close Friend</span>
              </div>
            </div>
          `).join('')}
        </div>
      </aside>
    `;
  }
};