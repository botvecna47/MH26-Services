import { useNavigate, useParams } from 'react-router-dom';
import { useBooking, bookingsApi } from '../api/bookings';
import { useState } from 'react';
import { toast } from 'sonner';
import { Loader2, Calendar, MapPin, DollarSign, User, Building2, FileText, ArrowLeft, XCircle } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { format } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';

export default function BookingDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: booking, isLoading, error } = useBooking(id || '');
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  const handleBack = () => {
    navigate(-1);
  };

  const handleViewInvoice = async () => {
    setLoadingInvoice(true);
    try {
      if (!id) {
        toast.error('Booking ID is missing');
        setLoadingInvoice(false);
        return;
      }

      const invoice = await bookingsApi.getInvoice(id);
      
      if (!invoice) {
        toast.error('Invoice data not available');
        setLoadingInvoice(false);
        return;
      }

      // Open invoice in new window
      const invoiceWindow = window.open('', '_blank');
      if (invoiceWindow) {
        const invoiceData = invoice.booking || invoice;
        const invoiceHTML = `
          <!DOCTYPE html>
          <html>
            <head>
              <title>Invoice ${invoice.invoiceNumber || id.slice(0, 8)}</title>
              <meta charset="UTF-8">
              <style>
                * { box-sizing: border-box; }
                body { font-family: Arial, sans-serif; padding: 40px; background-color: white; color: black; }
                .invoice-container { max-width: 800px; margin: 0 auto; border: 1px solid #eee; padding: 30px; }
                .header { border-bottom: 2px solid black; padding-bottom: 20px; margin-bottom: 30px; }
                h1 { margin: 0; font-size: 28px; }
                .row { display: flex; justify-content: space-between; margin-bottom: 10px; }
                .label { color: #666; font-weight: bold; }
                table { width: 100%; border-collapse: collapse; margin-top: 20px; }
                th, td { padding: 12px; border-bottom: 1px solid #eee; text-align: left; }
                th { background: #f9f9f9; }
                .total { margin-top: 20px; border-top: 2px solid black; padding-top: 10px; font-weight: bold; font-size: 18px; }
              </style>
            </head>
            <body>
              <div class="invoice-container">
                <div class="header">
                  <h1>Invoice</h1>
                  <div>Number: ${invoice.invoiceNumber || `INV-${id.slice(0, 8).toUpperCase()}`}</div>
                  <div>Date: ${invoice.date ? new Date(invoice.date).toLocaleDateString() : new Date().toLocaleDateString()}</div>
                </div>
                <div class="section">
                  <h2>Details</h2>
                  <div class="row"><span class="label">Service:</span> <span>${invoiceData.service?.title || 'N/A'}</span></div>
                  <div class="row"><span class="label">Provider:</span> <span>${invoiceData.provider?.businessName || invoiceData.provider?.user?.name || 'N/A'}</span></div>
                  <div class="row"><span class="label">Customer:</span> <span>${invoiceData.user?.name || 'N/A'}</span></div>
                </div>
                <table>
                  <thead><tr><th>Description</th><th style="text-align:right">Amount</th></tr></thead>
                  <tbody>
                    <tr><td>Service Amount</td><td style="text-align:right">₹${Number(invoice.subtotal || invoiceData.totalAmount || 0).toFixed(2)}</td></tr>
                    ${invoice.tax ? `<tr><td>Tax</td><td style="text-align:right">₹${Number(invoice.tax).toFixed(2)}</td></tr>` : ''}
                    ${invoice.platformFee ? `<tr><td>Platform Fee</td><td style="text-align:right">₹${Number(invoice.platformFee).toFixed(2)}</td></tr>` : ''}
                  </tbody>
                </table>
                <div class="total row">
                  <span>Total</span>
                  <span>₹${Number(invoice.total || invoiceData.totalAmount || 0).toFixed(2)}</span>
                </div>
              </div>
            </body>
          </html>
        `;
        invoiceWindow.document.write(invoiceHTML);
        invoiceWindow.document.close();
      } else {
        toast.error('Popup blocked');
      }
    } catch (error: any) {
      console.error('Invoice error:', error);
      toast.error('Failed to load invoice');
    } finally {
      setLoadingInvoice(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'COMPLETED': return 'bg-green-100 text-green-700 hover:bg-green-100';
      case 'CONFIRMED': return 'bg-blue-100 text-blue-700 hover:bg-blue-100';
      case 'PENDING': return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-100';
      case 'CANCELLED': return 'bg-red-100 text-red-700 hover:bg-red-100';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gray-50 p-6 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="h-5 w-5" />
              Error Loading Booking
            </CardTitle>
            <CardDescription>
              {(error as any)?.response?.status === 403 
                ? "You don't have permission to view this booking."
                : "The booking could not be found or an error occurred."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={handleBack} className="w-full">
              Go Back
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header Navigation */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" onClick={handleBack} className="-ml-2">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">Booking Details</h1>
        </div>

        {/* Main Content Card */}
        <Card className="bg-white shadow-sm border-gray-200">
          <CardHeader className="border-b border-gray-100 pb-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle className="text-xl flex items-center gap-3">
                  Booking #{booking.id.slice(0, 8)}
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                </CardTitle>
                <CardDescription className="mt-1">
                  Created on {booking.createdAt ? format(new Date(booking.createdAt), 'PPP') : 'N/A'}
                </CardDescription>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleViewInvoice}
                disabled={loadingInvoice}
              >
                {loadingInvoice ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <FileText className="h-4 w-4 mr-2" />}
                View Invoice
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-6 space-y-8">
            {/* Service & Provider Section */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-gray-500" />
                  Service Details
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  {booking.service?.imageUrl && (
                    <ImageWithFallback
                      src={booking.service.imageUrl}
                      alt={booking.service.title}
                      className="w-full h-40 object-cover rounded-md mb-4"
                    />
                  )}
                  <p className="font-medium text-lg">{booking.service?.title}</p>
                  <p className="text-gray-600 text-sm mt-1">{booking.service?.description}</p>
                  {booking.service?.durationMin && (
                    <Badge variant="secondary" className="mt-2">
                      {booking.service.durationMin} mins
                    </Badge>
                  )}
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-gray-500" />
                    Provider Info
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{booking.provider?.businessName || booking.provider?.user?.name}</p>
                    <p className="text-sm text-gray-600">{booking.provider?.user?.email}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <User className="h-4 w-4 text-gray-500" />
                    Customer Info
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="font-medium">{booking.user?.name}</p>
                    <p className="text-sm text-gray-600">{booking.user?.email}</p>
                    {booking.user?.phone && <p className="text-sm text-gray-600">{booking.user.phone}</p>}
                  </div>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            {/* Schedule & Location */}
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  Schedule
                </h3>
                <div className="bg-gray-50 p-4 rounded-lg">
                  <p className="font-medium">
                    {booking.scheduledAt 
                      ? format(new Date(booking.scheduledAt), 'PPPP') 
                      : 'Not scheduled'}
                  </p>
                  <p className="text-gray-600">
                    {booking.scheduledAt 
                      ? format(new Date(booking.scheduledAt), 'p') 
                      : ''}
                  </p>
                </div>
              </div>

              {booking.address && (
                <div>
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    Location
                  </h3>
                  <div className="bg-gray-50 p-4 rounded-lg">
                    <p className="text-gray-900">{booking.address}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="border-t border-gray-100 my-6"></div>

            {/* Payment Summary */}
            <div>
              <h3 className="font-semibold text-gray-900 flex items-center gap-2 mb-3">
                <DollarSign className="h-4 w-4 text-gray-500" />
                Payment Summary
              </h3>
              <div className="bg-gray-50 p-6 rounded-lg max-w-md ml-auto">
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Service Cost</span>
                    <span className="font-medium">₹{Number(booking.totalAmount).toFixed(2)}</span>
                  </div>
                  {booking.platformFee && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Platform Fee</span>
                      <span>₹{Number(booking.platformFee).toFixed(2)}</span>
                    </div>
                  )}
                  <div className="border-t border-gray-200 pt-3 flex justify-between items-center">
                    <span className="font-bold text-gray-900">Total</span>
                    <span className="font-bold text-lg text-primary">
                      ₹{Number(booking.totalAmount).toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

          </CardContent>
        </Card>
      </div>
    </div>
  );
}
