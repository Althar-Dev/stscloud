const fs = require('fs');
const path = require('path');

module.exports = (STS) => {
  const callbackDirectory = path.join(__dirname, 'callback');

  if (!fs.existsSync(callbackDirectory)) {
    console.warn('Callback directory not found:', callbackDirectory);
    return;
  }

  const callbackFiles = fs.readdirSync(callbackDirectory).filter((file) => file.endsWith('.js'));

  callbackFiles.forEach((file) => {
    const callbackName = path.basename(file, '.js');
    const callbackHandler = require(path.join(callbackDirectory, file));

    if (typeof callbackHandler !== 'function') {
      console.warn(`Skipping callback file ${file}: export is not a function`);
      return;
    }

    STS.action(callbackName, callbackHandler);
  });

  console.log(`✓ Loaded ${callbackFiles.length} callback handler(s)`);
};
