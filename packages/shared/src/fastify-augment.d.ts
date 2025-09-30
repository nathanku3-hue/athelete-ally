declare module 'fastify' {
  interface FastifyRequest {
    user?: { userId: string; [k: string]: unknown };
    requestId?: string;
    rawBody?: string;
    method: string;
    url: string;
    id: string;
    headers: Record<string, string | string[] | undefined>;
    ip: string;
    body: any;
    query: Record<string, any>;
    log: {
      error: (obj: any, msg?: string) => void;
      warn: (obj: any, msg?: string) => void;
      info: (obj: any, msg?: string) => void;
      debug: (obj: any, msg?: string) => void;
    };
  }
  
  interface FastifyReply {
    code(statusCode: number): FastifyReply;
    send(payload?: any): FastifyReply;
    type(contentType: string): FastifyReply;
    status(statusCode: number): FastifyReply;
    redirect(url: string): FastifyReply;
  }
  
  interface FastifyInstance {
    get: (path: string, handler: (request: FastifyRequest, reply: FastifyReply) => void) => void;
    post: (path: string, handler: (request: FastifyRequest, reply: FastifyReply) => void) => void;
    register: (plugin: any, options?: any) => void;
    listen: (options: { port: number; host: string }) => Promise<void>;
    log: {
      error: (obj: any, msg?: string) => void;
      warn: (obj: any, msg?: string) => void;
      info: (obj: any, msg?: string) => void;
      debug: (obj: any, msg?: string) => void;
    };
  }
  
  function fastify(options?: any): FastifyInstance;
  export = fastify;
}
