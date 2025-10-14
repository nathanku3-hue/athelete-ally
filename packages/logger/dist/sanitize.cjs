"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sanitizeText = sanitizeText;
exports.filterAndSanitizeContext = filterAndSanitizeContext;
/** PII sanitization utilities */
const crypto_1 = __importDefault(require("crypto"));
const SALT = process.env.LOGS_HASH_SALT || '';
const patterns = [
    { name: 'email', re: /[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi },
    { name: 'phone', re: /(?:(?:\+?\d{1,3})?[\s.-]?)?(?:\(\d{2,4}\)|\d{2,4})[\s.-]?\d{3,4}[\s.-]?\d{3,4}/g },
    { name: 'ipv4', re: /\b(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\b/g },
    { name: 'ipv6', re: /\b(?:[A-F0-9]{1,4}:){7}[A-F0-9]{1,4}\b/gi },
    { name: 'jwt', re: /eyJ[\w-]+\.[\w-]+\.[\w-]+/g },
    { name: 'uuid', re: /\b[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\b/gi },
    { name: 'ssn', re: /\b(?!000|666|9\d\d)(\d{3})[- ]?(?!00)(\d{2})[- ]?(?!0000)(\d{4})\b/g }
];
function sha256(v) { return crypto_1.default.createHash('sha256').update(SALT + v).digest('hex'); }
function sanitizeText(input) {
    let text = typeof input === 'string' ? input : JSON.stringify(input);
    const hashes = [];
    for (const { re } of patterns) {
        text = text.replace(re, (m) => { hashes.push(sha256(m)); return '[REDACTED]'; });
    }
    return { text, hashes };
}
const allowedContextKeys = new Set(['field', 'value', 'environment', 'route', 'requestId', 'status']);
function filterAndSanitizeContext(ctx) {
    if (!ctx || typeof ctx !== 'object')
        return { context: undefined, hashes: [] };
    const out = {};
    const hashes = [];
    for (const [k, v] of Object.entries(ctx)) {
        if (!allowedContextKeys.has(k))
            continue;
        if (typeof v === 'string') {
            const s = sanitizeText(v);
            out[k] = s.text;
            hashes.push(...s.hashes);
        }
        else {
            out[k] = v;
        }
    }
    return { context: Object.keys(out).length ? out : undefined, hashes };
}
//# sourceMappingURL=sanitize.js.map