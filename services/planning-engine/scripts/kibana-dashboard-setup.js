// Kibana仪表板设置脚本
import fs from 'fs';
import path from 'path';

const setupKibanaDashboard = () => {
  console.log('📊 开始设置Kibana仪表板...\n');
  
  // 1. 创建Planning Engine仪表板
  const planningEngineDashboard = {
    "version": "8.11.0",
    "objects": [
      {
        "id": "planning-engine-dashboard",
        "type": "dashboard",
        "attributes": {
          "title": "Athlete Ally - Planning Engine Dashboard",
          "description": "Planning Engine服务监控仪表板",
          "panelsJSON": JSON.stringify([
            {
              "version": "8.11.0",
              "type": "visualization",
              "gridData": {
                "x": 0,
                "y": 0,
                "w": 12,
                "h": 8
              },
              "panelIndex": 1,
              "embeddableConfig": {},
              "panelRefName": "panel_1"
            }
          ]),
          "optionsJSON": JSON.stringify({
            "useMargins": true,
            "syncColors": false,
            "hidePanelTitles": false
          }),
          "version": 1,
          "timeRestore": false,
          "kibanaSavedObjectMeta": {
            "searchSourceJSON": JSON.stringify({
              "query": {
                "query": "",
                "language": "kuery"
              },
              "filter": []
            })
          }
        }
      }
    ]
  };
  
  // 2. 创建监控仪表板
  const monitoringDashboard = {
    "version": "8.11.0",
    "objects": [
      {
        "id": "monitoring-dashboard",
        "type": "dashboard",
        "attributes": {
          "title": "Athlete Ally - System Monitoring Dashboard",
          "description": "系统监控仪表板",
          "panelsJSON": JSON.stringify([
            {
              "version": "8.11.0",
              "type": "visualization",
              "gridData": {
                "x": 0,
                "y": 0,
                "w": 24,
                "h": 8
              },
              "panelIndex": 1,
              "embeddableConfig": {},
              "panelRefName": "panel_1"
            }
          ]),
          "optionsJSON": JSON.stringify({
            "useMargins": true,
            "syncColors": false,
            "hidePanelTitles": false
          }),
          "version": 1,
          "timeRestore": false
        }
      }
    ]
  };
  
  // 3. 创建安全仪表板
  const securityDashboard = {
    "version": "8.11.0",
    "objects": [
      {
        "id": "security-dashboard",
        "type": "dashboard",
        "attributes": {
          "title": "Athlete Ally - Security Dashboard",
          "description": "安全监控仪表板",
          "panelsJSON": JSON.stringify([
            {
              "version": "8.11.0",
              "type": "visualization",
              "gridData": {
                "x": 0,
                "y": 0,
                "w": 24,
                "h": 8
              },
              "panelIndex": 1,
              "embeddableConfig": {},
              "panelRefName": "panel_1"
            }
          ]),
          "optionsJSON": JSON.stringify({
            "useMargins": true,
            "syncColors": false,
            "hidePanelTitles": false
          }),
          "version": 1,
          "timeRestore": false
        }
      }
    ]
  };
  
  // 4. 创建索引模式
  const indexPatterns = {
    "version": "8.11.0",
    "objects": [
      {
        "id": "planning-engine-pattern",
        "type": "index-pattern",
        "attributes": {
          "title": "planning-engine-*",
          "timeFieldName": "@timestamp",
          "fields": JSON.stringify([
            {
              "name": "@timestamp",
              "type": "date",
              "esTypes": ["date"],
              "searchable": true,
              "aggregatable": true,
              "readFromDocValues": true
            },
            {
              "name": "level",
              "type": "string",
              "esTypes": ["text"],
              "searchable": true,
              "aggregatable": false
            },
            {
              "name": "message",
              "type": "string",
              "esTypes": ["text"],
              "searchable": true,
              "aggregatable": false
            },
            {
              "name": "service",
              "type": "string",
              "esTypes": ["keyword"],
              "searchable": true,
              "aggregatable": true
            }
          ])
        }
      }
    ]
  };
  
  // 5. 创建可视化图表
  const visualizations = {
    "version": "8.11.0",
    "objects": [
      {
        "id": "planning-engine-logs",
        "type": "visualization",
        "attributes": {
          "title": "Planning Engine Logs",
          "visState": JSON.stringify({
            "type": "histogram",
            "params": {
              "grid": {
                "categoryLines": false,
                "style": {
                  "color": "#eee"
                }
              },
              "categoryAxes": [
                {
                  "id": "CategoryAxis-1",
                  "type": "category",
                  "position": "bottom",
                  "show": true,
                  "style": {},
                  "scale": {
                    "type": "linear"
                  },
                  "labels": {
                    "show": true,
                    "truncate": 100
                  },
                  "title": {}
                }
              ],
              "valueAxes": [
                {
                  "id": "ValueAxis-1",
                  "name": "LeftAxis-1",
                  "type": "value",
                  "position": "left",
                  "show": true,
                  "style": {},
                  "scale": {
                    "type": "linear",
                    "mode": "normal"
                  },
                  "labels": {
                    "show": true,
                    "rotate": 0,
                    "filter": false,
                    "truncate": 100
                  },
                  "title": {
                    "text": "Count"
                  }
                }
              ]
            }
          }),
          "uiStateJSON": JSON.stringify({
            "vis": {
              "legendOpen": false,
              "type": "histogram",
              "params": {
                "grid": {
                  "categoryLines": false,
                  "style": {
                    "color": "#eee"
                  }
                }
              }
            }
          }),
          "description": "Planning Engine日志可视化",
          "version": 1,
          "kibanaSavedObjectMeta": {
            "searchSourceJSON": JSON.stringify({
              "index": "planning-engine-pattern",
              "query": {
                "query": "",
                "language": "kuery"
              },
              "filter": []
            })
          }
        }
      }
    ]
  };
  
  // 6. 创建搜索配置
  const searches = {
    "version": "8.11.0",
    "objects": [
      {
        "id": "planning-engine-search",
        "type": "search",
        "attributes": {
          "title": "Planning Engine Search",
          "description": "Planning Engine日志搜索",
          "hits": 0,
          "columns": ["@timestamp", "level", "message", "service"],
          "sort": ["@timestamp", "desc"],
          "version": 1,
          "kibanaSavedObjectMeta": {
            "searchSourceJSON": JSON.stringify({
              "index": "planning-engine-pattern",
              "query": {
                "query": "",
                "language": "kuery"
              },
              "filter": []
            })
          }
        }
      }
    ]
  };
  
  // 7. 创建仪表板配置目录
  const dashboardDir = './elk/kibana/dashboards';
  if (!fs.existsSync(dashboardDir)) {
    fs.mkdirSync(dashboardDir, { recursive: true });
  }
  
  // 8. 保存配置文件
  fs.writeFileSync(
    path.join(dashboardDir, 'planning-engine-dashboard.json'), 
    JSON.stringify(planningEngineDashboard, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dashboardDir, 'monitoring-dashboard.json'), 
    JSON.stringify(monitoringDashboard, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dashboardDir, 'security-dashboard.json'), 
    JSON.stringify(securityDashboard, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dashboardDir, 'index-patterns.json'), 
    JSON.stringify(indexPatterns, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dashboardDir, 'visualizations.json'), 
    JSON.stringify(visualizations, null, 2)
  );
  
  fs.writeFileSync(
    path.join(dashboardDir, 'searches.json'), 
    JSON.stringify(searches, null, 2)
  );
  
  // 9. 创建仪表板导入脚本
  const importScript = `#!/bin/bash
# Kibana仪表板导入脚本

echo "📊 开始导入Kibana仪表板..."

# 等待Kibana启动
echo "⏳ 等待Kibana启动..."
until curl -s http://localhost:5601/api/status; do
  echo "等待Kibana启动..."
  sleep 5
done

echo "✅ Kibana已启动"

# 导入索引模式
echo "📋 导入索引模式..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \\
  -H "kbn-xsrf: true" \\
  -H "Content-Type: application/json" \\
  --data-binary @dashboards/index-patterns.json

# 导入搜索配置
echo "🔍 导入搜索配置..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \\
  -H "kbn-xsrf: true" \\
  -H "Content-Type: application/json" \\
  --data-binary @dashboards/searches.json

# 导入可视化图表
echo "📈 导入可视化图表..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \\
  -H "kbn-xsrf: true" \\
  -H "Content-Type: application/json" \\
  --data-binary @dashboards/visualizations.json

# 导入仪表板
echo "📊 导入仪表板..."
curl -X POST "http://localhost:5601/api/saved_objects/_import" \\
  -H "kbn-xsrf: true" \\
  -H "Content-Type: application/json" \\
  --data-binary @dashboards/planning-engine-dashboard.json

curl -X POST "http://localhost:5601/api/saved_objects/_import" \\
  -H "kbn-xsrf: true" \\
  -H "Content-Type: application/json" \\
  --data-binary @dashboards/monitoring-dashboard.json

curl -X POST "http://localhost:5601/api/saved_objects/_import" \\
  -H "kbn-xsrf: true" \\
  -H "Content-Type: application/json" \\
  --data-binary @dashboards/security-dashboard.json

echo "✅ Kibana仪表板导入完成！"
echo "📊 访问地址: http://localhost:5601"
`;

  fs.writeFileSync(path.join(dashboardDir, 'import-dashboards.sh'), importScript);
  
  console.log('✅ Kibana仪表板设置完成！');
  console.log('📁 配置文件已创建:');
  console.log('   - elk/kibana/dashboards/planning-engine-dashboard.json');
  console.log('   - elk/kibana/dashboards/monitoring-dashboard.json');
  console.log('   - elk/kibana/dashboards/security-dashboard.json');
  console.log('   - elk/kibana/dashboards/index-patterns.json');
  console.log('   - elk/kibana/dashboards/visualizations.json');
  console.log('   - elk/kibana/dashboards/searches.json');
  console.log('   - elk/kibana/dashboards/import-dashboards.sh');
  
  console.log('\n🚀 导入仪表板:');
  console.log('   cd elk/kibana/dashboards && ./import-dashboards.sh');
  
  console.log('\n📊 访问地址:');
  console.log('   - Kibana: http://localhost:5601');
  console.log('   - Elasticsearch: http://localhost:9200');
  
  console.log('\n💡 使用建议:');
  console.log('1. 先启动ELK Stack');
  console.log('2. 等待所有服务启动完成');
  console.log('3. 运行仪表板导入脚本');
  console.log('4. 访问Kibana查看仪表板');
  console.log('5. 根据需要自定义仪表板');
  
  return true;
};

// 运行Kibana仪表板设置
const result = setupKibanaDashboard();
console.log('\n🎉 Kibana仪表板设置完成！');

