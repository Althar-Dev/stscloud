const textHandler = require('./messages/text_handler');

module.exports = (STS) => {
  STS.on('text', textHandler);

  console.log('✓ Message handlers loaded');
};
