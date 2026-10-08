// =====================================================================
//  Ilustraciones de línea (SVG) y animación de trazo.
//  Todas usan el mismo grosor de línea y se "dibujan" una sola vez
//  cuando aparecen en pantalla.
// =====================================================================

const svg = (vb, inner, cls = '') =>
  `<svg class="art ${cls}" viewBox="${vb}" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" data-draw>${inner}</svg>`;

const corazonPath = (x, y, s = 1) => {
  // corazón con la punta en (x, y + 10s)
  const p = (dx, dy) => `${(x + dx * s).toFixed(1)} ${(y + dy * s).toFixed(1)}`;
  return `M${p(0, 10)}C${p(-11, 3)} ${p(-10, -7)} ${p(-5, -7)}C${p(-2, -7)} ${p(0, -5)} ${p(0, -3)}C${p(0, -5)} ${p(2, -7)} ${p(5, -7)}C${p(10, -7)} ${p(11, 3)} ${p(0, 10)}Z`;
};
const brillo = (x, y, r = 5) => `<path d="M${x} ${y - r}V${y + r}M${x - r} ${y}H${x + r}"/>`;

export const ARTE = {
  iglesia: () => svg('0 0 120 120', `
    <path d="M12 104H108"/>
    <path d="M30 104V62L60 38L90 62V104"/>
    <path d="M52 45V24L60 16L68 24V45"/>
    <path d="M60 16V5M55 10H65"/>
    <path d="M57 35A3 3 0 0 1 63 35"/>
    <path d="M51 104V88A9 9 0 0 1 69 88V104"/>
    <path d="${corazonPath(60, 66, 0.8)}"/>
    <path d="M37 88V79A3.5 3.5 0 0 1 44 79V88M76 88V79A3.5 3.5 0 0 1 83 79V88"/>`),

  copas: () => svg('0 0 120 120', `
    <g transform="translate(42 88) rotate(12)">
      <path d="M-9 -44C-9 -16 -6 -6 0 -6C6 -6 9 -16 9 -44Z"/><path d="M-8.4 -30C-3 -28 3 -32 8.4 -30"/>
      <path d="M0 -6V20M-10 22C-5 19 5 19 10 22"/></g>
    <g transform="translate(78 88) rotate(-12)">
      <path d="M-9 -44C-9 -16 -6 -6 0 -6C6 -6 9 -16 9 -44Z"/><path d="M-8.4 -30C-3 -32 3 -28 8.4 -30"/>
      <path d="M0 -6V20M-10 22C-5 19 5 19 10 22"/></g>
    ${brillo(60, 26, 5)}<path d="M48 30L44 25M72 30L76 25"/>`),

  anillos: () => svg('0 0 120 120', `
    <circle cx="49" cy="70" r="22"/><circle cx="72" cy="70" r="22"/>
    <path d="M41 46L44 41H54L57 46L49 54Z"/><path d="M41 46H57M44 41L49 46L54 41"/>
    ${brillo(30, 38, 4)}${brillo(90, 40, 4)}`),

  camara: () => svg('0 0 120 120', `
    <path d="M24 46H44L50 37H70L76 46H96A6 6 0 0 1 102 52V88A6 6 0 0 1 96 94H24A6 6 0 0 1 18 88V52A6 6 0 0 1 24 46Z"/>
    <circle cx="60" cy="70" r="16"/>
    <path d="${corazonPath(60, 70, 0.75)}"/>
    <path d="M84 55H92"/>`),

  coctel: () => svg('0 0 120 120', `
    <path d="M30 32H90L60 64Z"/><path d="M60 64V96M44 98C52 94 68 94 76 98"/>
    <path d="M37 39H83"/>
    <circle cx="53" cy="44" r="5"/><path d="M45 26L57 48"/>
    ${brillo(94, 22, 4)}`),

  cena: () => svg('0 0 120 120', `
    <circle cx="60" cy="66" r="27"/><circle cx="60" cy="66" r="18"/>
    <path d="M22 36V54M17 36V49C17 55 27 55 27 49V36M22 54V96"/>
    <path d="M98 96V36C104 42 105 58 98 62"/>`),

  disco: () => svg('0 0 120 120', `
    <path d="M60 14V40"/>
    <circle cx="60" cy="66" r="26"/>
    <ellipse cx="60" cy="66" rx="12" ry="26"/>
    <path d="M36 56Q60 62 84 56M34 66H86M36 76Q60 70 84 76"/>
    ${brillo(94, 36, 5)}${brillo(26, 42, 4)}`),

  regalo: () => svg('0 0 120 120', `
    <path d="M26 50H94V64H26Z"/><path d="M31 64V100H89V64"/><path d="M60 50V100"/>
    <path d="M60 50C52 32 36 36 44 46C48 50 55 50 60 50C65 50 72 50 76 46C84 36 68 32 60 50Z"/>`),

  bolsa: () => svg('0 0 120 120', `
    <path d="M30 44H90L96 102H24Z"/>
    <path d="M46 52V36A14 14 0 0 1 74 36V52"/>
    <path d="${corazonPath(60, 74, 0.9)}"/>`),

  sobre: () => svg('0 0 120 120', `
    <path d="M20 40H100V94H20Z"/>
    <path d="M20 40L60 70L100 40"/><path d="M20 94L50 66M100 94L70 66"/>
    <path d="${corazonPath(60, 66, 0.7)}"/>`),

  corazon: () => svg('0 0 120 120', `
    <path d="M60 96C26 74 18 56 27 43C36 30 54 32 60 47C66 32 84 30 93 43C102 56 94 74 60 96Z"/>
    <path d="M8 104C30 100 44 104 60 104C78 104 92 100 112 104"/>`),

  calendario: () => svg('0 0 120 120', `
    <path d="M24 34H96V96H24Z"/><path d="M24 50H96"/><path d="M42 26V40M78 26V40"/>
    <path d="${corazonPath(60, 72, 0.9)}"/>`),
};

