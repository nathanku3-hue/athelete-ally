import {} from '../index.js';
const isDev = process.env.NODE_ENV !== 'production';
async function postLogs(events) {
    try {
        await fetch('/api/logs', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify(events),
            keepalive: true,
            cache: 'no-store'
        });
    }
    catch { }
}
export const browserAdapter = {
    emit(event) {
        if (isDev) {
            // eslint-disable-next-line no-console -- intentional: dev mode browser logging
            console[event.level === 'debug' ? 'log' : event.level](event.msg, event.context || {});
            return;
        }
        void postLogs([event]);
    }
};
export default browserAdapter;
//# sourceMappingURL=browser.js.map