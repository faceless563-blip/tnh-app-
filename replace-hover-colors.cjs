const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/hover:bg-gray-200/g, 'hover:bg-rose-card/80');
  content = content.replace(/dark:hover:bg-navy-700/g, 'dark:hover:bg-white/10');
  content = content.replace(/dark:hover:bg-navy-800/g, 'dark:hover:bg-white/5');
  content = content.replace(/dark:bg-navy-700/g, 'dark:bg-white/5');
  content = content.replace(/dark:border-gray-700/g, 'dark:border-white/10');
  content = content.replace(/dark:border-gray-800/g, 'dark:border-white/5');
  content = content.replace(/border-gray-200/g, 'border-rose-gold/20');
  content = content.replace(/border-gray-100/g, 'border-rose-gold/10');
  content = content.replace(/text-\[\#C2185B\]/g, 'text-accent');
  content = content.replace(/bg-\[\#C2185B\]/g, 'bg-accent');
  content = content.replace(/border-\[\#C2185B\]/g, 'border-accent');
  content = content.replace(/ring-\[\#C2185B\]/g, 'ring-accent');
  content = content.replace(/shadow-\[\#C2185B\]/g, 'shadow-accent');
  content = content.replace(/dark:text-\[\#E91E63\]/g, 'dark:text-accent-light');
  content = content.replace(/dark:bg-\[\#E91E63\]/g, 'dark:bg-accent-light');
  content = content.replace(/text-rose-500/g, 'text-accent');
  content = content.replace(/text-rose-600/g, 'text-accent');
  content = content.replace(/bg-rose-500/g, 'bg-accent');
  content = content.replace(/bg-rose-600/g, 'bg-accent');

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
console.log('Done replacing hover colors.');
