/* JAGGAER AI Worker Console — mockup logic. All data/metrics shown in worker screens are illustrative. */
const $ = s => document.querySelector(s);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const initials = n => n.replace(/^JAI /, '').replace(/\(.*\)/, '').trim().split(/\s+/).slice(0, 2).map(w => w[0]).join('').toUpperCase();
const allWorkers = () => DATA.flatMap(s => s.workers.map(w => ({ ...w, sup: s })));
const count = (w, f) => w.skills.reduce((n, s) => n + f(s), 0);
const nAgents = w => count(w, s => s.agents.length);
const nTasks = w => count(w, s => s.agents.reduce((m, a) => m + Math.max(a.tasks.length, 0), 0));
const licPill = (l, rel) => l === 'usage' ? `<span class="pill a">Charged by usage${rel ? ' · ' + rel : ''}</span>` : `<span class="pill p">Base licence (dial tone)</span>`;

let st = { sup: null, worker: null, skill: null, aos: null, tab: 'console' };
let openWorkers = new Set(), aosOpen = false;

function go(p) {
  st = { sup: null, worker: null, skill: null, aos: null, tab: 'console', ...p };
  if (st.worker) openWorkers.add(st.worker);
  render(); chatContext();
}
const findSup = n => DATA.find(s => s.name === n);
const findWorker = n => allWorkers().find(w => w.name === n);

/* ------------------------------------------------ sidebar */
function renderTree() {
  const focus = st.sup && !st.worker && !st.skill ? st.sup : (st.worker ? findWorker(st.worker).sup.name : st.sup);
  const filtered = !!(st.sup || st.worker);
  let h = `<div class="lbl"><span>Supervisors &amp; AI Workers</span>${filtered ? `<button onclick="go({})">Show all</button>` : ''}</div>`;
  DATA.filter(s => !filtered || s.name === focus).forEach(s => {
    h += `<div class="sup"><button class="sup-h ${st.sup === s.name && !st.worker ? 'on' : ''}" onclick="go({sup:'${esc(s.name)}'})"><span class="dot"></span>${esc(s.name)}<span class="n">${s.workers.length}</span></button>`;
    s.workers.forEach(w => {
      const open = openWorkers.has(w.name);
      h += `<button class="wk ${st.worker === w.name && !st.skill ? 'on' : ''}" onclick="go({sup:'${esc(s.name)}',worker:'${esc(w.name)}'})"><span class="chev ${open ? 'open' : ''}">▶</span><span class="av">${initials(w.name)}</span><span>${esc(w.name)}</span></button>`;
      if (open) w.skills.forEach((k, i) => h += `<button class="sk ${st.worker === w.name && st.skill === i ? 'on' : ''}" title="${esc(k.name)}" onclick="go({sup:'${esc(s.name)}',worker:'${esc(w.name)}',skill:${i}})">${esc(k.name)}</button>`);
    });
    h += `</div>`;
  });
  $('#tree').innerHTML = h;
  $('#navHome').classList.toggle('on', !st.sup && !st.worker && !st.aos);

  const items = [['Supervisor', '◆'], ['Worker', '☻'], ['Skill', '✦'], ['Agent', '⚙'], ['Task', '✓']];
  $('#aos').innerHTML = `<button class="aos-h" onclick="aosOpen=!aosOpen;renderTree()"><span class="chev ${aosOpen ? 'open' : ''}">▶</span>⬡ AgentOS<span class="tag">BUILD</span></button>` +
    (aosOpen ? `<div class="aos-list">${items.map(([n, i]) => `<button class="aos-i ${st.aos === n ? 'on' : ''}" onclick="go({aos:'${n}'})"><i>${i}</i>Create ${n}</button>`).join('')}</div>` : '');
}

/* ------------------------------------------------ main */
function crumbs(parts) {
  return `<div class="topbar"><div class="crumbs">${parts.map((p, i) => i === parts.length - 1 ? `<b>${esc(p[0])}</b>` : `<a onclick="${p[1]}">${esc(p[0])}</a><span>/</span>`).join('')}</div><span class="spacer"></span><button class="btn" onclick="toast('Mockup — export not wired')">Export</button><button class="btn p" onclick="go({aos:'Worker'})">+ New</button></div>`;
}
function render() {
  renderTree();
  let h;
  if (st.aos) h = viewAos();
  else if (st.worker && st.skill !== null) h = viewSkill();
  else if (st.worker) h = viewWorker();
  else if (st.sup) h = viewSup();
  else h = viewHome();
  $('#main').innerHTML = h; $('#main').scrollTop = 0;
}

