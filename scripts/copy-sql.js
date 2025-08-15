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

// Get version from command line argument
const version = process.argv[2];

// Validate version argument matches v[0-9] pattern
if (!version || !/^v[0-9]+$/.test(version)) {
  console.error('❌ Error: Version argument required and must match pattern v[0-9]+');
  console.error('Usage: node scripts/copy-sql.js <version>');
  console.error('Example: node scripts/copy-sql.js v1');
  process.exit(1);
}

// Copy SQL files from src/{version} to build/{version} maintaining directory structure
copySqlFiles(`src/${version}`, `build/${version}`);

console.log(`✅ SQL files copied from src/${version} to build/${version}`);