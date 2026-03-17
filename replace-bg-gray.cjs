const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/bg-gray-200/g, 'bg-rose-gold/20');
  content = content.replace(/bg-gray-400/g, 'bg-rose-gold/40');
  content = content.replace(/bg-gray-700/g, 'bg-white/10');
  content = content.replace(/bg-gray-800/g, 'bg-white/5');
  content = content.replace(/bg-gray-900/g, 'bg-deep-plum');
  content = content.replace(/border-gray-800/g, 'border-white/5');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${filePath}`);
  }
}

function walkDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      walkDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      replaceInFile(fullPath);
    }
  }
}

walkDir(path.join(__dirname, 'src'));
console.log('Done replacing bg-gray colors.');
