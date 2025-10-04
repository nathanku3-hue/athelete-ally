// test-port.js - 系统级端口绑定测试
import net from 'net';
const server = net.createServer();

console.log('🔍 Testing port 4000 binding...');

server.listen(4000, '0.0.0.0', () => {
  console.log('✅ Success: Native Node.js server is listening on port 4000.');
  console.log('✅ Port 4000 is available for binding.');
  server.close();
});

server.on('error', (err) => {
  console.error('❌ Error: Failed to bind to port 4000.');
  console.error('❌ Error details:', {
    code: err.code,
    errno: err.errno,
    syscall: err.syscall,
    address: err.address,
    port: err.port
  });
});

// 测试完成后退出
setTimeout(() => {
  process.exit(0);
}, 2000);
