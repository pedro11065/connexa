// Lógica de abrir/fechar modal

document.getElementById('openCreateGroupModal').onclick = function() {
    document.getElementById('modalBackdrop').style.display = 'flex';
};

document.getElementById('closeModal').onclick = function() {
    document.getElementById('modalBackdrop').style.display = 'none';
};
