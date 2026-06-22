// Frontend-only mock backend.
//
// Mimics the small slice of the supabase-js API that this app uses, backed by
// an in-memory store seeded with sample data and persisted to localStorage.
// Swapped in automatically by ./supabase.js when no real Supabase URL is set,
// so component code (ProcessView, etc.) needs no changes. Delete this file and
// the swap in ./supabase.js once a real backend is wired up.

const LS_KEY = 'ataska_mock_db_v1'

const uid = () =>
  (globalThis.crypto?.randomUUID?.() ||
    'id-' + Math.abs(Date.now() ^ (performance.now() * 1000)).toString(36) + Math.floor(performance.now() % 1000))

const now = () => new Date().toISOString()

// ── Seed data ────────────────────────────────────────────────────────────────

function seed() {
  const projects = [
    { id: 'pj-workflow',     name: 'Workflow' },
    { id: 'pj-roadmap',      name: 'Roadmap' },
    { id: 'pj-credentials',  name: 'Credentials' },
  ]

  const milestones = [
    { id: 'ms-wf-1', project_id: 'pj-workflow',    label: 'MVP',      ord: 0, weight: 1.5, type: null },
    { id: 'ms-wf-2', project_id: 'pj-workflow',    label: 'v1.0',     ord: 1, weight: 1.5, type: null },
    { id: 'ms-rm-1', project_id: 'pj-roadmap',     label: 'Q3 2026',  ord: 0, weight: 1.5, type: null },
    { id: 'ms-rm-2', project_id: 'pj-roadmap',     label: 'Q4 2026',  ord: 1, weight: 1.5, type: null },
    { id: 'ms-cr-1', project_id: 'pj-credentials', label: 'Accounts', ord: 0, weight: 1.5, type: 'credentials' },
  ]

  const groups = [
    { id: 'gp-wf-1', milestone_id: 'ms-wf-1', label: 'New',         color: '#6b7280', ord: 0 },
    { id: 'gp-wf-2', milestone_id: 'ms-wf-1', label: 'In Progress', color: '#3b82f6', ord: 1 },
    { id: 'gp-wf-3', milestone_id: 'ms-wf-1', label: 'Testing',     color: '#f59e0b', ord: 2 },
    { id: 'gp-wf-4', milestone_id: 'ms-wf-1', label: 'Done',        color: '#10b981', ord: 3 },
    { id: 'gp-rm-1', milestone_id: 'ms-rm-1', label: 'Planned',     color: '#6b7280', ord: 0 },
    { id: 'gp-rm-2', milestone_id: 'ms-rm-1', label: 'In Progress', color: '#3b82f6', ord: 1 },
    { id: 'gp-rm-3', milestone_id: 'ms-rm-1', label: 'Shipped',     color: '#10b981', ord: 2 },
  ]

  const items = [
    // Workflow / MVP
    { id: 'it-wf-1', milestone_id: 'ms-wf-1', group_id: 'gp-wf-1', label: 'Set up authentication', ord: 0, status: 'pending',   credential_data: null },
    { id: 'it-wf-2', milestone_id: 'ms-wf-1', group_id: 'gp-wf-2', label: 'Build dashboard layout', ord: 0, status: 'requested', credential_data: null },
    { id: 'it-wf-3', milestone_id: 'ms-wf-1', group_id: 'gp-wf-2', label: 'Kanban drag & drop',     ord: 1, status: 'draft',     credential_data: null },
    { id: 'it-wf-4', milestone_id: 'ms-wf-1', group_id: 'gp-wf-3', label: 'Write unit tests',       ord: 0, status: 'reviewing', credential_data: null },
    { id: 'it-wf-5', milestone_id: 'ms-wf-1', group_id: 'gp-wf-4', label: 'Deploy to Vercel',       ord: 0, status: 'approved',  credential_data: null },
    // Roadmap / Q3
    { id: 'it-rm-1', milestone_id: 'ms-rm-1', group_id: 'gp-rm-1', label: 'Mobile app',  ord: 0, status: 'pending',  credential_data: null },
    { id: 'it-rm-2', milestone_id: 'ms-rm-1', group_id: 'gp-rm-2', label: 'Public API v2', ord: 0, status: 'draft',   credential_data: null },
    { id: 'it-rm-3', milestone_id: 'ms-rm-1', group_id: 'gp-rm-3', label: 'SSO login',     ord: 0, status: 'approved', credential_data: null },
    // Credentials (no groups — rendered as a list)
    { id: 'it-cr-1', milestone_id: 'ms-cr-1', group_id: null, label: 'Supabase', ord: 0, status: 'approved',  credential_data: { login: 'admin@batcave.dev' } },
    { id: 'it-cr-2', milestone_id: 'ms-cr-1', group_id: null, label: 'Vercel',   ord: 1, status: 'uploaded',  credential_data: { login: 'ops@batcave.dev' } },
    { id: 'it-cr-3', milestone_id: 'ms-cr-1', group_id: null, label: 'GitHub',   ord: 2, status: 'requested', credential_data: { login: 'atssk' } },
    { id: 'it-cr-4', milestone_id: 'ms-cr-1', group_id: null, label: 'Resend',   ord: 3, status: 'pending',   credential_data: null },
  ]

  const subitems = [
    { id: 'sb-1', item_id: 'it-wf-2', label: 'Sidebar',  ord: 0, status: 'approved' },
    { id: 'sb-2', item_id: 'it-wf-2', label: 'Header',   ord: 1, status: 'approved' },
    { id: 'sb-3', item_id: 'it-wf-2', label: 'Cards',    ord: 2, status: 'reviewing' },
  ]

  return { projects, milestones, groups, items, subitems, attachments: [], issues: [] }
}

