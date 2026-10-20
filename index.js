/**
 * Personalization — one settings page for this machine's long-lived context.
 *
 * The page itself lives in client.js. This host half owns exactly two routes:
 * read and write `$DSH_HOME/AGENTS.md`, the user-global instruction file that
 * the built-in `dsh-agent-instructions` plugin already injects into every
 * session. Memory files are served by dsh-auto-memory's own `/api/auto-memory`
 * routes; nothing here duplicates that store.
 */

import { readFile, writeFile, rename, mkdir, readdir } from 'node:fs/promises'
import { homedir } from 'node:os'
import { dirname, join } from 'node:path'

export const name = 'personalization'
export const inject = ['webServer']

const API = '/dsh-personalization/api'
/** Mirrors the loader's own reference budget so the meter means something. */
const BUDGET_BYTES = 65536
const MAX_WRITE_BYTES = 262144

function dshHome() {
  const env = process.env.DSH_HOME
  return env !== undefined && env.trim().length > 0 ? env.trim() : join(homedir(), '.dsh')
}

function instructionPath() {
  return join(dshHome(), 'AGENTS.md')
}

function sendJson(res, status, body) {
  res.writeHead(status, {
    'content-type': 'application/json; charset=utf-8',
    'cache-control': 'no-store',
  })
  res.end(JSON.stringify(body))
}

/** Same fence the rest of the settings backend uses: loopback Host only. */
function isLocalRequest(req) {
  const host = String(req.headers?.host ?? '').replace(/:\d+$/, '').toLowerCase()
  return host === 'localhost' || host === '127.0.0.1' || host === '[::1]' || host === '::1'
}

async function readBody(req) {
  const chunks = []
  let size = 0
  for await (const chunk of req) {
    size += chunk.length
    if (size > MAX_WRITE_BYTES) throw new Error('payload too large')
    chunks.push(chunk)
  }
  return JSON.parse(Buffer.concat(chunks).toString('utf8'))
}

/** tmp + rename, so a crash never leaves a half-written AGENTS.md behind. */
async function writeInstruction(content) {
  const target = instructionPath()
  await mkdir(dirname(target), { recursive: true })
  const tmp = `${target}.${process.pid}.tmp`
  await writeFile(tmp, content, 'utf8')
  await rename(tmp, target)
  return Buffer.byteLength(content, 'utf8')
}

/**
 * The profile that actually boots this app. `DSH_PROFILE_DIR` is set by the
 * launcher, but not every surface exports it, so fall back to the one profile
 * whose bundle list contains dsh-auto-memory.
 */
async function findProfileDir() {
  const fromEnv = process.env.DSH_PROFILE_DIR
  if (fromEnv !== undefined && fromEnv.trim().length > 0) return fromEnv.trim()
  const root = join(dshHome(), 'profiles')
  let entries
  try {
    entries = await readdir(root, { withFileTypes: true })
  } catch {
    return undefined
  }
  for (const entry of entries) {
    if (!entry.isDirectory()) continue
    const dir = join(root, entry.name)
    try {
      const manifest = JSON.parse(await readFile(join(dir, 'package.json'), 'utf8'))
      const bundles = manifest?.dsh?.profile?.bundles
      if (Array.isArray(bundles) && bundles.includes('dsh-auto-memory')) return dir
    } catch {
      /* not a profile directory */
    }
  }
  return undefined
}

/** Read autoSummarize out of the `- id: auto-memory` patch block, line by line. */
function autoSummarizeOf(text) {
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex((line) => /^-\s*id:\s*auto-memory\b/u.test(line))
  if (start < 0) return false
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^-\s/u.test(lines[i])) break
    const match = /^\s*autoSummarize:\s*(true|false)\b/u.exec(lines[i])
    if (match !== null) return match[1] === 'true'
  }
  return false
}

async function readAutoMemoryConfig() {
  const dir = await findProfileDir()
  if (dir === undefined) return { enabled: false, path: undefined, profileDir: undefined }
  const file = join(dir, 'cordis.patch.yml')
  let text = ''
  try {
    text = await readFile(file, 'utf8')
  } catch {
    return { enabled: false, path: file, profileDir: dir }
  }
  return { enabled: autoSummarizeOf(text), path: file, profileDir: dir }
}

