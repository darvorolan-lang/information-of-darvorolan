const $ = s => document.querySelector(s);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const get = async f => { const r = await fetch(f); if (!r.ok) throw new Error(f); return r.json(); };
const empty = m => `<p class="empty">${m}</p>`;
let P = {};
const NAV = [['index.html','home'],['projects.html','projects'],['writeups.html','writeups'],['guestbook.html','guestbook']];

function shell() {
  const cur = location.pathname.split('/').pop() || 'index.html';
  const active = cur === 'writeup.html' ? 'writeups.html' : cur;
  $('#nav').innerHTML = `<nav class="hud">
    <a class="logo" href="index.html"><b>&gt;_</b> ${esc(P.name.split(' ')[0].toUpperCase())}<span>.SEC</span></a>
    <div class="hud-r">
      <div class="links">${NAV.map(([h, t]) => `<a href="${h}" class="${h === active ? 'on' : ''}">${t}</a>`).join('')}</div>
      <span id="clock"></span>
    </div>
  </nav>`;
  $('#foot').innerHTML = `<footer>// ${new Date().getFullYear()} ${esc(P.name)} · hosted on github pages · all systems nominal</footer>`;
  const tick = () => { const c = $('#clock'); if (c) c.textContent = new Date().toLocaleTimeString('id-ID', { hour12: false }); };
  tick(); setInterval(tick, 1000);
}

function fill() {
  document.querySelectorAll('[data-f]').forEach(el => {
    const v = P[el.dataset.f] ?? '';
    el.textContent = v;
    if (el.classList.contains('glitch')) el.dataset.t = v;
  });
}

function photo() {
  const el = $('#photo'); if (!el) return;
  el.textContent = P.name.split(' ').map(w => w[0] || '').join('').slice(0, 2).toUpperCase();
  const img = new Image();
  img.alt = P.name;
  img.onload = () => el.replaceChildren(img);
  img.src = P.photo;
}

function count(el, n) {
  if (!el) return;
  let i = 0; const step = Math.max(1, Math.ceil(n / 25));
  const t = setInterval(() => { i = Math.min(n, i + step); el.textContent = i; if (i >= n) clearInterval(t); }, 40);
}

function reveal() {
  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { threshold: .1 });
  document.querySelectorAll('.rv:not(.in)').forEach(el => io.observe(el));
}

