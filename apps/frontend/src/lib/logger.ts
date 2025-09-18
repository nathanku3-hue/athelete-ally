/**
 * 前端日志工具
 * 在生产环境中禁用详细日志，只保留错误日志
 */

const isDevelopment = process.env.NODE_ENV === 'development';

export const logger = {
  log: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.log(message, ...args);
    }
  },
  
  info: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.info(message, ...args);
    }
  },
  
  warn: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.warn(message, ...args);
    }
  },
  
  error: (message: string, ...args: any[]) => {
    // 错误日志始终输出，即使在生产环境
    console.error(message, ...args);
  },
  
  debug: (message: string, ...args: any[]) => {
    if (isDevelopment) {
      console.debug(message, ...args);
    }
  }
};
