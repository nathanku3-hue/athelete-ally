import {} from '../index';
export const nodeAdapter = {
    emit(event) {
        try {
            // eslint-disable-next-line no-console -- intentional: node adapter outputs to stdout
            console.log(JSON.stringify(event));
        }
        catch {
            // eslint-disable-next-line no-console -- intentional: fallback error logging
            console.log('{"level":"error","msg":"failed to serialize log event"}');
        }
    }
};
export default nodeAdapter;
//# sourceMappingURL=node.js.map