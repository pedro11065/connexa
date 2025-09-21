// Funções de renderização e lógica do chat

function renderChatDashboard(grupos) {
    let noGroupDiv = document.getElementById('no-group-page');
    if (noGroupDiv) noGroupDiv.style.display = 'none';
    let chatDiv = document.getElementById('chat-dashboard');
    if (!chatDiv) {
        chatDiv = document.createElement('div');
        chatDiv.id = 'chat-dashboard';
        chatDiv.innerHTML = `
        <div class="chat-layout">
            <aside class="chat-sidebar">
                <div class="chat-sidebar-header">Conversas</div>
                <ul class="group-list">
                    ${grupos.map(grupo => `
                        <li class="group-item" data-group="${grupo.id_grupo}">
                            <div class="group-title">${grupo.materia}</div>
                            <div class="group-desc">${grupo.objetivo}</div>
                        </li>
                    `).join('')}
                </ul>
            </aside>
            <main class="chat-main-area">
                <header class="chat-header">
                    <span class="chat-group-header-title">Selecione um grupo</span>
                </header>
                <div class="chat-placeholder">
                    <div class="chat-empty-icon"><i class="fas fa-comments"></i></div>
                    <div class="chat-empty-text">Selecione um grupo para visualizar o chat.</div>
                </div>
            </main>
        </div>
        `;
        document.body.appendChild(chatDiv);
        chatDiv.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', function() {
                chatDiv.querySelectorAll('.group-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const groupName = this.querySelector('.group-title').textContent;
                const groupId = this.getAttribute('data-group');
                renderGroupChatArea(groupName, groupId);
            });
        });
    } else {
        chatDiv.style.display = 'block';
    }
}

function renderGroupChatArea(groupName, groupId) {
    const chatDiv = document.getElementById('chat-dashboard');
    if (!chatDiv) return;
    const main = chatDiv.querySelector('.chat-main-area');
    if (!main) return;
    main.innerHTML = `
        <header class="chat-header">
            <span class="chat-group-header-title">${groupName}</span>
        </header>
        <div class="chat-messages-area">
            <div class="chat-messages-list"></div>
            <form class="chat-message-bar" onsubmit="return false;">
                <input type="text" class="chat-message-input" placeholder="Digite uma mensagem..." autocomplete="off" />
                <button type="submit" class="chat-send-btn"><i class="fas fa-paper-plane"></i></button>
            </form>
        </div>
    `;
    const messagesList = main.querySelector('.chat-messages-list');
    fetch(`/dashboard/messages/read?group_id=${groupId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.message) {
                renderMessagesList(messagesList, data.data.message, data.data.users);
            } else {
                messagesList.innerHTML = '<div style="color:#888;text-align:center;margin-top:2rem">Nenhuma mensagem encontrada.</div>';
            }
        })
        .catch(() => {
            messagesList.innerHTML = '<div style="color:#888;text-align:center;margin-top:2rem">Erro ao carregar mensagens.</div>';
        });
    // Foco no input ao abrir
    const input = main.querySelector('.chat-message-input');
    if (input) input.focus();
    // Envio de mensagem
    const form = main.querySelector('.chat-message-bar');
    form.onsubmit = function(e) {
        e.preventDefault();
        const message = input.value.trim();
        if (!message) return;
        fetch('/dashboard/messages/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ groupId: groupId, message: message })
        })
        .then(res => res.json())
        .then(data => {
            if (data.success) {
                input.value = '';
                // Recarrega as mensagens após enviar
                fetch(`/dashboard/messages/read?group_id=${groupId}`)
                    .then(res => res.json())
                    .then(data => {
                        if (data.success && data.data && data.data.message) {
                            renderMessagesList(messagesList, data.data.message, data.data.users);
                        }
                    });
            } else {
                alert('Erro ao enviar mensagem.');
            }
        })
        .catch(() => alert('Erro ao enviar mensagem.'));
    };
}

function loadAndRenderMessages(groupId, container) {
    fetch(`/dashboard/messages/read?group_id=${groupId}`)
        .then(res => res.json())
        .then(data => {
            if (data.success && data.data && data.data.message) {
                renderMessagesList(container, data.data.message, data.data.users);
            } else {
                container.innerHTML = '<div style="color:#888;text-align:center;margin-top:2rem">Nenhuma mensagem encontrada.</div>';
            }
        })
        .catch(() => {
            container.innerHTML = '<div style="color:#888;text-align:center;margin-top:2rem">Erro ao carregar mensagens.</div>';
        });
}

function renderMessagesList(container, messages, users) {
    const userMap = {};
    (users || []).forEach(u => { userMap[u.id] = u; });
    container.innerHTML = messages.map(msg => {
        const user = userMap[msg.user_id] || { nome: 'Usuário' };
        const date = new Date(msg.send_time);
        const time = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        return `<div class="chat-message-item">
            <div class="chat-message-user">${user.nome}</div>
            <div class="chat-message-content">${msg.message}</div>
            <div class="chat-message-time">${time}</div>
        </div>`;
    }).join('');
    container.scrollTop = container.scrollHeight;
}