function workerCard(w) {
  return `<div class="card click" onclick="go({sup:'${esc(w.sup.name)}',worker:'${esc(w.name)}'})">
    <div class="row between"><span class="av" style="width:34px;height:34px;font-size:13px;border-radius:10px">${initials(w.name)}</span><span class="pill g">● Active</span></div>
    <h3 style="margin-top:10px">${esc(w.name)}</h3>
    <p class="muted small" style="margin:0 0 10px;min-height:54px">${esc(w.desc)}</p>
    <div class="row wrap small muted"><span><b>${w.skills.length}</b> skills</span>·<span><b>${nAgents(w)}</b> agents</span></div>
    <div style="margin-top:8px">${licPill(w.lic)}</div></div>`;
}
function viewHome() {
  const W = allWorkers(), ag = W.reduce((n, w) => n + nAgents(w), 0), sk = W.reduce((n, w) => n + w.skills.length, 0);
  return crumbs([['AI Worker Console']]) + `<div class="page">
  <h1>Your AI workforce</h1><p class="sub">Every AI Worker, organised under the Supervisor that orchestrates it. Pick a Supervisor to focus, a Worker to see it in action, or a Skill to see the Agents and Tasks it is built from.</p>
  <div class="grid g4"><div class="card kpi"><div class="v">${DATA.length}</div><div class="l">Supervisors</div></div><div class="card kpi"><div class="v">${W.length}</div><div class="l">AI Workers</div></div><div class="card kpi"><div class="v">${sk}</div><div class="l">Skills</div></div><div class="card kpi"><div class="v">${ag}</div><div class="l">Agents</div></div></div>
  ${DATA.map(s => `<div class="sec-title"><h2>${esc(s.name)} <span class="pill p" style="vertical-align:middle">${esc(s.stage)}</span></h2><a class="small" style="color:var(--purple);cursor:pointer" onclick="go({sup:'${esc(s.name)}'})">Open supervisor →</a></div>
  <div class="grid g3">${s.workers.map(w => workerCard({ ...w, sup: s })).join('')}</div>`).join('')}</div>`;
}
function viewSup() {
  const s = findSup(st.sup);
  const aw = s.workers.reduce((n, w) => n + nAgents(w), 0);
  return crumbs([['AI Worker Console', 'go({})'], [s.name]]) + `<div class="page">
  <div class="row"><span class="pill p">Supervisor</span><span class="pill">${esc(s.stage)}</span></div>
  <h1 style="margin-top:8px">${esc(s.name)}</h1>
  <p class="sub">The Supervisor orchestrates ${s.workers.length} AI Worker${s.workers.length > 1 ? 's' : ''}, routes work between them, and escalates exceptions to people.</p>
  <div class="grid g3"><div class="card kpi"><div class="v">${s.workers.length}</div><div class="l">AI Workers</div></div><div class="card kpi"><div class="v">${s.workers.reduce((n, w) => n + w.skills.length, 0)}</div><div class="l">Skills</div></div><div class="card kpi"><div class="v">${aw}</div><div class="l">Agents</div></div></div>
  <h2>AI Workers</h2><div class="grid g3">${s.workers.map(w => workerCard({ ...w, sup: s })).join('')}</div></div>`;
}

/* worker screen */
function viewWorker() {
  const w = findWorker(st.worker);
  const ui = (UIS[w.ui] || UIS.platform)(w);
  return crumbs([['AI Worker Console', 'go({})'], [w.sup.name, `go({sup:'${esc(w.sup.name)}'})`], [w.name]]) + `<div class="page">
  <div class="hero"><span class="av">${initials(w.name)}</span><div style="flex:1"><div class="row wrap"><h1>${esc(w.name)}</h1><span class="pill g">● Active</span>${licPill(w.lic)}${w.note ? `<span class="pill b">${esc(w.note)}</span>` : ''}</div><p class="sub" style="margin:4px 0 0">${esc(w.desc)}</p></div></div>
  <div class="tabs">${['console:Live console', 'skills:Skills (' + w.skills.length + ')'].map(t => { const [k, l] = t.split(':'); return `<button class="tab ${st.tab === k ? 'on' : ''}" onclick="st.tab='${k}';render()">${l}</button>`; }).join('')}</div>
  ${st.tab === 'console' ? ui : `<div class="grid g2">${w.skills.map((k, i) => `<div class="card click" onclick="go({sup:'${esc(w.sup.name)}',worker:'${esc(w.name)}',skill:${i}})"><div class="row between"><h3>${esc(k.name)}</h3>${k.lic ? licPill(k.lic, k.release) : ''}</div><div class="small muted">${k.agents.length} agent${k.agents.length === 1 ? '' : 's'} · ${k.agents.reduce((n, a) => n + a.tasks.length, 0)} tasks</div></div>`).join('')}</div>`}
  </div>`;
}

