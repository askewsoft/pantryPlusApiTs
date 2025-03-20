const https = require('https');
const fs = require('fs');
const path = require('path');

const certUrl = 'https://truststore.pki.rds.amazonaws.com/global/global-bundle.pem';
const certDir = path.join(process.cwd(), 'build', 'certs');
const certPath = path.join(certDir, 'rds-ca.pem');

// Ensure the directory exists
if (!fs.existsSync(certDir)) {
  fs.mkdirSync(certDir, { recursive: true });
}

https.get(certUrl, (res) => {
  if (res.statusCode !== 200) {
    console.error(`Failed to download certificate: ${res.statusCode} ${res.statusMessage}`);
    process.exit(1);
  }

  const certFile = fs.createWriteStream(certPath);
  res.pipe(certFile);

  certFile.on('finish', () => {
    certFile.close();
    console.log('RDS certificate downloaded successfully');
  });
}).on('error', (err) => {
  console.error('Error downloading certificate:', err.message);
  process.exit(1);
}); 