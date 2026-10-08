// =====================================================================
//  Bugambilias generativas (SVG). Cada rama se dibuja con una semilla,
//  así siempre se ve igual en cada visita.
// =====================================================================

const PALETA = {
  brácteas: ['#DE3466', '#DE3466', '#DE3466', '#FF98AE', '#FF98AE', '#FF9A3D', '#FDCC60'],
  hojas: ['#72892C', '#72892C', '#BAC563'],
  tallo: '#72892C',
};

// Bráctea: forma de corazón alargado con punta, base en (0,0), apunta hacia arriba.
const BRACTEA = 'M0 0C-11-6-14-20-6-28C-3-31-1-33 0-36C1-33 3-31 6-28C14-20 11-6 0 0Z';
const VENA = 'M0-2C-1-12-1-22 0-32';
const HOJA = 'M0 0C-8-8-9-26 0-40C9-26 8-8 0 0Z';

function rng(seed) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

const pick = (r, arr) => arr[Math.floor(r() * arr.length)];

function cubic(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return u * u * u * p0 + 3 * u * u * t * p1 + 3 * u * t * t * p2 + t * t * t * p3;
}
function cubicD(p0, p1, p2, p3, t) {
  const u = 1 - t;
  return 3 * u * u * (p1 - p0) + 6 * u * t * (p2 - p1) + 3 * t * t * (p3 - p2);
}

export function racimo(r, x, y, escala, color) {
  const rot = Math.round(r() * 360);
  const brs = [0, 120, 240].map((a) => {
    const j = (r() - 0.5) * 22;
    const s = 0.85 + r() * 0.25;
    return `<g transform="rotate(${a + j}) scale(${s.toFixed(2)})"><path d="${BRACTEA}" fill="${color}"/><path d="${VENA}" fill="none" stroke="#fff" stroke-opacity=".38" stroke-width="1"/></g>`;
  }).join('');
  const centro = '<circle r="2.6" fill="#FFF8E6"/><circle r="1.1" fill="#FDCC60"/>';
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) scale(${escala.toFixed(2)})"><g class="bg-racimo" style="transform:rotate(${rot}deg)">${brs}${centro}</g></g>`;
}

function hoja(r, x, y, ang, escala) {
  const c = pick(r, PALETA.hojas);
  return `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${ang.toFixed(0)}) scale(${escala.toFixed(2)})"><g class="bg-hoja"><path d="${HOJA}" fill="${c}"/><path d="M0-3V-36" stroke="#fff" stroke-opacity=".3" stroke-width="1" fill="none"/></g></g>`;
}

/**
 * Rama que cuelga a lo largo de una curva cúbica.
 * puntos: [[x0,y0],[x1,y1],[x2,y2],[x3,y3]]
 */
function rama(r, puntos, { racimos = 9, hojas = 7, escala = 1, densidadFinal = 1 } = {}) {
  const [a, b, c, d] = puntos;
  const P = (t) => [cubic(a[0], b[0], c[0], d[0], t), cubic(a[1], b[1], c[1], d[1], t)];
  const D = (t) => [cubicD(a[0], b[0], c[0], d[0], t), cubicD(a[1], b[1], c[1], d[1], t)];
  const tallo = `<path class="bg-tallo" d="M${a} C${b} ${c} ${d}" fill="none" stroke="${PALETA.tallo}" stroke-width="${(2.2 * escala).toFixed(1)}" stroke-linecap="round"/>`;
  const piezas = [];
  for (let i = 0; i < hojas; i++) {
    const t = 0.08 + (i / hojas) * 0.88 + r() * 0.04;
    const [x, y] = P(t); const [dx, dy] = D(t);
    const ang = (Math.atan2(dy, dx) * 180) / Math.PI + (i % 2 ? 60 : -120) + (r() - 0.5) * 30;
    piezas.push({ t, svg: hoja(r, x, y, ang, (0.55 + r() * 0.35) * escala) });
  }
  for (let i = 0; i < racimos; i++) {
    const t = Math.pow((i + 0.5) / racimos, densidadFinal) * 0.96 + 0.03;
    const [x, y] = P(t); const [dx, dy] = D(t);
    const len = Math.hypot(dx, dy) || 1;
    const off = (r() - 0.5) * 34 * escala;
    const nx = -dy / len, ny = dx / len;
    const s = (0.7 + r() * 0.55) * escala;
    piezas.push({ t, svg: racimo(r, x + nx * off, y + ny * off, s, pick(r, PALETA.brácteas)) });
    if (r() > 0.55) {
      const off2 = off + (r() > 0.5 ? 1 : -1) * 22 * escala;
      piezas.push({ t: t + 0.01, svg: racimo(r, x + nx * off2, y + ny * off2 + 8, s * 0.75, pick(r, PALETA.brácteas)) });
    }
  }
  piezas.sort((p, q) => p.t - q.t);
  return tallo + piezas.map((p) => `<g class="bg-pieza" data-t="${p.t.toFixed(3)}">${p.svg}</g>`).join('');
}