/** Corona de olivo abierta arriba: dos ramas que suben desde un lazo. */
export function corona({ r = 112, hojas = 14 } = {}) {
  const cx = 150, cy = 150;
  const hoja = 'M0 0C4.5 -6 4.5 -17 0 -24C-4.5 -17 -4.5 -6 0 0Z';
  const P = (deg) => [cx + r * Math.cos(deg * Math.PI / 180), cy + r * Math.sin(deg * Math.PI / 180)];
  const rot = (dx, dy) => Math.atan2(dx, -dy) * 180 / Math.PI; // gira la hoja (que apunta arriba) hacia (dx,dy)
  let tallos = '', piezas = '';
  [[100, 248], [80, -68]].forEach(([d0, d1]) => {
    const n = 48;
    let d = '';
    for (let i = 0; i <= n; i++) {
      const [x, y] = P(d0 + (d1 - d0) * i / n);
      d += `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    tallos += `<path d="${d}"/>`;
    const sentido = Math.sign(d1 - d0);
    for (let i = 0; i < hojas; i++) {
      const deg = d0 + (d1 - d0) * (i + 0.7) / (hojas + 0.4);
      const [x, y] = P(deg);
      // tangente en la dirección de avance
      const tx = -Math.sin(deg * Math.PI / 180) * sentido, ty = Math.cos(deg * Math.PI / 180) * sentido;
      // normal hacia afuera
      const nx = (x - cx) / r, ny = (y - cy) / r;
      const afuera = i % 2 === 0 ? 1 : -1;
      const dx = tx * 0.8 + nx * 0.6 * afuera, dy = ty * 0.8 + ny * 0.6 * afuera;
      const esc = (1.55 + 0.25 * Math.sin(i * 1.9)) * (1 - 0.3 * i / hojas);
      piezas += `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot(dx, dy).toFixed(0)}) scale(${esc.toFixed(2)})" stroke-width="${(1.7 / esc).toFixed(2)}"><path d="${hoja}"/><path d="M0 -3V-19"/></g>`;
      if (i % 4 === 1) {
        const ox = x - nx * 13 * afuera + tx * 6, oy = y - ny * 13 * afuera + ty * 6;
        piezas += `<ellipse cx="${ox.toFixed(1)}" cy="${oy.toFixed(1)}" rx="4.5" ry="6.5" transform="rotate(${rot(tx, ty).toFixed(0)} ${ox.toFixed(1)} ${oy.toFixed(1)})"/>`;
      }
    }
  });
  const lazo = `<path d="M150 266C139 256 124 259 128 270C131 278 144 274 150 266C156 274 169 278 172 270C176 259 161 256 150 266Z"/><path d="M150 266L141 288M150 266L159 288"/>`;
  return `<svg class="art art--corona" viewBox="0 0 300 300" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" data-draw data-manual>${tallos}${piezas}${lazo}</svg>`;
}

/**
 * Novios detrás de un gran corazón: él (pantalón y zapatos) a la izquierda,
 * ella (falda del vestido y tacones) a la derecha; dos manos sostienen el
 * corazón por los lados. Los nombres se escriben dentro con HTML.
 */
