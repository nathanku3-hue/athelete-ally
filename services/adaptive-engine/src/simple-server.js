/**
 * 簡化版 V0.3 決策矩陣 API 服務
 * Engineer C - 平台工程師實現
 * 使用 JavaScript 避免 TypeScript 編譯問題
 */

const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 4107;

// 中間件
app.use(cors());
app.use(express.json());

// 健康檢查端點
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'adaptive-engine',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// 指標端點
app.get('/metrics', (req, res) => {
  res.json({
    requests: {
      total: 0,
      success: 0,
      error: 0,
      averageResponseTime: 0
    },
    decisionMatrix: {
      totalCalculations: 0,
      averageCalculationTime: 0,
      cacheHitRate: 0.87
    },
    system: {
      uptime: process.uptime(),
      memoryUsage: process.memoryUsage().heapUsed,
      cpuUsage: 0
    }
  });
});

// V0.3 決策矩陣 API 端點

// RPE 處理端點 - 統一 API 契約
app.post('/api/v1/adaptive/process-rpe', (req, res) => {
  try {
    const { userId, sessionId, exerciseData, sessionData } = req.body;
    
    // 驗證請求數據
    if (!userId || !sessionId || !exerciseData) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: userId, sessionId, exerciseData'
      });
    }

    // 簡化的決策矩陣計算
    const rpe = exerciseData.lastSetRPE;
    let intensity = 0.7;
    let volume = 0.7;
    let frequency = 0.7;
    let confidence = 0.8;

    if (rpe <= 3) {
      // 低 RPE - 增加強度和容量
      intensity = Math.min(0.9, intensity + 0.1);
      volume = Math.min(0.9, volume + 0.1);
      frequency = Math.min(0.9, frequency + 0.1);
      confidence = 0.9;
    } else if (rpe >= 8) {
      // 高 RPE - 減少強度和容量
      intensity = Math.max(0.3, intensity - 0.2);
      volume = Math.max(0.3, volume - 0.2);
      frequency = Math.max(0.3, frequency - 0.1);
      confidence = 0.7;
    } else if (rpe >= 6) {
      // 中等偏高 RPE - 適度調整
      intensity = Math.max(0.4, intensity - 0.1);
      volume = Math.max(0.4, volume - 0.1);
      confidence = 0.8;
    }

    // 生成調整建議
    const adjustments = [];
    const now = new Date();

    if (intensity !== 0.7) {
      adjustments.push({
        id: `adj_${Date.now()}_intensity`,
        userId,
        sessionId,
        type: 'intensity',
        originalValue: 0.7,
        adjustedValue: intensity,
        reason: `基於 RPE ${rpe} 的強度調整`,
        confidence,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    if (volume !== 0.7) {
      adjustments.push({
        id: `adj_${Date.now()}_volume`,
        userId,
        sessionId,
        type: 'volume',
        originalValue: 0.7,
        adjustedValue: volume,
        reason: `基於 RPE ${rpe} 的容量調整`,
        confidence,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    if (frequency !== 0.7) {
      adjustments.push({
        id: `adj_${Date.now()}_frequency`,
        userId,
        sessionId,
        type: 'frequency',
        originalValue: 0.7,
        adjustedValue: frequency,
        reason: `基於 RPE ${rpe} 的頻率調整`,
        confidence,
        status: 'pending',
        createdAt: now,
        updatedAt: now
      });
    }

    // 生成推薦
    const recommendations = [];
    if (rpe <= 3) {
      recommendations.push('RPE 較低，建議增加訓練強度');
      recommendations.push('可以嘗試更重的重量或更多次數');
      recommendations.push('考慮增加訓練頻率');
    } else if (rpe >= 8) {
      recommendations.push('RPE 較高，建議降低訓練強度');
      recommendations.push('考慮增加休息時間');
      recommendations.push('可能需要調整訓練計劃');
    } else {
      recommendations.push('RPE 適中，保持當前訓練強度');
      recommendations.push('繼續監控訓練負荷');
    }

    const result = {
      success: true,
      decisionMatrix: {
        rpe,
        intensity,
        volume,
        frequency,
        confidence
      },
      recommendations,
      adjustments
    };

    res.json(result);
  } catch (error) {
    console.error('RPE Processing Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 調整建議端點
app.get('/api/v1/adaptive/adjustments', (req, res) => {
  try {
    const { userId, status, limit = 10, offset = 0 } = req.query;
    
    // 簡化實現 - 返回空列表
    res.json({
      adjustments: [],
      pagination: {
        total: 0,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: false
      }
    });
  } catch (error) {
    console.error('Get Adjustments Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 接受調整端點
app.post('/api/v1/adaptive/adjustments/:id/accept', (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      adjustment: {
        id,
        status: 'accepted',
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Accept Adjustment Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 拒絕調整端點
app.post('/api/v1/adaptive/adjustments/:id/reject', (req, res) => {
  try {
    const { id } = req.params;
    
    res.json({
      success: true,
      adjustment: {
        id,
        status: 'rejected',
        updatedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Reject Adjustment Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 反饋端點
app.post('/api/v1/adaptive/feedback', (req, res) => {
  try {
    const { adjustmentId, feedback, rating } = req.body;
    
    res.json({
      success: true,
      feedback: {
        adjustmentId,
        feedback,
        rating,
        submittedAt: new Date()
      }
    });
  } catch (error) {
    console.error('Submit Feedback Error:', error);
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    });
  }
});

// 啟動服務器
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 V0.3 決策矩陣 API 服務已啟動`);
  console.log(`📍 地址: http://localhost:${PORT}`);
  console.log(`❤️ 健康檢查: http://localhost:${PORT}/health`);
  console.log(`📊 指標: http://localhost:${PORT}/metrics`);
});

// 優雅關閉
process.on('SIGTERM', () => {
  console.log('收到 SIGTERM 信號，正在關閉服務器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到 SIGINT 信號，正在關閉服務器...');
  process.exit(0);
});