/* skill screen: Agents & Tasks composition */
function viewSkill() {
  const w = findWorker(st.worker), k = w.skills[st.skill];
  const tasks = k.agents.reduce((n, a) => n + a.tasks.length, 0);
  return crumbs([['AI Worker Console', 'go({})'], [w.sup.name, `go({sup:'${esc(w.sup.name)}'})`], [w.name, `go({sup:'${esc(w.sup.name)}',worker:'${esc(w.name)}'})`], [k.name]]) + `<div class="page">
  <div class="row wrap"><span class="pill p">Skill</span>${k.lic ? licPill(k.lic, k.release) : licPill(w.lic)}</div>
  <h1 style="margin-top:8px">${esc(k.name)}</h1>
  <p class="sub">A Skill of <b>${esc(w.name)}</b>, composed of ${k.agents.length} Agent${k.agents.length === 1 ? '' : 's'} and ${tasks} Task${tasks === 1 ? '' : 's'}.</p>
  <div class="row" style="margin-bottom:6px"><button class="btn p" onclick="toast('Mockup — test run started')">▶ Test run</button><button class="btn" onclick="go({aos:'Agent'})">+ Add agent</button><button class="btn" onclick="go({sup:'${esc(w.sup.name)}',worker:'${esc(w.name)}'})">View worker console</button></div>
  <h2>Agents &amp; Tasks</h2>
  ${k.agents.length ? `<div class="flow"><div class="root"><small>Skill</small><b>${esc(k.name)}</b><div class="small" style="margin-top:8px;opacity:.85">${esc(w.name)}</div></div>
  <div class="agents">${k.agents.map(a => `<div class="agent"><div class="hd"><span class="ic">⚙</span><div style="flex:1"><div class="tiny">AGENT</div><b>${esc(a.name)}</b></div><span class="pill g">● Ready</span></div>
    <div class="tasks">${a.tasks.length ? a.tasks.map(t => `<span class="task">${esc(t)}</span>`).join('') : `<span class="task tbd">Tasks TBD</span>`}</div></div>`).join('')}</div></div>`
    : `<div class="card" style="text-align:center;padding:36px"><div style="font-size:28px">⚙</div><h3>No Agents defined yet</h3><p class="muted">This Skill is on the roadmap. Create the first Agent in AgentOS.</p><button class="btn p" onclick="go({aos:'Agent'})">Create Agent</button></div>`}
  <h2>Skill in action</h2>${UIS[w.ui] ? UIS[w.ui](w, true) : ''}</div>`;
}

/* AgentOS create forms */
function viewAos() {
  const t = st.aos, W = allWorkers();
  const parent = {
    Supervisor: null,
    Worker: ['Supervisor', DATA.map(s => s.name)],
    Skill: ['AI Worker', W.map(w => w.name)],
    Agent: ['Skill', W.flatMap(w => w.skills.map(k => w.name + ' › ' + k.name))],
    Task: ['Agent', W.flatMap(w => w.skills.flatMap(k => k.agents.map(a => w.name + ' › ' + k.name + ' › ' + a.name)))]
  }[t];
  const blurb = { Supervisor: 'A Supervisor groups related AI Workers and orchestrates hand-offs between them.', Worker: 'An AI Worker is a persona that owns a set of Skills and works alongside a business role.', Skill: 'A Skill is a use case a Worker can perform, composed of one or more Agents.', Agent: 'An Agent is an autonomous unit that completes a step of a Skill using Tasks and tools.', Task: 'A Task is the smallest executable action an Agent can perform.' }[t];
  return crumbs([['AI Worker Console', 'go({})'], ['AgentOS'], ['Create ' + t]]) + `<div class="page" style="max-width:720px">
  <span class="pill p">AgentOS</span><h1 style="margin-top:8px">Create ${t}</h1><p class="sub">${blurb}</p>
  <form class="card form" onsubmit="createItem(event,'${t}')">
    ${parent ? `<label>${parent[0]}</label><select id="f-parent">${parent[1].map(p => `<option>${esc(p)}</option>`).join('')}</select>` : ''}
    <label>${t} name</label><input id="f-name" required placeholder="e.g. ${{ Supervisor: 'Expense Management', Worker: 'JAI Expense Manager', Skill: 'Receipt Validation', Agent: 'Receipt OCR Agent', Task: 'Extract line items' }[t]}">
    <label>Description</label><textarea rows="3" placeholder="What does it do?"></textarea>
    ${t === 'Worker' || t === 'Skill' ? `<label>Licensing</label><select><option>Base licence (dial tone)</option><option>Charged by usage</option></select>` : ''}
    ${t === 'Agent' || t === 'Task' ? `<label>Model &amp; tools</label><select><option>JAI default model · Jaggaer APIs</option><option>JAI reasoning model · Jaggaer APIs + web</option></select>` : ''}
    <div class="row" style="margin-top:18px"><button class="btn p">Create ${t}</button><button type="button" class="btn" onclick="go({})">Cancel</button></div>
  </form></div>`;
}
function createItem(e, t) {
  e.preventDefault();
  const name = $('#f-name').value.trim(), p = $('#f-parent')?.value;
  if (t === 'Supervisor') DATA.push({ name, stage: 'Custom', workers: [] });
  else if (t === 'Worker') findSup(p).workers.push({ name, ui: 'platform', lic: 'base', desc: 'Custom AI Worker created in AgentOS.', skills: [] });
  else if (t === 'Skill') findWorker(p).skills.push({ name, agents: [] });
  else if (t === 'Agent') { const [wn, kn] = p.split(' › '); findWorker(wn).skills.find(k => k.name === kn).agents.push({ name, tasks: [] }); }
  else { const [wn, kn, an] = p.split(' › '); findWorker(wn).skills.find(k => k.name === kn).agents.find(a => a.name === an).tasks.push(name); }
  toast(t + ' “' + name + '” created (in-memory mockup)'); go({});
}
function toast(m) { const d = document.createElement('div'); d.className = 'toast'; d.textContent = m; document.body.appendChild(d); setTimeout(() => d.remove(), 2200); }

