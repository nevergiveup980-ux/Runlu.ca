# RUNLU KNOWLEDGE 内部审核系统 v1.0

本次仅实现仓库内的审核数据契约、只读门禁及模板。原有 RK-0001 至 RK-0005、所有原始数据和正文保持不变；published.json 仍为空。没有数据库连接、迁移或生产写入。

## 架构检查与修复

知识库是 Runlu.ca 的静态数据区：records.json 存草稿，published.json 是公开导出；网页只读取公开导出，editorial/、reviews/ 和 preview/ 保存稿件、审核工作包与预览。现有审核材料属于准备工作，不能算已签署意见。

原 Schema 使用 additionalProperties:false，却漏掉 RK-0005 的 review.evidence_ref 及 source.use_type、rights_basis、rights_evidence，也未描述门禁要求的 translation_reviewer。现已补齐并实际执行 Schema 校验，version 为必填；地区类型统一为 global/regional/country/subnational。旧的两个 CJS 门禁现在调用同一个实现，避免版权策略和证据要求分叉。

保留旧 review 布尔值作为兼容字段，但它们不足以通过新版门禁。新台账 internal-reviews.json 独立存储事实、实务、四种语言和每个来源版权的审核事件，契约见 data/internal-review-schema.json。初始台账为空，不制造已完成审核。

事实引用仍按既有 v0.2 版权规则处理：unknown 仅在 factual_reference 且使用依据与证据齐全、并有该来源人工版权审核时可进入编辑决策；restricted/prohibited 继续阻止发布。转载或改编要求 permitted。链接本身不构成版权许可。

## 版本与证据

摘要值覆盖记录内容和 RK-0005 四语全文，采用递归排序后的 JSON SHA-256；仅排除生命周期 status 与旧 review 字段，便于在不修改内容的情况下预检。正文、来源或翻译变更会使旧审核失效。其他记录目前只有结构化知识卡；未来增加独立长文时须扩展 internal-review.mjs 的 loadArtifacts 映射并测试。

台账保存审核人身份、角色、内外部关系、日期、结论、证据位置、具体发现、人工确认引用和 AI 辅助关联。证据引用提供可追溯位置；程序不能证明远程回函、人员身份或专业资格真实，须由 PR 审阅者核实。测试中的人员和 test:// 引用仅为合成夹具，不能导入正式台账。

这是内部审核制度，不取消 RK-0005 外部评审计划，也不自动将内部意见描述为外部背书。未联系任何外部审核人。最终编辑确认、公开导出与部署仍需另行授权。

## 使用与验收

1. `node knowledge/scripts/prepare-review.mjs RK-0005` 生成未签署模板；仓库内的 reviews/RK-0005-INTERNAL-REVIEW-TEMPLATE.json 是当前快照。
2. 按 reviews/INTERNAL-REVIEW-TEMPLATE.md 填写事实、实务、四语、逐来源版权意见及真实证据，通过 PR 追加事件。不得修改历史签署的摘要值以适配新稿。
3. `node knowledge/scripts/validate.cjs` 和 `node knowledge/scripts/check-publication.cjs` 同时检查 Schema、台账与公开导出；失败返回非零。
4. `node knowledge/validate-publication.mjs` 输出机器可读报告；`node knowledge/report-quality.mjs` 输出编辑阻塞说明。草稿审核尚未完成是预期状态，不会自动提升状态。
5. `node --test knowledge/internal-review.test.mjs knowledge/validate-publication.test.mjs knowledge/preview/preview-smoke.test.mjs` 检验审核绕过、版本绑定、版权政策及四语预览。
6. `node knowledge/scripts/test-e2e.cjs` 在临时目录验证分配、归档、合成审核、发布门禁及负面用例，结束后删除夹具。

验收应确认：旧布尔值不能单独放行；每类审核及每个来源均不可缺失；AI 无法代替人工签署；稿件改动使旧意见失效；RK-0005 仍非公开、尚无真实签署；原始数据与 RK 编号无变化。PR 合并、生产数据库、部署和发布均不在本次执行范围。
