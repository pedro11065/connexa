function isMobileDevice() {
    return window.innerWidth <= 600 || /Android|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i.test(navigator.userAgent);
}

// Mostra o chat e esconde a lista de grupos (mobile)
function showChatArea() {
    if (isMobileDevice()) {
        document.querySelector('.chat-sidebar')?.classList.add('hide');
        document.querySelector('.chat-main-area')?.classList.add('active');
    }
}

// Mostra a lista de grupos e esconde o chat (mobile)
function showSidebar() {
    if (isMobileDevice()) {
        document.querySelector('.chat-sidebar')?.classList.remove('hide');
        document.querySelector('.chat-main-area')?.classList.remove('active');
    }
}

// NEW: aplica estado inicial correto e ajusta ao redimensionar
function applyMobileLayout() {
    const sidebar = document.querySelector('.chat-sidebar');
    const main = document.querySelector('.chat-main-area');
    if (!sidebar || !main) return;

    if (isMobileDevice()) {
        // Mobile: lista visível por padrão, chat oculto até selecionar um grupo
        sidebar.classList.remove('hide');
        main.classList.remove('active');
    } else {
        // Desktop: garante ambos visíveis
        sidebar.classList.remove('hide');
        main.classList.remove('active');
    }
}

// Chama showChatArea ao abrir um grupo
window.openGroupMobile = function () {
    showChatArea();
    // Aqui você pode chamar a função que carrega o chat do grupo, se necessário
};

// Chama showSidebar ao clicar no botão voltar do chat
window.backToGroupsMobile = function () {
    showSidebar();
    // Aqui você pode limpar o chat ou atualizar a lista de grupos, se necessário
};

// Exemplo de integração: 
// Supondo que cada .group-item representa um grupo na lista
window.addEventListener('DOMContentLoaded', function () {
    // Bootstrap: delegate to Group module
    if (window.Group && typeof window.Group.init === 'function') {
        window.Group.init();
    } else {
        // Fallback: try minimal fetch then render
        fetch('/dashboard/user', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ type: 'user' })
        })
            .then(r => r.json())
            .then(d => {
                if (d.success && Array.isArray(d.data) && d.data.length > 0) {
                    window.Group?.renderDashboard?.(d.data);
                } else {
                    window.Group?.renderNoGroupPage?.();
                }
            })
            .catch(() => window.Group?.renderNoGroupPage?.());
    }

    // Adiciona listeners para alternar entre grupos e chat no mobile
    if (isMobileDevice()) {
        // Quando clicar em um grupo, mostra o chat
        document.body.addEventListener('click', function (e) {
            const groupItem = e.target.closest('.group-item');
            if (groupItem) {
                window.openGroupMobile();
            }
        });

        // Quando clicar no botão voltar do chat, volta para lista de grupos
        document.body.addEventListener('click', function (e) {
            const backBtn = e.target.closest('.chat-back-btn');
            if (backBtn) {
                window.backToGroupsMobile();
            }
        });
    }

    // NEW: aplica estado inicial correto
    applyMobileLayout();
});

// NEW: re-aplica layout ao redimensionar
window.addEventListener('resize', applyMobileLayout);