function boot() {
  const el = $('#boot');
  if (!el || sessionStorage.getItem('booted') || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  sessionStorage.setItem('booted', '1');
  el.hidden = false;
  const out = $('#boot-out');
  const lines = [
    '> menghubungkan ke jaringan...',
    '> memuat profil ' + P.name.toLowerCase() + '...',
    '> scanning ports ............ [ OK ]',
    '> dekripsi arsip write-up ... [ OK ]',
    '> ACCESS GRANTED'
  ];
  let i = 0;
  const t = setInterval(() => {
    out.textContent += lines[i++] + '\n';
    if (i === lines.length) {
      clearInterval(t);
      setTimeout(() => el.classList.add('off'), 500);
      setTimeout(() => el.hidden = true, 1200);
    }
  }, 230);
}

const skillBar = s => {
  const name = typeof s === 'string' ? s : s.name;
  const lv = typeof s === 'string' ? 75 : (s.level ?? 75);
  return `<div class="skill"><div class="sk-top"><span>${esc(name)}</span><span>${lv}%</span></div><div class="bar"><i style="width:${lv}%"></i></div></div>`;
};

const projCard = p => `<article class="panel card rv">
  <div class="thumb">${p.image ? `<img src="${esc(p.image)}" alt="">` : '&lt;/&gt;'}</div>
  <div class="meta">${(p.tags || []).map(t => `<span class="tag">${esc(t)}</span>`).join('')}</div>
  <h3>${esc(p.title)}</h3>
  <p>${esc(p.desc)}</p>
  <div class="card-foot">
    <span class="badge ${p.status === 'wip' ? 'wip' : 'ok'}">${p.status === 'wip' ? 'in progress' : 'complete'}</span>
    <span class="actions">${p.repo ? `<a href="${esc(p.repo)}" target="_blank" rel="noopener">source ↗</a>` : ''}${p.demo ? `<a href="${esc(p.demo)}" target="_blank" rel="noopener">demo ↗</a>` : ''}</span>
  </div>
</article>`;

const wCard = w => `<a class="panel card rv" href="writeup.html?p=${encodeURIComponent(w.slug)}">
  <div class="meta"><span class="badge cy">${esc(w.category)}</span><span class="badge d-${esc((w.difficulty || '').toLowerCase())}">${esc((w.difficulty || '').toUpperCase())}</span></div>
  <h3>${esc(w.title)}</h3>
  <p>${esc(w.summary)}</p>
  <div class="card-foot"><span>${esc(w.platform || '')}</span><time>${esc(w.date)}</time></div>
</a>`;

function giscus(el, term) {
  const g = P.giscus;
  if (!g || String(g.repoId).startsWith('GANTI')) {
    el.innerHTML = '<p class="muted">// komentar belum aktif. isi bagian "giscus" di profile.json</p>';
    return;
  }
  const s = document.createElement('script');
  s.src = 'https://giscus.app/client.js';
  s.async = true;
  s.crossOrigin = 'anonymous';
  Object.entries({
    repo: g.repo, 'repo-id': g.repoId, category: g.category, 'category-id': g.categoryId,
    mapping: 'specific', term, strict: '0', 'reactions-enabled': '1', 'emit-metadata': '0',
    'input-position': 'top', theme: 'transparent_dark', lang: 'id'
  }).forEach(([k, v]) => s.setAttribute('data-' + k, v));
  el.replaceChildren(s);
}

async function home() {
  fill(); photo(); boot();
  $('#mail').href = 'mailto:' + P.email;
  $('#status').textContent = P.status || '';
  $('#skills').innerHTML = P.skills.map(skillBar).join('');
  $('#socials').innerHTML = P.socials.map(s => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.label)} ↗</a>`).join('');
  const ctf = P.ctf ?? 0, lvl = Math.floor(ctf / 5) + 1, into = ctf % 5;
  $('#lvl').textContent = String(lvl).padStart(2, '0');
  $('#xp').style.width = (into * 20) + '%';
  $('#xp-t').textContent = `${into}/5 CTF → LVL ${lvl + 1}`;
  const [pr, wr] = await Promise.all([get('projects.json'), get('writeups.json')]);
  count($('#n-p'), pr.length); count($('#n-w'), wr.length); count($('#n-s'), P.skills.length); count($('#n-c'), ctf);
  $('#latest-p').innerHTML = pr.slice(0, 3).map(projCard).join('') || empty('belum ada project');
  $('#latest-w').innerHTML = wr.slice(0, 3).map(wCard).join('') || empty('belum ada write-up');
  reveal();
}

async function projects() {
  const list = await get('projects.json');
  const tags = [...new Set(list.flatMap(p => p.tags || []))];
  const bar = $('#filters');
  const draw = t => {
    $('#grid').innerHTML = (t ? list.filter(p => (p.tags || []).includes(t)) : list).map(projCard).join('') || empty('tidak ada project di kategori ini');
    reveal();
  };
  bar.innerHTML = ['Semua', ...tags].map((t, i) => `<button class="chip${i ? '' : ' on'}" data-t="${esc(i ? t : '')}">${esc(t)}</button>`).join('');
  bar.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    bar.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    draw(b.dataset.t);
  };
  draw('');
}

async function writeups() {
  const list = await get('writeups.json');
  const cats = [...new Set(list.map(w => w.category))];
  const bar = $('#filters');
  let cat = '', q = '';
  const draw = () => {
    const f = list.filter(w => (!cat || w.category === cat) &&
      (!q || `${w.title} ${w.summary} ${(w.tags || []).join(' ')}`.toLowerCase().includes(q)));
    $('#grid').innerHTML = f.map(wCard).join('') || empty('tidak ada write-up yang cocok');
    reveal();
  };
  bar.innerHTML = ['Semua', ...cats].map((c, i) => `<button class="chip${i ? '' : ' on'}" data-c="${esc(i ? c : '')}">${esc(c)}</button>`).join('');
  bar.onclick = e => {
    const b = e.target.closest('button'); if (!b) return;
    cat = b.dataset.c;
    bar.querySelectorAll('button').forEach(x => x.classList.toggle('on', x === b));
    draw();
  };
  $('#q').oninput = e => { q = e.target.value.toLowerCase().trim(); draw(); };
  draw();
}

async function writeup() {
  const slug = new URLSearchParams(location.search).get('p');
  const w = (await get('writeups.json')).find(x => x.slug === slug);
  if (!w) { $('#post').innerHTML = empty('write-up tidak ditemukan'); return; }
  document.title = `${w.title} · ${P.name}`;
  $('#meta').innerHTML = `<span class="badge cy">${esc(w.category)}</span><span class="badge d-${esc((w.difficulty || '').toLowerCase())}">${esc((w.difficulty || '').toUpperCase())}</span><span class="muted">${esc(w.platform || '')} · ${esc(w.date)}</span>`;
  $('#ttl').textContent = w.title;
  const r = await fetch(w.file);
  if (!r.ok) throw new Error('file tidak ditemukan: ' + w.file);
  $('#body').innerHTML = marked.parse(await r.text());
  document.querySelectorAll('#body pre code').forEach(b => hljs.highlightElement(b));
  giscus($('#cmt'), slug);
}

async function guestbook() { giscus($('#cmt'), 'guestbook'); }

const PAGES = { home, projects, writeups, writeup, guestbook };
(async () => {
  try {
    P = await get('profile.json');
    shell();
    const fn = PAGES[document.body.dataset.page];
    if (fn) await fn();
  } catch (e) {
    console.error(e);
    document.querySelector('main')?.insertAdjacentHTML('afterbegin', empty('gagal memuat data. buka lewat github pages, bukan langsung dari komputer'));
  }
})();