export function noviosCorazon() {
  const corazon = 'M150 262C84 214 30 168 28 112C26 66 62 38 98 42C124 45 142 62 150 84C158 62 176 45 202 42C238 38 274 66 272 112C270 168 216 214 150 262Z';
  return `<svg class="art art--novios" viewBox="0 0 300 390" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" data-draw data-manual>
    <defs>
      <mask id="fuera-del-corazon" maskUnits="userSpaceOnUse" x="0" y="0" width="300" height="390">
        <rect width="300" height="390" fill="#fff"/>
        <path d="${corazon}" fill="#000" stroke="#000" stroke-width="2"/>
      </mask>
    </defs>

    <path d="${corazon}"/>

    <!-- manos que sostienen el corazón -->
    <g><path class="mano" d="M29 96C18 94 12 104 15 113C17 121 23 125 30 124C36 125 42 124 42 119C42 115 39 114 37 114C41 114 43 112 43 109C43 105 40 104 37 104C41 104 42 102 42 99C42 94 35 93 29 96Z"/><path d="M31 104C33 104 35 104 37 104M31 114C33 114 35 114 37 114"/></g>
    <g transform="translate(300 0) scale(-1 1)"><path class="mano" d="M29 96C18 94 12 104 15 113C17 121 23 125 30 124C36 125 42 124 42 119C42 115 39 114 37 114C41 114 43 112 43 109C43 105 40 104 37 104C41 104 42 102 42 99C42 94 35 93 29 96Z"/><path d="M31 104C33 104 35 104 37 104M31 114C33 114 35 114 37 114"/></g>

    <g mask="url(#fuera-del-corazon)">
      <!-- él: pantalón -->
      <path class="relleno" d="M92 196L90 336H110L116 262L122 336H142L142 196Z"/>
      <path d="M116 228V262"/>
      <!-- zapatos -->
      <path class="relleno" d="M90 336C82 338 74 342 74 348H110V336Z"/>
      <path class="relleno" d="M122 336V348H156C156 342 150 338 142 336Z"/>

      <!-- ella: falda -->
      <path d="M162 196C164 250 160 300 152 338C176 348 224 348 250 334C238 296 226 250 222 196"/>
      <path d="M184 220C184 270 182 312 180 342M208 210C211 266 214 312 218 340"/>
    </g>
    <!-- ella: piernas y tacones -->
    <path d="M188 345L187 360M206 345L208 360"/>
    <path d="M176 368C179 362 184 359 188 360L196 368H176M188 360L187 372"/>
    <path d="M200 368C203 362 208 359 212 360L220 368H200M212 360L211 372"/>

    <!-- piso -->
    <path d="M60 376C110 372 190 380 240 376"/>
  </svg>`;
}

/** Marco ondulado con moños en las esquinas (para la cuenta regresiva). */
export function marcoOndulado(w = 340, h = 200) {
  const m = 14, amp = 2.6, onda = 22;
  const lado = (x1, y1, x2, y2) => {
    const len = Math.hypot(x2 - x1, y2 - y1);
    const n = Math.max(2, Math.round(len / onda));
    const ux = (x2 - x1) / len, uy = (y2 - y1) / len;
    const nx = -uy, ny = ux;
    let d = '';
    for (let i = 1; i <= n; i++) {
      const t0 = (i - 1) / n, t1 = i / n, tm = (t0 + t1) / 2;
      const s = i % 2 ? 1 : -1;
      const cx = x1 + (x2 - x1) * tm + nx * amp * 2 * s;
      const cy = y1 + (y2 - y1) * tm + ny * amp * 2 * s;
      d += `Q${cx.toFixed(1)} ${cy.toFixed(1)} ${(x1 + (x2 - x1) * t1).toFixed(1)} ${(y1 + (y2 - y1) * t1).toFixed(1)}`;
    }
    return d;
  };
  const d = `M${m} ${m}${lado(m, m, w - m, m)}${lado(w - m, m, w - m, h - m)}${lado(w - m, h - m, m, h - m)}${lado(m, h - m, m, m)}`;
  const mono = (x, y, rot) => `<g transform="translate(${x} ${y}) rotate(${rot})"><path d="M0 0C-9 -9 -15 0 -8 3C-4 5 -1 2 0 0C1 -2 6 -11 12 -4C16 2 6 4 0 0Z"/><path d="M0 0L-5 10M0 0L4 11"/></g>`;
  return `<svg class="art art--marco" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" data-draw>
    <path d="${d}" vector-effect="non-scaling-stroke"/>
    ${mono(m, m, -45)}${mono(w - m, m, 45)}${mono(w - m, h - m, 135)}${mono(m, h - m, -135)}</svg>`;
}

