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
        // Sidebar com lista de grupos
        let sidebar = '<div class="chat-sidebar"><h4>Grupos</h4><ul>';
        grupos.forEach((grupo, idx) => {
            sidebar += `<li class="chat-group-item" data-group="${grupo.id_grupo}">
                <strong>${grupo.materia}</strong><br>
                <span>${grupo.objetivo}</span>
            </li>`;
        });
        sidebar += '</ul></div>';
        // Área principal do chat (placeholder)
        let main = `<div class="chat-main">
            <div class="chat-messages">Selecione um grupo para ver as mensagens.</div>
            <div class="chat-input"><input type="text" placeholder="Digite uma mensagem..."></div>
        </div>`;
        chatDiv.innerHTML = `<div class="chat-container">${sidebar}${main}</div>`;
        document.body.appendChild(chatDiv);
        // Adiciona evento para seleção de grupo
        chatDiv.querySelectorAll('.chat-group-item').forEach(item => {
            item.addEventListener('click', function() {
                const groupId = this.getAttribute('data-group');
                renderGroupChat(grupos.find(g => g.id_grupo === groupId));
            });
        });
    } else {
        chatDiv.style.display = 'block';
    }
}

function renderGroupChat(grupo) {
    const chatDiv = document.getElementById('chat-dashboard');
    if (!chatDiv) return;
    const main = chatDiv.querySelector('.chat-main');
    if (!main) return;
    main.innerHTML = `
        <div class="chat-messages">
            <div class="chat-group-header">
                <h3>${grupo.materia}</h3>
                <p>${grupo.objetivo}</p>
                <span class="chat-group-meta">${grupo.local} | ${grupo.status} | Limite: ${grupo.limite_participantes}</span>
            </div>
            <div class="chat-messages-list">(Mensagens do grupo aqui...)</div>
        </div>
        <div class="chat-input"><input type="text" placeholder="Digite uma mensagem..."></div>
    `;
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