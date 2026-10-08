// =====================================================================
//  Invitación: render de contenido, cuenta regresiva y confirmación
// =====================================================================
import { CONFIG } from './config.js';
import { getInvitation, submitRsvp, isDemo } from './data.js';
import { icon } from './icons.js';
import { ARTE, noviosCorazon, marcoOndulado, ramita, dibujar, observarDibujos, celebrar, corazonPath } from './ilustraciones.js';

const $ = (sel, root = document) => root.querySelector(sel);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const get = (obj, path) => path.split('.').reduce((o, k) => (o ? o[k] : undefined), obj);

const params = new URLSearchParams(location.search);
const slug = (params.get('id') || '').trim().toLowerCase();

// ---------------------------------------------------------------------
//  Contenido fijo desde config.js
// ---------------------------------------------------------------------
function renderStatic() {
  document.querySelectorAll('[data-bind]').forEach((el) => {
    const v = get(CONFIG, el.dataset.bind);
    if (v) el.textContent = v;
  });
  document.title = `${CONFIG.novia} & ${CONFIG.novio} | ${CONFIG.fechaTexto.replace(/^\S+\s/, '')}`;

  // Encabezado: los novios detrás de un corazón, que se dibujan al cargar
  const novios = $('#novios');
  novios.innerHTML = noviosCorazon();
  dibujar(novios.querySelector('svg'), { retraso: 100, total: 1600 });

  // Marco ondulado de la cuenta regresiva, ajustado al tamaño real
  const marco = $('#marco');
  const pintarMarco = () => {
    const { width, height } = marco.getBoundingClientRect();
    if (!width) return;
    const yaDibujado = marco.querySelector('svg')?.dataset.ready;
    marco.innerHTML = marcoOndulado(Math.round(width), Math.round(height));
    if (yaDibujado) marco.querySelector('svg').removeAttribute('data-draw');
  };
  pintarMarco();
  let anchoPrevio = marco.getBoundingClientRect().width;
  new ResizeObserver(() => {
    const w = marco.getBoundingClientRect().width;
    if (Math.abs(w - anchoPrevio) > 2) { anchoPrevio = w; marco.querySelector('svg').dataset.ready = '1'; pintarMarco(); }
  }).observe(marco);

  $('#ramita-eventos').innerHTML = ramita();
  $('#arte-sobre').innerHTML = ARTE.sobre();
  $('#arte-cierre').innerHTML = ARTE.corazon();

  const evento = (e, arte) => `
    <div class="event__art">${ARTE[arte]()}</div>
    <h3>${esc(e.titulo)}</h3>
    <p class="event__time">${esc(e.hora)}</p>
    <p class="event__place">${esc(e.lugar)}</p>
    <p class="event__zone">${esc(e.zona)}</p>
    <a class="btn btn--soft" href="${esc(e.mapa)}" target="_blank" rel="noopener">${icon('map-pin')}Cómo llegar</a>`;
  $('#ev-ceremonia').innerHTML = evento(CONFIG.ceremonia, 'iglesia');
  $('#ev-recepcion').innerHTML = evento(CONFIG.recepcion, 'copas');

  const cal = $('#btn-calendario');
  cal.innerHTML = `${icon('calendar-plus')}Agregar al calendario`;
  cal.addEventListener('click', descargarCalendario);

  const corazonLleno = `<svg class="timeline__heart" viewBox="-12 -10 24 22" aria-hidden="true"><path d="${corazonPath(0, 0, 1)}" fill="currentColor"/></svg>`;
  if (CONFIG.mostrarItinerario && CONFIG.itinerario?.length) {
    $('#lista-itinerario').innerHTML = CONFIG.itinerario.map((it) => `
      <li data-reveal>
        <span class="timeline__art">${(ARTE[it.icono] || ARTE.corazon)()}</span>
        ${corazonLleno}
        <span class="timeline__text">
          <span class="timeline__time">${esc(it.hora)}</span>
          <span class="timeline__what">${esc(it.actividad)}</span>
        </span>
      </li>`).join('');
  } else {
    $('#itinerario').remove();
  }

  $('#lista-regalos').innerHTML = CONFIG.regalos.map((g) => {
    const accion = g.enlace
      ? `<a class="gift__link" href="${esc(g.enlace)}" target="_blank" rel="noopener">Ver mesa de regalos</a>`
      : g.pendiente ? '<span class="gift__pending">Disponible próximamente</span>' : '';
    return `<li class="gift"><span class="gift__art">${(ARTE[g.icono] || ARTE.regalo)()}</span><div><p class="gift__name">${esc(g.nombre)}</p><p class="gift__detail">${esc(g.detalle)}</p>${accion}</div></li>`;
  }).join('');

  observarDibujos();
}

