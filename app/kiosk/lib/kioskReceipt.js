import { formatCurrency } from "../../utils/currencyHelper";

export function downloadKioskReceipt({ confirmedData, business, cart = [], currencyCode }) {
  if (typeof window === "undefined") return;
  const lines = [];
  const bName = business?.businessName || confirmedData?.businessName || "Table Top Leo";
  lines.push(bName);
  if (business?.businessAddress) lines.push(business.businessAddress);
  if (business?.businessPhone) lines.push(business.businessPhone);
  lines.push("");
  lines.push(`Order #${confirmedData?.orderNumber || confirmedData?.orderId || ""}`);
  lines.push(`Date: ${new Date(confirmedData?.createdAt || Date.now()).toLocaleString()}`);
  if (confirmedData?.customerName) lines.push(`Customer: ${confirmedData.customerName}`);
  lines.push("-".repeat(32));

  cart.forEach((item) => {
    lines.push(`${item.qty} x ${item.name}`.padEnd(28) + formatCurrency(item.price * item.qty, currencyCode));
  });

  lines.push("-".repeat(32));
  if (confirmedData?.discountAmount) lines.push(`Discount: -${formatCurrency(confirmedData.discountAmount, currencyCode)}`);
  if (confirmedData?.taxAmount) lines.push(`${confirmedData?.taxSystem || "Tax"}: ${formatCurrency(confirmedData.taxAmount, currencyCode)}`);
  lines.push(`Total: ${formatCurrency(confirmedData?.grandTotal ?? 0, currencyCode)}`);
  lines.push("");
  lines.push("Thank you for your order!");

  const blob = new Blob([lines.join("\n")], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Receipt-${confirmedData?.orderNumber || confirmedData?.orderId || "order"}.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
