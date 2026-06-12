const fs = require('fs');
const path = require('path');

const content = fs.readFileSync(path.join(__dirname, '..', 'src', 'i18n', 'translations.ts'), 'utf8');
const lines = content.split('\n');

const sections = { id: [], en: [], ar: [] };
let currentSection = null;
let braceCount = 0;
let collecting = false;

for (const line of lines) {
  const idMatch = line.match(/^\s*id:\s*\{/);
  const enMatch = line.match(/^\s*en:\s*\{/);
  const arMatch = line.match(/^\s*ar:\s*\{/);

  if (idMatch) {
    currentSection = 'id';
    collecting = true;
    braceCount = 1;
    continue;
  }
  if (enMatch) {
    currentSection = 'en';
    collecting = true;
    braceCount = 1;
    continue;
  }
  if (arMatch) {
    currentSection = 'ar';
    collecting = true;
    braceCount = 1;
    continue;
  }

  if (collecting && currentSection) {
    const openBraces = (line.match(/{/g) || []).length;
    const closeBraces = (line.match(/}/g) || []).length;
    braceCount += openBraces - closeBraces;

    if (braceCount <= 0) {
      collecting = false;
      currentSection = null;
    } else {
      sections[currentSection].push(line);
    }
  }
}

function parseSection(sectionLines) {
  const result = {};
  for (const line of sectionLines) {
    const match = line.match(/^\s*(\w+):\s*'([^']*)'/);
    if (match) {
      result[match[1]] = match[2];
    }
  }
  return result;
}

const idObj = parseSection(sections.id);
const enObj = parseSection(sections.en);
const arObj = parseSection(sections.ar);

const outputDir = path.join(__dirname, '..', 'src', 'i18n');
fs.writeFileSync(path.join(outputDir, 'id.json'), JSON.stringify(idObj, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'en.json'), JSON.stringify(enObj, null, 2), 'utf8');
fs.writeFileSync(path.join(outputDir, 'ar.json'), JSON.stringify(arObj, null, 2), 'utf8');

console.log('ID keys:', Object.keys(idObj).length);
console.log('EN keys:', Object.keys(enObj).length);
console.log('AR keys:', Object.keys(arObj).length);
console.log('JSON files created in:', outputDir);