// ---------------------------------------------------------------------
//  Cuenta regresiva
// ---------------------------------------------------------------------
function iniciarCuenta() {
  const objetivo = new Date(CONFIG.fechaISO).getTime();
  const nums = {};
  document.querySelectorAll('.countdown__num').forEach((el) => (nums[el.dataset.u] = el));
  const pad = (n) => String(n).padStart(2, '0');

  const tick = () => {
    const diff = objetivo - Date.now();
    if (diff <= 0) {
      $('#cuenta').hidden = true;
      $('#t-faltan').hidden = true;
      const fin = $('#cuenta-fin');
      const despues = diff < -24 * 3600e3;
      fin.textContent = despues ? 'Gracias por acompañarnos' : '¡Hoy es el gran día!';
      fin.hidden = false;
      return false;
    }
    const s = Math.floor(diff / 1000);
    nums.d.textContent = Math.floor(s / 86400);
    nums.h.textContent = pad(Math.floor((s % 86400) / 3600));
    nums.m.textContent = pad(Math.floor((s % 3600) / 60));
    nums.s.textContent = pad(s % 60);
    return true;
  };
  if (tick()) {
    const id = setInterval(() => { if (!tick()) clearInterval(id); }, 1000);
  }
  // Etiqueta accesible estática (no anunciar cada segundo)
  const d = Math.max(0, Math.ceil((objetivo - Date.now()) / 864e5));
  $('#cuenta').setAttribute('aria-label', `Faltan ${d} días para la boda`);
}

