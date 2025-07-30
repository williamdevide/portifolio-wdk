document.addEventListener("DOMContentLoaded", function() {

    // Lógica para a mudança de cor da navbar ao rolar a página
    const navbar = document.querySelector('.navbar.fixed-top');
    if (navbar) {
        window.addEventListener('scroll', function() {
            if (window.scrollY > 50) {
                navbar.classList.add('navbar-scrolled');
            } else {
                navbar.classList.remove('navbar-scrolled');
            }
        });
    }

    // Lógica para a animação de "fade in" dos textos na seção hero
    // Esta função será executada assim que a página carregar
    const fadeInElements = document.querySelectorAll('.hero-section .fade-in-text');
    fadeInElements.forEach((element, index) => {
        // Adiciona um pequeno atraso para cada elemento para um efeito escalonado
        setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
        }, (index + 1) * 200); // 200ms de atraso entre cada elemento
    });

    // Lógica para transição suave entre páginas (se houver links para outras páginas)
    const transitionLinks = document.querySelectorAll('.transition-link');
    transitionLinks.forEach(link => {
        link.addEventListener('click', function(event) {
            // Verifica se o link é para uma página externa ou uma âncora
            if (this.hostname === window.location.hostname && this.pathname !== window.location.pathname) {
                event.preventDefault(); // Impede o redirecionamento imediato
                
                const destination = this.href;
                document.body.classList.add('fade-out'); // Adiciona classe para animação de saída

                setTimeout(() => {
                    window.location.href = destination; // Redireciona após a animação
                }, 500); // Tempo da animação de saída
            }
        });
    });

    // Adiciona a classe 'fade-out' ao corpo antes de a página ser descarregada
    window.addEventListener('beforeunload', function() {
        document.body.classList.add('fade-out');
    });

});
