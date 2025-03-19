const fs = require('fs');
const path = require('path');

const copyFile = (src, dest) => {
  fs.mkdirSync(path.dirname(dest), { recursive: true });
  fs.copyFileSync(src, dest);
};

const copySqlFiles = (src, dest) => {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      copySqlFiles(srcPath, destPath);
    } else if (entry.name.endsWith('.sql')) {
      copyFile(srcPath, destPath);
    }
  }
};

// Copy SQL files from src/v1 to build/v1 maintaining directory structure
copySqlFiles('src/v1', 'build/v1'); 