// ── Persistence ──────────────────────────────────────────────────────────────

function loadDB() {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (raw) return JSON.parse(raw)
  } catch { /* fall through to seed */ }
  return seed()
}

let db = loadDB()
saveDB()

function saveDB() {
  try { localStorage.setItem(LS_KEY, JSON.stringify(db)) } catch { /* ignore quota */ }
}

// ── Query builder ────────────────────────────────────────────────────────────

class QueryBuilder {
  constructor(table) {
    this.table = table
    this.op = null            // 'select' | 'insert' | 'update' | 'delete'
    this.filters = []
    this.orders = []
    this.limitN = null
    this.singleFlag = false
    this.returnRows = false
    this.payload = null
  }

  select() {
    if (this.op == null) this.op = 'select'
    else this.returnRows = true
    return this
  }
  insert(payload) { this.op = 'insert'; this.payload = payload; return this }
  update(patch)   { this.op = 'update'; this.payload = patch;   return this }
  delete()        { this.op = 'delete'; return this }

  eq(col, val) { this.filters.push([col, val]); return this }
  order(col, opts) { this.orders.push([col, opts?.ascending !== false]); return this }
  limit(n) { this.limitN = n; return this }
  single() { this.singleFlag = true; return this }
  maybeSingle() { this.singleFlag = true; return this }

  _match(row) { return this.filters.every(([c, v]) => row[c] === v) }

  _sorted(rows) {
    if (!this.orders.length) return rows
    const copy = rows.slice()
    copy.sort((a, b) => {
      for (const [col, asc] of this.orders) {
        let av = a[col], bv = b[col]
        if (av == null && bv == null) continue
        if (av == null) return asc ? -1 : 1
        if (bv == null) return asc ? 1 : -1
        if (av < bv) return asc ? -1 : 1
        if (av > bv) return asc ? 1 : -1
      }
      return 0
    })
    return copy
  }

  _run() {
    const table = (db[this.table] = db[this.table] || [])

    if (this.op === 'insert') {
      const incoming = Array.isArray(this.payload) ? this.payload : [this.payload]
      const created = incoming.map(obj => ({ id: uid(), created_at: now(), ...obj }))
      table.push(...created)
      saveDB()
      const data = this.returnRows ? (this.singleFlag ? (created[0] ?? null) : created) : null
      return { data, error: null }
    }

    if (this.op === 'update') {
      const updated = []
      for (const row of table) {
        if (this._match(row)) { Object.assign(row, this.payload); updated.push(row) }
      }
      saveDB()
      const data = this.singleFlag ? (updated[0] ?? null) : updated
      return { data, error: null }
    }

    if (this.op === 'delete') {
      db[this.table] = table.filter(row => !this._match(row))
      saveDB()
      return { data: null, error: null }
    }

    // select
    let rows = table.filter(row => this._match(row))
    rows = this._sorted(rows)
    if (this.limitN != null) rows = rows.slice(0, this.limitN)
    rows = JSON.parse(JSON.stringify(rows))
    const data = this.singleFlag ? (rows[0] ?? null) : rows
    return { data, error: null }
  }

  then(onFulfilled, onRejected) {
    return Promise.resolve().then(() => this._run()).then(onFulfilled, onRejected)
  }
}

// ── RPC / storage / functions stubs ──────────────────────────────────────────

const HEROES = [
  { name: 'Batman', email: 'batman@batcave.dev', role: 'admin' },
  { name: 'Robin',  email: 'robin@batcave.dev',  role: 'user'  },
]

function rpc(name, args) {
  let data = null
  switch (name) {
    case 'get_heroes':           data = JSON.parse(JSON.stringify(HEROES)); break
    case 'get_invites':          data = []; break
    case 'get_access_requests':  data = []; break
    case 'verify_hero_secret':   data = true; break
    case 'verify_hero_by_email': data = (args?.p_email?.split('@')[0]) || 'Batman'; break
    default:                     data = null   // add_invite, remove_invite, upsert_hero, … → no-op success
  }
  return Promise.resolve({ data, error: null })
}

const storage = {
  from() {
    return {
      upload:          async () => ({ data: { path: '' }, error: null }),
      remove:          async () => ({ data: {}, error: null }),
      createSignedUrl: async () => ({ data: { signedUrl: '' }, error: null }),
      getPublicUrl:    () => ({ data: { publicUrl: '' } }),
    }
  },
}

const functions = {
  invoke: async () => ({ data: {}, error: null }),
}

export const mockClient = {
  from: (table) => new QueryBuilder(table),
  rpc,
  storage,
  functions,
}
