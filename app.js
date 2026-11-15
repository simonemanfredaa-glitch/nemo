/* NEMO — prototipo. Dati salvati solo su questo telefono (localStorage). */
(function () {
'use strict';

// ---------- costanti
const KEY = 'nemo.v1';
const PEOPLE = ['Simone', 'Fedra'];
const CATS = {
  Trasporti:  { bg: 'var(--c-tra)', s: 'var(--c-tra-s)', icon: 'plane' },
  Alloggio:   { bg: 'var(--c-all)', s: 'var(--c-all-s)', icon: 'bed' },
  Cibo:       { bg: 'var(--c-cib)', s: 'var(--c-cib-s)', icon: 'food' },
  Esperienze: { bg: 'var(--c-esp)', s: 'var(--c-esp-s)', icon: 'ticket' },
  Varie:      { bg: 'var(--c-var)', s: 'var(--c-var-s)', icon: 'bag' },
};
const CAT_NAMES = Object.keys(CATS);
const STATUS = ['da prenotare', 'prenotato', 'pagato'];
const GG = ['dom', 'lun', 'mar', 'mer', 'gio', 'ven', 'sab'];
const GGL = ['Domenica', 'Lunedì', 'Martedì', 'Mercoledì', 'Giovedì', 'Venerdì', 'Sabato'];
const MM = ['gen', 'feb', 'mar', 'apr', 'mag', 'giu', 'lug', 'ago', 'set', 'ott', 'nov', 'dic'];
const MML = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];

const ICONS = {
  plus: '<path d="M12 5v14M5 12h14"/>',
  back: '<path d="M15 6l-6 6 6 6"/>',
  home: '<path d="M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z"/>',
  cal: '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M3 10h18M8 3v4M16 3v4"/>',
  card: '<rect x="3" y="6" width="18" height="13" rx="2"/><path d="M3 10h18M7 15h3"/>',
  pin: '<path d="M12 21s-7-6.2-7-11.5A7 7 0 0 1 19 9.5C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
  more: '<circle cx="5" cy="12" r="1.5"/><circle cx="12" cy="12" r="1.5"/><circle cx="19" cy="12" r="1.5"/>',
  plane: '<path d="M2 16l20-6-3-3-7 3-5-4-2 1 3 5-4 1z"/><path d="M3 21h18"/>',
  bed: '<path d="M3 20V8l9-5 9 5v12"/><path d="M9 20v-6h6v6"/>',
  food: '<path d="M7 3v8M5 3v5a2 2 0 0 0 4 0V3M7 11v10M17 3c-2 0-3 2-3 5s1 4 3 4v9"/>',
  ticket: '<path d="M4 7h16v3a2 2 0 0 0 0 4v3H4v-3a2 2 0 0 0 0-4z"/>',
  bag: '<path d="M5 8h14l-1 13H6z"/><path d="M9 8V6a3 3 0 0 1 6 0v2"/>',
  camera: '<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>',
  link: '<path d="M10 14a4 4 0 0 0 6 0l3-3a4 4 0 0 0-6-6l-1 1"/><path d="M14 10a4 4 0 0 0-6 0l-3 3a4 4 0 0 0 6 6l1-1"/>',
  check: '<path d="M4 12l5 5L20 6"/>', chat: '<path d="M21 12a8 8 0 0 1-11.6 7.1L4 20l1-4.6A8 8 0 1 1 21 12z"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/>', chev: '<path d="M9 6l6 6-6 6"/>',
  left: '<path d="M15 6l-6 6 6 6"/>', right: '<path d="M9 6l6 6-6 6"/>',
};
const svg = (k, s = 22, w = 2) => `<svg width="${s}" height="${s}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="${w}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${ICONS[k]}</svg>`;

// ---------- utilità
const $ = (s) => document.querySelector(s);
const uid = () => Math.random().toString(36).slice(2, 10);
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const eur = (n) => (Number(n) || 0).toLocaleString('it-IT', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' €';
const eur0 = (n) => Math.round(Number(n) || 0).toLocaleString('it-IT') + ' €';
const num = (v) => (typeof v === 'number' ? v : numIn(v));
const numIn = (v) => { const s = String(v ?? '').trim(); if (!s) return 0; return parseFloat(s.includes(',') ? s.replace(/\./g, '').replace(',', '.') : s) || 0; };
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
  if (!db || !Array.isArray(db.trips)) { db = { trips: [demoTrip()], v: 2 }; }
  db.trips.forEach(migrate); db.v = 2; save();
}
function migrate(t) {
  if (!t.todos) {
    t.todos = (t.checklist || []).map((c) => ({ id: c.id || uid(), text: c.text, date: '', time: '', done: !!c.done }))
      .concat((t.ideas || []).map((x) => ({ id: x.id || uid(), text: x.title, date: x.date || '', time: x.time || '', link: x.link || '', done: !!x.done })));
  }
  t.ideas = []; t.checklist = [];
  ['items', 'expenses'].forEach((k) => { t[k] = t[k] || []; }); t.budget = t.budget || {};
  return t;
}
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(db)); return true; }
  catch (e) { toast('Memoria del telefono piena: togli qualche allegato'); return false; }
}
const trip = (id) => db.trips.find((t) => t.id === id);

function demoTrip() {
  const s = addDays(today(), -2), e = addDays(s, 4);
  const d = (n) => addDays(s, n);
  return {
    id: uid(), name: 'Lisbona · esempio', emoji: '✈️', start: s, end: e, people: PEOPLE.slice(), demo: true,
    budget: { Trasporti: 300, Alloggio: 450, Cibo: 300, Esperienze: 150, Varie: 80 },
    items: [
      { id: uid(), cat: 'Trasporti', title: 'Volo MXP → LIS', date: d(0), time: '07:10', endTime: '09:00', price: 120, status: 'pagato', paidBy: 'Simone', split: '50/50', code: '', link: '', address: '', cancel: '', note: '', files: [] },
      { id: uid(), cat: 'Alloggio', title: 'Casa do Bairro', date: d(0), endDate: d(4), price: 420, status: 'pagato', paidBy: 'Fedra', split: '50/50', code: '', link: '', address: 'Bairro Alto, Lisbona', cancel: '', note: 'Appartamento di esempio', files: [] },
      { id: uid(), cat: 'Esperienze', title: 'Oceanario', date: d(2), time: '10:00', endTime: '12:00', price: 44, status: 'prenotato', paidBy: 'Simone', split: '50/50', code: '', link: '', address: 'Parque das Nações', cancel: '', note: '', files: [] },
      { id: uid(), cat: 'Esperienze', title: 'Serata di fado', date: d(2), time: '21:30', endTime: '23:00', price: 50, status: 'da prenotare', paidBy: 'Simone', split: '50/50', code: '', link: '', address: 'Alfama', cancel: '', note: '', files: [] },
      { id: uid(), cat: 'Trasporti', title: 'Volo LIS → MXP', date: d(4), time: '19:40', endTime: '23:30', price: 110, status: 'pagato', paidBy: 'Fedra', split: '50/50', code: '', link: '', address: '', cancel: '', note: '', files: [] },
    ],
    expenses: [
      { id: uid(), date: d(0), desc: 'Pasti', cat: 'Cibo', amount: 48, paidBy: 'Simone', split: '50/50', files: [] },
      { id: uid(), date: d(0), desc: 'Carta metro', cat: 'Trasporti', amount: 13, paidBy: 'Fedra', split: '50/50', files: [] },
      { id: uid(), date: d(1), desc: 'Pranzo', cat: 'Cibo', amount: 36, paidBy: 'Fedra', split: '50/50', files: [] },
      { id: uid(), date: d(1), desc: 'Tram 28', cat: 'Trasporti', amount: 6, paidBy: 'Simone', split: '50/50', files: [] },
      { id: uid(), date: d(1), desc: 'Souvenir', cat: 'Varie', amount: 18, paidBy: 'Fedra', split: 'Fedra', files: [] },
      { id: uid(), date: d(2), desc: 'Colazione', cat: 'Cibo', amount: 9, paidBy: 'Simone', split: '50/50', files: [] },
    ],
    ideas: [
      { id: uid(), title: 'Giro sul tram 28', cat: 'Esperienze', link: '', date: d(1), time: '', done: true },
      { id: uid(), title: 'Tramonto al Miradouro da Senhora do Monte', cat: 'Esperienze', link: '', date: d(2), time: '', done: false },
      { id: uid(), title: 'Pastéis de Belém', cat: 'Cibo', link: '', date: '', time: '', done: false },
      { id: uid(), title: 'LX Factory', cat: 'Varie', link: '', date: '', time: '', done: false },
    ],
    checklist: [
      { id: uid(), text: 'Documenti', done: true },
      { id: uid(), text: 'Check-in online volo', done: true },
      { id: uid(), text: 'Caricabatterie e power bank', done: false },
    ],
  };
}

