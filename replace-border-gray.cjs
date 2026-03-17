const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/border-gray-50/g, 'border-rose-gold/5');
  content = content.replace(/border-gray-300/g, 'border-rose-gold/30');
  content = content.replace(/border-gray-600/g, 'border-white/20');
  content = content.replace(/border-gray-700/g, 'border-white/10');
  content = content.replace(/dark:border-navy-900/g, 'dark:border-white/5');

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
console.log('Done replacing border-gray colors.');
