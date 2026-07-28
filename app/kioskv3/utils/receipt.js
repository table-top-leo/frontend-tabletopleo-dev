// Generates a clean receipt PDF from real order data and triggers a download.
// Uses jsPDF directly (already a dependency in this project — see
// CustomerOrderSuccess.jsx) rather than needing a hidden HTML template.

export async function downloadReceipt(order) {
  try {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF({ unit: "pt", format: [320, 520 + (order.items?.length || 0) * 18] });

    const ink = "#16120d";
    const ember = "#b5652a";
    const muted = "#8a7d6d";
    let y = 34;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(15);
    doc.setTextColor(ink);
    doc.text(order.businessName || "TableTop Leo", 24, y);
    y += 18;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(muted);
    doc.text("TAX INVOICE", 24, y);
    y += 18;

    doc.setDrawColor(230, 224, 214);
    doc.line(24, y, 296, y);
    y += 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(11);
    doc.setTextColor(ink);
    doc.text(`Order #${order.number}`, 24, y);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(9);
    doc.setTextColor(muted);
    doc.text(order.date || new Date().toLocaleString(), 24, y + 13);
    y += 34;

    doc.setFontSize(9);
    doc.text(order.orderType === "dine-in" ? `Dine In · Table ${order.tableNumber ?? "-"}` : "Takeaway", 24, y);
    if (order.guest?.name) doc.text(order.guest.name, 24, y + 13);
    y += 34;

    doc.line(24, y, 296, y);
    y += 18;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(9);
    doc.setTextColor(ink);
    doc.text("ITEM", 24, y);
    doc.text("QTY", 210, y, { align: "right" });
    doc.text("AMOUNT", 296, y, { align: "right" });
    y += 12;

    doc.setDrawColor(230, 224, 214);
    doc.line(24, y, 296, y);
    y += 14;

    doc.setFont("helvetica", "normal");
    (order.items || []).forEach((item) => {
      doc.setTextColor(ink);
      doc.setFontSize(9.5);
      const name = item.name.length > 26 ? item.name.slice(0, 24) + "…" : item.name;
      doc.text(name, 24, y);
      doc.setTextColor(muted);
      doc.text(String(item.qty), 210, y, { align: "right" });
      doc.setTextColor(ink);
      doc.text(fmt(item.price * item.qty, order.currencySymbol), 296, y, { align: "right" });
      y += 17;
    });

    y += 4;
    doc.line(24, y, 296, y);
    y += 20;

    doc.setFont("helvetica", "bold");
    doc.setFontSize(12);
    doc.setTextColor(ember);
    doc.text("TOTAL", 24, y);
    doc.text(fmt(order.total, order.currencySymbol), 296, y, { align: "right" });
    y += 30;

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8.5);
    doc.setTextColor(muted);
    doc.text("Thank you for your order!", 24, y);
    doc.text("Powered by TableTop Leo", 24, y + 12);

    doc.save(`Invoice-${order.number || "order"}.pdf`);
  } catch (e) {
    console.error("Failed to generate receipt:", e);
  }
}

function fmt(amount, symbol = "") {
  return `${symbol}${Number(amount || 0).toFixed(2)}`;
}
