import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';

export const exportPDF = (title, headers, rows) => {
  const doc = new jsPDF();
  doc.setFontSize(18);
  doc.setTextColor(24, 95, 165);
  doc.text('CRO Technical Debt Assessment System', 14, 20);
  doc.setFontSize(13);
  doc.setTextColor(50, 50, 50);
  doc.text(title, 14, 30);
  doc.setFontSize(10);
  doc.setTextColor(130, 130, 130);
  doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 38);
  autoTable(doc, {
    startY: 44,
    head: [headers],
    body: rows,
    styles: { fontSize: 9 },
    headStyles: { fillColor: [24, 95, 165] },
    alternateRowStyles: { fillColor: [240, 246, 255] },
  });
  doc.save(`${title.replace(/\s+/g, '_')}_${Date.now()}.pdf`);
};

export const exportExcel = (title, headers, rows) => {
  const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, title.substring(0, 31));
  XLSX.writeFile(wb, `${title.replace(/\s+/g, '_')}_${Date.now()}.xlsx`);
};
