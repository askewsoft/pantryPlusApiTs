const https = require('https');
const fs = require('fs');
const path = require('path');

const certUrl = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
// Use absolute path for App Runner environment
const baseDir = process.env.NODE_ENV === 'production' ? '/app' : process.cwd();
const certDir = path.join(baseDir, 'build', 'certs');
const certPath = path.join(certDir, 'rds-ca.pem');

console.log('Certificate download configuration:', {
  NODE_ENV: process.env.NODE_ENV,
  baseDir,
  certDir,
  certPath,
  currentDir: process.cwd(),
  dirExists: fs.existsSync(baseDir)
});

// Ensure the directory exists
try {
  fs.mkdirSync(certDir, { recursive: true });
  console.log(`Created certificate directory: ${certDir}`);
} catch (err) {
  console.error('Error creating certificate directory:', {
    error: err.message,
    certDir,
    code: err.code
  });
  process.exit(1);
}

console.log(`Downloading certificate from ${certUrl}`);
https.get(certUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download certificate: ${res.statusCode} ${res.statusMessage}`);
    process.exit(1);
  }

  const certFile = fs.createWriteStream(certPath);
  res.pipe(certFile);

  certFile.on('finish', () => {
    certFile.close();
    console.log(`Certificate downloaded successfully to ${certPath}`);
    // Verify the file exists and has content
    const stats = fs.statSync(certPath);
    console.log('Certificate file details:', {
      size: stats.size,
      permissions: stats.mode,
      exists: fs.existsSync(certPath)
    });
  });

  certFile.on('error', (err) => {
    console.error('Error writing certificate file:', {
      error: err.message,
      code: err.code,
      path: certPath
    });
    process.exit(1);
  });
}).on('error', (err) => {
  console.error('Error downloading certificate:', {
    error: err.message,
    code: err.code,
    url: certUrl
  });
  process.exit(1);
}); 