// ---------- calcoli
function entries(t) {
  // tutte le uscite: spese + prenotazioni con prezzo (non "da prenotare")
  const ex = t.expenses.map((e) => ({ ...e, kind: 'exp' }));
  const it = t.items.filter((i) => i.price && i.status !== 'da prenotare')
    .map((i) => ({ id: i.id, date: i.date, desc: i.title, cat: i.cat, amount: i.price, paidBy: i.paidBy, split: i.split, kind: 'item' }));
  return ex.concat(it);
}
const spent = (t) => entries(t).reduce((a, e) => a + num(e.amount), 0);
const budgetTot = (t) => CAT_NAMES.reduce((a, c) => a + num(t.budget?.[c]), 0);
function balance(t) {
  const b = { Simone: 0, Fedra: 0 };
  entries(t).forEach((e) => {
    const a = num(e.amount);
    if (b[e.paidBy] !== undefined) b[e.paidBy] += a;
    if (e.split === 'Simone') b.Simone -= a; else if (e.split === 'Fedra') b.Fedra -= a;
    else { b.Simone -= a / 2; b.Fedra -= a / 2; }
  });
  (t.settlements || []).forEach((s) => { b[s.from] += s.amount; b[s.to] -= s.amount; });
  return b;
}
function phase(t) { const d = today(); return d < t.start ? 'futuro' : d > t.end ? 'passato' : 'corso'; }
const nDays = (t) => diffDays(t.start, t.end) + 1;
function stayOn(t, date) { return t.items.find((i) => i.cat === 'Alloggio' && i.date <= date && (i.endDate || i.date) > date); }

// ---------- stato di navigazione
const ui = { view: 'home', tripId: null, tab: 'viaggio', day: null, mode: 'giorno', pStart: null, spFilter: null };
function go(view, opts = {}) { Object.assign(ui, { view }, opts); window.scrollTo(0, 0); render(); }

// ---------- rendering
function render() {
  const app = $('#app');
  if (ui.view === 'home') { app.innerHTML = vHome(); tabbar(false); return; }
  const t = trip(ui.tripId); if (!t) return go('home');
  const tabs = { viaggio: vViaggio, spese: vSpese, todo: vTodo, assistente: vAssist };
  app.innerHTML = (tabs[ui.tab] || vViaggio)(t);
  tabbar(true);
  if (ui.scrollNow) { ui.scrollNow = false; const tg = document.querySelector('[data-target]') || document.querySelector('.nowline');
    if (tg) window.scrollTo(0, Math.max(0, tg.getBoundingClientRect().top + window.scrollY - 220)); else window.scrollTo(0, 0); }
}
function tabbar(show) {
  const nb = $('#tabbar'); nb.hidden = !show; if (!show) return;
  const T = [['viaggio', 'Viaggio', 'cal'], ['spese', 'Spese', 'card'], ['todo', 'To-do', 'check'], ['assistente', 'Assistente', 'chat']];
  nb.style.gridTemplateColumns = `repeat(${T.length},minmax(0,1fr))`;
  nb.innerHTML = T.map(([k, l, i]) => `<button class="${ui.tab === k ? 'on' : ''}" onclick="A.tab('${k}')">${svg(i)}${l}</button>`).join('');
}
const head = (t, sub) => `<div class="top"><button class="iconbtn back" aria-label="Torna ai viaggi" onclick="A.home()">${svg('back')}</button>${sub || ''}</div>`;
const plusBtn = (fn, label) => `<button class="plus" aria-label="${label}" onclick="${fn}">${svg('plus', 20, 2.2)}</button>`;

// --- Home
function vHome() {
  const ts = db.trips.slice().sort((a, b) => a.start.localeCompare(b.start));
  const cur = ts.filter((t) => phase(t) === 'corso');
  const fut = ts.filter((t) => phase(t) === 'futuro');
  const past = ts.filter((t) => phase(t) === 'passato').reverse();
  let h = `<div class="top"><span class="brand">NEMO</span>${plusBtn('A.tripForm()', 'Nuovo viaggio')}</div>
  <h1 style="margin-top:6px;font-size:32px">I nostri <span class="hl">viaggi</span></h1>`;
  if (cur.length) h += `<div class="sec"><div class="lab">In corso</div>${cur.map(cardNow).join('')}</div>`;
  if (fut.length) h += `<div class="sec"><div class="lab">In arrivo</div>${fut.map(cardFut).join('')}</div>`;
  if (past.length) h += `<div class="sec"><div class="lab">Passati</div><div class="card list">${past.map((t) =>
    `<button class="between" style="width:100%;background:none;border:none;padding:13px 16px;text-align:left" onclick="A.open('${t.id}')"><span class="serif" style="font-size:17px">${esc(t.name)} ${t.emoji || ''}</span><span class="small mut">${fmtRange(t.start, t.end)} · ${eur0(spent(t))}</span></button>`).join('')}</div></div>`;
  if (!db.trips.length) h += `<div class="sec"><div class="empty">Nessun viaggio. Tocca + per crearne uno.</div></div>`;
  h += `<div class="sec" style="margin-top:28px"><button class="btn ghost" onclick="A.settings()">Backup e impostazioni</button></div>`;
  return h;
}
function cardNow(t) {
  const d = today(), n = diffDays(t.start, d) + 1, tot = nDays(t);
  const st = stayOn(t, d), bt = budgetTot(t);
  return `<div class="navy col" role="button" tabindex="0" style="gap:12px;cursor:pointer" onclick="A.open('${t.id}')">
    <div class="between" style="align-items:flex-start"><div><div class="serif" style="font-size:26px">${esc(t.name)} ${t.emoji || ''}</div>
      <div class="small mut">giorno ${n} di ${tot}${st ? ' · stanotte: ' + esc(st.title) : ''}</div></div><span class="badge b-now">OGGI</span></div>
    <div style="display:grid;grid-template-columns:repeat(${tot},minmax(0,1fr));gap:3px">${Array.from({ length: tot }, (_, i) => `<span style="height:6px;border-radius:3px;background:${i + 1 < n ? '#F6F3EC' : i + 1 === n ? 'var(--hl)' : '#3E4A66'}"></span>`).join('')}</div>
    <div class="between small"><span><b>${eur(spent(t))}</b>${bt ? ' su ' + eur0(bt) : ''}</span><span class="row" style="gap:2px;font-weight:700">Apri ${svg('chev', 16)}</span></div></div>`;
}
function cardFut(t) {
  const g = diffDays(today(), t.start);
  return `<button class="card pad" style="width:100%;text-align:left;display:flex;justify-content:space-between;align-items:center;gap:12px" onclick="A.open('${t.id}')">
    <div><div class="serif" style="font-size:22px">${esc(t.name)} ${t.emoji || ''}</div><div class="small mut">${fmtRange(t.start, t.end)} · ${nDays(t) - 1} notti</div>
    <div class="small" style="margin-top:6px"><b>${eur(spent(t))}</b> spesi${budgetTot(t) ? ' · budget ' + eur0(budgetTot(t)) : ''}</div></div>
    <div style="background:var(--ink);color:var(--paper);border-radius:12px;padding:8px 12px;text-align:center"><div class="serif" style="font-size:22px;line-height:1">${g}</div><div style="font-size:10px;letter-spacing:1px">${g === 1 ? 'GIORNO' : 'GIORNI'}</div></div></button>`;
}

