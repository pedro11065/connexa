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
        // Navigation elements
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
            if (window.opener) {
                window.close();
            } else {
                window.location.href = '/dashboard/user';
            }
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
                    name: group.materia || group.subject || 'Grupo',
                    icon: `https://i.pravatar.cc/50?img=${group.id_grupo || group.id}`
                }));

                this.renderGroups();

                // Select first group if available
                if (this.groups.length > 0) {
                    this.changeGroup(this.groups[0].id);
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
            <div style="
                display: flex;
                flex-direction: column;
                align-items: center;
                justify-content: center;
                height: 100%;
                padding: 2rem;
                text-align: center;
                color: var(--text-color);
            ">
                <div style="font-size: 4rem; margin-bottom: 1rem;">💬</div>
                <h3 style="margin: 0 0 1rem 0; color: var(--text-color);">Chat Avançado - Connexa</h3>
                <p style="margin: 0 0 2rem 0; opacity: 0.8;">Você ainda não faz parte de nenhum grupo de estudo.</p>
                <button onclick="
                    if (window.opener) {
                        window.close();
                    } else {
                        window.location.href='/dashboard/user';
                    }
                " style="
                    padding: 12px 24px;
                    background: var(--accent);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    cursor: pointer;
                    font-size: 1rem;
                ">Voltar ao Dashboard</button>
            </div>
        `;

        // Also update title
        if (this.chatTitle) {
            this.chatTitle.textContent = 'Connexa Chat';
        }
        if (this.chatSubtitle) {
            this.chatSubtitle.textContent = 'Sistema de mensagens avançado';
        }
    }

    renderGroups() {
        const groupsSidebar = document.getElementById('groupsSidebar');
        if (!groupsSidebar) return;

        groupsSidebar.innerHTML = '';

        if (this.groups.length === 0) {
            groupsSidebar.innerHTML = `
                <div style="padding: 20px; text-align: center; color: var(--muted); display: flex; flex-direction: column; align-items: center; gap: 10px;">
                    <div style="font-size: 2rem;">📭</div>
                    <p style="font-size: 12px; margin: 0;">Nenhum grupo</p>
                    <button onclick="window.location.href='/dashboard/user'" style="
                        padding: 6px 12px;
                        background: var(--accent);
                        color: white;
                        border: none;
                        border-radius: 6px;
                        cursor: pointer;
                        font-size: 10px;
                    ">Dashboard</button>
                </div>
            `;
            return;
        }

        this.groups.forEach(group => {
            const groupEl = document.createElement('div');
            groupEl.className = 'group-icon';
            groupEl.dataset.id = group.id;
            groupEl.title = group.name;

            const unreadCount = this.getUnreadCount(group.id);
            if (unreadCount > 0) {
                const badge = document.createElement('span');
                badge.className = 'unread-count';
                badge.textContent = unreadCount;
                groupEl.appendChild(badge);
            }

            const img = document.createElement('img');
            img.src = group.icon;
            groupEl.appendChild(img);

            const tooltip = document.createElement('span');
            tooltip.className = 'tooltip';
            tooltip.textContent = group.name;
            groupEl.appendChild(tooltip);

            groupEl.addEventListener('click', () => {
                this.changeGroup(group.id);
            });

            groupsSidebar.appendChild(groupEl);
        });
    }

    changeGroup(groupId) {
        this.currentGroupId = groupId;
        const group = this.groups.find(g => g.id === groupId);

        if (!group) return;

        // Update UI
        if (this.chatTitle) this.chatTitle.textContent = group.name;
        if (this.chatSubtitle) {
            this.chatSubtitle.textContent = `Sala: ${group.name}`;
        }
        if (this.topAvatar) this.topAvatar.src = group.icon;

        // Mark messages as read
        if (this.messages[groupId]) {
            this.messages[groupId].forEach(msg => msg.read = true);
        }

        // Update active group
        this.updateGroupIcons();

        // Load messages
        this.loadMessages(groupId);
        this.closeAllDrawers();
        this.renderGroups();
    }

    updateGroupIcons() {
        document.querySelectorAll('.group-icon').forEach(icon => {
            icon.classList.toggle('active', icon.dataset.id === this.currentGroupId);
        });
    }

    async loadMessages(groupId) {
        try {
            // changed: use group-specific endpoint
            const response = await fetch(`/chat/messages/read/${groupId}`);
            const data = await response.json();

            if (data.success) {
                const messages = (data.data && (data.data.message || data.data.messages)) || [];
                const users = (data.data && data.data.users) || [];

                const userLookup = {};
                users.forEach(u => { userLookup[u.id] = u; });

                const currentUserId = await this.getCurrentUserId();

                // normalize server payload to our internal shape
                this.messages[groupId] = messages.map(msg => this.normalizeIncomingMessage(msg, userLookup, currentUserId));

                this.renderMessages();
            } else {
                this.messages[groupId] = [];
                this.renderMessages();
            }
        } catch (error) {
            console.error('Error loading messages:', error);
            this.messages[groupId] = [];
            this.renderMessages();
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
                content = `<div class="text">${this.escapeHtml(msg.text || '')}</div>`;
            }

            // meta: safe display name + safe time (no "Invalid Date")
            const timeStr = this.formatTime(msg.timestamp);
            if (msg.type === 'received' && msg.user) {
                content += `<div class="meta">${this.escapeHtml(this.getDisplayName(msg.user))}${timeStr ? ` • ${timeStr}` : ''}</div>`;
            } else {
                content += `<div class="meta">${timeStr}</div>`;
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
            const response = await fetch('/chat/messages/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    group_id: this.currentGroupId
                })
            });

            const data = await response.json();
            if (data.success) {
                this.input.value = '';
                if (!this.messages[this.currentGroupId]) this.messages[this.currentGroupId] = [];
                // prefer server-provided id and created_at
                const createdAt =
                    data.created_at ??
                    data.data?.created_at ??
                    data.message?.created_at ??
                    data.createdAt ??
                    data.timestamp ??
                    Date.now();

                const newId =
                    data.id ??
                    data.data?.id ??
                    data.message?.id ??
                    Date.now();

                this.messages[this.currentGroupId].push({
                    id: newId,
                    text,
                    type: 'sent',
                    timestamp: this.parseTimestamp(createdAt)
                });
                this.renderMessages();
            } else {
                console.error('Erro ao enviar mensagem:', data.message);
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    }

    simulateResponse() {
        /* removed */
    }

    getExampleMessages() {
        /* removed */
        return [];
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

        const list = this.members || [];
        if (list.length === 0) {
            this.membersListModal.innerHTML = `
                <div style="padding:12px;color:var(--muted);font-size:13px">Nenhum membro encontrado.</div>
            `;
            return;
        }

        this.membersListModal.innerHTML = '';
        list.forEach(member => {
            const el = document.createElement('div');
            el.className = 'member';
            el.innerHTML = `
                <img src="${member.avatar || ''}" class="avatar">
                <div style="flex:1">
                    <div style="font-weight:600">${member.name || member.nome || 'Usuário'}</div>
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
        return 0;
    }

    async getCurrentUserId() {
        if (this.currentUser) return this.currentUser;

        try {
            const response = await fetch('/dashboard/user', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ type: 'user_info' })
            });

            const data = await response.json();
            if (data.success) {
                this.currentUser = data.user_id;
                return this.currentUser;
            }
        } catch (error) {
            console.error('Error getting user ID:', error);
        }

        return 'current-user-id'; // fallback
    }

    formatTime(timestamp) {
        // Robust formatter that never returns "Invalid Date"
        const d = this.parseTimestamp(timestamp);
        if (!d) return '';
        return d.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    // NEW: consistent message normalization
    normalizeIncomingMessage(msg, userLookup, currentUserId) {
        const text =
            msg?.content ??
            msg?.mensagem ??
            msg?.message ??
            msg?.text ??
            '';

        const rawUser = userLookup[msg?.user_id] || msg?.user || null;

        return {
            id: msg?.id ?? msg?._id ?? `${Date.now()}-${Math.random()}`,
            text,
            type: String(msg?.user_id) == String(currentUserId) ? 'sent' : 'received',
            user: rawUser,
            timestamp: this.parseTimestamp(
                msg?.created_at ??
                msg?.data_criacao ??
                msg?.createdAt ??
                msg?.timestamp ??
                msg?.data ??
                msg?.hora ??
                msg?.horario ??
                msg?.hora_envio ??
                msg?.horario_envio ??
                msg?.time ??
                null
            )
        };
    }

    // NEW: safe timestamp parser (supports ISO, millis, seconds, and common server formats)
    parseTimestamp(raw) {
        if (raw === null || raw === undefined) return null;
        if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

        // numbers can be seconds or millis
        if (typeof raw === 'number') {
            const ms = raw < 1e12 ? raw * 1000 : raw;
            const d = new Date(ms);
            return isNaN(d.getTime()) ? null : d;
        }

        if (typeof raw === 'string') {
            let s = raw.trim();

            // time-only "HH:mm" or "HH:mm:ss"
            const mTime = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
            if (mTime) {
                const now = new Date();
                const h = parseInt(mTime[1], 10);
                const mi = parseInt(mTime[2], 10);
                const se = mTime[3] ? parseInt(mTime[3], 10) : 0;
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mi, se);
                return isNaN(d.getTime()) ? null : d;
            }

            // Try ISO-like normalization (supports space/T, fractional secs, and timezone)
            if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s)) {
                let iso = s.replace(' ', 'T');

                // Normalize timezone like +0000 -> +00:00
                iso = iso.replace(/([+-]\d{2})(\d{2})$/, '$1:$2');

                // Normalize fractional seconds to milliseconds:
                // - If more than 3 digits, keep first 3
                iso = iso.replace(/(\.\d{3})\d+(?=(Z|[+-]\d{2}:?\d{2})?$)/, '$1');
                // - If 1-2 digits, pad to 3
                iso = iso.replace(/(\.\d{1,2})(?=(Z|[+-]\d{2}:?\d{2})?$)/, (_m, g1) => {
                    return '.' + g1.slice(1).padEnd(3, '0');
                });

                const dIso = new Date(iso);
                if (!isNaN(dIso.getTime())) return dIso;
            }

            // "YYYY-MM-DD HH:mm[:ss[.frac]]" (local time)
            const mYmd = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/.exec(s);
            if (mYmd) {
                const [_, Y, M, D, h, mi, se, frac] = mYmd;
                const ms = frac ? parseInt((frac + '000').slice(0, 3), 10) : 0;
                const d = new Date(
                    parseInt(Y, 10),
                    parseInt(M, 10) - 1,
                    parseInt(D, 10),
                    parseInt(h, 10),
                    parseInt(mi, 10),
                    se ? parseInt(se, 10) : 0,
                    ms
                );
                return isNaN(d.getTime()) ? null : d;
            }

            // "DD/MM/YYYY HH:mm[:ss[.frac]]" (local time)
            const mDmy = /^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/.exec(s);
            if (mDmy) {
                const [_, D, M, Y, h, mi, se, frac] = mDmy;
                const ms = frac ? parseInt((frac + '000').slice(0, 3), 10) : 0;
                const d = new Date(
                    parseInt(Y, 10),
                    parseInt(M, 10) - 1,
                    parseInt(D, 10),
                    parseInt(h, 10),
                    parseInt(mi, 10),
                    se ? parseInt(se, 10) : 0,
                    ms
                );
                return isNaN(d.getTime()) ? null : d;
            }

            // try native parser (ISO etc.)
            const d1 = new Date(s);
            if (!isNaN(d1.getTime())) return d1;

            // try integer string
            const n = Number(s);
            if (!Number.isNaN(n)) {
                const ms = n < 1e12 ? n * 1000 : n;
                const d2 = new Date(ms);
                return isNaN(d2.getTime()) ? null : d2;
            }
        }
        return null;
    }

    // NEW: user display name fallback
    getDisplayName(user) {
        return user?.nome || user?.name || user?.username || 'Usuário';
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

// Lightweight dashboard chat (no simulation)
(function () {
    const state = {
        currentGroupId: null,
        currentGroupName: '',
        messagesByGroup: {},
    };

    window.Chat = {
        openGroup
    };

    async function openGroup({ id, name }) {
        state.currentGroupId = id;
        state.currentGroupName = name || 'Grupo';

        const main = document.querySelector('#chat-dashboard .chat-main-area');
        if (!main) return;

        main.innerHTML = `
            <header class="chat-header" style="display:flex;align-items:center;justify-content:space-between;gap:1rem;">
                <span class="chat-group-header-title" style="flex:0 0 auto;">${escapeHtml(state.currentGroupName)}</span>
                <div style="flex:1"></div>
                <div class="chat-header-menu" style="position:relative; flex:0 0 auto;">
                    <button class="chat-menu-btn" id="chatMenuBtn" style="background:none;border:none;font-size:1.7rem;color:#fff;cursor:pointer;padding:0 0.5rem;">
                        <i class="fas fa-ellipsis-v"></i>
                    </button>
                    <div class="chat-menu-dropdown" id="chatMenuDropdown" style="display:none; position:absolute; right:0; top:2.5rem; background:#fff; box-shadow:0 4px 16px rgba(0,0,0,0.13); border-radius:0.7rem; min-width:180px; z-index:10;">
                        <button class="chat-menu-item" id="menuAdvancedChat" style="width:100%;padding:0.8rem 1.2rem; background:none; border:none; text-align:left; font-size:1rem; cursor:pointer;">Chat Avançado</button>
                    </div>
                </div>
            </header>
            <div class="chat-container" id="chatContainer" style="display:flex;flex-direction:column;flex:1;">
                <div class="chat-messages-container" id="chatMessages" style="flex:1;padding:1rem;overflow-y:auto;display:flex;flex-direction:column;gap:0.5rem;"></div>
                <div class="chat-input-container" style="padding:1rem;border-top:1px solid #eee;background:#fff;">
                    <div class="chat-input-wrapper" style="display:flex;gap:0.5rem;align-items:center;">
                        <input type="text" id="chatMessageInput" placeholder="Digite sua mensagem..." class="chat-input" style="flex:1;padding:0.75rem 1rem;border:1px solid #ddd;border-radius:2rem;font-size:1rem;">
                        <button id="chatSendBtn" class="chat-send-btn" style="background: linear-gradient(90deg, #8A2BE2 0%, #9370DB 100%); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem;">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Menu
        const menuBtn = main.querySelector('#chatMenuBtn');
        const menuDropdown = main.querySelector('#chatMenuDropdown');
        menuBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            if (menuDropdown) menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
        });
        document.addEventListener('click', function closeMenu(ev) {
            if (menuDropdown && !menuDropdown.contains(ev.target) && ev.target !== menuBtn) {
                menuDropdown.style.display = 'none';
                document.removeEventListener('click', closeMenu);
            }
        });
        main.querySelector('#menuAdvancedChat')?.addEventListener('click', () => {
            window.open('/dashboard/chat/advanced', '_blank');
        });

        // Send
        const input = main.querySelector('#chatMessageInput');
        const sendBtn = main.querySelector('#chatSendBtn');
        sendBtn?.addEventListener('click', () => sendMessage());
        input?.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendMessage();
            }
        });

        await loadMessages();
        renderMessages();
    }

    async function loadMessages() {
        const gid = state.currentGroupId;
        if (!gid) return;

        try {
            const resp = await fetch(`/chat/messages/read/${gid}`);
            const data = await resp.json();
            if (data.success) {
                const messages = (data.data && (data.data.message || data.data.messages)) || [];
                const users = (data.data && data.data.users) || [];
                const map = {};
                users.forEach(u => { map[u.id] = u; });

                const currentUserId = await getCurrentUserId();
                state.messagesByGroup[gid] = messages.map(m => ({
                    id: m.id,
                    text: (m.content ?? m.mensagem ?? m.message ?? m.text ?? ''),
                    type: String(m.user_id) == String(currentUserId) ? 'sent' : 'received',
                    user: map[m.user_id],
                    timestamp: parseTimestamp(
                        m.created_at ??
                        m.data_criacao ??
                        m.createdAt ??
                        m.timestamp ??
                        m.data ??
                        m.hora ??
                        m.horario ??
                        m.hora_envio ??
                        m.horario_envio ??
                        m.time ??
                        null
                    )
                }));
            } else {
                state.messagesByGroup[gid] = [];
            }
        } catch (e) {
            console.error('Erro ao carregar mensagens', e);
            state.messagesByGroup[gid] = [];
        }
    }

    async function sendMessage() {
        const input = document.getElementById('chatMessageInput');
        if (!input) return;

        const text = input.value.trim();
        if (!text || !state.currentGroupId) return;

        try {
            const resp = await fetch('/chat/messages/create', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: text,
                    group_id: state.currentGroupId
                })
            });
            const data = await resp.json();
            if (data.success) {
                input.value = '';
                const list = state.messagesByGroup[state.currentGroupId] || (state.messagesByGroup[state.currentGroupId] = []);
                const createdAt =
                    data.created_at ??
                    data.data?.created_at ??
                    data.message?.created_at ??
                    data.createdAt ??
                    data.timestamp ??
                    Date.now();

                const newId =
                    data.id ??
                    data.data?.id ??
                    data.message?.id ??
                    Date.now();

                list.push({
                    id: newId,
                    text,
                    type: 'sent',
                    timestamp: parseTimestamp(createdAt)
                });
                renderMessages();
            } else {
                console.error('Erro ao enviar mensagem:', data.message);
            }
        } catch (e) {
            console.error('Erro ao enviar mensagem', e);
        }
    }

    function renderMessages() {
        const container = document.getElementById('chatMessages');
        if (!container || !state.currentGroupId) return;

        const msgs = state.messagesByGroup[state.currentGroupId] || [];
        if (msgs.length === 0) {
            container.innerHTML = `
                <div class="chat-welcome" style="text-align:center;padding:2rem;color:#666;">
                    <div style="font-size:2rem;margin-bottom:1rem;">💬</div>
                    <h3 style="margin:0 0 0.5rem 0;color:#333;">Bem-vindo ao chat do grupo!</h3>
                    <p style="margin:0;font-size:0.95rem;">Comece uma conversa com ${escapeHtml(state.currentGroupName)}</p>
                </div>
            `;
            return;
        }

        container.innerHTML = msgs.map(msg => {
            const d = msg.timestamp instanceof Date ? msg.timestamp : parseTimestamp(msg.timestamp);
            const timeStr = d && !isNaN(d.getTime()) ? d.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }) : '';
            let styles = `
                max-width: 70%;
                padding: 0.75rem 1rem;
                margin: 0.25rem 0;
                border-radius: 1rem;
                background: #f8f9fa;
                color: #333;
                border: 1px solid #e9ecef;
            `;
            if (msg.type === 'sent') {
                styles = `
                    max-width: 70%;
                    padding: 0.75rem 1rem;
                    margin: 0.25rem 0;
                    border-radius: 1rem;
                    background: linear-gradient(90deg, #8A2BE2 0%, #9370DB 100%);
                    color: white;
                    margin-left: auto;
                    text-align: right;
                `;
            }
            return `
                <div class="chat-message" style="${styles}">
                    ${msg.type !== 'sent' && msg.user ? `<div style="font-weight:600;font-size:0.9rem;margin-bottom:0.25rem;color:#8A2BE2;">${escapeHtml(getDisplayName(msg.user))}</div>` : ''}
                    <div style="margin-bottom:0.25rem;">${escapeHtml(msg.text || '')}</div>
                    <div style="font-size:0.8rem;opacity:0.7;">${timeStr}</div>
                </div>
            `;
        }).join('');

        container.scrollTop = container.scrollHeight;
    }

    async function getCurrentUserId() {
        try {
            const response = await fetch('/dashboard/user', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ type: 'user_info' })
            });
            const data = await response.json();
            if (data.success) return data.user_id;
        } catch (_) { /* ignore */ }
        return 'current-user-id';
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text || '';
        return div.innerHTML;
    }

    // NEW: helpers shared in lightweight chat
    function parseTimestamp(raw) {
        if (raw === null || raw === undefined) return null;
        if (raw instanceof Date) return isNaN(raw.getTime()) ? null : raw;

        if (typeof raw === 'number') {
            const ms = raw < 1e12 ? raw * 1000 : raw;
            const d = new Date(ms);
            return isNaN(d.getTime()) ? null : d;
        }

        if (typeof raw === 'string') {
            let s = raw.trim();

            // time-only "HH:mm" or "HH:mm:ss"
            const mTime = /^(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(s);
            if (mTime) {
                const now = new Date();
                const h = parseInt(mTime[1], 10);
                const mi = parseInt(mTime[2], 10);
                const se = mTime[3] ? parseInt(mTime[3], 10) : 0;
                const d = new Date(now.getFullYear(), now.getMonth(), now.getDate(), h, mi, se);
                return isNaN(d.getTime()) ? null : d;
            }

            // ISO-like normalization
            if (/^\d{4}-\d{2}-\d{2}[ T]\d{2}:\d{2}/.test(s)) {
                let iso = s.replace(' ', 'T');
                iso = iso.replace(/([+-]\d{2})(\d{2})$/, '$1:$2'); // +0000 -> +00:00
                iso = iso.replace(/(\.\d{3})\d+(?=(Z|[+-]\d{2}:?\d{2})?$)/, '$1'); // trim >3
                iso = iso.replace(/(\.\d{1,2})(?=(Z|[+-]\d{2}:?\d{2})?$)/, (_m, g1) => '.' + g1.slice(1).padEnd(3, '0')); // pad <3

                const dIso = new Date(iso);
                if (!isNaN(dIso.getTime())) return dIso;
            }

            // Local YMD
            const mYmd = /^(\d{4})-(\d{2})-(\d{2})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/.exec(s);
            if (mYmd) {
                const [_, Y, M, D, h, mi, se, frac] = mYmd;
                const ms = frac ? parseInt((frac + '000').slice(0, 3), 10) : 0;
                const d = new Date(
                    parseInt(Y, 10),
                    parseInt(M, 10) - 1,
                    parseInt(D, 10),
                    parseInt(h, 10),
                    parseInt(mi, 10),
                    se ? parseInt(se, 10) : 0,
                    ms
                );
                return isNaN(d.getTime()) ? null : d;
            }

            // Local DMY
            const mDmy = /^(\d{2})\/(\d{2})\/(\d{4})[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,6}))?)?$/.exec(s);
            if (mDmy) {
                const [_, D, M, Y, h, mi, se, frac] = mDmy;
                const ms = frac ? parseInt((frac + '000').slice(0, 3), 10) : 0;
                const d = new Date(
                    parseInt(Y, 10),
                    parseInt(M, 10) - 1,
                    parseInt(D, 10),
                    parseInt(h, 10),
                    parseInt(mi, 10),
                    se ? parseInt(se, 10) : 0,
                    ms
                );
                return isNaN(d.getTime()) ? null : d;
            }

            const d1 = new Date(s);
            if (!isNaN(d1.getTime())) return d1;

            const n = Number(s);
            if (!Number.isNaN(n)) {
                const ms = n < 1e12 ? n * 1000 : n;
                const d2 = new Date(ms);
                return isNaN(d2.getTime()) ? null : d2;
            }
        }
        return null;
    }

    function getDisplayName(user) {
        return user?.nome || user?.name || user?.username || 'Usuário';
    }
})();
