import { X, Flag, Upload } from 'lucide-react';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { useState } from 'react';
import { toast } from 'sonner';
import { useNotifications } from '../context/NotificationContext';
import { useReportProvider } from '../api/reports';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';

interface ReportProviderModalProps {
  providerId: string;
  providerName: string;
  onClose: () => void;
}

export default function ReportProviderModal({ providerId, providerName, onClose }: ReportProviderModalProps) {
  const { addNotification } = useNotifications();
  const reportProviderMutation = useReportProvider();
  const [reason, setReason] = useState('');
  const [details, setDetails] = useState('');
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const reportReasons = [
    'Poor Service Quality',
    'Incorrect Pricing',
    'Unprofessional Behavior',
    'Service Not Provided',
    'Safety Concerns',
    'Fraudulent Activity',
    'Other'
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!reason || !details.trim()) {
      toast.error('Please select a reason and provide details');
      return;
    }

    setIsSubmitting(true);
    try {
      await reportProviderMutation.mutateAsync({
        providerId,
        reason,
        details,
        attachments: attachments.length > 0 ? attachments : undefined,
      });
      
      toast.success('Report submitted successfully');
      
      // Add notification for admin
      addNotification({
        type: 'report',
        title: 'New Provider Report',
        body: `Report filed against ${providerName}`,
        read: false,
        meta: { providerId, reason }
      });

      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to submit report');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments(Array.from(e.target.files));
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-lg w-full p-6 relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="mb-6">
          <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-3">
            <Flag className="h-6 w-6 text-red-600" />
          </div>
          <h2 className="text-gray-900 mb-1">Report Provider</h2>
          <p className="text-gray-600">
            Report an issue with <span className="font-medium">{providerName}</span>
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Reason */}
          <div>
            <Label htmlFor="reason">Reason for Report *</Label>
            <Select value={reason} onValueChange={setReason}>
              <SelectTrigger id="reason">
                <SelectValue placeholder="Select a reason" />
              </SelectTrigger>
              <SelectContent>
                {reportReasons.map((r) => (
                  <SelectItem key={r} value={r}>
                    {r}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Details */}
          <div>
            <Label htmlFor="details">Detailed Description *</Label>
            <Textarea
              id="details"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
              placeholder="Please provide detailed information about the issue..."
              rows={4}
              className="mt-1"
            />
            <p className="text-xs text-gray-500 mt-1">
              Please be specific and include relevant dates, times, and circumstances
            </p>
          </div>

          {/* Attachments */}
          <div>
            <Label htmlFor="attachments">Attachments (Optional)</Label>
            <div className="mt-1">
              <label
                htmlFor="attachments"
                className="flex items-center justify-center gap-2 p-4 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-[#ff6b35] hover:bg-orange-50 transition-colors"
              >
                <Upload className="h-5 w-5 text-gray-400" />
                <span className="text-sm text-gray-600">
                  {attachments.length > 0
                    ? `${attachments.length} file(s) selected`
                    : 'Upload screenshots or documents'}
                </span>
                <input
                  id="attachments"
                  type="file"
                  multiple
                  accept="image/*,.pdf"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-500 mt-1">
                Accepted formats: Images (JPG, PNG) and PDF. Max 10MB per file
              </p>
            </div>
          </div>

          {/* Privacy Notice */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-xs text-blue-900">
              Your report will be reviewed by our admin team. We take all reports seriously and will investigate accordingly. The provider will not be notified of who submitted the report.
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1 bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Submitting...' : 'Submit Report'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
