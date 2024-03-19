const fs = require('fs');
const path = require('path');

const manifestPath = 'extension/manifest.json'; // Update this path to match your manifest.json file location
const distPath = 'dist';

fs.copyFile(manifestPath, path.join(distPath, 'manifest.json'), (err) => {
  if (err) throw err;
  console.log('manifest.json was copied to the dist folder');
});