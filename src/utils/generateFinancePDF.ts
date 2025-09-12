// src/utils/generateFinancePDF.ts
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { registerTHSarabun } from '../utils/pdfFonts';
const authen = JSON.parse(localStorage.getItem("authen") || "{}");
const branchName = authen?.Info?.[0]?.BranchNameLogin || '-';

export function generateFinancePDF(customerData: any, tableData: any[]) {
  if (!customerData) throw new Error('กรุณาค้นหาลูกค้าก่อนพิมพ์ใบเสร็จ');
  if (tableData.length === 0) throw new Error('ไม่มีรายการสินค้า');

  const doc = new jsPDF();

  if (typeof registerTHSarabun === "function") {
    registerTHSarabun(doc);
  }

  // ฟังก์ชันวาด header + page info (เดิม)
  function drawHeader(pageNumber: number) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('th-TH');
    const timeStr = now.toLocaleTimeString('th-TH');

    doc.setFont('THSarabunNew', 'extrabold');
    doc.setFontSize(22);
    doc.text('ใบเสร็จรับเงิน', 105, 18, { align: 'center' });

    doc.setFont('THSarabunNew', 'normal');
    doc.setFontSize(12);
    doc.text(`วันที่ออก: ${dateStr} เวลา: ${timeStr}`, 200, 12, { align: 'right' });
    doc.text(`สาขา: ${branchName}`, 200, 18, { align: 'right' });

    doc.setFontSize(16);
    const yHeader = 30;
    doc.text(`OPD: ${customerData.CustomerID || '-'}`, 14, yHeader);
    doc.text(
      `ชื่อ-สกุล: ${customerData.Name || '-'} (${customerData.MemTypeName || '-'} : EXP: ${customerData.ExpirationDate || '-'})`,
      45,
      yHeader
    );

    return yHeader + 4; // y สำหรับ table เริ่ม
  }

  const tableStartY = drawHeader(1);

  // Table ข้อมูล
  const headers = [
    { content: 'ลำดับ', styles: { halign: 'center' as const } },
    { content: 'ชื่อสินค้า', styles: { halign: 'center' as const } },
    { content: 'จำนวน', styles: { halign: 'center' as const } },
    { content: 'ราคา/หน่วย', styles: { halign: 'center' as const } },
    { content: 'ส่วนลด (%)', styles: { halign: 'center' as const } },
    { content: 'ราคารวม', styles: { halign: 'center' as const } },
  ];
  const data = tableData.map((item, idx) => [
    idx + 1,
    item.name,
    item.quantity,
    item.price.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    item.discount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
    item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 }),
  ]);

  autoTable(doc, {
    head: [headers],
    body: data,
    startY: tableStartY,
    theme: 'grid',
    styles: { font: 'THSarabunNew', fontSize: 16, textColor: [0, 0, 0], lineColor: [0, 0, 0], lineWidth: 0.1 },
    headStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
    bodyStyles: { fillColor: [255, 255, 255] },
    columnStyles: { 0: { halign: 'center', cellWidth: 16 }, 1: { cellWidth: 60 }, 2: { halign: 'center', cellWidth: 20 }, 3: { halign: 'right', cellWidth: 28 }, 4: { halign: 'right', cellWidth: 28 }, 5: { halign: 'right', cellWidth: 32 } },
    margin: { top: tableStartY, left: 14, right: 14, bottom: 20 },
    pageBreak: 'auto',
    didDrawPage: function (data) {
        // header เดิม
        drawHeader(data.pageNumber);
        // **เพิ่ม page number บนขวา แบบลอย**
        const pageCount = doc.getNumberOfPages();
        doc.setFont('THSarabunNew', 'normal');
        doc.setFontSize(12);
        doc.text(`${data.pageNumber}/${pageCount}`, doc.internal.pageSize.getWidth() - 0, 10, { align: 'right' });

    }
  });

  // Total
  const total = tableData.reduce((sum, item) => sum + item.amount, 0);
  const finalY = (doc as any).lastAutoTable?.finalY || tableStartY + 30;
  const pageHeight = doc.internal.pageSize.getHeight();
  const spaceForTotal = 20;

  if (finalY + 12 + spaceForTotal > pageHeight - 10) {
    doc.addPage();
    drawHeader(doc.getNumberOfPages());
  }

  doc.setFontSize(18);
  doc.setFont('THSarabunNew', 'bold');
  doc.text(
    `รวมเป็นเงิน: ${total.toLocaleString(undefined, { minimumFractionDigits: 2 })} บาท`,
    200,
    Math.min(finalY + 12, pageHeight - 20),
    { align: 'right' }
  );

  return doc;
}
