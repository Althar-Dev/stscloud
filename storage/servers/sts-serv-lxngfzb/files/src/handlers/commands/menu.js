async function menuHandler(sock, msg, config = {}) {
  const botName = config.botName || 'Nokos';
  return {
    type: 'list',
    text: `Halo! Saya ${botName}.\n\nPilih menu yang Anda butuhkan:`,
    footer: botName,
    title: 'Menu Utama',
    buttonText: 'Buka Menu',
    sections: [{
      title: 'Layanan',
      rows: [
        { title: 'Help', rowId: 'help', description: 'Lihat bantuan bot' },
        { title: 'Menu', rowId: 'menu', description: 'Tampilkan menu utama' }
      ]
    }]
  };
}

module.exports = menuHandler;
