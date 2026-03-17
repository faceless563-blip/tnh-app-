const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Replace text colors
  content = content.replace(/text-gray-900/g, 'text-text-primary');
  content = content.replace(/text-gray-800/g, 'text-text-primary');
  content = content.replace(/text-gray-700/g, 'text-text-primary');
  content = content.replace(/text-gray-600/g, 'text-text-primary');
  content = content.replace(/text-gray-500/g, 'text-text-secondary');
  content = content.replace(/text-gray-400/g, 'text-text-secondary');
  content = content.replace(/text-gray-300/g, 'text-text-secondary');
  
  content = content.replace(/dark:text-gray-200/g, 'dark:text-text-dark-primary');
  content = content.replace(/dark:text-gray-300/g, 'dark:text-text-dark-secondary');
  content = content.replace(/dark:text-gray-400/g, 'dark:text-text-dark-secondary');
  content = content.replace(/dark:text-white/g, 'dark:text-text-dark-primary');
  
  // Replace background colors to use the theme
  content = content.replace(/bg-gray-50/g, 'bg-rose-card');
  content = content.replace(/bg-gray-100/g, 'bg-rose-card');
  content = content.replace(/dark:bg-navy-900/g, 'dark:bg-deep-plum');
  content = content.replace(/dark:bg-navy-800/g, 'dark:bg-plum-card');
  
  // Replace electric-indigo with rose-gold
  content = content.replace(/electric-indigo/g, 'rose-gold');

  fs.writeFileSync(filePath, content, 'utf8');
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
console.log('Done replacing text colors.');
