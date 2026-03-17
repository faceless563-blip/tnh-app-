const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/bg-rose-50/g, 'bg-rose-gold/10');
  content = content.replace(/bg-rose-100/g, 'bg-rose-gold/20');
  content = content.replace(/bg-rose-900\/20/g, 'bg-white/5');
  content = content.replace(/bg-rose-900\/30/g, 'bg-white/10');
  content = content.replace(/bg-rose-900\/10/g, 'bg-white/5');
  content = content.replace(/text-rose-400/g, 'text-accent');

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
console.log('Done replacing rose-50 colors.');