// --- Viaggio (calendario + prenotazioni)
function vViaggio(t) {
  const d = today(), ph = phase(t);
  const sub = ph === 'corso' ? `Giorno <span class="hl"><b>${diffDays(t.start, d) + 1} di ${nDays(t)}</b></span>`
    : ph === 'futuro' ? `Mancano <span class="hl"><b>${diffDays(d, t.start)} giorni</b></span>` : 'Viaggio concluso';
  if (ui.mode !== 'periodo') ui.mode = 'giorno';
  const body = ui.mode === 'periodo' ? vPeriod(t) : vDay(t);
  return `${head(t, `<span class="row" style="gap:4px"><button class="iconbtn" aria-label="Modifica viaggio" onclick="A.tripForm('${t.id}')">${svg('edit', 20)}</button>${plusBtn('A.itemForm()', 'Aggiungi al viaggio')}</span>`)}
  <h1>${esc(t.name)} ${t.emoji || ''}</h1>
  <div class="between"><span class="mut" style="font-size:14px">${fmtRange(t.start, t.end)}</span><span style="font-size:14px">${sub}</span></div>
  <div class="seg" style="margin-top:12px"><button class="${ui.mode === 'giorno' ? 'on' : ''}" onclick="A.mode('giorno')">Oggi</button><button class="${ui.mode === 'periodo' ? 'on' : ''}" onclick="A.mode('periodo')">Più giorni</button></div>
  ${body}`;
}
function bookingsList(t) {
  const groups = ['Trasporti', 'Alloggio', 'Esperienze', 'Cibo', 'Varie'].map((c) => {
    const its = t.items.filter((i) => i.cat === c).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
    if (!its.length) return '';
    const tot = its.reduce((a, i) => a + num(i.price), 0);
    return `<div class="between" style="margin-top:8px"><span class="lab">${c === 'Alloggio' ? 'Alloggi' : c}</span><span class="small mut">${its.length} · ${eur(tot)}</span></div>${its.map((i) => itemRow(t, i)).join('')}`;
  }).join('');
  const tot = t.items.filter((i) => i.status !== 'da prenotare').reduce((a, i) => a + num(i.price), 0);
  return `<div class="col" style="margin-top:6px;gap:6px">${groups || '<div class="empty" style="margin-top:10px">Nessuna prenotazione. Tocca + per aggiungere voli, alloggi, ristoranti o biglietti.</div>'}</div>
  ${t.items.length ? `<div class="between" style="padding:12px 4px 0"><span class="mut">Totale prenotato</span><span class="serif" style="font-size:22px">${eur(tot)}</span></div>` : ''}`;
}
function itemRow(t, i) {
  const d = today(), last = i.endDate || i.date;
  let st = i.status === 'da prenotare' ? ['b-todo', 'Da prenotare'] : ['b-ok', i.status === 'pagato' ? 'Pagato' : 'Prenotato'];
  let cls = i.status === 'da prenotare' ? 'todo' : '';
  if (last < d && i.status !== 'da prenotare') { st = ['b-past', 'Concluso']; cls = 'past'; }
  else if (i.date <= d && d <= last && i.status !== 'da prenotare') st = ['b-now', i.cat === 'Alloggio' ? 'In corso' : 'Oggi'];
  const when = i.cat === 'Alloggio' && i.endDate ? `${fmtDay(i.date)} – ${fmtDay(i.endDate)} · ${diffDays(i.date, i.endDate)} notti`
    : `${fmtDay(i.date)}${i.time ? ' · ' + i.time + (i.endTime ? ' – ' + i.endTime : '') : ''}`;
  const warn = i.cancel && i.cancel >= d && i.status !== 'da prenotare'
    ? `<div class="small" style="margin-top:2px"><span class="wavy">Cancellazione gratuita ${i.cancel === d ? 'scade oggi' : 'fino al ' + fmtDay(i.cancel)}</span></div>` : '';
  return `<button class="item ${cls}" onclick="A.itemForm('${i.id}')">
    <div class="tile" style="background:${CATS[i.cat].bg}">${svg(CATS[i.cat].icon, 18)}</div>
    <div class="grow"><div class="t1">${esc(i.title)}</div><div class="t2">${when}</div>${warn}</div>
    <div class="col" style="align-items:flex-end;gap:4px">${i.price ? `<span class="price">${eur(i.price)}</span>` : ''}<span class="badge ${st[0]}">${st[1]}</span></div></button>`;
}

