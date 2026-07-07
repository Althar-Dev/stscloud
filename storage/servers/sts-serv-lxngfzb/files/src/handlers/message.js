const fs = require('fs');
const path = require('path');
const { saveUserData } = require('../utils/storage');

const commandsDir = path.join(__dirname, 'commands');
const callbackDir = path.join(__dirname, 'callback');
const commandHandlers = {};
const callbackHandlers = {};

for (const file of fs.readdirSync(commandsDir)) {
  if (!file.endsWith('.js')) continue;
  const name = path.basename(file, '.js');
  const handlerPath = path.join(commandsDir, file);
  try {
    commandHandlers[name] = require(handlerPath);
  } catch (error) {
    console.error(`Gagal memuat command handler ${file}:`, error.message);
  }
}

for (const file of fs.readdirSync(callbackDir)) {
  if (!file.endsWith('.js')) continue;
  const name = path.basename(file, '.js');
  const handlerPath = path.join(callbackDir, file);
  try {
    callbackHandlers[name] = require(handlerPath);
  } catch (error) {
    console.error(`Gagal memuat callback handler ${file}:`, error.message);
  }
}

async function sendText(sock, jid, text) {
  if (!sock || !jid || !text) return;
  await sock.sendMessage(jid, { text });
}

async function sendResponse(sock, jid, response, config = {}) {
  if (!sock || !jid || !response) return;

  if (typeof response === 'string') {
    await sendText(sock, jid, response);
    return;
  }

  if (response && response.type === 'list') {
    await sock.sendMessage(jid, {
      text: response.text,
      footer: response.footer || config.botName || 'AltharDev',
      title: response.title || 'Menu',
      buttonText: response.buttonText || 'Buka Menu',
      sections: response.sections || []
    });
    return;
  }

  if (response && response.text) {
    await sendText(sock, jid, response.text);
  }
}

function getCommandName(text) {
  const trimmed = String(text || '').trim();
  if (!trimmed) return '';
  return trimmed.toLowerCase();
}

function getSelectedRowId(msg) {
  return msg?.message?.listResponseMessage?.singleSelectReply?.selectedRowId
    || msg?.message?.buttonsResponseMessage?.selectedButtonId
    || msg?.message?.buttonResponseMessage?.selectedButtonId
    || '';
}

async function handleMessage(sock, msg, config = {}) {
  const jid = msg.key?.remoteJid;
  if (!jid) return;

  const senderId = String(jid || '').split('@')[0] || '';
  const senderName = msg.pushName || msg.message?.conversation?.split(' ')[0] || '';
  if (senderId) {
    saveUserData(senderId, {
      phoneNumber: senderId,
      username: senderName,
      name: senderName,
      jid,
      lastSeenAt: new Date().toISOString()
    });
  }

  const callbackId = getSelectedRowId(msg);
  if (callbackId && callbackHandlers[callbackId]) {
    const response = await callbackHandlers[callbackId](sock, msg, config);
    await sendResponse(sock, jid, response, config);
    return;
  }

  const body = msg.message?.conversation
    || msg.message?.extendedTextMessage?.text
    || '';

  if (!body.trim()) return;

  const text = body.trim();
  const commandName = getCommandName(text);

  if (commandHandlers[commandName]) {
    const response = await commandHandlers[commandName](sock, msg, config);
    await sendResponse(sock, jid, response, config);
    return;
  }
}

module.exports = handleMessage;
