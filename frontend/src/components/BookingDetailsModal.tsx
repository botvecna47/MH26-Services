import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from './ui/dialog';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Calendar, MapPin, DollarSign, User, Building2, FileText, Download, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { useBooking, bookingsApi } from '../api/bookings';
import { Loader2 } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

interface BookingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string;
}

export default function BookingDetailsModal({ isOpen, onClose, bookingId }: BookingDetailsModalProps) {
  const { data: booking, isLoading, error } = useBooking(bookingId);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handleViewInvoice = async () => {
    setLoadingInvoice(true);
    try {
      if (!bookingId) {
        toast.error('Booking ID is missing');
        setLoadingInvoice(false);
        return;
      }

      const invoice = await bookingsApi.getInvoice(bookingId);
      
      if (!invoice) {
        toast.error('Invoice data not available');
        setLoadingInvoice(false);
        return;
      }

      // Open invoice in new window or download
      const invoiceWindow = window.open('', '_blank');
      if (invoiceWindow) {
        const invoiceData = invoice.booking || invoice;
        const invoiceHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoice.invoiceNumber || bookingId.slice(0, 8)}</title>
              <meta charset="UTF-8">
              <style>
                * {
                  margin: 0;
                  padding: 0;
                  box-sizing: border-box;
                }
                html, body {
                  width: 100%;
                  height: 100%;
                  font-family: Arial, sans-serif;
                  padding: 40px;
                  background-color: #ffffff !important;
                  color: #000000 !important;
                  line-height: 1.6;
                  overflow-x: auto;
                }
                .invoice-container {
                  max-width: 800px;
                  margin: 0 auto;
                  background-color: #ffffff !important;
                  padding: 30px;
                  border: 1px solid #e5e7eb;
                  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
                }
                .invoice-header {
                  border-bottom: 2px solid #000000;
                  padding-bottom: 20px;
                  margin-bottom: 30px;
                }
                .invoice-header h1 {
                  margin: 0;
                  color: #000000;
                  font-size: 28px;
                }
                .invoice-number {
                  margin-top: 10px;
                  color: #374151;
                  font-size: 14px;
                }
                .invoice-section {
                  margin-bottom: 30px;
                }
                .invoice-section h2 {
                  color: #000000;
                  font-size: 18px;
                  margin-bottom: 15px;
                  border-bottom: 1px solid #e5e7eb;
                  padding-bottom: 10px;
                }
                .invoice-row {
                  display: flex;
                  justify-content: space-between;
                  padding: 8px 0;
                  border-bottom: 1px solid #f3f4f6;
                }
                .invoice-row:last-child {
                  border-bottom: none;
                }
                .invoice-label {
                  color: #6b7280;
                  font-weight: 500;
                }
                .invoice-value {
                  color: #000000;
                  font-weight: 600;
                }
                .invoice-total {
                  margin-top: 20px;
                  padding-top: 20px;
                  border-top: 2px solid #000000;
                }
                .invoice-total .invoice-row {
                  font-size: 18px;
                  font-weight: bold;
                }
                table {
                  width: 100%;
                  border-collapse: collapse;
                  margin-top: 15px;
                }
                th, td {
                  padding: 12px;
                  text-align: left;
                  border-bottom: 1px solid #e5e7eb;
                }
                th {
                  background-color: #f9fafb;
                  color: #000000;
                  font-weight: 600;
                }
                td {
                  color: #374151;
                }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                <div class="invoice-header">
                  <h1>Invoice</h1>
                  <div class="invoice-number">Invoice Number: ${invoice.invoiceNumber || `INV-${bookingId.slice(0, 8).toUpperCase()}`}</div>
                  <div class="invoice-number">Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                </div>

                <div class="invoice-section">
                  <h2>Booking Information</h2>
                  <div class="invoice-row">
                    <span class="invoice-label">Booking ID:</span>
                    <span class="invoice-value">${invoiceData.id ? invoiceData.id.slice(0, 8).toUpperCase() : 'N/A'}</span>
                  </div>
                  <div class="invoice-row">
                    <span class="invoice-label">Service:</span>
                    <span class="invoice-value">${invoiceData.service?.title || 'N/A'}</span>
                  </div>
                  <div class="invoice-row">
                    <span class="invoice-label">Provider:</span>
                    <span class="invoice-value">${invoiceData.provider?.businessName || invoiceData.provider?.user?.name || 'N/A'}</span>
                  </div>
                  <div class="invoice-row">
                    <span class="invoice-label">Customer:</span>
                    <span class="invoice-value">${invoiceData.user?.name || 'N/A'}</span>
                  </div>
                  ${invoiceData.scheduledAt ? `
                  <div class="invoice-row">
                    <span class="invoice-label">Scheduled Date:</span>
                    <span class="invoice-value">${new Date(invoiceData.scheduledAt).toLocaleString()}</span>
                  </div>
                  ` : ''}
                </div>

                <div class="invoice-section">
                  <h2>Payment Details</h2>
                  <table>
                    <thead>
                      <tr>
                        <th>Description</th>
                        <th style="text-align: right;">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Service Amount</td>
                        <td style="text-align: right;">₹${Number(invoice.subtotal || invoiceData.totalAmount || 0).toFixed(2)}</td>
                      </tr>
                      ${invoice.tax ? `
                      <tr>
                        <td>GST (18%)</td>
                        <td style="text-align: right;">₹${Number(invoice.tax).toFixed(2)}</td>
                      </tr>
                      ` : ''}
                      ${invoice.platformFee ? `
                      <tr>
                        <td>Platform Fee (5%)</td>
                        <td style="text-align: right;">₹${Number(invoice.platformFee).toFixed(2)}</td>
                      </tr>
                      ` : ''}
                    </tbody>
                  </table>
                  <div class="invoice-total">
                    <div class="invoice-row">
                      <span class="invoice-label">Total Amount:</span>
                      <span class="invoice-value">₹${Number(invoice.total || invoice.subtotal || invoiceData.totalAmount || 0).toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </body>
          </html>
        `;
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
        
        // Ensure background is white after document is written
        setTimeout(() => {
          if (invoiceWindow.document && invoiceWindow.document.body) {
            invoiceWindow.document.body.style.backgroundColor = '#ffffff';
            invoiceWindow.document.body.style.color = '#000000';
            if (invoiceWindow.document.documentElement) {
              invoiceWindow.document.documentElement.style.backgroundColor = '#ffffff';
            }
          }
        }, 100);
      } else {
        toast.error('Failed to open invoice window. Please allow popups for this site.');
      }
    } catch (error: any) {
      console.error('Invoice error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Failed to load invoice';
      toast.error(errorMessage);
      
      // If booking not found, show more details
      if (error.response?.status === 404) {
        toast.error(`Booking with ID ${bookingId} not found. Please check the booking ID.`);
      }
    } finally {
      setLoadingInvoice(false);
    }
  };

  if (isLoading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Loading Booking Details</DialogTitle>
            <DialogDescription>Please wait while we fetch the booking information</DialogDescription>
          </DialogHeader>
          <div className="flex items-center justify-center p-8">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // Handle 403 Forbidden error
  if (error && (error as any)?.response?.status === 403) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Access Denied</DialogTitle>
            <DialogDescription>
              You don't have permission to view this booking. Only the customer who made the booking or the service provider can access it.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end mt-4">
            <Button onClick={onClose}>Close</Button>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  if (!isLoading && !booking) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="bg-white">
          <DialogHeader>
            <DialogTitle>Booking Not Found</DialogTitle>
            <DialogDescription>
              The requested booking could not be found
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-2">
            <p className="text-gray-600">The booking with ID <span className="font-mono text-sm">{bookingId}</span> could not be found.</p>
            {error && (
              <p className="text-sm text-red-600">
                Error: {error instanceof Error ? error.message : 'Unknown error occurred'}
              </p>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-100 text-green-700';
      case 'CONFIRMED':
        return 'bg-blue-100 text-blue-700';
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-700';
      case 'CANCELLED':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle>Booking Details</DialogTitle>
          <DialogDescription>
            View complete information about this booking
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Booking Header */}
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Booking #{booking.id.slice(0, 8)}</h3>
              <Badge className={getStatusColor(booking.status)}>
                {booking.status}
              </Badge>
            </div>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
              >
                {loadingInvoice ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : (
                  <FileText className="h-4 w-4 mr-2" />
                )}
                View Invoice
              </Button>
            </div>
          </div>

          {/* Service Info */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">Service</p>
              </div>
              {booking.service?.imageUrl && (
                <div className="mb-3">
                  <ImageWithFallback
                    src={booking.service.imageUrl}
                    alt={booking.service.title || 'Service'}
                    className="w-full h-32 rounded-lg object-cover"
                  />
                </div>
              )}
              <p className="font-medium text-gray-900">{booking.service?.title || 'N/A'}</p>
              {booking.service?.description && (
                <p className="text-sm text-gray-600 mt-1">{booking.service.description}</p>
              )}
              {booking.service?.durationMin && (
                <p className="text-xs text-gray-500 mt-1">Duration: {booking.service.durationMin} minutes</p>
              )}
            </div>

            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <User className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">Provider</p>
              </div>
              <p className="font-medium text-gray-900">
                {booking.provider?.businessName || booking.provider?.user?.name || 'N/A'}
              </p>
              <p className="text-sm text-gray-600 mt-1">
                {booking.provider?.user?.email || ''}
              </p>
            </div>
          </div>

          {/* Customer Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <User className="h-4 w-4 text-gray-500" />
              <p className="text-sm text-gray-600">Customer</p>
            </div>
            <p className="font-medium text-gray-900">{booking.user?.name || 'N/A'}</p>
            <p className="text-sm text-gray-600">{booking.user?.email || ''}</p>
            {booking.user?.phone && (
              <p className="text-sm text-gray-600">{booking.user.phone}</p>
            )}
          </div>

          {/* Schedule */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <p className="text-sm text-gray-600">Scheduled Date & Time</p>
              </div>
              <p className="font-medium text-gray-900">
                {booking.scheduledAt
                  ? format(new Date(booking.scheduledAt), 'PPP p')
                  : 'Not scheduled'}
              </p>
            </div>

            {booking.address && (
              <div className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <MapPin className="h-4 w-4 text-gray-500" />
                  <p className="text-sm text-gray-600">Service Address</p>
                </div>
                <p className="font-medium text-gray-900">{booking.address}</p>
              </div>
            )}
          </div>

          {/* Payment Info */}
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <DollarSign className="h-4 w-4 text-gray-500" />
              <p className="text-sm font-medium text-gray-600">Payment Details</p>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-600">Service Amount</span>
                <span className="font-medium text-gray-900">
                  ₹{Number(booking.totalAmount || 0).toFixed(2)}
                </span>
              </div>
              {booking.platformFee && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Platform Fee</span>
                  <span className="font-medium text-gray-900">
                    ₹{Number(booking.platformFee).toFixed(2)}
                  </span>
                </div>
              )}
              {booking.providerEarnings && (
                <div className="flex justify-between">
                  <span className="text-sm text-gray-600">Provider Earnings</span>
                  <span className="font-medium text-gray-900">
                    ₹{Number(booking.providerEarnings).toFixed(2)}
                  </span>
                </div>
              )}
              <div className="flex justify-between pt-2 border-t">
                <span className="font-medium text-gray-900">Total</span>
                <span className="font-bold text-gray-900">
                  ₹{Number(booking.totalAmount || 0).toFixed(2)}
                </span>
              </div>
            </div>
          </div>

          {/* Requirements */}
          {booking.requirements && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-medium text-gray-600 mb-2">Special Requirements</p>
              <p className="text-sm text-gray-900">{booking.requirements}</p>
            </div>
          )}

          {/* Timestamps */}
          <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600">
            <div>
              <p className="font-medium mb-1">Created</p>
              <p>{booking.createdAt ? format(new Date(booking.createdAt), 'PPP p') : 'N/A'}</p>
            </div>
            <div>
              <p className="font-medium mb-1">Last Updated</p>
              <p>{booking.updatedAt ? format(new Date(booking.updatedAt), 'PPP p') : 'N/A'}</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

