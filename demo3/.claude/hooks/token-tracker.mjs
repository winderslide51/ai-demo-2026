#!/usr/bin/env node
// Token-usage tracker hook for EnerFlex. Maintains a single MARKDOWN file (no JSON):
//   reports/token-usage.md
// Self-contained datastore: parses its own events table, appends/upserts the new
// event, recomputes the summaries, rewrites the file. Three kinds:
//   - Stop           -> kind = main  (MAIN agent: whole session, cumulative, exact;
//                                     UPSERTED - one row per session)
//   - SubagentStop   -> kind = agent (subagent: own transcript, exact, per run;
//                                     project agents keep their name, Claude-managed
//                                     ones are bucketed as "main")
//   - Skill tool_use -> kind = skill (inline skill: COUNT ONLY, token cells "-")
//
// Columns: model (from the transcript's message.model), input (new uncached),
// cache write (cache_creation - inflates on long agents via cache refresh),
// output (generated), total = input + cache write + output. Cache READS excluded.
// Never breaks the session.

import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const REPORT = 'token-usage.md'
const EVENTS_HEADER = '| Heure (UTC) | Story | Type | Nom | Modele | Entree | Ecriture cache | Sortie | Total |'
const EVENTS_SEP = '|---|---|---|---|---|---:|---:|---:|---:|'
const NONE = '(aucune)'
const DASH = '—'

const fmt = (n) => Math.round(n).toLocaleString('fr-FR')
const avg = (n, runs) => (runs ? Math.round(n / runs) : 0)

// Returns { input, cacheWrite, output, total, model }. model = distinct
// message.model values seen in the transcript (usually one).
function sumUsage(path) {
  let input = 0
  let cacheWrite = 0
  let output = 0
  const models = new Set()
  const empty = { input: 0, cacheWrite: 0, output: 0, total: 0, model: DASH }
  if (!path) return empty
  let raw
  try {
    raw = readFileSync(path, 'utf8')
  } catch {
    return empty
  }
  for (const line of raw.split('\n')) {
    if (!line.trim()) continue
    let o
    try {
      o = JSON.parse(line)
    } catch {
      continue
    }
    const u = o?.message?.usage || o?.usage
    if (!u) continue
    input += u.input_tokens || 0
    cacheWrite += u.cache_creation_input_tokens || 0
    output += u.output_tokens || 0
    const m = o?.message?.model
    if (m && !m.startsWith('<')) models.add(m) // skip harness markers like <synthetic>
  }
  return { input, cacheWrite, output, total: input + cacheWrite + output, model: [...models].join(', ') || DASH }
}

// The story being worked on = the most recently touched US-XXX artefact. specs/
// and docs/{revues,architecture,rapports} all name their files US-XXX-*.
function currentStory(projectDir) {
  const dirs = ['specs', join('docs', 'revues'), join('docs', 'architecture'), join('docs', 'rapports')]
  let best = null
  for (const d of dirs) {
    const abs = join(projectDir, d)
    let names
    try {
      names = readdirSync(abs)
    } catch {
      continue
    }
    for (const n of names) {
      const m = /^(US-\d+)/.exec(n)
      if (!m) continue
      let mtime
      try {
        mtime = statSync(join(abs, n)).mtimeMs
      } catch {
        continue
      }
      if (!best || mtime > best.mtime) best = { story: m[1], mtime }
    }
  }
  return best ? best.story : NONE
}

// A "project agent" is defined in .claude/agents/. Anything else (Claude-managed:
// Explore, general-purpose, internal...) is bucketed as "main".
function isProjectAgent(name, projectDir) {
  if (!name) return false
  return existsSync(join(projectDir, '.claude', 'agents', `${name}.md`))
}

function findAgentName(p, projectDir) {
  const t = p.agent_type || p.subagent_type || p.agentType || p.subagentType || p.tool_input?.subagent_type
  return t && isProjectAgent(String(t), projectDir) ? String(t) : 'main'
}

