// Funções relacionadas à criação de grupo e tela de 'sem grupo'

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
        document.getElementById('openCreateGroupModal').onclick = function() {
            document.getElementById('modalBackdrop').style.display = 'flex';
        };
    } else {
        noGroupDiv.style.display = 'flex';
    }
}

// Criação de grupo
function handleCreateGroupForm() {
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
}
