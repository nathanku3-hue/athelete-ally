[33mcommit c1efe6a5b92f10fb6dccc17b801a676efa43e9a5[m[33m ([m[1;36mHEAD[m[33m -> [m[1;32mmain[m[33m)[m
Author: nathanku3 <kitlongku@gmail.com>
Date:   Thu Sep 11 11:41:47 2025 +0800

    feat: 完成异步架构修复 - 硬化冲刺步骤3
    
    - 创建PlanJob模型跟踪异步计划生成状态
    - 修复event-bus包使用正确的JetStream API
    - 集成真实EventBus完成异步编排
    - 实现完整的计划生成工作流
    - 添加进度跟踪和错误处理
    
    这是硬化冲刺步骤3的完成，解决了High优先级的异步架构问题。

 packages/event-bus/package.json                    |   11 [32m+[m[31m-[m
 packages/event-bus/src/index.ts                    |    2 [32m+[m
 packages/event-bus/tsconfig.json                   |   16 [32m+[m
 .../windows/libquery-engine                        |  Bin [31m0[m -> [32m19261952[m bytes
 .../windows/libquery-engine.gz.sha256              |    1 [32m+[m
 .../windows/libquery-engine.sha256                 |    1 [32m+[m
 .../prisma/generated/client/edge.js                |   30 [32m+[m[31m-[m
 .../prisma/generated/client/index-browser.js       |   24 [32m+[m[31m-[m
 .../prisma/generated/client/index.d.ts             | 1635 [32m+++++++++++++++++++[m[31m-[m
 .../prisma/generated/client/index.js               |   30 [32m+[m[31m-[m
 .../prisma/generated/client/package.json           |    2 [32m+[m[31m-[m
 .../prisma/generated/client/schema.prisma          |   34 [32m+[m
 .../prisma/generated/client/wasm.js                |   24 [32m+[m[31m-[m
 services/planning-engine/prisma/schema.prisma      |   34 [32m+[m
 services/planning-engine/src/server.ts             |  198 [32m++[m[31m-[m
 15 files changed, 1917 insertions(+), 125 deletions(-)
