import jsPDF from 'jspdf';
import { M5U, User } from '@/types/admin';

const months = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'
];

const formatDate = (dateString: string) => {
  if (!dateString) return '-';
  const parts = dateString.split('-');
  if (parts.length === 3) {
    return `${parts[2]}-${parts[1]}-${parts[0]}`;
  }
  return dateString;
};

const formatIndonesianDate = (date: Date) => {
  const day = date.getDate();
  const month = months[date.getMonth()];
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
};

export const generateM5UPDF = (items: M5U[], currentUser: User | null, bulan: string | undefined, tahun: string | undefined) => {
  const doc = new jsPDF();
  
  // Set font size and styles
  doc.setFontSize(16);
  doc.setFont(undefined, 'bold');
  doc.text('Musyawaroh 5 Unsur (M5U)', 105, 20, { align: 'center' });
  
  doc.setFontSize(12);
  doc.setFont(undefined, 'normal');
  doc.text(`Kelompok: ${currentUser?.kelompok || 'Kelompok Contoh'}`, 105, 30, { align: 'center' });
  doc.text(`Bulan: ${bulan} ${tahun}`, 105, 37, { align: 'center' });
  
  // Add content
  let yPos = 50;
  items.forEach((item, index) => {
    if (yPos > 250) { // Create new page if needed
      doc.addPage();
      yPos = 20;
    }
    
    doc.setFont(undefined, 'bold');
    doc.text(`${index + 1}. ${item.agenda}`, 20, yPos);
    yPos += 7;
    
    doc.setFont(undefined, 'normal');
    doc.text(`Hasil: ${item.hasil || '-'}`, 25, yPos);
    yPos += 7;
    
    doc.text(`Tanggal Pelaksanaan: ${formatDate(item.waktuPelaksanaan)}`, 25, yPos);
    yPos += 7;
    
    doc.text(`Penanggung Jawab: ${item.pj}`, 25, yPos);
    yPos += 12;
  });
  
  // Add signature section
  yPos += 10;
  const signatureY = yPos > 250 ? 250 : yPos;
  
  doc.text(`Kutim, ${formatIndonesianDate(new Date())}`, 140, signatureY);
  doc.text('PJP Kelompok', 140, signatureY + 30);
  doc.line(130, signatureY + 25, 180, signatureY + 25); // Signature line
  
  doc.text('Pembina Kelompok', 40, signatureY + 30);
  doc.line(30, signatureY + 25, 80, signatureY + 25); // Signature line
  
  // Save the PDF
  doc.save(`M5U_${currentUser?.kelompok || 'Kelompok'}_${bulan}_${tahun}.pdf`);
};