// --- Programma
function dayEntries(t, date) {
  const timed = [], untimed = [];
  t.items.filter((i) => i.cat !== 'Alloggio' && i.date === date).forEach((i) => {
    if (i.time) timed.push({ kind: 'item', id: i.id, title: i.title, time: i.time, endTime: i.endTime, cat: i.cat, sub: i.price ? eur(i.price) : '', done: i.done, todo: i.status === 'da prenotare', paid: i.status === 'pagato' });
    else if (!i.done) untimed.push({ kind: 'item', id: i.id, title: i.title, cat: i.cat, todo: i.status === 'da prenotare', paid: i.status === 'pagato' });
  });
  (t.todos || []).filter((x) => x.date === date).forEach((x) => {
    if (x.time) timed.push({ kind: 'todo', id: x.id, title: x.text, time: x.time, cat: 'Varie', sub: 'to-do', done: x.done });
    else if (!x.done) untimed.push({ kind: 'todo', id: x.id, title: x.text, cat: 'Varie' });
  });
  timed.sort((a, b) => a.time.localeCompare(b.time));
  return { timed, untimed };
}
function modeToggle() {
  return `<div class="seg" style="margin-top:10px"><button class="${ui.mode === 'giorno' ? 'on' : ''}" onclick="A.mode('giorno')">Giorno</button><button class="${ui.mode === 'periodo' ? 'on' : ''}" onclick="A.mode('periodo')">Viaggio intero</button></div>`;
}
function vDay(t) {
  const d = today();
  if (!ui.day || ui.day < t.start || ui.day > t.end) ui.day = d >= t.start && d <= t.end ? d : t.start;
  const day = ui.day, D = parse(day), n = diffDays(t.start, day) + 1;
  // striscia di 5 giorni centrata sul giorno scelto
  let s0 = addDays(day, -2); if (s0 < t.start) s0 = t.start;
  let s1 = addDays(s0, 4); if (s1 > t.end) { s1 = t.end; s0 = addDays(s1, -4) < t.start ? t.start : addDays(s1, -4); }
  const strip = []; for (let x = s0; x <= s1; x = addDays(x, 1)) strip.push(x);
  const st = stayOn(t, day);
  const lastNight = st && addDays(day, 1) === st.endDate;
  const { timed, untimed } = dayEntries(t, day);
  const H0 = 7, H1 = 24, PX = 40;
  const y = (m) => ((m - H0 * 60) / 60) * PX;
  const hours = Array.from({ length: H1 - H0 }, (_, i) => `<div class="hour" style="height:${PX}px"><span style="display:inline-block;padding-top:3px">${pad(H0 + i)}:00</span></div>`).join('');
  const nm = nowMin(), isToday = day === d;
  let curId = null, nextId = null;
  if (isToday) { timed.forEach((e) => { const a = tmin(e.time), b = tmin(e.endTime) || a + 60; if (a <= nm && nm < b && !curId) curId = e.id; if (a > nm && !nextId) nextId = e.id; }); }
  else if (day > d && timed.length) nextId = null;
  const targetId = curId || nextId || (!isToday && timed.length ? timed[0].id : null);
  const evs = timed.map((e) => { const a = tmin(e.time), b = tmin(e.endTime) || a + 60;
    const cur = e.id === curId, nx = !curId && e.id === nextId;
    const tag = cur ? '<span class="badge" style="position:absolute;right:8px;top:6px;background:var(--ink);color:var(--paper)">ADESSO</span>' : nx ? '<span class="badge b-now" style="position:absolute;right:8px;top:6px">PROSSIMO</span>' : '';
    const stx = e.todo ? `;border:1.5px dashed ${CATS[e.cat].s};border-left:4px solid ${CATS[e.cat].s}` : e.paid ? `;box-shadow:inset 0 0 0 1.5px ${CATS[e.cat].s}` : '';
    const extra = cur ? ';outline:2px solid var(--ink);box-shadow:0 6px 18px rgba(31,42,68,.18);z-index:3' : nx ? ';outline:2px solid var(--ink);z-index:3' : '';
    const st = e.todo ? ' · <span class="wavy">da prenotare</span>' : e.paid ? ' · <b style="display:inline;font-size:12px;color:var(--ok)">✓ pagato</b>' : '';
    return `<button class="ev" ${e.id === targetId ? 'data-target="1"' : ''} style="top:${y(a)}px;height:${Math.max(y(b) - y(a), 34)}px;background:${CATS[e.cat].bg};border-left-color:${CATS[e.cat].s}${stx}${e.done || (isToday && b <= nm) ? ';opacity:.6' : ''}${extra}" onclick="A.openEntry('${e.kind}','${e.id}')">${tag}<b>${esc(e.title)}</b><span>${e.time}${e.endTime ? ' – ' + e.endTime : ''}${e.sub ? ' · ' + esc(e.sub) : ''}${st}</span></button>`; }).join(''); const now = day === d && nm >= H0 * 60 ? `<div class="nowline" style="top:${y(nm)}px"></div>` : '';
  return `<div class="serif" style="font-size:20px;margin-top:14px">${GGL[D.getDay()]} <span class="hl">${D.getDate()} ${MML[D.getMonth()]}</span> <span class="mut" style="font-family:Karla,Arial,sans-serif;font-size:13px;font-weight:400">· giorno ${n} di ${nDays(t)}</span></div>
  <div class="dayhead" style="margin-top:10px;grid-template-columns:repeat(${strip.length},minmax(0,1fr))">${strip.map((x) => { const X = parse(x);
    return `<button class="daybtn ${x === day ? 'on' : ''} ${x < d && x !== day ? 'past' : ''}" onclick="A.day('${x}')"><small>${GG[X.getDay()].toUpperCase()}</small><b>${X.getDate()}</b></button>`; }).join('')}</div>
  ${st ? `<div class="band" role="button" style="margin-top:10px;cursor:pointer" onclick="A.itemForm('${st.id}')"><b>${esc(st.title)}${st.status === 'pagato' ? ' <span style="color:var(--ok)">✓</span>' : ''}</b><span>${lastNight ? 'ultima notte · check-out domani' : 'notte ' + (diffDays(st.date, day) + 1) + ' di ' + diffDays(st.date, st.endDate)}</span></div>` : ''}
  <div class="card" style="margin-top:8px;padding:10px 12px">
    <div class="between"><span class="lab" style="font-size:11px">Da fare oggi</span><button class="chip" style="height:30px" onclick="A.todoForm(null,'${day}')">+ Aggiungi</button></div>
    ${untimed.length ? untimed.map((e) => `<label class="check"><input type="checkbox" ${e.done ? 'checked' : ''} onchange="A.toggleDone('${e.kind}','${e.id}')"><span class="${e.done ? 'done' : ''}">${esc(e.title)}${e.todo ? ' <span class="wavy small">da prenotare</span>' : e.paid ? ' <b class="small" style="color:var(--ok)">✓</b>' : ''}</span></label>`).join('') : '<div class="small mut" style="padding:6px 0">Niente in lista per oggi.</div>'}
  </div>
  <div class="timeline" style="margin-top:10px">${hours}${evs}${now}</div>`;
}
function vPeriod(t) {
  const d = today(), N = Math.min(5, nDays(t));
  if (!ui.pStart) { ui.pStart = d >= t.start && d <= t.end ? addDays(d, -2) : t.start; }
  if (ui.pStart < t.start) ui.pStart = t.start;
  if (addDays(ui.pStart, N - 1) > t.end) ui.pStart = addDays(t.end, -(N - 1));
  const days = Array.from({ length: N }, (_, i) => addDays(ui.pStart, i));
  const TC = 30, cols = `${TC}px repeat(${N},minmax(0,1fr))`;
  const H0 = 7, H1 = 24, PX = 26, y = (m) => ((m - H0 * 60) / 60) * PX;
  const left = (i) => `calc(${TC}px + (100% - ${TC}px) * ${i} / ${N} + 1px)`, w = `calc((100% - ${TC}px) / ${N} - 2px)`;
  const head = days.map((x) => { const X = parse(x), on = x === d;
    return `<button onclick="A.day('${x}',true)" style="height:44px;border:none;border-radius:8px;background:${on ? 'var(--ink)' : 'transparent'};color:${on ? 'var(--paper)' : x < d ? 'var(--mut)' : 'var(--ink)'};display:flex;flex-direction:column;align-items:center;justify-content:center;padding:0"><span style="font-size:11px">${GG[X.getDay()].toUpperCase()}</span><b style="font-size:17px;line-height:1.1">${X.getDate()}</b></button>`; }).join('');
  // fasce alloggio
  const stays = t.items.filter((i) => i.cat === 'Alloggio' && i.endDate).map((i) => {
    const a = i.date < days[0] ? days[0] : i.date, bLast = addDays(i.endDate, -1), b = bLast > days[N - 1] ? days[N - 1] : bLast;
    if (a > b) return '';
    return `<div style="grid-column:${diffDays(days[0], a) + 2} / span ${diffDays(a, b) + 1};grid-row:1;margin:0 1px;background:var(--c-all);border-radius:5px;padding:4px 6px;font-size:11px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${esc(i.title)}</div>`; }).join('');
  const unt = days.map((x) => `<div style="display:flex;flex-direction:column;gap:2px;padding:0 1px${x < d ? ';opacity:.55' : ''}">${dayEntries(t, x).untimed.map((e) => `<span class="pill" style="background:${CATS[e.cat].bg}">${esc(e.title)}</span>`).join('')}</div>`).join('');
  const shade = days.map((x, i) => `<div style="position:absolute;top:0;height:${y(H1 * 60)}px;left:${left(i)};width:${w};background:${x < d ? 'rgba(31,42,68,.04)' : x === d ? 'rgba(244,207,107,.16)' : 'transparent'}"></div>`).join('');
  const lines = Array.from({ length: (H1 - H0) / 2 + 1 }, (_, k) => H0 + k * 2).map((h) => `<div style="position:absolute;left:0;right:0;top:${y(h * 60)}px;border-top:1px solid var(--line)"><span style="position:absolute;top:1px;font-size:10px;color:var(--mut)">${pad(h)}</span></div>`).join('');
  const evs = days.map((x, i) => dayEntries(t, x).timed.map((e) => { const a = tmin(e.time), b = tmin(e.endTime) || a + 60;
    const stx = e.todo ? `;border:1.5px dashed ${CATS[e.cat].s};border-left:3px solid ${CATS[e.cat].s}` : e.paid ? `;box-shadow:inset 0 0 0 1.5px ${CATS[e.cat].s}` : '';
    return `<div class="pcol-ev" onclick="A.openEntry('${e.kind}','${e.id}')" style="top:${y(a)}px;height:${Math.max(y(b) - y(a), 30)}px;left:${left(i)};width:${w};background:${CATS[e.cat].bg};border-left-color:${CATS[e.cat].s}${stx}${x < d ? ';opacity:.6' : ''}"><b>${esc(e.title)}</b><div style="color:#3E4658">${e.time}${e.paid ? ' <span style="color:var(--ok);font-weight:700">✓</span>' : ''}</div></div>`; }).join('')).join('');
  const nm = nowMin(), ti = days.indexOf(d);
  const now = ti >= 0 && nm >= H0 * 60 ? `<div style="position:absolute;top:${y(nm)}px;height:2px;left:${left(ti)};width:${w};background:var(--terra);z-index:2"></div>` : '';
  const canPrev = ui.pStart > t.start, canNext = addDays(ui.pStart, N - 1) < t.end;
  return `<div class="between" style="margin-top:6px"><button class="iconbtn" aria-label="Giorni precedenti" ${canPrev ? '' : 'disabled style="opacity:.3"'} onclick="A.shift(-${N})">${svg('left')}</button>
    <b style="font-size:14px">${fmtDay(days[0])} – ${fmtDay(days[N - 1])}</b>
    <button class="iconbtn" aria-label="Giorni successivi" ${canNext ? '' : 'disabled style="opacity:.3"'} onclick="A.shift(${N})">${svg('right')}</button></div>
  <div class="col" style="gap:4px;margin:0 -8px">
    <div style="display:grid;grid-template-columns:${cols}"><span></span>${head}</div>
    <div style="display:grid;grid-template-columns:${cols};min-height:22px"><span style="font-size:10px;color:var(--mut);align-self:center">notte</span>${stays}</div>
    <div style="display:grid;grid-template-columns:${cols};align-items:start"><span style="font-size:10px;color:var(--mut);line-height:1.1">senza<br>ora</span>${unt}</div>
    <div class="pgrid" style="height:${y(H1 * 60)}px;margin-top:4px">${shade}${lines}${evs}${now}</div>
  </div>`;
}

