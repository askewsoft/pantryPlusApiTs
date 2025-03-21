const https = require('https');
const fs = require('fs');
const path = require('path');

// Add process error handlers
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

const certUrl = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
// Use absolute path for App Runner environment
const baseDir = process.env.NODE_ENV === 'production' ? '/app' : process.cwd();
const certDir = path.join(baseDir, 'build', 'certs');
const certPath = path.join(certDir, 'rds-ca.pem');

console.log('Starting certificate download process');
console.log('Configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  baseDir,
  certDir,
  certPath,
  currentDir: process.cwd(),
  dirExists: fs.existsSync(baseDir)
});

// Create directory synchronously
try {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`Created certificate directory: ${certDir}`);
} catch (err) {
  console.error('Failed to create directory:', err);
  process.exit(1);
}

// Download certificate with timeout
const request = https.get(certUrl, { timeout: 5000 }, (res) => {
  console.log(`Certificate download status: ${res.statusCode}`);
  
  if (res.statusCode !== 200) {
    console.error(`Failed to download: ${res.statusCode} ${res.statusMessage}`);
    process.exit(1);
  }

  const file = fs.createWriteStream(certPath);
  res.pipe(file);

  file.on('finish', () => {
    file.close();
    try {
      const stats = fs.statSync(certPath);
      console.log('Certificate downloaded successfully:', {
        path: certPath,
        size: stats.size,
        exists: fs.existsSync(certPath)
      });
      process.exit(0);
    } catch (err) {
      console.error('Error verifying certificate:', err);
      process.exit(1);
    }
  });

  file.on('error', (err) => {
    fs.unlink(certPath, () => {});
    console.error('Error writing certificate:', err);
    process.exit(1);
  });
});

request.on('timeout', () => {
  request.destroy();
  console.error('Certificate download timed out');
  process.exit(1);
});

request.on('error', (err) => {
  console.error('Certificate download failed:', err);
  process.exit(1);
}); 