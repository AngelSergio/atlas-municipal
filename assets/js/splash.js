(function () {
    const overlay = document.getElementById('intro-splash');
    if (!overlay) return;

    const minVisibleMs = window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 700 : 2500;
    const maxVisibleMs = 2500;
    const start = performance.now();
    let finished = false;

    function closeSplash() {
        if (finished) return;
        finished = true;
        overlay.classList.add('is-hiding');
        window.setTimeout(() => {
            overlay.remove();
        }, 760);
    }

    function scheduleClose() {
        const elapsed = performance.now() - start;
        const wait = Math.max(0, minVisibleMs - elapsed);
        window.setTimeout(closeSplash, wait);
    }

    if (document.readyState === 'complete') {
        scheduleClose();
    } else {
        window.addEventListener('load', scheduleClose, { once: true });
    }

    window.setTimeout(closeSplash, maxVisibleMs);
})();
