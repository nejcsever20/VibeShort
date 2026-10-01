const Stories = {
    activeStoryIndex: 0,
    currentStorySet: [],
    timer: null,

    init() {
        this.bindEvents();
        this.renderTray();
        this.renderFeed();
    },

    bindEvents() {
        document.getElementById('action-create-story').addEventListener('click', () => this.openCreator());
        document.getElementById('btn-header-new-story').addEventListener('click', () => this.openCreator());
        document.getElementById('btn-hero-story').addEventListener('click', () => this.openCreator());
        document.getElementById('btn-close-story-creator').addEventListener('click', () => this.closeCreator());
        document.getElementById('btn-publish-story').addEventListener('click', () => this.publishStory());
        
        document.getElementById('btn-close-story-viewer').addEventListener('click', () => this.closeViewer());
        document.getElementById('story-touch-left').addEventListener('click', () => this.navigate(-1));
        document.getElementById('story-touch-right').addEventListener('click', () => this.navigate(1));
        document.getElementById('btn-like-story').addEventListener('click', () => this.toggleLike());
        document.getElementById('btn-send-story-comment').addEventListener('click', () => this.sendComment());

        document.getElementById('btn-story-analytics').addEventListener('click', () => this.openAnalytics());
        document.getElementById('btn-close-analytics').addEventListener('click', () => this.closeAnalytics());
    },

    renderTray() {
        const tray = document.getElementById('stories-tray');
        tray.innerHTML = '';

        // Add user story bubble
        const myStory = State.stories.find(s => s.userId === State.currentUser.id);
        const myRingClass = myStory ? 'ring-normal' : 'ring-none';

        const myBubbleHtml = `
            <div class="story-item" onclick="${myStory ? `Stories.viewUserStories('${State.currentUser.id}')` : 'Stories.openCreator()'}">
                <div class="story-avatar-wrapper ${myRingClass}">
                    <img src="${State.currentUser.avatar}" class="story-avatar">
                    <div class="story-plus-badge">+</div>
                </div>
                <span class="story-username">Your Story</span>
            </div>
        `;
        tray.insertAdjacentHTML('beforeend', myBubbleHtml);

        // Network user stories
        State.networkUsers.forEach(user => {
            const userStories = State.stories.filter(s => s.userId === user.id);
            if (userStories.length === 0) return;

            const topStory = userStories[0];
            let ringClass = 'ring-normal';
            if (topStory.privacy === 'close') ringClass = 'ring-close';

            const itemHtml = `
                <div class="story-item" onclick="Stories.viewUserStories('${user.id}')">
                    <div class="story-avatar-wrapper ${ringClass}">
                        <img src="${user.avatar}" class="story-avatar">
                    </div>
                    <span class="story-username">${user.name.split(' ')[0]}</span>
                </div>
            `;
            tray.insertAdjacentHTML('beforeend', itemHtml);
        });
    },

    viewUserStories(userId) {
        const allowed = State.stories.filter(s => {
            if (s.userId !== userId) return false;
            if (userId === State.currentUser.id) return true;
            const u = State.networkUsers.find(net => net.id === userId);
            if (s.privacy === 'close' && u.relationship !== 'close_friend') return false;
            if (s.privacy === 'friends' && u.relationship !== 'friend' && u.relationship !== 'close_friend') return false;
            return true;
        });

        if (allowed.length === 0) return;

        this.currentStorySet = allowed;
        this.activeStoryIndex = 0;
        document.getElementById('story-viewer-modal').classList.remove('hidden');
        this.loadCurrentStory();
    },

    loadCurrentStory() {
        if (this.timer) clearInterval(this.timer);

        const story = this.currentStorySet[this.activeStoryIndex];
        const author = story.userId === State.currentUser.id ? State.currentUser : State.networkUsers.find(u => u.id === story.userId);

        document.getElementById('story-viewer-avatar').src = author.avatar;
        document.getElementById('story-viewer-username').textContent = author.name || author.displayName;
        document.getElementById('story-viewer-timestamp').textContent = story.timestamp;
        document.getElementById('story-viewer-media').src = story.image;

        const textOverlay = document.getElementById('story-text-overlay');
        if (story.caption) {
            textOverlay.textContent = story.caption;
            textOverlay.classList.remove('hidden');
        } else {
            textOverlay.classList.add('hidden');
        }

        const analyticsBtn = document.getElementById('btn-story-analytics');
        if (story.userId === State.currentUser.id) analyticsBtn.classList.remove('hidden');
        else analyticsBtn.classList.add('hidden');

        // Build Progress Bars
        const progressContainer = document.getElementById('story-viewer-progress-bars');
        progressContainer.innerHTML = '';
        this.currentStorySet.forEach((_, idx) => {
            progressContainer.insertAdjacentHTML('beforeend', `<div class="progress-track"><div id="p-bar-${idx}" class="progress-fill"></div></div>`);
        });

        for (let i = 0; i < this.activeStoryIndex; i++) {
            document.getElementById(`p-bar-${i}`).style.width = '100%';
        }

        let width = 0;
        const currentBar = document.getElementById(`p-bar-${this.activeStoryIndex}`);
        this.timer = setInterval(() => {
            width += 2;
            if (currentBar) currentBar.style.width = width + '%';
            if (width >= 100) {
                clearInterval(this.timer);
                this.navigate(1);
            }
        }, 100);
    },

    navigate(dir) {
        this.activeStoryIndex += dir;
        if (this.activeStoryIndex < 0) {
            this.activeStoryIndex = 0;
        } else if (this.activeStoryIndex >= this.currentStorySet.length) {
            this.closeViewer();
            return;
        }
        this.loadCurrentStory();
    },

    closeViewer() {
        if (this.timer) clearInterval(this.timer);
        document.getElementById('story-viewer-modal').classList.add('hidden');
    },

    toggleLike() {
        const story = this.currentStorySet[this.activeStoryIndex];
        story.isLiked = !story.isLiked;
        story.likes += story.isLiked ? 1 : -1;
        this.renderFeed();
    },

    sendComment() {
        const input = document.getElementById('story-comment-input');
        if (!input.value.trim()) return;
        input.value = '';
        this.navigate(1);
    },

    openAnalytics() {
        const story = this.currentStorySet[this.activeStoryIndex];
        document.getElementById('analytics-view-count').textContent = story.viewers ? story.viewers.length : 0;
        document.getElementById('analytics-like-count').textContent = story.likes;

        const list = document.getElementById('analytics-viewers-list');
        list.innerHTML = '';
        (story.viewers || []).forEach(v => {
            list.insertAdjacentHTML('beforeend', `<div style="padding: 8px; border-bottom: 1px solid var(--border-color); font-size: 12px;">${v}</div>`);
        });

        document.getElementById('story-analytics-modal').classList.remove('hidden');
    },

    closeAnalytics() {
        document.getElementById('story-analytics-modal').classList.add('hidden');
    },

    openCreator() {
        document.getElementById('story-creator-modal').classList.remove('hidden');
    },

    closeCreator() {
        document.getElementById('story-creator-modal').classList.add('hidden');
    },

    publishStory() {
        const url = document.getElementById('story-input-url').value || 'https://images.unsplash.com/photo-1518791841217-8f162f1e1131?w=600';
        const caption = document.getElementById('story-input-caption').value;
        const privacy = document.querySelector('input[name="story-privacy"]:checked').value;

        State.stories.unshift({
            id: 's_' + Date.now(),
            userId: State.currentUser.id,
            image: url,
            caption: caption,
            privacy: privacy,
            timestamp: 'Just now',
            likes: 0,
            isLiked: false,
            viewers: []
        });

        this.closeCreator();
        this.renderTray();
        this.renderFeed();
    },

    renderFeed() {
        const container = document.getElementById('feed-posts-container');
        container.innerHTML = '';

        State.stories.forEach(story => {
            const author = story.userId === State.currentUser.id ? State.currentUser : State.networkUsers.find(u => u.id === story.userId);
            
            const html = `
                <div style="background: var(--bg-card); border: 1px solid var(--border-color); border-radius: var(--radius-md); padding: 16px; margin-bottom: 16px;">
                    <div style="display:flex; align-items:center; gap: 10px; margin-bottom: 10px;">
                        <img src="${author.avatar}" style="width:36px; height:36px; border-radius:50%; object-fit:cover;">
                        <div>
                            <div style="font-weight:700; font-size:12px;">${author.name || author.displayName}</div>
                            <div style="font-size:10px; color:var(--text-secondary);">${story.timestamp}</div>
                        </div>
                    </div>
                    <div style="border-radius: var(--radius-md); overflow:hidden; max-height:300px; margin-bottom:10px; cursor:pointer;" onclick="Stories.viewUserStories('${author.id}')">
                        <img src="${story.image}" style="width:100%; height:100%; object-fit:cover;">
                    </div>
                    ${story.caption ? `<p style="font-size:12px; margin-bottom:10px;">${story.caption}</p>` : ''}
                    <div style="display:flex; justify-content:space-between; font-size:12px; color:var(--text-secondary);">
                        <span><i class="fa-regular fa-heart"></i> ${story.likes} Likes</span>
                        <span onclick="Stories.viewUserStories('${author.id}')" style="cursor:pointer;"><i class="fa-regular fa-comment"></i> Reply to Story</span>
                    </div>
                </div>
            `;
            container.insertAdjacentHTML('beforeend', html);
        });
    }
};