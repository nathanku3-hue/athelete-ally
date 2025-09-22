/**
 * Fastify类型声明
 * 用于前端中间件类型兼容
 */

export interface FastifyRequest {
  [key: string]: any;
  user?: {
    userId: string;
    [key: string]: any;
  };
  params?: Record<string, string>;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
}

export interface FastifyReply {
  [key: string]: any;
  code(statusCode: number): FastifyReply;
  send(payload?: any): FastifyReply;
  sent: boolean;
}








