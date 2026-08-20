export function toNumber(value: unknown) {
  const number = Number(value || 0);
  return Number.isFinite(number) ? number : 0;
}

export function centsToDollars(cents: number) {
  return Math.round(cents) / 100;
}