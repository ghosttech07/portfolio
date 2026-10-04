/** Tiny event bridge so any button can toggle the full-screen menu (<Menu />). */
export const toggleMenu = () => window.dispatchEvent(new Event('menu:toggle'));
