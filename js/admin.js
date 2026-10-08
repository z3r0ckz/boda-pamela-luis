// =====================================================================
//  Panel de control de invitados
// =====================================================================
import { CONFIG } from './config.js';
import { admin, isDemo, invitationUrl, resetDemo, slugify } from './data.js';
import { icon } from './icons.js';
import { ARTE } from './ilustraciones.js';

const XLSX_CDN = 'https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js';

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const boletosTxt = (n) => `${n} ${n === 1 ? 'boleto' : 'boletos'}`;
const fmtFecha = (iso) => iso ? new Date(iso).toLocaleDateString('es-MX', { day: 'numeric', month: 'short', timeZone: 'America/Mexico_City' }) : '';

const state = { rows: [], filtro: 'todas', q: '', editando: null, borrando: null, importables: [] };

// ---------------------------------------------------------------------
//  Avisos
// ---------------------------------------------------------------------
function toast(texto, ico = 'check') {
  const el = document.createElement('div');
  el.className = 'toast';
  el.innerHTML = `${icon(ico)}<span>${esc(texto)}</span>`;
  $('#toasts').appendChild(el);
  setTimeout(() => { el.classList.add('is-leaving'); setTimeout(() => el.remove(), 200); }, 3200);
}

// ---------------------------------------------------------------------
//  Arranque y sesión
// ---------------------------------------------------------------------
async function init() {
  $('#marca').innerHTML = ARTE.anillos();
  $('#ico-buscar').outerHTML = icon('magnifying-glass');
  $('#btn-nueva').innerHTML = `${icon('plus')}Nueva invitación`;
  $('#btn-importar').innerHTML = `${icon('upload-simple')}Importar lista`;
  $('#btn-excel').innerHTML = `${icon('download-simple')}Descargar Excel`;
  $('#btn-salir').innerHTML = `${icon('sign-out')}<span>Salir</span>`;

  if (isDemo) {
    $('#demo-badge').hidden = false;
    $('#demo-note').hidden = false;
  }
  bindEvents();

  try {
    const session = await admin.getSession();
    if (session) mostrarPanel(); else mostrarLogin();
  } catch (e) {
    mostrarLogin(e.message);
  }
}

function mostrarLogin(msg) {
  $('#vista-panel').hidden = true;
  $('#btn-salir').hidden = true;
  $('#vista-login').hidden = false;
  if (msg) $('#login-error').textContent = msg;
  $('#form-login [name=email]').focus();
}

let unsubscribe = null;
async function mostrarPanel() {
  $('#vista-login').hidden = true;
  $('#vista-panel').hidden = false;
  $('#btn-salir').hidden = isDemo;
  renderCargando();
  await cargar();
  unsubscribe?.();
  unsubscribe = await admin.subscribe(onCambio);
}

async function cargar({ silencioso = false } = {}) {
  try {
    const anteriores = state.rows;
    state.rows = await admin.list();
    if (silencioso) avisarCambios(anteriores, state.rows);
    render();
  } catch (e) {
    $('#filas').innerHTML = '';
    mostrarVacio(`<strong>No se pudo cargar la lista</strong><p>${esc(e.message)}</p><button class="btn btn--ghost btn--sm" type="button" id="reintentar">Intentar de nuevo</button>`);
    $('#reintentar')?.addEventListener('click', () => cargar());
  }
}

let recarga = null;
function onCambio() {
  clearTimeout(recarga);
  recarga = setTimeout(() => cargar({ silencioso: true }), 250);
}

function avisarCambios(antes, despues) {
  const mapa = new Map(antes.map((r) => [r.id, r]));
  const nuevos = new Set();
  despues.forEach((r) => {
    const a = mapa.get(r.id);
    if (!a) return;
    if (a.respondido_at !== r.respondido_at && r.estado !== 'pendiente') {
      nuevos.add(r.id);
      if (r.estado === 'asiste') toast(`${r.nombre} confirmó ${boletosTxt(r.boletos_confirmados)}`, 'check');
      else toast(`${r.nombre} avisó que no podrá asistir`, 'envelope-simple');
    }
  });
  state.resaltar = nuevos;
}

