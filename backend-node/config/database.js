// Database module
// If DB_HOST env var is set → use MySQL (for Vercel with external MySQL / PlanetScale / etc.)
// Otherwise → use JSON file (local dev / Vercel without MySQL)

const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

// ─── MySQL mode (when DB env vars are available) ───
const { DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME, DB_SSL } = process.env;

if (DB_HOST && DB_USER) {
  // Use real MySQL
  const mysql = require('mysql2/promise');
  const pool = mysql.createPool({
    host: DB_HOST,
    port: Number(DB_PORT) || 3306,
    user: DB_USER,
    password: DB_PASSWORD,
    database: DB_NAME || 'smartbook_ramadan',
    waitForConnections: true,
    connectionLimit: 5,
    ssl: DB_SSL === 'true' ? {} : undefined,
  });
  module.exports = pool;
} else {

// ─── JSON file mode (local dev / Vercel without MySQL) ───
let data = null;
let dbPath = '';

function getDbPath() {
  if (dbPath) return dbPath;

  if (process.env.NODE_ENV === 'production') {
    dbPath = '/tmp/smartbook_data.json';
  } else {
    const dir = path.join(__dirname, '..', 'data');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    dbPath = path.join(dir, 'smartbook_data.json');
  }
  return dbPath;
}

function load() {
  const p = getDbPath();
  if (fs.existsSync(p)) {
    try {
      const raw = fs.readFileSync(p, 'utf8');
      data = JSON.parse(raw);
    } catch {
      data = null;
    }
  }

  if (!data) {
    data = {
      users: [],
      classes: [],
      prayer_trackings: [],
      sermon_topics: [],
      friday_prayers: [],
      doa_materials: [],
      doa_trackings: [],
      material_categories: [],
      materials: [],
      quizzes: [],
      questions: [],
      answers: [],
      quiz_results: [],
      journals: [],
      notifications: [],
      prayer_schedules: [],
      material_readings: [],
      _nextIds: {
        users: 1, classes: 1, prayer_trackings: 1, sermon_topics: 1,
        friday_prayers: 1, doa_materials: 1, doa_trackings: 1,
        material_categories: 1, materials: 1, quizzes: 1, questions: 1,
        answers: 1, quiz_results: 1, journals: 1, notifications: 1,
        prayer_schedules: 1, material_readings: 1
      }
    };
  }
  return data;
}

function save() {
  fs.writeFileSync(getDbPath(), JSON.stringify(data, null, 2));
}

function nextId(table) {
  const id = data._nextIds[table] || 1;
  data._nextIds[table] = id + 1;
  return id;
}

let initialized = false;

async function init() {
  if (initialized) return;
  load();
  await seedData();
  initialized = true;
}

async function seedData() {
  if (data.users.length > 0) return; // Already seeded

  const adminPassword = await bcrypt.hash('admin123', 10);
  const santriPassword = await bcrypt.hash('santri123', 10);
  const now = new Date().toISOString();

  data.users.push(
    { id: nextId('users'), name: 'Admin Guru', email: 'admin@smartbook.com', password: adminPassword, role: 'guru', nisn: null, nip: '1987654321', class: null, class_id: null, phone: null, photo_url: null, is_active: 1, created_at: now, updated_at: now },
    { id: nextId('users'), name: 'Santri Test', email: 'santri@smartbook.com', password: santriPassword, role: 'siswa', nisn: '1234567890', nip: null, class: 'XII-A', class_id: null, phone: null, photo_url: null, is_active: 1, created_at: now, updated_at: now }
  );

  data.sermon_topics.push(
    { id: nextId('sermon_topics'), title: 'Keutamaan 10 Hari Pertama Ramadhan', description: 'Membahas tentang keutamaan sepuluh hari pertama Ramadhan yang penuh rahmat.', date: null, status: 'active', created_by: 1, created_at: now, updated_at: now },
    { id: nextId('sermon_topics'), title: 'Puasa dan Pembentukan Karakter', description: 'Bagaimana puasa membentuk karakter muslim yang bertakwa.', date: null, status: 'active', created_by: 1, created_at: now, updated_at: now },
    { id: nextId('sermon_topics'), title: 'Malam Lailatul Qadar', description: 'Keutamaan malam Lailatul Qadar dan cara meraihnya.', date: null, status: 'active', created_by: 1, created_at: now, updated_at: now }
  );

  save();
}

// ──────────────────────────── HELPERS ────────────────────────────

// Extract content between balanced parentheses starting from str[0]='('
function extractBalanced(str) {
  let depth = 0, start = -1;
  for (let i = 0; i < str.length; i++) {
    if (str[i] === '(') { if (depth === 0) start = i; depth++; }
    else if (str[i] === ')') { depth--; if (depth === 0) return str.slice(start + 1, i); }
  }
  return null;
}

// Find position of first balanced '(' in str after index 0
function findOpenParen(str, afterIndex) {
  for (let i = afterIndex || 0; i < str.length; i++) {
    if (str[i] === '(') return i;
  }
  return -1;
}

// Split string by keyword (AND/OR) at top level only (not inside parentheses)
function splitTopLevel(str, keyword) {
  const results = [];
  let depth = 0, current = '';
  const kwUpper = keyword.toUpperCase();
  const kwLen = kwUpper.length;
  let i = 0;
  while (i < str.length) {
    if (str[i] === '(') depth++;
    else if (str[i] === ')') depth--;
    if (depth === 0) {
      // Check if this position starts with the keyword as a whole word
      const remaining = str.slice(i);
      const remainingUpper = remaining.toUpperCase();
      if (remainingUpper.startsWith(kwUpper) && remainingUpper.length > kwLen) {
        const charBefore = i > 0 ? str[i - 1] : ' ';
        const charAfter = remaining[kwLen];
        if ((charBefore === ' ' || charBefore === '(') && (charAfter === ' ' || charAfter === '(')) {
          if (current.trim()) results.push(current.trim());
          current = '';
          i += kwLen;
          continue;
        }
      }
    }
    current += str[i];
    i++;
  }
  if (current.trim()) results.push(current.trim());
  return results.length > 0 ? results : [str];
}

// Resolve a value expression: ? → param, 'text' → text, number → number, NOW() → timestamp
function resolveValue(expr, params, ref) {
  expr = expr.trim();
  if (expr === '?') return params[ref.idx++];
  if (expr.toUpperCase() === 'NOW()' || expr.toUpperCase() === 'CURRENT_TIMESTAMP') return new Date().toISOString();
  if (expr.toUpperCase() === 'CURDATE()') return new Date().toISOString().slice(0, 10);
  if (expr.toUpperCase() === 'NULL') return null;
  if (expr.toUpperCase() === 'TRUE') return 1;
  if (expr.toUpperCase() === 'FALSE') return 0;
  if ((expr.startsWith("'") && expr.endsWith("'")) || (expr.startsWith('"') && expr.endsWith('"')))
    return expr.slice(1, -1);
  if (!isNaN(Number(expr))) return Number(expr);
  return expr.replace(/^['"]|['"]$/g, '');
}

// Evaluate WHERE condition recursively (supports AND, OR, parentheses)
function evalCondition(row, cond, params, ref) {
  cond = cond.trim();
  if (!cond) return true;

  // Strip outer parentheses
  while (cond.startsWith('(') && cond.endsWith(')') && extractBalanced(cond) === cond.slice(1, -1)) {
    cond = cond.slice(1, -1).trim();
  }

  // OR (lower precedence than AND)
  const orParts = splitTopLevel(cond, 'OR');
  if (orParts.length > 1) {
    return orParts.some(part => evalCondition(row, part, params, ref));
  }

  // AND
  const andParts = splitTopLevel(cond, 'AND');
  if (andParts.length > 1) {
    return andParts.every(part => evalCondition(row, part, params, ref));
  }

  // IS NULL
  let m = cond.match(/^(\w+(?:\.\w+)?)\s+IS\s+NULL$/i);
  if (m) { const f = m[1].split('.').pop(); return row[f] === null || row[f] === undefined; }

  // IS NOT NULL
  m = cond.match(/^(\w+(?:\.\w+)?)\s+IS\s+NOT\s+NULL$/i);
  if (m) { const f = m[1].split('.').pop(); return row[f] !== null && row[f] !== undefined; }

  // NOT LIKE
  m = cond.match(/^(\w+)\s+NOT\s+LIKE\s+(.+)$/i);
  if (m) {
    const f = m[1], pat = String(resolveValue(m[2], params, ref));
    const rx = new RegExp('^' + pat.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    return !rx.test(String(row[f] || ''));
  }

  // LIKE
  m = cond.match(/^(\w+)\s+LIKE\s+(.+)$/i);
  if (m) {
    const f = m[1], pat = String(resolveValue(m[2], params, ref));
    const rx = new RegExp('^' + pat.replace(/%/g, '.*').replace(/_/g, '.') + '$', 'i');
    return rx.test(String(row[f] || ''));
  }

  // NOT IN
  m = cond.match(/^(\w+)\s+NOT\s+IN\s*\((.+)\)$/i);
  if (m) {
    const f = m[1], vals = m[2].split(',').map(v => resolveValue(v.trim(), params, ref));
    return !vals.some(v => String(row[f]) === String(v));
  }

  // IN
  m = cond.match(/^(\w+)\s+IN\s*\((.+)\)$/i);
  if (m) {
    const f = m[1], vals = m[2].split(',').map(v => resolveValue(v.trim(), params, ref));
    return vals.some(v => String(row[f]) === String(v));
  }

  // != <>
  m = cond.match(/^(\w+(?:\.\w+)?)\s*(?:!=|<>)\s*(.+)$/);
  if (m) { const f = m[1].split('.').pop(); const v = resolveValue(m[2], params, ref); return String(row[f]) !== String(v); }

  // >=
  m = cond.match(/^(\w+(?:\.\w+)?)\s*>=\s*(.+)$/);
  if (m) { const f = m[1].split('.').pop(); const v = resolveValue(m[2], params, ref); return Number(row[f]) >= Number(v); }

  // <=
  m = cond.match(/^(\w+(?:\.\w+)?)\s*<=\s*(.+)$/);
  if (m) { const f = m[1].split('.').pop(); const v = resolveValue(m[2], params, ref); return Number(row[f]) <= Number(v); }

  // >
  m = cond.match(/^(\w+(?:\.\w+)?)\s*>\s*(.+)$/);
  if (m) { const f = m[1].split('.').pop(); const v = resolveValue(m[2], params, ref); return Number(row[f]) > Number(v); }

  // <
  m = cond.match(/^(\w+(?:\.\w+)?)\s*<\s*(.+)$/);
  if (m) { const f = m[1].split('.').pop(); const v = resolveValue(m[2], params, ref); return Number(row[f]) < Number(v); }

  // = (equals)
  m = cond.match(/^(\w+(?:\.\w+)?)\s*=\s*(.+)$/);
  if (m) { const f = m[1].split('.').pop(); const v = resolveValue(m[2], params, ref); return String(row[f]) === String(v); }

  // Unknown - skip
  return true;
}

// ──────────────────────────── QUERY PARSER ────────────────────────────

const pool = {
  async query(sql, params = []) {
    await init();

    const trimmed = sql.trim().replace(/\s+/g, ' ');
    const upper = trimmed.toUpperCase();
    const ref = { idx: 0 };

    // ---- SELECT ----
    if (upper.startsWith('SELECT')) {
      // Skip DDL
      if (upper.startsWith('SHOW ') || upper.startsWith('ALTER ') || upper.startsWith('DESCRIBE ') || upper.startsWith('PRAGMA ')) {
        return [[], undefined];
      }

      // Find FROM
      const fromIdx = trimmed.toUpperCase().indexOf(' FROM ');
      if (fromIdx === -1) { console.warn('SELECT without FROM:', sql); return [[], undefined]; }

      const fields = trimmed.slice(7, fromIdx).trim();
      const afterFrom = trimmed.slice(fromIdx + 6).trim();

      // Extract table (first word, skip aliases)
      const tableMatch = afterFrom.match(/^(\w+)/);
      const tableName = tableMatch ? tableMatch[1] : afterFrom.split(/\s/)[0];

      let rows = [...(data[tableName] || [])];

      // WHERE - extract everything between WHERE and ORDER/GROUP/LIMIT/END
      const whereMatch = afterFrom.match(/\bWHERE\s+(.+?)(?:\s+ORDER\s+BY|\s+GROUP\s+BY|\s+LIMIT|\s+HAVING|$)/i);
      if (whereMatch) {
        const whereClause = whereMatch[1].trim();
        rows = rows.filter(row => {
          ref.idx = 0;
          return evalCondition(row, whereClause, params, ref);
        });
      }

      // ORDER BY
      const orderMatch = trimmed.match(/\bORDER\s+BY\s+(.+?)(?:\s+LIMIT|\s+GROUP|\s+HAVING|$)/i);
      if (orderMatch) {
        const orderParts = orderMatch[1].trim().split(',');
        orderParts.forEach(part => {
          const pieces = part.trim().split(/\s+/);
          const field = pieces[0].replace(/^`|`$/g, '').split('.').pop();
          const dir = pieces[1] && pieces[1].toUpperCase() === 'DESC' ? -1 : 1;
          rows.sort((a, b) => {
            if (a[field] < b[field]) return -1 * dir;
            if (a[field] > b[field]) return 1 * dir;
            return 0;
          });
        });
      }

      // LIMIT
      const limitMatch = trimmed.match(/\bLIMIT\s+(\d+)(?:\s+OFFSET\s+(\d+))?/i);
      if (limitMatch) {
        const limit = parseInt(limitMatch[1]);
        const offset = limitMatch[2] ? parseInt(limitMatch[2]) : 0;
        rows = rows.slice(offset, offset + limit);
      }

      // SELECT specific fields (skip for COUNT, AVG, etc. and subqueries)
      if (fields !== '*' && !fields.toUpperCase().includes('COUNT(') && !fields.toUpperCase().includes('AVG(') && !fields.toUpperCase().includes('MAX(') && !fields.toUpperCase().includes('ROUND(') && !fields.toUpperCase().includes('COALESCE(') && !fields.includes('(')) {
        const fieldList = fields.split(',').map(f => {
          const clean = f.trim().replace(/`/g, '');
          // Handle aliases: "u.name as user_name" → "user_name"
          const aliasMatch = clean.match(/\s+AS\s+(\w+)$/i);
          if (aliasMatch) return { real: clean.replace(/\s+AS\s+\w+$/i, '').split('.').pop(), alias: aliasMatch[1] };
          return { real: clean.split('.').pop(), alias: clean.split('.').pop() };
        });
        rows = rows.map(row => {
          const obj = {};
          fieldList.forEach(f => { obj[f.alias] = row[f.real]; });
          return obj;
        });
      }

      // Handle aggregate queries: COUNT, AVG, etc.
      if (fields.toUpperCase().includes('COUNT(') || fields.toUpperCase().includes('AVG(') || fields.toUpperCase().includes('MAX(') || fields.toUpperCase().includes('ROUND(') || fields.toUpperCase().includes('COALESCE(')) {
        // GROUP BY
        const groupMatch = trimmed.match(/\bGROUP\s+BY\s+(.+?)(?:\s+HAVING|\s+ORDER\s+BY|\s+LIMIT|$)/i);
        if (groupMatch) {
          const groupField = groupMatch[1].trim().split(',')[0].trim().replace(/`/g, '').split('.').pop();
          const groups = {};
          rows.forEach(row => {
            const key = row[groupField] || 'null';
            if (!groups[key]) groups[key] = [];
            groups[key].push(row);
          });
          rows = Object.entries(groups).map(([key, groupRows]) => {
            const result = { [groupField]: key === 'null' ? null : key };
            // Parse aggregate expressions
            const aggMatches = fields.matchAll(/(COUNT|AVG|MAX|MIN|ROUND)\s*\(\s*(?:DISTINCT\s+)?(\w+(?:\.\w+)?|\*)\s*(?:,\s*\d+)?\s*\)(?:\s+AS\s+(\w+))?/gi);
            for (const agg of aggMatches) {
              const fn = agg[1].toUpperCase();
              const col = agg[2].split('.').pop();
              const alias = agg[3] || `${fn.toLowerCase()}_${col}`;
              if (fn === 'COUNT') {
                if (agg[0].toUpperCase().includes('DISTINCT')) {
                  const vals = new Set(groupRows.map(r => r[col]));
                  result[alias] = vals.size;
                } else {
                  result[alias] = groupRows.length;
                }
              } else if (fn === 'AVG') {
                const nums = groupRows.map(r => Number(r[col])).filter(n => !isNaN(n));
                result[alias] = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
              } else if (fn === 'MAX') {
                result[alias] = Math.max(...groupRows.map(r => Number(r[col]) || 0));
              } else if (fn === 'MIN') {
                result[alias] = Math.min(...groupRows.map(r => Number(r[col]) || 0));
              }
            }
            return result;
          });
        } else {
          // Aggregate without GROUP BY → single row
          const result = {};
          const aggMatches = fields.matchAll(/(COUNT|AVG|MAX|MIN|ROUND)\s*\(\s*(?:DISTINCT\s+)?(\w+(?:\.\w+)?|\*)\s*(?:,\s*\d+)?\s*\)(?:\s+AS\s+(\w+))?/gi);
          for (const agg of aggMatches) {
            const fn = agg[1].toUpperCase();
            const col = agg[2].split('.').pop();
            const alias = agg[3] || `${fn.toLowerCase()}_${col}`;
            if (fn === 'COUNT') {
              if (agg[0].toUpperCase().includes('DISTINCT')) {
                result[alias] = new Set(rows.map(r => r[col])).size;
              } else {
                result[alias] = rows.length;
              }
            } else if (fn === 'AVG') {
              const nums = rows.map(r => Number(r[col])).filter(n => !isNaN(n));
              result[alias] = nums.length ? Math.round(nums.reduce((a, b) => a + b, 0) / nums.length) : 0;
            } else if (fn === 'MAX') {
              result[alias] = rows.length ? Math.max(...rows.map(r => Number(r[col]) || 0)) : 0;
            } else if (fn === 'MIN') {
              result[alias] = rows.length ? Math.min(...rows.map(r => Number(r[col]) || 0)) : 0;
            }
          }
          rows = [result];
        }
      }

      return [rows, undefined];
    }

    // ---- INSERT ----
    if (upper.startsWith('INSERT')) {
      const insertMatch = trimmed.match(/^INSERT\s+(?:OR\s+REPLACE\s+|IGNORE\s+)?(?:INTO\s+)?(\w+)\s*\(/i);
      if (!insertMatch) { console.warn('Cannot parse INSERT:', sql); return [[], undefined]; }

      const table = insertMatch[1];
      const afterOpen = trimmed.slice(insertMatch[0].length - 1);
      const columnsStr = extractBalanced(afterOpen);
      if (!columnsStr) { console.warn('Cannot parse INSERT columns:', sql); return [[], undefined]; }
      const columns = columnsStr.split(',').map(c => c.trim().replace(/`/g, '').replace(/"/g, ''));

      // Find VALUES keyword
      const valIdx = trimmed.toUpperCase().indexOf(' VALUES ');
      if (valIdx === -1) { console.warn('INSERT without VALUES:', sql); return [[], undefined]; }

      const afterValues = trimmed.slice(valIdx + 8);
      const valuesStr = extractBalanced(afterValues);
      if (!valuesStr) { console.warn('Cannot parse INSERT values:', sql); return [[], undefined]; }

      // Split values respecting balanced parentheses (for NOW(), IF(), etc.)
      const valueParts = [];
      let depth = 0, current = '';
      for (let i = 0; i < valuesStr.length; i++) {
        if (valuesStr[i] === '(') depth++;
        else if (valuesStr[i] === ')') depth--;
        if (valuesStr[i] === ',' && depth === 0) {
          valueParts.push(current.trim());
          current = '';
        } else {
          current += valuesStr[i];
        }
      }
      if (current.trim()) valueParts.push(current.trim());

      const row = {};
      ref.idx = 0;
      columns.forEach((col, i) => {
        const valExpr = (valueParts[i] || '').trim();
        if (valExpr === '?') {
          row[col] = params[ref.idx++];
        } else if (valExpr.toUpperCase() === 'NOW()' || valExpr.toUpperCase() === 'CURRENT_TIMESTAMP') {
          row[col] = new Date().toISOString();
        } else if (valExpr.toUpperCase() === 'NULL') {
          row[col] = null;
        } else if (valExpr.match(/^IF\s*\(/i)) {
          // IF(? = 1, NOW(), NULL) or IF(? = 1, NOW(), read_at)
          const ifParam = params[ref.idx++];
          row[col] = (ifParam == 1) ? new Date().toISOString() : (valExpr.includes('NOW()') ? null : row[col.replace('_at', '')] || null);
        } else if (valExpr.toUpperCase() === '0' || valExpr === 'false') {
          row[col] = 0;
        } else if (valExpr.toUpperCase() === '1' || valExpr === 'true') {
          row[col] = 1;
        } else if (!isNaN(Number(valExpr)) && valExpr !== '') {
          row[col] = Number(valExpr);
        } else if ((valExpr.startsWith("'") && valExpr.endsWith("'")) || (valExpr.startsWith('"') && valExpr.endsWith('"'))) {
          row[col] = valExpr.slice(1, -1);
        } else {
          row[col] = valExpr;
        }
      });

      // Auto-generate ID if not provided
      if (!row.id || row.id === undefined) {
        row.id = nextId(table);
      } else if (row.id >= (data._nextIds[table] || 0)) {
        data._nextIds[table] = row.id + 1;
      }

      data[table].push(row);
      save();
      return [{ affectedRows: 1, insertId: row.id }, undefined];
    }

    // ---- UPDATE ----
    if (upper.startsWith('UPDATE')) {
      const updateMatch = trimmed.match(/^UPDATE\s+(\w+)\s+SET\s+(.+?)(?:\s+WHERE\s+(.+))?$/i);
      if (!updateMatch) { console.warn('Cannot parse UPDATE:', sql); return [[], undefined]; }

      const table = updateMatch[1];
      const setClause = updateMatch[2].trim();
      const whereClause = updateMatch[3] ? updateMatch[3].trim() : null;

      // Parse SET - handle COALESCE and balanced parens
      const updates = [];
      ref.idx = 0;
      // Split SET on commas, but respect parentheses
      let depth = 0, current = '';
      const setParts = [];
      for (let i = 0; i < setClause.length; i++) {
        if (setClause[i] === '(') depth++;
        else if (setClause[i] === ')') depth--;
        if (setClause[i] === ',' && depth === 0) {
          setParts.push(current.trim());
          current = '';
        } else {
          current += setClause[i];
        }
      }
      if (current.trim()) setParts.push(current.trim());

      setParts.forEach(part => {
        const eqIdx = part.indexOf('=');
        if (eqIdx === -1) return;
        const field = part.slice(0, eqIdx).trim().replace(/`/g, '');
        const valExpr = part.slice(eqIdx + 1).trim();

        if (valExpr.toUpperCase() === 'NOW()' || valExpr.toUpperCase() === 'CURRENT_TIMESTAMP') {
          updates.push({ field, value: new Date().toISOString() });
        } else if (valExpr.match(/^COALESCE\s*\(/i)) {
          // COALESCE(?, field) → use param if not null, else keep current
          const coalesceMatch = valExpr.match(/COALESCE\s*\(\s*\?\s*,\s*\w+\s*\)/i);
          if (coalesceMatch) {
            const paramVal = params[ref.idx++];
            updates.push({ field, value: paramVal, coalesce: true });
          }
        } else if (valExpr === '?') {
          updates.push({ field, value: params[ref.idx++] });
        } else if (valExpr.match(/^IF\s*\(/i)) {
          const ifParam = params[ref.idx++];
          if (valExpr.includes('NOW()')) {
            updates.push({ field, value: ifParam == 1 ? new Date().toISOString() : null });
          } else {
            updates.push({ field, value: ifParam == 1 ? new Date().toISOString() : null });
          }
        } else if (valExpr.toUpperCase() === 'NULL') {
          updates.push({ field, value: null });
        } else if ((valExpr.startsWith("'") && valExpr.endsWith("'")) || (valExpr.startsWith('"') && valExpr.endsWith('"'))) {
          updates.push({ field, value: valExpr.slice(1, -1) });
        } else if (!isNaN(Number(valExpr)) && valExpr !== '') {
          updates.push({ field, value: Number(valExpr) });
        } else {
          updates.push({ field, value: valExpr });
        }
      });

      let rows = [...(data[table] || [])];
      if (whereClause) {
        rows = rows.filter(row => {
          ref.idx = 0;
          return evalCondition(row, whereClause, params, ref);
        });
      }

      let affectedCount = 0;
      rows.forEach(row => {
        updates.forEach(u => {
          if (u.coalesce) {
            if (u.value !== null && u.value !== undefined && u.value !== '') {
              row[u.field] = u.value;
            }
          } else {
            row[u.field] = u.value;
          }
        });
        affectedCount++;
      });

      save();
      return [{ affectedRows: affectedCount }, undefined];
    }

    // ---- DELETE ----
    if (upper.startsWith('DELETE')) {
      const deleteMatch = trimmed.match(/^DELETE\s+FROM\s+(\w+)(?:\s+WHERE\s+(.+))?$/i);
      if (!deleteMatch) { console.warn('Cannot parse DELETE:', sql); return [[], undefined]; }

      const table = deleteMatch[1];
      const whereClause = deleteMatch[2] ? deleteMatch[2].trim() : null;

      if (whereClause) {
        const before = data[table].length;
        data[table] = data[table].filter(row => {
          ref.idx = 0;
          return !evalCondition(row, whereClause, params, ref);
        });
        save();
        return [{ affectedRows: before - data[table].length }, undefined];
      } else {
        const count = data[table].length;
        data[table] = [];
        save();
        return [{ affectedRows: count }, undefined];
      }
    }

    // ---- BEGIN/COMMIT/ROLLBACK (transaction stubs) ----
    if (upper.startsWith('BEGIN') || upper.startsWith('COMMIT') || upper.startsWith('ROLLBACK')) {
      return [[], undefined];
    }

    console.warn('Unhandled SQL:', sql);
    return [[], undefined];
  },

  async getConnection() {
    await init();
    return {
      query: (sql, params) => pool.query(sql, params),
      beginTransaction: async () => {},
      commit: async () => {},
      rollback: async () => {},
      release: () => {},
    };
  },

  end() {
    data = null;
    initialized = false;
  }
};

initialized = false;
module.exports = pool;
} // end else (JSON mode)