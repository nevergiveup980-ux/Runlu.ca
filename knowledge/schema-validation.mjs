// Dependency-free evaluator for the keywords used by our checked-in record schema.
import { readFileSync } from 'node:fs';
const schema = JSON.parse(readFileSync(new URL('./data/schema.json', import.meta.url)));
export function validateSchema(value, node = schema, at = '$') {
  if (node.$ref) node = schema.$defs[node.$ref.split('/').at(-1)];
  const errors = [], fail = message => errors.push(`${at}: ${message}`);
  const type = x => x === null ? 'null' : Array.isArray(x) ? 'array' : Number.isInteger(x) ? 'integer' : typeof x;
  if (node.type && ![].concat(node.type).includes(type(value))) return [`${at}: invalid type`];
  if (node.enum && !node.enum.includes(value)) fail('invalid enum');
  if (typeof value === 'string') {
    if (node.minLength && value.trim().length < node.minLength) fail('blank string');
    if (node.pattern && !new RegExp(node.pattern).test(value)) fail('pattern mismatch');
    if (node.format === 'date' && (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(value)) || new Date(value).toISOString().slice(0,10) !== value)) fail('invalid date');
    if (node.format === 'uri') { try { if (!['https:', 'http:'].includes(new URL(value).protocol)) fail('invalid URL'); } catch { fail('invalid URL'); } }
  }
  if (typeof value === 'number' && node.minimum !== undefined && value < node.minimum) fail('below minimum');
  if (Array.isArray(value)) {
    if (value.length < (node.minItems ?? 0)) fail('too few items');
    value.forEach((v,i) => errors.push(...validateSchema(v,node.items,`${at}[${i}]`)));
  } else if (value && typeof value === 'object') {
    for (const key of node.required ?? []) if (!(key in value)) fail(`missing ${key}`);
    for (const [key,v] of Object.entries(value)) {
      if (node.properties?.[key]) errors.push(...validateSchema(v,node.properties[key],`${at}.${key}`));
      else if (node.additionalProperties === false) fail(`unknown ${key}`);
    }
  }
  return errors;
}