// ---------------------------------------------------------------------
//  Render
// ---------------------------------------------------------------------
function calcular(rows) {
  const s = { inv: rows.length, boletos: 0, si: 0, no: 0, pend: 0, resp: 0, porEstado: { asiste: 0, no_asiste: 0, pendiente: 0 } };
  rows.forEach((r) => {
    s.boletos += r.boletos;
    s.porEstado[r.estado] = (s.porEstado[r.estado] || 0) + 1;
    if (r.estado === 'asiste') { s.si += r.boletos_confirmados; s.no += r.boletos - r.boletos_confirmados; s.resp++; }
    else if (r.estado === 'no_asiste') { s.no += r.boletos; s.resp++; }
    else s.pend += r.boletos;
  });
  return s;
}

function render() {
  const s = calcular(state.rows);
  $('#s-confirmados').textContent = s.si;
  $('#s-boletos').textContent = s.boletos;
  $('#l-si').textContent = s.si;
  $('#l-no').textContent = s.no;
  $('#l-pend').textContent = s.pend;
  $('#s-inv').textContent = s.inv;
  $('#s-resp').textContent = s.resp;
  $('#s-faltan').textContent = s.inv - s.resp;
  const total = s.boletos || 1;
  $('#m-si').style.flexGrow = s.si / total; $('#m-si').style.flexBasis = '0';
  $('#m-no').style.flexGrow = s.no / total; $('#m-no').style.flexBasis = '0';
  $('#m-pend').style.flexGrow = s.pend / total; $('#m-pend').style.flexBasis = '0';
  $('#meter').setAttribute('aria-label', `${s.si} boletos confirmados, ${s.no} no asistirán, ${s.pend} sin responder, de ${s.boletos} en total`);

  $('[data-c=todas]').textContent = s.inv;
  $('[data-c=asiste]').textContent = s.porEstado.asiste;
  $('[data-c=no_asiste]').textContent = s.porEstado.no_asiste;
  $('[data-c=pendiente]').textContent = s.porEstado.pendiente;

  renderTabla();
  renderMensajes();
}

function filtradas() {
  const q = slugify(state.q);
  return state.rows.filter((r) =>
    (state.filtro === 'todas' || r.estado === state.filtro) &&
    (!q || slugify(r.nombre).includes(q) || slugify(r.notas || '').includes(q)));
}

function badge(r) {
  if (r.estado === 'asiste') {
    const sub = r.boletos > 1 ? `<span class="badge-sub">${r.boletos_confirmados} de ${r.boletos} boletos · ${fmtFecha(r.respondido_at)}</span>` : `<span class="badge-sub">${fmtFecha(r.respondido_at)}</span>`;
    return `<span class="badge badge--si">${icon('check')}Asistirán</span>${sub}`;
  }
  if (r.estado === 'no_asiste') return `<span class="badge badge--no">${icon('x')}No asistirán</span><span class="badge-sub">${fmtFecha(r.respondido_at)}</span>`;
  return '<span class="badge badge--pend">Sin responder</span>';
}

