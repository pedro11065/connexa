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

        // Updated header: removed "Chat Avançado" menu and dropdown
        main.innerHTML = `
            <header class="chat-header">
                <button class="chat-back-btn" aria-label="Voltar">
                    <i class="fa fa-arrow-left"></i>
                </button>
                <span class="chat-group-header-title">${escapeHtml(state.currentGroupName)}</span>
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

        // Ensure mobile switches to chat view
        if (typeof window.openGroupMobile === 'function') {
            window.openGroupMobile();
        } else if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
            document.querySelector('.chat-sidebar')?.classList.add('hide');
            document.querySelector('.chat-main-area')?.classList.add('active');
        }

        // Back button: go back to conversations list on mobile
        const backBtn = main.querySelector('.chat-back-btn');
        backBtn?.addEventListener('click', () => {
            if (typeof window.backToGroupsMobile === 'function') {
                window.backToGroupsMobile();
            } else if (typeof window.isMobileDevice === 'function' && window.isMobileDevice()) {
                document.querySelector('.chat-sidebar')?.classList.remove('hide');
                document.querySelector('.chat-main-area')?.classList.remove('active');
            }
        });

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

        if (window.__chatPollingInterval) clearInterval(window.__chatPollingInterval);
        window.__chatPollingInterval = setInterval(async () => {
            const prevMsgs = state.messagesByGroup[state.currentGroupId] || [];
            await loadMessages();
            const newMsgs = state.messagesByGroup[state.currentGroupId] || [];
            if (newMsgs.length !== prevMsgs.length) {
                renderMessages();
            }
        }, 2000);
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
