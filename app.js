/* NEMO — prototipo. Dati salvati solo su questo telefono (localStorage). */
(function () {
'use strict';

// ---------- costanti
const KEY = 'nemo.v1';
const DEFAULT_PEOPLE = ['Simone', 'Fedra'];
const CATS = {
  Trasporti:  { bg: 'var(--c-tra)', s: 'var(--c-tra-s)', icon: 'plane' },
  Alloggio:   { bg: 'var(--c-all)', s: 'var(--c-all-s)', icon: 'bed' },
  Cibo:       { bg: 'var(--c-cib)', s: 'var(--c-cib-s)', icon: 'food' },
  Esperienze: { bg: 'var(--c-esp)', s: 'var(--c-esp-s)', icon: 'ticket' },
  Varie:      { bg: 'var(--c-var)', s: 'var(--c-var-s)', icon: 'bag' },
};
const CAT_NAMES = Object.keys(CATS);
const STATUS = [['da prenotare', 'Da prenotare'], ['prenotato', 'Prenotato'], ['pagato', 'Pagato']];
const TRANSPORT_TYPES = ['Volo', 'Treno', 'Traghetto', 'Bus', 'Auto a noleggio', 'Taxi / altro'];
const GG = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const GGL = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const MM = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const MML = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

// Campi specifici per categoria: [chiave, etichetta, tipo, segnaposto]
const FIELDS = {
  Trasporti: [['kind', 'Tipo', 'kind'], ['from', 'Da', 'text', 'Es. Milano MXP'], ['to', 'A', 'text', 'Es. Londra LTN'], ['company', 'Compagnia', 'text', 'Es. Wizz Air'],
    ['number', 'N° volo / treno', 'text', 'Es. W6 1234'], ['date', 'Data partenza', 'date'], ['time', 'Ora partenza', 'time'], ['endDate', 'Data arrivo', 'date'], ['endTime', 'Ora arrivo', 'time'],
    ['baggage', 'Bagaglio incluso', 'text', 'Es. zaino + trolley 10 kg'], ['seats', 'Posti', 'text', 'Es. 12A, 12B']],
  Alloggio: [['title', 'Nome', 'text', 'Es. Hotel Kindred'], ['date', 'Check-in', 'date'], ['endDate', 'Check-out', 'date'], ['time', 'Orario check-in', 'time'],
    ['address', 'Indirizzo', 'text', 'Per aprirlo in Maps'], ['cancel', 'Cancellazione gratuita entro', 'date'], ['host', 'Contatto host', 'text', 'Telefono o email']],
  Cibo: [['title', 'Ristorante / cosa', 'text', 'Es. Time Out Market, pranzo…'], ['date', 'Data', 'date'], ['time', 'Ora', 'time'], ['guests', 'Persone', 'text', 'Es. 2'],
    ['address', 'Indirizzo', 'text', 'Per aprirlo in Maps'], ['phone', 'Telefono', 'tel', '']],
  Esperienze: [['title', 'Nome', 'text', 'Es. Museo, tour, concerto'], ['date', 'Data', 'date'], ['time', 'Ora inizio', 'time'], ['endTime', 'Ora fine', 'time'],
    ['address', 'Punto d\'incontro', 'text', 'Per aprirlo in Maps'], ['tickets', 'N° biglietti', 'text', 'Es. 2']],
  Varie: [['title', 'Cosa', 'text', 'Es. SIM, souvenir, farmacia'], ['date', 'Data', 'date'], ['time', 'Ora (facoltativa)', 'time']],
};

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>', back: '<path d="M15 6l-6 6 6 6"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  plane: '<path d="M2 16l20-6-3-3-7 3-5-4-2 1 3 5-4 1z"/><path d="M3 21h18"/>',
  bed: '<path d="M3 20V8l9-5 9 5v12"/><path d="M9 20v-6h6v6"/>',
  food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  check: '<path d="M4 12l5 5L20 6"/>', chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>',
  edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', chev: '<path d="M9 6l6 6-6 6"/>', note: '<path d="M5 4h14v12l-4 4H5z"/><path d="M15 20v-4h4M8 9h8M8 13h5"/>',
  left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>', x: '<path d="M6 6l12 12M18 6L6 18"/>',
};
const svg = (k, s = 22, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

// ---------- utilità
const $ = (s) => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => (Number(n) || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const eur0 = (n) => Math.round(Number(n) || 0).toLocaleString('it-IT') + ' €';
const numIn = (v) => { const s = String(v ?? '').replace('€', '').trim(); if (!s) return 0; return parseFloat(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s) || 0; };
const num = (v) => (typeof v === 'number' ? v : numIn(v));
const pad = (n) => String(n).padStart(2, '0');
const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parse = (s) => { const [y, m, d] = s.split('-').map(Number); return new Date(y, m - 1, d); };
const addDays = (s, n) => { const d = parse(s); d.setDate(d.getDate() + n); return iso(d); };
const diffDays = (a, b) => Math.round((parse(b) - parse(a)) / 86400000);
const today = () => iso(new Date());
const fmtDay = (s) => { const d = parse(s); return `${GG[d.getDay()]} ${d.getDate()} ${MM[d.getMonth()]}`; };
const fmtRange = (a, b) => { const A = parse(a), B = parse(b);
  return A.getMonth() === B.getMonth() ? `${A.getDate()} – ${B.getDate()} ${MML[B.getMonth()]}` : `${A.getDate()} ${MM[A.getMonth()]} – ${B.getDate()} ${MM[B.getMonth()]}`; };
const tmin = (t) => { if (!t) return null; const [h, m] = t.split(':').map(Number); return h * 60 + m; };
const nowMin = () => { const d = new Date(); return d.getHours() * 60 + d.getMinutes(); };

// ---------- dati
let db;
function load() {
  try { db = JSON.parse(localStorage.getItem(KEY)); } catch (e) { db = null; }
  if (!db || !Array.isArray(db.trips)) db = { trips: [demoTrip()] };
  db.trips.forEach(migrate); db.v = 3; save();
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
  catch (e) { toast('Memoria del telefono piena: togli qualche allegato'); return false; }
}
const trip = (id) => db.trips.find((t) => t.id === id);
const fixSplit = (s) => (!s || s === '50/50' || s === 'all') ? 'all' : Array.isArray(s) ? s : [s];
function migrate(t) {
  t.people = t.people && t.people.length ? t.people : DEFAULT_PEOPLE.slice();
  t.items = t.items || []; t.budget = t.budget || {}; t.notes = t.notes || []; t.settlements = t.settlements || [];
  if (!t.todos) t.todos = (t.checklist || []).map((c) => ({ id: c.id || uid(), text: c.text, date: '', time: '', done: !!c.done }))
    .concat((t.ideas || []).map((x) => ({ id: x.id || uid(), text: x.title, date: x.date || '', time: x.time || '', done: !!x.done })));
  (t.expenses || []).forEach((e) => t.items.push({ id: e.id || uid(), cat: e.cat, title: e.desc || e.cat, price: e.amount, status: 'pagato', paidBy: e.paidBy, split: e.split, date: e.date, files: e.files || [], f: {} }));
  t.expenses = []; t.ideas = []; t.checklist = [];
  t.items.forEach((i) => { i.split = fixSplit(i.split); i.f = i.f || {}; ['address', 'cancel'].forEach((k) => { if (i[k] && !i.f[k]) i.f[k] = i[k]; });
    if (!t.people.includes(i.paidBy)) i.paidBy = t.people[0]; });
  return t;
}
function demoTrip() {
  const s = addDays(today(), -2), e = addDays(s, 4), d = (n) => addDays(s, n);
  const it = (o) => ({ id: uid(), status: 'pagato', paidBy: 'Simone', split: 'all', files: [], f: {}, ...o });
  return {
    id: uid(), name: 'Lisbona · esempio', start: s, end: e, people: DEFAULT_PEOPLE.slice(), demo: true,
    budget: { Trasporti: 300, Alloggio: 450, Cibo: 300, Esperienze: 150, Varie: 80 },
    items: [
      it({ cat: 'Trasporti', title: 'Volo MXP → LIS', date: d(0), time: '07:10', endTime: '09:00', price: 120, f: { kind: 'Volo', from: 'Milano MXP', to: 'Lisbona LIS', company: 'Compagnia esempio' } }),
      it({ cat: 'Alloggio', title: 'Casa do Bairro', date: d(0), endDate: d(4), time: '15:00', price: 420, paidBy: 'Fedra', f: { address: 'Bairro Alto, Lisbona' } }),
      it({ cat: 'Esperienze', title: 'Oceanario', date: d(2), time: '10:00', endTime: '12:00', price: 44, status: 'prenotato', f: { address: 'Parque das Nações', tickets: '2' } }),
      it({ cat: 'Esperienze', title: 'Serata di fado', date: d(2), time: '21:30', endTime: '23:00', price: 50, status: 'da prenotare', f: { address: 'Alfama' } }),
      it({ cat: 'Trasporti', title: 'Volo LIS → MXP', date: d(4), time: '19:40', endTime: '23:30', price: 110, paidBy: 'Fedra', f: { kind: 'Volo', from: 'Lisbona LIS', to: 'Milano MXP' } }),
      it({ cat: 'Cibo', title: 'Pasti', date: d(0), price: 48 }),
      it({ cat: 'Trasporti', title: 'Carta metro', date: d(0), price: 13, paidBy: 'Fedra', f: { kind: 'Taxi / altro' } }),
      it({ cat: 'Cibo', title: 'Pranzo', date: d(1), time: '13:00', endTime: '14:00', price: 36, paidBy: 'Fedra' }),
      it({ cat: 'Varie', title: 'Souvenir', date: d(1), price: 18, paidBy: 'Fedra', split: ['Fedra'] }),
      it({ cat: 'Cibo', title: 'Colazione', date: d(2), time: '08:30', endTime: '09:15', price: 9 }),
    ],
    notes: [{ id: uid(), text: 'Chiedere all\'host dove lasciare le valigie l\'ultimo giorno', date: d(2) }],
    todos: [{ id: uid(), text: 'Caricabatterie e power bank', date: '', time: '', done: false }, { id: uid(), text: 'Pastéis de Belém', date: '', time: '', done: false }],
  };
}

// ---------- calcoli
const isSpent = (i) => num(i.price) > 0 && i.status !== 'da prenotare';
const spent = (t) => t.items.filter(isSpent).reduce((a, i) => a + num(i.price), 0);
const budgetTot = (t) => CAT_NAMES.reduce((a, c) => a + num(t.budget?.[c]), 0);
const shareOf = (t, i) => (i.split === 'all' ? t.people : i.split.filter((p) => t.people.includes(p)));
function balance(t) {
  const b = {}; t.people.forEach((p) => { b[p] = 0; });
  t.items.filter(isSpent).forEach((i) => { const a = num(i.price); const sh = shareOf(t, i); if (b[i.paidBy] !== undefined) b[i.paidBy] += a;
    (sh.length ? sh : t.people).forEach((p) => { b[p] -= a / (sh.length || t.people.length); }); });
  (t.settlements || []).forEach((s) => { if (b[s.from] !== undefined) b[s.from] += s.amount; if (b[s.to] !== undefined) b[s.to] -= s.amount; });
  return b;
}
function transfers(t) { // chi deve dare a chi, con il minimo di passaggi
  const b = balance(t); const deb = [], cre = [];
  Object.entries(b).forEach(([p, v]) => { if (v < -0.005) deb.push([p, -v]); else if (v > 0.005) cre.push([p, v]); });
  const out = []; let i = 0, j = 0;
  while (i < deb.length && j < cre.length) { const x = Math.min(deb[i][1], cre[j][1]); out.push({ from: deb[i][0], to: cre[j][0], amount: x });
    deb[i][1] -= x; cre[j][1] -= x; if (deb[i][1] < 0.005) i++; if (cre[j][1] < 0.005) j++; }
  return out;
}
function phase(t) { const d = today(); return d < t.start ? 'futuro' : d > t.end ? 'passato' : 'corso'; }
const nDays = (t) => diffDays(t.start, t.end) + 1;
const pplLabel = (t) => (t.people.length === 2 ? 'in due' : t.people.length === 1 ? 'in totale' : `in ${t.people.length}`);
function staysOn(t, date) { return t.items.filter((i) => i.cat === 'Alloggio' && i.date <= date && (i.endDate || addDays(i.date, 1)) > date); }

// ---------- navigazione
const ui = { view: 'home', tripId: null, tab: 'viaggio', day: null, mode: 'giorno', pStart: null };
function go(view, opts = {}) { Object.assign(ui, { view }, opts); window.scrollTo(0, 0); render(); }

function render() {
  const app = $('#app');
  if (ui.view === 'home') { app.innerHTML = vHome(); tabbar(false); return; }
  const t = trip(ui.tripId); if (!t) return go('home');
  const tabs = { viaggio: vViaggio, spese: vSpese, todo: vTodo, assistente: vAssist };
  app.innerHTML = (tabs[ui.tab] || vViaggio)(t);
  tabbar(true);
  if (ui.scrollNow) { ui.scrollNow = false; const tg = document.querySelector('[data-target]') || document.querySelector('.nowline');
    if (tg) window.scrollTo(0, Math.max(0, tg.getBoundingClientRect().top + window.scrollY - 220)); }
}
function tabbar(show) {
  const nb = $('#tabbar'); nb.hidden = !show; if (!show) return;
  const T = [['viaggio', 'Viaggio', 'cal'], ['spese', 'Spese', 'card'], ['todo', 'To-do', 'check'], ['assistente', 'Assistente', 'chat']];
  nb.style.gridTemplateColumns = `repeat(${T.length},minmax(0,1fr))`;
  nb.innerHTML = T.map(([k, l, i]) => `<button class="${ui.tab === k ? 'on' : ''}" onclick="A.tab('${k}')">${svg(i)}${l}</button>`).join('');
}
const head = (right) => `<div class="top"><button class="iconbtn back" aria-label="Torna ai viaggi" onclick="A.home()">${svg('back')}</button>${right || ''}</div>`;
const plusBtn = (fn, label) => `<button class="plus" aria-label="${label}" onclick="${fn}">${svg('plus', 20, 2.2)}</button>`;
const tname = (t) => `${esc(t.name)}${t.emoji ? ' ' + t.emoji : ''}`;

// --- Home
function vHome() {
  const ts = db.trips.slice().sort((a, b) => a.start.localeCompare(b.start));
  const cur = ts.filter((t) => phase(t) === 'corso'), fut = ts.filter((t) => phase(t) === 'futuro'), past = ts.filter((t) => phase(t) === 'passato').reverse();
  let h = `<div class="top"><span class="brand">NEMO</span>${plusBtn('A.tripForm()', 'Nuovo viaggio')}</div>
  <h1 style="margin-top:6px;font-size:32px">I nostri <span class="hl">viaggi</span></h1>`;
  if (cur.length) h += `<div class="sec"><div class="lab">In corso</div>${cur.map(cardNow).join('')}</div>`;
  if (fut.length) h += `<div class="sec"><div class="lab">In arrivo</div>${fut.map(cardFut).join('')}</div>`;
  if (past.length) h += `<div class="sec"><div class="lab">Passati</div><div class="card list">${past.map((t) =>
    `<button class="between" style="width:100%;background:none;border:none;padding:13px 16px;text-align:left" onclick="A.open('${t.id}')"><span class="serif" style="font-size:17px">${tname(t)}</span><span class="small mut">${fmtRange(t.start, t.end)} · ${eur0(spent(t))}</span></button>`).join('')}</div></div>`;
  if (!db.trips.length) h += `<div class="sec"><div class="empty">Nessun viaggio. Tocca + per crearne uno.</div></div>`;
  h += `<div class="sec" style="margin-top:28px"><button class="btn ghost" onclick="A.settings()">Backup e impostazioni</button></div>`;
  return h;
}
function cardNow(t) {
  const d = today(), n = diffDays(t.start, d) + 1, tot = nDays(t), st = staysOn(t, d)[0], bt = budgetTot(t);
  return `<div class="navy col" role="button" tabindex="0" style="gap:12px;cursor:pointer" onclick="A.open('${t.id}')">
    <div class="between" style="align-items:flex-start"><div><div class="serif" style="font-size:26px">${tname(t)}</div>
      <div class="small mut">giorno ${n} di ${tot}${st ? ' · stanotte: ' + esc(st.title) : ''}</div></div><span class="badge b-now">OGGI</span></div>
    <div style="display:grid;grid-template-columns:repeat(${tot},minmax(0,1fr));gap:3px">${Array.from({ length: tot }, (_, i) => `<span style="height:6px;border-radius:3px;background:${i + 1 < n ? '#F6F3EC' : i + 1 === n ? 'var(--hl)' : '#3E4A66'}"></span>`).join('')}</div>
    <div class="between small"><span><b>${eur(spent(t))}</b>${bt ? ' su ' + eur0(bt) : ''} · ${t.people.length} pers.</span><span class="row" style="gap:2px;font-weight:700">Apri ${svg('chev', 16)}</span></div></div>`;
}
function cardFut(t) {
  const g = diffDays(today(), t.start);
  return `<button class="card pad" style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px" onclick="A.open('${t.id}')">
    <div><div class="serif" style="font-size:22px">${tname(t)}</div><div class="small mut">${fmtRange(t.start, t.end)} · ${t.people.join(', ')}</div>
    <div class="small" style="margin-top:6px"><b>${eur(spent(t))}</b> spesi${budgetTot(t) ? ' · budget ' + eur0(budgetTot(t)) : ''}</div></div>
    <div style="background:var(--ink);color:var(--paper);border-radius:12px;padding:8px 12px;text-align:center"><div class="serif" style="font-size:22px;line-height:1">${g}</div><div style="font-size:10px;letter-spacing:1px">${g === 1 ? 'GIORNO' : 'GIORNI'}</div></div></button>`;
}

// --- Viaggio
function vViaggio(t) {
  const d = today(), ph = phase(t);
  const sub = ph === 'corso' ? `Giorno <span class="hl"><b>${diffDays(t.start, d) + 1} di ${nDays(t)}</b></span>`
    : ph === 'futuro' ? `Mancano <span class="hl"><b>${diffDays(d, t.start)} giorni</b></span>` : 'Viaggio concluso';
  if (ui.mode !== 'periodo') ui.mode = 'giorno';
  return `${head(`<span class="row" style="gap:4px"><button class="iconbtn" aria-label="Modifica viaggio" onclick="A.tripForm('${t.id}')">${svg('edit', 20)}</button>${plusBtn('A.entryForm()', 'Aggiungi voce')}</span>`)}
  <h1>${tname(t)}</h1>
  <div class="between"><span class="mut" style="font-size:14px">${fmtRange(t.start, t.end)}</span><span style="font-size:14px">${sub}</span></div>
  <div class="seg" style="margin-top:12px"><button class="${ui.mode === 'giorno' ? 'on' : ''}" onclick="A.mode('giorno')">Oggi</button><button class="${ui.mode === 'periodo' ? 'on' : ''}" onclick="A.mode('periodo')">Più giorni</button></div>
  ${ui.mode === 'periodo' ? vPeriod(t) : vDay(t)}`;
}
function dayEntries(t, date) {
  const timed = [], untimed = [];
  t.items.filter((i) => i.cat !== 'Alloggio' && i.date === date).forEach((i) => {
    const e = { kind: 'item', id: i.id, title: i.title, time: i.time, endTime: i.endTime, cat: i.cat, price: i.price, todo: i.status === 'da prenotare', paid: i.status === 'pagato' };
    (i.time ? timed : untimed).push(e);
  });
  (t.todos || []).filter((x) => x.date === date && x.time && !x.done).forEach((x) => timed.push({ kind: 'todo', id: x.id, title: x.text, time: x.time, cat: 'Varie', sub: 'to-do' }));
  timed.sort((a, b) => a.time.localeCompare(b.time));
  return { timed, untimed };
}
function noteCard(n) {
  return `<button class="note" onclick="A.noteForm('${n.id}')"><span>${esc(n.text)}</span></button>`;
}
function vDay(t) {
  const d = today();
  if (!ui.day || ui.day < t.start || ui.day > t.end) ui.day = d >= t.start && d <= t.end ? d : t.start;
  const day = ui.day, D = parse(day), n = diffDays(t.start, day) + 1;
  let s0 = addDays(day, -2); if (s0 < t.start) s0 = t.start;
  let s1 = addDays(s0, 4); if (s1 > t.end) { s1 = t.end; s0 = addDays(s1, -4) < t.start ? t.start : addDays(s1, -4); }
  const strip = []; for (let x = s0; x <= s1; x = addDays(x, 1)) strip.push(x);
  const { timed, untimed } = dayEntries(t, day);
  const notes = (t.notes || []).filter((x) => x.date === day);
  const H0 = 7, H1 = 24, PX = 40, y = (m) => ((m - H0 * 60) / 60) * PX;
  const hours = Array.from({ length: H1 - H0 }, (_, i) => `<div class="hour" style="height:${PX}px"><span style="display:inline-block;padding-top:3px">${pad(H0 + i)}:00</span></div>`).join('');
  const nm = nowMin(), isToday = day === d;
  let curId = null, nextId = null;
  if (isToday) timed.forEach((e) => { const a = tmin(e.time), b = tmin(e.endTime) || a + 60; if (a <= nm && nm < b && !curId) curId = e.id; if (a > nm && !nextId) nextId = e.id; });
  const targetId = curId || nextId || (!isToday && timed.length ? timed[0].id : null);
  const evs = timed.map((e) => { const a = tmin(e.time), b = Math.max(tmin(e.endTime) || a + 60, a + 30);
    const cur = e.id === curId, nx = !curId && e.id === nextId;
    const tag = cur ? '<span class="badge" style="position:absolute;right:8px;top:6px;background:var(--ink);color:var(--paper)">ADESSO</span>' : nx ? '<span class="badge b-now" style="position:absolute;right:8px;top:6px">PROSSIMO</span>' : '';
    const stx = e.todo ? `;border:1.5px dashed ${CATS[e.cat].s};border-left:4px solid ${CATS[e.cat].s}` : e.paid ? `;box-shadow:inset 0 0 0 1.5px ${CATS[e.cat].s}` : '';
    const extra = cur ? ';outline:2px solid var(--ink);box-shadow:0 6px 18px rgba(31,42,68,.18);z-index:3' : nx ? ';outline:2px solid var(--ink);z-index:3' : '';
    const st = e.todo ? ' · <span class="wavy">da prenotare</span>' : e.paid ? ' · <b style="display:inline;font-size:12px;color:var(--ok)">✓ pagato</b>' : '';
    return `<button class="ev" ${e.id === targetId ? 'data-target="1"' : ''} style="top:${y(a)}px;height:${Math.max(y(b) - y(a), 34)}px;background:${CATS[e.cat].bg};border-left-color:${CATS[e.cat].s}${stx}${isToday && b <= nm ? ';opacity:.6' : ''}${extra}" onclick="A.openEntry('${e.kind}','${e.id}')">${tag}<b>${esc(e.title)}</b><span>${e.time}${e.endTime ? ' – ' + e.endTime : ''}${e.price ? ' · ' + eur(e.price) : e.sub ? ' · ' + e.sub : ''}${st}</span></button>`; }).join('');
  const now = isToday && nm >= H0 * 60 ? `<div class="nowline" style="top:${y(nm)}px"></div>` : '';
  const stays = staysOn(t, day).map((st) => { const last = addDays(day, 1) === st.endDate;
    return `<div class="band" role="button" style="cursor:pointer" onclick="A.entryForm('${st.id}')"><b>${esc(st.title)}${st.status === 'pagato' ? ' <span style="color:var(--ok)">✓</span>' : st.status === 'da prenotare' ? ' <span class="wavy small">da prenotare</span>' : ''}</b><span>${last ? 'ultima notte · check-out domani' : 'notte ' + (diffDays(st.date, day) + 1) + ' di ' + diffDays(st.date, st.endDate || addDays(st.date, 1))}</span></div>`; }).join('');
  const unt = untimed.length ? `<details class="card" style="margin-top:8px" ${ui.untOpen ? 'open' : ''} ontoggle="A.untToggle(this.open)"><summary class="between" style="padding:10px 14px;list-style:none;cursor:pointer;min-height:40px"><span class="small"><b>${untimed.length}</b> ${untimed.length === 1 ? 'voce' : 'voci'} senza orario</span><span class="small mut">${eur(untimed.reduce((a, e) => a + num(e.price), 0))}</span></summary>
    <div class="list">${untimed.map((e) => `<button class="between" style="width:100%;background:none;border:none;padding:9px 14px;text-align:left" onclick="A.entryForm('${e.id}')"><span class="row" style="gap:8px"><span class="dot" style="background:${CATS[e.cat].s}"></span><span style="font-size:14px">${esc(e.title)}${e.todo ? ' <span class="wavy small">da prenotare</span>' : ''}</span></span><b style="font-size:14px">${e.price ? eur(e.price) : ''}</b></button>`).join('')}</div></details>` : '';
  return `<div class="serif" style="font-size:20px;margin-top:14px">${GGL[D.getDay()]} <span class="hl">${D.getDate()} ${MML[D.getMonth()]}</span> <span class="mut" style="font-family:Karla,Arial,sans-serif;font-size:13px;font-weight:400">· giorno ${n} di ${nDays(t)}</span></div>
  <div class="dayhead" style="margin-top:10px;grid-template-columns:repeat(${strip.length},minmax(0,1fr))">${strip.map((x) => { const X = parse(x);
    return `<button class="daybtn ${x === day ? 'on' : ''} ${x < d && x !== day ? 'past' : ''}" onclick="A.day('${x}')"><small>${GG[X.getDay()].toUpperCase()}</small><b>${X.getDate()}</b></button>`; }).join('')}</div>
  <div class="col" style="gap:6px;margin-top:10px">${stays}</div>
  <div class="notes">${notes.map(noteCard).join('')}<button class="note add" onclick="A.noteForm(null,'${day}')">${svg('plus', 18, 2.2)} Nota veloce</button></div>
  ${unt}
  <div class="timeline" style="margin-top:12px">${hours}${evs}${now}</div>`;
}
function vPeriod(t) {
  const d = today(), N = Math.min(5, nDays(t));
  if (!ui.pStart) ui.pStart = d >= t.start && d <= t.end ? addDays(d, -2) : t.start;
  if (ui.pStart < t.start) ui.pStart = t.start;
  if (addDays(ui.pStart, N - 1) > t.end) ui.pStart = addDays(t.end, -(N - 1));
  const days = Array.from({ length: N }, (_, i) => addDays(ui.pStart, i));
  const TC = 30, cols = `${TC}px repeat(${N},minmax(0,1fr))`;
  const H0 = 7, H1 = 24, PX = 26, y = (m) => ((m - H0 * 60) / 60) * PX;
  const left = (i) => `calc(${TC}px + (100% - ${TC}px) * ${i} / ${N} + 1px)`, w = `calc((100% - ${TC}px) / ${N} - 2px)`;
  const headH = days.map((x) => { const X = parse(x), on = x === d;
    return `<button onclick="A.day('${x}',true)" style="height:44px;border:none;border-radius:8px;background:${on ? 'var(--ink)' : 'transparent'};color:${on ? 'var(--paper)' : x < d ? 'var(--mut)' : 'var(--ink)'};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0"><span style="font-size:11px">${GG[X.getDay()].toUpperCase()}</span><b style="font-size:17px;line-height:1.1">${X.getDate()}</b></button>`; }).join('');
  const stays = t.items.filter((i) => i.cat === 'Alloggio').map((i) => {
    const bLast = addDays(i.endDate || addDays(i.date, 1), -1), a = i.date < days[0] ? days[0] : i.date, b = bLast > days[N - 1] ? days[N - 1] : bLast;
    if (a > b) return '';
    return `<div onclick="A.entryForm('${i.id}')" style="grid-column:${diffDays(days[0], a) + 2} / span ${diffDays(a, b) + 1};grid-row:1;margin:0 1px;background:var(--c-all);border-radius:5px;padding:4px 6px;font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;cursor:pointer">${esc(i.title)}${i.status === 'pagato' ? ' ✓' : ''}</div>`; }).join('');
  const shade = days.map((x, i) => `<div style="position:absolute;top:0;height:${y(H1 * 60)}px;left:${left(i)};width:${w};background:${x < d ? 'rgba(31,42,68,.04)' : x === d ? 'rgba(244,207,107,.16)' : 'transparent'}"></div>`).join('');
  const lines = Array.from({ length: (H1 - H0) / 2 + 1 }, (_, k) => H0 + k * 2).map((h) => `<div style="position:absolute;left:0;right:0;top:${y(h * 60)}px;border-top:1px solid var(--line)"><span style="position:absolute;top:1px;font-size:10px;color:var(--mut)">${pad(h)}</span></div>`).join('');
  const evs = days.map((x, i) => dayEntries(t, x).timed.map((e) => { const a = tmin(e.time), b = Math.max(tmin(e.endTime) || a + 60, a + 30);
    const stx = e.todo ? `;border:1.5px dashed ${CATS[e.cat].s};border-left:3px solid ${CATS[e.cat].s}` : e.paid ? `;box-shadow:inset 0 0 0 1.5px ${CATS[e.cat].s}` : '';
    return `<div class="pcol-ev" onclick="A.openEntry('${e.kind}','${e.id}')" style="top:${y(a)}px;height:${Math.max(y(b) - y(a), 30)}px;left:${left(i)};width:${w};background:${CATS[e.cat].bg};border-left-color:${CATS[e.cat].s}${stx}${x < d ? ';opacity:.6' : ''}"><b>${esc(e.title)}</b><div style="color:#3E4658">${e.time}${e.paid ? ' <span style="color:var(--ok);font-weight:700">✓</span>' : ''}</div></div>`; }).join('')).join('');
  const nm = nowMin(), ti = days.indexOf(d);
  const now = ti >= 0 && nm >= H0 * 60 ? `<div style="position:absolute;top:${y(nm)}px;height:2px;left:${left(ti)};width:${w};background:var(--terra);z-index:2"></div>` : '';
  const canPrev = ui.pStart > t.start, canNext = addDays(ui.pStart, N - 1) < t.end;
  return `<div class="between" style="margin-top:6px"><button class="iconbtn" aria-label="Giorni precedenti" ${canPrev ? '' : 'disabled style="opacity:.3"'} onclick="A.shift(-${N})">${svg('left')}</button>
    <b style="font-size:14px">${fmtDay(days[0])} – ${fmtDay(days[N - 1])}</b>
    <button class="iconbtn" aria-label="Giorni successivi" ${canNext ? '' : 'disabled style="opacity:.3"'} onclick="A.shift(${N})">${svg('right')}</button></div>
  <div class="col" style="gap:4px;margin:0 -8px">
    <div style="display:grid;grid-template-columns:${cols}"><span></span>${headH}</div>
    <div style="display:grid;grid-template-columns:${cols};min-height:22px"><span style="font-size:10px;color:var(--mut);align-self:center">notte</span>${stays}</div>
    <div class="pgrid" style="height:${y(H1 * 60)}px;margin-top:4px">${shade}${lines}${evs}${now}</div>
  </div>`;
}

// --- Spese
function vSpese(t) {
  const sp = spent(t), bt = budgetTot(t), d = today(), np = t.people.length;
  let daily = '';
  if (bt && phase(t) === 'corso') { const left = diffDays(d, t.end); if (left > 0) { const r = (bt - sp) / left;
    daily = `<div class="small mut" style="margin-top:6px">Da domani: circa <b style="color:var(--ink)">${eur(r)} al giorno</b> ${pplLabel(t)}${np > 1 ? ` (${eur(r / np)} a testa)` : ''}</div>`; } }
  const tr = transfers(t);
  const saldo = np < 2 ? '' : `<div class="navy between" style="margin-top:14px;padding:14px 16px"><div class="col" style="gap:4px"><span class="mut" style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase">Saldo</span>
    ${tr.length ? tr.map((x) => `<span>${esc(x.from)} deve <b style="background:linear-gradient(transparent 55%,var(--terra) 55%);padding:0 2px">${eur(x.amount)}</b> a ${esc(x.to)}</span>`).join('') : '<span>Siete pari</span>'}</div>
    ${tr.length ? `<button onclick="A.settle()" style="height:36px;padding:0 12px;border-radius:18px;border:1px solid #C9CFDC;background:transparent;color:var(--paper);font-size:13px">Pareggiato</button>` : ''}</div>`;
  const byCat = {}; t.items.filter(isSpent).forEach((i) => { byCat[i.cat] = (byCat[i.cat] || 0) + num(i.price); });
  const bars = CAT_NAMES.map((c) => { const v = byCat[c] || 0, B = num(t.budget?.[c]); if (!v && !B) return '';
    const pct = B ? Math.min(100, (v / B) * 100) : 100, over = B && v > B;
    return `<div class="col" style="gap:4px"><div class="between small"><span>${c}</span><span><b>${eur(v)}</b>${B ? ' / ' + eur0(B) : ' · <span class="wavy">fuori budget</span>'}${over ? ' · <span class="wavy">sforato</span>' : ''}</span></div>
      <div class="bar"><span style="width:${pct}%;background:${CATS[c].s}"></span></div></div>`; }).join('');
  const all = t.items.filter((i) => num(i.price) > 0).sort((a, b) => (b.date + (b.time || '')).localeCompare(a.date + (a.time || '')));
  const dates = [...new Set(all.map((e) => e.date))];
  const list = dates.map((x) => { const rows = all.filter((e) => e.date === x);
    const lbl = x === d ? 'Oggi · ' + fmtDay(x) : x === addDays(d, -1) ? 'Ieri · ' + fmtDay(x) : fmtDay(x);
    return `<div class="between" style="margin-top:8px"><span class="lab">${lbl}</span><span class="small mut">${eur(rows.filter(isSpent).reduce((a, e) => a + num(e.price), 0))}</span></div>
    <div class="card list">${rows.map((e) => `<button class="between" style="width:100%;background:none;border:none;padding:10px 14px;text-align:left${e.status === 'da prenotare' ? ';opacity:.6' : ''}" onclick="A.entryForm('${e.id}')">
      <span class="row" style="align-items:stretch"><span style="width:5px;border-radius:3px;background:${CATS[e.cat].s}"></span><span class="col" style="gap:1px"><b style="font-size:14px">${esc(e.title)}</b><span class="t2">${e.cat} · ${esc(e.paidBy)} · ${e.split === 'all' ? (np === 2 ? '50/50' : 'divisa tra tutti') : 'solo ' + esc(e.split.join(', '))}${e.status === 'da prenotare' ? ' · da prenotare' : ''}</span></span></span>
      <b style="font-size:14px;white-space:nowrap">${eur(e.price)}</b></button>`).join('')}</div>`; }).join('');
  return `${head(plusBtn('A.entryForm()', 'Aggiungi voce'))}
  <div class="small mut">${tname(t)} · spese</div>
  <div class="row" style="align-items:baseline;gap:8px"><span class="serif" style="font-size:34px">${eur(sp)}</span>${bt ? `<span class="mut">su ${eur0(bt)} di budget</span>` : ''}</div>
  <div class="small mut">${np > 1 ? eur(sp / np) + ' a testa · ' : ''}${t.people.join(', ')}${bt ? ' · ' + Math.round((sp / bt) * 100) + '% del budget' : ''}</div>${daily}
  ${saldo}
  ${bt ? `<details class="card" style="margin-top:14px" ${ui.budOpen ? 'open' : ''} ontoggle="A.budToggle(this.open)"><summary class="between" style="padding:12px 16px;list-style:none;cursor:pointer;min-height:44px">
      <span class="lab">Budget per categoria</span><span class="row small" style="gap:4px">${Math.round((sp / bt) * 100)}% ${svg('chev', 16)}</span></summary>
      <div class="col" style="padding:0 16px 14px;gap:10px">${bars}<button class="btn ghost" style="height:40px" onclick="A.budgetForm()">Modifica budget</button></div></details>`
    : `<button onclick="A.budgetForm()" class="btn ghost" style="margin-top:14px;height:44px">Imposta un budget (facoltativo)</button>`}
  <div class="col" style="gap:6px;margin-top:10px">${list || '<div class="empty">Ancora nessuna spesa. Tocca + per aggiungerne una.</div>'}</div>`;
}

// --- To-do
function vTodo(t) {
  const all = t.todos || [], open = all.filter((x) => !x.done), done = all.filter((x) => x.done);
  const nodate = open.filter((x) => !x.date), dated = open.filter((x) => x.date).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const dates = [...new Set(dated.map((x) => x.date))];
  const row = (x) => `<div class="between" style="padding:6px 14px"><label class="check"><input type="checkbox" onchange="A.todoDone('${x.id}')"><span>${esc(x.text)}${x.time ? ` <span class="mut small">${x.time}</span>` : ''}</span></label>
    <button class="iconbtn" aria-label="Modifica" style="color:var(--mut)" onclick="A.todoForm('${x.id}')">${svg('edit', 18)}</button></div>`;
  const opts = ['<option value="">Senza data</option>'].concat(Array.from({ length: nDays(t) }, (_, i) => addDays(t.start, i)).map((x) => `<option value="${x}">${fmtDay(x)}</option>`)).join('');
  return `${head()}
  <h1>To-do <span class="hl">list</span></h1>
  <div class="small mut">${tname(t)} · ${open.length} da fare</div>
  <div class="card pad col" style="margin-top:14px;gap:8px">
    <input id="tdNew" class="inp" placeholder="Cosa c'è da fare?" onkeydown="if(event.key==='Enter')A.todoAdd()">
    <div class="row"><select id="tdDate" class="inp" style="flex:1">${opts}</select><button class="plus" style="border-radius:12px;width:48px;height:48px;background:var(--ink)" aria-label="Aggiungi" onclick="A.todoAdd()">${svg('plus', 20, 2.2)}</button></div>
  </div>
  ${nodate.length ? `<div class="sec"><div class="lab">Senza data · ${nodate.length}</div><div class="card list">${nodate.map(row).join('')}</div></div>` : ''}
  ${dates.map((x) => `<div class="sec"><div class="lab">${x === today() ? 'Oggi · ' : ''}${fmtDay(x)}</div><div class="card list">${dated.filter((y) => y.date === x).map(row).join('')}</div></div>`).join('')}
  ${!open.length ? '<div class="sec"><div class="empty">Tutto fatto. Le voci spuntate spariscono da sole.</div></div>' : ''}
  ${done.length ? `<div class="sec"><button onclick="A.showDone()" style="background:none;border:none;color:var(--mut);font-size:14px;min-height:44px;text-align:left">${ui.showDone ? 'Nascondi' : 'Mostra'} completate (${done.length})</button>
    ${ui.showDone ? `<div class="card list">${done.map((x) => `<div class="between" style="padding:10px 14px"><span class="done">${esc(x.text)}</span><button class="chip" style="height:30px" onclick="A.todoUndo('${x.id}')">Ripristina</button></div>`).join('')}</div>` : ''}</div>` : ''}`;
}

// --- Assistente
function vAssist(t) {
  const ex = ['Quanto può essere grande il bagaglio a mano?', 'Ristoranti aperti stasera vicino all\'alloggio', 'Come ci muoviamo dall\'aeroporto al centro?', 'Cosa fare domani se piove?'];
  return `${head()}
  <h1>Assistente <span class="hl">di viaggio</span></h1>
  <div class="small mut">${tname(t)}</div>
  <div class="navy col" style="margin-top:14px;gap:8px"><b class="serif" style="font-size:20px">In arrivo</b>
    <div style="font-size:14px;line-height:1.45">Qui potrete chiedere qualsiasi cosa sul viaggio: bagagli, mezzi, ristoranti, hotel, bar vicino a dove siete. Risponde cercando online e conosce già il vostro programma e le prenotazioni.</div>
    <div class="small mut">Si attiva dopo la sincronizzazione tra i vostri telefoni.</div></div>
  <div class="sec"><div class="lab">Esempi di domande</div>${ex.map((q) => `<div class="card" style="padding:12px 14px;font-size:15px;color:var(--mut)">“${q}”</div>`).join('')}</div>`;
}

// ---------- fogli (form)
function sheet(html) { const s = $('#sheet'); s.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`; s.hidden = false;
  s.onclick = (e) => { if (e.target === s) closeSheet(); }; }
function closeSheet() { const s = $('#sheet'); s.hidden = true; s.innerHTML = ''; }
const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
const sheetHead = (title, saveFn) => `<div class="between"><button onclick="A.close()" style="background:none;border:none;color:var(--mut);min-height:44px;font-size:15px">Annulla</button><b class="serif" style="font-size:18px">${title}</b><button onclick="${saveFn}" style="background:none;border:none;color:var(--terra);font-weight:700;min-height:44px;font-size:15px">Salva</button></div>`;
const segH = (name, opts, cur) => `<div class="seg" data-seg="${name}" style="flex-wrap:wrap">${opts.map(([v, l]) => `<button type="button" class="${v === cur ? 'on' : ''}" data-v="${esc(v)}" onclick="A.seg(this)">${l}</button>`).join('')}</div>`;
const segVal = (name) => { const b = document.querySelector(`[data-seg="${name}"] .on`); return b ? b.dataset.v : ''; };
const multiH = (name, opts, sel) => `<div class="seg" data-multi="${name}" style="flex-wrap:wrap">${opts.map((v) => `<button type="button" class="${sel.includes(v) ? 'on' : ''}" data-v="${esc(v)}" onclick="A.tog(this)">${esc(v)}</button>`).join('')}</div>`;
const multiVal = (name) => [...document.querySelectorAll(`[data-multi="${name}"] .on`)].map((b) => b.dataset.v);
const filesBlock = (files) => `<div class="field"><label>Foto, ricevute, biglietti</label>
  <div class="thumbs" id="thumbs">${thumbsHtml(files)}</div>
  <label class="attach">${svg('camera', 20)} Scatta foto o carica file<input type="file" accept="image/*,application/pdf" multiple onchange="A.addFiles(this)"></label></div>`;
const thumbsHtml = (files) => (files || []).map((f, i) => `<span class="thumbw"><a href="#" onclick="A.viewFile(${i});return false">${f.type.startsWith('image') ? `<img src="${f.data}" alt="">` : 'PDF'}</a><button type="button" class="thx" aria-label="Rimuovi" onclick="A.rmFile(${i})">×</button></span>`).join('');
let draftFiles = [];

// --- Nuovo / modifica viaggio con partecipanti
let draftPeople = [];
function tripForm(id) {
  const t = id ? trip(id) : null; const s = t ? t.start : today(), e = t ? t.end : addDays(today(), 3);
  const lastPeople = db.trips.length ? db.trips[db.trips.length - 1].people : DEFAULT_PEOPLE;
  draftPeople = (t ? t.people : lastPeople).slice();
  sheet(`${sheetHead(t ? 'Modifica viaggio' : 'Nuovo viaggio', `A.saveTrip('${id || ''}')`)}
  <div class="field"><label for="f_name">Destinazione</label><input id="f_name" class="inp" value="${esc(t ? t.name + (t.emoji ? ' ' + t.emoji : '') : '')}" placeholder="Es. Londra ✈️ (le emoji puoi scriverle qui)"></div>
  <div class="grid2"><div class="field"><label for="f_s">Partenza</label><input id="f_s" type="date" class="inp" value="${s}"></div><div class="field"><label for="f_e">Ritorno</label><input id="f_e" type="date" class="inp" value="${e}"></div></div>
  <div class="field"><label>Partecipanti · le spese si dividono tra loro</label><div id="pplBox" class="col" style="gap:8px">${pplRows()}</div>
    <button type="button" class="chip" style="align-self:flex-start;margin-top:4px" onclick="A.pplAdd()">+ Aggiungi persona</button></div>
  ${t ? `<button class="btn ghost" onclick="A.close();A.tab('spese');A.budgetForm()">Budget</button><button class="btn danger" onclick="A.delTrip('${t.id}')">Elimina viaggio</button>` : ''}`);
}
function pplRows() { return draftPeople.map((p, i) => `<div class="row"><input class="inp" value="${esc(p)}" placeholder="Nome" oninput="A.pplSet(${i},this.value)">${draftPeople.length > 1 ? `<button type="button" class="iconbtn" aria-label="Rimuovi persona" onclick="A.pplDel(${i})" style="color:var(--mut)">${svg('x', 18)}</button>` : ''}</div>`).join(''); }
function saveTrip(id) {
  const name = val('f_name'), s = val('f_s'), e = val('f_e');
  const people = [...new Set(draftPeople.map((p) => p.trim()).filter(Boolean))];
  if (!name || !s || !e) return toast('Servono destinazione e date');
  if (e < s) return toast('Il ritorno è prima della partenza');
  if (!people.length) return toast('Serve almeno un partecipante');
  if (id) { const t = trip(id); const old = t.people; Object.assign(t, { name, emoji: '', start: s, end: e, people });
    t.items.forEach((i) => { if (!people.includes(i.paidBy)) i.paidBy = people[old.indexOf(i.paidBy)] || people[0];
      if (i.split !== 'all') { i.split = i.split.map((p) => people.includes(p) ? p : people[old.indexOf(p)]).filter(Boolean); if (!i.split.length) i.split = 'all'; } }); }
  else { const t = migrate({ id: uid(), name, start: s, end: e, people, budget: {}, items: [], todos: [], notes: [] }); db.trips.push(t); ui.tripId = t.id; }
  save(); closeSheet(); if (!id) go('trip', { tab: 'viaggio', mode: 'giorno', day: null, pStart: null }); else render();
}

// --- Voce unica (calendario + spese)
function catFields(c, i) {
  const f = { ...(i?.f || {}), title: i?.title || '', date: i?.date || '', time: i?.time || '', endDate: i?.endDate || '', endTime: i?.endTime || '' };
  const rows = FIELDS[c].map(([k, l, type, ph]) => {
    if (type === 'kind') return `<div class="field full"><label>${l}</label>${segH('kind_' + c, TRANSPORT_TYPES.map((x) => [x, x]), f.kind || 'Volo')}</div>`;
    const it = type === 'text' || type === 'tel' ? type : type;
    return `<div class="field ${['title', 'address', 'baggage', 'host'].includes(k) ? 'full' : ''}"><label for="cf_${c}_${k}">${l}</label><input id="cf_${c}_${k}" data-k="${k}" type="${it}" class="inp" value="${esc(f[k] || '')}" placeholder="${esc(ph || '')}"></div>`;
  }).join('');
  return `<div class="catblock grid2" data-cat="${c}" ${c === (i?.cat || ui.formCat) ? '' : 'hidden'}>${rows}</div>`;
}
function entryForm(id) {
  const t = trip(ui.tripId); const i = id ? t.items.find((x) => x.id === id) : null;
  const d = today(); const defDate = ui.tab === 'viaggio' && ui.day ? ui.day : (d >= t.start && d <= t.end ? d : t.start);
  ui.formCat = i?.cat || ui.lastCat || 'Cibo'; draftFiles = (i?.files || []).slice();
  const ii = i || { date: defDate, status: 'pagato' };
  const split = i ? i.split : 'all';
  sheet(`${sheetHead(i ? 'Modifica voce' : 'Nuova voce', `A.saveEntry('${id || ''}')`)}
  <div class="catrow">${CAT_NAMES.map((c) => `<button type="button" class="catchip ${c === ui.formCat ? 'on' : ''}" data-c="${c}" style="--cbg:${CATS[c].bg};--cs:${CATS[c].s}" onclick="A.setCat('${c}')">${svg(CATS[c].icon, 18)}<span>${c}</span></button>`).join('')}</div>
  <div class="col" style="align-items:center;gap:0"><label class="lab" for="f_amt">Importo</label><input id="f_amt" class="amount" inputmode="decimal" placeholder="0,00 €" value="${i && i.price ? String(i.price).replace('.', ',') : ''}"></div>
  ${CAT_NAMES.map((c) => catFields(c, c === ui.formCat ? ii : { date: ii.date })).join('')}
  <div class="field"><label>Stato</label>${segH('status', STATUS, ii.status || 'pagato')}</div>
  <div class="field"><label>Pagato da</label>${segH('paid', t.people.map((p) => [p, p]), i?.paidBy || t.people[0])}</div>
  ${t.people.length > 1 ? `<div class="field"><label>Per chi</label>${segH('splitmode', [['all', t.people.length === 2 ? '50/50' : 'Tutti'], ['some', 'Solo alcuni']], split === 'all' ? 'all' : 'some')}
    <div id="splitPick" ${split === 'all' ? 'hidden' : ''} style="margin-top:6px">${multiH('splitp', t.people, split === 'all' ? [] : split)}</div></div>` : ''}
  <details class="card" style="padding:0 14px" ${i && (i.code || i.link || i.note || (i.files || []).length) ? 'open' : ''}><summary style="min-height:46px;display:flex;align-items:center;font-weight:700;font-size:14px;cursor:pointer">Altri dettagli: codice, link, allegati, note</summary>
    <div class="col" style="gap:12px;padding-bottom:14px">
      <div class="grid2"><div class="field"><label for="f_code">Codice conferma</label><input id="f_code" class="inp" value="${esc(i?.code || '')}"></div>
      <div class="field"><label for="f_link">Link</label><input id="f_link" class="inp" value="${esc(i?.link || '')}" placeholder="https://"></div></div>
      ${filesBlock(draftFiles)}
      <div class="field"><label for="f_note">Note</label><textarea id="f_note" class="inp">${esc(i?.note || '')}</textarea></div></div></details>
  ${i && (i.f?.address || i.link) ? `<div class="grid2">${i.f?.address ? `<a class="btn ghost" style="display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none" target="_blank" rel="noopener" href="https://maps.apple.com/?q=${encodeURIComponent(i.f.address)}">${svg('pin', 18)} Apri in Maps</a>` : '<span></span>'}${i.link ? `<a class="btn ghost" style="display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none" target="_blank" rel="noopener" href="${esc(i.link)}">${svg('link', 18)} Apri link</a>` : ''}</div>` : ''}
  <button class="btn" onclick="A.saveEntry('${id || ''}')">Salva</button>
  ${i ? `<button class="btn danger" onclick="A.delEntry('${i.id}')">Elimina</button>` : ''}`);
}
function setCat(c) {
  const prev = document.querySelector(`.catblock[data-cat="${ui.formCat}"]`); const next = document.querySelector(`.catblock[data-cat="${c}"]`);
  // porta con sé nome, data e ora già scritti
  ['title', 'date', 'time', 'endTime'].forEach((k) => { const a = prev && prev.querySelector(`[data-k="${k}"]`), b = next.querySelector(`[data-k="${k}"]`); if (a && b && a.value && !b.value) b.value = a.value; });
  document.querySelectorAll('.catblock').forEach((b) => { b.hidden = b.dataset.cat !== c; });
  document.querySelectorAll('.catchip').forEach((b) => b.classList.toggle('on', b.dataset.c === c));
  ui.formCat = c;
}
function saveEntry(id) {
  const t = trip(ui.tripId), c = ui.formCat, blk = document.querySelector(`.catblock[data-cat="${c}"]`);
  const g = (k) => { const el = blk.querySelector(`[data-k="${k}"]`); return el ? el.value.trim() : ''; };
  const f = {}; FIELDS[c].forEach(([k, , type]) => { if (type === 'kind') f.kind = segVal('kind_' + c); else if (!['title', 'date', 'time', 'endDate', 'endTime'].includes(k)) f[k] = g(k); });
  let title = g('title');
  if (c === 'Trasporti') title = [f.kind && f.kind !== 'Taxi / altro' ? f.kind : '', f.from && f.to ? `${f.from} → ${f.to}` : f.from || f.to || '', f.company ? '· ' + f.company : ''].filter(Boolean).join(' ') || f.kind || 'Trasporto';
  const price = numIn(val('f_amt'));
  if (!title) title = c === 'Cibo' ? 'Pasto' : c;
  const mode = segVal('splitmode') || 'all'; let split = 'all';
  if (mode === 'some') { split = multiVal('splitp'); if (!split.length) return toast('Scegli per chi è la spesa'); if (split.length === t.people.length) split = 'all'; }
  const o = { cat: c, title, price, status: segVal('status'), paidBy: segVal('paid') || t.people[0], split, date: g('date') || today(), time: g('time'), endDate: g('endDate'), endTime: g('endTime'),
    f, code: val('f_code'), link: val('f_link'), note: val('f_note'), files: draftFiles };
  if (c === 'Alloggio' && (!o.endDate || o.endDate <= o.date)) o.endDate = addDays(o.date, 1);
  if (c !== 'Alloggio' && o.endDate === o.date) o.endDate = '';
  if (id) Object.assign(t.items.find((x) => x.id === id), o); else t.items.push({ id: uid(), ...o });
  ui.lastCat = c;
  if (ui.fromNote) { t.notes = t.notes.filter((n) => n.id !== ui.fromNote); ui.fromNote = null; }
  if (save()) { closeSheet(); render(); toast('Salvato'); }
}

// --- Note veloci
function noteForm(id, date) {
  const t = trip(ui.tripId); const n = id ? t.notes.find((x) => x.id === id) : null;
  sheet(`<div class="between"><button onclick="A.close()" style="background:none;border:none;color:var(--mut);min-height:44px;font-size:15px">Chiudi</button><b class="serif" style="font-size:18px">Nota veloce</b><button onclick="A.saveNote('${id || ''}','${date || n?.date || ''}')" style="background:none;border:none;color:var(--terra);font-weight:700;min-height:44px;font-size:15px">Fatto</button></div>
  <textarea id="f_notetext" class="notearea" placeholder="Scrivi al volo: un posto, un prezzo, un'idea…">${esc(n?.text || '')}</textarea>
  ${n ? `<button class="btn" onclick="A.noteToEntry('${n.id}')">Completa come voce</button><div class="small mut" style="text-align:center">Diventa una voce con categoria, prezzo, orario e tutti i dettagli.</div>
  <button class="btn danger" onclick="A.delNote('${n.id}')">Elimina nota</button>` : ''}`);
  setTimeout(() => { const el = document.getElementById('f_notetext'); if (el) el.focus(); }, 60);
}
function saveNote(id, date) {
  const t = trip(ui.tripId); const text = val('f_notetext');
  if (!text) { if (id) t.notes = t.notes.filter((x) => x.id !== id); }
  else if (id) t.notes.find((x) => x.id === id).text = text;
  else t.notes.push({ id: uid(), text, date: date || today() });
  save(); closeSheet(); render();
}
function noteToEntry(id) {
  const t = trip(ui.tripId); const n = t.notes.find((x) => x.id === id); const text = val('f_notetext') || n.text;
  ui.day = n.date; entryForm(); ui.fromNote = id;
  setTimeout(() => { const b = document.querySelector(`.catblock[data-cat="${ui.formCat}"] [data-k="title"]`); if (b) b.value = text; const nt = document.getElementById('f_note'); if (nt) nt.value = text; }, 0);
}

// --- To-do
function todoForm(id, date) {
  const t = trip(ui.tripId); const x = id ? t.todos.find((y) => y.id === id) : null;
  sheet(`${sheetHead(x ? 'Modifica to-do' : 'Nuovo to-do', `A.saveTodo('${id || ''}')`)}
  <div class="field"><label for="f_text">Cosa</label><input id="f_text" class="inp" value="${esc(x?.text || '')}"></div>
  <div class="grid2"><div class="field"><label for="f_date">Giorno (facoltativo)</label><input id="f_date" type="date" class="inp" value="${x?.date || date || ''}" min="${t.start}" max="${t.end}"></div>
    <div class="field"><label for="f_time">Ora (facoltativa)</label><input id="f_time" type="time" class="inp" value="${x?.time || ''}"></div></div>
  <div class="small mut">Con giorno e ora compare anche nel calendario.</div>
  ${x ? `<button class="btn danger" onclick="A.todoDel('${x.id}')">Elimina</button>` : ''}`);
}
function saveTodo(id) {
  const t = trip(ui.tripId); const text = val('f_text'); if (!text) return toast('Scrivi cosa c\'è da fare');
  const o = { text, date: val('f_date'), time: val('f_time') };
  if (id) Object.assign(t.todos.find((y) => y.id === id), o); else t.todos.push({ id: uid(), done: false, ...o });
  save(); closeSheet(); render();
}

// --- Budget
function budgetForm() {
  const t = trip(ui.tripId); const B = t.budget || {}; const n = nDays(t), np = t.people.length;
  const rows = CAT_NAMES.map((c) => { const booked = t.items.filter((i) => i.cat === c && isSpent(i)).reduce((a, i) => a + num(i.price), 0);
    return `<div class="card" style="overflow:hidden"><div style="background:${CATS[c].bg};padding:8px 14px;font-size:14px;font-weight:700">${c}</div>
    <div class="col" style="padding:12px 14px;gap:8px">
      <div class="between"><div class="row" style="gap:6px"><input class="inp" style="width:110px;text-align:right;font-weight:700" inputmode="decimal" id="bv_${c}" value="${B[c] ? String(B[c]).replace('.', ',') : ''}" placeholder="0" oninput="A.bcalc()"><b>€</b></div>
        <span class="small mut" id="bt_${c}">${B[c] && np > 1 ? eur0(B[c] / np) + ' a testa' : pplLabel(t)}</span></div>
      <details><summary class="small" style="color:var(--terra);font-weight:700;cursor:pointer;min-height:32px;display:flex;align-items:center">Calcola a giorno</summary>
        <div class="row small" style="gap:6px;margin-top:6px;flex-wrap:wrap"><input class="inp" style="width:80px;height:40px;text-align:center" inputmode="decimal" id="bu_${c}" placeholder="0" oninput="A.bcalc('${c}')"><span class="nw">€ al giorno ${pplLabel(t)} ×</span>
          <input class="inp" style="width:56px;height:40px;text-align:center" inputmode="numeric" id="bq_${c}" value="${n}" oninput="A.bcalc('${c}')"><span>giorni</span></div></details>
      ${booked ? `<div class="small mut">Già speso o prenotato: <b style="color:var(--ink)">${eur(booked)}</b>${B[c] ? (booked <= B[c] ? ' · <span style="color:var(--ok);font-weight:700">restano ' + eur0(B[c] - booked) + '</span>' : ' · <span class="wavy">sopra budget</span>') : ''}</div>` : ''}</div></div>`; }).join('');
  sheet(`${sheetHead('Budget', 'A.saveBudget()')}
  <div class="navy col" style="gap:2px"><span class="mut" style="font-size:12px;letter-spacing:1.2px;text-transform:uppercase">Budget totale · ${pplLabel(t)}</span>
    <span class="serif" style="font-size:32px" id="bTot">${eur0(budgetTot(t))}</span><span class="small mut" id="bHead">${np > 1 ? eur0(budgetTot(t) / np) + ' a testa · ' : ''}${n} giorni</span></div>
  <div class="small mut" style="line-height:1.45">Per ogni categoria scrivi <b style="color:var(--ink)">quanto pensate di spendere ${pplLabel(t)}</b>, per tutto il viaggio. È facoltativo: lascia vuoto quello che non ti interessa.</div>
  ${rows}`);
}
function bcalc(from) {
  const t = trip(ui.tripId), np = t.people.length;
  if (from) { const u = numIn(val('bu_' + from)), q = numIn(val('bq_' + from)); if (u && q) document.getElementById('bv_' + from).value = String(Math.round(u * q * 100) / 100).replace('.', ','); }
  let tot = 0; CAT_NAMES.forEach((c) => { const v = numIn(val('bv_' + c)); document.getElementById('bt_' + c).textContent = v && np > 1 ? eur0(v / np) + ' a testa' : pplLabel(t); tot += v; });
  document.getElementById('bTot').textContent = eur0(tot); document.getElementById('bHead').textContent = `${np > 1 ? eur0(tot / np) + ' a testa · ' : ''}${nDays(t)} giorni`;
}
function saveBudget() { const t = trip(ui.tripId); t.budget = {}; CAT_NAMES.forEach((c) => { const v = numIn(val('bv_' + c)); if (v) t.budget[c] = v; });
  save(); closeSheet(); render(); toast('Budget salvato'); }

// --- Backup
function settings() {
  sheet(`<div class="between"><b class="serif" style="font-size:18px">Backup e impostazioni</b><button onclick="A.close()" style="background:none;border:none;color:var(--terra);font-weight:700;min-height:44px">Chiudi</button></div>
  <div class="small mut">Per ora i dati stanno solo su questo telefono. Con il backup puoi salvarli in un file (per esempio su Drive o iCloud) e caricarli su un altro telefono.</div>
  <button class="btn ghost" onclick="A.exportData()">Scarica backup</button>
  <label class="btn ghost" style="display:flex;align-items:center;justify-content:center;position:relative">Carica backup o file di import<input type="file" accept="application/json,.json" style="position:absolute;inset:0;opacity:0" onchange="A.importData(this)"></label>
  <button class="btn ghost" onclick="A.addDemo()">Aggiungi viaggio di esempio</button>
  <div class="small mut">NEMO · prototipo v3</div>`);
}
function exportData() {
  const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nemo-backup-${today()}.json`; a.click();
}
function importData(input) {
  const f = input.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { const data = JSON.parse(r.result); const trips = data.trips || (data.trip ? [data.trip] : []);
      if (!trips.length) throw new Error('vuoto');
      trips.forEach((t) => { if (!t.id) t.id = uid(); migrate(t); const i = db.trips.findIndex((x) => x.id === t.id); if (i >= 0) db.trips[i] = t; else db.trips.push(t); });
      save(); closeSheet(); go('home'); toast(`${trips.length} viaggi caricati`);
    } catch (e) { toast('File non valido'); } };
  r.readAsText(f);
}

// ---------- allegati
function addFiles(input) {
  const files = [...input.files]; let pending = files.length; if (!pending) return;
  const done = () => { if (!--pending) refreshThumbs(); };
  files.forEach((f) => {
    if (f.type === 'application/pdf') {
      if (f.size > 1.5e6) { toast('PDF troppo grande (max 1,5 MB)'); return done(); }
      const r = new FileReader(); r.onload = () => { draftFiles.push({ name: f.name, type: f.type, data: r.result }); done(); }; r.readAsDataURL(f);
    } else {
      const img = new Image(); const url = URL.createObjectURL(f);
      img.onload = () => { const s = Math.min(1, 1200 / Math.max(img.width, img.height)); const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        draftFiles.push({ name: f.name, type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.72) }); URL.revokeObjectURL(url); done(); };
      img.onerror = done; img.src = url;
    }
  });
}
function refreshThumbs() { const el = document.getElementById('thumbs'); if (el) el.innerHTML = thumbsHtml(draftFiles); }
function viewFile(i) { const f = draftFiles[i]; if (!f) return; fetch(f.data).then((r) => r.blob()).then((b) => window.open(URL.createObjectURL(b), '_blank')); }

// ---------- toast
let toastT, toastFn = null;
function toast(msg, action, fn) { const el = $('#toast'); toastFn = fn || null;
  el.innerHTML = esc(msg) + (action ? ` <button onclick="A.toastAct()" style="margin-left:10px;background:none;border:none;color:var(--hl);font-weight:700;font-size:14px;min-height:32px">${esc(action)}</button>` : '');
  el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; toastFn = null; }, action ? 4000 : 2200); }