function renderTabla() {
  const rows = filtradas();
  const tbody = $('#filas');
  if (!state.rows.length) {
    tbody.innerHTML = '';
    mostrarVacio(`<strong>Aún no hay invitaciones</strong><p>Crea la primera con el nombre de la familia y cuántos boletos le corresponden. Se generará un enlace único para enviarle por WhatsApp.</p><button class="btn btn--primary btn--sm" type="button" data-accion="nueva-vacio">${icon('plus')}Nueva invitación</button>`);
    return;
  }
  if (!rows.length) {
    tbody.innerHTML = '';
    mostrarVacio(`<strong>Sin resultados</strong><p>Ninguna invitación coincide con la búsqueda o el filtro.</p><button class="btn btn--ghost btn--sm" type="button" data-accion="limpiar">Ver todas</button>`);
    return;
  }
  $('#vacio').hidden = true;
  tbody.innerHTML = rows.map((r) => `
    <tr data-id="${esc(r.id)}" class="${state.resaltar?.has(r.id) ? 'is-new' : ''}">
      <td class="cell-name"><strong>${esc(r.nombre)}</strong>${r.notas ? `<small>${esc(r.notas)}</small>` : ''}</td>
      <td class="cell-tickets num">${boletosTxt(r.boletos)}</td>
      <td class="cell-status">${badge(r)}</td>
      <td class="cell-msg">${r.mensaje ? `<p title="${esc(r.mensaje)}">“${esc(r.mensaje)}”</p>` : ''}</td>
      <td class="cell-actions">
        <div class="row-actions">
          <button class="icon-btn" type="button" data-accion="copiar" title="Copiar enlace" aria-label="Copiar enlace de ${esc(r.nombre)}">${icon('copy')}</button>
          <button class="icon-btn icon-btn--wa" type="button" data-accion="whatsapp" title="Enviar por WhatsApp" aria-label="Enviar por WhatsApp a ${esc(r.nombre)}">${icon('whatsapp-logo')}</button>
          <button class="icon-btn" type="button" data-accion="editar" title="Editar" aria-label="Editar ${esc(r.nombre)}">${icon('pencil-simple')}</button>
          <button class="icon-btn icon-btn--del" type="button" data-accion="eliminar" title="Eliminar" aria-label="Eliminar ${esc(r.nombre)}">${icon('trash')}</button>
        </div>
      </td>
    </tr>`).join('');
  state.resaltar = null;
}

function renderCargando() {
  $('#vacio').hidden = true;
  $('#filas').innerHTML = Array.from({ length: 4 }, () =>
    `<tr class="skeleton-row"><td><span style="width:70%"></span></td><td><span style="width:60%;margin-left:auto"></span></td><td><span style="width:50%"></span></td><td><span style="width:80%"></span></td><td></td></tr>`).join('');
}

function mostrarVacio(html) {
  const v = $('#vacio');
  v.innerHTML = html;
  v.hidden = false;
}

function renderMensajes() {
  const conMensaje = state.rows.filter((r) => r.mensaje && r.estado !== 'pendiente')
    .sort((a, b) => String(b.respondido_at).localeCompare(String(a.respondido_at)));
  $('#mensajes').innerHTML = conMensaje.length
    ? conMensaje.map((r) => `<figure class="msg"><blockquote>“${esc(r.mensaje)}”</blockquote><figcaption>${esc(r.nombre)}, ${fmtFecha(r.respondido_at)}</figcaption></figure>`).join('')
    : '<div class="empty"><p>Cuando sus invitados confirmen y les dejen unas palabras, aparecerán aquí.</p></div>';
}

// ---------------------------------------------------------------------
//  Acciones por fila
// ---------------------------------------------------------------------
async function copiar(texto) {
  try { await navigator.clipboard.writeText(texto); return true; } catch {
    const ta = document.createElement('textarea');
    ta.value = texto; ta.style.position = 'fixed'; ta.style.opacity = '0';
    document.body.appendChild(ta); ta.select();
    const ok = document.execCommand('copy'); ta.remove(); return ok;
  }
}

function enlaceWhatsApp(r) {
  const texto = CONFIG.mensajeWhatsApp
    .replaceAll('{familia}', r.nombre)
    .replaceAll('{boletos}', boletosTxt(r.boletos))
    .replaceAll('{enlace}', invitationUrl(r.slug));
  let tel = String(r.telefono || '').replace(/\D/g, '');
  if (tel.length === 10) tel = `52${tel}`;
  return `https://wa.me/${tel}?text=${encodeURIComponent(texto)}`;
}

