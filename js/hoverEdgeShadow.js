(function () {
    const COLOR_RGB = '0,51,204';   // #0033cc
    const BASE_EDGE_ALPHA = 0.22;   // alpha base de las tiras (más visible)
    const MAX_EDGE_ALPHA = 2.0;     // alpha máximo local (muy fuerte)
    const SMOOTH = 0.18;            // lerp smoothing
    const SIGMA = 140;              // px: controla cuánto rango tiene el foco (mayor = se activa antes)
    const FOCUS_SIZE = parseInt(getComputedStyle(document.documentElement).getPropertyValue('--edge-focus-size')) || 120;

    function createEdge(root, pos) {
        const d = document.createElement('div');
        d.className = `edge ${pos}`;
        root.insertBefore(d, root.firstChild);
        return d;
    }

    function gradientFor(pos, alpha) {
        if (pos === 'left') {
            return `linear-gradient(to right, rgba(${COLOR_RGB}, ${alpha}) 0%, rgba(${COLOR_RGB}, ${(alpha * 0.7).toFixed(3)}) 40%, rgba(${COLOR_RGB}, ${(alpha * 0.25).toFixed(3)}) 70%, transparent 100%)`;
        } else if (pos === 'right') {
            return `linear-gradient(to left, rgba(${COLOR_RGB}, ${alpha}) 0%, rgba(${COLOR_RGB}, ${(alpha * 0.7).toFixed(3)}) 40%, rgba(${COLOR_RGB}, ${(alpha * 0.25).toFixed(3)}) 70%, transparent 100%)`;
        } else if (pos === 'top') {
            return `linear-gradient(to bottom, rgba(${COLOR_RGB}, ${alpha}) 0%, rgba(${COLOR_RGB}, ${(alpha * 0.7).toFixed(3)}) 40%, rgba(${COLOR_RGB}, ${(alpha * 0.25).toFixed(3)}) 70%, transparent 100%)`;
        } else {
            return `linear-gradient(to top, rgba(${COLOR_RGB}, ${alpha}) 0%, rgba(${COLOR_RGB}, ${(alpha * 0.7).toFixed(3)}) 40%, rgba(${COLOR_RGB}, ${(alpha * 0.25).toFixed(3)}) 70%, transparent 100%)`;
        }
    }

    function gaussian(dist, sigma) {
        return Math.exp(- (dist * dist) / (2 * sigma * sigma));
    }

    function init(root) {
        const left = root.querySelector('.edge.left') || createEdge(root, 'left');
        const right = root.querySelector('.edge.right') || createEdge(root, 'right');
        const top = root.querySelector('.edge.top') || createEdge(root, 'top');
        const bottom = root.querySelector('.edge.bottom') || createEdge(root, 'bottom');

        [['left', left], ['right', right], ['top', top], ['bottom', bottom]].forEach(([pos, el]) => {
            if (!el) return;
            el.style.background = gradientFor(pos, BASE_EDGE_ALPHA);
            if (pos === 'left' || pos === 'right') el.style.width = getComputedStyle(document.documentElement).getPropertyValue('--edge-thickness') || '8px';
            else el.style.height = getComputedStyle(document.documentElement).getPropertyValue('--edge-thickness') || '8px';
            el.style.filter = `blur(${getComputedStyle(document.documentElement).getPropertyValue('--edge-blur') || 6}px)`;
        });

        let target = { aL: BASE_EDGE_ALPHA, aR: BASE_EDGE_ALPHA, aT: BASE_EDGE_ALPHA, aB: BASE_EDGE_ALPHA, px: 50, py: 50 };
        let current = { ...target };
        let raf = null;

        const lerp = (a, b, t) => a + (b - a) * t;
        const clamp = (v, a, b) => Math.max(a, Math.min(b, v));

        function onMove(e) {
            const r = root.getBoundingClientRect();
            const x = e.clientX - r.left;
            const y = e.clientY - r.top;
            const px = clamp((x / r.width) * 100, 0, 100);
            const py = clamp((y / r.height) * 100, 0, 100);

            // puntos más cercanos en cada borde (coordenadas en sistema local)
            const leftPoint = { x: 0, y: clamp(y, 0, r.height) };
            const rightPoint = { x: r.width, y: clamp(y, 0, r.height) };
            const topPoint = { x: clamp(x, 0, r.width), y: 0 };
            const bottomPoint = { x: clamp(x, 0, r.width), y: r.height };

            // distancia euclidiana desde el mouse a cada punto del borde
            const distL = Math.hypot(x - leftPoint.x, y - leftPoint.y);
            const distR = Math.hypot(x - rightPoint.x, y - rightPoint.y);
            const distT = Math.hypot(x - topPoint.x, y - topPoint.y);
            const distB = Math.hypot(x - bottomPoint.x, y - bottomPoint.y);

            // factor local 0..1 por borde (gaussiana sobre la distancia al punto)
            const localL = gaussian(distL, SIGMA);
            const localR = gaussian(distR, SIGMA);
            const localT = gaussian(distT, SIGMA);
            const localB = gaussian(distB, SIGMA);

            // combinar base + local (escala a MAX_EDGE_ALPHA)
            const aL = BASE_EDGE_ALPHA + localL * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA);
            const aR = BASE_EDGE_ALPHA + localR * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA);
            const aT = BASE_EDGE_ALPHA + localT * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA);
            const aB = BASE_EDGE_ALPHA + localB * (MAX_EDGE_ALPHA - BASE_EDGE_ALPHA);

            target.aL = clamp(aL, BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.aR = clamp(aR, BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.aT = clamp(aT, BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.aB = clamp(aB, BASE_EDGE_ALPHA, MAX_EDGE_ALPHA);
            target.px = px; target.py = py;

            if (!raf) rafLoop();
        }

        function onLeave() {
            target.aL = target.aR = target.aT = target.aB = BASE_EDGE_ALPHA;
            target.px = target.py = 50;
            if (!raf) rafLoop();
        }

        function rafLoop() {
            current.aL = lerp(current.aL, target.aL, SMOOTH);
            current.aR = lerp(current.aR, target.aR, SMOOTH);
            current.aT = lerp(current.aT, target.aT, SMOOTH);
            current.aB = lerp(current.aB, target.aB, SMOOTH);
            current.px = lerp(current.px, target.px, SMOOTH);
            current.py = lerp(current.py, target.py, SMOOTH);

            // actualizar cada tira: background con alpha y posición del foco puntual
            if (left) {
                left.style.background = gradientFor('left', current.aL);
                left.style.backgroundPosition = `0% ${current.py.toFixed(1)}%`;
            }
            if (right) {
                right.style.background = gradientFor('right', current.aR);
                right.style.backgroundPosition = `0% ${current.py.toFixed(1)}%`;
            }
            if (top) {
                top.style.background = gradientFor('top', current.aT);
                top.style.backgroundPosition = `${current.px.toFixed(1)}% 0%`;
            }
            if (bottom) {
                bottom.style.background = gradientFor('bottom', current.aB);
                bottom.style.backgroundPosition = `${current.px.toFixed(1)}% 0%`;
            }

            // box-shadow global responde suavemente (más fuerte cuando hay actividad)
            const totalAlpha = (current.aL + current.aR + current.aT + current.aB) / 4;
            const boxAlpha = Math.max(parseFloat(getComputedStyle(document.documentElement).getPropertyValue('--base-shadow-alpha')) || 0.06, totalAlpha * 0.12);
            root.style.boxShadow = `0 12px 36px rgba(${COLOR_RGB}, ${boxAlpha.toFixed(3)})`;

            const da = Math.abs(current.aL - target.aL) + Math.abs(current.aR - target.aR)
                + Math.abs(current.aT - target.aT) + Math.abs(current.aB - target.aB);
            const dp = Math.abs(current.px - target.px) + Math.abs(current.py - target.py);
            if (da < 0.005 && dp < 0.2) {
                cancelAnimationFrame(raf);
                raf = null;
                return;
            }
            raf = requestAnimationFrame(rafLoop);
        }

        root.addEventListener('mousemove', onMove);
        root.addEventListener('mouseenter', onMove);
        root.addEventListener('mouseleave', onLeave);

        return { destroy() { root.removeEventListener('mousemove', onMove); root.removeEventListener('mouseenter', onMove); root.removeEventListener('mouseleave', onLeave); } };
    }

    document.addEventListener('DOMContentLoaded', () => {
        document.querySelectorAll('.hover-trail').forEach(el => init(el));
    });
})();
