// 启动单个微服务进行测试
const { spawn } = require('child_process');
const path = require('path');
require('dotenv').config();

console.log('🚀 启动单个微服务测试');
console.log('==================');

// 启动 profile-onboarding 服务
function startProfileOnboarding() {
  console.log('🔧 启动 profile-onboarding 服务...');
  
  const proc = spawn('cmd', ['/c', 'npm', 'run', 'dev'], {
    cwd: path.join(__dirname, 'services', 'profile-onboarding'),
    env: {
      ...process.env,
      PORT: process.env.PROFILE_ONBOARDING_PORT || 8001
    },
    stdio: 'pipe'
  });

  proc.stdout.on('data', (data) => {
    console.log(`[profile-onboarding] ${data.toString().trim()}`);
  });

  proc.stderr.on('data', (data) => {
    console.error(`[profile-onboarding] ERROR: ${data.toString().trim()}`);
  });

  proc.on('close', (code) => {
    console.log(`[profile-onboarding] 进程退出，代码: ${code}`);
  });

  return proc;
}

// 启动服务
const service = startProfileOnboarding();

console.log('\n✅ profile-onboarding 服务已启动！');
console.log(`📋 服务地址: http://localhost:${process.env.PROFILE_ONBOARDING_PORT || 8001}`);
console.log('\n按 Ctrl+C 停止服务');

// 优雅关闭处理
process.on('SIGINT', () => {
  console.log('\n🛑 正在关闭服务...');
  service.kill('SIGTERM');
  process.exit(0);
});

