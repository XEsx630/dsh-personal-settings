# dsh-personal-settings

中文 | [English](README.en.md)

给 [DeepSeek Harness](https://github.com/deepseek-ai/deepseek-harness) 加一个「个性化」设置页：**一个地方管长期指令和长期记忆**。

![记忆列表（演示数据）](preview/memory-list.png)

DSH 本身只会自动加载 `AGENTS.md`/`CLAUDE.md`，没有任何界面；记忆要靠第三方插件，而它们的面板是独立入口。这个插件把两件事收进同一个页面：

- **指令** — 直接编辑 `$DSH_HOME/AGENTS.md`，也就是每个新会话自动注入的那份
- **记忆** — 浏览、搜索、新建、编辑、删除 `dsh-auto-memory` 存下的记忆，外加一个自动提炼开关

## 为什么

| | 原生 DSH | 这个插件 |
|---|---|---|
| 改全局指令 | 自己找文件、自己编辑 | 设置页里直接写，带字节预算条 |
| 看有哪些记忆 | 翻 `~/.dsh/memory` | 列表 + 搜索 + 类型/作用域 |
| 自动提炼记忆 | 改 YAML 后重启 | 页面上有开关 |

![编辑记忆（演示数据）](preview/memory-editor.png)

![全局指令（演示数据）](preview/instruction.png)

## 安装

需要 DSH `0.2.x`。记忆部分依赖 [`dsh-auto-memory`](https://github.com/AskTheWay/dsh-auto-memory)，先装它：

```sh
dsh plugin --profile desktop add dsh-auto-memory
dsh plugin --profile desktop add "github:XEsx630/dsh-personal-settings"
```

或者用本地目录：`dsh plugin --profile desktop add "file:/path/to/dsh-personal-settings"`。

装完重启 DSH，设置里会出现「个性化」。

### 可选：去掉 dsh-auto-memory 自带的侧边栏入口

`dsh-auto-memory` 会挂一个自己的「记忆」侧边栏面板，和本插件的记忆标签重复。想合并成一个入口，用仓库里的脚本做一份只保留宿主的副本：

```sh
node scripts/headless-memory.mjs desktop
```

它会复制已安装的包、删掉 `lib/client.js` 和 `package.json` 里的 `dsh.client`，然后打印两条替换安装的命令。宿主能力（索引注入、`memory_*` 工具、`/api/auto-memory/*`、自动提炼）全部保留。

## 用法

### 指令

编辑 `$DSH_HOME/AGENTS.md`（默认 `~/.dsh/AGENTS.md`）。保存后：

- **新会话**第一步就带上
- **当前会话**在下一次文件操作后由内置的 `dsh-agent-instructions` 重新读取

右下角的字节数是按文件估算的，参考预算是 65,536 字节；超过 80% 进度条转琥珀色。

### 记忆

列表按「固定优先 → 更新时间」排序，支持按关键词和全局/工作区筛选。点一行进入独立编辑页：

- 名称只能是 `a-z0-9-`，创建后不可改（它就是文件名）
- 描述必填，会进 `MEMORY.md` 索引
- 类型决定列表里的色点：用户 / 反馈 / 项目 / 参考
- 「固定」的记忆在注入预算紧张时优先保留

### 自动记忆

页面顶部的开关控制 `dsh-auto-memory` 的 `autoSummarize`：

- 打开后，**会话结束时**后台用当前模型从对话里提炼值得长期保留的事实，最多 5 条
- 开关写的是 profile 的 `cordis.patch.yml`，然后调用 cordis loader **只重启 `auto-memory` 这一个条目**，不用重启整个 DSH
- 加载器不可用时会退回「重启后生效」，配置本身已经落盘，不会丢

## 数据在哪

| 内容 | 路径 |
|---|---|
| 全局指令 | `$DSH_HOME/AGENTS.md` |
| 记忆文件 | `$DSH_HOME/memory/_user/*.md`、`$DSH_HOME/memory/--<项目>--/*.md` |
| 记忆索引 | 同目录 `MEMORY.md` |
| 注入审计 | `$DSH_HOME/memory/audit.jsonl` |

全是普通 Markdown，能手改、能进 git。

## 安全

- 两条宿主路由（`/dsh-personalization/api/*`）只接受回环 Host，写指令单次上限 256 KiB
- 指令文件用临时文件 + rename 落盘，不会留下写了一半的文件
- 偏好设置只做**两件事**：把 `autoSummarize: true|false` 写进 profile 的 patch，然后重启那一个条目；非法请求直接 400
- 客户端不发任何网络请求，只调本机接口

## 已知限制

- 记忆标签依赖 `dsh-auto-memory` 的宿主接口。只装本插件时，记忆相关功能会显示「读取失败」，指令标签不受影响
- 自动提炼在 **agent 被释放**时触发（切会话、关会话、退出应用），不是每轮都跑；只读对话里的 user / assistant 文本，不读工具调用与输出
- 客户端的文案目前只有中文
- 开关的热重载依赖 cordis loader 的运行时更新接口，属于内部 API，DSH 大版本升级时可能需要跟着调整

## 开发

无构建步骤：`client.js` 是手写的 `window.__ModuleLoader__` bundle，`index.js` 是普通 Node ESM。

```sh
node --check index.js
node --check client.js
npm pack
```

装本地改动：

```sh
dsh plugin --profile desktop add "file:/path/to/dsh-personal-settings"
```

改 `client.js`/`index.js` 后要重启 DSH 才会生效（link 安装不用重新装，但进程里的模块不会热更新）。

## License

[MIT](LICENSE)
