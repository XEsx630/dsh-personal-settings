# Changelog

## 0.1.0 (2026-10-20)

首个版本。

- **个性化设置页**：`settings.section` 里注册「个性化」，分「指令」「记忆」两个标签
- **指令**：读写 `$DSH_HOME/AGENTS.md`，带字节预算条、还原、保存；路径显示为 `~/.dsh/AGENTS.md`，点击复制完整路径
- **记忆**：列表（固定优先 → 更新时间）、关键词搜索、全局/工作区筛选、新建、编辑、删除、全部删除
- **自动记忆开关**：改 profile 的 `cordis.patch.yml` 后调用 cordis loader 只重启 `auto-memory` 条目，免重启生效；失败时退回「重启后生效」
- **无界面记忆宿主脚本**：`scripts/headless-memory.mjs` 从已安装的 `dsh-auto-memory` 生成去掉客户端半边的副本
- 编辑记忆改为独立视图（列表与工具栏收起），彻底避免「点开后在长页里找不到关闭」
