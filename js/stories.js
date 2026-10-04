window.Stories = {
  currentStoryIndex: 0,
  activeStories: [],

  openCreateModal() {
    document.getElementById('create-story-modal').classList.add('active');
  },

  closeCreateModal() {
    document.getElementById('create-story-modal').classList.remove('active');
  },

  async publishStory(e) {
    e.preventDefault();
    const caption = document.getElementById('story-caption').value;
    const bg = document.getElementById('story-bg').value;
    const audience = document.getElementById('story-audience').value;

    const newStory = {
      id: 'story_' + Date.now(),
      authorId: State.currentUser.id,
      caption,
      bg,
      audience,
      createdAt: Date.now(),
      likes: [],
      comments: []
    };

    await State.put('stories', newStory);
    this.closeCreateModal();
    Friends.renderDashboard();
  },

  async openViewer(storyId) {
    const stories = await State.getAll('stories');
    this.activeStories = stories.filter(s => s.id === storyId);
    if (this.activeStories.length === 0) return;

    this.currentStoryIndex = 0;
    document.getElementById('story-viewer-modal').classList.add('active');
    this.renderActiveStory();
  },

  async renderActiveStory() {
    const story = this.activeStories[this.currentStoryIndex];
    const author = await State.get('users', story.authorId);
    const container = document.getElementById('story-viewer-content');

    container.innerHTML = `
      <div class="story-progress-bar"><div class="story-progress-fill" id="pfill"></div></div>
      <div style="padding: 1rem; display: flex; justify-content: space-between; align-items: center;">
        <div style="display: flex; align-items: center; gap: 0.5rem;">
          <div class="avatar">${author.displayName.charAt(0)}</div>
          <strong>${author.displayName}</strong>
        </div>
        <span onclick="Stories.closeViewer()" style="cursor:pointer; font-size:1.5rem">&times;</span>
      </div>
      <div class="story-card-body" style="background: ${story.bg}">
        <p>${story.caption}</p>
      </div>
      <div class="story-footer">
        <button class="btn btn-outline" onclick="Stories.likeStory('${story.id}')">
          <i class="fa-solid fa-heart"></i> ${story.likes.length}
        </button>
        <input type="text" id="story-comment-input" placeholder="Reply to story...">
        <button class="btn btn-primary" onclick="Stories.commentStory('${story.id}')">Send</button>
      </div>
    `;

    setTimeout(() => {
      const fill = document.getElementById('pfill');
      if (fill) fill.style.width = '100%';
    }, 50);
  },

  async likeStory(storyId) {
    const story = await State.get('stories', storyId);
    if (!story.likes.includes(State.currentUser.id)) {
      story.likes.push(State.currentUser.id);
      await State.put('stories', story);
      this.renderActiveStory();
    }
  },

  async commentStory(storyId) {
    const input = document.getElementById('story-comment-input');
    if (!input.value) return;

    const story = await State.get('stories', storyId);
    story.comments.push({
      authorId: State.currentUser.id,
      text: input.value
    });

    await State.put('stories', story);
    input.value = '';
    alert('Comment sent!');
  },

  closeViewer() {
    document.getElementById('story-viewer-modal').classList.remove('active');
  }
};