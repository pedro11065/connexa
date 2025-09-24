// Chat Advanced JavaScript
class ChatAdvanced {
    constructor() {
        this.currentGroupId = null;
        this.currentUser = null;
        this.groups = [];
        this.members = [];
        this.messages = {};
        this.reactions = {};
        this.lastMsgId = 0;

        this.initializeElements();
        this.setupEventListeners();
        this.loadInitialData();
        this.renderWallpapers();
        this.renderEmojis();
    }

    initializeElements() {
        // Sidebar elements
        this.groupsList = document.getElementById('groupsList');
        this.backToDashboard = document.getElementById('backToDashboard');

        // Chat elements
        this.messagesEl = document.getElementById('messages');
        this.input = document.getElementById('input');
        this.sendBtn = document.getElementById('sendBtn');
        this.chatTitle = document.getElementById('chatTitle');
        this.chatSubtitle = document.getElementById('chatSubtitle');
        this.topAvatar = document.getElementById('topAvatar');
        this.typingIndicator = document.getElementById('typingIndicator');

        // Modal elements
        this.membersBtn = document.getElementById('membersBtn');
        this.membersModal = document.getElementById('membersModal');
        this.membersListModal = document.getElementById('membersListModal');
        this.memberSearchInput = document.getElementById('memberSearchInput');

        // Drawer elements
        this.wallBtn = document.getElementById('wallBtn');
        this.wallpaperDrawer = document.getElementById('wallpaperDrawer');
        this.wallList = document.getElementById('wallList');
        this.emojiBtn = document.getElementById('emojiBtn');
        this.emojiDrawer = document.getElementById('emojiDrawer');
        this.emojiGrid = document.getElementById('emojiGrid');

        // Other elements
        this.overlay = document.getElementById('overlay');
        this.centerPanel = document.getElementById('centerPanel');
        this.themeToggleBtn = document.getElementById('themeToggleBtn');
        this.photoBtn = document.getElementById('photoBtn');
        this.fileInput = document.getElementById('fileInput');
        this.reactionMenu = document.getElementById('reactionMenu');
    }

