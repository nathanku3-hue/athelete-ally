// 日志分析规则设置脚本
import fs from 'fs';
import path from 'path';

const setupLogAnalysis = () => {
  console.log('📊 开始设置日志分析规则...\n');
  
  // 1. 创建日志分析规则
  const logAnalysisRules = {
    // 错误日志分析
    errorAnalysis: {
      name: "错误日志分析",
      description: "分析系统错误日志",
      rules: [
        {
          pattern: "ERROR",
          action: "alert",
          severity: "high",
          message: "发现错误日志"
        },
        {
          pattern: "FATAL",
          action: "critical_alert",
          severity: "critical",
          message: "发现致命错误"
        },
        {
          pattern: "Exception",
          action: "alert",
          severity: "high",
          message: "发现异常"
        }
      ]
    },
    
    // 性能日志分析
    performanceAnalysis: {
      name: "性能日志分析",
      description: "分析系统性能日志",
      rules: [
        {
          pattern: "slow query",
          action: "alert",
          severity: "medium",
          message: "发现慢查询"
        },
        {
          pattern: "timeout",
          action: "alert",
          severity: "medium",
          message: "发现超时"
        },
        {
          pattern: "memory leak",
          action: "alert",
          severity: "high",
          message: "发现内存泄漏"
        }
      ]
    },
    
    // 安全日志分析
    securityAnalysis: {
      name: "安全日志分析",
      description: "分析安全相关日志",
      rules: [
        {
          pattern: "unauthorized",
          action: "alert",
          severity: "high",
          message: "发现未授权访问"
        },
        {
          pattern: "failed login",
          action: "alert",
          severity: "medium",
          message: "发现登录失败"
        },
        {
          pattern: "suspicious activity",
          action: "critical_alert",
          severity: "critical",
          message: "发现可疑活动"
        }
      ]
    },
    
    // 业务日志分析
    businessAnalysis: {
      name: "业务日志分析",
      description: "分析业务相关日志",
      rules: [
        {
          pattern: "plan generated",
          action: "info",
          severity: "low",
          message: "训练计划生成"
        },
        {
          pattern: "user registered",
          action: "info",
          severity: "low",
          message: "用户注册"
        },
        {
          pattern: "payment failed",
          action: "alert",
          severity: "medium",
          message: "支付失败"
        }
      ]
    }
  };
  
  // 2. 创建Elasticsearch查询模板
  const elasticsearchQueries = {
    // 错误统计查询
    errorStats: {
      query: {
        bool: {
          must: [
            {
              term: {
                "level.keyword": "ERROR"
              }
            },
            {
              range: {
                "@timestamp": {
                  gte: "now-1h"
                }
              }
            }
          ]
        }
      },
      aggs: {
        error_count: {
          value_count: {
            field: "level.keyword"
          }
        },
        error_types: {
          terms: {
            field: "message.keyword",
            size: 10
          }
        }
      }
    },
    
    // 性能统计查询
    performanceStats: {
      query: {
        bool: {
          must: [
            {
              wildcard: {
                "message": "*slow*"
              }
            },
            {
              range: {
                "@timestamp": {
                  gte: "now-1h"
                }
              }
            }
          ]
        }
      },
      aggs: {
        slow_queries: {
          value_count: {
            field: "message.keyword"
          }
        }
      }
    },
    
    // 安全统计查询
    securityStats: {
      query: {
        bool: {
          should: [
            {
              wildcard: {
                "message": "*unauthorized*"
              }
            },
            {
              wildcard: {
                "message": "*failed login*"
              }
            },
            {
              wildcard: {
                "message": "*suspicious*"
              }
            }
          ],
          minimum_should_match: 1
        }
      },
      aggs: {
        security_events: {
          value_count: {
            field: "message.keyword"
          }
        }
      }
    }
  };
  
  // 3. 创建Kibana可视化配置
  const kibanaVisualizations = {
    // 错误趋势图
    errorTrend: {
      title: "错误趋势",
      type: "line",
      config: {
        xAxis: {
          field: "@timestamp",
          type: "date"
        },
        yAxis: {
          field: "level.keyword",
          type: "count"
        },
        filters: [
          {
            field: "level.keyword",
            value: "ERROR"
          }
        ]
      }
    },
    
    // 性能监控图
    performanceChart: {
      title: "性能监控",
      type: "bar",
      config: {
        xAxis: {
          field: "service.keyword",
          type: "string"
        },
        yAxis: {
          field: "response_time",
          type: "avg"
        }
      }
    },
    
    // 安全事件图
    securityChart: {
      title: "安全事件",
      type: "pie",
      config: {
        field: "security_event.keyword",
        size: "count"
      }
    }
  };
  
  // 4. 创建告警规则
  const alertRules = {
    // 错误率告警
    errorRateAlert: {
      name: "错误率告警",
      condition: {
        query: {
          bool: {
            must: [
              {
                term: {
                  "level.keyword": "ERROR"
                }
              },
              {
                range: {
                  "@timestamp": {
                    gte: "now-5m"
                  }
                }
              }
            ]
          }
        },
        threshold: {
          field: "level.keyword",
          operator: "gt",
          value: 10
        }
      },
      actions: [
        {
          type: "email",
          config: {
            to: "admin@athlete-ally.com",
            subject: "错误率告警",
            body: "系统错误率超过阈值"
          }
        },
        {
          type: "slack",
          config: {
            channel: "#alerts",
            message: "系统错误率超过阈值"
          }
        }
      ]
    },
    
    // 性能告警
    performanceAlert: {
      name: "性能告警",
      condition: {
        query: {
          bool: {
            must: [
              {
                range: {
                  "response_time": {
                    gte: 1000
                  }
                }
              },
              {
                range: {
                  "@timestamp": {
                    gte: "now-5m"
                  }
                }
              }
            ]
          }
        },
        threshold: {
          field: "response_time",
          operator: "gt",
          value: 5
        }
      },
      actions: [
        {
          type: "email",
          config: {
            to: "admin@athlete-ally.com",
            subject: "性能告警",
            body: "系统响应时间超过阈值"
          }
        }
      ]
    }
  };
  
  // 5. 创建日志分析脚本
  const logAnalysisScript = `
// 日志分析脚本
import http from 'http';

const analyzeLogs = async () => {
  console.log('📊 开始日志分析...\n');
  
  // 1. 分析错误日志
  console.log('🔍 分析错误日志...');
  const errorStats = await queryElasticsearch('error-stats');
  console.log('   📈 错误数量:', errorStats.hits.total.value);
  
  // 2. 分析性能日志
  console.log('⚡ 分析性能日志...');
  const performanceStats = await queryElasticsearch('performance-stats');
  console.log('   📈 慢查询数量:', performanceStats.hits.total.value);
  
  // 3. 分析安全日志
  console.log('🔒 分析安全日志...');
  const securityStats = await queryElasticsearch('security-stats');
  console.log('   📈 安全事件数量:', securityStats.hits.total.value);
  
  // 4. 生成分析报告
  console.log('📋 生成分析报告...');
  const report = {
    timestamp: new Date().toISOString(),
    errorCount: errorStats.hits.total.value,
    performanceIssues: performanceStats.hits.total.value,
    securityEvents: securityStats.hits.total.value,
    recommendations: generateRecommendations(errorStats, performanceStats, securityStats)
  };
  
  console.log('\\n📊 日志分析报告:');
  console.log('='.repeat(50));
  console.log('⏰ 分析时间:', report.timestamp);
  console.log('❌ 错误数量:', report.errorCount);
  console.log('⚡ 性能问题:', report.performanceIssues);
  console.log('🔒 安全事件:', report.securityEvents);
  
  if (report.recommendations.length > 0) {
    console.log('\\n💡 建议:');
    report.recommendations.forEach((rec, index) => {
      console.log(\`   \${index + 1}. \${rec}\`);
    });
  }
  
  return report;
};

const queryElasticsearch = async (queryType) => {
  const queries = {
    'error-stats': {
      query: {
        bool: {
          must: [
            { term: { "level.keyword": "ERROR" } },
            { range: { "@timestamp": { gte: "now-1h" } } }
          ]
        }
      }
    },
    'performance-stats': {
      query: {
        bool: {
          must: [
            { wildcard: { "message": "*slow*" } },
            { range: { "@timestamp": { gte: "now-1h" } } }
          ]
        }
      }
    },
    'security-stats': {
      query: {
        bool: {
          should: [
            { wildcard: { "message": "*unauthorized*" } },
            { wildcard: { "message": "*failed login*" } }
          ],
          minimum_should_match: 1
        }
      }
    }
  };
  
  const query = queries[queryType];
  if (!query) {
    throw new Error('Unknown query type: ' + queryType);
  }
  
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(query);
    
    const options = {
      hostname: 'localhost',
      port: 9200,
      path: '/planning-engine/_search',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData)
      }
    };
    
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const result = JSON.parse(data);
          resolve(result);
        } catch (error) {
          reject(error);
        }
      });
    });
    
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
};

const generateRecommendations = (errorStats, performanceStats, securityStats) => {
  const recommendations = [];
  
  if (errorStats.hits.total.value > 10) {
    recommendations.push('错误数量较多，建议检查系统稳定性');
  }
  
  if (performanceStats.hits.total.value > 5) {
    recommendations.push('发现多个性能问题，建议优化查询');
  }
  
  if (securityStats.hits.total.value > 0) {
    recommendations.push('发现安全事件，建议加强安全监控');
  }
  
  return recommendations;
};

// 运行日志分析
analyzeLogs().catch(console.error);
`;

  // 6. 创建日志分析配置目录
  const analysisDir = './elk/log-analysis';
  if (!fs.existsSync(analysisDir)) {
    fs.mkdirSync(analysisDir, { recursive: true });
  }
  
  // 7. 保存配置文件
  fs.writeFileSync(
    path.join(analysisDir, 'log-analysis-rules.json'), 
    JSON.stringify(logAnalysisRules, null, 2)
  );
  
  fs.writeFileSync(
    path.join(analysisDir, 'elasticsearch-queries.json'), 
    JSON.stringify(elasticsearchQueries, null, 2)
  );
  
  fs.writeFileSync(
    path.join(analysisDir, 'kibana-visualizations.json'), 
    JSON.stringify(kibanaVisualizations, null, 2)
  );
  
  fs.writeFileSync(
    path.join(analysisDir, 'alert-rules.json'), 
    JSON.stringify(alertRules, null, 2)
  );
  
  fs.writeFileSync(
    path.join(analysisDir, 'log-analysis.js'), 
    logAnalysisScript
  );
  
  console.log('✅ 日志分析规则设置完成！');
  console.log('📁 配置文件已创建:');
  console.log('   - elk/log-analysis/log-analysis-rules.json');
  console.log('   - elk/log-analysis/elasticsearch-queries.json');
  console.log('   - elk/log-analysis/kibana-visualizations.json');
  console.log('   - elk/log-analysis/alert-rules.json');
  console.log('   - elk/log-analysis/log-analysis.js');
  
  console.log('\n🚀 运行日志分析:');
  console.log('   node elk/log-analysis/log-analysis.js');
  
  console.log('\n💡 使用建议:');
  console.log('1. 定期运行日志分析脚本');
  console.log('2. 配置告警规则');
  console.log('3. 监控分析结果');
  console.log('4. 根据分析结果优化系统');
  console.log('5. 建立日志分析报告');
  
  return true;
};

// 运行日志分析设置
const result = setupLogAnalysis();
console.log('\n🎉 日志分析规则设置完成！');