// ---------------------------------------------------------------------
//  Calendario (.ics)
// ---------------------------------------------------------------------
function descargarCalendario() {
  const inicio = new Date(CONFIG.fechaISO);
  const fin = new Date(inicio.getTime() + 12 * 3600e3); // hasta las 2:00 AM
  const f = (d) => d.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '');
  const txt = (s) => String(s).replace(/([,;\\])/g, '\\$1').replace(/\n/g, '\\n');
  const ics = [
    'BEGIN:VCALENDAR', 'VERSION:2.0', 'PRODID:-//Boda Pamela y Luis//ES', 'CALSCALE:GREGORIAN', 'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `UID:boda-${f(inicio)}@pamela-luis`,
    `DTSTAMP:${f(new Date())}`,
    `DTSTART:${f(inicio)}`,
    `DTEND:${f(fin)}`,
    `SUMMARY:${txt(`Boda de ${CONFIG.novia} y ${CONFIG.novio}`)}`,
    `LOCATION:${txt(`${CONFIG.ceremonia.lugar}, ${CONFIG.ceremonia.zona}`)}`,
    `DESCRIPTION:${txt(`Ceremonia ${CONFIG.ceremonia.hora} en ${CONFIG.ceremonia.lugar} (${CONFIG.ceremonia.mapa}).\nRecepción ${CONFIG.recepcion.hora} en ${CONFIG.recepcion.lugar} (${CONFIG.recepcion.mapa}).`)}`,
    'BEGIN:VALARM', 'TRIGGER:-P1D', 'ACTION:DISPLAY', 'DESCRIPTION:Mañana es la boda de Pamela y Luis', 'END:VALARM',
    'END:VEVENT', 'END:VCALENDAR',
  ].join('\r\n');
  const blob = new Blob([ics], { type: 'text/calendar;charset=utf-8' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = 'boda-pamela-luis.ics';
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

// ---------------------------------------------------------------------
//  Confirmación de asistencia
// ---------------------------------------------------------------------
const root = () => $('#rsvp');
const boletosTxt = (n) => `${n} ${n === 1 ? 'boleto' : 'boletos'}`;

function fechaLimitePasada() {
  if (!CONFIG.fechaLimiteConfirmacion) return false;
  const limite = new Date(`${CONFIG.fechaLimiteConfirmacion}T23:59:59-06:00`);
  return Date.now() > limite.getTime();
}
function fechaLimiteTexto() {
  if (!CONFIG.fechaLimiteConfirmacion) return '';
  const d = new Date(`${CONFIG.fechaLimiteConfirmacion}T12:00:00-06:00`);
  return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', timeZone: 'America/Mexico_City' });
}

function renderSinEnlace() {
  root().innerHTML = `
    <div class="rsvp__state">
      <p>Para confirmar, abre el enlace personal que te enviamos por WhatsApp. Cada enlace ya trae los boletos de tu familia.</p>
      <p class="quote">¿No lo encuentras? Escríbenos y te lo mandamos de nuevo.</p>
    </div>`;
}

function renderCargando() {
  root().innerHTML = `<div class="skeleton" aria-label="Cargando tu invitación"><span style="width:60%"></span><span style="width:40%"></span><span style="width:80%;height:3.5rem"></span><span style="width:80%;height:3.5rem"></span></div>`;
}

function renderNoEncontrada() {
  root().innerHTML = `
    <div class="rsvp__state">
      <p class="big">No encontramos esta invitación</p>
      <p>Revisa que el enlace esté completo, tal como lo recibiste. Si el problema sigue, escríbenos para enviarte uno nuevo.</p>
    </div>`;
}

function renderError(msg) {
  root().innerHTML = `
    <div class="rsvp__state">
      <p class="big">No pudimos cargar tu invitación</p>
      <p>${esc(msg)}</p>
      <div class="actions"><button class="btn btn--ghost" type="button" id="reintentar">Intentar de nuevo</button></div>
    </div>`;
  $('#reintentar').addEventListener('click', cargarInvitacion);
}

function encabezadoFamilia(inv) {
  return `
    <p class="rsvp__lead">
      <span class="rsvp__family">${esc(inv.nombre)}</span>
      <span class="rsvp__tickets">${icon('users')}Esta invitación contiene <strong>${boletosTxt(inv.boletos)}</strong></span>
    </p>`;
}

function renderRespuesta(inv, { recienEnviada = false } = {}) {
  const plural = inv.boletos > 1;
  const cerrado = fechaLimitePasada();
  let titulo, texto;
  if (inv.estado === 'asiste') {
    titulo = recienEnviada ? '¡Gracias por confirmar!' : 'Tu asistencia está confirmada';
    texto = inv.boletos > 1
      ? `Reservamos <strong>${boletosTxt(inv.boletos_confirmados)}</strong> de ${inv.boletos}. Te esperamos el 17 de abril.`
      : 'Reservamos tu lugar. Te esperamos el 17 de abril.';
  } else {
    titulo = recienEnviada ? 'Gracias por avisarnos' : 'Nos avisaste que no podrás venir';
    texto = plural ? 'Los vamos a extrañar. Gracias por acompañarnos desde lejos.' : 'Te vamos a extrañar. Gracias por acompañarnos desde lejos.';
  }
  root().innerHTML = `
    ${encabezadoFamilia(inv)}
    <div class="rsvp__state">
      <div class="seal" aria-hidden="true">${inv.estado === 'asiste' ? ARTE.anillos() : ARTE.corazon()}</div>
      <p class="big" tabindex="-1" id="rsvp-titulo">${titulo}</p>
      <p>${texto}</p>
      ${inv.mensaje ? `<p class="quote">“${esc(inv.mensaje)}”</p>` : ''}
      <div class="actions">
        ${inv.estado === 'asiste' ? `<button class="btn btn--ghost" type="button" id="r-cal">${icon('calendar-plus')}Agregar al calendario</button>` : ''}
        ${cerrado ? '' : '<button class="btn btn--quiet" type="button" id="r-cambiar">Cambiar mi respuesta</button>'}
      </div>
      ${cerrado ? `<p class="quote">La fecha para confirmar terminó el ${fechaLimiteTexto()}. Si necesitas cambiar algo, escríbenos.</p>` : ''}
    </div>`;
  $('#r-cal')?.addEventListener('click', descargarCalendario);
  const sello = $('.seal svg', root());
  if (sello) { sello.setAttribute('data-manual', ''); if (recienEnviada) dibujar(sello, { total: 700 }); }
  $('#r-cambiar')?.addEventListener('click', () => renderFormulario(inv));
  if (recienEnviada) {
    $('#rsvp-titulo').focus({ preventScroll: true });
    if (inv.estado === 'asiste') celebrar($('#confirmar'));
  }
}

function renderFormulario(inv) {
  const plural = inv.boletos > 1;
  const yaRespondio = inv.estado !== 'pendiente';
  const inicialAsiste = inv.estado === 'asiste' ? 'si' : inv.estado === 'no_asiste' ? 'no' : '';
  let cuantos = inv.estado === 'asiste' ? inv.boletos_confirmados : inv.boletos;

  root().innerHTML = `
    ${encabezadoFamilia(inv)}
    <form novalidate>
      <fieldset class="field">
        <legend>${plural ? '¿Nos acompañarán?' : '¿Nos acompañarás?'}</legend>
        <div class="choice">
          <input type="radio" name="asiste" id="asiste-si" value="si" ${inicialAsiste === 'si' ? 'checked' : ''}>
          <label for="asiste-si">${plural ? 'Sí, ahí estaremos' : 'Sí, ahí estaré'}</label>
          <input type="radio" name="asiste" id="asiste-no" value="no" ${inicialAsiste === 'no' ? 'checked' : ''}>
          <label for="asiste-no">${plural ? 'No podremos ir' : 'No podré ir'}</label>
        </div>
      </fieldset>

      ${plural ? `
      <div class="field count" id="bloque-cuantos" ${inicialAsiste === 'si' ? '' : 'hidden'}>
        <label id="lbl-cuantos" for="cuantos">¿Cuántos boletos van a ocupar?</label>
        <div class="stepper" role="group" aria-labelledby="lbl-cuantos">
          <button type="button" id="menos" aria-label="Quitar un boleto">${icon('minus')}</button>
          <output id="cuantos" aria-live="polite">${cuantos}</output>
          <button type="button" id="mas" aria-label="Agregar un boleto">${icon('plus')}</button>
        </div>
        <p class="count__of">de ${boletosTxt(inv.boletos)}</p>
      </div>` : ''}

      <div class="field">
        <label for="mensaje">Mensaje para los novios <span class="field__opt">(opcional)</span></label>
        <textarea id="mensaje" name="mensaje" maxlength="500" rows="4" placeholder="Unas palabras para Pamela y Luis">${esc(inv.mensaje || '')}</textarea>
        <p class="field__counter" id="contador" aria-live="off"></p>
      </div>

      <button class="btn btn--primary" type="submit" id="enviar">${yaRespondio ? 'Guardar cambios' : 'Enviar confirmación'}</button>
      <p class="form-error" id="error" role="alert"></p>
      ${CONFIG.fechaLimiteConfirmacion ? `<p class="field__help">Puedes confirmar hasta el ${fechaLimiteTexto()}.</p>` : ''}
    </form>`;

  const form = $('form', root());
  const bloque = $('#bloque-cuantos');
  const out = $('#cuantos');
  const menos = $('#menos');
  const mas = $('#mas');
  const err = $('#error');
  const msg = $('#mensaje');
  const contador = $('#contador');

  const pintar = () => {
    if (!out) return;
    out.textContent = cuantos;
    menos.disabled = cuantos <= 1;
    mas.disabled = cuantos >= inv.boletos;
  };
  pintar();
  menos?.addEventListener('click', () => { cuantos = Math.max(1, cuantos - 1); pintar(); });
  mas?.addEventListener('click', () => { cuantos = Math.min(inv.boletos, cuantos + 1); pintar(); });

  const contar = () => { const n = msg.value.length; contador.textContent = n > 380 ? `${n} de 500` : ''; };
  msg.addEventListener('input', contar); contar();

  form.addEventListener('change', (e) => {
    if (e.target.name !== 'asiste') return;
    err.textContent = '';
    if (bloque) bloque.hidden = e.target.value !== 'si';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const eleccion = form.asiste.value;
    if (!eleccion) {
      err.textContent = plural ? 'Elige si podrán acompañarnos.' : 'Elige si podrás acompañarnos.';
      $('#asiste-si').focus();
      return;
    }
    const btn = $('#enviar');
    const original = btn.innerHTML;
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner" aria-hidden="true"></span>Enviando';
    err.textContent = '';
    try {
      const actualizada = await submitRsvp(slug, {
        asiste: eleccion === 'si',
        boletos: plural ? cuantos : 1,
        mensaje: msg.value,
      });
      renderRespuesta({ ...inv, ...actualizada }, { recienEnviada: true });
    } catch (ex) {
      btn.disabled = false;
      btn.innerHTML = original;
      err.textContent = ex.message || 'No pudimos guardar tu respuesta. Intenta de nuevo.';
    }
  });
}

async function cargarInvitacion() {
  if (!slug) { renderSinEnlace(); return; }
  renderCargando();
  try {
    const inv = await getInvitation(slug);
    if (!inv) { renderNoEncontrada(); return; }

    $('#destinatario-nombre').textContent = inv.nombre;
    $('#destinatario').hidden = false;

    if (inv.estado === 'pendiente' && !fechaLimitePasada()) renderFormulario(inv);
    else if (inv.estado === 'pendiente') {
      root().innerHTML = `${encabezadoFamilia(inv)}<div class="rsvp__state"><p class="big">La confirmación ya cerró</p><p>La fecha para confirmar fue el ${fechaLimiteTexto()}. Si aún quieres avisarnos algo, escríbenos directamente.</p></div>`;
    } else renderRespuesta(inv);
  } catch (ex) {
    renderError(ex.message);
  }
}

// ---------------------------------------------------------------------
renderStatic();
iniciarCuenta();
cargarInvitacion();
if (isDemo) console.info('[Boda] Modo demo: las confirmaciones se guardan solo en este navegador. Configura Supabase en js/config.js.');
