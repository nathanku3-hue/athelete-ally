import { type LogAdapter, type LogEvent } from '../index';
export const nodeAdapter: LogAdapter = { emit(event: LogEvent) { try { console.log(JSON.stringify(event)); } catch { console.log('{"level":"error","msg":"failed to serialize log event"}'); } } };
export default nodeAdapter;
