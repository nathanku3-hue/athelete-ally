// 暫時移除共享包依賴，使用硬編碼端口
export const config = {
    PORT: process.env.PORT || '4000', // 修复：Gateway-BFF应该运行在4000端口
    PROFILE_ONBOARDING_URL: process.env.PROFILE_ONBOARDING_URL || 'http://localhost:4101',
    PLANNING_ENGINE_URL: process.env.PLANNING_ENGINE_URL || 'http://localhost:4102',
    EXERCISES_URL: process.env.EXERCISES_URL || 'http://localhost:4103',
    FATIGUE_URL: process.env.FATIGUE_URL || 'http://localhost:4104',
    WORKOUTS_URL: process.env.WORKOUTS_URL || 'http://localhost:4105',
    JAEGER_ENDPOINT: process.env.JAEGER_ENDPOINT || 'http://localhost:16686/api/traces',
    NODE_ENV: process.env.NODE_ENV || 'development',
};
//# sourceMappingURL=config.js.map