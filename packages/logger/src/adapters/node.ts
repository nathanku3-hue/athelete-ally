import { type LogAdapter, type LogEvent } from '../index';
export const nodeAdapter: LogAdapter = { emit(event: LogEvent) { try { // eslint-disable-next-line no-console console.log(JSON.stringify(event)); } catch { // eslint-disable-next-line no-console console.log('{"level":"error","msg":"failed to serialize log event"}'); } } };
export default nodeAdapter;
