import { readFile, writeFile, mkdir, unlink } from 'fs/promises';
import { fileURLToPath } from 'url';
import { Markup } from 'telegraf';

const testimoniPath = new URL('../database/testimoni.json', import.meta.url);
const testimoniDir = new URL('../database/testimoni/', import.meta.url);

const DEFAULT_TESTIMONI = [];
const MIME_TO_EXT = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

function normalizeTestimoniData(data) {
  return Array.isArray(data) ? data : DEFAULT_TESTIMONI;
}

export async function ensureTestimoniDir() {
  await mkdir(testimoniDir, { recursive: true });
}

export async function loadTestimoniData() {
  try {
    const raw = await readFile(testimoniPath, 'utf8');
    if (!raw.trim()) {
      return DEFAULT_TESTIMONI;
    }
    const parsed = JSON.parse(raw);
    return normalizeTestimoniData(parsed);
  } catch (error) {
    return DEFAULT_TESTIMONI;
  }
}

export async function saveTestimoniData(data) {
  await writeFile(testimoniPath, JSON.stringify(data, null, 2), 'utf8');
}

const PER_PAGE = 6;

export function getTestimoniPage(testimoni = [], page = 1) {
  const totalPages = Math.max(1, Math.ceil(testimoni.length / PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  return {
    items: testimoni.slice(start, start + PER_PAGE),
    page: currentPage,
    totalPages,
  };
}

export function buildTestimoniKeyboard(testimoni = [], page = 1) {
  const { items, page: currentPage, totalPages } = getTestimoniPage(testimoni, page);
  const buttons = items.map((item) => {
    const caption = item.caption ? item.caption.slice(0, 30) : 'Tanpa keterangan';
    return [Markup.button.callback(caption, `delete:testimoni:${item.id}`)];
  });

  const navButtons = [];
  if (currentPage > 1) {
    navButtons.push(Markup.button.callback('Prev', `delete:testimoni_page:${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    navButtons.push(Markup.button.callback('Next', `delete:testimoni_page:${currentPage + 1}`));
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  buttons.push([Markup.button.callback('Kembali', 'delete:back')]);
  return Markup.inlineKeyboard(buttons);
}

export async function deleteTestimoni(testimoniId) {
  const data = await loadTestimoniData();
  const index = data.findIndex((item) => item.id === testimoniId);
  if (index === -1) {
    return null;
  }

  const [deleted] = data.splice(index, 1);
  if (deleted.localPath) {
    try {
      await unlink(deleted.localPath);
    } catch { 
    }
  }

  await saveTestimoniData(data);
  return deleted;
}

export async function saveTestimoniPhoto(fileUrl, testimoniId) {
  await ensureTestimoniDir();
  const response = await fetch(fileUrl);
  if (!response.ok) {
    throw new Error(`Gagal mengunduh foto testimoni: ${response.statusText}`);
  }

  const contentType = response.headers.get('content-type') || '';
  const ext = MIME_TO_EXT[contentType.split(';')[0]] || 'jpg';
  const fileName = `${testimoniId}.${ext}`;
  const filePath = new URL(fileName, testimoniDir);
  const buffer = Buffer.from(await response.arrayBuffer());
  await writeFile(filePath, buffer);
  return fileURLToPath(filePath);
}

export async function addTestimoni(userId, fileId, localPath, caption = '') {
  const data = await loadTestimoniData();
  const testimonial = {
    id: Date.now().toString(),
    userId,
    fileId,
    localPath,
    caption,
    createdAt: new Date().toISOString(),
  };
  data.push(testimonial);
  await saveTestimoniData(data);
  return testimonial;
}