/* ------------------------------------------------ worker "live console" screens (illustrative data) */
const P = (c, t) => `<span class="pill ${c}">${t}</span>`;
const kpis = a => `<div class="grid g4">${a.map(([v, l, d]) => `<div class="card kpi"><div class="v">${v}</div><div class="l">${l}</div>${d ? `<div class="d">${d}</div>` : ''}</div>`).join('')}</div>`;
const card = (t, b, x = '') => `<div class="card ${x}"><div class="sec-title"><h3>${t}</h3></div>${b}</div>`;
const tbl = (h, rows) => `<table class="tbl"><tr>${h.map(x => `<th>${x}</th>`).join('')}</tr>${rows.map(r => `<tr>${r.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}</table>`;

const UIS = {
  intake: () => `<div class="card"><h3 style="font-size:18px">What do you need?</h3>
    <div class="row wrap small muted" style="margin:6px 0 10px"><span>Go to:</span><a>Favorites</a><a>Forms</a><a>Non-Catalog Item</a><a>Quick Order</a><span>· Browse:</span><a>Suppliers</a><a>Categories</a><a>Contracts</a></div>
    <div class="search"><span>🔍</span><input placeholder="Search for products, suppliers, part number, etc."><button class="btn p">Search</button></div>
    <div class="banner"><span style="color:var(--purple);font-size:18px">✦</span><span><b>New</b> — let <b>JAI</b> guide your request. Just describe what you need in the assistant. →</span></div></div>
    <div class="grid g2" style="margin-top:14px">
    ${card('My Draft Carts', tbl(['Cart', 'Type', 'Total'], [['Lab Equipment Reorder – Q3 2026', 'My Drafts', '20,499.50 USD'], ['Workshop Catering – Aug All-Hands', 'My Drafts', '6,195.00 USD'], ['IT Peripherals – New Starters', 'My Drafts', '1,752.30 USD'], ['Office Supplies – Austin Lab', 'My Drafts', '500.00 USD']]))}
    ${card('In-Progress Requests', tbl(['Request', 'Type', 'Workflow status'], [['Security Audit Engagement', 'Intake Request', P('a', 'Contract (SOW)')], ['Corporate Catering – Q3 Offsite', 'Procurement Request', P('p', 'Manager Approval')], ['Building B Refurbishment', 'Sourcing Request', P('p', 'Buyer Approval')], ['Clean4you – Grounds &amp; External Cleaning', 'Contract Amendment', P('p', 'Contract Manager')]]))}</div>
    <p class="tiny" style="margin-top:12px">→ Try it: ask JAI in the dock “I need 10 boxes of nitrile exam gloves, medium, for the Austin lab”.</p>`,

  supplier: () => kpis([['128', 'Suppliers in onboarding', '▲ 14 this week'], ['93%', 'Auto-validated (Bank &amp; VAT)', '▲ 6 pts'], ['11', 'Need human review'], ['2.1 d', 'Avg. time to onboard', '▼ from 9 d']]) +
    `<div class="grid g2" style="margin-top:14px">${card('Onboarding queue', tbl(['Supplier', 'Stage', 'Agent status'], [
      ['Medline Industries', P('p', 'Registration'), P('g', 'Docs complete')], ['Northwind Logistics', P('b', 'Invitation sent'), P('', 'Awaiting supplier')], ['Acme Fasteners GmbH', P('p', 'Validation'), P('g', 'VAT ✓ · Bank ✓')], ['Globex Packaging', P('p', 'Validation'), P('r', 'Bank mismatch')], ['Initech Services', P('p', 'Qualification'), P('a', 'Cert. expiring')]]))}
      ${card('Agent activity', `<div class="clause ok"><b>Supplier Bank and VAT Validation</b><div class="small muted">Acme Fasteners GmbH — VAT DE•••4821 verified with VIES; IBAN owner matches legal name.</div></div>
      <div class="clause risk"><b>Supplier Deduplication</b><div class="small muted">“Globex Packaging Ltd” matches existing supplier G-20931 (94% similarity).</div><div class="row" style="margin-top:6px"><button class="btn" onclick="toast('Merged (mockup)')">Merge</button><button class="btn" onclick="toast('Kept separate (mockup)')">Keep separate</button></div></div>
      <div class="clause"><b>Supplier Risk Monitoring</b><div class="small muted">1 sanctions-list alert cleared as false positive.</div></div>`)}</div>`,

  category: () => kpis([['14', 'Active categories'], ['$182M', 'Addressable spend'], ['$9.4M', 'Identified opportunity', '▲ 12%'], ['5', 'Strategies due for review']]) +
    `<div class="grid g2" style="margin-top:14px">${card('Category positioning', `<div class="q"><div><b>Leverage</b>Packaging · Lab consumables</div><div><b>Strategic</b>IT hardware · Logistics</div><div><b>Routine</b>Office supplies · Catering</div><div><b>Bottleneck</b>Specialty chemicals</div></div>`)}
      ${card('Strategy draft — Lab consumables', `<p class="small muted">Generated by <b>Category Strategy Definition</b>. Informed by supplier evaluation and market insights.</p>${['Consolidate 38 suppliers to 6 preferred', 'Move 70% of volume to contract-based buying', 'Run Q4 RFx — target 8–11% savings', 'Watch: nitrile price +6% (market insight)'].map(x => `<div class="clause ok">${x}</div>`).join('')}<button class="btn p" onclick="toast('Strategy sent for review (mockup)')">Send for review</button>`)}</div>`,

  sourcing: w => kpis([['7', 'Events in flight'], ['23', 'Suppliers invited today'], ['$1.3M', 'Projected savings', '▲ 9.4%'], ['4 h', 'Avg. event setup', '▼ from 3 d']]) +
    `<div class="grid" style="margin-top:14px">${card('RFx — Nitrile Gloves FY27 · Bids review &amp; award recommendation', tbl(['Supplier', 'Unit price', 'Lead time', 'Quality', 'Total (1.2M units)', ''], [
      ['Medline Industries', '$0.084', '5 d', P('g', '98%'), '<b>$100.8k</b>', P('g', 'Recommended')], ['Fisher Scientific', '$0.092', '4 d', P('g', '97%'), '$110.4k', ''], ['Thermo Fisher', '$0.095', '7 d', P('a', '93%'), '$114.0k', ''], ['Cardinal Health', '$0.101', '3 d', P('g', '96%'), '$121.2k', '']]) +
      `<div class="sug" style="margin-top:10px">✦ <b>Award recommendation:</b> split 70/30 between Medline and Fisher to protect supply — saves <b>$14.6k (11.4%)</b> vs. last award.${/Strategic|Complex|Direct/.test(w.name) ? ' <b>Scenario optimization</b> evaluated 214 award scenarios.' : ''}</div>`)}
      ${card('Event timeline', ['Event created from category profile ✓', '14 suppliers invited ✓', '11 bids received ✓', 'Bids reviewed ✓', 'Negotiation round 2 — in progress', 'Award &amp; contract creation'].map((x, i) => `<div class="row small" style="margin:6px 0"><span class="pill ${i < 4 ? 'g' : i === 4 ? 'p' : ''}">${i < 4 ? '✓' : i === 4 ? '●' : '○'}</span>${x}</div>`).join(''))}</div>`,

  contract: () => `<div class="grid" style="grid-template-columns:260px minmax(0,1fr);gap:14px">
    ${card('Contracts in review', [['MSA — Clean4you', 'r', '3 risks'], ['NDA — Globex', 'g', 'Clear'], ['SOW — Security Audit', 'a', '1 risk'], ['Renewal — Medline', 'p', 'Due in 45 d']].map((c, i) => `<div class="clause ${i === 0 ? 'risk' : ''}" style="margin:6px 0"><b class="small">${c[0]}</b><div>${P(c[1], c[2])}</div></div>`).join(''))}
    ${card('MSA — Clean4you · Risky language review', `<div class="clause risk"><b class="small">§12.3 Limitation of liability</b><p style="margin:4px 0">Supplier's liability is capped at <mark>fees paid in the prior 3 months</mark> for all claims.</p>
      <div class="sug">✦ <b>Suggested alternative:</b> “…capped at the greater of fees paid in the prior 12 months or USD 1,000,000.” <div class="row" style="margin-top:6px"><button class="btn p" onclick="toast('Redline applied (mockup)')">Apply redline</button><button class="btn">Ignore</button></div></div></div>
      <div class="clause risk"><b class="small">§8.1 Auto-renewal</b><p style="margin:4px 0">Renews for <mark>24 months</mark> unless cancelled 180 days prior.</p></div>
      <div class="clause ok"><b class="small">§15 Data protection</b><p style="margin:4px 0">Meets JAGGAER DPA standard. ✓</p></div>
      <div class="row small muted">${P('p', 'Chat with your contract')}<span>“What is our termination notice period?” → <b>90 days</b> (§17.2)</span></div>`)}</div>`,

  buyer: () => kpis([['42', 'Requisitions today'], ['36', 'Auto-routed'], ['6', 'Awaiting approver'], ['1.4 h', 'Avg. approval time']]) +
    `<div style="margin-top:14px">${card('Purchase requisitions', tbl(['PR', 'Description', 'Amount', 'Approvals'], [['PR-10482', 'Direct material — resin pellets', '$48,200', P('g', 'Approved')], ['PR-10483', 'Services — facilities contractor', '$12,750', P('p', 'Manager approval')], ['PR-10484', 'Direct material — steel brackets', '$9,400', P('p', 'Budget owner')], ['PR-10485', 'Services — IT consulting', '$31,000', P('a', 'Needs SOW')]]))}</div>`,

  purchaser: () => kpis([['27', 'PRs to accept'], ['24', 'POs created today'], ['98%', 'Touchless rate'], ['3', 'Exceptions']]) +
    `<div style="margin-top:14px">${card('PR → PO', tbl(['PR', 'Supplier', 'Status', 'PO'], [['PR-10482', 'Polymers Inc.', P('g', 'Accepted'), 'PO-77310'], ['PR-10479', 'Acme Fasteners GmbH', P('g', 'Accepted'), 'PO-77309'], ['PR-10478', 'Globex Packaging', P('r', 'Price variance'), '—']]))}</div>`,

  invoice: () => kpis([['1,284', 'Invoices today'], ['91%', 'Touchless', '▲ 4 pts'], ['37', 'Exceptions'], ['2', 'Fraud alerts']]) +
    `<div style="margin-top:14px">${card('Invoice queue — matching &amp; validation', tbl(['Invoice', 'Supplier', 'Amount', 'Channel', 'Match', 'Status'], [
      ['INV-88231', 'Medline Industries', '$4,210.00', 'API', P('g', '3-way ✓'), P('g', 'Ready to pay')], ['INV-88232', 'Acme Fasteners GmbH', '€9,880.50', 'EDI', P('g', '2-way ✓'), P('p', 'In approval')], ['INV-88233', 'Northwind Logistics', '$1,920.00', 'PDF · OCR', P('a', 'Qty variance'), P('a', 'Exception')], ['INV-88234', 'Unknown Vendor LLC', '$24,000.00', 'Email', P('r', 'No PO'), P('r', 'Fraud suspected')]]))}
      <div class="sug" style="margin-top:12px">✦ <b>Invoice Fraud Detection:</b> INV-88234 — bank account changed 2 days ago and supplier not in master data. Held for review.</div></div>`,

  pay: () => kpis([['$4.82M', 'Next payment run'], ['612', 'Eligible invoices'], ['$38.6k', 'Early-pay discounts captured'], ['3', 'Run exceptions']]) +
    `<div class="grid g2" style="margin-top:14px">${card('Weekly payment run — preparation', tbl(['Bucket', 'Invoices', 'Amount'], [['Due this week', '388', '$2.91M'], ['Early-pay discount', '141', '$1.32M'], ['Supply chain finance', '83', '$0.59M']]))}
      ${card('Payment optimization', `<div class="sug">✦ Paying 141 invoices early captures <b>$38.6k</b> in discounts while keeping cash above the $1.5M floor.</div><div class="bar" style="margin:14px 0 6px"><i style="width:72%"></i></div><div class="tiny">72% of run optimized</div><div class="row" style="margin-top:12px"><button class="btn p" onclick="toast('Run scheduled (mockup)')">Approve run</button><button class="btn">Review exceptions</button></div>`)}</div>`,

  spend: () => kpis([['$412M', 'Spend under analysis'], ['86%', 'Categorised'], ['$18.7M', 'Savings opportunity'], ['12', 'Benchmarks refreshed']]) +
    `<div class="grid g2" style="margin-top:14px">${card('Spend by category ($M)', `<div class="chart">${[['IT', 96], ['Logistics', 78], ['Lab', 64], ['Facilities', 52], ['Mktg', 41], ['Other', 30]].map(([n, v], i) => `<div class="c"><span>${v}</span><i class="${i === 2 ? 'hl' : ''}" style="height:${v * 1.45}px"></i></div>`).join('')}</div><div class="lbls">${['IT', 'Logistics', 'Lab', 'Facilities', 'Mktg', 'Other'].map(x => `<span>${x}</span>`).join('')}</div>`)}
      ${card('Insights from JAI', ['Lab consumables paid 8% above benchmark in EMEA', '38 suppliers cover 5% of Facilities spend — tail consolidation', '$2.1M off-contract (maverick) spend in IT peripherals'].map(x => `<div class="clause">${x}</div>`).join('') + `<div class="small muted">Benchmarking available for Category, Supplier, Sourcing, Contracts, Invoicing, Payments, ERP, Intake &amp; Network.</div>`)}</div>`,

  platform: w => kpis([['14', 'AI Workers enabled'], ['99.9%', 'Uptime'], ['3', 'Connected systems'], ['100%', 'Actions audited']]) +
    `<div class="grid g2" style="margin-top:14px">${card(w.name === 'Integration' ? 'Connectors' : 'Guardrails &amp; permissions', w.name === 'Integration' ? tbl(['System', 'Status'], [['SAP S/4HANA', P('g', 'Connected')], ['Oracle Fusion', P('g', 'Connected')], ['Microsoft Teams', P('g', 'Connected')], ['NetSuite', P('', 'Not connected')]]) : tbl(['Policy', 'Setting'], [['Human approval above', '$25,000'], ['Allowed data scopes', 'Buyer, Supplier'], ['Terms &amp; conditions', 'Trust Center (default)'], ['PII redaction', P('g', 'On')]]))}
      ${card('Recent audit log', ['JAI Intake Manager created cart #4471', 'JAI Invoicing held INV-88234', 'Admin updated approval threshold', 'JAI Pay prepared weekly run'].map(x => `<div class="clause">${x}</div>`).join(''))}</div>`
};

/* ------------------------------------------------ JAI dock */
let chat = [], busy = false;
const jaiSay = h => chat.push({ r: 'j', h });
const avJ = `<span class="av">✦</span>`;

const CTX = {
  intake: { chips: ['I need 10 boxes of nitrile exam gloves', 'Where is my catering request?', 'Order laptops for new starters'], hi: "Hi Jordan — I'm JAI. Tell me what you need to buy and I'll find the right way to get it: catalog, contract, punch-out, or a guided request." },
  supplier: { chips: ['Who is blocked in onboarding?', 'Validate Globex bank details', 'Summarize supplier risk this week'], hi: "I'm working with JAI Supplier Manager. I can chase suppliers, validate bank/VAT data and flag risk." },
  contract: { chips: ['Summarize risks in MSA — Clean4you', 'What is the termination notice?', 'Suggest alternative liability language'], hi: "Looking at JAI Contract Manager. Ask me anything about a contract, or ask for redlines." },
  sourcing: { chips: ['Recommend an award for nitrile gloves', 'Invite 5 more suppliers', 'What is my projected savings?'], hi: "I'm assisting the Sourcing Manager. I can build events, review bids and recommend awards." },
  invoice: { chips: ['Why was INV-88234 held?', 'Show touchless rate by supplier', 'Release invoices ready to pay'], hi: "I'm with JAI Invoicing. I can explain exceptions, matching results and fraud alerts." },
  pay: { chips: ['Optimize this week’s payment run', 'Which invoices have discounts?', 'Show run exceptions'], hi: "I'm with JAI Pay. I can prepare and optimize payment runs." },
  spend: { chips: ['Where am I paying above benchmark?', 'Top savings opportunities', 'Spend by supplier for Lab'], hi: "I'm with JAI Spend Analysis. Ask me anything about your spend." },
  category: { chips: ['Draft a strategy for Lab consumables', 'Which strategies are due?', 'Market insights for nitrile'], hi: "I'm with JAI Category Management. I can draft and review category strategies." },
  buyer: { chips: ['Create a PR for steel brackets', 'What is waiting on approval?'], hi: "I'm helping the Buyer worker create and route requisitions." },
  purchaser: { chips: ['Convert PR-10482 to a PO', 'Show price variances'], hi: "I'm helping the Purchaser accept PRs and create POs." },
  platform: { chips: ['What can AgentOS build?', 'Show audit log'], hi: "I can help configure workers, guardrails and integrations." },
  home: { chips: ['What can my AI workers do?', 'Which workers are charged by usage?', 'Create a new Skill'], hi: "Hi Jordan — I'm JAI. Pick a Worker on the left and I'll adapt to what you're working on." }
};
function ctxKey() { if (st.worker) return findWorker(st.worker).ui; return 'home'; }
function ctxLabel() { if (st.aos) return 'AgentOS · Create ' + st.aos; if (st.skill !== null && st.worker) return findWorker(st.worker).skills[st.skill].name; if (st.worker) return st.worker; if (st.sup) return st.sup; return 'All Supervisors'; }
function chatContext() {
  $('#ctx').innerHTML = `<span>◎</span><span>Context:</span><b>${esc(ctxLabel())}</b>`;
  const c = CTX[ctxKey()];
  if (!chat.length || chat._k !== ctxKey()) { chat = []; chat._k = ctxKey(); jaiSay(`<p style="margin:0">${c.hi}</p>`); }
  drawChat();
}
function resetChat() { chat = []; chat._k = null; chatContext(); }
function drawChat(typing) {
  $('#msgs').innerHTML = chat.map(m => m.r === 'u' ? `<div class="m u"><div class="bub">${esc(m.h)}</div></div>` : `<div class="m">${avJ}<div class="bub">${m.h}</div></div>`).join('') + (typing ? `<div class="m">${avJ}<div class="bub"><div class="typing"><i></i><i></i><i></i></div></div></div>` : '');
  $('#chips').innerHTML = CTX[ctxKey()].chips.map(x => `<button class="chip" onclick="ask(this.textContent)">${esc(x)}</button>`).join('');
  $('#msgs').scrollTop = 1e6;
}
function send(e) { e.preventDefault(); const v = $('#inp').value.trim(); if (v) { $('#inp').value = ''; ask(v); } }
function ask(q) {
  if (busy) return; busy = true; chat.push({ r: 'u', h: q }); drawChat(true);
  setTimeout(() => { jaiSay(reply(q)); busy = false; drawChat(); }, 900);
}
const opt = (best, t, s, tag, pr, btn) => `<div class="opt ${best ? 'best' : ''}"><div class="t">${t}</div><div class="s">${s} ${tag}</div><div class="pr"><b>${pr}</b><button onclick="toast('${btn} (mockup)')">${btn}</button></div></div>`;
function reply(q) {
  const l = q.toLowerCase(), k = ctxKey();
  if (/glove|nitrile|laptop|buy|order/.test(l) && (k === 'intake' || k === 'home' || /glove/.test(l))) return `<p style="margin:0">Got it — I'll treat this as <b>Lab Supplies (goods)</b>. Using your default ship-to (Austin Lab) and cost center LAB-204.</p><p style="margin:8px 0 0">Here are the best matches I found. The first is on an active contract — I'd recommend it.</p>` +
    opt(1, 'Nitrile Exam Gloves, Medium (case/10 boxes)', 'Medline Industries', P('g', 'On Contract · #C-2231'), '84.50 <small>/ case</small>', 'Select') +
    opt(0, 'Nitrile Gloves PF, Medium — 1000ct', 'Fisher Scientific', P('', 'Catalog (Hosted)'), '96.20 <small>/ case</small>', 'Select') +
    opt(0, 'Exam Gloves, Nitrile, MD', 'Thermo Fisher', P('', 'Punch-out'), 'Punch-out', 'Punch out');
  if (/blocked|chase/.test(l)) return `<p style="margin:0">3 suppliers are blocked: <b>Northwind</b> (awaiting registration), <b>Globex</b> (bank mismatch), <b>Initech</b> (certificate expiring). Want me to send reminders?</p>`;
  if (/risk|termination|liability|redline/.test(l)) return `<p style="margin:0">MSA — Clean4you has <b>2 high risks</b>: §12.3 liability cap (3 months of fees) and §8.1 24-month auto-renewal. Termination notice is <b>90 days</b> (§17.2). I can apply a redline for §12.3.</p>`;
  if (/award|savings|invite/.test(l)) return `<p style="margin:0">I recommend a <b>70/30 split</b> between Medline and Fisher — projected savings <b>$14.6k (11.4%)</b> with lower supply risk. Shall I create the contract and PR?</p>`;
  if (/inv-|held|touchless|release/.test(l)) return `<p style="margin:0">INV-88234 was held: the bank account changed 2 days ago and the supplier is not in master data. 37 other exceptions are mostly qty variances.</p>`;
  if (/optimi|discount|run/.test(l)) return `<p style="margin:0">Paying 141 invoices early captures <b>$38.6k</b> in discounts while keeping cash above your $1.5M floor. Approve the run?</p>`;
  if (/benchmark|spend|savings opp/.test(l)) return `<p style="margin:0">Biggest gaps: <b>Lab consumables</b> 8% above benchmark (EMEA), <b>IT peripherals</b> $2.1M off-contract. Combined opportunity ≈ <b>$18.7M</b>.</p>`;
  if (/usage|charged/.test(l)) return `<p style="margin:0">Charged by usage: the four <b>Sourcing Managers</b> and the <b>Supplier Data Validation</b> skill (26.3 EA). Everything else sits under the base licence (dial tone).</p>`;
  if (/skill|create|agentos|build/.test(l)) return `<p style="margin:0">Open <b>AgentOS</b> at the bottom-left to create a Supervisor, Worker, Skill, Agent or Task. I can also draft one — tell me the use case.</p>`;
  return `<p style="margin:0">I can help with that in the context of <b>${esc(ctxLabel())}</b>. (This is a mockup — try one of the suggested prompts below.)</p>`;
}
function toggleDock(on) { $('#app').classList.toggle('nodock', !on); }

if (innerWidth < 1100) toggleDock(false);
go({});
