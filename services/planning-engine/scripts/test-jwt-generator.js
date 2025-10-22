import { JWTTestUtils } from '@athlete-ally/shared';

const userId = process.argv[2] || `test-user-${Date.now()}`;
const role = process.argv[3] || 'user';
const email = process.argv[4] || `${userId}@test.example.com`;

const token = JWTTestUtils.generateTestToken(userId, role, email);

console.log('JWT Token:', token);
console.log('Authorization Header:', `Bearer ${token}`);
console.log('User ID:', userId);
console.log('Role:', role);
console.log('Email:', email);
