const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/bg-navy-900/g, 'bg-deep-plum');
  content = content.replace(/bg-navy-800/g, 'bg-plum-card');
  content = content.replace(/dark:from-navy-900/g, 'dark:from-deep-plum');
  content = content.replace(/dark:from-navy-800/g, 'dark:from-plum-card');
  content = content.replace(/dark:to-navy-900/g, 'dark:to-deep-plum');
  content = content.replace(/dark:ring-offset-navy-900/g, 'dark:ring-offset-deep-plum');
  content = content.replace(/from-gray-50/g, 'from-rose-card');
  content = content.replace(/to-gray-100/g, 'to-rose-card/80');

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
console.log('Done replacing navy colors.');