async function accionFila(accion, id) {
  const r = state.rows.find((x) => String(x.id) === String(id));
  if (!r) return;
  if (accion === 'copiar') {
    const ok = await copiar(invitationUrl(r.slug));
    toast(ok ? `Enlace de ${r.nombre} copiado` : 'No se pudo copiar el enlace', ok ? 'copy' : 'x');
  } else if (accion === 'whatsapp') {
    window.open(enlaceWhatsApp(r), '_blank', 'noopener');
  } else if (accion === 'editar') {
    abrirDialogo(r);
  } else if (accion === 'eliminar') {
    state.borrando = r;
    $('#del-texto').innerHTML = `Se borrará la invitación de <strong>${esc(r.nombre)}</strong> y su enlace dejará de funcionar. Esta acción no se puede deshacer.`;
    $('#dlg-del').showModal();
  }
}

// ---------------------------------------------------------------------
//  Crear / editar
// ---------------------------------------------------------------------
function abrirDialogo(r = null) {
  state.editando = r;
  const f = $('#form-inv');
  f.reset();
  $$('.fld__err', f).forEach((e) => (e.textContent = ''));
  $$('[aria-invalid]', f).forEach((e) => e.removeAttribute('aria-invalid'));
  $('#inv-error').textContent = '';
  $('#dlg-inv-t').textContent = r ? 'Editar invitación' : 'Nueva invitación';
  $('#inv-guardar').textContent = r ? 'Guardar cambios' : 'Crear invitación';
  $('#grupo-respuesta').hidden = !r;
  if (r) {
    f.nombre.value = r.nombre;
    f.boletos.value = r.boletos;
    f.telefono.value = r.telefono || '';
    f.notas.value = r.notas || '';
    f.estado.value = r.estado;
    f.boletos_confirmados.value = r.estado === 'asiste' ? r.boletos_confirmados : r.boletos;
  } else {
    f.boletos.value = 2;
  }
  syncConfirmados();
  $('#dlg-inv').showModal();
  f.nombre.focus();
}

function syncConfirmados() {
  const f = $('#form-inv');
  const visible = f.estado.value === 'asiste';
  $('#fld-confirmados').style.visibility = visible ? 'visible' : 'hidden';
  f.boletos_confirmados.max = f.boletos.value || 30;
}

async function guardarInvitacion(e) {
  e.preventDefault();
  const f = $('#form-inv');
  const nombre = f.nombre.value.trim();
  const boletos = parseInt(f.boletos.value, 10);
  let valido = true;
  const marcar = (campo, msg) => {
    valido = false;
    f[campo].setAttribute('aria-invalid', 'true');
    $(`[data-err=${campo}]`, f).textContent = msg;
  };
  $$('.fld__err', f).forEach((x) => (x.textContent = ''));
  $$('[aria-invalid]', f).forEach((x) => x.removeAttribute('aria-invalid'));
  if (!nombre) marcar('nombre', 'Escribe el nombre de la familia o del invitado.');
  if (!(boletos >= 1 && boletos <= 30)) marcar('boletos', 'Usa un número entre 1 y 30.');
  const r = state.editando;
  if (r && f.estado.value === 'asiste') {
    const c = parseInt(f.boletos_confirmados.value, 10);
    if (!(c >= 1 && c <= boletos)) { valido = false; $('#inv-error').textContent = `Los boletos confirmados deben estar entre 1 y ${boletos}.`; }
  }
  if (!valido) { f.querySelector('[aria-invalid]')?.focus(); return; }

  const btn = $('#inv-guardar');
  btn.disabled = true;
  try {
    const valores = { nombre, boletos, telefono: f.telefono.value, notas: f.notas.value };
    if (r) {
      if (f.estado.value !== r.estado || (f.estado.value === 'asiste' && +f.boletos_confirmados.value !== r.boletos_confirmados)) {
        Object.assign(valores, { estado: f.estado.value, boletos_confirmados: +f.boletos_confirmados.value, marcarRespondido: true });
      } else if (r.estado === 'asiste' && boletos < r.boletos_confirmados) {
        Object.assign(valores, { estado: 'asiste', boletos_confirmados: boletos });
      }
      await admin.update(r.id, valores);
      toast('Cambios guardados');
    } else {
      const nueva = await admin.create(valores);
      const ok = await copiar(invitationUrl(nueva.slug));
      toast(ok ? `Invitación creada. Enlace copiado.` : 'Invitación creada');
      state.resaltar = new Set([nueva.id]);
    }
    $('#dlg-inv').close();
    await cargar();
  } catch (ex) {
    $('#inv-error').textContent = ex.message;
  } finally {
    btn.disabled = false;
  }
}

