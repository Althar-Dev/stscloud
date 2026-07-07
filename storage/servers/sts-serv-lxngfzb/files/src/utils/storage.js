const fs = require('fs');
const path = require('path');

function getFilePath(fileName) {
  return path.join(__dirname, '..', '..', 'database', fileName);
}

function normalizeUsersStore(data) {
  if (Array.isArray(data)) return {};
  if (data && typeof data === 'object') return data;
  return {};
}

function readJson(fileName, fallback = {}) {
  const filePath = getFilePath(fileName);

  if (!fs.existsSync(filePath)) {
    writeJson(fileName, fallback);
    return fallback;
  }

  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const parsed = JSON.parse(raw);
    if (fileName === 'users.json') {
      return normalizeUsersStore(parsed);
    }
    return parsed;
  } catch (error) {
    console.warn(`Gagal membaca ${fileName}, menggunakan default.`, error.message);
    return fallback;
  }
}

function writeJson(fileName, data) {
  const filePath = getFilePath(fileName);
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const normalizedData = fileName === 'users.json' ? normalizeUsersStore(data) : data;
  fs.writeFileSync(filePath, JSON.stringify(normalizedData, null, 2));
}

function getUserData(uid, fallback = {}) {
  const users = readJson('users.json', {});
  return users[uid] || fallback;
}

function saveUserData(uid, data = {}) {
  if (!uid) return null;

  const users = readJson('users.json', {});
  users[uid] = {
    uid,
    ...users[uid],
    ...data,
    updatedAt: new Date().toISOString()
  };
  writeJson('users.json', users);
  return users[uid];
}

function updateUserData(uid, updates = {}) {
  const current = getUserData(uid, {});
  return saveUserData(uid, { ...current, ...updates });
}

function listUsers() {
  return readJson('users.json', {});
}

function deleteUserData(uid) {
  const users = readJson('users.json', {});
  if (users[uid]) {
    delete users[uid];
    writeJson('users.json', users);
    return true;
  }
  return false;
}

module.exports = {
  readJson,
  writeJson,
  getUserData,
  saveUserData,
  updateUserData,
  listUsers,
  deleteUserData
};
