export function formatCurrency(value) {
  return `Rs. ${Number(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}`;
}
