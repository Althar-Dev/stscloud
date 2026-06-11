const fs = require('fs');
const path = require('path');

module.exports = (STS) => {
  const commandDirectory = path.join(__dirname, 'commands');

  if (!fs.existsSync(commandDirectory)) {
    console.warn('Command directory not found:', commandDirectory);
    return;
  }

  const commandFiles = fs.readdirSync(commandDirectory).filter((file) => file.endsWith('.js'));

  commandFiles.forEach((file) => {
    const commandName = path.basename(file, '.js');
    const commandHandler = require(path.join(commandDirectory, file));

    if (typeof commandHandler !== 'function') {
      console.warn(`Skipping command file ${file}: export is not a function`);
      return;
    }

    STS.command(commandName, commandHandler);
  });

  console.log(`✓ Loaded ${commandFiles.length} command handler(s)`);
};
