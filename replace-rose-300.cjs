const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/bg-rose-300/g, 'bg-accent-light');
  content = content.replace(/text-rose-300/g, 'text-accent-light');
  content = content.replace(/border-rose-300/g, 'border-accent-light');
  content = content.replace(/ring-rose-300/g, 'ring-accent-light');
  content = content.replace(/from-rose-300/g, 'from-accent-light');
  content = content.replace(/to-rose-300/g, 'to-accent-light');
  content = content.replace(/accent-rose-300/g, 'accent-accent-light');

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
console.log('Done replacing rose-300 colors.');
