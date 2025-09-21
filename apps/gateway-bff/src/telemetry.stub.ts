export const sdk = { start: () => void 0 } as any;
export const tracer = { startSpan: () => ({ setAttribute(){}, end(){} }) } as any;
export const meter = { createCounter: () => ({ add(){} }), createHistogram: () => ({ record(){} }) } as any;
export default {} as any;
