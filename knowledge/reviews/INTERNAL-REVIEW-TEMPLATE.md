# RUNLU 内部审核模板 v1.0

此模板不是审核证据或发布许可。先运行 `node knowledge/scripts/prepare-review.mjs RK-0005`，为当前稿件生成七类未签署记录；新来源会增加版权审核行。生成器仅向标准输出写入，不分配 RK 编号、不修改数据。

每次审核填写：

| 字段 | 要求 |
| --- | --- |
| review_id | 唯一审核事件编号，与 RK 编号分开 |
| record_id / record_version / content_digest | 保留生成器给出的版本和 SHA-256；不能将旧签署改绑到新稿 |
| dimension | facts、practice、language:en/zh/fr/es 或 source_rights |
| source_index | 版权审核必填，来源数组中从 0 开始的位置 |
| reviewer_id / reviewer_name / role | 真实人员及相关经验；AI 使用实际工具身份，不能虚构人员 |
| reviewer_type / relationship | human 或 ai；internal 或 external；AI 只能 internal |
| decision / reviewed_at / summary | pending、pass、changes_requested、rejected；实际日期与结论 |
| evidence[] | 每项含 ref（文档/URL/回函）、locator（段落/页码/案例）、finding（检查结果、纠正及限制） |
| attestation_ref | 人工 pass 必须指向真实确认记录；不能用模板本身代替 |
| ai_assistance[] | 使用过的 AI 辅助记录 review_id；没有则为空数组 |
| model | AI 记录必填，写实际模型/工具名称 |

审核任务：

- **事实**：逐条主张、来源版本与章节、数字复算、地区及适用前提。
- **实务**：案例决策、库存可用性与连续尺寸、例外、执行边界；区分假设示例、从业者自述与独立核实。
- **四语**：每种语言独立记录术语、单位、限定语和目标地区；允许同一名合格人员承担多项，但必须逐项签署。
- **来源版权**：每个来源分别记录实际使用方式、权利依据、证据、署名条件和限制。公开可访问不代表允许转载。

AI 可以填写 pending / changes_requested / rejected 辅助意见，不能填 pass，也不能声称 external。人工审核若采用 AI 意见，须核实证据并在 ai_assistance 中引用对应记录。内部人工 pass 只表示内部审核完成，不意味着外部专家背书。外部回函必须真实存在，且仅由有权确认其身份及范围的人提交。

将完成且合法的记录通过 PR 追加到 `knowledge/data/internal-reviews.json`，保留旧事件。空白模板不能放进台账。对当前稿件的人工 changes_requested / rejected 必须通过修订稿件并重新审核解决；不能追加一个 pass 隐藏异议。最后仍须由编辑人工批准，审核工具不会改变状态、归档、发布或部署。
