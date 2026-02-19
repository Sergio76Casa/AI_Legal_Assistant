const fs = require('fs');
const path = require('path');

const baseDir = 'c:/Users/USER/Desktop/Proyectos Antigravity/Legal/src';
const localeDir = path.join(baseDir, 'locales');
const componentsDir = path.join(baseDir, 'components');

const replacements = [
    { search: /Legal & Halal Assistant/g, replace: 'LegalFlow' },
    { search: /Legal & Halal Consultant/g, replace: 'LegalFlow Consultant' },
    { search: /Legal & Halal Enterprise Platform/g, replace: 'LegalFlow Platform' },
    { search: /Legal & Halal/g, replace: 'LegalFlow' },
    { search: /AI Legal Assistant/g, replace: 'LegalFlow' },
    { search: /LegalAI Corporate/g, replace: 'LegalFlow' },
    { search: /LegalAI/g, replace: 'LegalFlow' }
];

function processFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let changed = false;
    replacements.forEach(r => {
        if (r.search.test(content)) {
            content = content.replace(r.search, r.replace);
            changed = true;
        }
    });
    if (changed) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walk(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            walk(filePath);
        } else if (file.endsWith('.json') || file.endsWith('.tsx') || file.endsWith('.ts') || file.endsWith('.tsx')) {
            processFile(filePath);
        }
    });
}

// Process locales
walk(localeDir);
// Process components
walk(componentsDir);

// Process index.html separately
const indexPath = 'c:/Users/USER/Desktop/Proyectos Antigravity/Legal/index.html';
let indexContent = fs.readFileSync(indexPath, 'utf8');
indexContent = indexContent.replace(/Asistente Legal & Halal/g, 'LegalFlow');
fs.writeFileSync(indexPath, indexContent, 'utf8');
console.log('Updated index.html');
