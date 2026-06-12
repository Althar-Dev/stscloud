import { readFile, writeFile } from 'fs/promises';
import { Markup } from 'telegraf';
import { althar } from '../config/config.js';

const produkPath = new URL('../database/produk.json', import.meta.url);
const PER_PAGE = 6;

const DEFAULT_DATA = {
  categories: [],
  products: {},
};

function normalizeProdukData(data) {
  return {
    categories: Array.isArray(data?.categories) ? data.categories : [],
    products: typeof data?.products === 'object' && data.products !== null ? data.products : {},
  };
}

function generateShortId() {
  return Math.random().toString(36).slice(2, 10);
}

export async function loadProdukData() {
  try {
    const raw = await readFile(produkPath, 'utf8');
    if (!raw.trim()) {
      return normalizeProdukData(DEFAULT_DATA);
    }
    const parsed = JSON.parse(raw);
    return normalizeProdukData(parsed);
  } catch (error) {
    return normalizeProdukData(DEFAULT_DATA);
  }
}

export async function saveProdukData(data) {
  await writeFile(produkPath, JSON.stringify(data, null, 2), 'utf8');
}

export function isAdmin(userId) {
  return userId && (userId === althar.ownerId || althar.admins.includes(userId));
}

export function getCategoriesPage(data, page = 1) {
  const categories = data.categories || [];
  const totalPages = Math.max(1, Math.ceil(categories.length / PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  const pageCategories = categories.slice(start, start + PER_PAGE);
  return {
    categories: pageCategories,
    page: currentPage,
    totalPages,
  };
}

export function getCategoryById(data, id) {
  return (data.categories || []).find((category) => category.id === id);
}

export function buildAddMainKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Category', 'add:category')],
    [Markup.button.callback('Product', 'add:product')],
    [Markup.button.callback('Testimoni', 'add:testimoni')],
  ]);
}

export function buildSetMainKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Category', 'set:category')],
    [Markup.button.callback('Product', 'set:product')],
  ]);
}

export function buildDeleteMainKeyboard() {
  return Markup.inlineKeyboard([
    [Markup.button.callback('Category', 'delete:category')],
    [Markup.button.callback('Product', 'delete:product')],
    [Markup.button.callback('Testimoni', 'delete:testimoni')],
  ]);
}

