// Currency utilities for TSUSwap (Russia - Rubles)

export const CURRENCY = {
  code: 'RUB',
  symbol: '₽',
  name: 'Russian Ruble',
  locale: 'ru-RU',
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'RUB',
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount)
}

export function formatPrice(amount: number): string {
  // Simple format: 1000 ₽
  return `${amount.toLocaleString('ru-RU')} ₽`
}







