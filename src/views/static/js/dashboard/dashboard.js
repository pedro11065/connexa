window.addEventListener('DOMContentLoaded', function() {
    // GET request para buscar status do usuário
    fetch('/dashboard/user', {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        }
    })
    .then(response => {
        if (!response.ok) {
            throw new Error('Erro ao carregar informações do dashboard.');
        }
        return response.json();
    })
    .then(data => {
        if (data.status === true) {
            // Usuário está em grupo: renderizar interface de chat
            renderChatDashboard(data);
        } else {
            // Usuário não está em grupo: manter tela padrão
            document.querySelector('.dashboard-container').style.display = 'flex';
        }
    })
    .catch(error => {
        // alert(error.message);
    });

    // POST request para buscar status do usuário (caso necessário)
    fetch('/dashboard/user', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({})
    })
    .then(response => response.json())
    .then(data => {
        // Se quiser tratar algo após o POST, faça aqui
        // Exemplo: console.log('POST dashboard/user', data);
    });
});

function renderChatDashboard(data) {
    // Esconde a tela de "você não está em nenhum grupo"
    document.querySelector('.dashboard-container').style.display = 'none';
    // Cria e exibe a interface de chat (exemplo básico)
    let chatDiv = document.getElementById('chat-dashboard');
    if (!chatDiv) {
        chatDiv = document.createElement('div');
        chatDiv.id = 'chat-dashboard';
        chatDiv.innerHTML = `
            <div class="chat-container">
                <div class="chat-sidebar">Grupos</div>
                <div class="chat-main">
                    <div class="chat-messages">Bem-vindo ao grupo!</div>
                    <div class="chat-input"><input type="text" placeholder="Digite uma mensagem..."></div>
                </div>
            </div>
        `;
        document.body.appendChild(chatDiv);
    } else {
        chatDiv.style.display = 'block';
    }
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
    fetch('/dashboard/user', {
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
    })
    .catch(error => {
        alert(error.message);
    });
};