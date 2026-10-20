// Turn the installed dsh-auto-memory into a headless copy (host half only) so
// its own sidebar panel stops competing with this plugin's settings page.
//
//   node scripts/headless-memory.mjs [profile]
//
// The script only prepares files and prints the two commands to run; it never
// touches the running app.

import { readFileSync, writeFileSync, mkdirSync, rmSync, cpSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const profile = process.argv[2] ?? process.env.DSH_PROFILE ?? 'desktop'
const home = process.env.DSH_HOME ?? join(process.env.USERPROFILE ?? process.env.HOME ?? '.', '.dsh')
const profileDir = join(home, 'profiles', profile)
const installed = join(profileDir, 'node_modules', 'dsh-auto-memory')
const target = join(profileDir, 'plugins', 'dsh-auto-memory', 'dsh-auto-memory-main')

if (!existsSync(installed)) {
  console.error(`dsh-auto-memory 没有装在 ${installed}`)
  console.error('先执行：dsh plugin --profile ' + profile + ' add dsh-auto-memory')
  process.exit(1)
}

rmSync(target, { recursive: true, force: true })
mkdirSync(target, { recursive: true })
cpSync(installed, target, { recursive: true })

const clientFile = join(target, 'lib', 'client.js')
if (existsSync(clientFile)) rmSync(clientFile)

const manifestPath = join(target, 'package.json')
const manifest = JSON.parse(readFileSync(manifestPath, 'utf8'))
if (manifest.dsh) delete manifest.dsh.client
if (manifest.exports) delete manifest.exports['./client']
manifest.description = `${manifest.description ?? 'dsh-auto-memory'} (headless build: host half only)`
writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8')

console.log(`已生成无界面副本：${target}`)
console.log('接着执行（先移除原版，再装这份）：')
console.log()
console.log(`  dsh plugin --profile ${profile} remove dsh-auto-memory`)
console.log(`  dsh plugin --profile ${profile} add "dsh-auto-memory@file:plugins/dsh-auto-memory/dsh-auto-memory-main"`)
console.log()
console.log('然后重启 DSH。想恢复官方版：remove 之后重新 add dsh-auto-memory。')