// Every Skill tool_use across the main transcript AND all subagent transcripts.
// Counting from the transcripts (not incremental hook events) means EVERY
// invocation is counted, and the count is fully rebuildable. Returns
// [{ skill, time }] - one entry per invocation.
function skillInvocations(mainTranscript) {
  const result = []
  if (!mainTranscript) return result
  const files = [mainTranscript]
  const subDir = `${mainTranscript.replace(/\.jsonl$/, '')}/subagents`
  try {
    for (const f of readdirSync(subDir)) if (f.endsWith('.jsonl')) files.push(join(subDir, f))
  } catch {
    /* no subagent transcripts */
  }
  for (const file of files) {
    let raw
    try {
      raw = readFileSync(file, 'utf8')
    } catch {
      continue
    }
    for (const line of raw.split('\n')) {
      if (!line.trim()) continue
      let o
      try {
        o = JSON.parse(line)
      } catch {
        continue
      }
      const content = o?.message?.content
      if (!Array.isArray(content)) continue
      const ts = String(o.timestamp || '').replace('T', ' ').slice(0, 19)
      for (const it of content) {
        if (it?.type === 'tool_use' && it?.name === 'Skill') {
          const sk = it?.input?.skill || it?.input?.command
          if (sk) result.push({ skill: String(sk), time: ts })
        }
      }
    }
  }
  return result
}

function parseEvents(md) {
  const rows = []
  let inEvents = false
  const num = (s) => Number(String(s).replace(/[^0-9]/g, '')) || 0
  const clean = (s) => s.replace(/`/g, '')
  for (const line of md.split('\n')) {
    if (line.trim() === EVENTS_HEADER) {
      inEvents = true
      continue
    }
    if (!inEvents) continue
    if (/^\|\s*-+/.test(line)) continue
    if (!line.startsWith('|')) {
      if (rows.length) break
      continue
    }
    const c = line
      .split('|')
      .slice(1, -1)
      .map((x) => x.trim())
    if (c.length >= 9) {
      rows.push({
        time: c[0],
        story: clean(c[1]),
        kind: c[2],
        name: clean(c[3]),
        model: clean(c[4]),
        input: num(c[5]),
        cacheWrite: num(c[6]),
        output: num(c[7]),
        total: num(c[8]),
      })
    }
  }
  return rows
}

function groupBy(events, keyFn) {
  const agg = {}
  for (const e of events) {
    const k = keyFn(e)
    const a =
      agg[k] || (agg[k] = { runs: 0, input: 0, cacheWrite: 0, output: 0, total: 0, models: new Set(), skill: e.kind === 'skill' })
    a.runs++
    a.input += e.input
    a.cacheWrite += e.cacheWrite
    a.output += e.output
    a.total += e.total
    if (e.model && e.model !== DASH) a.models.add(e.model)
  }
  return agg
}

const modelsOf = (set) => [...set].join(', ') || DASH

function render(events, lastKeys, lastEvent) {
  const out = []
  const c = (isSkill, n) => (isSkill ? DASH : fmt(n))
  out.push('# Consommation de tokens ' + DASH + ' EnerFlex')
  out.push('')
  out.push(`_Genere le ${new Date().toISOString()} · Evenements : ${events.length}_`)
  out.push('')

  const byEntity = groupBy(events, (e) => `${e.kind}|${e.name}`)
  const entRows = Object.entries(byEntity)
    .map(([k, a]) => ({ kind: k.split('|')[0], name: k.split('|').slice(1).join('|'), ...a }))
    .sort((x, y) => y.total - x.total)
  out.push('## Par agent principal, sous-agents et skills')
  out.push('')
  out.push('| Type | Nom | Modele | Runs | Entree | Ecriture cache | Sortie | Total | Moyenne/run |')
  out.push('|---|---|---|---:|---:|---:|---:|---:|---:|')
  for (const r of entRows) {
    const s = r.skill
    out.push(
      `| ${r.kind} | \`${r.name}\` | ${modelsOf(r.models)} | ${r.runs} | ${c(s, r.input)} | ${c(s, r.cacheWrite)} | ${c(s, r.output)} | ${c(s, r.total)} | ${c(s, avg(r.total, r.runs))} |`,
    )
  }
  const T = entRows.reduce(
    (a, r) => ({
      runs: a.runs + r.runs,
      input: a.input + r.input,
      cacheWrite: a.cacheWrite + r.cacheWrite,
      output: a.output + r.output,
      total: a.total + r.total,
    }),
    { runs: 0, input: 0, cacheWrite: 0, output: 0, total: 0 },
  )
  out.push(`| **Tout** | | | ${T.runs} | **${fmt(T.input)}** | **${fmt(T.cacheWrite)}** | **${fmt(T.output)}** | **${fmt(T.total)}** | |`)
  out.push('')

  const byKind = groupBy(events, (e) => e.kind)
  out.push('### Par nature')
  out.push('')
  out.push('| Nature | Runs | Entree | Ecriture cache | Sortie | Total |')
  out.push('|---|---:|---:|---:|---:|---:|')
  for (const [kind, a] of Object.entries(byKind).sort((x, y) => y[1].total - x[1].total)) {
    const s = kind === 'skill'
    out.push(`| ${kind} | ${a.runs} | ${c(s, a.input)} | ${c(s, a.cacheWrite)} | ${c(s, a.output)} | ${c(s, a.total)} |`)
  }
  out.push('')

  const byStory = groupBy(events, (e) => e.story || NONE)
  out.push('## Par user story')
  out.push('')
  out.push('| Story | Evenements | Entree | Ecriture cache | Sortie | Total |')
  out.push('|---|---:|---:|---:|---:|---:|')
  for (const [story, a] of Object.entries(byStory).sort((x, y) => y[1].total - x[1].total)) {
    out.push(`| \`${story}\` | ${a.runs} | ${fmt(a.input)} | ${fmt(a.cacheWrite)} | ${fmt(a.output)} | ${fmt(a.total)} |`)
  }
  out.push('')
  out.push('> **main** = agent principal (session entiere, cumulatif, exact, une ligne par')
  out.push('> session). **agent** = sous-agent (son propre transcript, exact, une ligne par')
  out.push('> execution ; les agents du projet gardent leur nom, ceux geres par Claude')
  out.push('> tombent dans `main`). **skill** = invocation en ligne, **comptage seul**.')
  out.push('>')
  out.push('> **Modele** lu dans le transcript. **Entree** = nouveau, non cache. **Ecriture')
  out.push('> cache** = cache_creation (gonfle sur les agents longs par rafraichissement du')
  out.push('> cache). **Sortie** = genere. **Total** = la somme des trois. Les *lectures* de')
  out.push('> cache sont exclues. Pour le vrai travail, lire Entree + Sortie.')
  out.push('')

  out.push('## Evenements (le plus recent en dernier)')
  out.push('')
  out.push(EVENTS_HEADER)
  out.push(EVENTS_SEP)
  for (const e of events) {
    const s = e.kind === 'skill'
    out.push(
      `| ${e.time} | \`${e.story}\` | ${e.kind} | \`${e.name}\` | ${e.model} | ${s ? DASH : e.input} | ${s ? DASH : e.cacheWrite} | ${s ? DASH : e.output} | ${s ? DASH : e.total} |`,
    )
  }
  out.push('')
  out.push(`<!-- diag - dernier evenement : ${lastEvent} - cles du payload : ${lastKeys} -->`)
  out.push('')
  return out.join('\n')
}

