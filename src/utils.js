export function capitalizeTitle(str) {
  return str.toLowerCase().replace(/\b\w/g, char => char.toUpperCase());
}