    setupEventListeners() {
        // Back to dashboard
        this.backToDashboard?.addEventListener('click', () => {
            window.location.href = '/dashboard/user';
        });

        // Send message
        this.sendBtn?.addEventListener('click', () => this.sendMessage());
        this.input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });

        // Modal and drawer controls
        this.membersBtn?.addEventListener('click', () => this.toggleMembersModal());
        this.wallBtn?.addEventListener('click', () => this.toggleWallpaperDrawer());
        this.emojiBtn?.addEventListener('click', () => this.toggleEmojiDrawer());
        this.overlay?.addEventListener('click', () => this.closeAllDrawers());

        // Theme toggle
        this.themeToggleBtn?.addEventListener('click', () => this.toggleTheme());

        // File upload
        this.photoBtn?.addEventListener('click', () => this.fileInput?.click());
        this.fileInput?.addEventListener('change', (e) => this.handleFileUpload(e));

        // Member search
        this.memberSearchInput?.addEventListener('input', (e) => this.filterMembers(e.target.value));

        // Typing indicator
        let typingTimeout;
        this.input?.addEventListener('input', () => {
            this.showTypingIndicator();
            clearTimeout(typingTimeout);
            typingTimeout = setTimeout(() => this.hideTypingIndicator(), 1000);
        });

        // Close reaction menu on click outside
        document.addEventListener('click', (event) => {
            if (!this.reactionMenu?.contains(event.target)) {
                this.hideReactionMenu();
            }
        });
    }

    async loadInitialData() {
        try {
            // Load user's groups
            const response = await fetch('/dashboard/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'groups' })
            });

            const data = await response.json();
            if (data.success && data.data) {
                this.groups = data.data.map(group => ({
                    id: group.id_grupo || group.id,
                    subject: group.materia || group.subject || 'Grupo',
                    objetivo: group.objetivo || 'Sem descrição',
                    lugar: group.lugar || 'Online'
                }));

                this.renderGroups();

                // Select first group if available
                if (this.groups.length > 0) {
                    this.selectGroup(this.groups[0].id);
                }
            } else {
                console.warn('No groups found:', data.message);
                this.renderEmptyState();
            }
        } catch (error) {
            console.error('Error loading groups:', error);
            this.renderEmptyState();
        }
    }

    renderEmptyState() {
        if (!this.messagesEl) return;

        this.messagesEl.innerHTML = `
            <div class="welcome-message">
                <h3>Você ainda não faz parte de nenhum grupo</h3>
                <p>Volte ao dashboard para criar ou entrar em um grupo.</p>
                <button onclick="window.location.href='/dashboard/user'" class="btn" style="
                    padding: 12px 24px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    margin-top: 16px;
                ">Ir para Dashboard</button>
            </div>
        `;
    }

    renderGroups() {
        if (!this.groupsList) return;

        this.groupsList.innerHTML = '';

        if (this.groups.length === 0) {
            this.groupsList.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--muted);">
                    <p>Nenhum grupo encontrado</p>
                    <button onclick="window.location.href='/dashboard/user'" style="
                        padding: 8px 16px;
                        background: var(--accent);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        margin-top: 8px;
                    ">Ir para Dashboard</button>
                </div>
            `;
            return;
        }

        this.groups.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'group-item';
            groupEl.dataset.groupId = group.id;

            const unreadCount = this.getUnreadCount(group.id);

            groupEl.innerHTML = `
                <div class="group-avatar">
                    <img src="https://i.pravatar.cc/50?img=${group.id}" alt="${group.subject}">
                    ${unreadCount > 0 ? `<span class="unread-count">${unreadCount}</span>` : ''}
                </div>
                <div class="group-info">
                    <div class="group-name">${this.escapeHtml(group.subject)}</div>
                    <div class="group-last-message">${this.escapeHtml(group.objetivo)}</div>
                </div>
            `;

            groupEl.addEventListener('click', () => this.selectGroup(group.id));
            this.groupsList.appendChild(groupEl);
        });
    }

    selectGroup(groupId) {
        this.currentGroupId = groupId;
        const group = this.groups.find(g => g.id === groupId);

        if (!group) return;

        // Update UI
        this.chatTitle.textContent = group.subject;
        this.chatSubtitle.textContent = `${group.objetivo} • ${group.lugar}`;
        this.topAvatar.src = `https://i.pravatar.cc/46?img=${group.id}`;

        // Update active group
        document.querySelectorAll('.group-item').forEach(item => {
            item.classList.toggle('active', item.dataset.groupId === groupId);
        });

        // Load messages
        this.loadMessages(groupId);
        this.closeAllDrawers();
    }

    async loadMessages(groupId) {
        try {
            const response = await fetch('/dashboard/messages/read');
            const data = await response.json();

            if (data.success) {
                const messages = data.data.message || [];
                const users = data.data.users || [];

                // Filter messages for current group
                const groupMessages = messages.filter(msg => msg.group_id === groupId);

                // Create user lookup
                const userLookup = {};
                users.forEach(user => {
                    userLookup[user.id] = user;
                });

                // Process messages
                this.messages[groupId] = groupMessages.map(msg => ({
                    id: msg.id,
                    text: msg.content,
                    type: msg.user_id === this.getCurrentUserId() ? 'sent' : 'received',
                    user: userLookup[msg.user_id],
                    timestamp: new Date(msg.created_at)
                }));

                this.renderMessages();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
        }
    }

    renderMessages() {
        if (!this.messagesEl) return;

        this.messagesEl.innerHTML = '';

        if (!this.currentGroupId) {
            this.messagesEl.innerHTML = `
                <div class="welcome-message">
                    <h3>Bem-vindo ao Chat Avançado!</h3>
                    <p>Selecione um grupo na barra lateral para começar a conversar.</p>
                </div>
            `;
            return;
        }

        const currentMessages = this.messages[this.currentGroupId] || [];

        if (currentMessages.length === 0) {
            this.messagesEl.innerHTML = `
                <div class="welcome-message">
                    <h3>Nenhuma mensagem ainda</h3>
                    <p>Seja o primeiro a enviar uma mensagem neste grupo!</p>
                </div>
            `;
            return;
        }

        currentMessages.forEach(msg => {
            const msgEl = document.createElement('div');
            msgEl.className = `msg ${msg.type}`;
            msgEl.dataset.msgId = msg.id;

            let content = '';
            if (msg.type === 'img') {
                content = `<img src="${msg.src}" alt="Imagem enviada">`;
            } else if (msg.type === 'audio') {
                content = `<audio controls src="${msg.src}"></audio>`;
            } else {
                content = `<div class="text">${this.escapeHtml(msg.text)}</div>`;
            }

            if (msg.type === 'received' && msg.user) {
                content += `<div class="meta">${msg.user.nome} • ${this.formatTime(msg.timestamp)}</div>`;
            } else {
                content += `<div class="meta">${this.formatTime(msg.timestamp)}</div>`;
            }

            msgEl.innerHTML = content;

            // Add double-click for reactions
            msgEl.addEventListener('dblclick', (e) => this.showReactionMenu(e, msg.id));

            // Render reactions if any
            const reactions = this.reactions[msg.id];
            if (reactions && Object.keys(reactions).length > 0) {
                const reactionEl = document.createElement('div');
                reactionEl.className = 'reactions';
                reactionEl.textContent = Object.values(reactions).join(' ');
                msgEl.appendChild(reactionEl);
            }

            this.messagesEl.appendChild(msgEl);
        });

        this.messagesEl.scrollTop = this.messagesEl.scrollHeight;
    }

    async sendMessage() {
        const text = this.input?.value.trim();
        if (!text || !this.currentGroupId) return;

        try {
            const response = await fetch('/dashboard/messages/send', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    message: text,
                    groupId: this.currentGroupId
                })
            });

            const data = await response.json();
            if (data.success) {
                // Clear input
                this.input.value = '';

                // Add message to local state
                if (!this.messages[this.currentGroupId]) {
                    this.messages[this.currentGroupId] = [];
                }

                this.messages[this.currentGroupId].push({
                    id: data.id || Date.now(),
                    text: text,
                    type: 'sent',
                    timestamp: new Date()
                });

                this.renderMessages();
            } else {
                alert('Erro ao enviar mensagem: ' + data.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
            alert('Erro ao enviar mensagem');
        }
    }

    toggleMembersModal() {
        this.closeAllDrawers();
        this.membersModal?.classList.add('open');
        this.overlay?.classList.add('active');
        this.renderMembers();
    }

    toggleWallpaperDrawer() {
        this.closeAllDrawers();
        this.wallpaperDrawer?.classList.add('open');
        this.overlay?.classList.add('active');
        this.centerPanel?.classList.add('blur');
    }

    toggleEmojiDrawer() {
        this.closeAllDrawers();
        this.emojiDrawer?.classList.add('open');
        this.overlay?.classList.add('active');
        this.centerPanel?.classList.add('blur');
    }

    closeAllDrawers() {
        this.wallpaperDrawer?.classList.remove('open');
        this.emojiDrawer?.classList.remove('open');
        this.membersModal?.classList.remove('open');
        this.overlay?.classList.remove('active');
        this.centerPanel?.classList.remove('blur');
    }

    toggleTheme() {
        document.body.classList.toggle('light-theme');
        const isLight = document.body.classList.contains('light-theme');
        if (this.themeToggleBtn) {
            this.themeToggleBtn.textContent = isLight ? '🌙' : '☀️';
        }

        // Save theme preference
        localStorage.setItem('chat-theme', isLight ? 'light' : 'dark');
    }

    renderWallpapers() {
        if (!this.wallList) return;

        const wallpapers = [
            { name: 'Roxo Gradiente', css: 'linear-gradient(160deg,#0f0424 0%, #2b0e4a 60%)' },
            { name: 'Lilac Glow', css: 'radial-gradient(circle at 20% 30%, rgba(191,166,255,0.28), rgba(43,14,74,0.12))' },
            { name: 'Vortex', css: 'linear-gradient(135deg,#1a0328 0%, #3b0b5c 50%, #6d1fb3 100%)' },
        ];

        this.wallList.innerHTML = '';
        wallpapers.forEach(w => {
            const sw = document.createElement('div');
            sw.className = 'wall-swatch';
            sw.style.background = w.css;
            sw.title = w.name;
            sw.addEventListener('click', () => this.applyWallpaper(w.css));
            this.wallList.appendChild(sw);
        });
    }

    applyWallpaper(css) {
        if (this.messagesEl) {
            this.messagesEl.style.background = css.includes('url(') ?
                css + ' center/cover no-repeat' : css;
            this.messagesEl.style.backgroundBlendMode = css.includes('url(') ? 'overlay' : 'normal';
        }
    }

    renderEmojis() {
        if (!this.emojiGrid) return;

        const emojiSet = [
            '😀', '😂', '😍', '😅', '👍', '🎉', '🔥', '🤝', '🤖', '📚',
            '🎧', '📸', '💬', '✨', '😎', '🙌', '🧠', '🚀', '📝', '🔔',
            '🌌', '💜', '🎯', '📍', '⚡', '🕹️', '🔗', '📖', '🧩', '🛠️', '🌟'
        ];

        this.emojiGrid.innerHTML = '';
        emojiSet.forEach(emoji => {
            const btn = document.createElement('button');
            btn.className = 'emoji-btn';
            btn.textContent = emoji;
            btn.addEventListener('click', (event) => {
                event.stopPropagation();
                this.insertEmoji(emoji);
            });
            this.emojiGrid.appendChild(btn);
        });
    }

    insertEmoji(emoji) {
        if (!this.input) return;

        const start = this.input.selectionStart || 0;
        const end = this.input.selectionEnd || 0;
        const val = this.input.value;
        this.input.value = val.slice(0, start) + emoji + val.slice(end);
        this.input.focus();
        this.input.selectionStart = this.input.selectionEnd = start + emoji.length;
    }

    renderMembers() {
        if (!this.membersListModal) return;

        // Mock members data - in real implementation, fetch from API
        const mockMembers = [
            { id: 1, name: 'Ana Clara', avatar: 'https://i.pravatar.cc/44?img=5', online: true },
            { id: 2, name: 'Carlos Eduardo', avatar: 'https://i.pravatar.cc/44?img=3', online: false },
            { id: 3, name: 'Juliana', avatar: 'https://i.pravatar.cc/44?img=8', online: true },
            { id: 4, name: 'Mateus', avatar: 'https://i.pravatar.cc/44?img=12', online: true },
            { id: 5, name: 'Mariana', avatar: 'https://i.pravatar.cc/44?img=10', online: false }
        ];

        this.membersListModal.innerHTML = '';
        mockMembers.forEach(member => {
            const el = document.createElement('div');
            el.className = 'member';
            el.innerHTML = `
                <img src="${member.avatar}" class="avatar">
                <div style="flex:1">
                    <div style="font-weight:600">${member.name}</div>
                    <div style="font-size:13px;color:var(--muted)">${member.online ? 'Online' : 'Offline'}</div>
                </div>
                <div class="status" style="background:${member.online ? 'limegreen' : 'gray'}"></div>
            `;
            this.membersListModal.appendChild(el);
        });
    }

    filterMembers(query) {
        const members = this.membersListModal?.querySelectorAll('.member');
        members?.forEach(member => {
            const name = member.querySelector('div div').textContent.toLowerCase();
            member.style.display = name.includes(query.toLowerCase()) ? 'flex' : 'none';
        });
    }

    showReactionMenu(event, msgId) {
        if (!this.reactionMenu) return;

        const reactions = ['👍', '❤️', '😂', '😮', '😢', '🔥'];

        this.reactionMenu.innerHTML = '';
        reactions.forEach(emoji => {
            const btn = document.createElement('button');
            btn.textContent = emoji;
            btn.style.cssText = `
                background: none;
                border: none;
                cursor: pointer;
                font-size: 20px;
                padding: 4px;
            `;
            btn.onclick = (e) => {
                e.stopPropagation();
                this.addReaction(msgId, emoji);
                this.hideReactionMenu();
            };
            this.reactionMenu.appendChild(btn);
        });

        this.reactionMenu.style.cssText = `
            display: flex;
            gap: 4px;
            background: var(--bg-app);
            border: 1px solid var(--border-color);
            border-radius: 12px;
            box-shadow: var(--shadow);
            top: ${event.clientY - 40}px;
            left: ${event.clientX}px;
        `;
    }

    hideReactionMenu() {
        if (this.reactionMenu) {
            this.reactionMenu.style.display = 'none';
        }
    }

    addReaction(msgId, emoji) {
        const userId = this.getCurrentUserId();
        if (!this.reactions[msgId]) {
            this.reactions[msgId] = {};
        }
        this.reactions[msgId][userId] = emoji;
        this.renderMessages();
    }

    handleFileUpload(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            if (!this.messages[this.currentGroupId]) {
                this.messages[this.currentGroupId] = [];
            }

            this.messages[this.currentGroupId].push({
                id: Date.now(),
                type: 'img',
                src: e.target.result,
                timestamp: new Date()
            });

            this.renderMessages();
        };
        reader.readAsDataURL(file);
    }

    showTypingIndicator() {
        this.typingIndicator?.classList.add('visible');
    }

    hideTypingIndicator() {
        this.typingIndicator?.classList.remove('visible');
    }

    getUnreadCount(groupId) {
        // Mock implementation - in real app, track unread messages
        return Math.floor(Math.random() * 5);
    }

    getCurrentUserId() {
        // In real implementation, get from session or API
        return 'current-user-id';
    }

    formatTime(timestamp) {
        return timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Global close modal function
window.closeModal = function () {
    const modal = document.getElementById('membersModal');
    const overlay = document.getElementById('overlay');
    modal?.classList.remove('open');
    overlay?.classList.remove('active');
};

// Initialize chat when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    // Load saved theme
    const savedTheme = localStorage.getItem('chat-theme');
    if (savedTheme === 'light') {
        document.body.classList.add('light-theme');
        const themeBtn = document.getElementById('themeToggleBtn');
        if (themeBtn) themeBtn.textContent = '🌙';
    }

    // Initialize chat
    new ChatAdvanced();
});
