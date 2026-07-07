const path = require('path');
const readline = require('readline');
const pino = require('pino');
const { default: makeWASocket, useMultiFileAuthState, fetchLatestBaileysVersion } = require('@starvale-sdk/wa-socket');
const handleMessage = require('./src/handlers/message');
const { readJson } = require('./src/utils/storage');

function promptQuestion(question) {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      rl.close();
      resolve(answer);
    });
  });
}

if (!makeWASocket || !useMultiFileAuthState) {
  console.error('Paket @starvale-sdk/wa-socket tidak terdeteksi dengan baik. Periksa instalasi dependency.');
  process.exit(1);
}

async function startBot() {
  const config = readJson('config.json', {
    botName: 'AltharDev Studio'
  });

  const { state, saveCreds } = await useMultiFileAuthState(path.join(__dirname, 'auth'));
  const { version } = await fetchLatestBaileysVersion();
  let pairingRequested = false;
  let reconnectAttempts = 0;

  const sock = makeWASocket({
    logger: pino({ level: 'silent' }),
    auth: state,
    printQRInTerminal: false,
    version,
    browser: ['Ubuntu', 'Chrome', '20.0.04']
  });

  sock.ev.on('creds.update', saveCreds);

  const requestPairingCodeOnce = async () => {
    if (pairingRequested || sock.authState?.creds?.registered || state?.creds?.registered) return;

    pairingRequested = true;
    const phoneNumber = await promptQuestion('Silahkan masukin nomor Whatsapp (62xxx):\n');
    const normalizedPhoneNumber = String(phoneNumber || '').trim();

    if (!normalizedPhoneNumber) {
      console.log('Nomor WhatsApp belum diisi.');
      return;
    }

    console.log(`Meminta pairing code untuk ${normalizedPhoneNumber}...`);

    try {
      const code = await sock.requestPairingCode(normalizedPhoneNumber, 'STARVALE');
      console.log('Kode Pairing:', code);
      console.log('Buka WhatsApp > Perangkat tertaut > Tautkan perangkat > Masukkan kode ini.');
    } catch (error) {
      console.error('Gagal meminta pairing code:', error);
    }
  };

  setTimeout(requestPairingCodeOnce, 1500);

  sock.ev.on('connection.update', async (update) => {
    const { connection, lastDisconnect } = update;

    if (connection === 'open') {
      console.log(`Bot ${config.botName} terhubung.`);
    }

    if (connection === 'close') {
      const statusCode = lastDisconnect?.error?.output?.statusCode;
      const shouldReconnect = statusCode !== 401 && statusCode !== 440;
      console.log('Koneksi tertutup. Menghubungkan ulang...', shouldReconnect, 'status:', statusCode);
      if (shouldReconnect && reconnectAttempts < 3) {
        reconnectAttempts += 1;
        setTimeout(() => startBot(), 5000);
      }
    }
  });

  sock.ev.on('messages.upsert', async ({ messages }) => {
    for (const msg of messages) {
      if (!msg.message || msg.key?.fromMe) continue;
      await handleMessage(sock, msg, config);
    }
  });
}

startBot().catch((err) => {
  console.error('Gagal menjalankan bot:', err);
  process.exit(1);
});
