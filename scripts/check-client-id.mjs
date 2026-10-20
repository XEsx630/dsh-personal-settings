import { readFile } from 'node:fs/promises'

const pkg = JSON.parse(await readFile(new URL('../package.json', import.meta.url), 'utf8'))
const src = await readFile(new URL('../client.js', import.meta.url), 'utf8')
const matched = /__ModuleLoader__\.load\(\{\s*id:\s*'([^']+)'/.exec(src)

if (!matched) {
  throw new Error('client.js: 找不到 __ModuleLoader__.load({ id: ... })')
}
if (matched[1] !== pkg.name) {
  throw new Error(
    `client.js 的模块 id "${matched[1]}" 与包名 "${pkg.name}" 不一致；`
    + 'DSH 会按包名加载，id 不一致会触发 duplicate factory registration。',
  )
}
console.log(`ok: client module id = ${pkg.name}`)