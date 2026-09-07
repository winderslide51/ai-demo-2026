#!/usr/bin/env node
// Markdown → PDF for the project's documents (reports, reviews, plans).
// Usage: node scripts/md-to-pdf.mjs docs/rapports/US-006-rapport.md [--pages]
// Renders with the print stylesheet of the delivery-report skill and Chrome headless.

import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync, statSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { resolve, dirname, basename, join } from 'node:path'
import { execFileSync } from 'node:child_process'
import { pathToFileURL } from 'node:url'
import { marked } from 'marked'

const [input, ...flags] = process.argv.slice(2)
if (!input) {
  console.error('Usage: node scripts/md-to-pdf.mjs <file.md> [--pages]')
  process.exit(1)
}

const root = resolve(dirname(new URL(import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')), '..')
const mdPath = resolve(input)
const stem = basename(mdPath).replace(/\.md$/i, '')
const pdfPath = join(dirname(mdPath), `${stem}.pdf`)
const css = readFileSync(join(root, '.claude/skills/delivery-report/template/print.css'), 'utf8')

// Work in a temp dir: the HTML and a dedicated Chrome profile (otherwise Chrome hands the
// command to an already-running instance and exits before printing).
const work = mkdtempSync(join(tmpdir(), 'enerflex-pdf-'))
const htmlPath = join(work, `${stem}.html`)
const body = marked.parse(readFileSync(mdPath, 'utf8'), { gfm: true })
writeFileSync(
  htmlPath,
  `<!doctype html><html lang="fr"><head><meta charset="utf-8"><title>${stem}</title><style>${css}</style></head><body>${body}</body></html>`,
)

const candidates = [
  process.env.CHROME_PATH,
  'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe',
  'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  '/usr/bin/google-chrome',
  '/usr/bin/chromium',
].filter(Boolean)
const chrome = candidates.find((p) => existsSync(p))
if (!chrome) {
  console.error('Chrome/Edge introuvable. Définir CHROME_PATH.')
  process.exit(1)
}

if (existsSync(pdfPath)) rmSync(pdfPath)
execFileSync(chrome, [
  '--headless=new',
  '--disable-gpu',
  '--no-first-run',
  `--user-data-dir=${join(work, 'profile')}`,
  '--no-pdf-header-footer',
  `--print-to-pdf=${pdfPath}`,
  pathToFileURL(htmlPath).href,
], { stdio: 'ignore', timeout: 60_000 })
// Chrome may return before its printing process has flushed the file: wait for a stable size.
const sleep = (ms) => Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms)
let last = -1
for (let i = 0; i < 60; i++) {
  const size = existsSync(pdfPath) ? statSync(pdfPath).size : 0
  if (size > 0 && size === last) break
  last = size
  sleep(500)
}
rmSync(work, { recursive: true, force: true })

const pages = (readFileSync(pdfPath).toString('latin1').match(/\/Type\s*\/Page[^s]/g) ?? []).length
console.log(`${pdfPath} — ${pages} page(s)`)
if (flags.includes('--pages') && pages < 2) {
  console.warn('Attention : une seule page — le gabarit est-il rempli ?')
}