async function writeAutoMemoryConfig(enabled) {
  const dir = await findProfileDir()
  if (dir === undefined) throw new Error('找不到 profile 目录')
  const file = join(dir, 'cordis.patch.yml')
  let text = ''
  try {
    text = await readFile(file, 'utf8')
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  const eol = text.includes('\r\n') ? '\r\n' : '\n'
  const lines = text.length === 0 ? [] : text.split(/\r?\n/)
  const value = enabled ? 'true' : 'false'
  const start = lines.findIndex((line) => /^-\s*id:\s*auto-memory\b/u.test(line))

  if (start < 0) {
    lines.push('', '# dsh-auto-memory: 会话结束时自动整理记忆', '- id: auto-memory', '  config:', `    autoSummarize: ${value}`, '')
  } else {
    let end = lines.length
    for (let i = start + 1; i < lines.length; i += 1) {
      if (/^-\s/u.test(lines[i])) {
        end = i
        break
      }
    }
    let configIndex = -1
    let flagIndex = -1
    for (let i = start + 1; i < end; i += 1) {
      if (/^\s*config:\s*$/u.test(lines[i])) configIndex = i
      if (/^\s*autoSummarize:/u.test(lines[i])) flagIndex = i
    }
    if (flagIndex >= 0) {
      lines[flagIndex] = lines[flagIndex].replace(/autoSummarize:\s*\S+/u, `autoSummarize: ${value}`)
    } else if (configIndex >= 0) {
      lines.splice(configIndex + 1, 0, `    autoSummarize: ${value}`)
    } else {
      lines.splice(start + 1, 0, '  config:', `    autoSummarize: ${value}`)
    }
  }

  const next = lines.join(eol)
  const tmp = `${file}.${process.pid}.tmp`
  await writeFile(tmp, next, 'utf8')
  await rename(tmp, file)
  return { enabled: autoSummarizeOf(next), path: file }
}

/** Read the auto-memory entry's `config:` block back into a plain object. */
function configOf(text) {
  const config = {}
  const lines = text.split(/\r?\n/)
  const start = lines.findIndex((line) => /^-\s*id:\s*auto-memory\b/u.test(line))
  if (start < 0) return config
  let inConfig = false
  for (let i = start + 1; i < lines.length; i += 1) {
    if (/^-\s/u.test(lines[i])) break
    if (/^\s*config:\s*$/u.test(lines[i])) {
      inConfig = true
      continue
    }
    if (!inConfig) continue
    const match = /^\s{4}([A-Za-z][\w]*):\s*(.+)$/u.exec(lines[i])
    if (match === null) continue
    const raw = match[2].replace(/\s+#.*$/u, '').trim()
    if (raw === 'true') config[match[1]] = true
    else if (raw === 'false') config[match[1]] = false
    else if (/^-?\d+(\.\d+)?$/u.test(raw)) config[match[1]] = Number(raw)
    else config[match[1]] = raw.replace(/^['"]/u, '').replace(/['"]$/u, '')
  }
  return config
}

/**
 * Restart only the auto-memory entry so the switch takes effect without an app
 * restart. Best effort: an unavailable loader or a failed update leaves the
 * written config in place and the caller reports that a restart is needed.
 */
async function restartAutoMemory(ctx, autoMemory) {
  if (autoMemory === undefined || autoMemory.path === undefined) return false
  if (typeof ctx.get !== 'function') return false
  let loader
  try {
    loader = ctx.get('loader') ?? ctx.loader
  } catch {
    return false
  }
  if (loader === undefined || loader === null || typeof loader.update !== 'function') return false
  let config
  try {
    config = configOf(await readFile(autoMemory.path, 'utf8'))
  } catch {
    return false
  }
  if (Object.keys(config).length === 0) return false
  try {
    await loader.update('auto-memory', { config })
    return true
  } catch (error) {
    ctx.logger?.warn?.(`[personalization] auto-memory restart failed: ${String(error)}`)
    return false
  }
}

export function apply(ctx) {
  const handler = async (req, res) => {
    try {
      if (!isLocalRequest(req)) return sendJson(res, 403, { error: 'forbidden host' })
      const url = new URL(req.url ?? '/', 'http://dsh.local')

      if (url.pathname === `${API}/instruction` && req.method === 'GET') {
        const target = instructionPath()
        let content = ''
        let exists = true
        try {
          content = await readFile(target, 'utf8')
        } catch (error) {
          if (error.code !== 'ENOENT') throw error
          exists = false
        }
        return sendJson(res, 200, {
          path: target,
          exists,
          content,
          bytes: Buffer.byteLength(content, 'utf8'),
          budget: BUDGET_BYTES,
        })
      }

      if (url.pathname === `${API}/instruction` && req.method === 'POST') {
        const body = await readBody(req)
        if (typeof body?.content !== 'string') return sendJson(res, 400, { error: 'content must be a string' })
        if (Buffer.byteLength(body.content, 'utf8') > MAX_WRITE_BYTES) {
          return sendJson(res, 413, { error: 'content exceeds 256 KiB' })
        }
        const bytes = await writeInstruction(body.content)
        return sendJson(res, 200, { ok: true, bytes })
      }

      if (url.pathname === `${API}/settings` && req.method === 'GET') {
        return sendJson(res, 200, { autoMemory: await readAutoMemoryConfig() })
      }

      if (url.pathname === `${API}/settings` && req.method === 'POST') {
        const body = await readBody(req)
        if (typeof body?.autoSummarize !== 'boolean') {
          return sendJson(res, 400, { error: 'autoSummarize must be a boolean' })
        }
        const autoMemory = await writeAutoMemoryConfig(body.autoSummarize)
        // The plugin only reads autoSummarize when its fiber starts. Ask the
        // loader to restart that one entry so the switch takes effect now; when
        // that is unavailable the config still applies on the next boot.
        const live = await restartAutoMemory(ctx, autoMemory)
        return sendJson(res, 200, { autoMemory, live, needsRestart: !live })
      }

      return sendJson(res, 404, { error: 'not found' })
    } catch (error) {
      ctx.logger?.error?.(error)
      return sendJson(res, 500, { error: String(error?.message ?? error) })
    }
  }

  ctx.effect(() => ctx.webServer.register({ kind: 'prefix', path: API, handler }), 'personalization: api')
}
