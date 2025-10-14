# 🚀 使命簡報 - 2025-10-01

## 1. 最高目標 (Primary Objective)

**目標**: 建立並穩定運營 `ATHLETE_ALLY` JetStream 流，確保 HRV 資料從 Oura webhook 到標準化儲存的完整端到端流程可靠運行。

**核心流 (Streams)**:
- `ATHLETE_ALLY`: subjects=`athlete-ally.>`, retention=7d, storage=file
  - `athlete-ally.hrv.raw-received`: Oura webhook 原始 HRV 事件
  - `athlete-ally.hrv.normalized-stored`: 標準化後的 HRV 資料

**核心消費者 (Consumers)**:
- `normalize-hrv-durable`: durable pull consumer 用於 normalize-service
  - filter_subject: `athlete-ally.hrv.raw-received`
  - ack_policy: explicit, ack_wait: 30s
  - max_deliver: 5, DLQ: `dlq.vendor.oura.webhook`

**意圖 (Why)**:
1. 替代現有的不穩定推送模式，改用可靠的 durable pull 模式
2. 實現完整的可觀測性（OTel traces + Prometheus metrics）
3. 確保 HRV 資料流的彈性與可審計性（透過 explicit ACK 與 DLQ）

## 2. 次要目標 (Secondary Objectives)

1. **主題命名標準化**: 統一使用 dots+hyphens (例: `athlete-ally.hrv.raw-received`)
2. **流配置 update-if-different**: 僅在關鍵參數變更時更新，避免不必要的流重建
3. **完整的端到端追蹤**: 從 webhook 到 DB insert 的完整 OpenTelemetry trace span 鏈
4. **環境一致性**: NATS_URL 統一為 `nats://localhost:4223` (開發環境)
5. **CI 綠燈**: 所有 TypeScript type checks 通過，測試穩定

## 3. 排除項約束 (Exclusions/Constraints)

- ❌ 禁止刪除既有流/消費者（僅 update-if-different）
- ❌ 禁止記錄 PII（userId 以外的敏感資料）
- ❌ 不修改其他流（僅限 HRV 相關）
- ❌ 不縮短既定保留期（避免資料遺失風險）

## 4. 成功標準 (Success Criteria)

1. ✅ `nats stream info ATHLETE_ALLY` 顯示正確的 subjects 與 retention
2. ✅ `nats consumer info ATHLETE_ALLY normalize-hrv-durable` 顯示 durable pull 配置
3. ✅ 端到端驗證：發送測試 HRV 事件 → 消費 → 標準化 → DB insert 成功
4. ✅ 可觀測性：
   - `event_bus_events_published_total{topic="athlete-ally.hrv.raw-received"}`
   - `event_bus_events_consumed_total{topic="athlete-ally.hrv.raw-received"}`
   - `normalize_messages_total{result="success|failure"}`
   - OpenTelemetry traces 包含 `subject`, `sequence`, `deliveryCount`
5. ✅ TypeScript 編譯通過（無 type errors）
6. ✅ 關鍵測試通過（至少 HRV 相關的 unit/integration tests）

## 5. 技術規範 (Technical Specs)

### 流配置 (Stream Config)
```json
{
  "name": "ATHLETE_ALLY",
  "subjects": ["athlete-ally.>"],
  "retention": "limits",
  "max_age": 604800000000000,  // 7 days in ns
  "storage": "file",
  "discard": "old",
  "duplicate_window": 120000000000,  // 2 min in ns
  "compression": "s2",
  "num_replicas": 1  // dev: 1, prod: 3
}
```

### 消費者配置 (Consumer Config)
```json
{
  "durable_name": "normalize-hrv-durable",
  "filter_subject": "athlete-ally.hrv.raw-received",
  "deliver_policy": "all",
  "ack_policy": "explicit",
  "ack_wait": 30000000000,  // 30s in ns
  "max_deliver": 5,
  "max_ack_pending": 10
}
```

### 消費迴圈 (Consumer Loop)
```typescript
while (running) {
  const msgs = await sub.fetch({ max: 10, expires: 5000 });
  for (const msg of msgs) {
    try {
      await processMessage(msg);
      msg.ack();
    } catch (err) {
      if (isRetryable(err)) {
        msg.nakWithDelay(5000);  // retry after 5s
      } else {
        msg.term();  // send to DLQ
      }
    }
  }
}
```

### 環境變數
```bash
# 統一的 NATS 連線
NATS_URL=nats://localhost:4223

# Durable consumer 配置
NORMALIZE_DURABLE_NAME=normalize-hrv-durable
NORMALIZE_OURA_MAX_DELIVER=5
NORMALIZE_DLQ_SUBJECT=dlq.vendor.oura.webhook

# 資料庫
DATABASE_URL=postgresql://athlete:athlete@localhost:5432/athlete_normalize
```

## 6. 當前階段 (Current Phase)

**Phase 3**: Stabilize HRV data flow with durable consumers & observability

**已完成**:
- ✅ Phase 1: `@athlete-ally/telemetry-bootstrap` package
- ✅ Phase 2 (partial): normalize-service telemetry integration

**進行中**:
- 🔄 Durable pull consumer implementation
- 🔄 End-to-end HRV flow verification
- 🔄 Type errors resolution
- 🔄 NATS environment unification (4222 → 4223)

**待辦**:
- ⏳ Commit & patch current work
- ⏳ CI verification
- ⏳ Integration tests
- ⏳ Grafana dashboard setup
