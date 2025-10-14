"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.nodeAdapter = void 0;
exports.nodeAdapter = {
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
exports.default = exports.nodeAdapter;
//# sourceMappingURL=node.js.map