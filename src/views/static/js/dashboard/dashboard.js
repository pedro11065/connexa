window.addEventListener('DOMContentLoaded', function () {
    // POST request para buscar status do usuário e grupos
    fetch('/dashboard/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 'type': 'user' })
    })
        .then(response => response.json())
        .then(data => {
            if (data.success && Array.isArray(data.data) && data.data.length > 0) {
                renderChatDashboard(data.data);
            } else {
                renderNoGroupPage();
            }
        })
        .catch(error => {
            // alert(error.message);
        });
});


function renderNoGroupPage() {
    let chatDiv = document.getElementById('chat-dashboard');
    if (chatDiv) chatDiv.style.display = 'none';
    let noGroupDiv = document.getElementById('no-group-page');
    if (!noGroupDiv) {
        noGroupDiv = document.createElement('section');
        noGroupDiv.className = 'dashboard-container';
        noGroupDiv.id = 'no-group-page';
        noGroupDiv.innerHTML = `
            <div class="empty-group">
                <img src="/static/images/index/hero.png" alt="Sem grupos" class="empty-group-img">
                <h2>Você ainda não faz parte de nenhum grupo</h2>
                <p>Crie um grupo para começar a colaborar com outros estudantes!</p>
                <button class="btn btn-primary" id="openCreateGroupModal">
                    <i class="fas fa-users"></i> Criar Grupo
                </button>
            </div>
        `;
        document.body.appendChild(noGroupDiv);
        document.getElementById('openCreateGroupModal').onclick = function () {
            document.getElementById('modalBackdrop').style.display = 'flex';
        };
    } else {
        noGroupDiv.style.display = 'flex';
    }
}



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
                <button class="btn btn-primary" id="sidebarCreateGroupBtn" style="margin:1.5rem 1rem 1rem 1rem;width:calc(100% - 2rem);">Criar grupo</button>
            </aside>
            <main class="chat-main-area">
                <header class="chat-header">
                    <span class="chat-group-header-title">Selecione um grupo</span>
                </header>
                <div class="chat-placeholder">
                    <div class="chat-empty-icon"><i class="fas fa-comments"></i></div>
                    <div class="chat-empty-text">Selecione um grupo para visualizar o chat.<br><span style='color:#888;font-size:0.95em'>(Em desenvolvimento)</span></div>
                </div>
            </main>
        </div>
        `;
        document.body.appendChild(chatDiv);
        chatDiv.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', function () {
                chatDiv.querySelectorAll('.group-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const groupName = this.querySelector('.group-title').textContent;
                renderGroupChatPlaceholder(groupName);
            });
        });
        setTimeout(function () {
            var btn = document.getElementById('sidebarCreateGroupBtn');
            if (btn) {
                btn.onclick = function () {
                    document.getElementById('modalBackdrop').style.display = 'flex';
                };
            }
        }, 0);
    } else {
        chatDiv.style.display = 'block';
    }
}

// Sistema de chat global
let currentGroupId = null;
let chatMessages = {};

function renderGroupChatPlaceholder(groupName) {
    const chatDiv = document.getElementById('chat-dashboard');
    if (!chatDiv) return;
    const main = chatDiv.querySelector('.chat-main-area');
    if (!main) return;

    // Encontrar o ID do grupo baseado no nome
    const groupItem = document.querySelector('.group-item.active');
    if (groupItem) {
        currentGroupId = groupItem.dataset.group || groupName;
    }

    main.innerHTML = `
        <header class="chat-header" style="display: flex; align-items: center; justify-content: space-between; gap: 1rem;">
            <span class="chat-group-header-title" style="flex:0 0 auto;">${groupName}</span>
            <div class="chat-search-bar" style="flex:1; display:flex; justify-content:center;">
                <input type="text" class="chat-search-input" placeholder="Pesquisar mensagens ou membros..." style="max-width:320px; width:100%; padding:0.5rem 1rem; border-radius:2rem; border:1px solid #eee; font-size:1rem; background:#fff;" />
            </div>
            <div class="chat-header-menu" style="position:relative; flex:0 0 auto;">
                <button class="chat-menu-btn" id="chatMenuBtn" style="background:none; border:none; font-size:1.7rem; color:#fff; cursor:pointer; padding:0 0.5rem;">
                    <i class="fas fa-ellipsis-v"></i>
                </button>
                <div class="chat-menu-dropdown" id="chatMenuDropdown" style="display:none; position:absolute; right:0; top:2.5rem; background:#fff; box-shadow:0 4px 16px rgba(0,0,0,0.13); border-radius:0.7rem; min-width:180px; z-index:10;">
                    <button class="chat-menu-item" id="menuViewDetails" style="width:100%;padding:0.8rem 1.2rem; background:none; border:none; text-align:left; font-size:1rem; cursor:pointer;">Ver detalhes</button>
                    <button class="chat-menu-item" id="menuEditGroup" style="width:100%;padding:0.8rem 1.2rem; background:none; border:none; text-align:left; font-size:1rem; cursor:pointer;">Editar grupo</button>
                    <button class="chat-menu-item" id="menuAdvancedChat" style="width:100%;padding:0.8rem 1.2rem; background:none; border:none; text-align:left; font-size:1rem; cursor:pointer;">Chat Avançado</button>
                    <button class="chat-menu-item" id="menuLeaveGroup" style="width:100%;padding:0.8rem 1.2rem; background:none; border:none; text-align:left; color:#d32f2f; font-size:1rem; cursor:pointer;">Sair do grupo</button>
                </div>
            </div>
        </header>
        <div class="chat-container" id="chatContainer" style="display: flex; flex-direction: column; flex: 1; height: calc(100% - 70px);">
            <div class="chat-messages-container" id="chatMessages" style="flex: 1; padding: 1rem; overflow-y: auto; display: flex; flex-direction: column; gap: 0.5rem;">
                ${renderChatWelcome(groupName)}
            </div>
            <div class="chat-input-container" style="padding: 1rem; border-top: 1px solid #eee; background: #fff;">
                <div class="chat-input-wrapper" style="display: flex; gap: 0.5rem; align-items: center;">
                    <input type="text" id="chatMessageInput" placeholder="Digite sua mensagem..." class="chat-input" style="flex: 1; padding: 0.75rem 1rem; border: 1px solid #ddd; border-radius: 2rem; font-size: 1rem;">
                    <button id="chatSendBtn" class="chat-send-btn" style="background: linear-gradient(90deg, #8A2BE2 0%, #9370DB 100%); color: white; border: none; border-radius: 50%; width: 44px; height: 44px; display: flex; align-items: center; justify-content: center; cursor: pointer; font-size: 1.1rem;">
                        <i class="fas fa-paper-plane"></i>
                    </button>
                    <button id="chatEmojiBtn" class="chat-emoji-btn" style="background: none; border: none; font-size: 1.5rem; cursor: pointer; padding: 0.5rem;">
                        😊
                    </button>
                </div>
            </div>
        </div>
    `;

    setupChatEventListeners();
    loadChatMessages(currentGroupId);

    // Dropdown menu toggle
    const menuBtn = main.querySelector('#chatMenuBtn');
    const menuDropdown = main.querySelector('#chatMenuDropdown');
    if (menuBtn && menuDropdown) {
        menuBtn.onclick = function (e) {
            e.stopPropagation();
            menuDropdown.style.display = menuDropdown.style.display === 'block' ? 'none' : 'block';
        };
        // Fecha o menu ao clicar fora
        document.addEventListener('click', function closeMenu(ev) {
            if (!menuDropdown.contains(ev.target) && ev.target !== menuBtn) {
                menuDropdown.style.display = 'none';
                document.removeEventListener('click', closeMenu);
            }
        });
    }

    // Chat avançado - apenas no menu dropdown
    const advancedMenuItem = main.querySelector('#menuAdvancedChat');

    if (advancedMenuItem) {
        advancedMenuItem.onclick = function () {
            openAdvancedChat();
        };
    }
}

function renderChatWelcome(groupName) {
    return `
        <div class="chat-welcome" style="text-align: center; padding: 2rem; color: #666;">
            <div style="font-size: 2rem; margin-bottom: 1rem;">💬</div>
            <h3 style="margin: 0 0 0.5rem 0; color: #333;">Bem-vindo ao chat do grupo!</h3>
            <p style="margin: 0; font-size: 0.95rem;">Comece uma conversa com ${groupName}</p>
        </div>
    `;
}

function setupChatEventListeners() {
    const messageInput = document.getElementById('chatMessageInput');
    const sendBtn = document.getElementById('chatSendBtn');
    const emojiBtn = document.getElementById('chatEmojiBtn');

    if (messageInput && sendBtn) {
        sendBtn.onclick = function () {
            sendChatMessage();
        };

        messageInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') {
                e.preventDefault();
                sendChatMessage();
            }
        });
    }

    if (emojiBtn) {
        emojiBtn.onclick = function () {
            showEmojiPicker();
        };
    }
}

function sendChatMessage() {
    const messageInput = document.getElementById('chatMessageInput');
    const messagesContainer = document.getElementById('chatMessages');

    if (!messageInput || !messagesContainer || !currentGroupId) return;

    const message = messageInput.value.trim();
    if (!message) return;

    // Inicializar mensagens do grupo se não existir
    if (!chatMessages[currentGroupId]) {
        chatMessages[currentGroupId] = [];
    }

    // Criar nova mensagem
    const newMessage = {
        id: Date.now(),
        text: message,
        user: 'Você',
        timestamp: new Date(),
        type: 'sent'
    };

    chatMessages[currentGroupId].push(newMessage);

    // Limpar input
    messageInput.value = '';

    // Renderizar mensagens
    renderChatMessages();

    // Simular resposta automática (apenas para demonstração)
    setTimeout(() => {
        simulateResponse();
    }, 1000 + Math.random() * 2000);
}

function simulateResponse() {
    if (!currentGroupId || !chatMessages[currentGroupId]) return;

    const responses = [
        "Interessante! 👍",
        "Concordo com você!",
        "Vamos discutir isso mais tarde?",
        "Boa pergunta! 🤔",
        "Que legal! 😄",
        "Preciso pensar sobre isso...",
        "Você tem razão!",
        "Obrigado pela informação! 📚"
    ];

    const names = ['Ana', 'Carlos', 'Maria', 'João', 'Juliana'];

    const response = {
        id: Date.now(),
        text: responses[Math.floor(Math.random() * responses.length)],
        user: names[Math.floor(Math.random() * names.length)],
        timestamp: new Date(),
        type: 'received'
    };

    chatMessages[currentGroupId].push(response);
    renderChatMessages();
}

function loadChatMessages(groupId) {
    if (!groupId) return;

    // Se não há mensagens salvas, criar algumas de exemplo
    if (!chatMessages[groupId]) {
        chatMessages[groupId] = [
            {
                id: 1,
                text: "Bem-vindos ao grupo! 👋",
                user: "Sistema",
                timestamp: new Date(Date.now() - 3600000),
                type: 'system'
            },
            {
                id: 2,
                text: "Oi pessoal! Alguém pode me ajudar com a tarefa?",
                user: "Ana",
                timestamp: new Date(Date.now() - 1800000),
                type: 'received'
            }
        ];
    }

    renderChatMessages();
}

function renderChatMessages() {
    const messagesContainer = document.getElementById('chatMessages');
    if (!messagesContainer || !currentGroupId) return;

    const messages = chatMessages[currentGroupId] || [];

    if (messages.length === 0) {
        messagesContainer.innerHTML = renderChatWelcome(currentGroupId);
        return;
    }

    messagesContainer.innerHTML = messages.map(msg => {
        const timeStr = msg.timestamp.toLocaleTimeString('pt-BR', {
            hour: '2-digit',
            minute: '2-digit'
        });

        let messageClass = 'chat-message';
        let align = 'left';

        if (msg.type === 'sent') {
            messageClass += ' sent';
            align = 'right';
        } else if (msg.type === 'system') {
            messageClass += ' system';
            align = 'center';
        }

        return `
            <div class="${messageClass}" style="
                max-width: 70%;
                padding: 0.75rem 1rem;
                margin: 0.25rem 0;
                border-radius: 1rem;
                ${msg.type === 'sent' ? `
                    background: linear-gradient(90deg, #8A2BE2 0%, #9370DB 100%);
                    color: white;
                    margin-left: auto;
                    text-align: right;
                ` : msg.type === 'system' ? `
                    background: #f0f0f0;
                    color: #666;
                    text-align: center;
                    margin: 1rem auto;
                    font-style: italic;
                    max-width: 90%;
                ` : `
                    background: #f8f9fa;
                    color: #333;
                    border: 1px solid #e9ecef;
                `}
            ">
                ${msg.type !== 'system' && msg.type !== 'sent' ? `
                    <div style="font-weight: 600; font-size: 0.9rem; margin-bottom: 0.25rem; color: #8A2BE2;">${msg.user}</div>
                ` : ''}
                <div style="margin-bottom: 0.25rem;">${escapeHtml(msg.text)}</div>
                <div style="font-size: 0.8rem; opacity: 0.7;">${timeStr}</div>
            </div>
        `;
    }).join('');

    // Scroll para a última mensagem
    messagesContainer.scrollTop = messagesContainer.scrollHeight;
}

function showEmojiPicker() {
    const emojis = ['😀', '😂', '❤️', '👍', '👏', '🎉', '🔥', '💯', '🤔', '😍'];
    const messageInput = document.getElementById('chatMessageInput');

    if (!messageInput) return;

    // Criar picker simples
    const emojiText = emojis[Math.floor(Math.random() * emojis.length)];
    messageInput.value += emojiText;
    messageInput.focus();
}

function openAdvancedChat() {
    // Abrir chat avançado em nova aba
    window.open('/dashboard/chat/advanced', '_blank');
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

document.getElementById('openCreateGroupModal').onclick = function () {
    document.getElementById('modalBackdrop').style.display = 'flex';
};

document.getElementById('closeModal').onclick = function () {
    document.getElementById('modalBackdrop').style.display = 'none';
};

document.getElementById('createGroupForm').onsubmit = function (e) {
    e.preventDefault();
    const groupName = document.getElementById('groupName').value.trim();
    const groupMateria = document.getElementById('groupMateria').value.trim();
    const groupObjetivo = document.getElementById('groupObjetivo').value.trim();
    const groupLocal = document.getElementById('groupLocal').value;
    const groupEmails = document.getElementById('groupEmails').value.trim();

    if (!groupName || !groupMateria || !groupObjetivo || !groupLocal || !groupEmails) {
        alert('Preencha todos os campos.');
        return;
    }



    fetch('create/group', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            name: groupName,
            subject: groupMateria,
            objective: groupObjetivo,
            place: groupLocal,
            emails: groupEmails.split(',').map(email => email.trim())
        })
    })
        .then(response => {
            if (!response.ok) {
                throw new Error('Erro ao criar o grupo.');
            }
            return response.json();
        })
        .then(() => {
            alert('Grupo criado com sucesso!');
            document.getElementById('modalBackdrop').style.display = 'none';
            this.reset();
            location.reload();
        })
        .catch(error => {
            alert(error.message);
        });
};