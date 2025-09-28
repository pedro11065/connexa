(function () {
	// Public API
	window.Group = {
		init,
		renderDashboard,
		renderNoGroupPage,
		openCreateGroupModal,
		closeCreateGroupModal
	};

	async function init() {
		try {
			const grupos = await fetchGroups();
			if (Array.isArray(grupos) && grupos.length > 0) {
				renderDashboard(grupos);
			} else {
				renderNoGroupPage();
			}
			wireCreateGroupModal();
		} catch (_) {
			renderNoGroupPage();
		}
	}

	async function fetchGroups() {
		const resp = await fetch('/dashboard/user', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ type: 'user' })
		});
		const data = await resp.json();
		return data && data.success ? (data.data || []) : [];
	}

	function renderNoGroupPage() {
		const chatDiv = document.getElementById('chat-dashboard');
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
		} else {
			noGroupDiv.style.display = 'flex';
		}

		document.getElementById('openCreateGroupModal')?.addEventListener('click', openCreateGroupModal);
	}

	function renderDashboard(grupos) {
		const noGroupDiv = document.getElementById('no-group-page');
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
		} else {
			chatDiv.style.display = 'block';
		}

		// Wire group click -> load chat (no simulation)
		chatDiv.querySelectorAll('.group-item').forEach(item => {
			item.addEventListener('click', function () {
				chatDiv.querySelectorAll('.group-item').forEach(i => i.classList.remove('active'));
				this.classList.add('active');
				const groupId = this.dataset.group;
				const groupName = this.querySelector('.group-title')?.textContent || 'Grupo';
				window.Chat?.openGroup({ id: groupId, name: groupName });
			});
		});

		document.getElementById('sidebarCreateGroupBtn')?.addEventListener('click', openCreateGroupModal);
	}

	function openCreateGroupModal() {
		const el = document.getElementById('modalBackdrop');
		if (el) el.style.display = 'flex';
	}

	function closeCreateGroupModal() {
		const el = document.getElementById('modalBackdrop');
		if (el) el.style.display = 'none';
	}

	function wireCreateGroupModal() {
		// open/close buttons (optional)
		document.getElementById('openCreateGroupModal')?.addEventListener('click', openCreateGroupModal);
		document.getElementById('closeModal')?.addEventListener('click', closeCreateGroupModal);

		// form submit
		const form = document.getElementById('createGroupForm');
		if (!form) return;

		form.onsubmit = function (e) {
			e.preventDefault();
			const groupName = document.getElementById('groupName')?.value.trim();
			const groupMateria = document.getElementById('groupMateria')?.value.trim();
			const groupObjetivo = document.getElementById('groupObjetivo')?.value.trim();
			const groupLocal = document.getElementById('groupLocal')?.value;
			const groupEmails = document.getElementById('groupEmails')?.value.trim();

			if (!groupName || !groupMateria || !groupObjetivo || !groupLocal || !groupEmails) {
				alert('Preencha todos os campos.');
				return;
			}

			fetch('create/group', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					name: groupName,
					subject: groupMateria,
					objective: groupObjetivo,
					place: groupLocal,
					emails: groupEmails.split(',').map(e => e.trim()).filter(Boolean)
				})
			})
				.then(r => r.ok ? r.json() : Promise.reject(new Error('Erro ao criar o grupo.')))
				.then(() => {
					alert('Grupo criado com sucesso!');
					closeCreateGroupModal();
					form.reset();
					location.reload();
				})
				.catch(err => alert(err.message));
		};
	}
})();