// --- Spese
function vSpese(t) {
  const sp = spent(t), bt = budgetTot(t), b = balance(t), d = today();
  const debtor = b.Simone < -0.005 ? 'Simone' : b.Fedra < -0.005 ? 'Fedra' : null;
  const cred = debtor === 'Simone' ? 'Fedra' : 'Simone';
  const owe = debtor ? Math.abs(b[debtor]) : 0;
  let daily = '';
  if (bt && phase(t) === 'corso') { const left = diffDays(d, t.end); if (left > 0) { const r = (bt - sp) / left;
    daily = `<div class="small mut" style="margin-top:6px">Da domani: circa <b style="color:var(--ink)">${eur(r)} al giorno</b> in due (${eur(r / 2)} a testa)</div>`; } }
  const byCat = {}; entries(t).forEach((e) => { byCat[e.cat] = (byCat[e.cat] || 0) + num(e.amount); });
  const bars = CAT_NAMES.map((c) => { const v = byCat[c] || 0, B = num(t.budget?.[c]); if (!v && !B) return '';
    const pct = B ? Math.min(100, (v / B) * 100) : 100, over = B && v > B;
    return `<div class="col" style="gap:4px"><div class="between small"><span>${c}</span><span><b>${eur(v)}</b>${B ? ' / ' + eur0(B) : ' · <span class="wavy">fuori budget</span>'}${over ? ' · <span class="wavy">sforato</span>' : ''}</span></div>
      <div class="bar"><span style="width:${pct}%;background:${CATS[c].s}"></span></div></div>`; }).join('');
  const all = entries(t).sort((a, b) => b.date.localeCompare(a.date));
  const dates = [...new Set(all.map((e) => e.date))];
  const list = dates.map((x) => { const rows = all.filter((e) => e.date === x);
    const lbl = x === d ? 'Oggi · ' + fmtDay(x) : x === addDays(d, -1) ? 'Ieri · ' + fmtDay(x) : fmtDay(x);
    return `<div class="between" style="margin-top:8px"><span class="lab">${lbl}</span><span class="small mut">${eur(rows.reduce((a, e) => a + num(e.amount), 0))}</span></div>
    <div class="card list">${rows.map((e) => `<button class="between" style="width:100%;background:none;border:none;padding:10px 14px;text-align:left" onclick="${e.kind === 'exp' ? `A.expForm('${e.id}')` : `A.itemForm('${e.id}')`}">
      <span class="row" style="align-items:stretch"><span style="width:5px;border-radius:3px;background:${CATS[e.cat].s}"></span><span class="col" style="gap:1px"><b style="font-size:14px">${esc(e.desc)}</b><span class="t2">${e.cat} · ${esc(e.paidBy)} · ${e.split === '50/50' ? '50/50' : 'solo ' + esc(e.split)}${e.kind === 'item' ? ' · prenotazione' : ''}</span></span></span>
      <b style="font-size:14px;white-space:nowrap">${eur(e.amount)}</b></button>`).join('')}</div>`; }).join('');
  return `${head(t, plusBtn('A.expForm()', 'Aggiungi spesa'))}
  <div class="small mut">${esc(t.name)} ${t.emoji || ''} · spese</div>
  <div class="row" style="align-items:baseline;gap:8px"><span class="serif" style="font-size:34px">${eur(sp)}</span>${bt ? `<span class="mut">su ${eur0(bt)} di budget</span>` : ''}</div>
  <div class="small mut">${eur(sp / 2)} a testa${bt ? ' · ' + Math.round((sp / bt) * 100) + '% del budget' : ''}</div>${daily}
  <div class="navy between" style="margin-top:14px;padding:14px 16px"><div class="col" style="gap:4px"><span class="mut" style="font-size:11px;letter-spacing:1.2px;text-transform:uppercase">Saldo</span>
    <span>${debtor ? `${debtor} deve <b style="background:linear-gradient(transparent 55%,var(--terra) 55%);padding:0 2px">${eur(owe)}</b> a ${cred}` : 'Siete pari'}</span></div>
    ${debtor ? `<button onclick="A.settle()" style="height:36px;padding:0 12px;border-radius:18px;border:1px solid #C9CFDC;background:transparent;color:var(--paper);font-size:13px">Pareggiato</button>` : ''}</div>
  ${bt ? `<details class="card" style="margin-top:14px" ${ui.budOpen ? 'open' : ''} ontoggle="A.budToggle(this.open)"><summary class="between" style="padding:12px 16px;list-style:none;cursor:pointer;min-height:44px">
      <span class="lab">Budget per categoria</span><span class="row small" style="gap:4px">${Math.round((sp / bt) * 100)}% <span style="display:inline-block;transform:rotate(${ui.budOpen ? 90 : 0}deg)">${svg('chev', 16)}</span></span></summary>
      <div class="col" style="padding:0 16px 14px;gap:10px">${bars}<button class="btn ghost" style="height:40px" onclick="A.budgetForm()">Modifica budget</button></div></details>`
    : `<button onclick="A.budgetForm()" class="btn ghost" style="margin-top:14px;height:44px">Imposta un budget (facoltativo)</button>`}
  <div class="col" style="gap:6px;margin-top:10px">${list}</div>`;
}

