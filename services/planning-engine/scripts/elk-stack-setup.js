// ELK Stack 日志聚合实现脚本
import fs from 'fs';
import path from 'path';

const setupELKStack = () => {
  console.log('📊 开始ELK Stack日志聚合设置...\n');
  
  // 1. 创建ELK Stack配置
  const elkConfig = {
    // Elasticsearch配置
    elasticsearch: {
      version: '8.11.0',
      port: 9200,
      cluster: 'athlete-ally-cluster',
      node: 'athlete-ally-node',
      memory: '2g',
      indices: {
        planning_engine: {
          shards: 1,
          replicas: 0,
          refresh_interval: '5s'
        },
        monitoring: {
          shards: 1,
          replicas: 0,
          refresh_interval: '1s'
        }
      }
    },
    
    // Logstash配置
    logstash: {
      version: '8.11.0',
      port: 5044,
      pipelines: [
        {
          name: 'planning-engine-logs',
          input: 'beats',
          filter: 'grok',
          output: 'elasticsearch'
        },
        {
          name: 'monitoring-logs',
          input: 'beats',
          filter: 'json',
          output: 'elasticsearch'
        }
      ]
    },
    
    // Kibana配置
    kibana: {
      version: '8.11.0',
      port: 5601,
      elasticsearch: 'http://elasticsearch:9200',
      dashboards: [
        'planning-engine-dashboard',
        'monitoring-dashboard',
        'security-dashboard'
      ]
    },
    
    // Filebeat配置
    filebeat: {
      version: '8.11.0',
      inputs: [
        {
          type: 'log',
          enabled: true,
          paths: ['/var/log/planning-engine/*.log'],
          fields: {
            service: 'planning-engine',
            environment: 'production'
          }
        },
        {
          type: 'log',
          enabled: true,
          paths: ['/var/log/monitoring/*.log'],
          fields: {
            service: 'monitoring',
            environment: 'production'
          }
        }
      ],
      output: {
        logstash: {
          hosts: ['logstash:5044']
        }
      }
    }
  };
  
  // 2. 创建Docker Compose配置
  const dockerCompose = `
version: '3.8'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:8.11.0
    container_name: athlete-ally-elasticsearch
    environment:
      - discovery.type=single-node
      - "ES_JAVA_OPTS=-Xms2g -Xmx2g"
      - xpack.security.enabled=false
    ports:
      - "9200:9200"
      - "9300:9300"
    volumes:
      - elasticsearch_data:/usr/share/elasticsearch/data
    networks:
      - elk-network
    restart: unless-stopped

  logstash:
    image: docker.elastic.co/logstash/logstash:8.11.0
    container_name: athlete-ally-logstash
    ports:
      - "5044:5044"
      - "9600:9600"
    volumes:
      - ./elk/logstash/pipeline:/usr/share/logstash/pipeline
      - ./elk/logstash/config:/usr/share/logstash/config
    environment:
      - "LS_JAVA_OPTS=-Xmx1g -Xms1g"
    depends_on:
      - elasticsearch
    networks:
      - elk-network
    restart: unless-stopped

  kibana:
    image: docker.elastic.co/kibana/kibana:8.11.0
    container_name: athlete-ally-kibana
    ports:
      - "5601:5601"
    environment:
      - ELASTICSEARCH_HOSTS=http://elasticsearch:9200
    depends_on:
      - elasticsearch
    networks:
      - elk-network
    restart: unless-stopped

  filebeat:
    image: docker.elastic.co/beats/filebeat:8.11.0
    container_name: athlete-ally-filebeat
    user: root
    volumes:
      - ./elk/filebeat/filebeat.yml:/usr/share/filebeat/filebeat.yml:ro
      - /var/log/planning-engine:/var/log/planning-engine:ro
      - /var/log/monitoring:/var/log/monitoring:ro
      - /var/lib/docker/containers:/var/lib/docker/containers:ro
      - /var/run/docker.sock:/var/run/docker.sock:ro
    depends_on:
      - logstash
    networks:
      - elk-network
    restart: unless-stopped

volumes:
  elasticsearch_data:
    driver: local

networks:
  elk-network:
    driver: bridge
`;

  // 3. 创建Logstash管道配置
  const logstashPipeline = `
input {
  beats {
    port => 5044
  }
}

filter {
  if [fields][service] == "planning-engine" {
    grok {
      match => { "message" => "%{TIMESTAMP_ISO8601:timestamp} %{LOGLEVEL:level} %{GREEDYDATA:message}" }
    }
    
    date {
      match => [ "timestamp", "ISO8601" ]
    }
    
    mutate {
      add_field => { "service" => "planning-engine" }
      add_field => { "environment" => "production" }
    }
  }
  
  if [fields][service] == "monitoring" {
    json {
      source => "message"
    }
    
    mutate {
      add_field => { "service" => "monitoring" }
      add_field => { "environment" => "production" }
    }
  }
}

output {
  elasticsearch {
    hosts => ["elasticsearch:9200"]
    index => "%{[fields][service]}-%{+YYYY.MM.dd}"
  }
}
`;

  // 4. 创建Filebeat配置
  const filebeatConfig = `
filebeat.inputs:
- type: log
  enabled: true
  paths:
    - /var/log/planning-engine/*.log
  fields:
    service: planning-engine
    environment: production
  fields_under_root: true

- type: log
  enabled: true
  paths:
    - /var/log/monitoring/*.log
  fields:
    service: monitoring
    environment: production
  fields_under_root: true

output.logstash:
  hosts: ["logstash:5044"]

processors:
  - add_host_metadata:
      when.not.contains.tags: forwarded
`;

  // 5. 创建Kibana仪表板配置
  const kibanaDashboard = `
{
  "version": "8.11.0",
  "objects": [
    {
      "id": "planning-engine-dashboard",
      "type": "dashboard",
      "attributes": {
        "title": "Planning Engine Dashboard",
        "panelsJSON": "[{\\"version\\":\\"8.11.0\\",\\"type\\":\\"visualization\\",\\"gridData\\":{\\"x\\":0,\\"y\\":0,\\"w\\":12,\\"h\\":8},\\"panelIndex\\":1,\\"embeddableConfig\\":{},\\"panelRefName\\":\\"panel_1\\"}]"
      }
    }
  ]
}
`;

  // 6. 创建日志格式配置
  const logFormat = `
// 结构化日志格式
const winston = require('winston');

const logger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss.SSS'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: {
    service: 'planning-engine',
    environment: process.env.NODE_ENV || 'development'
  },
  transports: [
    new winston.transports.File({
      filename: '/var/log/planning-engine/error.log',
      level: 'error'
    }),
    new winston.transports.File({
      filename: '/var/log/planning-engine/combined.log'
    }),
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    })
  ]
});

module.exports = logger;
`;

  // 7. 创建目录结构
  const directories = [
    'elk',
    'elk/logstash',
    'elk/logstash/pipeline',
    'elk/logstash/config',
    'elk/filebeat',
    'elk/kibana',
    'logs/planning-engine',
    'logs/monitoring'
  ];
  
  directories.forEach(dir => {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
  });
  
  // 8. 保存配置文件
  fs.writeFileSync('elk/docker-compose.yml', dockerCompose);
  fs.writeFileSync('elk/logstash/pipeline/logstash.conf', logstashPipeline);
  fs.writeFileSync('elk/filebeat/filebeat.yml', filebeatConfig);
  fs.writeFileSync('elk/kibana/dashboard.json', kibanaDashboard);
  fs.writeFileSync('elk/logger.js', logFormat);
  
  // 9. 创建启动脚本
  const startScript = `#!/bin/bash
# ELK Stack 启动脚本

echo "🚀 启动ELK Stack..."

# 创建日志目录
mkdir -p /var/log/planning-engine
mkdir -p /var/log/monitoring

# 启动ELK Stack
cd elk
docker-compose up -d

# 等待服务启动
echo "⏳ 等待服务启动..."
sleep 30

# 检查服务状态
echo "🔍 检查服务状态..."
docker-compose ps

# 创建索引
echo "📊 创建Elasticsearch索引..."
curl -X PUT "localhost:9200/planning-engine" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "5s"
  }
}'

curl -X PUT "localhost:9200/monitoring" -H 'Content-Type: application/json' -d'
{
  "settings": {
    "number_of_shards": 1,
    "number_of_replicas": 0,
    "refresh_interval": "1s"
  }
}'

echo "✅ ELK Stack 启动完成！"
echo "📊 Kibana: http://localhost:5601"
echo "🔍 Elasticsearch: http://localhost:9200"
`;

  fs.writeFileSync('elk/start.sh', startScript);
  
  // 10. 创建监控脚本
  const monitorScript = `#!/bin/bash
# ELK Stack 监控脚本

echo "📊 ELK Stack 监控状态..."

# 检查Elasticsearch
echo "🔍 检查Elasticsearch..."
curl -s "localhost:9200/_cluster/health" | jq '.'

# 检查Logstash
echo "🔍 检查Logstash..."
curl -s "localhost:9600/_node/stats" | jq '.'

# 检查Kibana
echo "🔍 检查Kibana..."
curl -s "localhost:5601/api/status" | jq '.'

# 检查Filebeat
echo "🔍 检查Filebeat..."
docker exec athlete-ally-filebeat filebeat test output

echo "✅ 监控完成！"
`;

  fs.writeFileSync('elk/monitor.sh', monitorScript);
  
  console.log('✅ ELK Stack配置完成！');
  console.log('📁 配置文件已创建:');
  console.log('   - elk/docker-compose.yml');
  console.log('   - elk/logstash/pipeline/logstash.conf');
  console.log('   - elk/filebeat/filebeat.yml');
  console.log('   - elk/kibana/dashboard.json');
  console.log('   - elk/logger.js');
  console.log('   - elk/start.sh');
  console.log('   - elk/monitor.sh');
  
  console.log('\n🚀 启动ELK Stack:');
  console.log('   cd elk && ./start.sh');
  
  console.log('\n📊 访问地址:');
  console.log('   - Kibana: http://localhost:5601');
  console.log('   - Elasticsearch: http://localhost:9200');
  
  console.log('\n💡 使用建议:');
  console.log('1. 定期清理旧日志索引');
  console.log('2. 监控磁盘使用情况');
  console.log('3. 配置日志轮转');
  console.log('4. 设置告警规则');
  console.log('5. 优化查询性能');
  console.log('6. 实施日志分析');
  console.log('7. 建立日志审计');
  console.log('8. 配置日志备份');
  
  return elkConfig;
};

// 运行ELK Stack设置
const result = setupELKStack();
console.log('\n🎉 ELK Stack日志聚合设置完成！');

