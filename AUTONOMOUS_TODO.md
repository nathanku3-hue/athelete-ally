# Autonomous Workflow - AUTONOMOUS_TODO.md

| 優先級 | 任務描述 | 狀態 | 驗證步驟 | 提交雜湊值 | 產出與筆記 |
|:---|:---|:---:|:---|:---:|:---|
| 1 | 初始化/升級計畫表（Upgrade plan schema） | [x] Done | 新表頭含「提交雜湊值」欄位已寫入；檔案被 Git 追蹤 | b2ee322 | 建立 8 小時循環的唯一真相來源 |
| 2 | 存儲庫總覽與風險盤點（Repository audit） | [x] Done | 生成 REPO_AUDIT.md 概要（目錄、語言、工作流、風險） | 8494cf2 | 列出語言/服務/工作流，識別高風險項 |
| 3 | 修正 deploy.yml 的 Docker Buildx 步驟 | [x] Done | actionlint 通過或人工檢查無結構錯誤 | 79c5f13 | 加上 docker/setup-buildx-action；移除錯位的 uses |
| 4 | 對齊 Node 20 + npm ci（全工作流） | [x] Done | backend-deploy.yml / v3-test-first.yml 皆使用 Node 20 + npm ci | 381e15b,9e0d5d5 | 升級 actions 到 v4（必要時） |
| 5 | 升級 artifacts/codecov 版本 | [x] Done | deploy.yml 改為 upload-artifact@v4；（可選）codecov@v4 | 7905cd1 | 版本與 pinning 一致性 |
| 6 | 健康檢查與可觀測性加固 | [x] Done | /api/health 可用；Docker HEALTHCHECK 可通過 | eaef8e6 | 新增最小 /api/health 路由 |
| 7 | 本地/靜態驗證 | [x] Done | actionlint 或 YAML 檢查通過（退化：靜態驗證） | e77be4e | reports/workflow-static-check.txt 產生且 PASS |
| 8 | 文檔與補丁持續更新 | [x] Done | HANDOFF_REPORT.md 更新；生成/刷新 patch | 78415d8 | autonomous_session.patch 可攜回滾 |
| 9 | 收尾與交接 | [ ] To Do | 乾淨提交/推送；最終 HANDOFF_REPORT.md | - | 完整交接與下一步建議 |