// --- To-do
function vTodo(t) {
  const all = t.todos || [], open = all.filter((x) => !x.done), done = all.filter((x) => x.done);
  const nodate = open.filter((x) => !x.date), dated = open.filter((x) => x.date).sort((a, b) => (a.date + (a.time || '')).localeCompare(b.date + (b.time || '')));
  const dates = [...new Set(dated.map((x) => x.date))];
  const row = (x) => `<div class="between" style="padding:6px 14px"><label class="check"><input type="checkbox" onchange="A.todoDone('${x.id}')"><span>${esc(x.text)}${x.time ? ` <span class="mut small">${x.time}</span>` : ''}</span></label>
    <button class="iconbtn" aria-label="Modifica" style="color:var(--mut)" onclick="A.todoForm('${x.id}')">${svg('edit', 18)}</button></div>`;
  const opts = ['<option value="">Senza data</option>'].concat(Array.from({ length: nDays(t) }, (_, i) => addDays(t.start, i)).map((x) => `<option value="${x}">${fmtDay(x)}</option>`)).join('');
  return `${head(t)}
  <h1>To-do <span class="hl">list</span></h1>
  <div class="small mut">${esc(t.name)} ${t.emoji || ''} · ${open.length} da fare</div>
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
  return `${head(t)}
  <h1>Assistente <span class="hl">di viaggio</span></h1>
  <div class="small mut">${esc(t.name)} ${t.emoji || ''}</div>
  <div class="navy col" style="margin-top:14px;gap:8px"><b class="serif" style="font-size:20px">In arrivo</b>
    <div style="font-size:14px;line-height:1.45">Qui potrete chiedere qualsiasi cosa sul viaggio: bagagli, mezzi, ristoranti, hotel, bar vicino a dove siete. Risponde cercando online e conosce già il vostro programma e le prenotazioni.</div>
    <div class="small mut">Si attiva dopo la sincronizzazione tra i vostri telefoni.</div></div>
  <div class="sec"><div class="lab">Esempi di domande</div>${ex.map((q) => `<div class="card" style="padding:12px 14px;font-size:15px;color:var(--mut)">“${q}”</div>`).join('')}</div>`;
}

// ---------- fogli (form)
function todoForm(id, date) {
  const t = trip(ui.tripId); const x = id ? t.todos.find((y) => y.id === id) : null;
  sheet(`${sheetHead(x ? 'Modifica to-do' : 'Nuovo to-do', `A.saveTodo('${id || ''}')`)}
  <div class="field"><label for="f_text">Cosa</label><input id="f_text" class="inp" value="${esc(x?.text || '')}"></div>
  <div class="grid2"><div class="field"><label for="f_date">Giorno (facoltativo)</label><input id="f_date" type="date" class="inp" value="${x?.date || date || ''}" min="${t.start}" max="${t.end}"></div>
    <div class="field"><label for="f_time">Ora (facoltativa)</label><input id="f_time" type="time" class="inp" value="${x?.time || ''}"></div></div>
  <div class="small mut">Con l'ora compare nel calendario, senza ora in "Da fare oggi".</div>
  ${x ? `<button class="btn danger" onclick="A.todoDel('${x.id}')">Elimina</button>` : ''}`);
  setTimeout(() => { const el = document.getElementById('f_text'); if (el && !x) el.focus(); }, 50);
}
function saveTodo(id) {
  const t = trip(ui.tripId); const text = val('f_text'); if (!text) return toast('Scrivi cosa c\'è da fare');
  const o = { text, date: val('f_date'), time: val('f_time') };
  if (id) Object.assign(t.todos.find((y) => y.id === id), o); else t.todos.push({ id: uid(), done: false, ...o });
  save(); closeSheet(); render();
}
function sheet(html) { const s = $('#sheet'); s.innerHTML = `<div class="panel" role="dialog" aria-modal="true"><div class="grab"></div>${html}</div>`; s.hidden = false;
  s.onclick = (e) => { if (e.target === s) closeSheet(); }; }
function closeSheet() { const s = $('#sheet'); s.hidden = true; s.innerHTML = ''; }
const val = (id) => { const el = document.getElementById(id); return el ? el.value.trim() : ''; };
const sheetHead = (title, saveFn) => `<div class="between"><button onclick="A.close()" style="background:none;border:none;color:var(--mut);min-height:44px;font-size:15px">Annulla</button><b class="serif" style="font-size:18px">${title}</b><button onclick="${saveFn}" style="background:none;border:none;color:var(--terra);font-weight:700;min-height:44px;font-size:15px">Salva</button></div>`;
const segH = (name, opts, cur) => `<div class="seg" data-seg="${name}">${opts.map(([v, l]) => `<button type="button" class="${v === cur ? 'on' : ''}" data-v="${esc(v)}" onclick="A.seg(this)">${l}</button>`).join('')}</div>`;
const segVal = (name) => { const b = document.querySelector(`[data-seg="${name}"] .on`); return b ? b.dataset.v : ''; };
const catSelect = (cur) => `<div style="position:relative;display:flex;align-items:center"><span id="catDot" class="dot" style="position:absolute;left:14px;background:${CATS[cur].s}"></span>
  <select id="f_cat" class="inp" style="padding-left:34px" onchange="document.getElementById('catDot').style.background=A.catColor(this.value)">${CAT_NAMES.map((c) => `<option ${c === cur ? 'selected' : ''}>${c}</option>`).join('')}</select></div>`;
const filesBlock = (files) => `<div class="field"><label>Foto, ricevute, biglietti</label>
  <div class="thumbs" id="thumbs">${(files || []).map((f, i) => f.type.startsWith('image') ? `<a href="#" onclick="A.viewFile(${i});return false"><img src="${f.data}" alt="${esc(f.name)}"></a>` : `<a href="#" onclick="A.viewFile(${i});return false">PDF</a>`).join('')}</div>
  <label class="attach">${svg('camera', 20)} Scatta foto o carica file<input type="file" accept="image/*,application/pdf" multiple onchange="A.addFiles(this)"></label></div>`;
let draftFiles = [];

function tripForm(id) {
  const t = id ? trip(id) : null; const s = t ? t.start : today(), e = t ? t.end : addDays(today(), 3);
  sheet(`${sheetHead(t ? 'Modifica viaggio' : 'Nuovo viaggio', `A.saveTrip('${id || ''}')`)}
  <div class="field"><label for="f_name">Destinazione</label><input id="f_name" class="inp" value="${esc(t?.name || '')}" placeholder="Es. Londra"></div>
  <div class="field"><label for="f_emoji">Emoji (facoltativa)</label><input id="f_emoji" class="inp" value="${esc(t?.emoji || '')}" placeholder="✈️"></div>
  <div class="grid2"><div class="field"><label for="f_s">Partenza</label><input id="f_s" type="date" class="inp" value="${s}"></div><div class="field"><label for="f_e">Ritorno</label><input id="f_e" type="date" class="inp" value="${e}"></div></div>
  ${t ? `<button class="btn ghost" onclick="A.close();A.open('${t.id}','spese');A.budgetForm()">Budget</button><button class="btn danger" onclick="A.delTrip('${t.id}')">Elimina viaggio</button>` : ''}`);
}
function saveTrip(id) {
  const name = val('f_name'), s = val('f_s'), e = val('f_e');
  if (!name || !s || !e) return toast('Servono destinazione e date');
  if (e < s) return toast('Il ritorno è prima della partenza');
  if (id) Object.assign(trip(id), { name, emoji: val('f_emoji'), start: s, end: e });
  else { const t = { id: uid(), name, emoji: val('f_emoji'), start: s, end: e, people: PEOPLE.slice(), budget: {}, items: [], expenses: [], ideas: [], checklist: [], todos: [] }; db.trips.push(t); ui.tripId = t.id; }
  save(); closeSheet(); if (!id) go('trip', { tab: 'viaggio', mode: 'giorno', day: null, pStart: null }); else render();
}

function itemForm(id) {
  const t = trip(ui.tripId); const i = id ? t.items.find((x) => x.id === id) : null;
  const c = i?.cat || 'Trasporti'; draftFiles = (i?.files || []).slice();
  sheet(`${sheetHead(i ? 'Prenotazione' : 'Nuova prenotazione', `A.saveItem('${id || ''}')`)}
  <div class="field"><label for="f_title">Cosa</label><input id="f_title" class="inp" value="${esc(i?.title || '')}" placeholder="Es. Volo MXP → LTN, Hotel…"></div>
  <div class="grid2"><div class="field"><label for="f_cat">Categoria</label>${catSelect(c)}</div>
    <div class="field"><label for="f_price">Prezzo €</label><input id="f_price" class="inp" inputmode="decimal" value="${i?.price ?? ''}" placeholder="0,00"></div></div>
  <div class="field"><label>Stato</label>${segH('status', STATUS.map((x) => [x, x[0].toUpperCase() + x.slice(1)]), i?.status || 'prenotato')}</div>
  <div class="grid2"><div class="field"><label for="f_date">Data (o check-in)</label><input id="f_date" type="date" class="inp" value="${i?.date || ui.day || t.start}"></div>
    <div class="field"><label for="f_end">Check-out (alloggi)</label><input id="f_end" type="date" class="inp" value="${i?.endDate || ''}"></div></div>
  <div class="grid2"><div class="field"><label for="f_time">Ora inizio</label><input id="f_time" type="time" class="inp" value="${i?.time || ''}"></div>
    <div class="field"><label for="f_etime">Ora fine</label><input id="f_etime" type="time" class="inp" value="${i?.endTime || ''}"></div></div>
  <div class="field"><label>Pagato da</label>${segH('paid', PEOPLE.map((p) => [p, p]), i?.paidBy || 'Simone')}</div>
  <div class="field"><label>Per chi</label>${segH('split', [['50/50', '50/50'], ['Simone', 'Solo Simone'], ['Fedra', 'Solo Fedra']], i?.split || '50/50')}</div>
  <div class="field"><label for="f_addr">Indirizzo</label><input id="f_addr" class="inp" value="${esc(i?.address || '')}" placeholder="Per aprirlo in Maps"></div>
  <div class="field"><label for="f_link">Link prenotazione</label><input id="f_link" class="inp" value="${esc(i?.link || '')}" placeholder="https://"></div>
  <div class="grid2"><div class="field"><label for="f_code">Codice conferma</label><input id="f_code" class="inp" value="${esc(i?.code || '')}"></div>
    <div class="field"><label for="f_cancel">Cancellazione gratuita entro</label><input id="f_cancel" type="date" class="inp" value="${i?.cancel || ''}"></div></div>
  ${i && (i.address || i.link) ? `<div class="grid2">${i.address ? `<a class="btn ghost" style="display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none" target="_blank" rel="noopener" href="https://maps.apple.com/?q=${encodeURIComponent(i.address)}">${svg('pin', 18)} Apri in Maps</a>` : '<span></span>'}${i.link ? `<a class="btn ghost" style="display:flex;align-items:center;justify-content:center;gap:6px;text-decoration:none" target="_blank" rel="noopener" href="${esc(i.link)}">${svg('link', 18)} Apri link</a>` : ''}</div>` : ''}
  ${filesBlock(draftFiles)}
  <div class="field"><label for="f_note">Note</label><textarea id="f_note" class="inp">${esc(i?.note || '')}</textarea></div>
  ${i ? `<button class="btn danger" onclick="A.delItem('${i.id}')">Elimina prenotazione</button>` : ''}`);
}
function saveItem(id) {
  const t = trip(ui.tripId); const title = val('f_title'); if (!title) return toast('Scrivi cosa hai prenotato');
  const o = { cat: val('f_cat'), title, price: numIn(val('f_price')), status: segVal('status'), date: val('f_date') || t.start, endDate: val('f_end') || '',
    time: val('f_time'), endTime: val('f_etime'), paidBy: segVal('paid'), split: segVal('split'), address: val('f_addr'), link: val('f_link'),
    code: val('f_code'), cancel: val('f_cancel'), note: val('f_note'), files: draftFiles };
  if (o.endDate && o.endDate <= o.date) o.endDate = '';
  if (id) Object.assign(t.items.find((x) => x.id === id), o); else t.items.push({ id: uid(), ...o });
  if (save()) { closeSheet(); render(); toast('Salvato'); }
}

function expForm(id) {
  const t = trip(ui.tripId); const e = id ? t.expenses.find((x) => x.id === id) : null;
  const d = today(); const def = d >= t.start && d <= t.end ? d : (ui.day || t.start);
  draftFiles = (e?.files || []).slice(); const c = e?.cat || 'Cibo';
  sheet(`${sheetHead(e ? 'Spesa' : 'Nuova spesa', `A.saveExp('${id || ''}')`)}
  <div class="col" style="align-items:center;gap:0"><label class="lab" for="f_amt">Importo</label><input id="f_amt" class="amount" inputmode="decimal" placeholder="0,00 €" value="${e ? String(e.amount).replace('.', ',') : ''}"></div>
  <div class="grid2"><div class="field"><label for="f_cat">Categoria</label>${catSelect(c)}</div>
    <div class="field"><label for="f_date">Giorno</label><input id="f_date" type="date" class="inp" value="${e?.date || def}"></div></div>
  <div class="field"><label>Pagato da</label>${segH('paid', PEOPLE.map((p) => [p, p]), e?.paidBy || 'Simone')}</div>
  <div class="field"><label>Per chi</label>${segH('split', [['50/50', '50/50'], ['Simone', 'Solo Simone'], ['Fedra', 'Solo Fedra']], e?.split || '50/50')}</div>
  <div class="field"><label for="f_desc">Descrizione</label><input id="f_desc" class="inp" value="${esc(e?.desc || '')}" placeholder="Es. pranzo, metro, souvenir"></div>
  ${filesBlock(draftFiles)}
  ${e ? `<button class="btn danger" onclick="A.delExp('${e.id}')">Elimina spesa</button>` : `<button class="btn" onclick="A.saveExp('')">Salva spesa</button>`}`);
  setTimeout(() => { const a = document.getElementById('f_amt'); if (a && !e) a.focus(); }, 50);
}
function saveExp(id) {
  const t = trip(ui.tripId); const amount = numIn(val('f_amt').replace('€', ''));
  if (!amount) return toast('Inserisci l\'importo');
  const o = { amount, cat: val('f_cat'), date: val('f_date') || today(), paidBy: segVal('paid'), split: segVal('split'), desc: val('f_desc') || val('f_cat'), files: draftFiles };
  if (id) Object.assign(t.expenses.find((x) => x.id === id), o); else t.expenses.push({ id: uid(), ...o });
  if (save()) { closeSheet(); render(); toast('Spesa salvata'); }
}

function ideaForm(id, date) {
  const t = trip(ui.tripId); const x = id ? t.ideas.find((i) => i.id === id) : null;
  sheet(`${sheetHead(x ? 'Idea' : 'Nuova idea', `A.saveIdea('${id || ''}')`)}
  <div class="field"><label for="f_title">Nome</label><input id="f_title" class="inp" value="${esc(x?.title || '')}" placeholder="Es. Mostra, ristorante, spiaggia"></div>
  <div class="field"><label for="f_link">Link</label><input id="f_link" class="inp" value="${esc(x?.link || '')}" placeholder="Google Maps, Instagram, sito…"></div>
  <div class="field"><label for="f_cat">Categoria</label>${catSelect(x?.cat || 'Esperienze')}</div>
  <div class="grid2"><div class="field"><label for="f_date">Giorno (facoltativo)</label><input id="f_date" type="date" class="inp" value="${x?.date || date || ''}" min="${t.start}" max="${t.end}"></div>
    <div class="field"><label for="f_time">Ora (facoltativa)</label><input id="f_time" type="time" class="inp" value="${x?.time || ''}"></div></div>
  ${x ? `<button class="btn danger" onclick="A.delIdea('${x.id}')">Elimina idea</button>` : ''}`);
}
function saveIdea(id) {
  const t = trip(ui.tripId); let title = val('f_title'); const link = val('f_link');
  if (!title && link) title = titleFromLink(link); if (!title) return toast('Scrivi un nome o incolla un link');
  const o = { title, link, cat: val('f_cat'), date: val('f_date'), time: val('f_time') };
  if (id) Object.assign(t.ideas.find((i) => i.id === id), o); else t.ideas.push({ id: uid(), done: false, ...o });
  if (save()) { closeSheet(); render(); }
}
function titleFromLink(l) {
  try { const u = new URL(l); const m = u.pathname.match(/\/place\/([^/]+)/); if (m) return decodeURIComponent(m[1]).replace(/\+/g, ' ');
    return u.hostname.replace(/^www\./, ''); } catch (e) { return l; }
}
function assign(id) {
  const t = trip(ui.tripId); const x = t.ideas.find((i) => i.id === id);
  sheet(`${sheetHead('Aggiungi al programma', `A.saveAssign('${id}')`)}<div class="t1">${esc(x.title)}</div>
  <div class="grid2"><div class="field"><label for="f_date">Giorno</label><input id="f_date" type="date" class="inp" value="${ui.day || t.start}" min="${t.start}" max="${t.end}"></div>
  <div class="field"><label for="f_time">Ora (facoltativa)</label><input id="f_time" type="time" class="inp"></div></div>
  <div class="small mut">Senza ora finisce in "Da fare oggi"; con l'ora compare nel calendario.</div>`);
}
function saveAssign(id) { const t = trip(ui.tripId); const x = t.ideas.find((i) => i.id === id);
  x.date = val('f_date'); x.time = val('f_time'); save(); closeSheet(); render(); toast('Aggiunta al programma'); }

