# 串行提示词包

本目录记录七个业务 Agent 的阶段目标、输入边界和输出契约，供开发、联调、测试与答辩审计。运行顺序由 `workflow/serial-workflow.json` 约束，不能由模型自行改变。

需要注意：这些 Markdown 文件是可审计的提示词契约，不是当前运行时唯一的字符串来源。实际请求还包含 `backend/adapters/agent_runtime.py`、`review_dialogue.py`、`input_review.py` 和 `guardrail.py` 中的角色提示词、结构化输入及输出校验。修改提示词时必须同步核对运行时代码，不能只改本目录后就宣称线上行为已经改变。

## 拼接顺序

每个节点的最终请求按以下顺序组装：

```text
00_shared_output_rules.md
→ 当前节点 Prompt
→ 程序注入的结构化 JSON 输入
→ 当前节点输出契约
```

模型返回后必须先执行 JSON 解析、字段校验和来源 ID 校验，再写入后续节点输入。

`prompt_registry.build_serial_prompt(stage_id, state)` 可用于按 `serial-workflow.json` 构建阶段化提示词和验证必需字段；当前主运行时同时通过 `context_manager.py` 的输入白名单与上下文账本限制各阶段可见信息。它不是所有模型调用的唯一入口，技术文档不得写成“所有 Agent 均直接调用该函数”。

无论采用哪一种组装入口，都必须保持以下约束：只传递当前阶段声明的字段；模型输出先经过 JSON 解析、字段范围和来源 ID 校验；未经批准的中间结果不得进入资源生成与前端发布。

## 重要边界

当前运行时已经通过 `adapters/llm_client.py` 调用 DeepSeek 或其他 OpenAI 兼容 API。配置有效 API Key 时，学情解析、能力诊断、资源生成、路径规划、多轮追问和防幻觉审核会在对应环节调用外部模型；模型不可用或输出不合规时，系统进入可复现的规则降级路径。

提示词文件存在不等于模型已经成功接入。联调时仍需记录 `prompt_version`、模型名称、请求耗时、重试次数和返回校验结果，并通过 Agent 轨迹确认本次运行实际采用了外部模型还是规则降级。