// ---------------------------------------------------------------------
//  Excel: exportar, importar y plantilla
// ---------------------------------------------------------------------
let xlsxPromise = null;
function cargarXLSX() {
  if (window.XLSX) return Promise.resolve(window.XLSX);
  if (!xlsxPromise) {
    xlsxPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = XLSX_CDN; s.async = true;
      s.onload = () => resolve(window.XLSX);
      s.onerror = () => { xlsxPromise = null; reject(new Error('No se pudo cargar la herramienta de Excel.')); };
      document.head.appendChild(s);
    });
  }
  return xlsxPromise;
}

const ESTADOS = { asiste: 'Asistirán', no_asiste: 'No asistirán', pendiente: 'Sin responder' };

function filasExport() {
  return state.rows.map((r) => ({
    'Familia o invitado': r.nombre,
    'Boletos asignados': r.boletos,
    'Respuesta': ESTADOS[r.estado],
    'Boletos confirmados': r.estado === 'asiste' ? r.boletos_confirmados : 0,
    'Mensaje': r.mensaje || '',
    'Teléfono': r.telefono || '',
    'Notas': r.notas || '',
    'Fecha de respuesta': r.respondido_at ? new Date(r.respondido_at).toLocaleString('es-MX', { timeZone: 'America/Mexico_City' }) : '',
    'Enlace': invitationUrl(r.slug),
  }));
}

async function exportarExcel() {
  const btn = $('#btn-excel');
  btn.disabled = true;
  const fecha = new Date().toISOString().slice(0, 10);
  try {
    const XLSX = await cargarXLSX();
    const ws = XLSX.utils.json_to_sheet(filasExport());
    ws['!cols'] = [{ wch: 32 }, { wch: 10 }, { wch: 14 }, { wch: 12 }, { wch: 50 }, { wch: 14 }, { wch: 28 }, { wch: 20 }, { wch: 60 }];
    const s = calcular(state.rows);
    const resumen = XLSX.utils.aoa_to_sheet([
      ['Resumen', ''],
      ['Invitaciones', s.inv], ['Boletos asignados', s.boletos], ['Boletos confirmados', s.si],
      ['No asistirán', s.no], ['Sin responder', s.pend], ['Fecha del reporte', new Date().toLocaleString('es-MX')],
    ]);
    resumen['!cols'] = [{ wch: 22 }, { wch: 22 }];
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Invitados');
    XLSX.utils.book_append_sheet(wb, resumen, 'Resumen');
    XLSX.writeFile(wb, `invitados-boda-${fecha}.xlsx`);
    toast('Excel descargado', 'download-simple');
  } catch {
    // Sin internet para la librería: descarga CSV (también abre en Excel)
    const rows = filasExport();
    const cols = Object.keys(rows[0] || { 'Familia o invitado': '' });
    const csv = [cols, ...rows.map((r) => cols.map((c) => r[c]))]
      .map((line) => line.map((v) => `"${String(v ?? '').replace(/"/g, '""')}"`).join(',')).join('\r\n');
    descargarBlob(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }), `invitados-boda-${fecha}.csv`);
    toast('Se descargó como CSV (se abre en Excel)', 'download-simple');
  } finally {
    btn.disabled = false;
  }
}

