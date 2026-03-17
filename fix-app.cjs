const fs = require('fs');
const path = require('path');

function fixAppTsx() {
  const appPath = path.join(__dirname, 'src', 'App.tsx');
  let content = fs.readFileSync(appPath, 'utf8');

  // Today's Progress card background
  content = content.replace(/from-rose-300 to-rose-400/g, 'from-[#B76E79] to-[#D4A5A5]');

  // Section headers "Anchor Tasks" "Today's Tasks"
  // They currently use text-rose-300
  content = content.replace(/text-rose-300 uppercase tracking-widest/g, 'text-accent uppercase tracking-[1.5px]');
  content = content.replace(/text-rose-300 uppercase tracking-\[0\.2em\]/g, 'text-accent uppercase tracking-[1.5px]');
  content = content.replace(/text-rose-300 uppercase tracking-\[0\.3em\]/g, 'text-accent uppercase tracking-[1.5px]');
  content = content.replace(/text-rose-300 uppercase tracking-\[0\.4em\]/g, 'text-accent uppercase tracking-[1.5px]');

  // Daily Love Note label
  content = content.replace(/text-rose-300 uppercase tracking-\[0\.2em\]/g, 'text-rose-gold uppercase tracking-[1.5px]');

  // Task cards completed task
  content = content.replace(/line-through decoration-rose-300\/50 opacity-50/g, 'text-text-secondary line-through');

  // Streak counter
  content = content.replace(/text-orange-500 font-bold text-sm/g, 'text-text-primary dark:text-white font-bold text-sm');
  content = content.replace(/text-orange-500/g, 'text-[#FF6F00]');

  // Calendar day numbers
  content = content.replace(/text-text-primary dark:text-gray-300/g, 'text-[#3D2C2C] dark:text-white');
  content = content.replace(/text-rose-300/g, 'text-accent');
  
  // "From Him" card
  content = content.replace(/bg-rose-300\/5 to-rose-400\/5/g, 'bg-warm-white');
  content = content.replace(/text-rose-300\/60/g, 'text-text-secondary');

  // Stats numbers
  content = content.replace(/text-rose-500/g, 'text-rose-gold');
  content = content.replace(/text-rose-400/g, 'text-rose-gold');

  // Bottom Navigation Bar
  content = content.replace(/bg-gradient-to-r from-\[\#B76E79\] to-\[\#D4A5A5\] text-white shadow-lg/g, 'bg-rose-gold text-white shadow-lg');
  content = content.replace(/text-text-secondary/g, 'text-text-secondary');
  content = content.replace(/bg-white dark:bg-navy-800 shadow-2xl/g, 'bg-[#FDFAF7] border-t border-rose-gold/20 shadow-2xl');

  // Fix buttons
  content = content.replace(/bg-rose-gold text-white/g, 'bg-rose-gold text-white');
  content = content.replace(/bg-rose-500 text-white/g, 'bg-[#C2185B] text-white');

  fs.writeFileSync(appPath, content, 'utf8');
}

fixAppTsx();
console.log('Done fixing App.tsx');
