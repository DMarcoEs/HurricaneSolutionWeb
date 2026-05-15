/**
 * Acordeón FAQ. El markup legacy usa onclick="toggleFaq(this)" inline,
 * por lo que la función debe vivir en el scope global window.
 * El CSS abre el item agregando .open al .faq-item padre.
 */
export function initFaq() {
    window.toggleFaq = (button) => {
        const item = button.closest('.faq-item');
        if (!item)
            return;
        item.classList.toggle('open');
    };
}
//# sourceMappingURL=faq.js.map