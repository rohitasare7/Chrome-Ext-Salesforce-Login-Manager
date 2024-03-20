/*const fs = require('fs');
const path = require('path');

const manifestPath = 'extension/manifest.json'; // Update this path to match your manifest.json file location
const distPath = 'dist';

fs.copyFile(manifestPath, path.join(distPath, 'manifest.json'), (err) => {
  if (err) throw err;
  console.log('manifest.json was copied to the dist folder');
}); */

const fs = require('fs');
const path = require('path');

const sourceFolder = 'extension';
const destinationFolder = 'dist';
const jsDestinationFolder = 'dist/js';

fs.readdir(sourceFolder, (err, files) => {
  if (err) throw err;
  files.forEach((file) => {
    const sourceFilePath = path.join(sourceFolder, file);
    let destinationFilePath;
    if (path.extname(file) === '.js') {
      destinationFilePath = path.join(jsDestinationFolder, file);
    } else {
      destinationFilePath = path.join(destinationFolder, file);
    }
    fs.copyFile(sourceFilePath, destinationFilePath, (err) => {
      if (err) throw err;
      console.log(`${file} was copied to the ${path.dirname(destinationFilePath)} folder`);
    });
  });
});

