window.addEventListener('DOMContentLoaded', function() {
    // POST request para buscar status do usuário e grupos
    fetch('/dashboard/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({'type':'user'})
    })
    .then(response => response.json())
    .then(data => {
        if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            renderChatDashboard(data.data);
        } else {
            document.querySelector('.dashboard-container').style.display = 'flex';
        }
    })
    .catch(error => {
        // alert(error.message);
    });
});

function renderChatDashboard(grupos) {
    document.querySelector('.dashboard-container').style.display = 'none';
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
                    <div class="chat-empty-text">Selecione um grupo para visualizar o chat.<br><span style='color:#888;font-size:0.95em'>(Em desenvolvimento)</span></div>
                </div>
            </main>
        </div>
        `;
        document.body.appendChild(chatDiv);
        // Evento de seleção de grupo
        chatDiv.querySelectorAll('.group-item').forEach(item => {
            item.addEventListener('click', function() {
                chatDiv.querySelectorAll('.group-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const groupName = this.querySelector('.group-title').textContent;
                renderGroupChatPlaceholder(groupName);
            });
        });
    } else {
        chatDiv.style.display = 'block';
    }
}

function renderGroupChatPlaceholder(groupName) {
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
    // Foco no input ao abrir
    const input = main.querySelector('.chat-message-input');
    if (input) input.focus();
}

document.getElementById('openCreateGroupModal').onclick = function() {
    document.getElementById('modalBackdrop').style.display = 'flex';
};

document.getElementById('closeModal').onclick = function() {
    document.getElementById('modalBackdrop').style.display = 'none';
};

document.getElementById('createGroupForm').onsubmit = function(e) {
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