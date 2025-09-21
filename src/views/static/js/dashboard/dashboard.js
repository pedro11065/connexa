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
        document.getElementById('openCreateGroupModal').onclick = function() {
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
            item.addEventListener('click', function() {
                chatDiv.querySelectorAll('.group-item').forEach(i => i.classList.remove('active'));
                this.classList.add('active');
                const groupName = this.querySelector('.group-title').textContent;
                renderGroupChatPlaceholder(groupName);
            });
        });
        setTimeout(function() {
            var btn = document.getElementById('sidebarCreateGroupBtn');
            if (btn) {
                btn.onclick = function() {
                    document.getElementById('modalBackdrop').style.display = 'flex';
                };
            }
        }, 0);
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
                    <button class="chat-menu-item" id="menuLeaveGroup" style="width:100%;padding:0.8rem 1.2rem; background:none; border:none; text-align:left; color:#d32f2f; font-size:1rem; cursor:pointer;">Sair do grupo</button>
                </div>
            </div>
        </header>
        <div class="chat-placeholder">
            <div class="chat-empty-icon"><i class="fas fa-comments"></i></div>
            <div class="chat-empty-text">Chat em desenvolvimento.<br><span style='color:#888;font-size:0.95em'>(Em breve você poderá conversar com seu grupo aqui!)</span></div>
        </div>
    `;
    // Dropdown menu toggle
    const menuBtn = main.querySelector('#chatMenuBtn');
    const menuDropdown = main.querySelector('#chatMenuDropdown');
    if (menuBtn && menuDropdown) {
        menuBtn.onclick = function(e) {
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
    // (Os eventos dos itens do menu podem ser implementados depois)
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