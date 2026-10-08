// =====================================================================
//  Capa de datos: Supabase cuando está configurado, modo demo
//  (localStorage del navegador) cuando no.
// =====================================================================
import { CONFIG } from './config.js';

const SUPABASE_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/dist/umd/supabase.js';
const DEMO_KEY = 'boda-pamela-luis-demo-v1';

export const isDemo = !(CONFIG.supabase.url && CONFIG.supabase.anonKey);

// ---------------------------------------------------------------------
//  Utilidades
// ---------------------------------------------------------------------
export function slugify(text) {
  return String(text)
    .normalize('NFD').replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
}

export function randomSuffix(len = 4) {
  const alphabet = 'abcdefghjkmnpqrstuvwxyz23456789';
  const bytes = crypto.getRandomValues(new Uint8Array(len));
  return Array.from(bytes, (b) => alphabet[b % alphabet.length]).join('');
}

export function newSlug(nombre) {
  const base = slugify(nombre) || 'invitado';
  return `${base}-${randomSuffix()}`;
}

function loadScript(src) {
  return new Promise((resolve, reject) => {
    const existing = document.querySelector(`script[src="${src}"]`);
    if (existing) { existing.addEventListener('load', resolve); if (window.supabase) resolve(); return; }
    const s = document.createElement('script');
    s.src = src; s.async = true;
    s.onload = resolve;
    s.onerror = () => reject(new Error('No se pudo cargar la librería de Supabase. Revisa tu conexión.'));
    document.head.appendChild(s);
  });
}

let clientPromise = null;
function client() {
  if (isDemo) return null;
  if (!clientPromise) {
    clientPromise = loadScript(SUPABASE_CDN).then(() =>
      window.supabase.createClient(CONFIG.supabase.url, CONFIG.supabase.anonKey, {
        auth: { persistSession: true, storageKey: 'boda-pamela-luis-auth' },
      })
    );
  }
  return clientPromise;
}

// ---------------------------------------------------------------------
//  Modo demo
// ---------------------------------------------------------------------
const nowIso = () => new Date().toISOString();
const daysAgo = (d) => new Date(Date.now() - d * 864e5).toISOString();

function demoSeed() {
  const rows = [
    { slug: 'familia-hernandez-ruiz-k7m2', nombre: 'Familia Hernández Ruiz', boletos: 4, telefono: '5545127830', estado: 'asiste', boletos_confirmados: 4, mensaje: '¡No nos lo perderíamos por nada! Los queremos mucho.', respondido_at: daysAgo(3) },
    { slug: 'familia-martinez-olvera-p3xd', nombre: 'Familia Martínez Olvera', boletos: 2, telefono: '5591834406', estado: 'pendiente', boletos_confirmados: 0, mensaje: null, respondido_at: null },
    { slug: 'tia-rosa-galicia-w9tq', nombre: 'Tía Rosa Galicia', boletos: 1, telefono: '', estado: 'asiste', boletos_confirmados: 1, mensaje: 'Ahí estaré, mijo. Que Dios los bendiga.', respondido_at: daysAgo(1) },
    { slug: 'familia-sanchez-pena-h4rv', nombre: 'Familia Sánchez Peña', boletos: 5, telefono: '5527760319', estado: 'asiste', boletos_confirmados: 3, mensaje: 'Vamos 3, los niños se quedan con la abuela.', respondido_at: daysAgo(6) },
    { slug: 'diego-y-fernanda-b2nc', nombre: 'Diego y Fernanda', boletos: 2, telefono: '5563019942', estado: 'no_asiste', boletos_confirmados: 0, mensaje: 'Estaremos fuera del país, pero los acompañamos de corazón.', respondido_at: daysAgo(2) },
    { slug: 'familia-ortega-luna-s6fj', nombre: 'Familia Ortega Luna', boletos: 3, telefono: '5538421175', estado: 'pendiente', boletos_confirmados: 0, mensaje: null, respondido_at: null },
  ];
  return rows.map((r, i) => ({ id: `demo-${i + 1}`, notas: '', created_at: daysAgo(10 - i), updated_at: r.respondido_at || daysAgo(10 - i), ...r }));
}

