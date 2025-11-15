import { useState } from 'react';
import { Download, Eye, Search, FileText, Loader2 } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '../context/UserContext';
import { useBookings, bookingsApi } from '../api/bookings';
import { toast } from 'sonner';
import { format } from 'date-fns';

export default function InvoicesPage() {
  const { user, isAuthenticated } = useUser();
  const [selectedInvoice, setSelectedInvoice] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [invoiceData, setInvoiceData] = useState<any>(null);
  const [loadingInvoice, setLoadingInvoice] = useState(false);

  // Fetch bookings - invoices are generated from completed bookings
  const { data: bookingsData, isLoading: bookingsLoading } = useBookings({ limit: 100 });

  if (!isAuthenticated || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-gray-900 mb-2">Please sign in</h2>
          <p className="text-gray-600">You need to be logged in to view invoices</p>
        </div>
      </div>
    );
  }

  // Filter completed bookings (which have invoices)
  const completedBookings = (bookingsData?.data || []).filter(
    (booking: any) => booking.status === 'COMPLETED'
  );

  // Transform bookings to invoice list format
  const invoices = completedBookings.map((booking: any) => ({
    id: booking.id,
    invoiceNumber: `INV-${booking.id.slice(0, 8).toUpperCase()}`,
    bookingId: booking.id,
    providerName: booking.provider?.businessName || booking.provider?.user?.name || 'Provider',
    providerId: booking.providerId,
    userName: booking.user?.name || 'Customer',
    userId: booking.userId,
    date: new Date(booking.completedAt || booking.updatedAt),
    total: booking.totalAmount || 0,
    paymentStatus: booking.paymentStatus || 'PAID',
  }));

  const filteredInvoices = invoices.filter((inv) =>
    inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inv.providerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleSelectInvoice = async (invoiceId: string) => {
    setSelectedInvoice(invoiceId);
    setLoadingInvoice(true);
    try {
      const invoice = await bookingsApi.getInvoice(invoiceId);
      setInvoiceData(invoice);
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to load invoice');
      setInvoiceData(null);
    } finally {
      setLoadingInvoice(false);
    }
  };

  const handleDownloadPDF = async (invoiceId: string) => {
    try {
      const invoice = await bookingsApi.getInvoice(invoiceId);
      // Create a blob and download
      const blob = new Blob([JSON.stringify(invoice, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `invoice-${invoiceId}.json`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Invoice downloaded');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to download invoice');
    }
  };

  const handleEmailInvoice = (invoiceId: string) => {
    // TODO: Implement email invoice API
    toast.info('Email invoice functionality coming soon');
  };

  const selectedInvoiceObj = invoices.find((inv) => inv.id === selectedInvoice);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Invoices & Receipts</h1>
          <p className="text-gray-600">View and download your transaction invoices</p>
        </div>

        {bookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        ) : (
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Invoice List */}
            <div className="lg:col-span-1 bg-white rounded-lg p-4 shadow-sm">
              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search invoices..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#ff6b35] text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                {filteredInvoices.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>No invoices found</p>
                  </div>
                ) : (
                  filteredInvoices.map((inv) => (
                    <button
                      key={inv.id}
                      onClick={() => handleSelectInvoice(inv.id)}
                      className={`w-full p-3 rounded-lg border transition-colors text-left ${
                        selectedInvoice === inv.id
                          ? 'border-[#ff6b35] bg-orange-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                          <FileText className="h-5 w-5 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-gray-900 text-sm">{inv.invoiceNumber}</p>
                          <p className="text-xs text-gray-600 truncate">{inv.providerName}</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-xs text-gray-500">
                              {format(inv.date, 'MMM dd, yyyy')}
                            </span>
                            <span className="text-sm font-medium text-gray-900">
                              ₹{Number(inv.total).toFixed(2)}
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Invoice Preview */}
            <div className="lg:col-span-2">
              {loadingInvoice ? (
                <div className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
                  <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                </div>
              ) : invoiceData && selectedInvoiceObj ? (
                <div className="bg-white rounded-lg shadow-sm overflow-hidden">
                  {/* Actions */}
                  <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                    <h2 className="text-gray-900">Invoice Details</h2>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleEmailInvoice(selectedInvoiceObj.id)}
                      >
                        Email Invoice
                      </Button>
                      <Button
                        size="sm"
                        className="bg-[#ff6b35] hover:bg-[#ff5722] gap-2"
                        onClick={() => handleDownloadPDF(selectedInvoiceObj.id)}
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </Button>
                    </div>
                  </div>

                  {/* Invoice Content */}
                  <div className="p-8">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <div className="w-12 h-12 bg-[#ff6b35] rounded-lg flex items-center justify-center mb-3">
                          <span className="text-white font-bold">MH</span>
                        </div>
                        <h3 className="text-gray-900">MH26 Services</h3>
                        <p className="text-sm text-gray-600">Nanded, Maharashtra</p>
                        <p className="text-sm text-gray-600">contact@mh26services.com</p>
                      </div>
                      <div className="text-right">
                        <h1 className="text-gray-900 mb-2">INVOICE</h1>
                        <p className="text-sm text-gray-600">Invoice No: {selectedInvoiceObj.invoiceNumber}</p>
                        <p className="text-sm text-gray-600">
                          Date: {format(selectedInvoiceObj.date, 'MMMM dd, yyyy')}
                        </p>
                        <div className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${
                          selectedInvoiceObj.paymentStatus === 'PAID'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {selectedInvoiceObj.paymentStatus}
                        </div>
                      </div>
                    </div>

                    {/* Billing Info */}
                    <div className="grid md:grid-cols-2 gap-8 mb-8">
                      <div>
                        <h4 className="text-gray-900 mb-2">Bill To:</h4>
                        <p className="text-gray-700">{selectedInvoiceObj.userName}</p>
                        <p className="text-sm text-gray-600">Customer ID: {selectedInvoiceObj.userId}</p>
                      </div>
                      <div>
                        <h4 className="text-gray-900 mb-2">Service Provider:</h4>
                        <p className="text-gray-700">{selectedInvoiceObj.providerName}</p>
                        <p className="text-sm text-gray-600">Provider ID: {selectedInvoiceObj.providerId}</p>
                      </div>
                    </div>

                    {/* Line Items */}
                    <div className="mb-8">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b-2 border-gray-300">
                            <th className="text-left py-3 text-gray-900">Description</th>
                            <th className="text-right py-3 text-gray-900">Qty</th>
                            <th className="text-right py-3 text-gray-900">Unit Price</th>
                            <th className="text-right py-3 text-gray-900">Amount</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invoiceData.lineItems?.map((item: any, idx: number) => (
                            <tr key={idx} className="border-b border-gray-200">
                              <td className="py-3 text-gray-700">{item.description || item.name}</td>
                              <td className="text-right py-3 text-gray-700">{item.qty || item.quantity || 1}</td>
                              <td className="text-right py-3 text-gray-700">₹{Number(item.unitPrice || item.price || 0).toFixed(2)}</td>
                              <td className="text-right py-3 text-gray-700">
                                ₹{Number((item.qty || item.quantity || 1) * (item.unitPrice || item.price || 0)).toFixed(2)}
                              </td>
                            </tr>
                          )) || (
                            <tr>
                              <td colSpan={4} className="py-3 text-center text-gray-500">
                                No line items available
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>

                    {/* Totals */}
                    <div className="flex justify-end">
                      <div className="w-64 space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Subtotal:</span>
                          <span className="text-gray-900">₹{Number(invoiceData.subtotal || invoiceData.total || 0).toFixed(2)}</span>
                        </div>
                        {invoiceData.platformFee > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Platform Fee:</span>
                            <span className="text-gray-900">₹{Number(invoiceData.platformFee).toFixed(2)}</span>
                          </div>
                        )}
                        {invoiceData.tax > 0 && (
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Tax (GST):</span>
                            <span className="text-gray-900">₹{Number(invoiceData.tax).toFixed(2)}</span>
                          </div>
                        )}
                        <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                          <span className="font-medium text-gray-900">Total:</span>
                          <span className="font-medium text-gray-900">₹{Number(invoiceData.total || selectedInvoiceObj.total).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-8 border-t border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Payment Method:</strong> {invoiceData.paymentMethod || 'Online Payment'}
                      </p>
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Transaction ID:</strong> {selectedInvoiceObj.bookingId}
                      </p>
                      <p className="text-xs text-gray-500 mt-4">
                        Thank you for using MH26 Services. For any queries, contact us at support@mh26services.com
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                    <p>Select an invoice to preview</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