/** Guirnalda superior del encabezado: dos ramas que caen desde las esquinas. */
export function guirnaldaSuperior(seed = 1704) {
  const r = rng(seed);
  const izq = rama(r, [[-20, -10], [120, 40], [180, 150], [330, 175]], { racimos: 11, hojas: 8, escala: 1.15, densidadFinal: 0.8 });
  const izq2 = rama(r, [[40, -10], [60, 90], [20, 200], [70, 300]], { racimos: 6, hojas: 5, escala: 0.95 });
  const der = rama(r, [[1020, -10], [900, 50], [860, 140], [700, 160]], { racimos: 10, hojas: 8, escala: 1.1, densidadFinal: 0.8 });
  const der2 = rama(r, [[975, -10], [960, 80], [1000, 170], [950, 260]], { racimos: 6, hojas: 4, escala: 0.9 });
  return `<svg class="bg-svg" viewBox="0 0 1000 320" preserveAspectRatio="xMidYMin slice" role="presentation" focusable="false">${izq}${izq2}${der}${der2}</svg>`;
}

/** Versión vertical para teléfonos: las ramas caen por las dos esquinas. */
export function guirnaldaMovil(seed = 2027) {
  const r = rng(seed);
  const izq = rama(r, [[-15, -10], [80, 50], [120, 140], [215, 175]], { racimos: 9, hojas: 6, escala: 0.95, densidadFinal: 0.85 });
  const izq2 = rama(r, [[22, -10], [8, 110], [50, 210], [26, 330]], { racimos: 6, hojas: 5, escala: 0.85 });
  const der = rama(r, [[415, -10], [335, 40], [315, 110], [245, 135]], { racimos: 8, hojas: 5, escala: 0.9, densidadFinal: 0.85 });
  const der2 = rama(r, [[382, -10], [400, 100], [355, 190], [378, 290]], { racimos: 5, hojas: 4, escala: 0.85 });
  return `<svg class="bg-svg" viewBox="0 0 400 370" preserveAspectRatio="xMidYMin slice" role="presentation" focusable="false">${izq}${izq2}${der}${der2}</svg>`;
}

/** Ramita pequeña horizontal para separar o cerrar secciones. */
export function ramita(seed = 27, ancho = 360) {
  const r = rng(seed);
  const h = ancho * 0.28;
  const g = rama(r, [[10, h * 0.55], [ancho * 0.3, h * 0.2], [ancho * 0.6, h * 0.95], [ancho - 10, h * 0.5]], { racimos: 6, hojas: 5, escala: 0.62 });
  return `<svg class="bg-svg" viewBox="0 0 ${ancho} ${h.toFixed(0)}" role="presentation" focusable="false">${g}</svg>`;
}

/** Un solo racimo, para marcadores del itinerario o el favicon. */
export function racimoSolo(seed = 3, color = '#DE3466') {
  const r = rng(seed);
  return `<svg class="bg-svg" viewBox="-40 -40 80 80" role="presentation" focusable="false">${racimo(r, 0, 0, 1, color)}</svg>`;
}

const prefiereQuieto = () => window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/** La animación de entrada: el tallo se dibuja y las bugambilias se abren a lo largo. */
export function florecer(svg, { retraso = 150, duracion = 1500 } = {}) {
  if (!svg || prefiereQuieto() || !svg.animate) return;
  svg.querySelectorAll('.bg-tallo').forEach((p) => {
    const L = p.getTotalLength();
    p.style.strokeDasharray = `${L}`;
    p.animate([{ strokeDashoffset: L }, { strokeDashoffset: 0 }], {
      duration: duracion, delay: retraso, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards',
    });
  });
  svg.querySelectorAll('.bg-pieza').forEach((g) => {
    const t = parseFloat(g.dataset.t);
    const inner = g.querySelector('.bg-racimo, .bg-hoja');
    if (!inner) return;
    inner.style.transformBox = 'fill-box';
    inner.style.transformOrigin = 'center';
    const base = inner.style.transform || '';
    inner.animate(
      [
        { opacity: 0, transform: `${base} scale(.55) rotate(-28deg)` },
        { opacity: 1, transform: `${base} scale(1) rotate(0deg)` },
      ],
      { duration: 700, delay: retraso + t * duracion * 0.85, easing: 'cubic-bezier(0.23, 1, 0.32, 1)', fill: 'backwards' }
    );
  });
}

/** Lluvia de brácteas al confirmar asistencia (momento único, poco frecuente). */
export function lluviaDePetalos(origen) {
  if (prefiereQuieto() || !document.body.animate) return;
  const rect = origen.getBoundingClientRect();
  const r = rng(Date.now() & 0xffff);
  const capa = document.createElement('div');
  capa.className = 'petal-rain';
  capa.setAttribute('aria-hidden', 'true');
  document.body.appendChild(capa);
  const N = 22;
  for (let i = 0; i < N; i++) {
    const color = pick(r, PALETA.brácteas);
    const el = document.createElement('div');
    el.className = 'petal';
    el.innerHTML = `<svg viewBox="-16 -38 32 40"><path d="${BRACTEA}" fill="${color}"/></svg>`;
    const x0 = rect.left + rect.width * (0.1 + r() * 0.8);
    const y0 = Math.max(0, rect.top) - 20;
    el.style.left = `${x0}px`;
    el.style.top = `${y0}px`;
    capa.appendChild(el);
    const caida = 260 + r() * 320;
    const deriva = (r() - 0.5) * 160;
    const giro = (r() - 0.5) * 540;
    el.animate(
      [
        { transform: 'translate(0,0) rotate(0deg) scale(.9)', opacity: 0 },
        { opacity: 1, offset: 0.12 },
        { transform: `translate(${deriva}px, ${caida}px) rotate(${giro}deg) scale(1)`, opacity: 0 },
      ],
      { duration: 1800 + r() * 900, delay: r() * 380, easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', fill: 'both' }
    );
  }
  setTimeout(() => capa.remove(), 3600);
}