function budgetForm() {
  const t = trip(ui.tripId); const B = t.budget || {}; const n = nDays(t);
  const rows = CAT_NAMES.map((c) => { const booked = t.items.filter((i) => i.cat === c && i.status !== 'da prenotare').reduce((a, i) => a + num(i.price), 0);
    return `<div class="card" style="overflow:hidden"><div style="background:${CATS[c].bg};padding:8px 14px;font-size:14px;font-weight:700">${c}</div>
    <div class="col" style="padding:12px 14px;gap:8px">
      <div class="between"><div class="row" style="gap:6px"><input class="inp" style="width:110px;text-align:right;font-weight:700" inputmode="decimal" id="bv_${c}" value="${B[c] ? String(B[c]).replace('.', ',') : ''}" placeholder="0" oninput="A.bcalc()"><b>€</b></div>
        <span class="small mut" id="bt_${c}">${B[c] ? eur0(B[c] / 2) + ' a testa' : 'in due'}</span></div>
      <details><summary class="small" style="color:var(--terra);font-weight:700;cursor:pointer;min-height:32px;display:flex;align-items:center">Calcola a giorno</summary>
        <div class="row small" style="gap:6px;margin-top:6px;flex-wrap:wrap"><input class="inp" style="width:80px;height:40px;text-align:center" inputmode="decimal" id="bu_${c}" placeholder="0" oninput="A.bcalc('${c}')"><span class="nw">€ al giorno in due ×</span>
          <input class="inp" style="width:56px;height:40px;text-align:center" inputmode="numeric" id="bq_${c}" value="${n}" oninput="A.bcalc('${c}')"><span>giorni</span></div></details>
      ${booked ? `<div class="small mut">Già prenotato: <b style="color:var(--ink)">${eur(booked)}</b>${B[c] ? (booked <= B[c] ? ' · <span style="color:var(--ok);font-weight:700">restano ' + eur0(B[c] - booked) + '</span>' : ' · <span class="wavy">sopra budget</span>') : ''}</div>` : ''}
      ${c === 'Cibo' ? pastSuggest(t) : ''}</div></div>`; }).join('');
  sheet(`${sheetHead('Budget', 'A.saveBudget()')}
  <div class="navy col" style="gap:2px"><span class="mut" style="font-size:12px;letter-spacing:1.2px;text-transform:uppercase">Budget totale · in due</span>
    <span class="serif" style="font-size:32px" id="bTot">${eur0(budgetTot(t))}</span><span class="small mut" id="bHead">${eur0(budgetTot(t) / 2)} a testa · ${n} giorni</span></div>
  <div class="small mut" style="line-height:1.45">Per ogni categoria scrivi <b style="color:var(--ink)">quanto pensate di spendere in due</b>, per tutto il viaggio. Il budget è facoltativo: puoi lasciare vuote le categorie che non ti interessano.</div>
  ${rows}`);
}
function pastSuggest(t) {
  const others = db.trips.filter((x) => x.id !== t.id && phase(x) === 'passato');
  let tot = 0, days = 0; others.forEach((x) => { const c = entries(x).filter((e) => e.cat === 'Cibo').reduce((a, e) => a + num(e.amount), 0); if (c) { tot += c; days += nDays(x); } });
  return days ? `<div class="small mut">Dai viaggi passati: <span class="hl" style="color:var(--ink);font-weight:700">${eur0(tot / days)} al giorno</span></div>` : '';
}
function bcalc(from) {
  if (from) { const u = numIn(val('bu_' + from)), q = numIn(val('bq_' + from)); if (u && q) document.getElementById('bv_' + from).value = String(Math.round(u * q * 100) / 100).replace('.', ','); }
  let tot = 0; CAT_NAMES.forEach((c) => { const v = numIn(val('bv_' + c)); document.getElementById('bt_' + c).textContent = v ? eur0(v / 2) + ' a testa' : 'in due'; tot += v; });
  document.getElementById('bTot').textContent = eur0(tot); document.getElementById('bHead').textContent = `${eur0(tot / 2)} a testa · ${nDays(trip(ui.tripId))} giorni`;
}
function saveBudget() { const t = trip(ui.tripId); t.budget = {}; CAT_NAMES.forEach((c) => { const v = numIn(val('bv_' + c)); if (v) t.budget[c] = v; });
  save(); closeSheet(); render(); toast('Budget salvato'); }