/** Ramita de olivo horizontal pequeña. */
export function ramita() {
  const hoja = 'M0 0C4 -5 4 -14 0 -20C-4 -14 -4 -5 0 0Z';
  const hojas = [[34, 27, 55], [52, 27, 125], [70, 26, 55], [88, 26, 125], [106, 25, 55], [124, 25, 125]]
    .map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><path d="${hoja}"/><path d="M0 -3V-15"/></g>`).join('');
  return svg('0 0 160 54', `<path d="M14 28C50 26 100 26 146 24"/>${hojas}<ellipse cx="146" cy="24" rx="4.5" ry="3.5"/>`, 'art--ramita');
}

// ---------------------------------------------------------------------
//  Animación de trazo
// ---------------------------------------------------------------------
const quieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function preparar(el) {
  if (el.dataset.ready) return;
  el.dataset.ready = '1';
  const trazos = el.querySelectorAll('path, circle, ellipse, line, polyline, rect');
  trazos.forEach((p, i) => {
    let len = 0;
    try { len = p.getTotalLength(); } catch { len = 0; }
    if (!len) return;
    const L = Math.ceil(len) + 2;
    p.style.strokeDasharray = `${L}`;
    p.style.strokeDashoffset = `${L}`;
    p.style.setProperty('--i', i);
  });
}

/** Dibuja ahora un SVG concreto (por ejemplo, el del encabezado). */
export function dibujar(el, { retraso = 0, total = 1400 } = {}) {
  if (!el || quieto()) return;
  preparar(el);
  const trazos = Array.from(el.querySelectorAll('path, circle, ellipse, line, polyline, rect')).filter((p) => p.style.strokeDasharray);
  const paso = Math.min(90, total / Math.max(1, trazos.length));
  requestAnimationFrame(() => requestAnimationFrame(() => {
    trazos.forEach((p, i) => {
      p.style.transition = `stroke-dashoffset ${Math.min(1100, 500 + p.getTotalLength() * 2.2)}ms cubic-bezier(0.65, 0, 0.35, 1) ${retraso + i * paso}ms`;
      p.style.strokeDashoffset = '0';
    });
    setTimeout(() => el.classList.add('is-drawn'), retraso + total * 0.8);
  }));
}

/** Observa todos los [data-draw] y los dibuja al entrar en pantalla. */
export function observarDibujos(root = document) {
  const items = Array.from(root.querySelectorAll('[data-draw]:not([data-manual])'));
  if (quieto() || !('IntersectionObserver' in window)) return;
  items.forEach(preparar);
  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      io.unobserve(e.target);
      dibujar(e.target, { total: 900 });
      e.target.closest('[data-reveal]')?.classList.add('is-in');
    });
  }, { rootMargin: '0px 0px -12% 0px', threshold: 0.2 });
  items.forEach((el) => io.observe(el));
}

/** Pequeña lluvia de hojas y corazones al confirmar asistencia. */
export function celebrar(origen) {
  if (quieto() || !document.body.animate) return;
  const rect = origen.getBoundingClientRect();
  const capa = document.createElement('div');
  capa.className = 'confeti';
  capa.setAttribute('aria-hidden', 'true');
  document.body.appendChild(capa);
  const formas = [
    '<svg viewBox="-12 -26 24 28"><path d="M0 0C4.5 -6 4.5 -17 0 -24C-4.5 -17 -4.5 -6 0 0Z" fill="currentColor"/></svg>',
    `<svg viewBox="-12 -10 24 22"><path d="${corazonPath(0, 0, 1)}" fill="currentColor"/></svg>`,
  ];
  const colores = ['#4F5D2F', '#6E7F43', '#A7B48A', '#C9D3B0'];
  for (let i = 0; i < 20; i++) {
    const el = document.createElement('div');
    el.className = 'confeti__p';
    el.style.color = colores[i % colores.length];
    el.innerHTML = formas[i % 2];
    el.style.left = `${rect.left + rect.width * (0.15 + Math.random() * 0.7)}px`;
    el.style.top = `${Math.max(0, rect.top + 40)}px`;
    capa.appendChild(el);
    const dx = (Math.random() - 0.5) * 180, dy = 220 + Math.random() * 260, rot = (Math.random() - 0.5) * 420;
    el.animate([
      { transform: 'translate(0,0) rotate(0deg)', opacity: 0 },
      { opacity: 1, offset: 0.15 },
      { transform: `translate(${dx}px, ${dy}px) rotate(${rot}deg)`, opacity: 0 },
    ], { duration: 1700 + Math.random() * 900, delay: Math.random() * 300, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'both' });
  }
  setTimeout(() => capa.remove(), 3400);
}

export { corazonPath };
