import { Markup } from 'telegraf';
import { althar } from '../config/config.js';

export function formatCurrency(amount) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(amount);
}

function getOrderPackages() {
  return Array.isArray(althar.orderPackages) ? althar.orderPackages : [];
}

export function findOrderPackage(packageId) {
  return getOrderPackages().find((pkg) => pkg.id === packageId);
}

export function sendOrderMenu() {
  const packages = getOrderPackages();
  if (packages.length === 0) {
    return Markup.inlineKeyboard([[Markup.button.callback('Home', 'back_to_start')]]);
  }

  const buttons = packages.map((pkg) => [
    Markup.button.callback(`${pkg.label} - ${formatCurrency(pkg.amount)}`, `order:${pkg.id}`),
  ]);

  buttons.push([Markup.button.callback('Home', 'back_to_start')]);

  return Markup.inlineKeyboard(buttons);
}

export function getOrderMessage(pkg) {
  return `Kamu memilih paket ${pkg.label}\n` +
    `Nominal: ${formatCurrency(pkg.amount)}\n` +
    `${pkg.description}\n\n` +
    `Silakan klik tombol di bawah untuk membuka Saweria dan memproses pesanan.`;
}

export function getOrderConfirmationKeyboard(pkg) {
  return Markup.inlineKeyboard([
    [Markup.button.url('Buka Saweria', althar.saweriaUrl)],
    [Markup.button.callback('Saya sudah bayar', `confirm:${pkg.id}`)],
    [Markup.button.callback('Home', 'back_to_start')],
  ]);
}
