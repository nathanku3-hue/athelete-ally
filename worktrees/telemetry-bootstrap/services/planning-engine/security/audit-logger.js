
// 安全审计日志
import winston from 'winston';

const auditLogger = winston.createLogger({
  level: 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/security-audit.log' }),
    new winston.transports.Console()
  ]
});

export const logSecurityEvent = (event, details) => {
  auditLogger.info({
    type: 'security_event',
    event,
    details: sanitizeDetails(details),
    timestamp: new Date().toISOString(),
    ip: details.ip || 'unknown'
  });
};

const sanitizeDetails = (details) => {
  const sanitized = { ...details };
  delete sanitized.password;
  delete sanitized.token;
  delete sanitized.secret;
  return sanitized;
};