export function buildDeleteProductCategoryKeyboard(data, page = 1) {
  const { categories, totalPages, page: currentPage } = getCategoriesPage(data, page);
  const buttons = categories.map((category) => [Markup.button.callback(category.name, `delete:product_cat:${category.id}`)]);

  const navButtons = [];
  if (currentPage > 1) {
    navButtons.push(Markup.button.callback('Prev', `delete:product_page:${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    navButtons.push(Markup.button.callback('Next', `delete:product_page:${currentPage + 1}`));
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  buttons.push([Markup.button.callback('Kembali', 'delete:back')]);
  return Markup.inlineKeyboard(buttons);
}

export function buildContinueKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('Lanjut', 'add:back')]]);
}

export function buildSetContinueKeyboard() {
  return Markup.inlineKeyboard([[Markup.button.callback('Lanjut', 'set:back')]]);
}

export function buildCategoryKeyboard(data, page = 1, prefix = 'add') {
  const { categories, totalPages, page: currentPage } = getCategoriesPage(data, page);
  const buttons = categories.map((category) => [Markup.button.callback(category.name, `${prefix}:category:${category.id}`)]);

  const navButtons = [];
  if (currentPage > 1) {
    navButtons.push(Markup.button.callback('Prev', `${prefix}:category_page:${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    navButtons.push(Markup.button.callback('Next', `${prefix}:category_page:${currentPage + 1}`));
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  buttons.push([Markup.button.callback('Kembali', `${prefix}:back`)]);
  return Markup.inlineKeyboard(buttons);
}

export function buildMenuCategoryKeyboard(data, page = 1) {
  const { categories, totalPages, page: currentPage } = getCategoriesPage(data, page);
  const buttons = categories.map((category) => [Markup.button.callback(category.name, `menu:category:${category.id}`)]);

  const navButtons = [];
  if (currentPage > 1) {
    navButtons.push(Markup.button.callback('Prev', `menu:category_page:${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    navButtons.push(Markup.button.callback('Next', `menu:category_page:${currentPage + 1}`));
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  buttons.push([Markup.button.callback('Home', 'back_to_start')]);
  return Markup.inlineKeyboard(buttons);
}

export function buildMenuProductKeyboard(data, categoryId, page = 1) {
  const { products, totalPages, page: currentPage, startIndex } = getProductsPage(data, categoryId, page);
  const rows = [];
  const columns = 3;

  for (let index = 0; index < products.length; index += columns) {
    rows.push(
      products.slice(index, index + columns).map((product, subIndex) =>
        Markup.button.callback(
          String(startIndex + index + subIndex + 1),
          `menu:product:${categoryId}:${startIndex + index + subIndex}`
        )
      )
    );
  }

  const navButtons = [];
  if (currentPage > 1) {
    navButtons.push(Markup.button.callback('Prev', `menu:product_page:${categoryId}:${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    navButtons.push(Markup.button.callback('Next', `menu:product_page:${categoryId}:${currentPage + 1}`));
  }
  if (navButtons.length > 0) {
    rows.push(navButtons);
  }

  rows.push([Markup.button.callback('Kembali', `menu:back`), Markup.button.callback('Home', 'back_to_start')]);
  return Markup.inlineKeyboard(rows);
}
 
export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0);
}

export function getMenuProductText(category, products, startIndex = 0) {
  if (!products || products.length === 0) {
    return `Tidak ada produk pada category ${category.name}.`;
  }

  const lines = products.map((product, index) => {
    const price = formatCurrency(product.price);
    const stock = product.stock ?? 0;
    const desk = product.desk?.trim() ? product.desk : '-';
    return `${startIndex + index + 1}. ${product.name}\n   ${desk}\n   Stok: ${stock} | Harga: ${price}`;
  });

  return `<b>Product Category</b> ${category.name}:\n\n<blockquote>${lines.join('\n\n')}</blockquote>`;
}

export function buildProductCategoryKeyboard(data, page = 1) {
  const { categories, totalPages, page: currentPage } = getCategoriesPage(data, page);
  const buttons = categories.map((category) => [Markup.button.callback(category.name, `add:product_cat:${category.id}`)]);

  const navButtons = [];
  if (currentPage > 1) {
    navButtons.push(Markup.button.callback('Prev', `add:product_page:${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    navButtons.push(Markup.button.callback('Next', `add:product_page:${currentPage + 1}`));
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  buttons.push([Markup.button.callback('Kembali', 'add:back')]);
  return Markup.inlineKeyboard(buttons);
}

export async function addCategory(name) {
  const data = await loadProdukData();
  data.categories = data.categories || [];
  const categoryId = generateShortId();
  data.categories.push({ id: categoryId, name });
  await saveProdukData(data);
  return { categoryId, name };
}

export async function addProduct(categoryId, name) {
  const data = await loadProdukData();
  data.categories = data.categories || [];
  data.products = data.products || {};
  if (!data.products[categoryId]) {
    data.products[categoryId] = [];
  }
  const productId = generateShortId();
  data.products[categoryId].push({ id: productId, name, desk: '', stock: 0, price: 0, link: '' });
  await saveProdukData(data);
  return { categoryId, name };
}

export async function deleteCategory(categoryId) {
  const data = await loadProdukData();
  const categoryIndex = data.categories.findIndex((category) => category.id === categoryId);
  if (categoryIndex === -1) {
    return null;
  }

  const deleted = data.categories.splice(categoryIndex, 1)[0];
  if (data.products && data.products[categoryId]) {
    delete data.products[categoryId];
  }

  await saveProdukData(data);
  return deleted;
}

export async function deleteProduct(categoryId, productIndex) {
  const data = await loadProdukData();
  const products = data.products?.[categoryId] || [];
  const index = Number(productIndex);
  if (index < 0 || index >= products.length) {
    return null;
  }

  const deleted = products.splice(index, 1)[0];
  await saveProdukData(data);
  return deleted;
}

export function getProductsPage(data, categoryId, page = 1) {
  const products = (data.products?.[categoryId] || []);
  const totalPages = Math.max(1, Math.ceil(products.length / PER_PAGE));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * PER_PAGE;
  return {
    products: products.slice(start, start + PER_PAGE),
    page: currentPage,
    totalPages,
    startIndex: start,
  };
}

export function getProductById(data, categoryId, productId) {
  return (data.products?.[categoryId] || []).find((product) => product.id === productId);
}

export function getProductByIndex(data, categoryId, productIndex) {
  const products = data.products?.[categoryId] || [];
  return products[Number(productIndex)];
}

export async function updateProductFieldByIndex(categoryId, productIndex, field, value) {
  const data = await loadProdukData();
  const products = data.products?.[categoryId] || [];
  const product = products[Number(productIndex)];
  if (!product) {
    return null;
  }

  if (field === 'id') {
    product.id = value;
  } else if (field === 'desk') {
    product.desk = value;
  } else if (field === 'stock') {
    product.stock = Number(value) || 0;
  } else if (field === 'price') {
    product.price = Number(value) || 0;
  } else if (field === 'Data') {
    product.link = value;
  }

  await saveProdukData(data);
  return product;
}

export async function updateCategoryName(categoryId, name) {
  const data = await loadProdukData();
  const category = getCategoryById(data, categoryId);
  if (!category) {
    return null;
  }
  category.name = name;
  await saveProdukData(data);
  return category;
}

export function buildProductKeyboard(data, categoryId, page = 1, prefix = 'set', backCallback) {
  const { products, totalPages, page: currentPage, startIndex } = getProductsPage(data, categoryId, page);
  const buttons = products.map((product, index) => [Markup.button.callback(product.name, `${prefix}:product:${categoryId}:${startIndex + index}`)]);

  const navButtons = [];
  if (currentPage > 1) {
    navButtons.push(Markup.button.callback('Prev', `${prefix}:product_page:${categoryId}:${currentPage - 1}`));
  }
  if (currentPage < totalPages) {
    navButtons.push(Markup.button.callback('Next', `${prefix}:product_page:${categoryId}:${currentPage + 1}`));
  }
  if (navButtons.length > 0) {
    buttons.push(navButtons);
  }

  buttons.push([Markup.button.callback('Kembali', backCallback ?? `${prefix}:back`)]);
  return Markup.inlineKeyboard(buttons);
}

export function buildProductFieldKeyboard(categoryId, productIndex) {
  return Markup.inlineKeyboard([
    [Markup.button.callback('ID', `set:field:id:${categoryId}:${productIndex}`)],
    [Markup.button.callback('Desk', `set:field:desk:${categoryId}:${productIndex}`)],
    [Markup.button.callback('Stock', `set:field:stock:${categoryId}:${productIndex}`)],
    [Markup.button.callback('Price', `set:field:price:${categoryId}:${productIndex}`)],
    [Markup.button.callback('Link', `set:field:link:${categoryId}:${productIndex}`)],
    [Markup.button.callback('Kembali', `set:back`)],
  ]);
}

export function hasCategories(data) {
  return Array.isArray(data.categories) && data.categories.length > 0;
}
