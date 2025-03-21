const https = require('https');
const fs = require('fs');
const path = require('path');

// US East (N. Virginia) - us-east-1 certificate bundle
const CERT_URL = 'https://truststore.pki.rds.amazonaws.com/us-east-1/us-east-1-bundle.pem';
const CERT_DIR = path.join(process.cwd(), 'certs');
const CERT_PATH = path.join(CERT_DIR, 'rds-ca.pem');

// Create certs directory if it doesn't exist
fs.mkdirSync(CERT_DIR, { recursive: true });

console.log('Downloading RDS certificate bundle...');
console.log(`URL: ${CERT_URL}`);
console.log(`Destination: ${CERT_PATH}`);

https
  .get(CERT_URL, (response) => {
    if (response.statusCode !== 200) {
      console.error(`Failed to download certificate: ${response.statusCode} ${response.statusMessage}`);
      process.exit(1);
    }

    const file = fs.createWriteStream(CERT_PATH);
    response.pipe(file);

    file.on('finish', () => {
      file.close();
      console.log('Certificate downloaded successfully');

      // Verify the file exists and has content
      const stats = fs.statSync(CERT_PATH);
      console.log(`Certificate file size: ${stats.size} bytes`);

      if (stats.size === 0) {
        console.error('Certificate file is empty');
        process.exit(1);
      }
    });
  })
  .on('error', (err) => {
    console.error('Error downloading certificate:', err.message);
    process.exit(1);
  });
