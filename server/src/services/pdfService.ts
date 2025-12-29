/**
 * PDF Generation Service
 * Generates PDF invoices for bookings
 */
import PDFDocument from 'pdfkit';
import { Booking, Service, Provider, User } from '@prisma/client';

interface InvoiceData {
  invoiceNumber: string;
  date: Date;
  booking: Booking & {
    user: Pick<User, 'id' | 'name' | 'email' | 'phone'>;
    provider: Provider & { user: Pick<User, 'id' | 'name' | 'email'> };
    service: Service;
  };
  subtotal: number;
  platformFee: number;
  tax: number;
  total: number;
  providerEarnings: number;
}

export function generateInvoicePDF(invoiceData: InvoiceData): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ 
      margin: 50, 
      size: 'A4',
      bufferPages: true
    });

    const chunks: Buffer[] = [];
    
    doc.on('data', (chunk: Buffer) => chunks.push(chunk));
    doc.on('end', () => resolve(Buffer.concat(chunks)));
    doc.on('error', reject);

    // Colors
    const primaryColor = '#ff6b35';
    const grayDark = '#1f2937';
    const grayMedium = '#6b7280';
    const grayLight = '#9ca3af';

    // Helper function for formatting currency
    const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

    // Helper function for formatting date
    const formatDate = (date: Date) => {
      return new Date(date).toLocaleDateString('en-IN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    // Helper for short IDs
    const formatId = (id: string, prefix: string) => {
      return `${prefix}-${id.slice(-8).toUpperCase()}`;
    };

    // ----- HEADER -----
    // Logo/Brand
    doc.fillColor(primaryColor)
       .fontSize(24)
       .font('Helvetica-Bold')
       .text('MH26', 50, 50, { continued: true })
       .fillColor(grayDark)
       .text(' Services');

    doc.fillColor(grayMedium)
       .fontSize(10)
       .font('Helvetica')
       .text('Nanded, Maharashtra', 50, 80)
       .text('contact@mh26services.com', 50, 92);

    // Invoice Title - Right Side
    doc.fillColor(grayDark)
       .fontSize(28)
       .font('Helvetica-Bold')
       .text('INVOICE', 400, 50, { align: 'right' });

    doc.fillColor(grayMedium)
       .fontSize(10)
       .font('Helvetica')
       .text(`Invoice No: ${invoiceData.invoiceNumber}`, 400, 85, { align: 'right' })
       .text(`Date: ${formatDate(invoiceData.date)}`, 400, 97, { align: 'right' });

    // Status Badge
    const status = invoiceData.booking.status === 'COMPLETED' ? 'PAID' : invoiceData.booking.paymentStatus || 'PENDING';
    const statusColor = status === 'PAID' ? '#059669' : '#d97706';
    doc.fillColor(statusColor)
       .fontSize(9)
       .font('Helvetica-Bold')
       .text(status, 400, 115, { align: 'right' });

    // ----- BILLING INFO -----
    const billingY = 150;

    // Bill To
    doc.fillColor(grayDark)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Bill To:', 50, billingY);

    doc.fillColor(grayDark)
       .fontSize(10)
       .font('Helvetica')
       .text(invoiceData.booking.user.name || 'Customer', 50, billingY + 15);

    doc.fillColor(grayMedium)
       .fontSize(9)
       .text(`ID: ${formatId(invoiceData.booking.userId, 'CUS')}`, 50, billingY + 28)
       .text(invoiceData.booking.user.email || '', 50, billingY + 40);

    // Service Provider
    doc.fillColor(grayDark)
       .fontSize(11)
       .font('Helvetica-Bold')
       .text('Service Provider:', 350, billingY);

    doc.fillColor(grayDark)
       .fontSize(10)
       .font('Helvetica')
       .text(invoiceData.booking.provider.businessName || 'Provider', 350, billingY + 15);

    doc.fillColor(grayMedium)
       .fontSize(9)
       .text(`ID: ${formatId(invoiceData.booking.providerId, 'PRO')}`, 350, billingY + 28);

    // ----- SERVICE ADDRESS -----
    if (invoiceData.booking.address) {
      const addressY = billingY + 70;
      doc.fillColor(grayDark)
         .fontSize(11)
         .font('Helvetica-Bold')
         .text('Service Location:', 50, addressY);

      doc.fillColor(grayMedium)
         .fontSize(9)
         .font('Helvetica')
         .text(`${invoiceData.booking.address}`, 50, addressY + 15)
         .text(`${invoiceData.booking.city || ''} ${invoiceData.booking.pincode || ''}`, 50, addressY + 27);
    }

    // ----- LINE ITEMS TABLE -----
    const tableY = 280;

    // Table Header
    doc.fillColor(grayDark)
       .fontSize(10)
       .font('Helvetica-Bold');

    doc.text('Description', 50, tableY);
    doc.text('Qty', 350, tableY, { width: 50, align: 'center' });
    doc.text('Amount', 450, tableY, { align: 'right' });

    // Header line
    doc.strokeColor('#e5e7eb')
       .lineWidth(1)
       .moveTo(50, tableY + 15)
       .lineTo(545, tableY + 15)
       .stroke();

    // Table Row
    const rowY = tableY + 30;
    doc.fillColor(grayDark)
       .fontSize(10)
       .font('Helvetica')
       .text(invoiceData.booking.service.name || 'Service', 50, rowY);

    doc.fillColor(grayMedium)
       .fontSize(8)
       .text(`Service rendered on ${formatDate(invoiceData.booking.scheduledAt)}`, 50, rowY + 14);

    doc.fillColor(grayDark)
       .fontSize(10)
       .font('Helvetica')
       .text('1', 350, rowY, { width: 50, align: 'center' })
       .text(formatCurrency(invoiceData.subtotal), 450, rowY, { align: 'right' });

    // Row separator
    doc.strokeColor('#f3f4f6')
       .moveTo(50, rowY + 32)
       .lineTo(545, rowY + 32)
       .stroke();

    // ----- TOTALS -----
    const totalsX = 380;
    const totalsY = rowY + 60;

    // Subtotal
    doc.fillColor(grayMedium)
       .fontSize(10)
       .font('Helvetica')
       .text('Subtotal:', totalsX, totalsY);
    doc.fillColor(grayDark)
       .text(formatCurrency(invoiceData.subtotal), 450, totalsY, { align: 'right' });

    // GST
    doc.fillColor(grayMedium)
       .text('GST (8%):', totalsX, totalsY + 18);
    doc.fillColor(grayDark)
       .text(formatCurrency(invoiceData.tax), 450, totalsY + 18, { align: 'right' });

    // Total Line
    doc.strokeColor('#d1d5db')
       .lineWidth(1)
       .moveTo(totalsX, totalsY + 40)
       .lineTo(545, totalsY + 40)
       .stroke();

    // Total
    doc.fillColor(grayDark)
       .fontSize(12)
       .font('Helvetica-Bold')
       .text('Total:', totalsX, totalsY + 50);
    doc.fillColor(primaryColor)
       .text(formatCurrency(invoiceData.total), 450, totalsY + 50, { align: 'right' });

    // ----- PAYMENT INFO -----
    const paymentY = totalsY + 100;

    doc.strokeColor('#e5e7eb')
       .moveTo(50, paymentY - 10)
       .lineTo(545, paymentY - 10)
       .stroke();

    doc.fillColor(grayMedium)
       .fontSize(9)
       .font('Helvetica')
       .text(`Payment Method: Direct Payment to Provider`, 50, paymentY)
       .text(`Booking ID: ${invoiceData.booking.id}`, 50, paymentY + 12)
       .text(`Service Date: ${formatDate(invoiceData.booking.scheduledAt)}`, 50, paymentY + 24);

    // ----- FOOTER -----
    const footerY = 720;

    doc.strokeColor('#f3f4f6')
       .moveTo(50, footerY)
       .lineTo(545, footerY)
       .stroke();

    doc.fillColor(grayLight)
       .fontSize(8)
       .font('Helvetica')
       .text(
         'Thank you for using MH26 Services. For any queries, contact us at support@mh26services.com',
         50,
         footerY + 15,
         { align: 'center', width: 495 }
       )
       .text(
         'This is a computer generated invoice and does not require a signature.',
         50,
         footerY + 30,
         { align: 'center', width: 495 }
       );

    // Finalize PDF
    doc.end();
  });
}
