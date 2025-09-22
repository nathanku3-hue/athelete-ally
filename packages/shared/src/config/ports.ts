// 统一端口管理配置
// 单一事实源：所有服务的端口配置

export const SERVICE_PORTS = {
  // 前端应用 - 使用8000号段避免冲突
  GATEWAY_BFF: 8000,
  WEB: 3000, // Next.js 默认，若冲突可改为 8080
  
  // 微服务 - 使用8000号段
  PROFILE_ONBOARDING: 8001,
  PLANNING_ENGINE: 8002,
  WORKOUTS: 8003,
  FATIGUE: 8004,
  EXERCISES: 8005,
  
  // 基础设施服务 - 使用9000号段
  NATS: 9001,
  REDIS: 9002,
  POSTGRES: 9003,
  
  // 监控服务 - 使用9000号段
  PROMETHEUS: 9090,
  GRAFANA: 9091,
  JAEGER: 9092,
} as const;

export type ServiceName = keyof typeof SERVICE_PORTS;

// 端口范围定义
export const PORT_RANGES = {
  FRONTEND: [8000, 8099],
  MICROSERVICES: [8000, 8099],
  INFRASTRUCTURE: [9000, 9099],
  MONITORING: [9090, 9199],
} as const;

// 端口冲突检测
export function getPortForService(serviceName: ServiceName): number {
  return SERVICE_PORTS[serviceName];
}

// 检查端口是否在允许范围内
export function isPortInAllowedRange(port: number, range: keyof typeof PORT_RANGES): boolean {
  const [min, max] = PORT_RANGES[range];
  return port >= min && port <= max;
}

// 获取所有微服务端口
export function getMicroservicePorts(): number[] {
  return [
    SERVICE_PORTS.PROFILE_ONBOARDING,
    SERVICE_PORTS.PLANNING_ENGINE,
    SERVICE_PORTS.WORKOUTS,
    SERVICE_PORTS.FATIGUE,
    SERVICE_PORTS.EXERCISES,
  ];
}

// 获取所有前端端口
export function getFrontendPorts(): number[] {
  return [SERVICE_PORTS.GATEWAY_BFF, SERVICE_PORTS.WEB];
}

// 获取所有基础设施端口
export function getInfrastructurePorts(): number[] {
  return [
    SERVICE_PORTS.NATS,
    SERVICE_PORTS.REDIS,
    SERVICE_PORTS.POSTGRES,
  ];
}

// 获取所有监控端口
export function getMonitoringPorts(): number[] {
  return [
    SERVICE_PORTS.PROMETHEUS,
    SERVICE_PORTS.GRAFANA,
    SERVICE_PORTS.JAEGER,
  ];
}