function main() {
  let raw = ''
  try {
    raw = readFileSync(0, 'utf8')
  } catch {
    /* no stdin */
  }
  let p = {}
  try {
    p = JSON.parse(raw || '{}')
  } catch {
    p = {}
  }

  const projectDir = process.env.CLAUDE_PROJECT_DIR || p.cwd || process.cwd()
  const event = String(p.hook_event_name || p.hookEventName || '').toLowerCase()
  if (!event.includes('subagentstop') && event !== 'stop') return

  const reportsDir = join(projectDir, 'reports')
  const reportFile = join(reportsDir, REPORT)
  mkdirSync(reportsDir, { recursive: true })

  const session = p.session_id || p.sessionId || 'unknown'
  const now = new Date().toISOString().replace('T', ' ').slice(0, 19)
  const story = currentStory(projectDir)

  let md = ''
  try {
    md = readFileSync(reportFile, 'utf8')
  } catch {
    /* first run */
  }
  let events = parseEvents(md)

  if (event.includes('subagentstop')) {
    const name = findAgentName(p, projectDir)
    const u = sumUsage(p.agent_transcript_path || p.transcript_path || p.transcriptPath)
    events.push({ time: now, story, kind: 'agent', name, model: u.model, input: u.input, cacheWrite: u.cacheWrite, output: u.output, total: u.total })
  } else {
    const transcript = p.transcript_path || p.transcriptPath
    // Main agent: cumulative tokens for the whole session, one row per session (upsert).
    const name = `main:${String(session).slice(0, 8)}`
    const u = sumUsage(transcript)
    events = events.filter((e) => !(e.kind === 'main' && e.name === name))
    events.push({ time: now, story, kind: 'main', name, model: u.model, input: u.input, cacheWrite: u.cacheWrite, output: u.output, total: u.total })
    // Skills: rebuild ALL from the transcripts (every invocation, main + subagents).
    events = events.filter((e) => e.kind !== 'skill')
    for (const se of skillInvocations(transcript)) {
      events.push({ time: se.time || now, story, kind: 'skill', name: se.skill, model: DASH, input: 0, cacheWrite: 0, output: 0, total: 0 })
    }
  }

  writeFileSync(reportFile, render(events, Object.keys(p).join(', ') || NONE, event || NONE))
}

try {
  main()
} catch {
  /* never break the session */
}
process.exit(0)
