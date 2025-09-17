document.addEventListener('DOMContentLoaded', () => {
    const themeToggle = document.getElementById('theme-toggle');
    const body = document.body;
    const moonIcon = '<i class="fas fa-moon"></i>';
    const sunIcon = '<i class="fas fa-sun"></i>';

    // Carregar tema salvo do localStorage
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
        body.classList.add('dark-mode');
        themeToggle.innerHTML = sunIcon;
    }

    // Toggle de tema
    themeToggle.addEventListener('click', () => {
        body.classList.toggle('dark-mode');
        const isDarkMode = body.classList.contains('dark-mode');

        if (isDarkMode) {
            localStorage.setItem('theme', 'dark');
            themeToggle.innerHTML = sunIcon;
        } else {
            localStorage.removeItem('theme');
            themeToggle.innerHTML = moonIcon;
        }
    });

    // Animações sutis ao rolar (opcional, pode ser substituído por Framer Motion se integrado a um framework)
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };

    const observerCallback = (entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target); // Deixar de observar após a entrada
            }
        });
    };

    const observer = new IntersectionObserver(observerCallback, observerOptions);

    // Adicionar observadores para elementos que devem animar ao aparecer
    const elementsToAnimate = document.querySelectorAll('.card, .plano-card, .feedback-card, .quem-somos-text, .quem-somos-image');
    elementsToAnimate.forEach(el => {
        el.classList.add('hidden'); // Adiciona classe para ocultar inicialmente
        observer.observe(el);
    });

    // Adicionar classe 'visible' para animação CSS
    // Isso é feito dentro do observerCallback para melhor controle
    // Exemplo: o CSS precisa ter uma regra como:
    /*
    .hidden { opacity: 0; transform: translateY(20px); }
    .visible { opacity: 1; transform: translateY(0); transition: opacity 0.5s ease-out, transform 0.5s ease-out; }
    */
});