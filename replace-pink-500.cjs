const fs = require('fs');
const path = require('path');

function replaceInFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;
  
  content = content.replace(/shadow-pink-500/g, 'shadow-accent');
  content = content.replace(/from-pink-400/g, 'from-rose-gold');
  content = content.replace(/to-pink-500/g, 'to-rose-gold');
  content = content.replace(/from-rose-300/g, 'from-rose-gold');
  content = content.replace(/to-rose-400/g, 'to-rose-gold');
  content = content.replace(/from-rose-400/g, 'from-rose-gold');
  content = content.replace(/from-\[\#B76E79\]/g, 'from-rose-gold');
  content = content.replace(/to-\[\#D4A5A5\]/g, 'to-rose-gold');
  content = content.replace(/bg-gradient-to-r from-rose-gold to-rose-gold/g, 'bg-rose-gold');
  content = content.replace(/bg-gradient-to-br from-rose-gold to-rose-gold/g, 'bg-rose-gold');
  content = content.replace(/bg-gradient-to-r from-rose-gold to-fuchsia-500/g, 'bg-rose-gold');

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
console.log('Done replacing pink-500 colors.');
