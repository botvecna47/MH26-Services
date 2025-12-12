import { FileText, Download } from 'lucide-react';
import { Button } from './ui/button';
import { GlassEmptyState } from './ui/GlassEmptyState';

export default function InvoicesPage() {
  // Mock invoices - in real app, fetch from API
  const invoices = [
    {
      id: 'INV-001',
      date: '2024-12-01',
      amount: 3500,
      status: 'paid',
      service: 'Monthly Tiffin Service',
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-700';
      case 'pending':
        return 'bg-orange-100 text-orange-700';
      case 'overdue':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-gray-100 text-gray-700';
    }
  };

  return (
    <div className="min-h-screen py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-gray-900 mb-2">Invoices & Payments</h1>
          <p className="text-gray-600">View and download your transaction history</p>
        </div>

        <div className="glass rounded-xl p-6">
          {invoices.length > 0 ? (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="glass-strong rounded-lg p-4 flex items-center justify-between transition-all duration-300 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <FileText className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <h3 className="text-gray-900 mb-1">{invoice.id}</h3>
                      <p className="text-sm text-gray-600">{invoice.service}</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Date: {new Date(invoice.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-xl text-gray-900">₹{invoice.amount}</p>
                      <span
                        className={`inline-block px-3 py-1 rounded-full text-xs ${getStatusColor(
                          invoice.status
                        )}`}
                      >
                        {invoice.status}
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      className="border-white/30 hover:bg-white/20"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <GlassEmptyState
              icon={<FileText className="h-12 w-12" />}
              message="No invoices yet"
            />
          )}
        </div>
      </div>
    </div>
  );
}