// ---------- API per i pulsanti
window.A = {
  home: () => go('home'),
  open: (id, tab) => go('trip', { tripId: id, tab: tab || 'viaggio', day: null, pStart: null, mode: 'giorno', scrollNow: true }),
  tab: (k) => { ui.tab = k; ui.scrollNow = k === 'viaggio'; window.scrollTo(0, 0); render(); },
  mode: (m) => { ui.mode = m; ui.scrollNow = m === 'giorno'; render(); },
  day: (d, fromPeriod) => { ui.day = d; if (fromPeriod) ui.mode = 'giorno'; ui.scrollNow = true; render(); },
  shift: (n) => { ui.pStart = addDays(ui.pStart, n); render(); },
  close: () => { ui.fromNote = null; closeSheet(); },
  seg: (b) => { b.parentNode.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on');
    if (b.parentNode.dataset.seg === 'splitmode') { const p = document.getElementById('splitPick'); if (p) p.hidden = b.dataset.v !== 'some'; } },
  tog: (b) => b.classList.toggle('on'),
  tripForm, saveTrip, entryForm, saveEntry, setCat, noteForm, saveNote, noteToEntry, todoForm, saveTodo, budgetForm, bcalc, saveBudget,
  settings, exportData, importData, addFiles, viewFile,
  rmFile: (i) => { draftFiles.splice(i, 1); refreshThumbs(); },
  pplAdd: () => { draftPeople.push(''); document.getElementById('pplBox').innerHTML = pplRows(); const ins = document.querySelectorAll('#pplBox input'); ins[ins.length - 1].focus(); },
  pplDel: (i) => { draftPeople.splice(i, 1); document.getElementById('pplBox').innerHTML = pplRows(); },
  pplSet: (i, v) => { draftPeople[i] = v; },
  itemForm: (id) => entryForm(id), expForm: (id) => entryForm(id),
  openEntry: (kind, id) => (kind === 'item' ? entryForm(id) : todoForm(id)),
  delEntry: (id) => { if (!confirm('Eliminare questa voce?')) return; const t = trip(ui.tripId); t.items = t.items.filter((x) => x.id !== id); save(); closeSheet(); render(); },
  delNote: (id) => { const t = trip(ui.tripId); t.notes = t.notes.filter((x) => x.id !== id); save(); closeSheet(); render(); },
  delTrip: (id) => { if (!confirm('Eliminare tutto il viaggio? Non si può annullare.')) return; db.trips = db.trips.filter((x) => x.id !== id); save(); closeSheet(); go('home'); },
  budToggle: (o) => { ui.budOpen = o; }, untToggle: (o) => { ui.untOpen = o; },
  todoAdd: () => { const v = val('tdNew'); if (!v) return; const t = trip(ui.tripId); t.todos.push({ id: uid(), text: v, date: val('tdDate'), time: '', done: false }); save(); render(); },
  todoDone: (id) => { const t = trip(ui.tripId); const x = t.todos.find((y) => y.id === id); x.done = true; save(); render(); toast('Fatto', 'Annulla', () => { x.done = false; save(); render(); }); },
  todoUndo: (id) => { const t = trip(ui.tripId); t.todos.find((y) => y.id === id).done = false; save(); render(); },
  todoDel: (id) => { const t = trip(ui.tripId); t.todos = t.todos.filter((y) => y.id !== id); save(); closeSheet(); render(); },
  showDone: () => { ui.showDone = !ui.showDone; render(); },
  toastAct: () => { const f = toastFn; $('#toast').hidden = true; toastFn = null; if (f) f(); },
  settle: () => { const t = trip(ui.tripId); const tr = transfers(t); if (!tr.length) return;
    if (!confirm(tr.map((x) => `${x.from} → ${x.to}: ${eur(x.amount)}`).join('\n') + '\n\nSegnare come pareggiato?')) return;
    tr.forEach((x) => t.settlements.push({ ...x, date: today() })); save(); render(); },
  addDemo: () => { db.trips.push(migrate(demoTrip())); save(); closeSheet(); go('home'); },
};

load(); render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
