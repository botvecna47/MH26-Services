import { useState } from 'react';
import { Download, Eye, Search, FileText, Mail } from 'lucide-react';
import { Button } from './ui/button';
import { useUser } from '../context/UserContext';
import { toast } from 'sonner';
import { useBookings, useInvoice } from '../api/bookings';
import { Skeleton } from './ui/skeleton';

export default function InvoicesPage() {
  const { user, isAuthenticated } = useUser();
  const [selectedInvoiceId, setSelectedInvoiceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch completed bookings which serve as the invoice list
  const { data: bookingsData, isLoading: loadingList } = useBookings({ status: 'COMPLETED', limit: 50 });
  const invoicesList = bookingsData?.data || [];

  // Fetch specific invoice details when selected
  const { data: invoice, isLoading: loadingInvoice } = useInvoice(selectedInvoiceId);

  // Filter client-side for search (name or ID)
  const filteredInvoices = invoicesList.filter((booking: any) => 
    booking.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    booking.provider?.businessName?.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const handleDownloadPDF = (invoiceId: string) => {
    // In real app: GET /api/invoices/:id (download PDF)
    toast.info('Downloading PDF...');
    // Real implementation would trigger a file download from backend
    setTimeout(() => toast.success('Invoice PDF downloaded'), 1000);
  };

  const handleEmailInvoice = (invoiceId: string) => {
    toast.success('Invoice sent to ' + user.email);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h1 className="text-gray-900 mb-2">Invoices & Receipts</h1>
          <p className="text-gray-600">View and download your transaction invoices</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Invoice List */}
          <div className="lg:col-span-1 bg-white rounded-lg p-4 shadow-sm h-[calc(100vh-200px)] flex flex-col">
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

            <div className="space-y-2 flex-1 overflow-y-auto">
              {loadingList ? (
                 <>
                   <Skeleton className="h-20 w-full" />
                   <Skeleton className="h-20 w-full" />
                   <Skeleton className="h-20 w-full" />
                 </>
              ) : filteredInvoices.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  <FileText className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>No invoices yet</p>
                  <p className="text-xs mt-2">Completed bookings will appear here.</p>
                </div>
              ) : (
                filteredInvoices.map((booking: any) => (
                  <button
                    key={booking.id}
                    onClick={() => setSelectedInvoiceId(booking.id)}
                    className={`w-full p-3 rounded-lg border transition-colors text-left ${
                        selectedInvoiceId === booking.id
                        ? 'border-[#ff6b35] bg-orange-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 bg-gray-100 rounded flex items-center justify-center flex-shrink-0">
                        <FileText className="h-5 w-5 text-gray-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 text-sm">INV-{booking.id.slice(0, 8).toUpperCase()}</p>
                        <p className="text-xs text-gray-600 truncate">{booking.provider?.businessName || 'Provider'}</p>
                        <div className="flex justify-between items-center mt-1">
                          <span className="text-xs text-gray-500">
                            {new Date(booking.createdAt).toLocaleDateString('en-IN')}
                          </span>
                          <span className="text-sm font-medium text-gray-900">
                            ₹{booking.totalAmount}
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
            {selectedInvoiceId && invoice ? (
              <div className="bg-white rounded-lg shadow-sm overflow-hidden min-h-[600px]">
                {loadingInvoice ? (
                    <div className="p-8 space-y-8">
                        <div className="flex justify-between">
                            <Skeleton className="h-16 w-16" />
                            <div className="space-y-2">
                                <Skeleton className="h-8 w-32" />
                                <Skeleton className="h-4 w-48" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-8">
                            <Skeleton className="h-24 w-full" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                        <Skeleton className="h-64 w-full" />
                    </div>
                ) : (
                <>
                {/* Actions */}
                <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50">
                  <h2 className="text-gray-900">Invoice Details</h2>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEmailInvoice(invoice.booking.id)}
                    >
                      <Mail className="h-4 w-4 mr-2" />
                      Email Invoice
                    </Button>
                    <Button
                      size="sm"
                      className="bg-[#ff6b35] hover:bg-[#ff5722] gap-2"
                      onClick={() => handleDownloadPDF(invoice.booking.id)}
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
                      <p className="text-sm text-gray-600">Invoice No: {invoice.invoiceNumber}</p>
                      <p className="text-sm text-gray-600">
                        Date: {new Date(invoice.date).toLocaleDateString('en-IN', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                      <div className={`inline-block px-3 py-1 rounded-full text-xs mt-2 ${
                        invoice.booking.paymentStatus === 'PAID'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}>
                        {invoice.booking.paymentStatus}
                      </div>
                    </div>
                  </div>

                  {/* Billing Info */}
                  <div className="grid md:grid-cols-2 gap-8 mb-8">
                    <div>
                      <h4 className="text-gray-900 mb-2">Bill To:</h4>
                      <p className="text-gray-700 font-medium">{invoice.booking.user.name}</p>
                      <p className="text-gray-600">{invoice.booking.user.email}</p>
                      <p className="text-sm text-gray-600">Customer ID: {invoice.booking.user.id.slice(0,8)}</p>
                    </div>
                    <div>
                      <h4 className="text-gray-900 mb-2">Service Provider:</h4>
                      <p className="text-gray-700 font-medium">{invoice.booking.provider.businessName}</p>
                      <p className="text-sm text-gray-600">Provider ID: {invoice.booking.provider.id.slice(0,8)}</p>
                    </div>
                  </div>

                  {/* Line Items */}
                  <div className="mb-8">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b-2 border-gray-300">
                          <th className="text-left py-3 text-gray-900">Description</th>
                          <th className="text-right py-3 text-gray-900">Qty</th>
                          <th className="text-right py-3 text-gray-900">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="border-b border-gray-200">
                             <td className="py-3 text-gray-700">
                                {invoice.booking.service.title}
                                <div className="text-xs text-gray-500">Service rendered on {new Date(invoice.booking.scheduledAt).toLocaleDateString()}</div>
                             </td>
                             <td className="text-right py-3 text-gray-700">1</td>
                             <td className="text-right py-3 text-gray-700">₹{invoice.booking.totalAmount}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>

                  {/* Totals */}
                  <div className="flex justify-end">
                    <div className="w-64 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Subtotal:</span>
                        <span className="text-gray-900">₹{invoice.subtotal.toFixed(2)}</span>
                      </div>
                      {invoice.tax > 0 && (
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Tax (GST approx):</span>
                          <span className="text-gray-900">₹{invoice.tax.toFixed(2)}</span>
                        </div>
                      )}
                      
                      <div className="flex justify-between pt-2 border-t-2 border-gray-300">
                        <span className="font-medium text-gray-900">Total:</span>
                        <span className="font-medium text-gray-900">₹{invoice.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Footer */}
                  <div className="mt-8 pt-8 border-t border-gray-200">
                    <p className="text-sm text-gray-600 mb-2">
                      <strong>Payment Method:</strong> {invoice.booking.paymentMethod || 'Online'}
                    </p>
                    <p className="text-sm text-gray-600 mb-2">
                       <strong>Transaction ID:</strong> {invoice.booking.id}
                    </p>
                    <p className="text-xs text-gray-500 mt-4">
                      Thank you for using MH26 Services. For any queries, contact us at support@mh26services.com
                    </p>
                  </div>
                </div>
                </>
                )}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm h-96 flex items-center justify-center">
                <div className="text-center text-gray-500">
                  <Eye className="h-12 w-12 mx-auto mb-3 text-gray-300" />
                  <p>Select an invoice to preview</p>
                  {!selectedInvoiceId && invoicesList.length > 0 && <p className="text-sm mt-2">Choose from the list on the left.</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

