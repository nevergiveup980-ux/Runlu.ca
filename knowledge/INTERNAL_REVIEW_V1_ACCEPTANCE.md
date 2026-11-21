# 内部审核系统 v1.0 验收记录

验证环境：Node v24.22.1；基线主分支提交 f5c5bd9244e82ae87c0d67c2d81b121acddddd97。CI 继续使用仓库配置的 Node 20/22，远程结果以 PR checks 为准。

| 验收项 | 结果 |
| --- | --- |
| 新增内部审核 + 原发布规则 + 四语预览 | 46/46 通过（18 + 21 + 7） |
| 原单卷地毯规则回归 | 8/8 通过 |
| 编号分配、归档、临时端到端流程 | 全部通过 |
| 现有文章四语与 HTML 安全检查 | 通过 |
| 两个 CLI 的 Schema / 台账 / 发布门禁 | 通过，5 草稿、0 公开条目 |
| records.json、published.json、RK-0005 正文及原审核包 | 相对基线无改动 |
| RK-0005 当前状态 | 无人工签署，不能发布；模板不是证据 |

命令：

```sh
node --test knowledge/internal-review.test.mjs knowledge/validate-publication.test.mjs knowledge/preview/preview-smoke.test.mjs
node --test knowledge/carpet-rules-prototype.test.mjs
node knowledge/scripts/test-allocate.cjs
node knowledge/scripts/test-archive.cjs
node knowledge/scripts/test-e2e.cjs
node knowledge/essays/smoke-test.mjs
node knowledge/scripts/validate.cjs
node knowledge/scripts/check-publication.cjs
node knowledge/validate-publication.mjs
node knowledge/report-quality.mjs
```

扩大回归发现 **2 项既有失败**：`carpet-multiroll-prototype.test.mjs` 的 `separate rolls with same dye lot are eligible` 与 `mixed dye lots blocked by default`，均为耗尽卷剩余长度 0 被 `positive()` 拒绝。将上述基线提交的原始三个原型文件提取到临时目录后，原 8 项测试仍是 6 通过、2 失败；本 PR 未修改该原型。完整扩展测试合计 62 项：60 通过、2 项基线失败。

人工确认建议：检查独立维度与逐来源记录、真实证据及人工确认引用、AI 身份与引用关系、内容变更后的审核失效，以及原始数据完整性。证据真实性和人员资格由人工审阅确认。台账为空是有意保留的未审核状态，不能将“测试通过”解释为 RK-0005 内容获得批准。

未连接或修改生产数据库；未合并 PR、部署、发布或联系外部审核人。
