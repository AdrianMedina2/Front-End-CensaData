(function () {
    // Se define el color y parámetros principales
    const COLOR_RGB = '0,51,204';
    const BASE_EDGE_ALPHA = 0.22;
    const MAX_EDGE_ALPHA = 1.0;
    const SMOOTH = 0.30;
    const SIGMA = 140;
    const FOCUS_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--edge-focus-size')) || 120;

    // Utilidades matemáticas
    const lerp = (a, b, t) => a + (b - a) * t;
    const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
    const gauss = (d, s) => Math.exp(- (d * d) / (2 * s * s));

    // Se crea un elemento .edge en la posición indicada
    function createEdge(root, pos) {
        const d = document.createElement('div'); d.className = `edge ${pos}`; root.insertBefore(d, root.firstChild); return d;
    }

    // Se genera el gradiente según orientación y alpha
    function gradientFor(pos, a) {
        const p = pos === 'left' ? 'to right' : pos === 'right' ? 'to left' : pos === 'top' ? 'to bottom' : 'to top';
        return `linear-gradient(${p}, rgba(${COLOR_RGB}, ${a}) 0%, rgba(${COLOR_RGB}, ${(a * 0.7).toFixed(3)}) 40%, rgba(${COLOR_RGB}, ${(a * 0.25).toFixed(3)}) 70%, transparent 100%)`;
    }

    // Inicializa el efecto en el contenedor dado
    function init(root) {
        // Se leen variables CSS una vez
        const docStyle = getComputedStyle(document.documentElement);
        const thickness = docStyle.getPropertyValue('--edge-thickness') || '8px';
        const blur = docStyle.getPropertyValue('--edge-blur') || '6px';

        // Se obtienen o crean las cuatro tiras
        const left = root.querySelector('.edge.left') || createEdge(root, 'left');
        const right = root.querySelector('.edge.right') || createEdge(root, 'right');
        const top = root.querySelector('.edge.top') || createEdge(root, 'top');
        const bottom = root.querySelector('.edge.bottom') || createEdge(root, 'bottom');

        // Se aplican tamaños y estilos iniciales
        [[left, 'left'], [right, 'right']].forEach(([el]) => el && (el.style.width = thickness));
        [[top, 'top'], [bottom, 'bottom']].forEach(([el]) => el && (el.style.height = thickness));
        [left, right, top, bottom].forEach(el => el && (el.style.filter = `blur(${blur})`, el.style.background = gradientFor(el.classList.contains('left') ? 'left' : el.classList.contains('right') ? 'right' : el.classList.contains('top') ? 'top' : 'bottom', BASE_EDGE_ALPHA)));

        // Estado objetivo y estado actual
        let target = { aL: BASE_EDGE_ALPHA, aR: BASE_EDGE_ALPHA, aT: BASE_EDGE_ALPHA, aB: BASE_EDGE_ALPHA, px: 50, py: 50 };
        let cur = { ...target }, raf = null;

        // Calcula objetivos a partir de coordenadas del puntero
        function updateTargets(clientX, clientY) {
            const r = root.getBoundingClientRect();
            const x = clientX - r.left, y = clientY - r.top;
            const px = clamp((x / r.width) * 100, 0, 100), py = clamp((y / r.height) * 100, 0, 100);

            const dL = Math.hypot(x - 0, y - clamp(y, 0, r.height));
            const dR = Math.hypot(x - r.width, y - clamp(y, 0, r.height));
            const dT = Math.hypot(x - clamp(x, 0, r.width), y - 0);
            const dB = Math.hypot(x - clamp(x, 0, r.width), y - r.height);

            const lL = gauss(dL, SIGMA), lR = gauss(dR, SIGMA), lT = gauss(dT, SIGMA), lB = gauss(dB, SIGMA);

            target.aL = clamp(BASE_EDGE_ALPHA + lL * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA), BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.aR = clamp(BASE_EDGE_ALPHA + lR * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA), BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.aT = clamp(BASE_EDGE_ALPHA + lT * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA), BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.aB = clamp(BASE_EDGE_ALPHA + lB * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA), BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.px = px; target.py = py;
        }

        // Loop de animación con rAF
        function rafLoop() {
            cur.aL = lerp(cur.aL, target.aL, SMOOTH);
            cur.aR = lerp(cur.aR, target.aR, SMOOTH);
            cur.aT = lerp(cur.aT, target.aT, SMOOTH);
            cur.aB = lerp(cur.aB, target.aB, SMOOTH);
            cur.px = lerp(cur.px, target.px, SMOOTH);
            cur.py = lerp(cur.py, target.py, SMOOTH);

            if (left) { left.style.background = gradientFor('left', cur.aL); left.style.backgroundPosition = `0% ${cur.py}%`; }
            if (right) { right.style.background = gradientFor('right', cur.aR); right.style.backgroundPosition = `0% ${cur.py}%`; }
            if (top) { top.style.background = gradientFor('top', cur.aT); top.style.backgroundPosition = `${cur.px}% 0%`; }
            if (bottom) { bottom.style.background = gradientFor('bottom', cur.aB); bottom.style.backgroundPosition = `${cur.px}% 0%`; }

            const total = (cur.aL + cur.aR + cur.aT + cur.aB) / 4;
            const baseShadow = parseFloat(docStyle.getPropertyValue('--base-shadow-alpha')) || 0.06;
            const boxAlpha = Math.max(baseShadow, total * 0.12);
            root.style.boxShadow = `0 12px 36px rgba(${COLOR_RGB}, ${boxAlpha.toFixed(3)})`;

            const da = Math.abs(cur.aL - target.aL) + Math.abs(cur.aR - target.aR) + Math.abs(cur.aT - target.aT) + Math.abs(cur.aB - target.aB);
            const dp = Math.abs(cur.px - target.px) + Math.abs(cur.py - target.py);
            if (da < 0.005 && dp < 0.2) { cancelAnimationFrame(raf); raf = null; return; }
            raf = requestAnimationFrame(rafLoop);
        }

        // Handlers de puntero
        const onMove = e => { updateTargets(e.clientX, e.clientY); if (!raf) rafLoop(); };
        const onLeave = () => { target.aL = target.aR = target.aT = target.aB = BASE_EDGE_ALPHA; target.px = target.py = 50; if (!raf) rafLoop(); };

        // Se añaden listeners
        root.addEventListener('pointermove', onMove);
        root.addEventListener('pointerenter', onMove);
        root.addEventListener('pointerleave', onLeave);

        // Se devuelve método de limpieza
        return { destroy() { root.removeEventListener('pointermove', onMove); root.removeEventListener('pointerenter', onMove); root.removeEventListener('pointerleave', onLeave); } };
    }

    // Auto-inicialización en DOMContentLoaded
    document.addEventListener('DOMContentLoaded', () => document.querySelectorAll('.hover-trail').forEach(el => init(el)));
})();
