# RUNLU Forum Gemini 测试报告

日期：2026-11-09（America/Edmonton）。状态：代码与本地验证完成；真实 Gemini 调用尚未验收。

## 验收结果

| 项目 | 已观察结果 |
| --- | --- |
| Gemini 官方 API 请求、服务端密钥、Token 限制 | 请求契约测试通过；无前端密钥、无 URL 密钥 |
| Gemini 独立回复 | 使用测试替身的网关逻辑测试通过；真实调用待测试环境密钥 |
| OpenAI + Gemini 有限轮次讨论 | 测试确认 2 轮、4 次顺序调用及前一位回复上下文；真实双模型讨论待验证 |
| 三模型席位 | OpenAI、Claude、Gemini 均保留；OpenAI 受控路由需服务端 `OPENAI_API_KEY` |
| 连接状态 | 测试确认配置密钥不等于连接成功；真实非空回复与有效 usage 后才可验证 |
| 错误处理 | 401/402/403/404/429/500、超时、空回复、内容拦截、预算服务不可用均测试通过 |
| $2.00 服务端限制 | SQL 测试确认旧账本计入、原子预留、额度耗尽拒绝、失败保留额度、跨日计账 |
| 并发控制 | 本地 SQL 规则通过；20 个独立连接竞态由 PostgreSQL 17 PR CI 执行 |
| 前端预算防篡改 | 测试确认 localStorage 预算值不影响服务端预算显示；状态失败显示未知 |
| 隐私 | 上游错误正文不外传；服务端不存提示词、回复或完整密钥 |
| 主站 / Music Studio | 无主站、Music Studio、共享 Cloudflare 网关修改；无生产部署、迁移或密钥更改 |

## 本地执行

- `npm test --prefix tests/forum`：34/34 通过（30 网关用例 + 4 DOM 前端回归）。上游响应均为明确的测试替身；不是实际厂商调用。
- `npm run test:db --prefix tests/forum`：9 通过，1 显式跳过（含测试容器计数）；PGlite PostgreSQL 引擎执行真实 SQL。独立连接竞态仅在有 `TEST_DATABASE_URL` 时运行。
- `deno@2.9.6 check supabase/functions/runlu-forum-ai/index.ts`：通过。
- `node --check forum.js` / `forum-live-ai.js` / `core.mjs`：通过。
- `node scripts/check-multilingual.mjs`：587 个 HTML 页面通过四语言检查。
- 原生 PostgreSQL 本地尝试因沙箱禁止 `shmget` 失败；未将该尝试记为通过。CI 使用独立 PostgreSQL 17 服务，不依赖本机限制。

## 线上只读观察

读取现有 Supabase 函数 v7、两项现有预算 RPC 定义、RPC 权限、分支列表及 `{action:"status"}`。2026-11-09 观察到 `OpenAI:true, Claude:false, Gemini:false`。该旧状态表示既有路由配置，不能作为新版本真实连接验收。未发送生产推理请求。

当前仅有生产/main，未发现可用测试分支。本地没有 `GEMINI_API_KEY`。因此以下验收仍待完成：真实 Gemini 独立回复、真实 OpenAI + Gemini 两轮讨论、测试部署上的供应商错误与预算联调。未宣称任务已正式上线或全部验收通过。

## 配置位置

`GEMINI_API_KEY`：Forum **非生产 Supabase 项目 → Edge Functions → Secrets → runlu-forum-ai** 使用的服务端环境。双模型测试还需同位置的 `OPENAI_API_KEY`。保留 Claude 席位的变量为 `ANTHROPIC_API_KEY`。不要把密钥粘贴到聊天、源码或前端配置。

操作步骤、预算口径和兼容门槛见 [接入说明](RUNLU_FORUM_GEMINI_INTEGRATION.md)。PR 保持 Draft，不合并，不部署生产环境。

## PR CI

等待本次 PR 工作流结果；后续记录独立 PostgreSQL 并发测试的实际结果。
