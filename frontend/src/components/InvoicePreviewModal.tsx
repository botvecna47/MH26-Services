import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Loader2 } from 'lucide-react';
import { bookingsApi } from '../api/bookings';
import { format } from 'date-fns';
import { toast } from 'sonner';

interface InvoicePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingId: string | null;
}

const formatId = (id: string | undefined, type: 'USER' | 'PROVIDER') => {
  if (!id) return 'N/A';
  // Take last 8 chars for a unique but short ID
  const shortParams = id.slice(-8).toUpperCase(); 
  const prefix = type === 'USER' ? 'CUS' : 'PRO';
  return `${prefix}-${shortParams}`;
};

export default function InvoicePreviewModal({ isOpen, onClose, bookingId }: InvoicePreviewModalProps) {
  const [loading, setLoading] = useState(false);
  const [invoiceData, setInvoiceData] = useState<any>(null);

  useEffect(() => {
    if (isOpen && bookingId) {
      loadInvoice();
    } else {
      setInvoiceData(null);
    }
  }, [isOpen, bookingId]);

  const loadInvoice = async () => {
    if (!bookingId) return;
    setLoading(true);
    try {
      const data = await bookingsApi.getInvoice(bookingId);
      setInvoiceData(data);
    } catch (error: any) {
      console.error('Failed to load invoice:', error);
      toast.error(error.response?.data?.error || 'Failed to load invoice details');
      onClose();
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="w-[50vw] max-w-none max-h-[90vh] overflow-y-auto p-0" aria-describedby="invoice-desc">
        <DialogTitle className="sr-only">Invoice Preview</DialogTitle>
        <div id="invoice-desc" className="sr-only">Preview of the invoice details including billing and line items.</div>
        {loading ? (
          <div className="flex flex-col items-center justify-center p-12 space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="text-gray-500">Loading invoice...</p>
          </div>
        ) : invoiceData ? (
          <div className="bg-white">
            {/* Actions Header */}
            <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
              <h2 className="text-gray-900 font-semibold">Invoice Details</h2>
              <Button variant="ghost" size="sm" onClick={onClose}>
                Close
              </Button>
            </div>

            {/* Invoice Content - Reusing InvoicesPage design */}
            <div className="p-8">
              {/* Header */}
              <div className="flex justify-between items-start mb-8">
                <div>
                  <div className="w-12 h-12 bg-[#ff6b35] rounded-lg flex items-center justify-center mb-3">
                    <span className="text-white font-bold">MH</span>
                  </div>
                  <h3 className="text-gray-900 font-bold">MH26 Services</h3>
                  <p className="text-sm text-gray-600">Nanded, Maharashtra</p>
                  <p className="text-sm text-gray-600">contact@mh26services.com</p>
                </div>
                <div className="text-right">
                  <h1 className="text-2xl text-gray-900 mb-2 font-bold tracking-tight">INVOICE</h1>
                  <p className="text-sm text-gray-600 font-medium">No: {invoiceData.invoiceNumber}</p>
                  <p className="text-sm text-gray-600">
                    Date: {invoiceData.date ? format(new Date(invoiceData.date), 'MMMM dd, yyyy') : 'N/A'}
                  </p>
                  <div className="inline-block px-3 py-1 rounded-full text-xs mt-2 bg-green-100 text-green-700 font-medium">
                    PAID
                  </div>
                </div>
              </div>

              {/* Billing Info */}
              <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-100">
                <div>
                  <h4 className="text-gray-900 font-semibold mb-2">Bill To:</h4>
                  <p className="text-gray-700">{invoiceData.booking?.user?.name || 'Customer'}</p>
                  <p className="text-sm text-gray-600">ID: {formatId(invoiceData.booking?.userId, 'USER')}</p>
                  {invoiceData.booking?.user?.email && (
                    <p className="text-sm text-gray-600">{invoiceData.booking.user.email}</p>
                  )}
                </div>
                <div>
                  <h4 className="text-gray-900 font-semibold mb-2">Service Provider:</h4>
                  <p className="text-gray-700">{invoiceData.booking?.provider?.businessName || 'Provider'}</p>
                  <p className="text-sm text-gray-600">ID: {formatId(invoiceData.booking?.providerId, 'PROVIDER')}</p>
                </div>
              </div>

              {/* Line Items */}
              <div className="mb-8">
                <table className="w-full">
                  <thead>
                    <tr className="border-b-2 border-gray-100">
                      <th className="text-left py-3 text-gray-900 font-semibold">Description</th>
                      <th className="text-right py-3 text-gray-900 font-semibold">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr className="border-b border-gray-50">
                      <td className="py-4 text-gray-700">
                        <p className="font-medium">{invoiceData.booking?.service?.title || 'Service'}</p>
                        <p className="text-sm text-gray-500">Service completed on {invoiceData.date ? format(new Date(invoiceData.date), 'PPP') : ''}</p>
                      </td>
                      <td className="text-right py-4 text-gray-700 font-medium">
                        ₹{Number(invoiceData.subtotal).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>

              {/* Totals */}
              <div className="flex justify-end">
                <div className="w-64 space-y-3 bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Subtotal:</span>
                    <span className="text-gray-900 font-medium">₹{Number(invoiceData.subtotal).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">GST (8%):</span>
                    <span className="text-gray-900 font-medium">₹{Number(invoiceData.tax).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between pt-3 border-t border-gray-200">
                    <span className="font-bold text-gray-900 text-lg">Total:</span>
                    <span className="font-bold text-[#ff6b35] text-lg">₹{Number(invoiceData.total).toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Footer */}
              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-xs text-center text-gray-400">
                  This is a computer generated invoice and does not require a signature.
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">
            Invoice not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