function settings() {
  sheet(`<div class="between"><b class="serif" style="font-size:18px">Backup e impostazioni</b><button onclick="A.close()" style="background:none;border:none;color:var(--terra);font-weight:700;min-height:44px">Chiudi</button></div>
  <div class="small mut">Per ora i dati stanno solo su questo telefono. Con il backup puoi salvarli in un file (per esempio su Drive o iCloud) e caricarli su un altro telefono.</div>
  <button class="btn ghost" onclick="A.exportData()">Scarica backup</button>
  <label class="btn ghost" style="display:flex;align-items:center;justify-content:center;position:relative">Carica backup o file di import<input type="file" accept="application/json,.json" style="position:absolute;inset:0;opacity:0" onchange="A.importData(this)"></label>
  <button class="btn ghost" onclick="A.addDemo()">Aggiungi viaggio di esempio</button>
  <div class="small mut">NEMO · prototipo v1</div>`);
}
function exportData() {
  const blob = new Blob([JSON.stringify(db, null, 1)], { type: 'application/json' });
  const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = `nemo-backup-${today()}.json`; a.click();
}
function importData(input) {
  const f = input.files[0]; if (!f) return; const r = new FileReader();
  r.onload = () => { try { const data = JSON.parse(r.result); const trips = data.trips || (data.trip ? [data.trip] : []);
      if (!trips.length) throw new Error('vuoto');
      let n = 0; trips.forEach((t) => { if (!t.id) t.id = uid(); migrate(t);
        const i = db.trips.findIndex((x) => x.id === t.id); if (i >= 0) db.trips[i] = t; else db.trips.push(t); n++; });
      save(); closeSheet(); go('home'); toast(`${n} viaggi caricati`);
    } catch (e) { toast('File non valido'); } };
  r.readAsText(f);
}

// ---------- allegati
function addFiles(input) {
  const files = [...input.files]; let pending = files.length; if (!pending) return;
  files.forEach((f) => {
    if (f.type === 'application/pdf') {
      if (f.size > 1.5e6) { toast('PDF troppo grande (max 1,5 MB)'); if (!--pending) refreshThumbs(); return; }
      const r = new FileReader(); r.onload = () => { draftFiles.push({ name: f.name, type: f.type, data: r.result }); if (!--pending) refreshThumbs(); }; r.readAsDataURL(f);
    } else {
      const img = new Image(); const url = URL.createObjectURL(f);
      img.onload = () => { const s = Math.min(1, 1200 / Math.max(img.width, img.height)); const c = document.createElement('canvas');
        c.width = Math.round(img.width * s); c.height = Math.round(img.height * s); c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        draftFiles.push({ name: f.name, type: 'image/jpeg', data: c.toDataURL('image/jpeg', 0.72) }); URL.revokeObjectURL(url); if (!--pending) refreshThumbs(); };
      img.onerror = () => { if (!--pending) refreshThumbs(); }; img.src = url;
    }
  });
}
function refreshThumbs() { const el = document.getElementById('thumbs'); if (!el) return;
  el.innerHTML = draftFiles.map((f, i) => f.type.startsWith('image') ? `<a href="#" onclick="A.viewFile(${i});return false"><img src="${f.data}" alt=""></a>` : `<a href="#" onclick="A.viewFile(${i});return false">PDF</a>`).join(''); }
function viewFile(i) { const f = draftFiles[i]; if (!f) return;
  fetch(f.data).then((r) => r.blob()).then((b) => window.open(URL.createObjectURL(b), '_blank')); }

// ---------- varie
let toastT;
let toastFn = null;
function toast(msg, action, fn) { const el = $('#toast'); toastFn = fn || null;
  el.innerHTML = esc(msg) + (action ? ` <button onclick="A.toastAct()" style="margin-left:10px;background:none;border:none;color:var(--hl);font-weight:700;font-size:14px;min-height:32px">${esc(action)}</button>` : '');
  el.hidden = false; clearTimeout(toastT); toastT = setTimeout(() => { el.hidden = true; toastFn = null; }, action ? 4000 : 2200); }

// ---------- API usata dai pulsanti
window.A = {
  home: () => go('home'),
  open: (id, tab) => { const t = trip(id); go('trip', { tripId: id, tab: tab || 'viaggio', day: null, pStart: null, mode: 'giorno', scrollNow: true }); },
  tab: (k) => { ui.tab = k; ui.scrollNow = k === 'viaggio'; window.scrollTo(0, 0); render(); },
  mode: (m) => { ui.mode = m; ui.scrollNow = m === 'giorno'; render(); },
  budToggle: (o) => { ui.budOpen = o; const c = document.querySelector('details.card summary span:last-child span'); if (c) c.style.transform = `rotate(${o ? 90 : 0}deg)`; },
  todoForm, saveTodo,
  todoAdd: () => { const v = val('tdNew'); if (!v) return; const t = trip(ui.tripId); t.todos.push({ id: uid(), text: v, date: val('tdDate'), time: '', done: false }); save(); render(); },
  todoDone: (id) => { const t = trip(ui.tripId); const x = t.todos.find((y) => y.id === id); x.done = true; save(); render(); toast('Fatto', 'Annulla', () => { x.done = false; save(); render(); }); },
  todoUndo: (id) => { const t = trip(ui.tripId); t.todos.find((y) => y.id === id).done = false; save(); render(); },
  todoDel: (id) => { const t = trip(ui.tripId); t.todos = t.todos.filter((y) => y.id !== id); save(); closeSheet(); render(); },
  showDone: () => { ui.showDone = !ui.showDone; render(); },
  toastAct: () => { const f = toastFn; $('#toast').hidden = true; toastFn = null; if (f) f(); },
  day: (d, fromPeriod) => { ui.day = d; if (fromPeriod) ui.mode = 'giorno'; ui.scrollNow = true; render(); },
  shift: (n) => { ui.pStart = addDays(ui.pStart, n); render(); },
  close: closeSheet, seg: (b) => { b.parentNode.querySelectorAll('button').forEach((x) => x.classList.remove('on')); b.classList.add('on'); },
  catColor: (c) => CATS[c].s,
  tripForm, saveTrip, itemForm, saveItem, expForm, saveExp, ideaForm, saveIdea, assign, saveAssign, budgetForm, bcalc, saveBudget,
  settings, exportData, importData, addFiles, viewFile,
  delItem: (id) => { if (!confirm('Eliminare questa prenotazione?')) return; const t = trip(ui.tripId); t.items = t.items.filter((x) => x.id !== id); save(); closeSheet(); render(); },
  delExp: (id) => { if (!confirm('Eliminare questa spesa?')) return; const t = trip(ui.tripId); t.expenses = t.expenses.filter((x) => x.id !== id); save(); closeSheet(); render(); },
  delIdea: (id) => { const t = trip(ui.tripId); t.ideas = t.ideas.filter((x) => x.id !== id); save(); closeSheet(); render(); },
  delTrip: (id) => { if (!confirm('Eliminare tutto il viaggio? Non si può annullare.')) return; db.trips = db.trips.filter((x) => x.id !== id); save(); go('home'); },
  openEntry: (kind, id) => kind === 'item' ? itemForm(id) : todoForm(id),
  toggleDone: (kind, id) => { const t = trip(ui.tripId); const o = (kind === 'item' ? t.items : t.todos).find((x) => x.id === id); o.done = !o.done; save(); render();
    if (o.done) toast('Fatto', 'Annulla', () => { o.done = false; save(); render(); }); },
  quickIdea: () => { const v = val('quick'); if (!v) return; const t = trip(ui.tripId); const isLink = /^https?:\/\//i.test(v);
    t.ideas.push({ id: uid(), title: isLink ? titleFromLink(v) : v, link: isLink ? v : '', cat: 'Esperienze', date: '', time: '', done: false }); save(); render(); toast('Idea salvata'); },
  ideaFilter: (c) => { ui.ideaFilter = c; render(); },
  settle: () => { const t = trip(ui.tripId); const b = balance(t); const debtor = b.Simone < 0 ? 'Simone' : 'Fedra'; const cred = debtor === 'Simone' ? 'Fedra' : 'Simone';
    if (!confirm(`Segnare che ${debtor} ha dato ${eur(Math.abs(b[debtor]))} a ${cred}?`)) return;
    (t.settlements = t.settlements || []).push({ from: debtor, to: cred, amount: Math.abs(b[debtor]), date: today() }); save(); render(); },
  ck: (id) => { const t = trip(ui.tripId); const c = t.checklist.find((x) => x.id === id); c.done = !c.done; save(); render(); },
  ckAdd: () => { const v = val('ckNew'); if (!v) return; const t = trip(ui.tripId); (t.checklist = t.checklist || []).push({ id: uid(), text: v, done: false }); save(); render(); },
  ckDel: (id) => { const t = trip(ui.tripId); t.checklist = t.checklist.filter((x) => x.id !== id); save(); render(); },
  addDemo: () => { db.trips.push(migrate(demoTrip())); save(); closeSheet(); go('home'); },
};

load(); render();
if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
})();