function demoRead() {
  try {
    const raw = localStorage.getItem(DEMO_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* almacenamiento no disponible */ }
  const seed = demoSeed();
  demoWrite(seed);
  return seed;
}

function demoWrite(rows) {
  try { localStorage.setItem(DEMO_KEY, JSON.stringify(rows)); } catch { /* sin almacenamiento */ }
  try { demoChannel?.postMessage('changed'); } catch { /* sin canal */ }
}

const demoChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('boda-demo') : null;

export function resetDemo() {
  try { localStorage.removeItem(DEMO_KEY); } catch { /* nada */ }
  demoRead();
  try { demoChannel?.postMessage('changed'); } catch { /* nada */ }
}

const wait = (ms) => new Promise((r) => setTimeout(r, ms));

// ---------------------------------------------------------------------
//  API pública para invitados
// ---------------------------------------------------------------------
export async function getInvitation(slug) {
  slug = String(slug || '').toLowerCase().trim();
  if (!slug) return null;
  if (isDemo) {
    await wait(350);
    const row = demoRead().find((r) => r.slug === slug);
    return row ? pickPublic(row) : null;
  }
  const sb = await client();
  const { data, error } = await sb.rpc('obtener_invitacion', { p_slug: slug });
  if (error) throw new Error('No pudimos cargar tu invitación. Intenta de nuevo en unos minutos.');
  return data && data.length ? data[0] : null;
}

export async function submitRsvp(slug, { asiste, boletos, mensaje }) {
  slug = String(slug || '').toLowerCase().trim();
  mensaje = (mensaje || '').trim().slice(0, 1000) || null;
  if (isDemo) {
    await wait(600);
    const rows = demoRead();
    const row = rows.find((r) => r.slug === slug);
    if (!row) throw new Error('Esta invitación ya no existe. Pide a los novios un enlace nuevo.');
    const n = asiste ? Math.max(1, Math.min(row.boletos, boletos | 0)) : 0;
    Object.assign(row, { estado: asiste ? 'asiste' : 'no_asiste', boletos_confirmados: n, mensaje, respondido_at: nowIso(), updated_at: nowIso() });
    demoWrite(rows);
    return pickPublic(row);
  }
  const sb = await client();
  const { data, error } = await sb.rpc('responder_invitacion', {
    p_slug: slug, p_asiste: !!asiste, p_boletos: asiste ? boletos | 0 : 0, p_mensaje: mensaje,
  });
  if (error) throw new Error(error.message?.includes('boletos') ? 'El número de boletos no es válido para esta invitación.' : 'No pudimos guardar tu respuesta. Revisa tu conexión e intenta de nuevo.');
  return data && data.length ? data[0] : null;
}

function pickPublic(r) {
  return { nombre: r.nombre, boletos: r.boletos, estado: r.estado, boletos_confirmados: r.boletos_confirmados, mensaje: r.mensaje, respondido_at: r.respondido_at };
}

// ---------------------------------------------------------------------
//  API del panel de administración
// ---------------------------------------------------------------------
export const admin = {
  async getSession() {
    if (isDemo) return { user: { email: 'demo@boda.local' } };
    const sb = await client();
    const { data } = await sb.auth.getSession();
    return data.session;
  },

  async signIn(email, password) {
    if (isDemo) return { user: { email } };
    const sb = await client();
    const { data, error } = await sb.auth.signInWithPassword({ email, password });
    if (error) throw new Error('Correo o contraseña incorrectos.');
    return data.session;
  },

  async signOut() {
    if (isDemo) return;
    const sb = await client();
    await sb.auth.signOut();
  },

  async list() {
    if (isDemo) { await wait(250); return demoRead().slice().sort(byCreated); }
    const sb = await client();
    const { data, error } = await sb.from('invitaciones').select('*').order('created_at', { ascending: true });
    if (error) throw new Error(error.code === '42501' || error.message?.includes('permission')
      ? 'Tu cuenta no tiene permiso de administrador. Agrega tu correo a la tabla "admins" en Supabase.'
      : 'No se pudo cargar la lista de invitaciones.');
    return data;
  },

  async create(values) {
    const row = cleanRow(values);
    row.slug = values.slug || newSlug(row.nombre);
    if (isDemo) {
      const rows = demoRead();
      const full = { id: `demo-${Date.now()}`, created_at: nowIso(), updated_at: nowIso(), estado: 'pendiente', boletos_confirmados: 0, mensaje: null, respondido_at: null, ...row };
      rows.push(full); demoWrite(rows); return full;
    }
    const sb = await client();
    const { data, error } = await sb.from('invitaciones').insert(row).select().single();
    if (error) throw new Error(error.code === '23505' ? 'Ya existe una invitación con ese enlace.' : 'No se pudo guardar la invitación.');
    return data;
  },

  async createMany(list) {
    const rows = list.map((v) => ({ ...cleanRow(v), slug: newSlug(v.nombre) }));
    if (isDemo) {
      const all = demoRead();
      rows.forEach((r, i) => all.push({ id: `demo-${Date.now()}-${i}`, created_at: nowIso(), updated_at: nowIso(), estado: 'pendiente', boletos_confirmados: 0, mensaje: null, respondido_at: null, ...r }));
      demoWrite(all); return rows.length;
    }
    const sb = await client();
    const { error } = await sb.from('invitaciones').insert(rows);
    if (error) throw new Error('No se pudo importar la lista. Revisa que cada fila tenga nombre y boletos.');
    return rows.length;
  },

  async update(id, values) {
    const patch = cleanRow(values);
    if ('estado' in values) {
      patch.estado = values.estado;
      patch.boletos_confirmados = values.estado === 'asiste' ? Math.max(1, Math.min(patch.boletos, values.boletos_confirmados | 0)) : 0;
      if (values.estado === 'pendiente') patch.respondido_at = null;
      else if (values.marcarRespondido) patch.respondido_at = nowIso();
    }
    if (isDemo) {
      const rows = demoRead();
      const row = rows.find((r) => r.id === id);
      Object.assign(row, patch, { updated_at: nowIso() });
      demoWrite(rows); return row;
    }
    const sb = await client();
    const { data, error } = await sb.from('invitaciones').update(patch).eq('id', id).select().single();
    if (error) throw new Error('No se pudieron guardar los cambios.');
    return data;
  },

  async remove(id) {
    if (isDemo) { demoWrite(demoRead().filter((r) => r.id !== id)); return; }
    const sb = await client();
    const { error } = await sb.from('invitaciones').delete().eq('id', id);
    if (error) throw new Error('No se pudo eliminar la invitación.');
  },

  // Llama a onChange(evento) cada vez que cambie algo (tiempo real).
  async subscribe(onChange) {
    if (isDemo) {
      const handler = () => onChange({ type: 'demo' });
      demoChannel?.addEventListener('message', handler);
      window.addEventListener('storage', (e) => { if (e.key === DEMO_KEY) handler(); });
      return () => demoChannel?.removeEventListener('message', handler);
    }
    const sb = await client();
    const channel = sb.channel('invitaciones-cambios')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'invitaciones' }, (payload) =>
        onChange({ type: payload.eventType, nuevo: payload.new, anterior: payload.old }))
      .subscribe();
    return () => sb.removeChannel(channel);
  },
};

function cleanRow(v) {
  const row = {};
  if ('nombre' in v) row.nombre = String(v.nombre || '').trim().slice(0, 120);
  if ('boletos' in v) row.boletos = Math.max(1, Math.min(30, parseInt(v.boletos, 10) || 1));
  if ('telefono' in v) row.telefono = String(v.telefono || '').replace(/[^\d+]/g, '').slice(0, 16);
  if ('notas' in v) row.notas = String(v.notas || '').trim().slice(0, 500);
  return row;
}

const byCreated = (a, b) => String(a.created_at).localeCompare(String(b.created_at));

export function invitationUrl(slug) {
  let base = CONFIG.urlSitio;
  if (!base) {
    const u = new URL(location.href);
    u.search = ''; u.hash = '';
    u.pathname = u.pathname.replace(/[^/]*$/, '');
    base = u.toString();
  }
  if (!base.endsWith('/')) base += '/';
  return `${base}?id=${encodeURIComponent(slug)}`;
}
