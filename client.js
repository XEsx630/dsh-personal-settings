window.__ModuleLoader__.load({
  id: 'dsh-personal-settings',
  factory: (require) => {
    const module = { exports: {} }
    const React = require('react')
    const h = React.createElement
    const { useCallback, useEffect, useMemo, useRef, useState } = React

    const NS = 'dsh-personalization'
    const INSTRUCTION_API = '/dsh-personalization/api/instruction'
    const MEMORY_API = '/api/auto-memory'
    const TYPES = [
      ['user', '用户', '#4d6bfe'],
      ['feedback', '反馈', '#f59e0b'],
      ['project', '项目', '#22c55e'],
      ['reference', '参考', '#a78bfa'],
    ]
    const TYPE_BY_ID = Object.fromEntries(TYPES.map(([id, label, color]) => [id, { label, color }]))

    const CSS = `
.pers-root{display:flex;flex-direction:column;gap:16px;max-width:760px;margin:0 auto;padding:4px 0 32px;color:var(--dsw-alias-label-primary);font-size:13px;line-height:1.55}
.pers-head h1{margin:0;font-size:21px;font-weight:600;letter-spacing:-.01em}
.pers-head p{margin:6px 0 0;font-size:12.5px;color:var(--dsw-alias-label-tertiary)}
.pers-tabs{display:flex;align-self:flex-start;gap:2px;padding:3px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:rgba(127,127,127,.08)}
.pers-tab{height:28px;padding:0 18px;border:0;border-radius:8px;background:transparent;color:var(--dsw-alias-label-secondary);font:inherit;font-size:12.5px;cursor:pointer;transition:background .15s,color .15s}
.pers-tab:hover{background:rgba(127,127,127,.1);color:var(--dsw-alias-label-primary)}
.pers-tab[aria-selected="true"]{background:#4d6bfe;color:#fff}
.pers-card{border:.5px solid var(--dsw-alias-border-l2);border-radius:14px;background:var(--dsw-alias-settings-card-fill,rgba(127,127,127,.07));overflow:hidden}
.pers-cardHead{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding:16px 18px 0}
.pers-cardTitle{font-size:13.5px;font-weight:600}
.pers-cardSub{margin:5px 0 0;font-size:12px;line-height:1.6;color:var(--dsw-alias-label-tertiary)}
.pers-path{display:inline-flex;align-items:center;gap:6px;margin-top:10px;padding:3px 10px;border-radius:999px;border:.5px solid var(--dsw-alias-border-l2);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:11px;color:var(--dsw-alias-label-secondary);cursor:pointer;background:transparent}
.pers-path:hover{background:rgba(127,127,127,.1)}
.pers-body{padding:14px 18px 0}
.pers-editor{display:block;width:100%;min-height:240px;resize:vertical;padding:12px 14px;border:.5px solid var(--dsw-alias-border-l2);border-radius:10px;background:var(--dsw-alias-bg-base,rgba(0,0,0,.18));color:var(--dsw-alias-label-primary);font-family:ui-monospace,SFMono-Regular,Menlo,Consolas,monospace;font-size:12.5px;line-height:1.75;outline:none;box-sizing:border-box}
.pers-editor:focus{border-color:#4d6bfe;box-shadow:0 0 0 3px rgba(77,107,254,.14)}
.pers-foot{display:flex;align-items:center;gap:12px;padding:12px 18px 16px;flex-wrap:wrap}
.pers-meter{flex:0 1 260px;min-width:150px;display:flex;flex-direction:column;gap:5px}
.pers-meterText{font-size:11px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.pers-bar{height:3px;border-radius:999px;background:rgba(127,127,127,.2);overflow:hidden}
.pers-barFill{height:100%;border-radius:999px;background:#4d6bfe;transition:width .2s}
.pers-barFill.warn{background:#f59e0b}
.pers-barFill.over{background:#ef4444}
.pers-actions{display:flex;gap:8px;align-items:center;margin-left:auto}
.pers-btn{height:30px;padding:0 13px;border-radius:8px;font:inherit;font-size:12px;cursor:pointer;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-secondary);white-space:nowrap}
.pers-btn:hover:not(:disabled){background:rgba(127,127,127,.1);color:var(--dsw-alias-label-primary)}
.pers-btn:disabled{opacity:.5;cursor:default}
.pers-btn.primary{background:#4d6bfe;border-color:transparent;color:#fff}
.pers-btn.primary:hover:not(:disabled){background:#3f5be8;color:#fff}
.pers-btn.danger{color:#ef4444;border-color:rgba(239,68,68,.35)}
.pers-btn.danger:hover:not(:disabled){background:rgba(239,68,68,.12);color:#ef4444}
.pers-status{display:flex;align-items:center;gap:6px;font-size:12px;min-height:18px}
.pers-status.ok{color:#22c55e}
.pers-status.error{color:#ef4444}
.pers-note{padding:12px 18px 16px;font-size:11.5px;line-height:1.6;color:var(--dsw-alias-label-tertiary);border-top:.5px solid var(--dsw-alias-border-l2);margin-top:2px}
.pers-auto{display:flex;flex-direction:column;gap:12px;padding:16px 18px}
.pers-autoHead{display:flex;align-items:flex-start;justify-content:space-between;gap:16px}
.pers-autoText{min-width:0}
.pers-autoState{display:flex;align-items:center;gap:7px;font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.pers-autoState::before{content:"";width:6px;height:6px;border-radius:50%;background:rgba(127,127,127,.6);flex:none}
.pers-autoState.on::before{background:#22c55e}
.pers-autoState.warn::before{background:#f59e0b}
.pers-switch{position:relative;flex:none;width:40px;height:22px;border-radius:999px;border:0;padding:0;cursor:pointer;background:rgba(127,127,127,.35);transition:background .16s}
.pers-switch::after{content:"";position:absolute;top:3px;left:3px;width:16px;height:16px;border-radius:50%;background:#fff;transition:transform .16s;box-shadow:0 1px 2px rgba(0,0,0,.25)}
.pers-switch[aria-checked="true"]{background:#4d6bfe}
.pers-switch[aria-checked="true"]::after{transform:translateX(18px)}
.pers-switch:disabled{opacity:.5;cursor:default}
.pers-listFoot{display:flex;align-items:center;justify-content:space-between;gap:12px;flex-wrap:wrap}
.pers-listFootText{flex:1 1 220px;min-width:0;font-size:11.5px;color:var(--dsw-alias-label-tertiary);overflow-wrap:anywhere}
.pers-noshrink{flex:none;white-space:nowrap}
.pers-toolbar{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
.pers-search{flex:1;min-width:170px;height:32px;padding:0 12px;border-radius:9px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;outline:none}
.pers-search:focus{border-color:#4d6bfe}
.pers-select{height:32px;padding:0 9px;border-radius:9px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;outline:none}
.pers-list{display:flex;flex-direction:column}
.pers-row{display:flex;align-items:flex-start;gap:11px;padding:14px 18px;border-top:.5px solid var(--dsw-alias-border-l2);cursor:pointer;transition:background .12s;text-align:left;background:transparent;border-left:0;border-right:0;border-bottom:0;width:100%;font:inherit;color:inherit}
.pers-row:first-child{border-top:0}
.pers-row:hover{background:rgba(127,127,127,.08)}
.pers-row[data-active="true"]{background:rgba(77,107,254,.1)}
.pers-dot{width:7px;height:7px;border-radius:50%;margin-top:8px;flex:none}
.pers-rowMain{flex:1;min-width:0}
.pers-rowTitle{display:flex;align-items:center;gap:6px;font-size:13.5px;font-weight:600;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.pers-rowDesc{margin-top:3px;font-size:11.5px;color:var(--dsw-alias-label-tertiary);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.pers-rowMeta{flex:none;display:flex;flex-direction:column;align-items:flex-end;gap:4px;font-size:10.5px;color:var(--dsw-alias-label-tertiary);font-variant-numeric:tabular-nums}
.pers-badge{display:inline-flex;align-items:center;height:17px;padding:0 7px;border-radius:999px;font-size:10px;border:.5px solid var(--dsw-alias-border-l2);color:var(--dsw-alias-label-secondary);white-space:nowrap}
.pers-form{display:grid;grid-template-columns:1fr 1fr;gap:14px 12px;padding:16px 18px 18px}
.pers-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.pers-field.full{grid-column:1 / -1}
.pers-label{font-size:11.5px;color:var(--dsw-alias-label-tertiary)}
.pers-input{height:32px;padding:0 11px;border-radius:8px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;outline:none}
.pers-input:focus{border-color:#4d6bfe}
.pers-input[readonly]{color:var(--dsw-alias-label-secondary);cursor:default}
.pers-textarea{min-height:180px;padding:11px 13px;border-radius:10px;border:.5px solid var(--dsw-alias-border-l2);background:transparent;color:var(--dsw-alias-label-primary);font:inherit;font-size:12.5px;line-height:1.7;outline:none;resize:vertical}
.pers-textarea:focus{border-color:#4d6bfe}
.pers-empty{display:flex;flex-direction:column;align-items:center;gap:6px;padding:34px 16px;color:var(--dsw-alias-label-tertiary);font-size:12px;text-align:center}
.pers-empty b{color:var(--dsw-alias-label-secondary);font-weight:600}
.pers-check{display:inline-flex;align-items:center;gap:7px;font-size:12px;color:var(--dsw-alias-label-secondary);cursor:pointer;accent-color:#4d6bfe}
`

    async function readJson(url, init) {
      const response = await fetch(url, { cache: 'no-store', ...init })
      const text = await response.text()
      let data = null
      try {
        data = text.length > 0 ? JSON.parse(text) : null
      } catch {
        data = null
      }
      if (!response.ok) throw new Error((data && data.error) || `HTTP ${response.status}`)
      return data
    }

    function postJson(url, payload) {
      return readJson(url, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      })
    }

    function formatBytes(n) {
      if (n < 1024) return `${n} 字节`
      return `${(n / 1024).toFixed(1)} KB`
    }

    /** `C:\Users\x\.dsh\AGENTS.md` reads better as `~/.dsh/AGENTS.md`. */
    function shortPath(full) {
      if (typeof full !== 'string' || full.length === 0) return ''
      const match = /[\\/]\.dsh[\\/](.+)$/u.exec(full)
      if (match === null) return full
      return `~/.dsh/${match[1].replace(/\\/gu, '/')}`
    }

    function formatDate(ms) {
      if (typeof ms !== 'number' || !Number.isFinite(ms)) return ''
      const d = new Date(ms)
      const pad = (v) => String(v).padStart(2, '0')
      return `${d.getMonth() + 1}月${d.getDate()}日 ${pad(d.getHours())}:${pad(d.getMinutes())}`
    }

    function Status({ status }) {
      if (status === null) return h('div', { className: 'pers-status' })
      return h('div', { className: `pers-status ${status.kind}` }, status.text)
    }

    //#region 指令
    function InstructionTab() {
      const [loading, setLoading] = useState(true)
      const [path, setPath] = useState('')
      const [saved, setSaved] = useState('')
      const [draft, setDraft] = useState('')
      const [budget, setBudget] = useState(65536)
      const [status, setStatus] = useState(null)
      const [busy, setBusy] = useState(false)
      const [copied, setCopied] = useState(false)

      const load = useCallback(async () => {
        setLoading(true)
        setStatus(null)
        try {
          const data = await readJson(INSTRUCTION_API)
          setPath(data.path || '')
          setSaved(data.content || '')
          setDraft(data.content || '')
          setBudget(data.budget || 65536)
        } catch (error) {
          setStatus({ kind: 'error', text: `读取失败：${error.message}` })
        } finally {
          setLoading(false)
        }
      }, [])

      useEffect(() => {
        void load()
      }, [load])

      const bytes = useMemo(() => new TextEncoder().encode(draft).length, [draft])
      const ratio = budget > 0 ? bytes / budget : 0
      const fillClass = ratio > 1 ? 'pers-barFill over' : ratio > 0.8 ? 'pers-barFill warn' : 'pers-barFill'
      const dirty = draft !== saved

      const save = async () => {
        setBusy(true)
        setStatus(null)
        try {
          const data = await postJson(INSTRUCTION_API, { content: draft })
          setSaved(draft)
          setStatus({ kind: 'ok', text: `已保存 · ${formatBytes(data.bytes ?? bytes)} · 新会话第一步生效` })
        } catch (error) {
          setStatus({ kind: 'error', text: `保存失败：${error.message}` })
        } finally {
          setBusy(false)
        }
      }

      const copyPath = async () => {
        try {
          await navigator.clipboard.writeText(path)
          setCopied(true)
          setTimeout(() => setCopied(false), 1200)
        } catch {
          /* clipboard denied — the path is already visible */
        }
      }

      return h(
        'section',
        { className: 'pers-card' },
        h(
          'div',
          { className: 'pers-cardHead' },
          h(
            'div',
            null,
            h('div', { className: 'pers-cardTitle' }, '全局指令'),
            h(
              'p',
              { className: 'pers-cardSub' },
              '每个新会话开始时自动注入系统提示。当前会话在一次文件操作后刷新。',
            ),
            h(
              'button',
              { type: 'button', className: 'pers-path', onClick: copyPath, title: path === '' ? '点击复制路径' : `${path}（点击复制）` },
              copied ? '已复制' : shortPath(path) || '~/.dsh/AGENTS.md',
            ),
          ),
        ),
        h(
          'div',
          { className: 'pers-body' },
          h('textarea', {
            className: 'pers-editor',
            value: draft,
            spellCheck: false,
            placeholder: '# 在这里写长期有效的规则\n\n- 回复用中文\n- 改动后先跑测试再汇报\n',
            onChange: (event) => setDraft(event.target.value),
            readOnly: loading,
          }),
        ),
        h(
          'div',
          { className: 'pers-foot' },
          h(
            'div',
            { className: 'pers-meter' },
            h('div', { className: 'pers-meterText' }, `${formatBytes(bytes)} / ${formatBytes(budget)} 预算`),
            h(
              'div',
              { className: 'pers-bar' },
              h('div', { className: fillClass, style: { width: `${Math.min(100, ratio * 100)}%` } }),
            ),
          ),
          h(Status, { status }),
          h(
            'div',
            { className: 'pers-actions' },
            h(
              'button',
              { type: 'button', className: 'pers-btn', disabled: !dirty || busy, onClick: () => setDraft(saved) },
              '还原',
            ),
            h(
              'button',
              { type: 'button', className: 'pers-btn primary', disabled: !dirty || busy || loading, onClick: save },
              busy ? '保存中…' : '保存',
            ),
          ),
        ),
        h(
          'div',
          { className: 'pers-note' },
          '这个文件由 dsh-agent-instructions 加载：全局生效，项目里的 AGENTS.md 优先级更高。',
        ),
      )
    }
    //#endregion

    //#region 记忆
    function MemoryTab({ getCwd }) {
      const [loading, setLoading] = useState(true)
      const [rows, setRows] = useState([])
      const [query, setQuery] = useState('')
      const [scope, setScope] = useState('all')
      const [status, setStatus] = useState(null)
      const [selected, setSelected] = useState(null)
      const [editor, setEditor] = useState(null)
      const [busy, setBusy] = useState(false)
      const [confirmDelete, setConfirmDelete] = useState(false)
      const [automation, setAutomation] = useState(null)
      const [confirmAll, setConfirmAll] = useState(false)
      const [switchBusy, setSwitchBusy] = useState(false)
      const [restartHint, setRestartHint] = useState(false)
      const [live, setLive] = useState(false)
      const editorRef = useRef(null)

      const cwd = getCwd === undefined ? undefined : getCwd()

      const load = useCallback(async () => {
        setLoading(true)
        try {
          const suffix = cwd === undefined ? '' : `?cwd=${encodeURIComponent(cwd)}`
          const data = await readJson(`${MEMORY_API}/groups.list${suffix}`)
          const flat = []
          for (const group of data.groups || []) {
            for (const memory of group.memories || []) {
              flat.push({ ...memory, scope: group.scope, slug: group.slug, current: group.current === true })
            }
          }
          flat.sort((a, b) => {
            const pin = (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0)
            if (pin !== 0) return pin
            const time = (b.updatedMs || 0) - (a.updatedMs || 0)
            if (time !== 0) return time
            return a.name < b.name ? -1 : 1
          })
          setRows(flat)
        } catch (error) {
          setStatus({ kind: 'error', text: `读取失败：${error.message}` })
        } finally {
          setLoading(false)
        }
      }, [cwd])

      useEffect(() => {
        void load()
      }, [load])

      useEffect(() => {
        let alive = true
        readJson('/dsh-personalization/api/settings')
          .then((data) => {
            if (alive) setAutomation(data?.autoMemory ?? null)
          })
          .catch(() => {
            if (alive) setAutomation(null)
          })
        return () => {
          alive = false
        }
      }, [])

      const toggleAuto = async () => {
        if (automation === null || switchBusy) return
        setSwitchBusy(true)
        try {
          const data = await postJson('/dsh-personalization/api/settings', { autoSummarize: !automation.enabled })
          setAutomation(data.autoMemory)
          setRestartHint(true)
          setLive(data.live === true)
        } catch (error) {
          setStatus({ kind: 'error', text: `保存开关失败：${error.message}` })
        } finally {
          setSwitchBusy(false)
        }
      }

      const open = async (row) => {
        setSelected({ scope: row.scope, name: row.name })
        setConfirmDelete(false)
        setStatus(null)
        try {
          const params = new URLSearchParams({ name: row.name, scope: row.scope })
          if (row.scope === 'project' && cwd !== undefined) params.set('cwd', cwd)
          const record = await readJson(`${MEMORY_API}/memory.read?${params.toString()}`)
          setEditor({
            isNew: false,
            name: record.name,
            title: record.title || '',
            description: record.description || '',
            type: record.type || 'user',
            body: record.body || '',
            pinned: record.pinned === true,
            scope: row.scope,
          })
        } catch (error) {
          setStatus({ kind: 'error', text: `打开失败：${error.message}` })
        }
      }

      const startNew = () => {
        setSelected(null)
        setConfirmDelete(false)
        setStatus(null)
        setEditor({
          isNew: true,
          name: '',
          title: '',
          description: '',
          type: 'user',
          body: '',
          pinned: false,
          scope: cwd === undefined ? 'user' : 'project',
        })
      }

      const closeEditor = () => {
        setEditor(null)
        setSelected(null)
        setConfirmDelete(false)
      }

      // Opening a memory scrolls its card into view; without this the card is
      // appended below the list and the close control starts off-screen.
      useEffect(() => {
        if (editor === null) return
        const node = editorRef.current
        if (node !== null && typeof node.scrollIntoView === 'function') {
          node.scrollIntoView({ block: 'start', behavior: 'smooth' })
        }
      }, [editor === null ? null : editor.name, editor === null ? null : editor.isNew])

      const save = async () => {
        if (editor === null) return
        const name = editor.name.trim()
        if (!/^[a-z0-9][a-z0-9-]{0,63}$/.test(name)) {
          setStatus({ kind: 'error', text: '名称只能用 a-z、0-9、连字符，且以字母或数字开头' })
          return
        }
        if (editor.description.trim().length === 0) {
          setStatus({ kind: 'error', text: '描述不能为空' })
          return
        }
        setBusy(true)
        setStatus(null)
        try {
          const payload = {
            name,
            title: editor.title.trim(),
            description: editor.description.trim(),
            type: editor.type,
            body: editor.body,
            pinned: editor.pinned,
            scope: editor.scope,
          }
          if (editor.scope === 'project' && cwd !== undefined) payload.cwd = cwd
          await postJson(`${MEMORY_API}/memory.write`, payload)
          await load()
          setSelected({ scope: editor.scope, name })
          setEditor({ ...editor, isNew: false, name })
          setStatus({ kind: 'ok', text: '已保存 · 下一轮请求就会带上' })
        } catch (error) {
          setStatus({ kind: 'error', text: `保存失败：${error.message}` })
        } finally {
          setBusy(false)
        }
      }

      const remove = async () => {
        if (editor === null || editor.isNew) return
        if (!confirmDelete) {
          setConfirmDelete(true)
          return
        }
        setBusy(true)
        setStatus(null)
        try {
          const payload = { name: editor.name, scope: editor.scope }
          if (editor.scope === 'project' && cwd !== undefined) payload.cwd = cwd
          await postJson(`${MEMORY_API}/memory.delete`, payload)
          closeEditor()
          await load()
          setStatus({ kind: 'ok', text: '已删除' })
        } catch (error) {
          setStatus({ kind: 'error', text: `删除失败：${error.message}` })
        } finally {
          setBusy(false)
        }
      }

      const visible = useMemo(() => {
        const needle = query.trim().toLowerCase()
        return rows.filter((row) => {
          if (scope !== 'all' && row.scope !== scope) return false
          if (needle.length === 0) return true
          const haystack = `${row.title || ''} ${row.name} ${row.description}`.toLowerCase()
          return haystack.includes(needle)
        })
      }, [rows, query, scope])

      const removeAll = async () => {
        if (!confirmAll) {
          setConfirmAll(true)
          return
        }
        setBusy(true)
        setStatus(null)
        let done = 0
        try {
          for (const row of rows) {
            const payload = { name: row.name, scope: row.scope }
            if (row.scope === 'project' && cwd !== undefined) payload.cwd = cwd
            try {
              await postJson(`${MEMORY_API}/memory.delete`, payload)
              done += 1
            } catch {
              /* keep going: one unreadable file should not block the rest */
            }
          }
          closeEditor()
          await load()
          setStatus({ kind: 'ok', text: `已删除 ${done} 条` })
        } finally {
          setBusy(false)
          setConfirmAll(false)
        }
      }

      const list = () => {
        if (loading) return h('div', { className: 'pers-empty' }, '加载中…')
        if (visible.length === 0) {
          return h(
            'div',
            { className: 'pers-empty' },
            h('b', null, query.length > 0 ? '没有匹配的记忆' : '还没有记忆'),
            h('span', null, query.length > 0 ? '换个关键词试试。' : '说「记住：…」，或者点右上角新建。'),
          )
        }
        return h(
          'div',
          { className: 'pers-list' },
          visible.map((row) => {
            const type = TYPE_BY_ID[row.type] || { label: row.type || '记忆', color: '#888' }
            const active = selected !== null && selected.name === row.name && selected.scope === row.scope
            return h(
              'button',
              {
                key: `${row.scope}:${row.name}`,
                type: 'button',
                className: 'pers-row',
                'data-active': active ? 'true' : 'false',
                onClick: () => (active ? closeEditor() : open(row)),
              },
              h('span', { className: 'pers-dot', style: { background: type.color } }),
              h(
                'span',
                { className: 'pers-rowMain' },
                h(
                  'span',
                  { className: 'pers-rowTitle' },
                  row.title || row.name,
                  row.pinned ? h('span', { className: 'pers-badge' }, '固定') : null,
                  row.disabled ? h('span', { className: 'pers-badge' }, '已静音') : null,
                ),
                h('span', { className: 'pers-rowDesc' }, row.description),
              ),
              h(
                'span',
                { className: 'pers-rowMeta' },
                h('span', null, formatDate(row.updatedMs)),
                h(
                  'span',
                  null,
                  `${type.label} · ${row.scope === 'project' ? (row.current ? '当前工作区' : '项目') : '全局'}`,
                ),
              ),
            )
          }),
        )
      }

      const form = () => {
        if (editor === null) return null
        return h(
          'div',
          { className: 'pers-card', ref: editorRef },
          h(
            'div',
            { className: 'pers-cardHead' },
            h(
              'div',
              null,
              h('div', { className: 'pers-cardTitle' }, editor.isNew ? '新建记忆' : editor.title || editor.name),
              h('div', { className: 'pers-cardSub' }, editor.isNew ? '写成一句能独立看懂的事实或偏好。' : editor.name),
            ),
            h(
              'div',
              { className: 'pers-actions' },
              h('button', { type: 'button', className: 'pers-btn pers-noshrink', onClick: closeEditor }, '← 返回'),
              editor.isNew
                ? null
                : h(
                    'button',
                    { type: 'button', className: 'pers-btn danger pers-noshrink', disabled: busy, onClick: remove },
                    confirmDelete ? '确认删除' : '删除',
                  ),
            ),
          ),
          h(
            'div',
            { className: 'pers-form' },
            h(
              'label',
              { className: 'pers-field' },
              h('span', { className: 'pers-label' }, '名称'),
              h('input', {
                className: 'pers-input',
                value: editor.name,
                placeholder: 'prefers-chinese',
                readOnly: !editor.isNew,
                onChange: (event) => setEditor({ ...editor, name: event.target.value }),
              }),
            ),
            h(
              'label',
              { className: 'pers-field' },
              h('span', { className: 'pers-label' }, '类型'),
              h(
                'select',
                {
                  className: 'pers-input',
                  value: editor.type,
                  onChange: (event) => setEditor({ ...editor, type: event.target.value }),
                },
                TYPES.map(([id, label]) => h('option', { key: id, value: id }, label)),
              ),
            ),
            h(
              'label',
              { className: 'pers-field full' },
              h('span', { className: 'pers-label' }, '标题'),
              h('input', {
                className: 'pers-input',
                value: editor.title,
                placeholder: '可选，列表里显示这一行',
                onChange: (event) => setEditor({ ...editor, title: event.target.value }),
              }),
            ),
            h(
              'label',
              { className: 'pers-field full' },
              h('span', { className: 'pers-label' }, '描述'),
              h('input', {
                className: 'pers-input',
                value: editor.description,
                placeholder: '一句话说清记住了什么',
                onChange: (event) => setEditor({ ...editor, description: event.target.value }),
              }),
            ),
            h(
              'label',
              { className: 'pers-field full' },
              h('span', { className: 'pers-label' }, '正文'),
              h('textarea', {
                className: 'pers-textarea',
                value: editor.body,
                placeholder: '上下文、原因、怎么用……',
                onChange: (event) => setEditor({ ...editor, body: event.target.value }),
              }),
            ),
            h(
              'div',
              {
                className: 'pers-field full',
                style: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
              },
              h(
                'label',
                { className: 'pers-check' },
                h('input', {
                  type: 'checkbox',
                  checked: editor.pinned,
                  onChange: (event) => setEditor({ ...editor, pinned: event.target.checked }),
                }),
                '固定（预算紧张时优先保留）',
              ),
              h(
                'div',
                { className: 'pers-actions' },
                h('span', { className: 'pers-badge' }, editor.scope === 'project' ? '当前工作区' : '全局'),
                h('button', { type: 'button', className: 'pers-btn pers-noshrink', onClick: closeEditor }, '关闭'),
                h(
                  'button',
                  { type: 'button', className: 'pers-btn primary', disabled: busy, onClick: save },
                  busy ? '保存中…' : '保存',
                ),
              ),
            ),
          ),
        )
      }

      return h(
        'div',
        { style: { display: 'flex', flexDirection: 'column', gap: '12px' } },
        editor !== null
          ? null
          : h(
              'div',
              { className: 'pers-card pers-auto' },
          h(
            'div',
            { className: 'pers-autoHead' },
            h(
              'div',
              { className: 'pers-autoText' },
              h('div', { className: 'pers-cardTitle' }, '自动记忆'),
              h(
                'p',
                { className: 'pers-cardSub' },
                '会话结束时，用当前模型从这段对话里提炼值得长期保留的事实，最多 5 条。',
              ),
            ),
            h('button', {
              type: 'button',
              role: 'switch',
              'aria-checked': automation !== null && automation.enabled ? 'true' : 'false',
              'aria-label': '自动记忆',
              className: 'pers-switch',
              disabled: automation === null || switchBusy,
              onClick: toggleAuto,
            }),
          ),
          h(
            'div',
            {
              className:
                restartHint || (automation !== null && automation.enabled)
                  ? 'pers-autoState on'
                  : automation === null
                    ? 'pers-autoState warn'
                    : 'pers-autoState',
            },
            restartHint
              ? live
                ? '已生效 · 记忆插件已自动重载'
                : '已保存 · 重启 DSH 后生效'
              : automation === null
                ? '读取配置失败：找不到 profile 的 cordis.patch.yml'
                : automation.enabled
                  ? '已开启 · 不需要手动说「记住」'
                  : '未开启 · 打开后重启 DSH 生效',
          ),
        ),
        editor === null
          ? h(
              'div',
              { className: 'pers-toolbar' },
              h('input', {
                className: 'pers-search',
                value: query,
                placeholder: '搜索记忆…',
                onChange: (event) => setQuery(event.target.value),
              }),
              h(
                'select',
                { className: 'pers-select', value: scope, onChange: (event) => setScope(event.target.value) },
                h('option', { value: 'all' }, '全部'),
                h('option', { value: 'user' }, '全局'),
                cwd === undefined ? null : h('option', { value: 'project' }, '工作区'),
              ),
              h('button', { type: 'button', className: 'pers-btn primary', onClick: startNew }, '新建'),
            )
          : null,
        status === null
          ? null
          : h('div', { style: { display: 'flex', alignItems: 'center' } }, h(Status, { status })),
        editor === null ? h('div', { className: 'pers-card' }, list()) : null,
        form(),
        editor === null
          ? h(
              'div',
              { className: 'pers-listFoot' },
              h('span', { className: 'pers-listFootText' }, `共 ${rows.length} 条 · 存于 ~/.dsh/memory`),
              rows.length === 0
                ? null
                : h(
                    'button',
                    { type: 'button', className: 'pers-btn danger pers-noshrink', disabled: busy, onClick: removeAll },
                    confirmAll ? '确认删除全部' : '删除全部',
                  ),
            )
          : null,
      )
    }
    //#endregion

    function Page(props) {
      const [tab, setTab] = useState('instruction')
      return h(
        'div',
        { className: 'pers-root' },
        h(
          'header',
          { className: 'pers-head' },
          h('h1', null, '个性化'),
          h('p', null, '这台机器上的长期上下文：每次新会话自动生效的指令，以及跨会话记住的事实。'),
        ),
        h(
          'div',
          { className: 'pers-tabs', role: 'tablist' },
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              className: 'pers-tab',
              'aria-selected': tab === 'instruction' ? 'true' : 'false',
              onClick: () => setTab('instruction'),
            },
            '指令',
          ),
          h(
            'button',
            {
              type: 'button',
              role: 'tab',
              className: 'pers-tab',
              'aria-selected': tab === 'memory' ? 'true' : 'false',
              onClick: () => setTab('memory'),
            },
            '记忆',
          ),
        ),
        tab === 'instruction' ? h(InstructionTab) : h(MemoryTab, { getCwd: props.getCwd }),
      )
    }

    module.exports.inject = ['slots']
    module.exports.apply = (ctx) => {
      const style = document.createElement('style')
      style.dataset.plugin = NS
      style.textContent = CSS
      document.head.append(style)
      ctx.effect(() => () => style.remove(), 'personalization: styles')

      const getCwd = () => {
        try {
          const byId = ctx.get('sessions')?.list?.getSnapshot?.()?.byId
          if (byId === undefined) return undefined
          const rows = Object.values(byId).filter((s) => typeof s?.cwd === 'string' && s.cwd.length > 0)
          if (rows.length === 0) return undefined
          const running = rows.filter((s) => s.running === true)
          const pool = running.length > 0 ? running : rows
          pool.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0))
          return pool[0] === undefined ? undefined : pool[0].cwd
        } catch {
          return undefined
        }
      }

      ctx.slots.inject('settings.section', () =>
        ctx.slots.register(
          {
            name: 'settings.section',
            id: NS,
            order: 20,
            label: () => '个性化',
          },
          (props) => h(Page, { ...props, getCwd }),
        ),
      )
    }

    return module.exports
  },
})