function descargarBlob(blob, nombre) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = nombre;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 2000);
}

async function descargarPlantilla() {
  const datos = [['nombre', 'boletos', 'telefono'], ['Familia Hernández Ruiz', 4, '5512345678'], ['Tía Rosa Galicia', 1, '']];
  try {
    const XLSX = await cargarXLSX();
    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(datos);
    ws['!cols'] = [{ wch: 32 }, { wch: 10 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, ws, 'Invitados');
    XLSX.writeFile(wb, 'plantilla-invitados.xlsx');
  } catch {
    descargarBlob(new Blob(['﻿' + datos.map((r) => r.join(',')).join('\r\n')], { type: 'text/csv;charset=utf-8' }), 'plantilla-invitados.csv');
  }
}

function normalizarCol(k) { return slugify(k).replace(/-/g, ''); }

async function leerArchivo(file) {
  $('#imp-error').textContent = '';
  $('#imp-preview').hidden = true;
  $('#imp-ok').disabled = true;
  state.importables = [];
  if (!file) return;
  $('#dz-texto').textContent = file.name;
  try {
    const XLSX = await cargarXLSX();
    const wb = XLSX.read(await file.arrayBuffer(), { type: 'array' });
    const filas = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]], { defval: '' });
    const alias = { nombre: ['nombre', 'familia', 'invitado', 'invitados', 'name'], boletos: ['boletos', 'pases', 'lugares', 'cantidad', 'personas'], telefono: ['telefono', 'whatsapp', 'celular', 'tel', 'phone'] };
    const buscar = (row, campo) => {
      const k = Object.keys(row).find((c) => alias[campo].includes(normalizarCol(c)));
      return k ? row[k] : '';
    };
    const validas = []; const errores = [];
    filas.forEach((row, i) => {
      const nombre = String(buscar(row, 'nombre')).trim();
      const boletos = parseInt(buscar(row, 'boletos'), 10);
      if (!nombre && !boletos) return;
      if (!nombre || !(boletos >= 1 && boletos <= 30)) errores.push(i + 2);
      else validas.push({ nombre, boletos, telefono: String(buscar(row, 'telefono') || '') });
    });
    state.importables = validas;
    if (!validas.length) {
      $('#imp-error').textContent = 'No encontramos filas válidas. Revisa que la primera fila diga nombre, boletos y telefono.';
      return;
    }
    const total = validas.reduce((a, r) => a + r.boletos, 0);
    $('#imp-preview').innerHTML = `<strong>${validas.length} invitaciones, ${total} boletos en total.</strong>
      <ul>${validas.slice(0, 6).map((r) => `<li>${esc(r.nombre)}: ${boletosTxt(r.boletos)}</li>`).join('')}${validas.length > 6 ? `<li>y ${validas.length - 6} más</li>` : ''}</ul>
      ${errores.length ? `<p class="form-error">Se omitirán las filas ${errores.slice(0, 8).join(', ')}${errores.length > 8 ? '…' : ''} porque les falta nombre o el número de boletos no es válido.</p>` : ''}`;
    $('#imp-preview').hidden = false;
    $('#imp-ok').disabled = false;
    $('#imp-ok').textContent = `Importar ${validas.length}`;
  } catch (e) {
    $('#imp-error').textContent = e.message?.includes('Excel') ? e.message : 'No pudimos leer el archivo. Usa .xlsx o .csv.';
  }
}

async function importar() {
  const btn = $('#imp-ok');
  btn.disabled = true;
  try {
    const n = await admin.createMany(state.importables);
    $('#dlg-imp').close();
    toast(`${n} invitaciones importadas`, 'upload-simple');
    await cargar();
  } catch (e) {
    $('#imp-error').textContent = e.message;
    btn.disabled = false;
  }
}

