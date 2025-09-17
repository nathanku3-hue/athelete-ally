#!/usr/bin/env node

/**
 * 监控系统设置脚本
 * 用于配置Grafana仪表板和告警
 */

const fs = require('fs');
const path = require('path');

// Grafana配置
const GRAFANA_URL = 'http://localhost:3001';
const GRAFANA_USER = 'admin';
const GRAFANA_PASSWORD = 'admin';

// 创建Grafana数据源
async function createDataSource() {
  console.log('🔧 创建Prometheus数据源...');
  
  const datasource = {
    name: 'Prometheus',
    type: 'prometheus',
    url: 'http://prometheus:9090',
    access: 'proxy',
    isDefault: true,
    jsonData: {
      httpMethod: 'POST'
    }
  };
  
  try {
    const response = await fetch(`${GRAFANA_URL}/api/datasources`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${GRAFANA_USER}:${GRAFANA_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify(datasource)
    });
    
    if (response.ok) {
      console.log('✅ Prometheus数据源创建成功');
    } else {
      console.log('⚠️ Prometheus数据源可能已存在');
    }
  } catch (error) {
    console.log('❌ 创建数据源失败:', error.message);
  }
}

// 创建仪表板
async function createDashboard() {
  console.log('🔧 创建监控仪表板...');
  
  const dashboard = {
    dashboard: {
      id: null,
      title: 'Athlete Ally 系统监控',
      tags: ['athlete-ally', 'monitoring'],
      style: 'dark',
      timezone: 'browser',
      panels: [
        {
          id: 1,
          title: '系统状态概览',
          type: 'stat',
          targets: [
            {
              expr: 'up{job="frontend"}',
              legendFormat: '前端服务'
            },
            {
              expr: 'up{job="planning-engine"}',
              legendFormat: '后端服务'
            },
            {
              expr: 'up{job="postgres"}',
              legendFormat: '数据库'
            },
            {
              expr: 'up{job="redis"}',
              legendFormat: 'Redis'
            }
          ],
          gridPos: {
            h: 8,
            w: 24,
            x: 0,
            y: 0
          }
        },
        {
          id: 2,
          title: 'API响应时间',
          type: 'graph',
          targets: [
            {
              expr: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m]))',
              legendFormat: '95th percentile'
            },
            {
              expr: 'histogram_quantile(0.50, rate(http_request_duration_seconds_bucket[5m]))',
              legendFormat: '50th percentile'
            }
          ],
          yAxes: [
            {
              label: '响应时间 (秒)',
              min: 0
            }
          ],
          gridPos: {
            h: 8,
            w: 12,
            x: 0,
            y: 8
          }
        },
        {
          id: 3,
          title: 'API请求率',
          type: 'graph',
          targets: [
            {
              expr: 'rate(http_requests_total[5m])',
              legendFormat: '{{method}} {{endpoint}}'
            }
          ],
          yAxes: [
            {
              label: '请求/秒',
              min: 0
            }
          ],
          gridPos: {
            h: 8,
            w: 12,
            x: 12,
            y: 8
          }
        }
      ],
      time: {
        from: 'now-1h',
        to: 'now'
      },
      refresh: '30s'
    },
    overwrite: true
  };
  
  try {
    const response = await fetch(`${GRAFANA_URL}/api/dashboards/db`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${Buffer.from(`${GRAFANA_USER}:${GRAFANA_PASSWORD}`).toString('base64')}`
      },
      body: JSON.stringify(dashboard)
    });
    
    if (response.ok) {
      console.log('✅ 监控仪表板创建成功');
    } else {
      console.log('⚠️ 监控仪表板可能已存在');
    }
  } catch (error) {
    console.log('❌ 创建仪表板失败:', error.message);
  }
}

// 创建告警规则
async function createAlertRules() {
  console.log('🔧 创建告警规则...');
  
  const alertRules = [
    {
      name: '服务不可用',
      condition: 'up{job="frontend"} == 0 OR up{job="planning-engine"} == 0',
      severity: 'critical',
      message: '关键服务不可用，请立即检查'
    },
    {
      name: 'API响应时间过高',
      condition: 'histogram_quantile(0.95, rate(http_request_duration_seconds_bucket[5m])) > 1',
      severity: 'warning',
      message: 'API响应时间超过1秒，可能影响用户体验'
    },
    {
      name: '错误率过高',
      condition: 'rate(http_requests_total{status=~"5.."}[5m]) > 0.1',
      severity: 'critical',
      message: '5xx错误率过高，请检查服务状态'
    }
  ];
  
  for (const rule of alertRules) {
    try {
      const response = await fetch(`${GRAFANA_URL}/api/alert-rules`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Basic ${Buffer.from(`${GRAFANA_USER}:${GRAFANA_PASSWORD}`).toString('base64')}`
        },
        body: JSON.stringify(rule)
      });
      
      if (response.ok) {
        console.log(`✅ 告警规则 "${rule.name}" 创建成功`);
      } else {
        console.log(`⚠️ 告警规则 "${rule.name}" 可能已存在`);
      }
    } catch (error) {
      console.log(`❌ 创建告警规则 "${rule.name}" 失败:`, error.message);
    }
  }
}

// 检查监控服务状态
async function checkMonitoringServices() {
  console.log('🔍 检查监控服务状态...');
  
  const services = [
    { name: 'Grafana', url: 'http://localhost:3001' },
    { name: 'Prometheus', url: 'http://localhost:9090/-/healthy' }
  ];
  
  for (const service of services) {
    try {
      const response = await fetch(service.url);
      if (response.ok) {
        console.log(`✅ ${service.name}: 运行正常`);
      } else {
        console.log(`⚠️ ${service.name}: 状态异常 (${response.status})`);
      }
    } catch (error) {
      console.log(`❌ ${service.name}: 连接失败`);
    }
  }
}

// 主函数
async function main() {
  console.log('🚀 开始监控系统设置...');
  console.log('================================');
  
  await checkMonitoringServices();
  console.log('');
  
  await createDataSource();
  console.log('');
  
  await createDashboard();
  console.log('');
  
  await createAlertRules();
  console.log('');
  
  console.log('🎉 监控系统设置完成！');
  console.log('');
  console.log('🌐 监控地址:');
  console.log('- Grafana: http://localhost:3001');
  console.log('- Prometheus: http://localhost:9090');
  console.log('');
  console.log('📊 默认登录信息:');
  console.log('- 用户名: admin');
  console.log('- 密码: admin');
}

// 运行主函数
if (require.main === module) {
  main().catch(console.error);
}

module.exports = {
  createDataSource,
  createDashboard,
  createAlertRules,
  checkMonitoringServices
};








