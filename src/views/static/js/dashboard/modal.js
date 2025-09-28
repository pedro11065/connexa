// Lógica de criação/abertura de modal movida para group.js
document.addEventListener('DOMContentLoaded', () => {
	// Bridge only: if buttons exist, delegate to Group
	document.getElementById('openCreateGroupModal')?.addEventListener('click', () => window.Group?.openCreateGroupModal?.());
	document.getElementById('closeModal')?.addEventListener('click', () => window.Group?.closeCreateGroupModal?.());
});