// ---------------------------------------------------------------------
//  Eventos
// ---------------------------------------------------------------------
function bindEvents() {
  $('#form-login').addEventListener('submit', async (e) => {
    e.preventDefault();
    const f = e.target;
    const btn = f.querySelector('button[type=submit]');
    $('#login-error').textContent = '';
    if (!f.email.value || !f.password.value) { $('#login-error').textContent = 'Escribe tu correo y contraseña.'; return; }
    btn.disabled = true;
    try { await admin.signIn(f.email.value.trim(), f.password.value); mostrarPanel(); }
    catch (ex) { $('#login-error').textContent = ex.message; }
    finally { btn.disabled = false; }
  });

  $('#btn-salir').addEventListener('click', async () => { unsubscribe?.(); await admin.signOut(); state.rows = []; mostrarLogin(); });
  $('#btn-reset-demo').addEventListener('click', () => { resetDemo(); cargar(); toast('Datos de ejemplo restaurados'); });

  $('#btn-nueva').addEventListener('click', () => abrirDialogo());
  $('#btn-excel').addEventListener('click', exportarExcel);
  $('#btn-importar').addEventListener('click', () => {
    $('#form-imp').reset(); $('#dz-texto').textContent = 'Elegir archivo'; $('#imp-preview').hidden = true;
    $('#imp-error').textContent = ''; $('#imp-ok').disabled = true; $('#imp-ok').textContent = 'Importar';
    $('#dlg-imp').showModal();
  });
  $('#btn-plantilla').addEventListener('click', descargarPlantilla);
  $('#archivo').addEventListener('change', (e) => leerArchivo(e.target.files[0]));
  $('#imp-ok').addEventListener('click', importar);

  $('#buscar').addEventListener('input', (e) => { state.q = e.target.value; renderTabla(); });
  $('#filtros').addEventListener('click', (e) => {
    const b = e.target.closest('button[data-f]');
    if (!b) return;
    state.filtro = b.dataset.f;
    $$('#filtros button').forEach((x) => x.setAttribute('aria-checked', String(x === b)));
    renderTabla();
  });
  $('#filtros').addEventListener('keydown', (e) => {
    if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
    const bs = $$('#filtros button'); const i = bs.indexOf(document.activeElement);
    const n = bs[(i + (e.key === 'ArrowRight' ? 1 : -1) + bs.length) % bs.length];
    n.focus(); n.click();
  });

  $('#tabla').addEventListener('click', (e) => {
    const b = e.target.closest('[data-accion]');
    if (!b) return;
    accionFila(b.dataset.accion, b.closest('tr').dataset.id);
  });
  $('#vacio').addEventListener('click', (e) => {
    const b = e.target.closest('[data-accion]');
    if (!b) return;
    if (b.dataset.accion === 'nueva-vacio') abrirDialogo();
    if (b.dataset.accion === 'limpiar') { state.q = ''; $('#buscar').value = ''; $('#filtros [data-f=todas]').click(); }
  });

  $('#form-inv').addEventListener('submit', guardarInvitacion);
  $('#form-inv').estado.addEventListener('change', syncConfirmados);
  $('#form-inv').boletos.addEventListener('input', syncConfirmados);

  $('#del-ok').addEventListener('click', async () => {
    const r = state.borrando;
    if (!r) return;
    $('#del-ok').disabled = true;
    try { await admin.remove(r.id); $('#dlg-del').close(); toast(`Invitación de ${r.nombre} eliminada`, 'trash'); await cargar(); }
    catch (e) { toast(e.message, 'x'); }
    finally { $('#del-ok').disabled = false; }
  });

  // Cerrar diálogos: botón "Cancelar" y clic fuera
  $$('dialog').forEach((d) => {
    d.addEventListener('click', (e) => {
      if (e.target.closest('[data-close]')) d.close();
      else if (e.target === d) {
        const r = d.getBoundingClientRect();
        const fuera = e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom;
        if (fuera) d.close();
      }
    });
  });
}

init();
